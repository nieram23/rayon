import type { Chapter, ChoiceOption, Field, GridActivity } from '../../domain/chapter';

/**
 * DOSSIER 8 — Implanter les produits
 *
 * Progression calquée sur le manuel de référence (contexte, 6 missions, synthèse, 2 applications).
 * Enseignes, marques, personnages, documents et chiffres : ORIGINAUX et fictifs.
 * Tous les indicateurs (linéaires, capacités, rendement, rentabilité, indices de sensibilité) sont calculés ici puis testés.
 */

const R1 = ['d08-r1']; // Enjeux de la mise en valeur précisés.
const R2 = ['d08-r2']; // Attractivité analysée.
const R3 = ['d08-r3']; // Remédiations mises en place.
const R12 = ['d08-r1', 'd08-r2'];
const R23 = ['d08-r2', 'd08-r3'];

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const r4 = (n: number) => Math.round((n + Number.EPSILON) * 10000) / 10000;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });
const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

/* =============================== Mission 5 : mur de maillots =============================== */

export const MUR = {
  meubles: 5,
  largeur: 1.2, // m
  niveaux: 5,
  facesParNiveau: 3, // broches par meuble et par niveau
  niveauxHauts: 3,
  niveauxBas: 2,
  broche: 40, // cm de profondeur
  produit: { hauteur: 40, largeur: 35, epaisseur: 1.5 }, // cm
};
export const MUR_CALC = (() => {
  const sol = r2(MUR.meubles * MUR.largeur);
  const ld = r2(sol * MUR.niveaux);
  const hauts = MUR.meubles * MUR.facesParNiveau * MUR.niveauxHauts;
  const bas = MUR.meubles * MUR.facesParNiveau * MUR.niveauxBas;
  const enHauteur = MUR.niveaux;
  const enLongueur = Math.floor((MUR.largeur * 100) / MUR.produit.largeur);
  const enProfondeur = Math.floor(MUR.broche / MUR.produit.epaisseur);
  const capMeuble = enHauteur * enLongueur * enProfondeur;
  return { sol, ld, ldMeuble: r2(MUR.largeur * MUR.niveaux), hauts, bas, enHauteur, enLongueur, enProfondeur, capMeuble, capMur: capMeuble * MUR.meubles };
})();

/* =============================== Indicateurs de rentabilité (générique) =============================== */

export interface LineInput {
  id: string;
  name: string;
  qte: number;
  pv: number;
  cout: number;
  ld: number;
}
export function lineaire(rows: LineInput[], totalCa?: number, totalMb?: number, totalLd?: number) {
  const base = rows.map((r) => {
    const ca = r2(r.qte * r.pv);
    const mbU = r2(r.pv - r.cout);
    const mb = r2(r.qte * mbU);
    return { ...r, ca, mbU, mb, rendement: r2(ca / r.ld), rentabilite: r2(mb / r.ld) };
  });
  const CA = totalCa ?? r2(base.reduce((n, r) => n + r.ca, 0));
  const MB = totalMb ?? r2(base.reduce((n, r) => n + r.mb, 0));
  const LD = totalLd ?? r2(base.reduce((n, r) => n + r.ld, 0));
  const rows2 = base.map((r) => {
    const caP = r2((r.ca / CA) * 100);
    const ldP = r2((r.ld / LD) * 100);
    const mbP = r2((r.mb / MB) * 100);
    const isCa = r4(caP / ldP);
    const isMb = r4(mbP / ldP);
    const im = r4((isCa + isMb) / 2);
    return { ...r, caP, ldP, mbP, isCa, isMb, im, lo: r2(r.ld * im) };
  });
  return { rows: rows2, CA, MB, LD };
}
const verdict = (is: number) => (Math.abs(is - 1) < 0.005 ? 'garder' : is > 1 ? 'augmenter' : 'diminuer');

export const MAILLOTS = lineaire(
  [
    { id: 'a', name: 'Meuble A « Essentiels »', qte: 330, pv: 4.2, cout: 1.05, ld: 6 },
    { id: 'e', name: 'Meuble E « Tendance »', qte: 240, pv: 6.8, cout: 1.3, ld: 6 },
  ],
  8000,
  5200,
  30,
);

/* =============================== Application 2 : lessives =============================== */

export const LESSIVE_MEUBLE = { largeur: 1.33, niveaux: 5, profondeur: 40, hauteurNiveau: 40 };
export const LESSIVE_LIN = (() => {
  const sol = r2(LESSIVE_MEUBLE.largeur * 2);
  const ldMeuble = r2(LESSIVE_MEUBLE.largeur * LESSIVE_MEUBLE.niveaux);
  return { sol, ldMeuble, ldTotal: r2(ldMeuble * 2) };
})();
export const BARIL = { hauteur: 35, largeur: 30, profondeur: 11 };
export const BARIL_CAP = (() => {
  const h = Math.floor(LESSIVE_MEUBLE.hauteurNiveau / BARIL.hauteur);
  const l = Math.floor((LESSIVE_MEUBLE.largeur * 100) / BARIL.largeur);
  const p = Math.floor(LESSIVE_MEUBLE.profondeur / BARIL.profondeur);
  return { h, l, p, total: h * l * p };
})();
export const LESSIVES = lineaire([
  { id: 'a', name: 'Meuble A « Poudres »', qte: 120, pv: 11.2, cout: 3.4, ld: LESSIVE_LIN.ldMeuble },
  { id: 'b', name: 'Meuble B « Liquides »', qte: 220, pv: 9.6, cout: 2.9, ld: LESSIVE_LIN.ldMeuble },
]);

function rentaGrid(id: string, label: string, title: string, L: ReturnType<typeof lineaire>, helps: [string, string, string], outcomeIds: string[], givenTotals: boolean): GridActivity {
  const tol = 0.011;
  return {
    id,
    kind: 'grid',
    label,
    title,
    instructions: 'Calcule le CA HT, la marge brute unitaire et totale, puis le rendement et la rentabilité au mètre linéaire développé. Arrondis au centime.',
    helps,
    outcomeIds,
    groups: [
      { label: 'Données', columns: ['Qté vendue', 'PV HT', 'Coût d’achat HT', 'LD (mld)'] },
      { label: 'Résultats', columns: ['CA HT', 'MB unitaire', 'MB totale', 'Rendement (€/mld)', 'Rentabilité (€/mld)'] },
    ],
    rows: [
      ...L.rows.map((r) => ({
        id: r.id,
        label: r.name,
        cells: [
          r.qte,
          r.pv,
          r.cout,
          r.ld,
          { answer: r.ca, explain: `${r.qte} × ${fr(r.pv)} = ${fr(r.ca)} €.`, tolerance: tol },
          { answer: r.mbU, explain: `${fr(r.pv)} − ${fr(r.cout)} = ${fr(r.mbU)} €.`, tolerance: tol },
          { answer: r.mb, explain: `${r.qte} × ${fr(r.mbU)} = ${fr(r.mb)} €.`, tolerance: tol },
          { answer: r.rendement, explain: `${fr(r.ca)} ÷ ${fr(r.ld)} = ${fr(r.rendement)} €.`, tolerance: tol },
          { answer: r.rentabilite, explain: `${fr(r.mb)} ÷ ${fr(r.ld)} = ${fr(r.rentabilite)} €.`, tolerance: tol },
        ],
      })),
      ...(givenTotals ? [{ id: 'total', label: 'Total du mur (5 meubles)', cells: ['', '', '', L.LD, L.CA, '', L.MB, '', ''] as Array<number | string> }] : []),
    ],
    legend: 'MB unitaire = PV HT − coût d’achat HT · Rendement = CA HT ÷ LD · Rentabilité = MB ÷ LD',
  };
}

function indicesGrid(id: string, label: string, L: ReturnType<typeof lineaire>, outcomeIds: string[]): GridActivity {
  return {
    id,
    kind: 'grid',
    label,
    title: 'Calculer les indices de sensibilité et le linéaire optimum',
    instructions: 'Calcule les parts (au centième), les indices de sensibilité et l’indice moyen (au dix-millième), puis le linéaire optimum (au centième).',
    helps: [
      `Part du CA = CA du meuble ÷ ${fr(L.CA)} × 100 ; même calcul pour le LD (÷ ${fr(L.LD)}) et la MB (÷ ${fr(L.MB)}).`,
      'IS CA = CA en % ÷ LD en % ; IS MB = MB en % ÷ LD en % ; IM = (IS CA + IS MB) ÷ 2.',
      'LO = ancien linéaire × IM. Un indice supérieur à 1 signifie que le produit mérite plus de place.',
    ],
    outcomeIds,
    groups: [
      { label: 'Parts', columns: ['CA en %', 'LD en %', 'MB en %'] },
      { label: 'Indices', columns: ['IS CA', 'IS MB', 'IM', 'LO (mld)'] },
    ],
    rows: L.rows.map((r) => ({
      id: r.id,
      label: r.name,
      cells: [
        { answer: r.caP, explain: `${fr(r.ca)} ÷ ${fr(L.CA)} × 100 = ${fr(r.caP)} %.`, tolerance: 0.011 },
        { answer: r.ldP, explain: `${fr(r.ld)} ÷ ${fr(L.LD)} × 100 = ${fr(r.ldP)} %.`, tolerance: 0.011 },
        { answer: r.mbP, explain: `${fr(r.mb)} ÷ ${fr(L.MB)} × 100 = ${fr(r.mbP)} %.`, tolerance: 0.011 },
        { answer: r.isCa, explain: `${fr(r.caP)} ÷ ${fr(r.ldP)} = ${fr(r.isCa, 4)}.`, tolerance: 0.0011 },
        { answer: r.isMb, explain: `${fr(r.mbP)} ÷ ${fr(r.ldP)} = ${fr(r.isMb, 4)}.`, tolerance: 0.0011 },
        { answer: r.im, explain: `(${fr(r.isCa, 4)} + ${fr(r.isMb, 4)}) ÷ 2 = ${fr(r.im, 4)}.`, tolerance: 0.0011 },
        { answer: r.lo, explain: `${fr(r.ld)} × ${fr(r.im, 4)} = ${fr(r.lo)} mld.`, tolerance: 0.011 },
      ],
    })),
    legend: 'IS > 1 : augmenter le linéaire · IS = 1 : ne rien changer · IS < 1 : diminuer le linéaire',
  };
}

