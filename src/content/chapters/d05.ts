import type { Chapter, ChoiceOption, Field, GridActivity } from '../../domain/chapter';

/**
 * DOSSIER 5 — Fixer le prix de vente
 *
 * Progression calquée sur le manuel de référence (contexte, 3 missions, synthèse, 3 applications).
 * Boutiques, marques, personnages, documents et chiffres : ORIGINAUX et fictifs.
 * Tous les résultats chiffrés sont calculés ici à partir des données, puis testés.
 */

const R1 = ['d05-r1']; // Les produits commercialisés et leurs caractéristiques sont maîtrisés.
const RX1 = ['d05-r1', 'd05-x1']; // + calculs de prix exacts
const RX2 = ['d05-r1', 'd05-x2']; // + prix cohérent avec les variables commerciales
const RX12 = ['d05-r1', 'd05-x1', 'd05-x2'];

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const r1 = (n: number) => Math.round((n + Number.EPSILON) * 10) / 10;
export const r3 = (n: number) => Math.round((n + Number.EPSILON) * 1000) / 1000;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });

/* =============================== Mission 1 : prix selon les coûts =============================== */

export const TAUX_MARGE_M1 = 45;
export const FRAIS_DISTRIB = 0.2;
export const PARFUMS = [
  { id: 'ambre', name: 'Ambre Nuit', pa: 12.6, fa: 0.84 },
  { id: 'petale', name: 'Pétale Rose', pa: 14.5, fa: 1.35 },
  { id: 'sel', name: 'Fleur de Sel', pa: 13.9, fa: 1.3 },
  { id: 'bois', name: 'Bois Doré', pa: 16.2, fa: 1.48 },
].map((p) => {
  const cr = r2(p.pa + p.fa + FRAIS_DISTRIB);
  const marge = r2((cr * TAUX_MARGE_M1) / 100);
  const pvht = r2(cr + marge);
  const pvttc = Math.round(pvht * 1.2);
  return { ...p, cr, marge, pvht, pvttc };
});
const SEL = PARFUMS.find((p) => p.id === 'sel')!;

/* =============================== Prix psychologique =============================== */

export interface PsyInput {
  prices: number[];
  tropCher: number[];
  qualite: number[];
}
/**
 * Méthode du prix psychologique.
 * A (cumul croissant « trop cher ») = part des personnes qui jugent ce prix trop cher.
 * B (cumul décroissant « mauvaise qualité ») = part des personnes qui jugent ce prix de mauvaise qualité.
 * Acheteurs potentiels = 100 − (A + B). Les cumuls sont calculés sur les effectifs, puis arrondis.
 */
export function psycho({ prices, tropCher, qualite }: PsyInput, digits: 0 | 1) {
  const n = tropCher.reduce((a, b) => a + b, 0);
  const rd = (x: number) => (digits === 0 ? Math.round(x) : r1(x));
  let cumTrop = 0;
  let cumQualBefore = 0;
  const rows = prices.map((p, i) => {
    cumTrop += tropCher[i];
    const row = {
      price: p,
      nTrop: tropCher[i],
      pTrop: rd((tropCher[i] / n) * 100),
      A: rd((cumTrop / n) * 100),
      nQual: qualite[i],
      pQual: rd((qualite[i] / n) * 100),
      B: rd(((n - cumQualBefore) / n) * 100),
      acheteurs: 0,
    };
    row.acheteurs = rd(((cumQualBefore - cumTrop) / n) * 100);
    cumQualBefore += qualite[i];
    return row;
  });
  const best = rows.reduce((a, b) => (b.acheteurs > a.acheteurs ? b : a));
  return { n, rows, best };
}

export const ENQUETE_SEL: PsyInput = {
  prices: [16, 18, 20, 22, 24, 26, 28, 30, 32, 34],
  tropCher: [0, 1, 2, 4, 4, 7, 7, 8, 9, 8],
  qualite: [12, 10, 9, 6, 6, 4, 2, 1, 0, 0],
};
export const PSY_SEL = psycho(ENQUETE_SEL, 1);
/** Taux de marge obtenu si l'on vend Fleur de Sel au prix psychologique. */
export const SEL_PSY = (() => {
  const pvht = r2(PSY_SEL.best.price / 1.2);
  const marge = r2(pvht - SEL.cr);
  return { pvht, marge, taux: r2((marge / SEL.cr) * 100) };
})();

function psyGrid(id: string, label: string, title: string, input: PsyInput, givenRows: number, tol: number, outcomeIds: string[], helps: [string, string, string]): GridActivity {
  const { n, rows } = psycho(input, 1);
  const cell = (answer: number, explain: string, t = tol) => ({ answer, explain, tolerance: t });
  return {
    id,
    kind: 'grid',
    label,
    title,
    instructions: `Complète le tableau à partir des résultats de l’enquête (${n} personnes). Arrondis les pourcentages au dixième.${givenRows ? ` Les ${givenRows} premières lignes sont données en exemple.` : ''}`,
    helps,
    outcomeIds,
    groups: [
      { label: '« Trop cher »', columns: ['Réponses', '%', 'Cumul croissant A'] },
      { label: '« Mauvaise qualité »', columns: ['Réponses', '%', 'Cumul décroissant B'] },
      { label: 'Résultat', columns: ['Acheteurs potentiels (%)'] },
    ],
    rows: [
      ...rows.map((r, i) => {
        const given = i < givenRows;
        const c = (answer: number, explain: string, t?: number) => (given ? answer : cell(answer, explain, t));
        return {
          id: `p${r.price}`,
          label: `${r.price} €`,
          cells: [
            r.nTrop,
            c(r.pTrop, `${r.nTrop} ÷ ${n} × 100 = ${fr(r.pTrop, 1)} %.`, 0.06),
            c(r.A, `Cumul des « trop cher » jusqu’à ${r.price} € : ${fr(r.A, 1)} %.`, tol),
            r.nQual,
            c(r.pQual, `${r.nQual} ÷ ${n} × 100 = ${fr(r.pQual, 1)} %.`, 0.06),
            c(r.B, `100 % moins les « mauvaise qualité » des prix inférieurs : ${fr(r.B, 1)} %.`, tol),
            c(r.acheteurs, `100 − (${fr(r.A, 1)} + ${fr(r.B, 1)}) = ${fr(r.acheteurs, 1)} %.`, tol + 0.1),
          ],
        };
      }),
      {
        id: 'total',
        label: 'Total',
        cells: [cell(n, `${n} personnes interrogées.`, 0), cell(100, 'Le total des pourcentages fait 100 %.', 0.15), '', cell(n, `${n} personnes interrogées.`, 0), cell(100, 'Le total des pourcentages fait 100 %.', 0.15), '', ''],
      },
    ],
    legend: 'Acheteurs potentiels = 100 − (A + B). Le prix psychologique est celui qui donne le plus d’acheteurs potentiels.',
  };
}

/* =============================== Mission 3 : concurrence =============================== */

export const VITRINE = [
  { id: 'ambre', name: 'Ambre Nuit', domicile: 24.9 },
  { id: 'petale', name: 'Pétale Rose', domicile: 27.9 },
  { id: 'sel', name: 'Fleur de Sel', domicile: 22.9 },
  { id: 'bois', name: 'Bois Doré', domicile: 33.9 },
].map((v) => {
  const p = PARFUMS.find((x) => x.id === v.id)!;
  const prix = Math.round(v.domicile);
  const pvht = r2(prix / 1.2);
  const marge = r2(pvht - p.cr);
  return { ...v, enLigne: 30, prix, pvht, marge, taux: r2((marge / p.cr) * 100), cr: p.cr };
});

export const STRATEGIES: Array<{ id: string; label: string }> = [
  { id: 'magique', label: 'Prix magique' },
  { id: 'rond', label: 'Prix rond' },
  { id: 'alignement', label: 'Alignement' },
  { id: 'ecremage', label: 'Écrémage' },
  { id: 'penetration', label: 'Pénétration' },
];

/* =============================== Application 1 : performances =============================== */

export const CHAUSSURES = [
  { id: 'alto', fournisseur: 'Securo', name: 'Alto — brodequin cuir noir', pa: 54.8, pvht: 72.5 },
  { id: 'basso', fournisseur: 'Securo', name: 'Basso — chaussure basse cuir noir', pa: 51.6, pvht: 64.5 },
  { id: 'tempo', fournisseur: 'Protek', name: 'Tempo — chaussure basse cuir et tissu', pa: 40.6, pvht: 64.5 },
  { id: 'vento', fournisseur: 'Protek', name: 'Vento — brodequin cuir et tissu', pa: 44.9, pvht: 72.5 },
  { id: 'sierra', fournisseur: 'Protek', name: 'Sierra — chaussure basse cuir marron', pa: 41.2, pvht: 64.9 },
  { id: 'crest', fournisseur: 'Protek', name: 'Crest — brodequin cuir marron', pa: 46.7, pvht: 72.9 },
].map((c) => {
  const pvttc = r2(c.pvht * 1.2);
  const marge = r2(c.pvht - c.pa);
  return { ...c, pvttc, marge, tauxMarge: r2((marge / c.pa) * 100), tauxMarque: r2((marge / c.pvht) * 100), coef: r3(pvttc / c.pa) };
});

/* =============================== Application 2 : bouquet =============================== */

export const ENQUETE_BOUQUET: PsyInput = {
  prices: [15, 18, 21, 24, 27, 30, 33, 36, 39],
  tropCher: [0, 1, 2, 5, 8, 10, 12, 11, 11],
  qualite: [15, 12, 10, 9, 6, 5, 3, 0, 0],
};
export const PSY_BOUQUET = psycho(ENQUETE_BOUQUET, 1);

/* =============================== Application 3 : stylos =============================== */

export const STYLOS = [
  { id: 'heritage', ref: '20441', name: 'Stylo-plume Calame Héritage, plume or, finition platine', qte: 4, prix: [520, 545, 539] },
  { id: 'etoile', ref: '20458', name: 'Stylo-plume Calame Étoile, édition limitée', qte: 4, prix: [610, 640, 625] },
  { id: 'noir', ref: '30112', name: 'Étui de 8 cartouches Calame, encre noire', qte: 20, prix: [9.5, 9.9, 10.2] },
  { id: 'bleu', ref: '30113', name: 'Étui de 8 cartouches Calame, encre bleue', qte: 10, prix: [9.5, 9.9, 10.2] },
].map((s) => ({
  ...s,
  penetration: r2(Math.min(...s.prix) * 0.95),
  alignement: r2(s.prix.reduce((a, b) => a + b, 0) / s.prix.length),
  ecremage: r2(Math.max(...s.prix) * 1.05),
}));

const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

/* ================================================================================== */