const VERDICT_OPTIONS: ChoiceOption[] = [
  { value: 'augmenter', label: 'Augmenter son linéaire' },
  { value: 'garder', label: 'Ne pas modifier son linéaire' },
  { value: 'diminuer', label: 'Diminuer son linéaire' },
];

/* ================================================================================== */

export const D08: Chapter = {
  unitId: 'd08',
  mission:
    "Tribu Mode attend sa collection de mi-saison. Tu places les familles sur le mobilier, choisis une présentation lisible et vérifies les écarts entre plan et rayon. Après une période de vente, tu examines si l’espace accordé à chaque famille correspond aux résultats.",
  fictionNotice: 'L’enseigne Tribu Mode, les autres magasins, les marques, les personnages et tous les chiffres de ce dossier sont imaginaires. Données créées pour Rayon.',
  company: {
    name: 'Tribu Mode — Bellac',
    tagline: 'Grande surface spécialisée : la mode pour toute la famille à petits prix',
    facts: [
      ['Ton poste', 'Élève en PFMP, implantation de la collection de rentrée'],
      ['Ta tutrice', 'Élise Marchand, directrice du magasin'],
      ['La période', 'Fin août : veille de la rentrée scolaire'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Implanter une collection et mesurer la performance du linéaire",
      hero: { id: 'd08-hero', alt: 'Façade moderne d’un magasin de vêtements en zone commerciale' },
      message: {
        from: 'Élise Marchand',
        role: 'Directrice, Tribu Mode Bellac',
        text: [
          'Bienvenue chez Tribu Mode ! Notre concept : la mode pour toute la famille, au meilleur rapport qualité-prix. Notre magasin vient d’adopter le nouveau concept de l’enseigne, plus aéré et plus lumineux.',
          'Nous sommes à la veille de la rentrée scolaire : tu vas m’aider à implanter la nouvelle collection.',
        ],
      },
      documents: [
        {
          id: "d08-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Le linéaire au sol est la longueur de meuble. Le linéaire développé additionne les longueurs des niveaux utilisés.",
                "Un facing correspond à une unité visible de face. La capacité tient aussi compte de la profondeur et de l’empilement autorisé.",
                "Divise la marge par le nombre de mètres pour comparer des espaces différents. Contrôle les ruptures avant de tirer une conclusion."
              ]
            }
          ]
        },
        {
          id: 'd08-o-doc1',
          number: 1,
          title: 'L’enseigne Tribu Mode',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Tribu Mode est un groupe français de distribution de prêt-à-porter créé il y a quarante ans dans le Nord. Il compte 420 magasins en France, tous détenus et gérés par le groupe, et un site marchand.' },
            {
              type: 'facts',
              items: [
                ['Société', 'Tribu Mode SAS'],
                ['Format', 'Grande surface spécialisée dans le textile, 1 200 m²'],
                ['Magasin', 'Zone commerciale du Puy-Ponchet, 87300 Bellac'],
                ['Concurrents', 'Autres enseignes de mode à petits prix, rayons textile des hypermarchés'],
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd08-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'Des magasins détenus et gérés par le groupe : commerce intégré (succursales).', 'GSS = grande surface spécialisée.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['Tribu Mode SAS', 'Tribu Mode', 'TribuMode'], placeholder: 'Nom de la société', explain: 'Tribu Mode SAS.' },
            { id: 'activite', label: 'Activité', kind: 'choice', options: [{ value: 'pap', label: 'Vente de prêt-à-porter pour toute la famille' }, { value: 'sport', label: 'Vente d’articles de sport' }, { value: 'fab', label: 'Fabrication textile' }], answer: 'pap', explain: 'La mode pour toute la famille.' },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'integre', label: 'Commerce intégré (succursales)' }, { value: 'franchise', label: 'Franchise' }, { value: 'isole', label: 'Commerce indépendant isolé' }], answer: 'integre', explain: 'Magasins détenus et gérés par le groupe.' },
            { id: 'forme', label: 'Forme juridique', kind: 'given', value: 'SAS (société par actions simplifiée)' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Bellac', 'zone commerciale du Puy-Ponchet Bellac'], placeholder: 'Ville', explain: 'Bellac.' },
            { id: 'conc', label: 'Concurrents', kind: 'given', value: 'Autres enseignes de mode à petits prix, rayons textile des hypermarchés' },
          ],
        },
        {
          id: 'd08-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Préparer la rentrée',
          instructions: 'Réponds avec tes connaissances.',
          helps: ['Que doivent acheter les familles avant la rentrée ?', 'La rentrée est un temps fort commercial.', 'Il faut attirer les familles avant les concurrents.'],
          outcomeIds: R1,
          fields: [
            { id: 'produits', label: '1. Produits mis en avant à la rentrée (plusieurs réponses)', kind: 'multi', options: [{ value: 'cartables', label: 'Sacs et cartables' }, { value: 'jeans', label: 'Jeans et sweats pour enfants et adolescents' }, { value: 'chaussures', label: 'Baskets' }, { value: 'maillots', label: 'Maillots de bain' }], answers: ['cartables', 'jeans', 'chaussures'], explain: 'Les maillots de bain sont un produit d’été.' },
            { id: 'objectifs', label: '2. Objectifs commerciaux de la rentrée (plusieurs réponses)', kind: 'multi', options: [{ value: 'trafic', label: 'Attirer les familles en magasin' }, { value: 'ca', label: 'Augmenter le chiffre d’affaires' }, { value: 'nouvelle', label: 'Faire découvrir la nouvelle collection' }, { value: 'stock', label: 'Augmenter le stock en réserve' }], answers: ['trafic', 'ca', 'nouvelle'], explain: 'Le stock n’est pas un objectif commercial.' },
          ],
        },
      ],
    },

    /* ================================ MISSION 1 ================================ */
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Définir le marchandisage',
      guidance: 'guidé',
      message: {
        from: 'Élise Marchand',
        role: 'Directrice',
        text: ['Le vendeur conseille, mais la présentation de l’offre permet souvent au client de s’orienter et de choisir seul. Le marchandisage est donc essentiel. Vérifie que notre opération « Spécial rentrée » respecte la règle des 6 B.'],
      },
      documents: [
        {
          id: 'd08-m1-doc1',
          number: 1,
          title: 'Le marchandisage et la règle des 6 B',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Le marchandisage (merchandising) regroupe les techniques qui permettent de présenter les produits dans les meilleures conditions, pour faciliter l’achat et augmenter la rentabilité du point de vente. Il s’appuie sur la règle des 6 B :' },
            {
              type: 'table',
              head: ['Le bon…', 'Ce que cela signifie'],
              rows: [
                ['Bon produit', 'Proposer l’assortiment adapté : nouveautés, produits phares, produits du catalogue, promotions.'],
                ['Bon endroit', 'Placer le produit dans un lieu de passage ou d’attente où il est bien vu.'],
                ['Bon moment', 'Tenir compte de la saison, des événements, des temps forts.'],
                ['Bonne quantité', 'Avoir assez de stock sans surstocker ; prévoir le réassort.'],
                ['Bon prix', 'Fixer un prix adapté à la cible et à la concurrence, bien affiché.'],
                ['Bonne information', 'Étiquetage réglementaire, PLV (publicité sur le lieu de vente), ILV (information sur le lieu de vente).'],
              ],
            },
          ],
        },
        {
          id: 'd08-m1-doc2',
          number: 2,
          title: 'L’opération « Spécial rentrée » de Tribu Mode',
          look: 'memo',
          blocks: [
            {
              type: 'list',
              items: [
                'Du 20 août au 15 septembre, catalogue « Spécial rentrée » distribué dans les boîtes aux lettres.',
                'Le jean ado Street, produit vedette du catalogue, passe de 19 € à 12 €.',
                'Un podium à l’entrée du magasin présente le jean sur deux mannequins habillés « look rentrée ».',
                'Une affiche « Spécial rentrée » et des kakémonos signalent l’offre ; chaque pile porte son étiquette prix.',
                'Une palette de 400 jeans est stockée en réserve pour réapprovisionner le podium chaque jour.',
              ],
            },
          ],
        },
        {
          id: "d08-revision-1-doc",
          number: 3,
          title: "Identifier le rôle de chaque choix de marchandisage",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "À l’entrée, une silhouette complète présente veste, pantalon et sac. Dans le mur de jeans, les tailles se lisent de gauche à droite. Le responsable fixe deux mètres de linéaire développé aux articles à forte rotation."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd08-m1-a1',
          kind: 'classify',
          label: 'Annexe',
          title: 'Vérifier la règle des 6 B sur l’offre « Spécial rentrée »',
          instructions: 'Associe chaque élément de l’opération (document 2) au « B » qu’il respecte (document 1).',
          helps: ['Relis la définition de chaque « B ».', 'Le moment, c’est la date ; l’endroit, c’est le lieu ; la quantité, c’est le stock.', 'Affiche et kakémonos = PLV : la bonne information.'],
          outcomeIds: R12,
          categories: [
            { id: 'produit', label: 'Bon produit' },
            { id: 'endroit', label: 'Bon endroit' },
            { id: 'moment', label: 'Bon moment' },
            { id: 'quantite', label: 'Bonne quantité' },
            { id: 'prix', label: 'Bon prix' },
            { id: 'info', label: 'Bonne information' },
          ],
          items: [
            { id: 'jean', text: 'Le jean Street, produit vedette du catalogue', answer: 'produit', explain: 'Produit phare de l’assortiment.' },
            { id: 'podium', text: 'Le podium à l’entrée du magasin', answer: 'endroit', explain: 'Lieu de passage, visible dès l’entrée.' },
            { id: 'dates', text: 'L’opération du 20 août au 15 septembre', answer: 'moment', explain: 'Temps fort de la rentrée.' },
            { id: 'palette', text: 'La palette de 400 jeans en réserve pour le réassort', answer: 'quantite', explain: 'Éviter la rupture.' },
            { id: 'prix', text: 'Le prix passe de 19 € à 12 €', answer: 'prix', explain: 'Prix attractif pour la cible familiale.' },
            { id: 'affiche', text: 'L’affiche, les kakémonos et les étiquettes prix', answer: 'info', explain: 'PLV et étiquetage.' },
          ],
        },
        {
          id: 'd08-m1-a2',
          kind: 'fields',
          label: 'Question',
          title: 'Comprendre l’enjeu',
          instructions: 'Réponds à l’aide du document 1.',
          helps: ['Pourquoi présenter les produits avec soin ?', 'Le client choisit seul, en libre-service.', 'Plus il trouve facilement, plus il achète.'],
          outcomeIds: R1,
          fields: [
            { id: 'enjeu', label: 'Quels sont les enjeux du marchandisage ? (plusieurs réponses)', kind: 'multi', options: [{ value: 'faciliter', label: 'Faciliter le choix du client en autonomie' }, { value: 'ventes', label: 'Augmenter les ventes et la rentabilité' }, { value: 'image', label: 'Donner une bonne image du magasin' }, { value: 'vendeurs', label: 'Supprimer les vendeurs' }], answers: ['faciliter', 'ventes', 'image'], explain: 'Le vendeur reste indispensable pour conseiller.' },
          ],
        },
        {
          id: "d08-revision-1",
          label: "Annexe complémentaire",
          title: "Identifier le rôle de chaque choix de marchandisage",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Repère si le choix vise surtout à séduire, à organiser le repérage ou à gérer la performance.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Silhouette complète pour la séduction. Tailles ordonnées pour l’organisation. Espace attribué selon la rotation pour la gestion."
          ],
          outcomeIds: [
            "d08-r1",
            "d08-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Associe chaque décision à sa fonction dominante.",
              kind: "written",
              lines: 3,
              model: "Silhouette complète pour la séduction. Tailles ordonnées pour l’organisation. Espace attribué selon la rotation pour la gestion."
            },
            {
              id: "q2",
              label: "Propose une amélioration pour un client qui ne trouve pas sa taille.",
              kind: "written",
              lines: 3,
              model: "Ajouter une signalétique de tailles lisible devant le mur et indiquer où trouver les tailles complémentaires, puis observer si les demandes de repérage diminuent."
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
      title: 'Choisir la bonne implantation',
      guidance: 'guidé',
      message: {
        from: 'Élise Marchand',
        role: 'Directrice',
        text: ['Pour comprendre les plans d’implantation que nous envoie le siège, lis ce feuillet sur les trois modes d’implantation. Identifie le mode utilisé dans trois rayons du magasin, puis précise les avantages et les inconvénients de chacun.'],
      },
      documents: [
        {
          id: 'd08-m2-doc1',
          number: 1,
          title: 'Les modes d’implantation',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Mode', 'Principe', 'Effet'],
              rows: [
                ['Horizontale', 'Une famille de produits occupe tout un niveau d’étagère sur la longueur du linéaire.', 'Moins lisible : le client doit parcourir tout le linéaire. Met en valeur, par un effet de masse, les produits placés au niveau des yeux et des mains.'],
                ['Verticale', 'Une famille ou une marque occupe une colonne, du haut en bas du linéaire.', 'Rayon clair et ordonné ; chaque famille profite de tous les niveaux ; le client compare facilement.'],
                ['Par pavés', 'Mélange des deux : des blocs de produits complémentaires créent des frontales.', 'Idéale pour le textile : elle théâtralise l’espace et favorise les ventes additionnelles.'],
              ],
            },
            { type: 'note', text: 'Frontale (facing) : nombre de produits vus de face sur un ou plusieurs niveaux. Super-niveau : niveaux des yeux et des mains (environ 1,20 m à 1,60 m), les plus vendeurs.' },
          ],
        },
        {
          id: 'd08-m2-doc2',
          number: 2,
          title: 'Trois rayons du magasin',
          look: 'fiche',
          blocks: [
            {
              type: 'list',
              items: [
                'Rayon 1 — Femme : sur une table, un mannequin en jupe et chemisier ; à côté, des piles de pulls bordeaux, des chemisiers et des bottines assortis, formant un bloc par « look ».',
                'Rayon 2 — Homme : sur toute la longueur, l’étagère du haut ne présente que des chemises, celle du milieu que des chaussures, celle du bas que des jeans.',
                'Rayon 3 — Collège : chaque colonne de l’étagère présente une seule taille de sweat, du haut en bas.',
              ],
            },
          ],
        },
        {
          id: "d08-revision-2-doc",
          number: 3,
          title: "Répartir les familles sur deux meubles",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Meuble",
                "Place disponible",
                "Usage"
              ],
              rows: [
                [
                  "A, entrée",
                  "1,80 m",
                  "Produits nouveaux, arrêt bref"
                ],
                [
                  "B, mur",
                  "2,40 m",
                  "Tailles et réassort, espace pour chercher"
                ]
              ]
            },
            {
              type: "p",
              text: "La gamme nouveauté demande 1,60 m. Les permanents demandent 2,20 m. La responsable veut conserver 20 cm libres sur chaque meuble."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd08-m2-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Identifier le mode d’implantation',
          instructions: 'Pour chaque rayon du document 2, indique le mode d’implantation.',
          helps: ['Une famille sur une ligne : horizontale.', 'Une famille sur une colonne : verticale.', 'Des blocs de produits complémentaires : pavés.'],
          outcomeIds: R2,
          fields: (
            [
              ['r1', 'Rayon 1 — Femme', 'paves'],
              ['r2', 'Rayon 2 — Homme', 'horizontale'],
              ['r3', 'Rayon 3 — Collège', 'verticale'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            options: [
              { value: 'horizontale', label: 'Horizontale' },
              { value: 'verticale', label: 'Verticale' },
              { value: 'paves', label: 'Par pavés' },
            ],
            answer,
            explain: 'Voir le principe de chaque mode dans le document 1.',
          })),
        },
        {
          id: 'd08-m2-a2',
          kind: 'classify',
          label: 'Annexe 2',
          title: 'Avantages et inconvénients',
          instructions: 'Classe chaque affirmation selon le mode d’implantation qu’elle décrit.',
          helps: ['Relis la colonne « Effet » du document 1.', 'Ventes additionnelles et théâtralisation : pavés.', 'Comparaison facile entre marques : verticale.'],
          outcomeIds: R2,
          categories: [
            { id: 'horizontale', label: 'Horizontale' },
            { id: 'verticale', label: 'Verticale' },
            { id: 'paves', label: 'Par pavés' },
          ],
          items: [
            { id: 'a1', text: 'Avantage : effet de masse pour les produits du super-niveau.', answer: 'horizontale', explain: 'Une famille entière au niveau des yeux.' },
            { id: 'a2', text: 'Inconvénient : les produits du niveau du sol sont peu vus.', answer: 'horizontale', explain: 'Toute une famille est pénalisée.' },
            { id: 'a3', text: 'Avantage : le client compare facilement les marques ou les tailles.', answer: 'verticale', explain: 'Rayon clair et ordonné.' },
            { id: 'a4', text: 'Avantage : chaque famille profite de tous les niveaux.', answer: 'verticale', explain: 'Les bons et les mauvais niveaux sont partagés.' },
            { id: 'a5', text: 'Avantage : suggère des « looks » et favorise les ventes additionnelles.', answer: 'paves', explain: 'Produits complémentaires associés.' },
            { id: 'a6', text: 'Inconvénient : demande plus de temps et de soin pour être maintenue.', answer: 'paves', explain: 'Les blocs se défont vite.' },
          ],
        },
        {
          id: "d08-revision-2",
          label: "Annexe complémentaire",
          title: "Répartir les familles sur deux meubles",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Vérifie l’espace utile après avoir soustrait la réserve de place.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "1,80 − 0,20 = 1,60 m."
          ],
          outcomeIds: [
            "d08-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel espace utilisable reste sur A en mètres ?",
              kind: "number",
              answer: 1.6,
              explain: "1,80 − 0,20 = 1,60 m."
            },
            {
              id: "q2",
              label: "Propose une répartition et explique le parcours client.",
              kind: "written",
              lines: 3,
              model: "Nouveautés sur A, exactement 1,60 m et visibles dès l’entrée. Permanents sur B, 2,20 m avec les tailles regroupées et suffisamment d’espace pour chercher."
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
      title: 'Valoriser la présentation des produits',
      guidance: 'accompagné',
      message: {
        from: 'Élise Marchand',
        role: 'Directrice',
        text: [
          'C’est le grand jour : tu implantes la nouvelle collection Femme sur le mural ! Respecte bien les consignes du siège (document 2) et appuie-toi sur notre guide des techniques de mise en avant (document 1).',
          'Nous choisissons le mural pour une présentation verticale ou par pavés ; l’implantation horizontale utilise plutôt les tables et les tablettes.',
        ],
      },
      documents: [
        {
          id: 'd08-m3-doc1',
          number: 1,
          title: 'Les techniques de mise en avant',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Présentation', 'Usage'],
              rows: [
                ['Silhouette', 'Mannequin habillé, visible dès l’entrée : il théâtralise l’espace, met en scène les produits vedettes ou du catalogue et suggère des achats complémentaires.'],
                ['Facing (frontale)', 'Produit sur cintre présenté de face : il appuie la silhouette, crée des ruptures visuelles et donne une vision immédiate du produit. Pour les produits phares et ceux portés par les silhouettes.'],
                ['Plié', 'Articles pliés sur tablettes : pour les produits permanents et d’entrée de gamme. Gain de place, mais le produit n’est vu qu’en partie ; à ranger par taille, modèle et couleur.'],
                ['Feuilleté', 'Articles sur cintres présentés de profil : effet de masse, accès facile, idéal pour les grandes séries, les modèles déclinés par couleur et les articles encombrants (manteaux).'],
              ],
            },
          ],
        },
        {
          id: 'd08-m3-doc2',
          number: 2,
          title: 'Consignes du siège pour le mural Femme',
          look: 'texte',
          blocks: [
            {
              type: 'zones',
              title: 'Plan du mural (7 modules de 0,60 m, hauteur 2,20 m)',
              zones: [
                { id: 's1', label: 'Silhouette', sub: 'ensemble pull et salopette', tone: 'rose' },
                { id: 'f1', label: 'Feuilleté', sub: 'chemisiers déclinés en 5 couleurs', tone: 'violet' },
                { id: 'p', label: 'Plié', sub: 'tee-shirts et pulls basiques', tone: 'bleu', wide: true },
                { id: 'f2', label: 'Feuilleté', sub: 'vestes', tone: 'violet' },
                { id: 's2', label: 'Silhouette', sub: 'look du catalogue', tone: 'rose' },
                { id: 'face', label: 'Facing', sub: 'sur chaque module, le produit porté par la silhouette', tone: 'jaune', wide: true },
                { id: 'prix', label: 'Balisage prix', sub: 'en haut du mural', tone: 'vert', wide: true },
              ],
            },
          ],
        },
        {
          id: "d08-revision-3-doc",
          number: 3,
          title: "Composer une présentation lisible",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le portant offre 120 cm utiles. Chaque veste exige 12 cm et chaque pantalon 8 cm. La présentation demandée contient au moins 4 vestes et 5 pantalons. Les prix de la tenue complète et des pièces doivent être faciles à distinguer."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd08-m3-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Analyser l’implantation du mural',
          instructions: 'Identifie le mode d’implantation du mural et les techniques de présentation utilisées (document 2).',
          helps: ['Les blocs mélangent colonnes et lignes.', 'Mannequins = silhouettes ; de profil = feuilleté ; de face = facing.', 'Quatre techniques sont utilisées.'],
          outcomeIds: R2,
          fields: [
            { id: 'mode', label: '1. Mode d’implantation du mural', kind: 'choice', options: [{ value: 'horizontale', label: 'Horizontale' }, { value: 'verticale', label: 'Verticale' }, { value: 'paves', label: 'Par pavés' }], answer: 'paves', explain: 'Des blocs verticaux et horizontaux associés.' },
            { id: 'tech', label: '2. Techniques de présentation utilisées (plusieurs réponses)', kind: 'multi', options: [{ value: 'silhouette', label: 'Silhouette' }, { value: 'facing', label: 'Facing' }, { value: 'plie', label: 'Plié' }, { value: 'feuillete', label: 'Feuilleté' }, { value: 'vrac', label: 'Vrac' }], answers: ['silhouette', 'facing', 'plie', 'feuillete'], explain: 'Pas de vrac sur un mural textile.' },
            num('longueur', '3. Longueur du mural', 4.2, '7 × 0,60 = 4,20 m.', 'm', 0.001),
          ],
        },
        {
          id: 'd08-m3-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Justifier chaque présentation',
          instructions: 'Choisis la justification de chaque présentation (document 1).',
          helps: ['Relis l’usage de chaque technique.', 'Silhouette : mettre en scène ; plié : basiques ; feuilleté : grandes séries ; facing : produits phares.', 'Chaque technique a un objectif précis.'],
          outcomeIds: R12,
          fields: (
            [
              ['silhouette', 'Silhouette : l’ensemble pull et salopette, produit vedette', 'scene'],
              ['plie', 'Plié : les tee-shirts et pulls basiques', 'basiques'],
              ['feuillete', 'Feuilleté : les chemisiers en 5 couleurs', 'masse'],
              ['facing', 'Facing : les produits portés par les silhouettes', 'phare'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            select: true,
            options: [
              { value: 'scene', label: 'Théâtraliser l’espace et suggérer des achats complémentaires' },
              { value: 'basiques', label: 'Gagner de la place pour les produits permanents' },
              { value: 'masse', label: 'Créer un effet de masse et montrer toutes les couleurs' },
              { value: 'phare', label: 'Donner une vision immédiate du produit et appuyer la silhouette' },
            ],
            answer,
            explain: 'Voir le document 1.',
          })),
        },
        {
          id: "d08-revision-3",
          label: "Annexe complémentaire",
          title: "Composer une présentation lisible",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Contrôle la place après les quantités minimales avant d’ajouter des pièces.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "120 − (4 × 12 + 5 × 8) = 32 cm."
          ],
          outcomeIds: [
            "d08-r2",
            "d08-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien de centimètres restent après la présentation minimale ?",
              kind: "number",
              answer: 32,
              explain: "120 − (4 × 12 + 5 × 8) = 32 cm."
            },
            {
              id: "q2",
              label: "Propose un portant complet en utilisant les 120 cm.",
              kind: "written",
              lines: 3,
              model: "Quatre vestes et neuf pantalons occupent 48 + 72 = 120 cm. Regrouper les vestes, classer les pantalons par tailles et afficher séparément les prix des pièces et de la tenue."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 4 ================================ */
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Contrôler l’implantation d’une collection',
      guidance: 'accompagné',
      message: {
        from: 'Élise Marchand',
        role: 'Directrice',
        text: ['Aujourd’hui, tu es responsable du rayon « Accessoires homme ». Contrôle son implantation (document 2) en t’appuyant sur nos consignes (document 1), puis indique les remédiations nécessaires.'],
      },
      documents: [
        {
          id: 'd08-m4-doc1',
          number: 1,
          title: 'Consignes d’implantation du rayon « Accessoires homme »',
          look: 'procedure',
          blocks: [
            {
              type: 'list',
              items: [
                'Le rayon est toujours en état marchand : propre, rangé, frontale faite, produits à leur place, sans rupture.',
                'Chaque produit est repéré par une signalétique adaptée (ILV et PLV) et présenté sur sa face la plus vendeuse.',
                'Présentation verticale, par modèle et par couleur ; le meuble compte 7 broches à l’horizontale.',
                'Chaque broche présente un lot, de la taille S (en haut) à la taille XL (en bas).',
                'À partir de la taille 2XL, les produits sont implantés dans l’espace « Grandes tailles ».',
              ],
            },
          ],
        },
        {
          id: 'd08-m4-doc2',
          number: 2,
          title: 'Constat lors du contrôle',
          look: 'memo',
          blocks: [
            {
              type: 'list',
              items: [
                'Visuel 1 — Vue d’ensemble : l’affiche « À partir de 3 € » est posée en haut du meuble, mais deux broches sont vides.',
                'Visuel 2 — Détail : sur une broche de chaussettes, les couleurs sont mélangées et plusieurs lots sont présentés de dos.',
                'Visuel 3 — Une broche de caleçons : un lot de taille 3XL est accroché au milieu des tailles M.',
                'Visuel 4 — L’étiquette prix d’un lot de caleçons indique 12 € au dos du produit, alors que le panneau du meuble annonce 9 €.',
              ],
            },
          ],
        },
        {
          id: "d08-revision-4-doc",
          number: 3,
          title: "Contrôler le rayon par rapport au plan",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Zone",
                "Plan prévu",
                "Constat"
              ],
              rows: [
                [
                  "Haut",
                  "3 facings de vestes courtes",
                  "2 facings, 1 emplacement vide"
                ],
                [
                  "Milieu",
                  "4 facings de pantalons",
                  "4 facings, 2 étiquettes échangées"
                ],
                [
                  "Bas",
                  "2 facings de sacs",
                  "3 facings de sacs"
                ]
              ]
            },
            {
              type: "p",
              text: "Une veste conforme est disponible en réserve. L’équipe veut garder le plan approuvé."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd08-m4-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Contrôler l’implantation du rayon',
          instructions: 'Pour chaque visuel, choisis l’anomalie relevée et la solution à apporter.',
          helps: ['Compare chaque constat à une consigne du document 1.', 'Une broche vide = rupture ; une taille mal placée ; un prix incohérent.', 'Prix différent entre le produit et le panneau : vérifier le bon prix et corriger l’ILV.'],
          outcomeIds: R23,
          layout: 'columns',
          columns: ['Anomalie relevée', 'Solution apportée'],
          fields: (
            [
              ['v1', 'Visuel 1 — Vue d’ensemble', 'rupture', 'reassort'],
              ['v2', 'Visuel 2 — Détail', 'desordre', 'ranger'],
              ['v3', 'Visuel 3 — Broche de caleçons', 'taille', 'grandes'],
              ['v4', 'Visuel 4 — Étiquette prix', 'prix', 'ilv'],
            ] as const
          ).flatMap(([id, label, anomalie, solution]): Field[] => [
            {
              id: `${id}.0`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'rupture', label: 'Ruptures : broches vides' },
                { value: 'desordre', label: 'Couleurs mélangées, produits de dos' },
                { value: 'taille', label: 'Grande taille mal implantée' },
                { value: 'prix', label: 'Prix incohérent entre le produit et le panneau' },
              ],
              answer: anomalie,
              explain: 'Écart avec une consigne du document 1.',
            },
            {
              id: `${id}.1`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'reassort', label: 'Réapprovisionner depuis la réserve, sinon signaler la rupture' },
                { value: 'ranger', label: 'Ranger par couleur et présenter les lots de face' },
                { value: 'grandes', label: 'Déplacer le lot dans l’espace « Grandes tailles »' },
                { value: 'ilv', label: 'Vérifier le bon prix en caisse et corriger l’ILV' },
              ],
              answer: solution,
              explain: 'La remédiation corrige l’anomalie.',
            },
          ]),
        },
        {
          id: "d08-revision-4",
          label: "Annexe complémentaire",
          title: "Contrôler le rayon par rapport au plan",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Traite les écarts de quantité visible et les erreurs d’information.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Haut, remettre une veste depuis la réserve pour revenir à trois facings. Milieu, conserver quatre facings et repositionner les étiquettes après contrôle des références. Bas, retirer un facing de sacs et ranger le surplus en réserve."
          ],
          outcomeIds: [
            "d08-r2",
            "d08-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris les trois lignes de la fiche de contrôle.",
              kind: "written",
              lines: 3,
              model: "Haut, remettre une veste depuis la réserve pour revenir à trois facings. Milieu, conserver quatre facings et repositionner les étiquettes après contrôle des références. Bas, retirer un facing de sacs et ranger le surplus en réserve."
            },
            {
              id: "q2",
              label: "Quel contrôle fais-tu après intervention ?",
              kind: "written",
              lines: 3,
              model: "Relire le plan devant le meuble, compter les facings par niveau et associer chaque étiquette à la bonne référence."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 5 ================================ */
    {
      id: 'mission-5',
      kind: 'mission',
      number: 5,
      title: 'Calculer les indicateurs de gestion du linéaire',
      guidance: 'autonome',
      message: {
        from: 'Élise Marchand',
        role: 'Directrice',
        text: ['Avec le nouveau concept, les maillots de bain occupent un grand mur de présentation, le « mur Plage ». Voici son plan d’implantation et les indicateurs à connaître. Calcule les linéaires, les frontales et la capacité de stockage.'],
      },
      documents: [
        {
          id: 'd08-m5-doc1',
          number: 1,
          title: 'Plan d’implantation du mur Plage',
          look: 'texte',
          blocks: [
            {
              type: 'facts',
              items: [
                ['Meubles', `${MUR.meubles} meubles (A à E) de ${fr(MUR.largeur)} m de large`],
                ['Niveaux', `${MUR.niveaux} niveaux de broches par meuble`],
                ['Présentation', `${MUR.facesParNiveau} broches par meuble et par niveau, chaque broche montre un produit de face`],
                ['Répartition', `${MUR.niveauxHauts} niveaux de hauts de maillots, ${MUR.niveauxBas} niveaux de bas de maillots, sur chaque meuble`],
                ['Broche', `${MUR.broche} cm de profondeur`],
                ['Produit sur cintre', `${MUR.produit.hauteur} cm de haut, ${MUR.produit.largeur} cm de large, ${fr(MUR.produit.epaisseur, 1)} cm d’épaisseur`],
              ],
            },
          ],
        },
        {
          id: 'd08-m5-doc2',
          number: 2,
          title: 'Les indicateurs de gestion du linéaire',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Un logiciel de gestion des linéaires aide à attribuer la bonne place à chaque produit, à suivre les rayons, à augmenter les ventes et à réduire les ruptures.' },
            {
              type: 'table',
              head: ['Indicateur', 'Définition'],
              rows: [
                ['Linéaire au sol', 'Longueur du meuble consacrée au produit, en mètres linéaires (ml).'],
                ['Linéaire développé', 'Linéaire au sol × nombre de niveaux, en mètres linéaires développés (mld).'],
                ['Frontale', 'Nombre de produits vus de face.'],
                ['Capacité de stockage', 'Produits en hauteur × produits en largeur × produits en profondeur.'],
              ],
            },
          ],
        },
        {
          id: "d08-revision-5-doc",
          number: 3,
          title: "Calculer le linéaire et la capacité",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Deux modules de 1,20 m comportent chacun trois niveaux utilisables de largeur identique. Sur un niveau, chaque boîte occupe 24 cm de face. La tablette peut accueillir trois boîtes en profondeur. Aucun empilement n’est autorisé."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd08-m5-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Calculer les indicateurs du mur Plage',
          instructions: 'Calcule chaque indicateur à l’aide des documents 1 et 2.',
          helps: [
            `Linéaire au sol = ${MUR.meubles} × ${fr(MUR.largeur)} ; linéaire développé = linéaire au sol × ${MUR.niveaux}.`,
            `Frontales : meubles × broches par niveau × niveaux concernés.`,
            `En longueur : ${MUR.largeur * 100} ÷ ${MUR.produit.largeur}, arrondi à l’entier inférieur ; en profondeur : ${MUR.broche} ÷ ${fr(MUR.produit.epaisseur, 1)}, arrondi à l’entier inférieur.`,
          ],
          outcomeIds: R2,
          fields: [
            num('sol', '1. Linéaire au sol du mur', MUR_CALC.sol, `${MUR.meubles} × ${fr(MUR.largeur)} = ${fr(MUR_CALC.sol)} ml.`, 'ml', 0.001),
            num('ld', '2. Linéaire développé du mur', MUR_CALC.ld, `${fr(MUR_CALC.sol)} × ${MUR.niveaux} = ${fr(MUR_CALC.ld)} mld.`, 'mld', 0.001),
            num('hauts', '3. Frontales des hauts de maillots', MUR_CALC.hauts, `${MUR.meubles} × ${MUR.facesParNiveau} × ${MUR.niveauxHauts} = ${MUR_CALC.hauts}.`),
            num('bas', '4. Frontales des bas de maillots', MUR_CALC.bas, `${MUR.meubles} × ${MUR.facesParNiveau} × ${MUR.niveauxBas} = ${MUR_CALC.bas}.`),
            num('h', '5. Meuble A : produits en hauteur', MUR_CALC.enHauteur, `${MUR.niveaux} niveaux.`),
            num('l', '6. Meuble A : produits en longueur', MUR_CALC.enLongueur, `${MUR.largeur * 100} ÷ ${MUR.produit.largeur} = ${fr((MUR.largeur * 100) / MUR.produit.largeur)} → ${MUR_CALC.enLongueur}.`),
            num('p', '7. Meuble A : produits en profondeur', MUR_CALC.enProfondeur, `${MUR.broche} ÷ ${fr(MUR.produit.epaisseur, 1)} = ${fr(MUR.broche / MUR.produit.epaisseur)} → ${MUR_CALC.enProfondeur}.`),
            num('capA', '8. Capacité totale du meuble A', MUR_CALC.capMeuble, `${MUR_CALC.enHauteur} × ${MUR_CALC.enLongueur} × ${MUR_CALC.enProfondeur} = ${MUR_CALC.capMeuble}.`),
            num('capMur', '9. Capacité totale du mur', MUR_CALC.capMur, `${MUR_CALC.capMeuble} × ${MUR.meubles} = ${MUR_CALC.capMur}.`),
          ],
        },
        {
          id: "d08-revision-5",
          label: "Annexe complémentaire",
          title: "Calculer le linéaire et la capacité",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Calcule les facings d’un niveau, puis multiplie selon le nombre de niveaux, la profondeur et le nombre de modules.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "2 × 3 × 1,20 = 7,20 m."
          ],
          outcomeIds: [
            "d08-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel est le linéaire développé total en mètres ?",
              kind: "number",
              answer: 7.2,
              explain: "2 × 3 × 1,20 = 7,20 m."
            },
            {
              id: "q2",
              label: "Combien de boîtes tiennent sur les deux modules ?",
              kind: "number",
              answer: 90,
              explain: "5 facings × 3 en profondeur × 3 niveaux × 2 modules = 90 boîtes."
            }
          ]
        },
      ],
    },

    /* ================================ MISSION 6 ================================ */
    {
      id: 'mission-6',
      kind: 'mission',
      number: 6,
      title: 'Calculer la rentabilité du linéaire',
      guidance: 'autonome',
      message: {
        from: 'Élise Marchand',
        role: 'Directrice',
        text: ['Il faut maintenant mesurer la performance du mur Plage. Calcule le rendement et la rentabilité des meubles A et E, puis leurs indices de sensibilité : faut-il leur accorder plus ou moins de place ?'],
      },
      documents: [
        {
          id: 'd08-m6-doc1',
          number: 1,
          title: 'Rendement et rentabilité du linéaire',
          look: 'texte',
          blocks: [
            { type: 'formula', text: 'Rendement = CA HT ÷ linéaire développé\nRentabilité = marge brute HT ÷ linéaire développé', example: 'le rendement indique ce qui se vend le mieux ; la rentabilité, ce qui rapporte le plus' },
          ],
        },
        {
          id: 'd08-m6-doc2',
          number: 2,
          title: 'Les indices de sensibilité',
          look: 'texte',
          blocks: [
            { type: 'formula', text: 'IS CA = CA en % ÷ linéaire développé en %\nIS MB = MB en % ÷ linéaire développé en %\nIndice moyen IM = (IS CA + IS MB) ÷ 2\nLinéaire optimum LO = ancien linéaire × IM' },
            { type: 'list', items: ['Indice égal à 1 : le linéaire est adapté.', 'Indice supérieur à 1 : il faut augmenter la place du produit.', 'Indice inférieur à 1 : il faut diminuer la place du produit.'] },
          ],
        },
        {
          id: 'd08-m6-doc3',
          number: 3,
          title: 'Ventes du mois — mur Plage',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Meuble', 'Quantité vendue', 'PV unitaire HT', 'Coût d’achat unitaire HT', 'LD'],
              align: ['left', 'right', 'right', 'right', 'right'],
              rows: MAILLOTS.rows.map((r) => [r.name, String(r.qte), eur(r.pv), eur(r.cout), `${r.ld} mld`]),
            },
            { type: 'note', text: `Total des 5 meubles : ${fr(MAILLOTS.LD)} mld, CA HT ${eur(MAILLOTS.CA)}, marge brute ${eur(MAILLOTS.MB)}.` },
          ],
        },
        {
          id: "d08-revision-6-doc",
          number: 4,
          title: "Ajuster l’espace après lecture des résultats",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Famille",
                "Linéaire développé",
                "Chiffre d’affaires",
                "Marge"
              ],
              rows: [
                [
                  "Sacs",
                  "2 m",
                  "900 €",
                  "360 €"
                ],
                [
                  "Ceintures",
                  "3 m",
                  "600 €",
                  "180 €"
                ]
              ]
            },
            {
              type: "p",
              text: "La mesure couvre deux semaines sans rupture signalée. Le plan permet de déplacer 0,50 m d’une famille vers l’autre. La responsable souhaite comparer la marge par mètre."
            }
          ]
        },
      ],
      activities: [
        rentaGrid(
          'd08-m6-a1',
          'Annexe 1',
          'Rendement et rentabilité des meubles A et E',
          MAILLOTS,
          [
            'CA HT = quantité × PV HT ; MB unitaire = PV HT − coût d’achat.',
            'MB totale = quantité × MB unitaire.',
            `Meuble A : 330 × 4,20 = ${fr(MAILLOTS.rows[0].ca)} € ; ${fr(MAILLOTS.rows[0].ca)} ÷ 6 = ${fr(MAILLOTS.rows[0].rendement)} €/mld.`,
          ],
          R2,
          true,
        ),
        indicesGrid('d08-m6-a2', 'Annexe 2', MAILLOTS, R23),
        {
          id: 'd08-m6-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Décider',
          instructions: 'Interprète tes résultats.',
          helps: ['Compare l’indice moyen à 1.', 'Le meuble qui rapporte le plus au mètre mérite plus de place.', 'Le linéaire optimum donne la nouvelle place à accorder.'],
          outcomeIds: R23,
          fields: [
            ...MAILLOTS.rows.map((r): Field => ({ id: `dec-${r.id}`, label: r.name, kind: 'choice', options: VERDICT_OPTIONS, answer: verdict(r.im), explain: `IM = ${fr(r.im, 4)}.` })),
            { id: 'plus', label: 'Quel meuble est le plus rentable ?', kind: 'choice', options: MAILLOTS.rows.map((r) => ({ value: r.id, label: r.name })), answer: [...MAILLOTS.rows].sort((a, b) => b.rentabilite - a.rentabilite)[0].id, explain: 'Celui dont la marge par mld est la plus élevée.' },
          ],
        },
        {
          id: "d08-revision-6",
          label: "Annexe complémentaire",
          title: "Ajuster l’espace après lecture des résultats",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Divise la marge de chaque famille par ses propres mètres.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "360 ÷ 2 = 180 € par mètre."
          ],
          outcomeIds: [
            "d08-r2",
            "d08-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle marge par mètre obtient-on pour les sacs ?",
              kind: "number",
              answer: 180,
              explain: "360 ÷ 2 = 180 € par mètre."
            },
            {
              id: "q2",
              label: "Que testes-tu pendant les deux semaines suivantes ?",
              kind: "written",
              lines: 3,
              model: "Les ceintures donnent 180 ÷ 3 = 60 € par mètre. Tester 0,50 m de plus pour les sacs et 0,50 m de moins pour les ceintures, puis comparer la marge totale et les ruptures des deux familles."
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
          id: 'd08-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les six parties.',
          helps: ['6 B : produit, endroit, moment, quantité, prix, information.', 'Trois modes d’implantation, quatre techniques de présentation.', 'Linéaire développé = linéaire au sol × niveaux.'],
          outcomeIds: R12,
          fields: [
            { id: 'b', label: '1. Les 6 B (plusieurs réponses)', kind: 'multi', options: [{ value: 'produit', label: 'Bon produit' }, { value: 'endroit', label: 'Bon endroit' }, { value: 'moment', label: 'Bon moment' }, { value: 'quantite', label: 'Bonne quantité' }, { value: 'prix', label: 'Bon prix' }, { value: 'info', label: 'Bonne information' }, { value: 'vendeur', label: 'Bon vendeur' }], answers: ['produit', 'endroit', 'moment', 'quantite', 'prix', 'info'], explain: 'Le vendeur ne fait pas partie des 6 B.' },
            { id: 'modes', label: '2. Modes d’implantation (plusieurs réponses)', kind: 'multi', options: [{ value: 'h', label: 'Horizontale' }, { value: 'v', label: 'Verticale' }, { value: 'p', label: 'Par pavés' }, { value: 'd', label: 'Diagonale' }], answers: ['h', 'v', 'p'], explain: 'Pas d’implantation diagonale.' },
            { id: 'tech', label: '3-4. Techniques de présentation (plusieurs réponses)', kind: 'multi', options: [{ value: 's', label: 'Silhouette' }, { value: 'f', label: 'Facing' }, { value: 'p', label: 'Plié' }, { value: 'fe', label: 'Feuilleté' }], answers: ['s', 'f', 'p', 'fe'], explain: 'Les quatre techniques.' },
            { id: 'ld', label: '5. Linéaire au sol × nombre de niveaux =', kind: 'text', accept: ['linéaire développé', 'lineaire developpe', 'le linéaire développé'], explain: 'Le linéaire développé.' },
            { id: 'front', label: '5. Nombre de produits vus de face =', kind: 'text', accept: ['frontale', 'la frontale', 'facing', 'le facing', 'frontales'], explain: 'La frontale.' },
            { id: 'is', label: '6. Si l’indice de sensibilité est supérieur à 1…', kind: 'choice', options: VERDICT_OPTIONS, answer: 'augmenter', explain: 'Le produit mérite plus de place.' },
          ],
        },
        {
          id: 'd08-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq calculs rapides.',
          helps: ['Utilise la calculatrice.', 'Relis les formules de la fiche de révision.', 'IS = part du CA ÷ part du linéaire.'],
          outcomeIds: R2,
          fields: [
            num('q1', 'Meuble de 1,50 m à 4 niveaux : linéaire développé ?', 6, '1,50 × 4 = 6 mld.', 'mld', 0.001),
            num('q2', 'CA HT 1 800 € sur 6 mld : rendement ?', 300, '1 800 ÷ 6 = 300 €/mld.', '€', 0.01),
            num('q3', '25 % du CA sur 20 % du linéaire : IS CA ?', 1.25, '25 ÷ 20 = 1,25.', undefined, 0.001),
            num('q4', 'IS CA 1,2 et IS MB 1,4 : indice moyen ?', 1.3, '(1,2 + 1,4) ÷ 2 = 1,3.', undefined, 0.001),
            num('q5', 'Ancien linéaire 5 mld, IM 1,3 : linéaire optimum ?', 6.5, '5 × 1,3 = 6,5 mld.', 'mld', 0.001),
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Marchandisage : présenter les produits pour faciliter l’achat et augmenter la rentabilité.', 'Règle des 6 B : produit, endroit, moment, quantité, prix, information.', 'Implantation horizontale, verticale, par pavés.', 'Présentation en silhouette, facing, plié, feuilleté.', 'PLV et ILV.', 'Linéaire au sol, linéaire développé, frontale, capacité de stockage.', 'Rendement, rentabilité, indices de sensibilité, linéaire optimum.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Vérifier une opération « B » par « B ».', 'Contrôler un rayon : propreté, rangement, ruptures, tailles, prix ; puis remédier.', 'Calculer CA et MB, les rapporter au linéaire développé, puis comparer les parts.', 'Indice > 1 : plus de place ; < 1 : moins de place.'] },
        { title: 'Formules à connaître', kind: 'formules', items: ['Linéaire développé = linéaire au sol × nombre de niveaux', 'Capacité = produits en hauteur × en largeur × en profondeur', 'Rendement = CA HT ÷ LD ; rentabilité = MB ÷ LD', 'IS CA = CA % ÷ LD % ; IS MB = MB % ÷ LD %', 'IM = (IS CA + IS MB) ÷ 2 ; LO = ancien linéaire × IM'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Oublier de multiplier par le nombre de niveaux.', 'Arrondir au supérieur un nombre de produits qui ne tient pas.', 'Confondre rendement (CA) et rentabilité (marge).', 'Laisser des broches vides ou des tailles mélangées.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Faire la frontale chaque matin et après chaque rush.', 'Vérifier la cohérence des prix entre produit, ILV et caisse.', 'Respecter le planogramme envoyé par le siège.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Marchandisage', '6 B', 'Implantation', 'Linéaire au sol', 'Linéaire développé', 'Frontale', 'Indice de sensibilité', 'Indice moyen', 'Linéaire optimum'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Le linéaire au sol mesure la longueur de mobilier. Le linéaire développé additionne les longueurs de tous les niveaux utilisés.",
            "Le facing compte les produits visibles de face. La capacité inclut la profondeur et, si autorisée, la hauteur.",
            "Compare la part de linéaire à la part de ventes et de marge, puis vérifie les ruptures et les contraintes du mobilier."
          ]
        },
      ],
    },

    /* ================================ APPLICATION 1 ================================ */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Réaliser l’implantation d’un mur',
      guidance: 'autonome',
      hero: { id: 'd08-jeans', alt: 'Mur de jeans pliés sur étagères dans un magasin' },
      message: {
        from: 'Élise Marchand',
        role: 'Directrice',
        text: ['Tu as acquis de solides compétences : je te confie le mur « Jeans » du rayon Femme. Compare le mur actuel au nouveau plan, fais l’état des lieux et organise ton travail.'],
      },
      documents: [
        {
          id: 'd08-a1-doc1',
          number: 1,
          title: 'Le mur actuel et le nouveau plan',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['', 'Mur actuel', 'Nouveau plan'],
              rows: [
                ['Structure', '9 étagères sur toute la hauteur', '1 barre de cintres à 2,20 m, 2 tablettes en bas'],
                ['Présentation', 'Jeans pliés uniquement', 'Jeans sur cintres en facing (haut), jeans pliés (bas)'],
                ['Information', 'Deux visuels « Slim » et « Skinny » en haut', 'Visuels « Skinny » et « Slim », balisage prix au centre'],
                ['Dimensions', 'Hauteur 3 m', 'Hauteur 3 m, même largeur'],
              ],
            },
          ],
        },
        {
          id: 'd08-a1-doc2',
          number: 2,
          title: 'Matériel disponible en réserve',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Tablettes · barre de cintres · visuels Skinny et Slim (PLV) · balisage prix (ILV) · 80 cintres à pinces · stock de jeans suffisant.' }],
        },
      ],
      activities: [
        {
          id: 'd08-a1-a1',
          kind: 'fields',
          label: '1',
          title: 'Réaliser l’état des lieux',
          instructions: 'Réponds à chaque question de l’état des lieux.',
          helps: ['Compare le nouveau plan aux dimensions du mur.', 'Vérifie le matériel du document 2.', 'Tout est disponible.'],
          outcomeIds: R2,
          layout: 'checklist',
          fields: (
            [
              ['place', 'La place est-elle suffisante pour le nouveau mur ?'],
              ['mobilier', 'Dispose-t-on du mobilier nécessaire ?'],
              ['plv', 'Dispose-t-on de la bonne PLV ?'],
              ['ilv', 'Dispose-t-on de l’ILV prix ?'],
              ['cintres', 'Dispose-t-on des cintres à pinces ?'],
              ['marchandise', 'Dispose-t-on de la marchandise ?'],
            ] as const
          ).map(([id, label]): Field => ({ id, label, kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Voir les documents 1 et 2.' })),
        },
        {
          id: 'd08-a1-a2',
          kind: 'fields',
          label: '2',
          title: 'Organiser le travail',
          instructions: 'Remets les étapes de l’implantation dans l’ordre.',
          helps: ['On vide avant de démonter.', 'La structure avant le squelette, le squelette avant le remplissage.', 'L’information (PLV, ILV) vient à la fin.'],
          outcomeIds: R3,
          fields: (() => {
            const steps = [
              ['retirer', 'Retirer la marchandise du mur et la placer sur un autre espace'],
              ['etagere', 'Retirer les étagères actuelles'],
              ['structure', 'Positionner la structure de la nouvelle implantation'],
              ['squelette', 'Préparer le squelette du rayon (quelques références selon le plan)'],
              ['completer', 'Compléter le rayon avec l’ensemble des produits'],
              ['plv', 'Installer la PLV'],
              ['ilv', 'Installer l’ILV'],
            ];
            const options = [...steps].sort((a, b) => a[1].localeCompare(b[1], 'fr')).map(([value, label]) => ({ value, label }));
            return steps.map(([value], i): Field => ({ id: `e${i + 1}`, label: `Étape ${i + 1}`, kind: 'choice', select: true, options, answer: value, explain: steps[i][1] + '.' }));
          })(),
        },
        {
          id: 'd08-a1-a3',
          kind: 'fields',
          label: '3',
          title: 'Analyser la nouvelle implantation',
          instructions: 'Pour chaque affirmation, réponds oui ou non.',
          helps: ['Les jeans en facing sont vus de face.', 'Les visuels séparent clairement Skinny et Slim.', 'Le nouveau mur mélange cintres et pliés.'],
          outcomeIds: R2,
          layout: 'checklist',
          fields: (
            [
              ['visible', 'La nouvelle implantation rend l’offre plus visible.', 'oui'],
              ['clair', 'Elle rend l’offre plus claire.', 'oui'],
              ['confort', 'Elle apporte du confort d’achat.', 'oui'],
              ['attractive', 'Elle est attractive.', 'oui'],
              ['mixte', 'Elle mélange les présentations (plié, facing).', 'oui'],
              ['horizontale', 'Elle est en implantation horizontale.', 'non'],
            ] as const
          ).map(([id, label, answer]): Field => ({ id, label, kind: 'choice', options: OUI_NON, answer, explain: answer === 'oui' ? 'Voir le nouveau plan.' : 'Elle est par pavés : coupes séparées en colonnes, cintres et pliés en blocs.' })),
        },
      ],
      selfAssessment: ['Je sais préparer et organiser une implantation.', 'Je sais analyser l’intérêt d’une nouvelle implantation.'],
    },

    /* ================================ APPLICATION 2 ================================ */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Gérer un linéaire à l’aide des indicateurs de gestion',
      guidance: 'autonome',
      hero: { id: 'd08-lessives', alt: 'Rayon de lessives en supermarché' },
      message: {
        from: 'Antoine Girard',
        role: 'Manager du rayon DPH, hypermarché Grand Marché',
        text: ['Tu es en stage au rayon Droguerie-Parfumerie-Hygiène. Je te confie le linéaire des lessives en poudre et liquides : décode son implantation et calcule ses indicateurs pour l’optimiser. Tu peux t’aider d’un tableur.'],
      },
      documents: [
        {
          id: 'd08-a2-doc1',
          number: 1,
          title: 'Linéaire des lessives',
          look: 'texte',
          blocks: [
            {
              type: 'facts',
              items: [
                ['Meubles', `2 meubles de ${fr(LESSIVE_MEUBLE.largeur)} m : meuble A « Poudres », meuble B « Liquides »`],
                ['Niveaux', `${LESSIVE_MEUBLE.niveaux} niveaux de ${LESSIVE_MEUBLE.hauteurNiveau} cm de haut et ${LESSIVE_MEUBLE.profondeur} cm de profondeur`],
                ['Niveau des yeux', 'Tablettes pour lave-vaisselle, lessives des grandes marques'],
                ['Niveau des mains', 'Lessives de la marque du magasin, produits en promotion'],
                ['Niveau des pieds', 'Barils de lessive en poudre (produits lourds), premiers prix'],
              ],
            },
            { type: 'note', text: `Baril de lessive « Clarté » : ${BARIL.hauteur} cm de haut, ${BARIL.largeur} cm de large, ${BARIL.profondeur} cm de profondeur. Il occupe tout le niveau 1 du meuble A.` },
          ],
        },
        {
          id: 'd08-a2-doc2',
          number: 2,
          title: 'Ventes du mois',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Meuble', 'Quantité vendue', 'PV moyen HT', 'Coût d’achat moyen HT'],
              align: ['left', 'right', 'right', 'right'],
              rows: LESSIVES.rows.map((r) => [r.name, String(r.qte), eur(r.pv), eur(r.cout)]),
            },
          ],
        },
        {
          id: "d08-revision-7-doc",
          number: 3,
          title: "Rééquilibrer un rayon de petite quincaillerie",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Gamme",
                "Linéaire actuel",
                "Marge sur 4 semaines",
                "Minimum imposé"
              ],
              rows: [
                [
                  "Poignées",
                  "4 m",
                  "240 €",
                  "3 m"
                ],
                [
                  "Charnières",
                  "2 m",
                  "300 €",
                  "2 m"
                ]
              ]
            },
            {
              type: "p",
              text: "Une modification du rayon doit conserver les 6 m au total. L’équipe veut effectuer un test sans supprimer de référence."
            }
          ]
        },
        {
          id: "d08-revision-dossier-doc1",
          number: 4,
          title: "Résultats sur deux semaines",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Famille",
                "Linéaire développé",
                "CA HT",
                "Marge",
                "Jours en rupture"
              ],
              rows: [
                [
                  "Sacs",
                  "2 m",
                  "1 200 €",
                  "480 €",
                  "0"
                ],
                [
                  "Ceintures",
                  "3 m",
                  "900 €",
                  "270 €",
                  "4 sur 14"
                ]
              ]
            },
            {
              type: "p",
              text: "Les ceintures ont vendu 30 unités sur dix jours disponibles. Prix moyen HT de 30 € et marge unitaire de 9 €."
            }
          ]
        },
        {
          id: "d08-revision-dossier-doc2",
          number: 5,
          title: "Contraintes d’implantation",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le plan conserve 5 m au total. Les sacs demandent au moins 2 m et les ceintures au moins 2,50 m. Le responsable peut déplacer 0,50 m et garantit un réassort des ceintures pendant le test."
            }
          ]
        },
        {
          id: "d08-revision-dossier-doc3",
          number: 6,
          title: "Premier résultat du test",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le test en 2,50 m par famille produit 525 € de marge sacs et 340 € de marge ceintures, sans rupture. Le rayon a accueilli 460 visiteurs pendant le test, contre 400 sur la période initiale."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd08-a2-a1',
          kind: 'fields',
          label: '1',
          title: 'Étudier le linéaire',
          instructions: 'Décode l’implantation et calcule les linéaires.',
          helps: ['Chaque meuble présente une famille du haut en bas.', 'Linéaire au sol = 2 × 1,33 ; LD d’un meuble = 1,33 × 5.', 'LD total = LD d’un meuble × 2.'],
          outcomeIds: R2,
          fields: [
            num('meubles', 'a. Nombre de meubles', 2, '2 meubles.'),
            num('niveaux', 'b. Nombre de niveaux', LESSIVE_MEUBLE.niveaux, `${LESSIVE_MEUBLE.niveaux} niveaux.`),
            { id: 'mode', label: 'c. Implantation', kind: 'choice', options: [{ value: 'verticale', label: 'Verticale (une famille par meuble)' }, { value: 'horizontale', label: 'Horizontale' }], answer: 'verticale', explain: 'Poudres d’un côté, liquides de l’autre, sur tous les niveaux.' },
            num('sol', 'd. Linéaire au sol total', LESSIVE_LIN.sol, `2 × 1,33 = ${fr(LESSIVE_LIN.sol)} ml.`, 'ml', 0.001),
            num('ldm', 'e. Linéaire développé d’un meuble', LESSIVE_LIN.ldMeuble, `1,33 × 5 = ${fr(LESSIVE_LIN.ldMeuble)} mld.`, 'mld', 0.001),
            num('ldt', 'f. Linéaire développé total', LESSIVE_LIN.ldTotal, `${fr(LESSIVE_LIN.ldMeuble)} × 2 = ${fr(LESSIVE_LIN.ldTotal)} mld.`, 'mld', 0.001),
          ],
        },
        {
          id: 'd08-a2-a2',
          kind: 'fields',
          label: '2',
          title: 'Capacité de stockage des barils « Clarté »',
          instructions: 'Calcule la capacité du niveau 1 du meuble A.',
          helps: ['Hauteur du niveau ÷ hauteur du baril, arrondi à l’inférieur.', `Largeur : ${LESSIVE_MEUBLE.largeur * 100} ÷ ${BARIL.largeur} ; profondeur : ${LESSIVE_MEUBLE.profondeur} ÷ ${BARIL.profondeur}.`, 'Capacité = hauteur × longueur × profondeur.'],
          outcomeIds: R2,
          fields: [
            num('h', 'Produits en hauteur', BARIL_CAP.h, `${LESSIVE_MEUBLE.hauteurNiveau} ÷ ${BARIL.hauteur} → ${BARIL_CAP.h}.`),
            num('l', 'Produits en longueur', BARIL_CAP.l, `${LESSIVE_MEUBLE.largeur * 100} ÷ ${BARIL.largeur} = ${fr((LESSIVE_MEUBLE.largeur * 100) / BARIL.largeur)} → ${BARIL_CAP.l}.`),
            num('p', 'Produits en profondeur', BARIL_CAP.p, `${LESSIVE_MEUBLE.profondeur} ÷ ${BARIL.profondeur} = ${fr(LESSIVE_MEUBLE.profondeur / BARIL.profondeur)} → ${BARIL_CAP.p}.`),
            num('cap', 'Capacité totale du niveau 1', BARIL_CAP.total, `${BARIL_CAP.h} × ${BARIL_CAP.l} × ${BARIL_CAP.p} = ${BARIL_CAP.total} barils.`),
          ],
        },
        rentaGrid('d08-a2-a3', '3', 'Rendement et rentabilité des deux meubles', LESSIVES, ['CA HT = quantité × PV moyen ; MB unitaire = PV − coût.', 'Rendement = CA ÷ LD ; rentabilité = MB ÷ LD.', `Meuble A : 120 × 11,20 = ${fr(LESSIVES.rows[0].ca)} €.`], R2, false),
        indicesGrid('d08-a2-a4', '4', LESSIVES, R23),
        {
          id: 'd08-a2-a5',
          kind: 'fields',
          label: '5',
          title: 'Conclure',
          instructions: 'Tire les conclusions de tes calculs.',
          helps: ['Compare chaque IM à 1.', 'La somme des LO doit rester égale au linéaire disponible (à peu près).', 'Les liquides se vendent mieux : ils méritent plus de place.'],
          outcomeIds: R23,
          fields: [
            ...LESSIVES.rows.map((r): Field => ({ id: `dec-${r.id}`, label: r.name, kind: 'choice', options: VERDICT_OPTIONS, answer: verdict(r.im), explain: `IM = ${fr(r.im, 4)} ; LO = ${fr(r.lo)} mld.` })),
            {
              id: 'logiciel',
              label: 'Avantages d’un logiciel de gestion des linéaires (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'calcul', label: 'Calculer automatiquement les indicateurs' },
                { value: 'planogramme', label: 'Produire et diffuser des planogrammes' },
                { value: 'ruptures', label: 'Réduire les ruptures et le temps passé au rayon' },
                { value: 'vendeur', label: 'Remplacer le contrôle du rayon par le personnel' },
              ],
              answers: ['calcul', 'planogramme', 'ruptures'],
              explain: 'Le contrôle en rayon reste nécessaire.',
            },
          ],
        },
        {
          id: "d08-revision-7",
          label: "Nouveau cas d’application",
          title: "Rééquilibrer un rayon de petite quincaillerie",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Vérifie la marge par mètre, puis utilise les minima pour borner le déplacement.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Poignées, 240 ÷ 4 = 60 € par mètre. Charnières, 300 ÷ 2 = 150 € par mètre."
          ],
          outcomeIds: [
            "d08-r2",
            "d08-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelles marges par mètre obtiens-tu ?",
              kind: "written",
              lines: 3,
              model: "Poignées, 240 ÷ 4 = 60 € par mètre. Charnières, 300 ÷ 2 = 150 € par mètre."
            },
            {
              id: "q2",
              label: "Propose le nouveau plan de répartition et la mesure à réaliser.",
              kind: "written",
              lines: 3,
              model: "Tester 3 m pour chaque gamme en gardant toutes les références. Au bout de quatre semaines comparables, mesurer la marge totale, les ruptures et le repérage des produits."
            }
          ]
        },
        {
          id: "d08-revision-dossier",
          label: "Dossier de décision",
          title: "Réviser un plan de rayon après une rupture qui fausse les ventes",
          instructions: "Lis les documents 4 et 5, puis écris ton diagnostic initial. Passe ensuite au document 6 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Calcule d’abord la marge par mètre observée, puis distingue l’estimation des ventes perdues et la mesure réelle du test.",
            "Pour comparer l’espace, divise la marge par les mètres. Pour estimer l’effet d’une rupture, utilise les ventes par jour disponible et indique que tu supposes un rythme identique.",
            "Exemple. 20 articles vendus en 5 jours disponibles donnent 4 par jour. Deux jours de rupture représentent 8 ventes possibles à ce rythme. Garde cette estimation séparée des ventes réellement comptées."
          ],
          outcomeIds: [
            "d08-r2",
            "d08-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Compare la productivité observée des deux familles.",
              kind: "written",
              lines: 6,
              model: "Sacs, 480 ÷ 2 = 240 € de marge par mètre. Ceintures, 270 ÷ 3 = 90 € par mètre. Les ceintures ont toutefois été indisponibles quatre jours."
            },
            {
              id: "q2",
              label: "Estime la marge des ceintures sans rupture et précise l’hypothèse.",
              kind: "written",
              lines: 6,
              model: "Au rythme de 3 unités par jour, quatre jours de plus représentent 12 unités et 108 € de marge. Estimation de 378 € au total, soit 126 € par mètre. Elle suppose une demande et des conditions comparables pendant les quatre jours."
            },
            {
              id: "q3",
              label: "Propose un test qui respecte les minima et préserve la lisibilité.",
              kind: "written",
              lines: 6,
              model: "Tester 2,50 m pour chaque famille. Maintenir les références et les repères de tailles, assurer le réassort des ceintures et relever marge, ruptures et fréquentation sur deux semaines."
            },
            {
              id: "q4",
              label: "Interprète les résultats sans attribuer toute la hausse au mobilier.",
              kind: "written",
              lines: 6,
              model: "La marge atteint 865 € contre 750 €, soit +115 €. La fréquentation a aussi augmenté de 15 % et la rupture a disparu. La marge par visite reste autour de 1,88 € sur les deux périodes, avec 750 ÷ 400 et 865 ÷ 460. Poursuivre sur des créneaux comparables avant de figer le plan."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais calculer les linéaires et la capacité de stockage.', 'Je sais utiliser les indices de sensibilité pour optimiser un linéaire.',
        "Je distingue résultat observé et estimation en l’absence de rupture.",
        "Je propose un plan qui respecte les minima d’implantation.",
        "Je tiens compte de la fréquentation dans l’interprétation des résultats."],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais appliquer la règle des 6 B.',
        'Je sais choisir un mode d’implantation et une technique de présentation.',
        'Je sais contrôler un rayon et proposer des remédiations.',
        'Je sais calculer les indicateurs de gestion du linéaire.',
        'Je sais calculer et interpréter les indices de sensibilité.',
      ],
    },
  ],
};