export const D05: Chapter = {
  unitId: 'd05',
  mission:
    "Maison Capucine prépare sa vitrine de printemps. La responsable te demande un prix qui couvre le coût, reste crédible pour les clients et s’inscrit dans le positionnement de la boutique. Tu fais les calculs puis présentes le compromis retenu.",
  fictionNotice: 'Maison Capucine, Essentia, les autres entreprises, les marques et tous les chiffres de ce dossier sont imaginaires. Données créées pour Rayon.',
  company: {
    name: 'Maison Capucine — Bourganeuf',
    tagline: 'Boutique de prêt-à-porter féminin et d’accessoires',
    facts: [
      ['Ton poste', 'Élève en PFMP, vente et gestion de l’offre'],
      ['Ta tutrice', 'Sophie Lemaire, gérante'],
      ['La période', 'Septembre : préparation des fêtes de fin d’année'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Fixer le prix d’une nouveauté et défendre la décision",
      hero: { id: 'd05-hero', alt: 'Portants de vêtements clairs, chapeaux et sacs dans une boutique lumineuse' },
      message: {
        from: 'Sophie Lemaire',
        role: 'Gérante, Maison Capucine',
        text: [
          'Bienvenue à Maison Capucine ! Nous vendons des vêtements, des bijoux, des foulards et des sacs, en boutique et sur notre site. Une fois par mois, j’anime aussi une vente en direct sur Instagram.',
          'Pour les fêtes, je veux proposer des parfums aux senteurs inspirées des grands classiques, à petit prix. J’ai trouvé un fournisseur, Essentia. Lis d’abord sa fiche et ses conditions de vente.',
        ],
      },
      documents: [
        {
          id: "d05-revision-reperes",
          number: 3,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "HT veut dire hors taxes. TTC veut dire toutes taxes comprises. Avec 20 % de TVA, multiplie le prix HT par 1,20 pour obtenir le TTC.",
                "La marge unitaire de ces exercices est le prix de vente HT moins le coût HT précisé dans le cas. La marge totale dépend aussi du nombre vendu.",
                "Un prix accepté dans une enquête reste une estimation. Vérifie également les coûts et la comparabilité des offres concurrentes."
              ]
            }
          ]
        },
        {
          id: 'd05-o-doc1',
          number: 1,
          title: 'La boutique',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Maison Capucine est une boutique indépendante du centre-ville de Bourganeuf, créée par Sophie Lemaire il y a six ans. Elle propose du prêt-à-porter féminin et des accessoires de petites marques françaises.' },
            {
              type: 'facts',
              items: [
                ['Société', 'SARL Maison Capucine'],
                ['Adresse', 'Place du Champ-de-Foire, 23400 Bourganeuf'],
                ['Produits', 'Vêtements, lingerie, bijoux, foulards, sacs à main'],
                ['Canaux de vente', 'Boutique, site marchand maisoncapucine.example, ventes en direct sur Instagram'],
              ],
            },
          ],
        },
        {
          id: 'd05-o-doc2',
          number: 2,
          title: 'Conditions de vente du fournisseur Essentia',
          look: 'contrat',
          blocks: [
            { type: 'p', text: 'Essentia fabrique en France des eaux de parfum de 100 ml, vendues aux commerçants indépendants.' },
            {
              type: 'table',
              head: ['Réduction', 'Condition', 'Montant'],
              rows: [
                ['Rabais', 'Produit livré avec un défaut d’aspect (étui abîmé)', '10 % sur l’article concerné'],
                ['Remise', 'Commande de 48 flacons ou plus', '5 % sur la facture'],
                ['Ristourne', 'Chiffre d’affaires annuel supérieur à 3 000 € HT', '2 % reversés en fin d’année'],
                ['Escompte', 'Paiement comptant, à la commande', '1,5 % sur le net commercial'],
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd05-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'Une boutique créée et dirigée par sa propriétaire, sans enseigne : commerce indépendant.', 'Les canaux de vente sont les lieux où la cliente peut acheter.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['SARL Maison Capucine', 'Maison Capucine'], placeholder: 'Nom de la société', explain: 'SARL Maison Capucine.' },
            { id: 'activite', label: 'Activité', kind: 'choice', options: [{ value: 'pap', label: 'Vente de prêt-à-porter féminin et d’accessoires' }, { value: 'parfum', label: 'Fabrication de parfums' }, { value: 'bijoux', label: 'Bijouterie-joaillerie' }], answer: 'pap', explain: 'Vêtements et accessoires féminins.' },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'independant', label: 'Commerce indépendant isolé' }, { value: 'franchise', label: 'Franchise' }, { value: 'integre', label: 'Commerce intégré' }], answer: 'independant', explain: 'Boutique indépendante, sans enseigne nationale.' },
            { id: 'statut', label: 'Statut juridique', kind: 'given', value: 'SARL (société à responsabilité limitée)' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Bourganeuf', 'centre-ville de Bourganeuf', 'Bourganeuf Creuse'], placeholder: 'Ville', explain: 'Centre-ville de Bourganeuf.' },
            {
              id: 'canaux',
              label: 'Canaux de vente (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'boutique', label: 'Boutique' },
                { value: 'site', label: 'Site marchand' },
                { value: 'insta', label: 'Ventes en direct sur Instagram' },
                { value: 'domicile', label: 'Vente à domicile' },
              ],
              answers: ['boutique', 'site', 'insta'],
              explain: 'Trois canaux : commerce physique, en ligne et réseaux sociaux.',
            },
          ],
        },
        {
          id: 'd05-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Comprendre les réductions du fournisseur',
          instructions: 'Associe chaque situation à la réduction obtenue (document 2), puis réponds.',
          helps: ['Relis la colonne « Condition » du document 2.', 'Rabais : défaut ; remise : quantité ; ristourne : fin d’année ; escompte : paiement rapide.', 'Moins le produit coûte à l’achat, plus la boutique a de choix pour son prix de vente.'],
          outcomeIds: RX2,
          fields: [
            ...(
              [
                ['s1', 'Sophie commande 60 flacons pour Noël.', 'remise'],
                ['s2', 'Trois étuis arrivent écrasés, mais les flacons sont intacts.', 'rabais'],
                ['s3', 'Sophie paie comptant, au moment de passer commande.', 'escompte'],
                ['s4', 'En décembre, Essentia constate que la boutique a acheté pour 3 400 € HT dans l’année.', 'ristourne'],
              ] as const
            ).map(
              ([id, label, answer]): Field => ({
                id,
                label,
                kind: 'choice',
                select: true,
                options: [
                  { value: 'rabais', label: 'Rabais' },
                  { value: 'remise', label: 'Remise' },
                  { value: 'ristourne', label: 'Ristourne' },
                  { value: 'escompte', label: 'Escompte' },
                ],
                answer,
                explain: `Réduction : ${answer}.`,
              }),
            ),
            {
              id: 'influence',
              label: 'Comment ces réductions peuvent-elles influencer le prix de vente des parfums ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'cout', label: 'Elles diminuent le coût d’achat des parfums' },
                { value: 'baisser', label: 'Elles permettent de vendre moins cher à marge égale' },
                { value: 'marge', label: 'Elles permettent de gagner plus à prix de vente égal' },
                { value: 'tva', label: 'Elles suppriment la TVA' },
              ],
              answers: ['cout', 'baisser', 'marge'],
              explain: 'Un coût d’achat plus bas laisse le choix entre un prix plus attractif et une marge plus élevée.',
            },
          ],
        },
      ],
    },

    /* ================================ MISSION 1 ================================ */
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Fixer le prix de vente selon les coûts',
      guidance: 'guidé',
      message: {
        from: 'Sophie Lemaire',
        role: 'Gérante',
        text: [
          'Avant tout, nous devons être rentables, et la loi interdit de revendre un produit moins cher que ce qu’il nous a coûté.',
          'Reprends les calculs commerciaux (document 1) et la composition d’un prix (document 2), puis calcule les prix de vente des quatre parfums Essentia. Je vise un taux de marge de 45 %.',
        ],
      },
      documents: [
        {
          id: 'd05-m1-doc1',
          number: 1,
          title: 'Rappel des calculs commerciaux',
          look: 'texte',
          blocks: [
            { type: 'formula', text: 'Coût de revient = prix d’achat HT + frais d’achat + frais de distribution' },
            { type: 'formula', text: 'Prix de vente HT = coût de revient + marge', example: 'coût 10 €, marge 4 € → PV HT 14 €' },
            { type: 'formula', text: 'Marge = coût de revient × taux de marge ÷ 100\nTaux de marge = marge ÷ coût de revient × 100' },
            { type: 'formula', text: 'Taux de marque = marge ÷ prix de vente HT × 100' },
            { type: 'formula', text: 'Montant de la TVA = PV HT × taux de TVA ÷ 100\nPV TTC = PV HT + TVA = PV HT × 1,20 (TVA à 20 %)', example: 'autres coefficients : 1,10 · 1,055 · 1,021' },
            { type: 'formula', text: 'Coefficient multiplicateur = PV TTC ÷ prix d’achat HT' },
          ],
        },
        {
          id: 'd05-m1-doc2',
          number: 2,
          title: 'Ce que contient le prix d’un parfum',
          look: 'texte',
          blocks: [
            {
              type: 'zones',
              title: 'Du bas vers le haut du flacon',
              zones: [
                { id: 'cr', label: 'Coût de revient', sub: 'prix d’achat, frais d’achat (transport, douane), frais de distribution (étui, sac)', tone: 'vert', wide: true },
                { id: 'marge', label: 'Marge', sub: 'loyer, assurance, électricité, salaires, impôts, rémunération de la gérante', tone: 'jaune', wide: true },
                { id: 'tva', label: 'TVA', sub: '20 % pour la parfumerie, reversée à l’État', tone: 'rose', wide: true },
              ],
            },
            { type: 'note', text: 'Coût de revient + marge = prix de vente HT. Prix de vente HT + TVA = prix de vente TTC, celui que paie la cliente.' },
          ],
        },
        {
          id: 'd05-m1-doc3',
          number: 3,
          title: 'Prix d’achat des parfums Essentia (100 ml)',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Parfum', 'Prix d’achat HT', 'Frais d’achat', 'Frais de distribution'],
              align: ['left', 'right', 'right', 'right'],
              rows: PARFUMS.map((p) => [p.name, eur(p.pa), eur(p.fa), eur(FRAIS_DISTRIB)]),
            },
            { type: 'note', text: `Taux de marge visé : ${TAUX_MARGE_M1} % du coût de revient.` },
          ],
        },
        {
          id: "d05-revision-1-doc",
          number: 4,
          title: "Vérifier la marge avant impression des étiquettes",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le coffret Rosée coûte 9,60 € HT à l’achat. Emballage et transport affectés ajoutent 2,40 € HT par coffret. Le taux de TVA retenu dans l’exercice est 20 %. La responsable fixe une marge minimale de 5 € par coffret, calculée ici sur le coût complet HT."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd05-m1-a1',
          kind: 'grid',
          label: 'Annexe 1',
          title: 'Calculer le coût de revient',
          instructions: 'Calcule le coût de revient de chaque parfum (document 3).',
          helps: ['Additionne les trois colonnes du document 3.', 'Coût de revient = prix d’achat HT + frais d’achat + frais de distribution.', `${PARFUMS[0].name} : ${fr(PARFUMS[0].pa)} + ${fr(PARFUMS[0].fa)} + 0,20 = ${fr(PARFUMS[0].cr)} €.`],
          outcomeIds: RX1,
          groups: [{ label: 'En euros', columns: ['Prix d’achat HT', 'Frais d’achat', 'Frais de distribution', 'Coût de revient'] }],
          rows: PARFUMS.map((p) => ({
            id: p.id,
            label: p.name,
            cells: [p.pa, p.fa, FRAIS_DISTRIB, { answer: p.cr, explain: `${fr(p.pa)} + ${fr(p.fa)} + 0,20 = ${fr(p.cr)} €.`, tolerance: 0.011 }],
          })),
        },
        {
          id: 'd05-m1-a2',
          kind: 'grid',
          label: 'Annexe 2',
          title: 'Calculer le prix de vente TTC',
          instructions: 'Avec un taux de marge de 45 %, calcule la marge (au centime), le prix de vente HT, puis le prix de vente TTC arrondi à l’euro.',
          helps: ['Marge = coût de revient × 45 ÷ 100.', 'PV HT = coût de revient + marge. PV TTC = PV HT × 1,20.', `${PARFUMS[0].name} : ${fr(PARFUMS[0].cr)} × 0,45 = ${fr(PARFUMS[0].marge)} ; ${fr(PARFUMS[0].cr)} + ${fr(PARFUMS[0].marge)} = ${fr(PARFUMS[0].pvht)} ; × 1,20 = ${fr(r2(PARFUMS[0].pvht * 1.2))} → ${PARFUMS[0].pvttc} €.`],
          outcomeIds: RX1,
          groups: [{ label: 'En euros', columns: ['Coût de revient', 'Marge', 'PV HT', 'PV TTC (arrondi à l’euro)'] }],
          rows: PARFUMS.map((p) => ({
            id: p.id,
            label: p.name,
            cells: [
              p.cr,
              { answer: p.marge, explain: `${fr(p.cr)} × 45 ÷ 100 = ${fr(p.marge)} €.`, tolerance: 0.011 },
              { answer: p.pvht, explain: `${fr(p.cr)} + ${fr(p.marge)} = ${fr(p.pvht)} €.`, tolerance: 0.021 },
              { answer: p.pvttc, explain: `${fr(p.pvht)} × 1,20 = ${fr(r2(p.pvht * 1.2))} € → ${p.pvttc} €.` },
            ],
          })),
        },
        {
          id: 'd05-m1-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Un parfum est-il plus rentable qu’un autre ?',
          instructions: 'Analyse tes résultats.',
          helps: ['Le taux de marge est-il le même pour les quatre parfums ?', 'À taux égal, la marge en euros dépend du coût de revient.', 'Le parfum le plus cher à l’achat rapporte le plus d’euros par flacon.'],
          outcomeIds: RX2,
          fields: [
            { id: 'taux', label: '1. Le taux de marge est-il le même pour les quatre parfums ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: '45 % pour chacun.' },
            { id: 'plus', label: '2. Quel parfum rapporte la marge la plus élevée par flacon ?', kind: 'choice', options: PARFUMS.map((p) => ({ value: p.id, label: p.name })), answer: [...PARFUMS].sort((a, b) => b.marge - a.marge)[0].id, explain: `${[...PARFUMS].sort((a, b) => b.marge - a.marge)[0].name} : ${eur([...PARFUMS].sort((a, b) => b.marge - a.marge)[0].marge)} de marge.` },
            { id: 'conclu', label: '3. Que peux-tu conclure ?', kind: 'choice', options: [{ value: 'a', label: 'En pourcentage, ils sont aussi rentables ; en euros, le plus cher rapporte plus, s’il se vend autant' }, { value: 'b', label: 'Le moins cher est toujours le plus rentable' }, { value: 'c', label: 'On ne peut rien comparer' }], answer: 'a', explain: 'La rentabilité réelle dépend aussi des quantités vendues.' },
          ],
        },
        {
          id: "d05-revision-1",
          label: "Annexe complémentaire",
          title: "Vérifier la marge avant impression des étiquettes",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Pars du coût complet puis ajoute la marge exigée avant de calculer le TTC.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "(9,60 + 2,40 + 5) × 1,20 = 20,40 €."
          ],
          outcomeIds: [
            "d05-r1",
            "d05-x1",
            "d05-x2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel prix TTC minimum respecte l’objectif ?",
              kind: "number",
              answer: 20.4,
              explain: "(9,60 + 2,40 + 5) × 1,20 = 20,40 €."
            },
            {
              id: "q2",
              label: "À 19,80 € TTC, calcule la marge en euros et conseille la responsable.",
              kind: "written",
              lines: 3,
              model: "19,80 ÷ 1,20 = 16,50 € HT. Marge de 4,50 €, insuffisante de 0,50 €. Revoir le prix ou réduire le coût complet avant validation."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 2 ================================ */
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Fixer le prix de vente selon la demande',
      guidance: 'accompagné',
      message: {
        from: 'Sophie Lemaire',
        role: 'Gérante',
        text: [
          'Calculer un prix à partir des coûts ne suffit pas : c’est la cliente qui décide d’acheter ou non. Un prix ne doit être ni trop élevé, ni trop bas.',
          'Calcule le prix psychologique du parfum Fleur de Sel à partir de l’enquête réalisée auprès de 50 clientes. J’ai complété les deux premières lignes du tableau pour t’aider.',
        ],
      },
      documents: [
        {
          id: 'd05-m2-doc1',
          number: 1,
          title: 'La méthode du prix psychologique',
          look: 'procedure',
          blocks: [
            { type: 'p', text: 'Le prix psychologique (ou prix d’acceptabilité) est le prix qui réunit le plus grand pourcentage d’acheteurs potentiels. On pose deux questions à un échantillon de clients :' },
            { type: 'list', items: ['Au-dessus de quel prix n’achèteriez-vous pas ce produit, car vous le jugeriez trop cher ?', 'En dessous de quel prix n’achèteriez-vous pas ce produit, car vous douteriez de sa qualité ?'] },
            {
              type: 'list',
              title: 'Méthode',
              items: [
                'Calculer le pourcentage de réponses pour chaque prix : réponses ÷ nombre de personnes × 100.',
                'A : cumuler les « trop cher » en descendant le tableau (du prix le plus bas au plus haut).',
                'B : partir de 100 % et retirer, ligne après ligne, les « mauvaise qualité » des prix précédents.',
                'Acheteurs potentiels = 100 − (A + B). Le prix retenu est celui du pourcentage le plus élevé.',
              ],
            },
          ],
        },
        {
          id: 'd05-m2-doc2',
          number: 2,
          title: 'Résultats de l’enquête — Fleur de Sel, 100 ml',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Prix proposé', '« Trop cher » au-dessus de ce prix', '« Mauvaise qualité » en dessous de ce prix'],
              align: ['left', 'right', 'right'],
              rows: ENQUETE_SEL.prices.map((p, i) => [`${p} €`, String(ENQUETE_SEL.tropCher[i]), String(ENQUETE_SEL.qualite[i])]),
            },
          ],
        },
        {
          id: "d05-revision-2-doc",
          number: 3,
          title: "Lire les intentions d’achat sans les confondre avec les ventes",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Prix TTC testé",
                "Refus cumulés prix trop élevé",
                "Refus cumulés qualité jugée insuffisante"
              ],
              rows: [
                [
                  "18 €",
                  "5 %",
                  "48 %"
                ],
                [
                  "21 €",
                  "18 %",
                  "22 %"
                ],
                [
                  "24 €",
                  "42 %",
                  "8 %"
                ]
              ]
            },
            {
              type: "p",
              text: "Enquête fictive de 100 personnes. Pour chaque prix, la part d’acheteurs potentiels se calcule ici par 100 % moins les deux refus cumulés."
            }
          ]
        },
      ],
      activities: [
        psyGrid(
          'd05-m2-a1',
          'Annexe 1',
          'Calculer le prix psychologique de Fleur de Sel',
          ENQUETE_SEL,
          2,
          0.11,
          RX1,
          [
            'Commence par les colonnes « % » : réponses ÷ 50 × 100.',
            'A = A de la ligne précédente + % « trop cher » de la ligne. B = B de la ligne précédente − % « mauvaise qualité » de la ligne précédente.',
            `Ligne 20 € : A = 2 + 4 = 6 % ; B = 78 − 22 = 56 % ; acheteurs = 100 − (6 + 56) = 38 %.`,
          ],
        ),
        {
          id: 'd05-m2-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Décider du prix de Fleur de Sel',
          instructions: 'Exploite ton tableau et compare avec le prix calculé à la mission 1.',
          helps: ['Cherche la ligne où les acheteurs potentiels sont les plus nombreux.', `Prix TTC de la mission 1 : ${SEL.pvttc} €. PV HT au prix psychologique = prix TTC ÷ 1,20.`, `Marge = PV HT − coût de revient (${fr(SEL.cr)} €) ; taux = marge ÷ coût de revient × 100.`],
          outcomeIds: RX12,
          fields: [
            num('psy', '1. Prix psychologique', PSY_SEL.best.price, `${PSY_SEL.best.price} € : ${fr(PSY_SEL.best.acheteurs, 1)} % d’acheteurs potentiels.`, '€'),
            num('acheteurs', '2. Pourcentage d’acheteurs potentiels à ce prix', PSY_SEL.best.acheteurs, `${fr(PSY_SEL.best.acheteurs, 1)} %.`, '%', 0.11),
            { id: 'compare', label: `3. Le prix calculé à la mission 1 (${SEL.pvttc} €) est…`, kind: 'choice', options: [{ value: 'sup', label: 'Plus élevé que le prix psychologique' }, { value: 'inf', label: 'Moins élevé que le prix psychologique' }, { value: 'egal', label: 'Égal' }], answer: SEL.pvttc > PSY_SEL.best.price ? 'sup' : SEL.pvttc < PSY_SEL.best.price ? 'inf' : 'egal', explain: `${SEL.pvttc} € contre ${PSY_SEL.best.price} €.` },
            num('pvht', `4. PV HT si l’on vend à ${PSY_SEL.best.price} € TTC`, SEL_PSY.pvht, `${PSY_SEL.best.price} ÷ 1,20 = ${fr(SEL_PSY.pvht)} €.`, '€', 0.011),
            num('taux', '5. Taux de marge obtenu', SEL_PSY.taux, `(${fr(SEL_PSY.pvht)} − ${fr(SEL.cr)}) ÷ ${fr(SEL.cr)} × 100 = ${fr(SEL_PSY.taux)} %.`, '%', 0.06),
            { id: 'decision', label: '6. Quel prix proposes-tu à Sophie ?', kind: 'choice', options: [{ value: 'psy', label: `${PSY_SEL.best.price} € : plus d’acheteuses, et la marge reste positive` }, { value: 'cout', label: `${SEL.pvttc} € : il faut garder 45 % de marge quoi qu’il arrive` }, { value: 'bas', label: '16 € : le prix le plus bas attire le plus' }], answer: 'psy', explain: 'Le prix psychologique couvre le coût de revient avec une marge correcte et maximise les ventes.' },
          ],
        },
        {
          id: "d05-revision-2",
          label: "Annexe complémentaire",
          title: "Lire les intentions d’achat sans les confondre avec les ventes",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Le meilleur prix dans l’enquête correspond au plus grand pourcentage d’acceptation.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "100 − 18 − 22 = 60 %."
          ],
          outcomeIds: [
            "d05-r1",
            "d05-x1",
            "d05-x2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel pourcentage d’acheteurs potentiels obtient-on à 21 € ?",
              kind: "number",
              answer: 60,
              explain: "100 − 18 − 22 = 60 %."
            },
            {
              id: "q2",
              label: "Compare les trois prix et propose une vérification après lancement.",
              kind: "written",
              lines: 3,
              model: "Les scores sont 47 %, 60 % et 50 %. Le meilleur prix testé est 21 €. Je relève ensuite les ventes et objections réelles pour vérifier que les intentions se traduisent en achats."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 3 ================================ */
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Fixer le prix de vente selon la concurrence',
      guidance: 'autonome',
      message: {
        from: 'Sophie Lemaire',
        role: 'Gérante',
        text: [
          'Je dois aussi surveiller la concurrence, pour ne pas perdre de clientes. Lucie, en stage ici la semaine dernière, a relevé les prix d’une vendeuse à domicile de la région et d’un vendeur en ligne.',
          'Nos clientes comparent beaucoup. J’ai décidé d’appliquer des prix ronds, alignés sur la vendeuse à domicile, en gardant une marge suffisante. Fixe les prix de la vitrine.',
        ],
      },
      documents: [
        {
          id: 'd05-m3-doc1',
          number: 1,
          title: 'Les prix des concurrents',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              caption: 'Catalogue de Laura Mercier, vendeuse à domicile de parfums, à 15 km — flacons de 100 ml',
              head: ['Parfum (senteur)', 'Prix'],
              align: ['left', 'right'],
              rows: [
                ['Nuit d’Orient (ambré, vanillé)', '24,90 €'],
                ['Jardin Secret (rose, pivoine)', '27,90 €'],
                ['Embruns (floral, salé)', '22,90 €'],
                ['Cèdre Royal (boisé)', '33,90 €'],
                ['Brise Verte (agrumes)', '25,90 €'],
              ],
            },
            {
              type: 'list',
              title: 'Annonce d’un vendeur de parfums sur une place de marché en ligne',
              items: ['Toutes senteurs : 20 € les 50 ml, 30 € les 100 ml.', 'Livraison : 5 € par commande.'],
            },
          ],
        },
        {
          id: 'd05-m3-doc2',
          number: 2,
          title: 'Les techniques et les stratégies de prix',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Technique ou stratégie', 'Principe', 'Exemple'],
              rows: [
                ['Prix magique', 'Prix fixé juste sous un chiffre rond pour paraître moins cher', '9,99 € au lieu de 10 €'],
                ['Prix rond', 'Prix arrondi à l’euro, simple et rassurant', '25 € au lieu de 24,90 €'],
                ['Alignement', 'Prix identique ou presque à celui des concurrents', 'Même prix que le magasin voisin'],
                ['Écrémage', 'Prix plus élevé que la concurrence, pour une image haut de gamme et une marge forte', 'Lancement d’un produit de luxe'],
                ['Pénétration', 'Prix plus bas que la concurrence, pour gagner vite des clients et des parts de marché', 'Nouvelle enseigne qui s’installe'],
              ],
            },
          ],
        },
        {
          id: 'd05-m3-doc3',
          number: 3,
          title: 'Correspondance des senteurs de la vitrine',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Ambre Nuit = Nuit d’Orient · Pétale Rose = Jardin Secret · Fleur de Sel = Embruns · Bois Doré = Cèdre Royal' }],
        },
        {
          id: "d05-revision-3-doc",
          number: 4,
          title: "Comparer des offres à service différent",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Offre",
                "Produit",
                "Prix TTC affiché",
                "Coût de livraison à domicile",
                "Service"
              ],
              rows: [
                [
                  "Concurrent A",
                  "Coffret 3 savons de 80 g",
                  "19,90 €",
                  "4,50 €",
                  "Aucun emballage cadeau"
                ],
                [
                  "Concurrent B",
                  "Coffret 3 savons de 80 g",
                  "22,90 €",
                  "0 €",
                  "Emballage inclus"
                ],
                [
                  "Capucine",
                  "Coffret 3 savons de 80 g",
                  "22,00 € envisagés",
                  "0 €",
                  "Emballage inclus"
                ]
              ]
            },
            {
              type: "p",
              text: "La boutique vise un service cadeau et veut comparer le prix total payé pour une livraison à domicile."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd05-m3-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Fixer les prix de la vitrine',
          instructions: 'Pour chaque parfum, relève le prix de la vendeuse à domicile et celui du vendeur en ligne, puis fixe le prix à appliquer : un prix rond, aligné sur la vendeuse à domicile.',
          helps: ['Utilise le post-it (document 3) pour retrouver chaque senteur.', 'En ligne, tous les flacons de 100 ml sont au même prix.', 'Prix rond aligné : arrondis le prix de la vendeuse à l’euro le plus proche (24,90 € → 25 €).'],
          outcomeIds: RX2,
          layout: 'columns',
          columns: ['Vendeuse à domicile', 'En ligne (100 ml)', 'Prix à appliquer'],
          fields: VITRINE.flatMap((v): Field[] => [
            num(`${v.id}.0`, v.name, v.domicile, `${fr(v.domicile)} €.`, '€', 0.001),
            num(`${v.id}.1`, v.name, v.enLigne, '30 € les 100 ml (hors livraison).', '€', 0.001),
            num(`${v.id}.2`, v.name, v.prix, `${fr(v.domicile)} € arrondi à ${v.prix} €.`, '€', 0.001),
          ]),
        },
        {
          id: 'd05-m3-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Vérifier la marge',
          instructions: 'Vérifie que le prix aligné reste rentable pour le parfum le moins cher, Fleur de Sel.',
          helps: ['PV HT = prix TTC ÷ 1,20.', `Marge = PV HT − coût de revient (${fr(SEL.cr)} €).`, 'Taux de marge = marge ÷ coût de revient × 100.'],
          outcomeIds: RX12,
          fields: (() => {
            const v = VITRINE.find((x) => x.id === 'sel')!;
            return [
              num('pvht', `1. PV HT de Fleur de Sel à ${v.prix} € TTC`, v.pvht, `${v.prix} ÷ 1,20 = ${fr(v.pvht)} €.`, '€', 0.011),
              num('marge', '2. Marge par flacon', v.marge, `${fr(v.pvht)} − ${fr(v.cr)} = ${fr(v.marge)} €.`, '€', 0.021),
              num('taux', '3. Taux de marge', v.taux, `${fr(v.marge)} ÷ ${fr(v.cr)} × 100 = ${fr(v.taux)} %.`, '%', 0.11),
              { id: 'ok', label: '4. Ce prix est-il acceptable ?', kind: 'choice', options: [{ value: 'oui', label: 'Oui : il couvre le coût de revient et laisse une marge' }, { value: 'non', label: 'Non : c’est de la revente à perte' }], answer: v.marge > 0 ? 'oui' : 'non', explain: `La marge reste positive (${fr(v.taux)} %), même si elle est inférieure aux 45 % visés.` },
              { id: 'enligne', label: '5. Le vendeur en ligne est-il vraiment moins cher pour une cliente qui achète un seul flacon ?', kind: 'choice', options: [{ value: 'non', label: 'Non : avec la livraison, le flacon lui revient à 35 €' }, { value: 'oui', label: 'Oui : 30 € dans tous les cas' }], answer: 'non', explain: '30 € + 5 € de livraison = 35 €.' },
            ];
          })(),
        },
        {
          id: 'd05-m3-a3',
          kind: 'classify',
          label: 'Annexe 3',
          title: 'Reconnaître les techniques et les stratégies de prix',
          instructions: 'Associe chaque exemple à la technique ou à la stratégie de prix correspondante (document 2).',
          helps: ['Prix magique et prix rond concernent la façon d’écrire le prix.', 'Alignement, écrémage, pénétration : on compare au prix des concurrents.', 'Plus cher = écrémage ; moins cher = pénétration ; pareil = alignement.'],
          outcomeIds: RX2,
          categories: STRATEGIES,
          items: [
            { id: 'e1', text: 'Un foulard affiché 29,90 € au lieu de 30 €.', answer: 'magique', explain: 'Juste sous un chiffre rond.' },
            { id: 'e2', text: 'Une nouvelle boutique de bijoux vend 20 % moins cher que ses voisines pour se faire connaître.', answer: 'penetration', explain: 'Prix plus bas pour gagner des clientes.' },
            { id: 'e3', text: 'Un créateur lance un sac en cuir fait main, plus cher que tous les sacs du marché.', answer: 'ecremage', explain: 'Image haut de gamme et forte marge.' },
            { id: 'e4', text: 'Maison Capucine affiche ses parfums à 25 €, 28 €, 23 € et 34 €.', answer: 'rond', explain: 'Prix arrondis à l’euro.' },
            { id: 'e5', text: 'Une boutique de chaussures affiche le même prix que l’enseigne d’en face pour une paire de baskets identique.', answer: 'alignement', explain: 'Prix identique à la concurrence.' },
          ],
        },
        {
          id: "d05-revision-3",
          label: "Annexe complémentaire",
          title: "Comparer des offres à service différent",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Compare le montant livré et distingue l’offre au service le plus proche.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "19,90 + 4,50 = 24,40 € TTC."
          ],
          outcomeIds: [
            "d05-r1",
            "d05-x2",
            "d05-x1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel montant le client paie-t-il chez A pour une livraison ?",
              kind: "number",
              answer: 24.4,
              explain: "19,90 + 4,50 = 24,40 € TTC."
            },
            {
              id: "q2",
              label: "Écris le conseil prix et une phrase d’argumentaire.",
              kind: "written",
              lines: 3,
              model: "22,00 € livré est légèrement sous B, comparable en service, et sous le montant livré de A. Argumentaire possible. Coffret de trois savons, emballage cadeau et livraison inclus pour 22,00 € TTC."
            }
          ]
        },
      ],
    },

    /* ================================ SYNTHÈSE ================================ */
    {
      id: 'synthese',
      kind: 'synthese',
      title: 'Synthèse',
      documents: [],
      activities: [
        {
          id: 'd05-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les trois parties de la synthèse.',
          helps: ['Reprends le document 2 de la mission 1.', 'Le prix psychologique dépend de l’avis des clients.', 'Trois stratégies se comparent à la concurrence.'],
          outcomeIds: RX12,
          fields: [
            {
              id: 'cr',
              label: '1. Le coût de revient comprend… (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'pa', label: 'Le prix d’achat' },
                { value: 'fa', label: 'Les frais d’achat' },
                { value: 'fd', label: 'Les frais de distribution' },
                { value: 'loyer', label: 'Le loyer de la boutique' },
              ],
              answers: ['pa', 'fa', 'fd'],
              explain: 'Le loyer est couvert par la marge.',
            },
            {
              id: 'marge',
              label: '1. La marge permet de couvrir… (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'charges', label: 'Les charges de fonctionnement (loyer, électricité, salaires…)' },
                { value: 'impots', label: 'Les impôts et taxes' },
                { value: 'remu', label: 'La rémunération du gérant' },
                { value: 'tva', label: 'La TVA' },
              ],
              answers: ['charges', 'impots', 'remu'],
              explain: 'La TVA s’ajoute au prix HT et est reversée à l’État.',
            },
            { id: 'rentable', label: '1. Pour être rentable, le prix de vente doit être supérieur…', kind: 'choice', options: [{ value: 'cr', label: 'Au coût de revient' }, { value: 'tva', label: 'À la TVA' }, { value: 'conc', label: 'Au prix des concurrents' }], answer: 'cr', explain: 'Sinon, c’est de la revente à perte.' },
            { id: 'psy', label: '2. Prix qui réunit le plus d’acheteurs potentiels :', kind: 'text', accept: ['prix psychologique', 'le prix psychologique', 'prix d’acceptabilité', 'prix d acceptabilite'], explain: 'Le prix psychologique (ou d’acceptabilité).' },
            {
              id: 'strat',
              label: '3. Stratégies selon la concurrence (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'alignement', label: 'Alignement' },
                { value: 'ecremage', label: 'Écrémage' },
                { value: 'penetration', label: 'Pénétration' },
                { value: 'magique', label: 'Prix magique' },
              ],
              answers: ['alignement', 'ecremage', 'penetration'],
              explain: 'Le prix magique est une technique d’affichage, pas une stratégie face à la concurrence.',
            },
          ],
        },
        {
          id: 'd05-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Six calculs rapides.',
          helps: ['Utilise la calculatrice.', 'Relis les formules de la fiche de révision.', 'PV TTC = PV HT × 1,20 ; taux de marque = marge ÷ PV HT × 100.'],
          outcomeIds: RX1,
          fields: [
            num('q1', 'Prix d’achat 8 €, frais d’achat 1,50 €, frais de distribution 0,50 € : coût de revient ?', 10, '8 + 1,50 + 0,50 = 10 €.', '€', 0.001),
            num('q2', 'Coût de revient 10 €, taux de marge 40 % : prix de vente HT ?', 14, '10 + 10 × 40 % = 14 €.', '€', 0.001),
            num('q3', 'PV HT 14 €, TVA 20 % : PV TTC ?', 16.8, '14 × 1,20 = 16,80 €.', '€', 0.001),
            num('q4', 'Marge 4 €, PV HT 14 € : taux de marque (au centième) ?', 28.57, '4 ÷ 14 × 100 = 28,57 %.', '%', 0.011),
            num('q5', 'PV TTC 16,80 €, prix d’achat 8 € : coefficient multiplicateur ?', 2.1, '16,80 ÷ 8 = 2,1.', undefined, 0.001),
            num('q6', 'A = 30 %, B = 25 % : acheteurs potentiels ?', 45, '100 − (30 + 25) = 45 %.', '%', 0.001),
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Coût de revient : prix d’achat + frais d’achat + frais de distribution.', 'Marge : couvre les charges, les impôts et la rémunération du gérant.', 'La revente à perte (vendre sous le coût d’achat) est interdite.', 'Prix psychologique : prix qui réunit le plus d’acheteurs potentiels.', 'Techniques d’affichage : prix magique, prix rond. Stratégies : alignement, écrémage, pénétration.', 'Réductions fournisseur : rabais, remise, ristourne (commerciales) ; escompte (financière).'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Partir du coût de revient, ajouter la marge, puis la TVA.', 'Prix psychologique : % de réponses, cumul croissant A, cumul décroissant B, acheteurs = 100 − (A + B).', 'Comparer le prix calculé, le prix psychologique et le prix des concurrents avant de décider.', 'Vérifier que le prix retenu laisse une marge positive.'] },
        {
          title: 'Formules à connaître',
          kind: 'formules',
          items: [
            'PV HT = coût de revient + marge',
            'Marge = coût de revient × taux de marge ÷ 100',
            'Taux de marge = marge ÷ coût de revient (ou prix d’achat) × 100',
            'Taux de marque = marge ÷ PV HT × 100',
            'PV TTC = PV HT × (1 + taux de TVA ÷ 100)',
            'Coefficient multiplicateur = PV TTC ÷ prix d’achat HT',
          ],
        },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Confondre taux de marge (sur le coût) et taux de marque (sur le prix de vente).', 'Appliquer la TVA avant la marge.', 'Arrondir trop tôt dans un calcul.', 'Additionner les pourcentages au lieu de les cumuler ligne par ligne.', 'Comparer un prix en ligne sans compter la livraison.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Relever régulièrement les prix des concurrents.', 'Afficher des prix clairs et cohérents dans tout le rayon.', 'Négocier les réductions du fournisseur pour garder de la marge.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Coût de revient', 'Marge', 'Taux de marge', 'Taux de marque', 'Coefficient multiplicateur', 'Prix psychologique', 'Prix magique', 'Prix rond', 'Alignement', 'Écrémage', 'Pénétration'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Compare toujours des prix exprimés sur la même base HT ou TTC.",
            "L’enquête sur la demande renseigne sur un échantillon et ne garantit pas les ventes.",
            "La décision associe un prix, une hypothèse de volume et un contrôle après lancement."
          ]
        },
      ],
    },

    /* ================================ APPLICATION 1 ================================ */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Analyser les performances commerciales',
      guidance: 'autonome',
      hero: { id: 'd05-chaussures', alt: 'Vendeur présentant une chaussure de sécurité' },
      message: {
        from: 'Julien Moreau',
        role: 'Gérant, SARL Moreau Équipement',
        text: ['Nous vendons des vêtements de travail et des produits d’entretien. Nos chaussures de sécurité viennent de deux fournisseurs, Securo et Protek, et j’ai l’impression qu’elles ne rapportent pas toutes autant. Fais-moi un tableau d’analyse de chaque référence.'],
      },
      documents: [
        {
          id: 'd05-a1-doc1',
          number: 1,
          title: 'Prix d’achat et prix de vente des chaussures de sécurité',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Fournisseur', 'Référence', 'Prix d’achat HT', 'PV HT pratiqué'],
              align: ['left', 'left', 'right', 'right'],
              rows: CHAUSSURES.map((c) => [c.fournisseur, c.name, eur(c.pa), eur(c.pvht)]),
            },
            { type: 'note', text: 'Toutes les références sont des chaussures de sécurité de même norme (S3), d’une qualité comparable pour les clients. TVA : 20 %.' },
          ],
        },
      ],
      activities: [
        {
          id: 'd05-a1-a1',
          kind: 'grid',
          label: '1',
          title: 'Tableau d’analyse des références',
          instructions: 'Calcule pour chaque référence le PV TTC, la marge, le taux de marge et le taux de marque (au centième), puis le coefficient multiplicateur (au millième).',
          helps: ['Marge = PV HT − prix d’achat HT. PV TTC = PV HT × 1,20.', 'Taux de marge = marge ÷ prix d’achat × 100. Taux de marque = marge ÷ PV HT × 100.', `Alto : 72,50 − 54,80 = 17,70 € ; 17,70 ÷ 54,80 × 100 = ${fr(CHAUSSURES[0].tauxMarge)} % ; coefficient = 87 ÷ 54,80 = ${fr(CHAUSSURES[0].coef, 3)}.`],
          outcomeIds: RX1,
          groups: [
            { label: 'Prix', columns: ['Achat HT', 'Vente HT', 'Vente TTC'] },
            { label: 'Analyse', columns: ['Marge', 'Taux de marge', 'Taux de marque', 'Coefficient'] },
          ],
          rows: CHAUSSURES.map((c) => ({
            id: c.id,
            label: c.name.split(' — ')[0],
            sub: c.fournisseur,
            cells: [
              c.pa,
              c.pvht,
              { answer: c.pvttc, explain: `${fr(c.pvht)} × 1,20 = ${fr(c.pvttc)} €.`, tolerance: 0.011 },
              { answer: c.marge, explain: `${fr(c.pvht)} − ${fr(c.pa)} = ${fr(c.marge)} €.`, tolerance: 0.011 },
              { answer: c.tauxMarge, explain: `${fr(c.marge)} ÷ ${fr(c.pa)} × 100 = ${fr(c.tauxMarge)} %.`, tolerance: 0.011 },
              { answer: c.tauxMarque, explain: `${fr(c.marge)} ÷ ${fr(c.pvht)} × 100 = ${fr(c.tauxMarque)} %.`, tolerance: 0.011 },
              { answer: c.coef, explain: `${fr(c.pvttc)} ÷ ${fr(c.pa)} = ${fr(c.coef, 3)}.`, tolerance: 0.0011 },
            ],
          })),
        },
        {
          id: 'd05-a1-a2',
          kind: 'fields',
          label: '2',
          title: 'Conseiller le gérant',
          instructions: 'Exploite ton tableau.',
          helps: ['Compare les taux de marge des deux fournisseurs.', 'À qualité égale, le client choisit souvent au prix ; le commerçant choisit à la marge.', 'Les références Securo ont un prix d’achat beaucoup plus élevé pour un prix de vente identique.'],
          outcomeIds: RX2,
          fields: [
            {
              id: 'perf',
              label: '1. Quelles références sont les plus performantes ? (plusieurs réponses)',
              kind: 'multi',
              options: CHAUSSURES.map((c) => ({ value: c.id, label: `${c.name.split(' — ')[0]} (${c.fournisseur})` })),
              answers: CHAUSSURES.filter((c) => c.tauxMarge > 50).map((c) => c.id),
              explain: 'Les quatre références Protek dépassent 55 % de taux de marge ; les Securo sont à 32 % et 25 %.',
            },
            {
              id: 'decision',
              label: '2. Quelle décision conseilles-tu à M. Moreau ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Renégocier les prix d’achat avec Securo, ou remplacer ses références par des modèles Protek équivalents' },
                { value: 'b', label: 'Augmenter tous les prix de vente de 20 %' },
                { value: 'c', label: 'Abandonner le fournisseur Protek' },
              ],
              answer: 'a',
              explain: 'Le problème vient du prix d’achat Securo : c’est lui qu’il faut améliorer.',
            },
          ],
        },
      ],
      selfAssessment: ['Je sais calculer une marge, un taux de marge, un taux de marque et un coefficient.', 'Je sais comparer la rentabilité de plusieurs références.'],
    },

    /* ================================ APPLICATION 2 ================================ */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Fixer les prix selon la méthode du prix psychologique',
      guidance: 'autonome',
      hero: { id: 'd05-fleurs', alt: 'Composition florale de roses roses dans une jardinière' },
      message: {
        from: 'Lou Martin',
        role: 'Fleuriste, Fleurs en Route',
        text: [
          'Je viens de créer mon camion-fleuriste : je fais les marchés de la région avec des fleurs fraîches et des compositions. Je ne veux pas vendre trop cher pour me faire connaître, ni trop bas, car je dois être rentable et montrer que mes fleurs sont de qualité.',
          'Ce matin, au marché, nous avons interrogé 60 personnes sur ma nouvelle composition. Aide-moi à trouver le bon prix.',
        ],
      },
      documents: [
        {
          id: 'd05-a2-doc1',
          number: 1,
          title: 'Résultats de l’enquête — composition « Pivoines et roses »',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Prix TTC proposé', '« Trop cher »', '« Mauvaise qualité »'],
              align: ['left', 'right', 'right'],
              rows: ENQUETE_BOUQUET.prices.map((p, i) => [`${p} €`, String(ENQUETE_BOUQUET.tropCher[i]), String(ENQUETE_BOUQUET.qualite[i])]),
            },
            { type: 'note', text: 'Coût de revient de la composition : 14,50 € HT. TVA sur les fleurs : 10 %.' },
          ],
        },
      ],
      activities: [
        psyGrid('d05-a2-a1', '1', 'Calculer le prix d’acceptabilité', ENQUETE_BOUQUET, 0, 0.16, RX1, [
          'Pourcentage = réponses ÷ 60 × 100, arrondi au dixième.',
          'A cumule les « trop cher » de haut en bas ; B part de 100 % et retire les « mauvaise qualité » des prix précédents.',
          'Ligne 18 € : A = 1,7 % ; B = 100 − 25 = 75 % ; acheteurs = 100 − (1,7 + 75) = 23,3 %.',
        ]),
        {
          id: 'd05-a2-a2',
          kind: 'fields',
          label: '2',
          title: 'Proposer un prix à Lou',
          instructions: 'Exploite ton tableau et vérifie la rentabilité.',
          helps: ['Cherche le pourcentage d’acheteurs le plus élevé.', 'Avec une TVA de 10 %, PV HT = PV TTC ÷ 1,10.', 'Compare le PV HT au coût de revient de 14,50 €.'],
          outcomeIds: RX12,
          fields: [
            num('prix', '1. Prix d’acceptabilité', PSY_BOUQUET.best.price, `${PSY_BOUQUET.best.price} € : ${fr(PSY_BOUQUET.best.acheteurs, 1)} % d’acheteurs potentiels.`, '€'),
            num('pvht', '2. PV HT correspondant', r2(PSY_BOUQUET.best.price / 1.1), `${PSY_BOUQUET.best.price} ÷ 1,10 = ${fr(r2(PSY_BOUQUET.best.price / 1.1))} €.`, '€', 0.011),
            { id: 'rentable', label: '3. Ce prix couvre-t-il le coût de revient ?', kind: 'choice', options: OUI_NON, answer: r2(PSY_BOUQUET.best.price / 1.1) > 14.5 ? 'oui' : 'non', explain: `${fr(r2(PSY_BOUQUET.best.price / 1.1))} € > 14,50 €.` },
            { id: 'critere', label: '4. Quel autre critère faut-il absolument vérifier avant de fixer un prix selon la demande ?', kind: 'choice', options: [{ value: 'cout', label: 'Que le prix couvre le coût de revient et laisse une marge' }, { value: 'couleur', label: 'La couleur des fleurs' }, { value: 'meteo', label: 'La météo du marché' }], answer: 'cout', explain: 'Un prix accepté par les clients doit aussi être rentable.' },
          ],
        },
      ],
      selfAssessment: ['Je sais calculer un prix psychologique.', 'Je sais vérifier qu’un prix accepté par les clients est rentable.'],
    },

    /* ================================ APPLICATION 3 ================================ */
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Fixer les prix selon la concurrence',
      guidance: 'autonome',
      hero: { id: 'd05-stylos', alt: 'Trois stylos-plumes aux corps marbrés posés sur un carnet' },
      message: {
        from: 'Marc Duteil',
        role: 'Gérant, librairie-papeterie La Plume',
        text: ['Nous sommes le 1ᵉʳ octobre. Pour les fêtes, plusieurs clients m’ont demandé des stylos de la marque de luxe Calame. J’ai passé une première commande. Aide-moi à fixer leurs prix : j’ai relevé ceux de trois concurrents.'],
      },
      documents: [
        {
          id: 'd05-a3-doc1',
          number: 1,
          title: 'Extrait du bon de commande',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Quantité'],
              align: ['left', 'left', 'right'],
              rows: STYLOS.map((s) => [s.ref, s.name, String(s.qte)]),
            },
          ],
        },
        {
          id: 'd05-a3-doc2',
          number: 2,
          title: 'Prix TTC relevés chez les concurrents',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Papeterie du centre', 'Site spécialisé', 'Grand magasin'],
              align: ['left', 'right', 'right', 'right'],
              rows: STYLOS.map((s) => [s.ref, ...s.prix.map((p) => eur(p))]),
            },
            {
              type: 'list',
              title: 'Règles de calcul retenues par M. Duteil',
              items: ['Pénétration : 5 % sous le prix le plus bas.', 'Alignement : moyenne des trois prix.', 'Écrémage : 5 % au-dessus du prix le plus haut.', 'Arrondir au centime.'],
            },
          ],
        },
        {
          id: "d05-revision-4-doc",
          number: 3,
          title: "Fixer le prix d’une nouvelle gourde",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Une boutique d’articles de sport supporte un coût complet de 10 € HT. Elle vise une marge d’au moins 4 € par vente. TVA de l’exercice 20 %. Prix testés de 15,60 €, 17,40 € et 19,20 € TTC, avec des intentions de 68 %, 56 % et 38 %. Un concurrent comparable livre pour 18,50 €."
            }
          ]
        },
        {
          id: "d05-revision-dossier-doc1",
          number: 4,
          title: "Coûts et objectif",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Pour le coffret Ardoise, achat à 10 € HT et coûts affectés de 2 € HT par unité. TVA d’exercice de 20 %. Marge unitaire minimale de 4 € sur coût complet. Le fournisseur peut livrer au plus 60 coffrets."
            }
          ]
        },
        {
          id: "d05-revision-dossier-doc2",
          number: 5,
          title: "Test et concurrence",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Prix TTC",
                "Ventes prévues sur 2 semaines"
              ],
              rows: [
                [
                  "18 €",
                  "60"
                ],
                [
                  "19,20 €",
                  "52"
                ],
                [
                  "21 €",
                  "42"
                ],
                [
                  "22,80 €",
                  "28"
                ]
              ]
            },
            {
              type: "p",
              text: "Un coffret comparable avec emballage cadeau coûte 21,50 € TTC en magasin concurrent. La prévision de volume est une hypothèse interne."
            }
          ]
        },
        {
          id: "d05-revision-dossier-doc3",
          number: 6,
          title: "Changement de coût avant le lancement",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le coût complet passe à 13,50 € HT. Les prix testés et les volumes estimés restent les seuls repères disponibles. La boutique veut rester au prix du concurrent ou en dessous. Elle accepte de tester une économie de 0,50 € sur l’emballage."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd05-a3-a1',
          kind: 'fields',
          label: '1',
          title: 'Proposer un prix selon chaque stratégie',
          instructions: 'Calcule, pour chaque référence, le prix TTC selon les trois stratégies (document 2).',
          helps: ['Repère le prix le plus bas et le plus haut de chaque ligne.', 'Pénétration = plus bas × 0,95 ; écrémage = plus haut × 1,05 ; alignement = somme des 3 prix ÷ 3.', `${STYLOS[0].ref} : 520 × 0,95 = ${fr(STYLOS[0].penetration)} € ; (520 + 545 + 539) ÷ 3 = ${fr(STYLOS[0].alignement)} € ; 545 × 1,05 = ${fr(STYLOS[0].ecremage)} €.`],
          outcomeIds: RX1,
          layout: 'columns',
          columns: ['Pénétration', 'Alignement', 'Écrémage'],
          fields: STYLOS.flatMap((s): Field[] => [
            num(`${s.id}.0`, `${s.ref} — ${s.name}`, s.penetration, `${fr(Math.min(...s.prix))} × 0,95 = ${fr(s.penetration)} €.`, '€', 0.011),
            num(`${s.id}.1`, `${s.ref} — ${s.name}`, s.alignement, `(${s.prix.map((p) => fr(p)).join(' + ')}) ÷ 3 = ${fr(s.alignement)} €.`, '€', 0.011),
            num(`${s.id}.2`, `${s.ref} — ${s.name}`, s.ecremage, `${fr(Math.max(...s.prix))} × 1,05 = ${fr(s.ecremage)} €.`, '€', 0.011),
          ]),
        },
        {
          id: 'd05-a3-a2',
          kind: 'fields',
          label: '2',
          title: 'Recommander une stratégie',
          instructions: 'Choisis la stratégie à conseiller à M. Duteil et justifie.',
          helps: ['Le même stylo de marque est vendu partout : le client peut comparer facilement.', 'Un prix trop haut fait fuir le client vers les concurrents ; un prix trop bas réduit la marge et peut abîmer l’image de luxe.', 'Pour une marque connue et un nouveau rayon, on reste au niveau du marché.'],
          outcomeIds: RX2,
          fields: [
            { id: 'strat', label: '1. Stratégie recommandée', kind: 'choice', options: [{ value: 'alignement', label: 'Alignement' }, { value: 'ecremage', label: 'Écrémage' }, { value: 'penetration', label: 'Pénétration' }], answer: 'alignement', explain: 'Produit identique chez tous les concurrents : le prix du marché s’impose.' },
            {
              id: 'justif',
              label: '2. Justifications (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'compare', label: 'Le client retrouve exactement le même produit ailleurs et compare les prix' },
                { value: 'image', label: 'Un prix trop bas abîmerait l’image de luxe de la marque' },
                { value: 'marge', label: 'Un prix aligné préserve une marge correcte' },
                { value: 'unique', label: 'La librairie est la seule à vendre cette marque' },
              ],
              answers: ['compare', 'image', 'marge'],
              explain: 'Trois concurrents vendent déjà la marque.',
            },
          ],
        },
        {
          id: "d05-revision-4",
          label: "Nouveau cas d’application",
          title: "Fixer le prix d’une nouvelle gourde",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Commence par éliminer les prix incompatibles avec la marge, puis compare la demande et l’offre concurrente.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "(10 + 4) × 1,20 = 16,80 €."
          ],
          outcomeIds: [
            "d05-r1",
            "d05-x1",
            "d05-x2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel prix TTC minimum couvre l’objectif ?",
              kind: "number",
              answer: 16.8,
              explain: "(10 + 4) × 1,20 = 16,80 €."
            },
            {
              id: "q2",
              label: "Choisis un prix testé et rédige la note de décision.",
              kind: "written",
              lines: 3,
              model: "17,40 € TTC, soit 14,50 € HT et 4,50 € de marge. Ce prix respecte l’objectif, donne 56 % d’intentions et se situe sous le prix comparable de 18,50 €. Je mesure ventes et marge après une semaine."
            }
          ]
        },
        {
          id: "d05-revision-dossier",
          label: "Dossier de décision",
          title: "Fixer un prix lorsque marge et volume tirent dans des directions différentes",
          instructions: "Lis les documents 4 et 5, puis écris ton diagnostic initial. Passe ensuite au document 6 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Construis le tableau de marge unitaire et de marge totale, puis reprends le calcul après la hausse de coût.",
            "À chaque prix, passe du TTC au HT en divisant par 1,20. Déduis le coût complet, puis multiplie la marge unitaire par le nombre de ventes estimé.",
            "Exemple. À 24 € TTC, le prix HT vaut 20 €. Avec un coût de 14 € HT, la marge est de 6 € par vente, soit 180 € pour 30 ventes. Compare aussi le seuil unitaire et le prix du concurrent."
          ],
          outcomeIds: [
            "d05-r1",
            "d05-x1",
            "d05-x2"
          ],
          fields: [
            {
              id: "q1",
              label: "Compare les quatre prix avant la hausse avec une marge unitaire et une marge totale pour chacun.",
              kind: "written",
              lines: 6,
              model: "18 € donne 3 € par unité et 180 € au total, sous le seuil unitaire. 19,20 € donne 4 € et 208 €. 21 € donne 5,50 € et 231 €. 22,80 € donne 7 € et 196 € et dépasse le prix concurrent."
            },
            {
              id: "q2",
              label: "Quel prix est défendable au départ et sur quelles hypothèses ?",
              kind: "written",
              lines: 6,
              model: "21 € TTC, marge totale prévue de 231 €, marge unitaire de 5,50 € et prix inférieur à 21,50 €. Cette décision dépend des 42 ventes estimées et d’un service cadeau comparable."
            },
            {
              id: "q3",
              label: "Après la hausse, que devient la décision ? Vérifie l’effet de l’économie d’emballage.",
              kind: "written",
              lines: 6,
              model: "À 21 €, le HT vaut 17,50 €. Avec le nouveau coût de 13,50 €, la marge unitaire est de 4 € exactement, soit 168 € pour 42 ventes. L’économie de 0,50 € porterait la marge à 4,50 € et 189 € si le service et le volume restent comparables."
            },
            {
              id: "q4",
              label: "Prépare deux seuils de suivi pour les deux semaines de lancement.",
              kind: "written",
              lines: 6,
              model: "Suivre une marge réelle d’au moins 4 € par unité et comparer le volume aux 42 ventes prévues. Vérifier le coût réel de l’emballage et les remarques sur sa qualité avant de maintenir l’économie."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais appliquer une stratégie de prix à partir des prix de la concurrence.', 'Je sais justifier le choix d’une stratégie.',
        "Je compare les prix par marge unitaire et marge totale.",
        "Je recalcule après modification d’un coût.",
        "Je précise les hypothèses de vente et les contrôles qui permettent de les tester."],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais distinguer les réductions accordées par un fournisseur.',
        'Je sais calculer un coût de revient, une marge, un PV HT et un PV TTC.',
        'Je sais calculer un taux de marge, un taux de marque et un coefficient multiplicateur.',
        'Je sais calculer un prix psychologique.',
        'Je sais fixer un prix en tenant compte de la concurrence.',
        'Je sais vérifier qu’un prix reste rentable.',
      ],
    },
  ],
};
