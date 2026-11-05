import type { Chapter, Field, GridActivity } from '../../domain/chapter';

/**
 * DOSSIER 3 — Gérer les stocks
 *
 * Progression calquée sur le manuel de référence (contexte, 5 missions, synthèse, 4 applications).
 * Magasins, marques, personnages, documents et chiffres : ORIGINAUX et fictifs.
 * Tous les résultats chiffrés sont calculés ici, à partir des données, puis testés.
 */

const R1 = ['d03-r1']; // L'état des stocks est correctement renseigné et analysé.
const R2 = ['d03-r2']; // Les stocks sont optimisés.
const R12 = ['d03-r1', 'd03-r2'];
const OUI_NON = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];
export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/* =============================== Mission 2 : événements =============================== */

export const EVENT_STOCK = [
  { id: 'riz', ref: 'VR 156', name: 'Riz basmati', dispo: 4, max: 12, alerte: 4 },
  { id: 'pois', ref: 'VR 157', name: 'Pois chiches', dispo: 7, max: 10, alerte: 3 },
  { id: 'quinoa', ref: 'VR 158', name: 'Quinoa blanc', dispo: 6, max: 10, alerte: 4 },
  { id: 'avoine', ref: 'VR 159', name: 'Flocons d’avoine', dispo: 0, max: 9, alerte: 3 },
].map((x) => {
  const nouvelle = x.alerte + 2;
  const commande = x.dispo <= nouvelle ? x.max - x.dispo : 0;
  return { ...x, nouvelle, commande };
});
export const ANIMATION = { moyenne: 3.5, jours: 2, multiplicateur: 3, degustation: 2 };
export const ANIMATION_EXTRA = (ANIMATION.multiplicateur - 1) * ANIMATION.moyenne * ANIMATION.jours + ANIMATION.degustation * ANIMATION.jours;

/* =============================== Mission 3 : CUMP =============================== */

interface HygRow { ref: string; name: string; qte: number; pa: number; uc?: number; colis?: number; paIn?: number }
export const HYGIENE: HygRow[] = [
  { ref: 'BV101', name: 'Gel douche Thé vert 1 L', qte: 6, pa: 9.71, uc: 4, colis: 2, paIn: 9.69 },
  { ref: 'BV102', name: 'Gel douche Karité 1 L', qte: 7, pa: 9.71 },
  { ref: 'BV103', name: 'Gel douche Verveine 1 L', qte: 4, pa: 9.71 },
  { ref: 'BV104', name: 'Gel douche Miel 1 L', qte: 3, pa: 9.63, uc: 4, colis: 2, paIn: 9.65 },
  { ref: 'BV105', name: 'Gel douche Mangue 1 L', qte: 1, pa: 9.74, uc: 4, colis: 3, paIn: 9.73 },
  { ref: 'BV106', name: 'Gel douche Agrumes 1 L', qte: 7, pa: 9.74 },
  { ref: 'BV107', name: 'Gel douche Thé vert 300 ml', qte: 2, pa: 3.35, uc: 6, colis: 2, paIn: 3.34 },
  { ref: 'BV108', name: 'Gel douche Karité 300 ml', qte: 0, pa: 3.35, uc: 6, colis: 3, paIn: 3.35 },
  { ref: 'BV109', name: 'Gel douche Verveine 300 ml', qte: 1, pa: 3.35, uc: 6, colis: 2, paIn: 3.34 },
  { ref: 'BV110', name: 'Gel douche Miel 300 ml', qte: 5, pa: 3.34, uc: 6, colis: 1, paIn: 3.32 },
  { ref: 'BV111', name: 'Gel douche Mangue 300 ml', qte: 6, pa: 3.37 },
  { ref: 'BV112', name: 'Gel douche Agrumes 300 ml', qte: 2, pa: 3.37, uc: 6, colis: 3, paIn: 3.35 },
];
export function cumpRow(h: HygRow) {
  const montant = r2(h.qte * h.pa);
  const qIn = (h.uc ?? 0) * (h.colis ?? 0);
  const montantIn = r2(qIn * (h.paIn ?? 0));
  const total = r2(montant + montantIn);
  const cump = qIn + h.qte ? r2(total / (h.qte + qIn)) : h.pa;
  return { montant, qIn, montantIn, total, cump };
}
export const HYG_TOTAL_AVANT = r2(HYGIENE.reduce((n, h) => n + cumpRow(h).montant, 0));
export const HYG_TOTAL_APRES = r2(HYGIENE.reduce((n, h) => n + cumpRow(h).total, 0));

/* =============================== Mission 4 : rotation =============================== */

export const CHOCOLATS = [
  { id: 'eq', name: 'Chocolat noir 80 % Équateur', si: 18, l: [114, 102, 108], v: [125, 98, 107], answer: ['augmenter'] },
  { id: 'am', name: 'Chocolat noir fruits d’Amazonie', si: 20, l: [20, 14, 16], v: [22, 18, 20], answer: ['diminuer', 'promo'] },
  { id: 'mu', name: 'Chocolat noir muesli', si: 3, l: [16, 15, 16], v: [13, 16, 16], answer: ['satisfaisant'] },
  { id: 'af', name: 'Chocolat noir fruits d’Afrique', si: 3, l: [39, 44, 42], v: [38, 42, 40], answer: ['augmenter'] },
].map((c) => {
  const si = [c.si];
  for (let m = 0; m < 3; m++) si.push(si[m] + c.l[m] - c.v[m]);
  const sf = si[3];
  const ventes = c.v.reduce((a, b) => a + b, 0);
  const moyen = (c.si + sf) / 2;
  const coef = r2(ventes / moyen);
  const duree = r2(90 / (ventes / moyen));
  return { ...c, siMois: si.slice(0, 3), sf, ventes, moyen, coef, duree };
});
export const PRECO_CHOCO = 8;

/* =============================== Mission 5 : 20/80 =============================== */

export const LEGUMES: Array<[string, number]> = [
  ['Artichauts', 149.2], ['Asperges', 336.4], ['Brocolis', 318.8], ['Tomates', 7860.4], ['Épinards', 141.7],
  ['Salades', 498], ['Poivrons', 470.1], ['Champignons', 169.9], ['Radis', 204.6], ['Pommes de terre', 6120],
  ['Choux-fleurs', 181.3], ['Concombres', 712.3], ['Courgettes', 2248.9], ['Carottes', 2735.6], ['Aubergines', 431.7],
  ['Haricots verts', 566.2], ['Navets', 58.6], ['Petits pois', 89.4], ['Poireaux', 402.5], ['Oignons', 152.4],
];
export const LEG_TOTAL = r2(LEGUMES.reduce((n, [, v]) => n + v, 0));
export const LEG_SORTED = [...LEGUMES]
  .sort((a, b) => b[1] - a[1])
  .map(([name, ca], i, arr) => {
    const cumCa = arr.slice(0, i + 1).reduce((n, [, v]) => n + v, 0);
    return { name, ca, partRef: 5, cumRef: (i + 1) * 5, partCa: r2((ca / LEG_TOTAL) * 100), cumCa: r2((cumCa / LEG_TOTAL) * 100) };
  });

/* =============================== Applications =============================== */

export const GLACE = { ventesJour: 15, joursSecu: 1, delai: 2 };
export const GLACE_NIV = (() => {
  const secu = GLACE.ventesJour * GLACE.joursSecu;
  const mini = GLACE.ventesJour * GLACE.delai;
  const alerte = mini + secu;
  return { secu, mini, alerte, max: alerte * 2 };
})();
export const GLACES = [
  { id: 'dc', name: 'Banquise Double chocolat', uc: 10, dispo: 36, max: 80, alerte: 40 },
  { id: 'cl', name: 'Banquise Classique', uc: 10, dispo: 54, max: 100, alerte: 50 },
  { id: 'va', name: 'Banquise Vanille amandes', uc: 10, dispo: 0, max: 70, alerte: 35 },
  { id: 'cb', name: 'Banquise Chocolat blanc', uc: 10, dispo: 25, max: 50, alerte: 25 },
  { id: 'mi', name: 'Assortiment 6 mini Banquise', uc: 8, dispo: 49, max: 100, alerte: 50 },
].map((g) => ({ ...g, commande: g.dispo <= g.alerte, cartons: g.dispo <= g.alerte ? Math.floor((g.max - g.dispo) / g.uc) : 0 }));

export const LINGE = [
  { id: 'parures', cat: 'Chambre', name: 'Parures de lit', moyen: 40, ventes: 240, preco: 80 },
  { id: 'housses', cat: 'Chambre', name: 'Housses de couette', moyen: 30, ventes: 120, preco: 80 },
  { id: 'bain', cat: 'Salle de bains', name: 'Ensembles de bain', moyen: 25, ventes: 120, preco: 75 },
  { id: 'peignoirs', cat: 'Salle de bains', name: 'Peignoirs', moyen: 18, ventes: 54, preco: 75 },
  { id: 'table', cat: 'Cuisine', name: 'Linge de table', moyen: 20, ventes: 80, preco: 90 },
  { id: 'cuisine', cat: 'Cuisine', name: 'Linge de cuisine', moyen: 15, ventes: 100, preco: 90 },
].map((x) => {
  const coef = r2(x.ventes / x.moyen);
  const duree = r2(360 / (x.ventes / x.moyen));
  const verdict = Math.abs(duree - x.preco) < 0.5 ? 'ok' : duree > x.preco ? 'surstock' : 'rupture';
  return { ...x, coef, duree, verdict };
});

export const SPORT = [
  ['Accessoires', 26, 296],
  ['Casquettes', 23, 514],
  ['Joggings', 11, 498],
  ['Polos', 19, 522],
  ['Shorts', 16, 878],
  ['Sous-vêtements', 26, 339],
  ['Sweats à capuche', 29, 8650],
  ['T-shirts manches courtes', 43, 889],
  ['T-shirts manches longues', 33, 769],
  ['Vestes', 22, 10980],
] as Array<[string, number, number]>;
export const SPORT_REFS = SPORT.reduce((n, x) => n + x[1], 0);
export const SPORT_VAL = SPORT.reduce((n, x) => n + x[2], 0);
export const SPORT_SORTED = [...SPORT]
  .sort((a, b) => b[2] - a[2])
  .map(([name, refs, val], i, arr) => {
    const cumRefs = arr.slice(0, i + 1).reduce((n, x) => n + x[1], 0);
    const cumVal = arr.slice(0, i + 1).reduce((n, x) => n + x[2], 0);
    return { name, refs, val, partRef: r2((refs / SPORT_REFS) * 100), cumRef: r2((cumRefs / SPORT_REFS) * 100), partVal: r2((val / SPORT_VAL) * 100), cumVal: r2((cumVal / SPORT_VAL) * 100) };
  });

/** Application 4 : casque audio, méthode du CUMP après chaque entrée et en fin de période. */
export const CASQUE = (() => {
  const s0 = { q: 5, pu: 122 };
  let q = s0.q;
  let cump = s0.pu;
  const steps: Array<{ date: string; libelle: string; entree?: number; pu?: number; sortie?: number; q: number; cump: number; valeur: number }> = [];
  const push = (date: string, libelle: string, o: { entree?: number; pu?: number; sortie?: number }) => {
    if (o.entree) {
      cump = r2((q * cump + o.entree * o.pu!) / (q + o.entree));
      q += o.entree;
    }
    if (o.sortie) q -= o.sortie;
    steps.push({ date, libelle, ...o, q, cump, valeur: r2(q * cump) });
  };
  steps.push({ date: '01/06', libelle: 'Stock initial', q, cump, valeur: r2(q * cump) });
  push('06/06', 'Livraison commande du 4/06', { entree: 4, pu: 126 });
  push('08/06', 'Vente', { sortie: 4 });
  push('11/06', 'Vente — rupture', { sortie: 5 });
  push('12/06', 'Livraison commande du 9/06', { entree: 7, pu: 124 });
  push('14/06', 'Vente', { sortie: 1 });
  push('20/06', 'Vente', { sortie: 2 });
  push('24/06', 'Livraison commande du 22/06', { entree: 3, pu: 125 });
  push('29/06', 'Vente', { sortie: 2 });
  const entreesQ = 5 + 4 + 7 + 3;
  const cumpFin = r2((5 * 122 + 4 * 126 + 7 * 124 + 3 * 125) / entreesQ);
  const final = steps[steps.length - 1];
  const ventes = 4 + 5 + 1 + 2 + 2;
  const moyen = (5 + final.q) / 2;
  const coef = r2(ventes / moyen);
  return { steps, cumpFin, valeurFin: r2(final.q * cumpFin), final, ventes, moyen, coef, duree: r2(30 / (ventes / moyen)) };
})();

/* ==================================== CHAPITRE ==================================== */

const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });

const CUMP_GRID: GridActivity = {
  id: 'd03-m3-a2',
  kind: 'grid',
  label: 'Annexe 2',
  title: 'Valorisation du stock de gels douche Bulle Verte (méthode du CUMP)',
  instructions: 'Pour chaque référence, calcule le montant du stock, la quantité et le montant entrés, la valeur totale et le nouveau coût unitaire moyen pondéré. Arrondis au centime. La première ligne est donnée en exemple.',
  helps: [
    'Montant = quantité × prix d’achat HT. Quantité entrée = nombre de cartons livrés × unités par carton (UC).',
    'Valeur totale = montant du stock + montant de l’entrée. CUMP = valeur totale ÷ (quantité en stock + quantité entrée).',
    'Sans entrée, la valeur totale est le montant du stock et le CUMP reste le prix d’achat. BV104 : 3 × 9,63 = 28,89 ; 8 × 9,65 = 77,20 ; 106,09 ÷ 11 = 9,64.',
  ],
  outcomeIds: R1,
  groups: [
    { label: 'État au 10/10', columns: ['Qté', 'PA HT', 'Montant'] },
    { label: 'Entrée du 10/10', columns: ['Qté', 'PA HT', 'Montant'] },
    { label: 'Après entrée', columns: ['Valeur', 'CUMP'] },
  ],
  rows: HYGIENE.map((h, i) => {
    const c = cumpRow(h);
    const ex = i === 0;
    const cell = (answer: number, explain: string) => (ex ? answer : { answer, explain, tolerance: 0.011 });
    return {
      id: h.ref,
      label: `${h.ref} — ${h.name}`,
      cells: [
        h.qte,
        h.pa,
        cell(c.montant, `${h.qte} × ${fr(h.pa)} = ${fr(c.montant)} €.`),
        ex ? c.qIn : { answer: c.qIn, explain: h.colis ? `${h.colis} carton(s) × ${h.uc} = ${c.qIn} unités.` : 'Pas de livraison pour cette référence : 0.' },
        h.paIn ?? '—',
        cell(c.montantIn, h.colis ? `${c.qIn} × ${fr(h.paIn!)} = ${fr(c.montantIn)} €.` : 'Pas d’entrée : 0 €.'),
        cell(c.total, `${fr(c.montant)} + ${fr(c.montantIn)} = ${fr(c.total)} €.`),
        cell(c.cump, c.qIn ? `${fr(c.total)} ÷ (${h.qte} + ${c.qIn}) = ${fr(c.cump)} €.` : `Pas d’entrée : le CUMP reste ${fr(h.pa)} €.`),
      ],
    };
  }),
  legend: 'Valeur = montant du stock + montant de l’entrée · CUMP = valeur ÷ quantité totale',
};

export const D03: Chapter = {
  unitId: 'd03',
  mission: "À La Coop’Verte, plusieurs références se vendent vite le week-end et d’autres occupent la réserve depuis des semaines. Ta responsable te demande de reconstituer les mouvements, d’évaluer les stocks et de proposer un rythme de suivi proportionné à la valeur de chaque produit.",
  fictionNotice:
    'La Coop’Verte d’Ussel, le réseau Coop’Verte et les autres entreprises de ce dossier (Banquise, Lin & Coton, Kiosk’Sport, Voltéo) sont fictifs. Données créées pour Rayon.',
  company: {
    name: 'La Coop’Verte — Ussel',
    tagline: 'Magasin bio coopératif, 500 m²',
    facts: [
      ['Ton poste', 'Élève en PFMP, réserve et épicerie'],
      ['Ton tuteur', 'Antoine Morel, directeur'],
      ['Tes collègues', 'Yanis Ferreira (chef du rayon épicerie), Clara Petit (gestionnaire des stocks)'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Réduire les ruptures sans gonfler la réserve",
      hero: { id: 'd03-hero', alt: 'Cliente remplissant un sachet kraft à un distributeur de produits en vrac' },
      message: {
        from: 'Antoine Morel',
        role: 'Directeur, La Coop’Verte Ussel',
        text: [
          'Bienvenue à La Coop’Verte ! Nous sommes l’un des 350 magasins du réseau Coop’Verte, qui défend une agriculture biologique durable et un commerce équitable.',
          'Je veux te sensibiliser à l’importance d’une gestion des stocks rigoureuse. Regarde d’abord ce que nous avons publié cet été sur notre page Facebook.',
        ],
      },
      documents: [
        {
          id: "d03-revision-reperes",
          number: 3,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Le stock théorique vient des écritures. Le stock physique se compte. Le stock disponible tient aussi compte des articles bloqués ou déjà promis.",
                "Le seuil d’alerte déclenche une vérification de réassort. Il combine les ventes prévues pendant le délai et la sécurité retenue.",
                "Le coût unitaire moyen pondéré, ou CUMP, est le coût total des unités disponibles divisé par leur nombre."
              ]
            }
          ]
        },
        {
          id: 'd03-o-doc1',
          number: 1,
          title: 'Le réseau Coop’Verte',
          look: 'article',
          blocks: [
            {
              type: 'p',
              text: 'Coop’Verte est une coopérative qui réunit 350 magasins indépendants, leurs salariés, des groupements de producteurs et des clients sociétaires. Chaque magasin est une entreprise autonome — à Ussel, une SAS — qui adhère à la coopérative et partage ses engagements.',
            },
            {
              type: 'list',
              title: 'Nos engagements sur l’approvisionnement',
              items: [
                '100 % de produits alimentaires bio, quelques références non alimentaires (hygiène, entretien).',
                'Priorité aux produits locaux et aux filières équitables françaises.',
                'Aucun produit transporté par avion.',
              ],
            },
            {
              type: 'facts',
              items: [
                ['Magasin', 'La Coop’Verte, route de Clermont, 19200 Ussel — grande surface spécialisée de 500 m²'],
                ['Concurrents', 'Autres magasins bio de la région, rayons bio des hypermarchés'],
                ['Approvisionnement', 'Plateforme logistique régionale du réseau, et producteurs locaux en direct'],
              ],
            },
          ],
        },
        {
          id: 'd03-o-doc2',
          number: 2,
          title: 'Publication Facebook du 6 août',
          look: 'memo',
          blocks: [
            {
              type: 'quote',
              author: 'La Coop’Verte Ussel — 6 août, 14 h 25',
              text: 'Notre plateforme régionale a subi des inondations et nous rencontrons des problèmes d’approvisionnement sur certaines références. Quelques produits frais sont en rupture de stock. Veuillez nous excuser pour la gêne occasionnée : tout le réseau se mobilise pour vous proposer très vite tous vos produits 100 % bio.',
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd03-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'Un magasin indépendant qui adhère à une coopérative relève du commerce associé.', 'Engagement : 100 % bio, local, pas d’avion.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['La Coop’Verte', 'Coop’Verte', 'La Coop Verte', 'Coop Verte', 'La CoopVerte', 'CoopVerte'], placeholder: 'Nom', explain: 'La Coop’Verte (réseau Coop’Verte).' },
            {
              id: 'activite',
              label: 'Activité',
              kind: 'choice',
              options: [
                { value: 'bio', label: 'Vente de produits alimentaires bio et de quelques produits non alimentaires' },
                { value: 'prod', label: 'Production agricole biologique' },
                { value: 'resto', label: 'Restauration bio' },
              ],
              answer: 'bio',
              explain: 'Document 1, engagement n° 1.',
            },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'associe', label: 'Commerce associé (coopérative)' }, { value: 'integre', label: 'Commerce intégré' }, { value: 'isole', label: 'Commerce indépendant isolé' }], answer: 'associe', explain: 'Un magasin indépendant adhérent d’une coopérative : commerce associé.' },
            { id: 'forme', label: 'Forme juridique', kind: 'given', value: 'SAS' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Ussel', 'route de Clermont Ussel', 'Ussel Corrèze'], placeholder: 'Ville', explain: 'Route de Clermont, 19200 Ussel.' },
            { id: 'conc', label: 'Concurrents', kind: 'given', value: 'Autres magasins bio de la région, rayons bio des hypermarchés' },
            {
              id: 'engagement',
              label: 'Engagement sur l’approvisionnement (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'bio', label: '100 % d’alimentaire bio' },
                { value: 'local', label: 'Priorité au local et à l’équitable' },
                { value: 'avion', label: 'Aucun transport par avion' },
                { value: 'prix', label: 'Les prix les plus bas du marché' },
              ],
              answers: ['bio', 'local', 'avion'],
              explain: 'Le prix le plus bas n’est pas un engagement du réseau.',
            },
          ],
        },
        {
          id: 'd03-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Analyser la publication du 6 août',
          instructions: 'Réponds à l’aide du document 2.',
          helps: ['Le problème vient d’en amont du magasin.', 'Sans livraison, le rayon se vide.', 'Prévenir les clients évite qu’ils se croient oubliés et préserve la confiance.'],
          outcomeIds: R12,
          fields: [
            { id: 'pb', label: '1. Quel problème le magasin rencontre-t-il ?', kind: 'choice', options: [{ value: 'a', label: 'Sa plateforme d’approvisionnement est inondée : certaines livraisons n’arrivent pas.' }, { value: 'b', label: 'Le magasin a commandé trop de produits.' }, { value: 'c', label: 'Les clients ne viennent plus.' }], answer: 'a', explain: 'Un aléa extérieur bloque l’approvisionnement.' },
            { id: 'cons', label: '2. Quelle conséquence sur les produits en magasin ?', kind: 'choice', options: [{ value: 'rupture', label: 'Des ruptures de stock' }, { value: 'surstock', label: 'Du surstockage' }, { value: 'promo', label: 'Des promotions' }], answer: 'rupture', explain: 'Des produits frais sont en rupture.' },
            {
              id: 'utilite',
              label: '3. Quelle est l’utilité de publier cette information ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'informer', label: 'Informer les clients avant qu’ils ne se déplacent' },
                { value: 'image', label: 'Préserver la confiance et l’image du magasin' },
                { value: 'excuser', label: 'S’excuser et montrer que le réseau agit' },
                { value: 'vendre', label: 'Vendre plus de produits frais' },
              ],
              answers: ['informer', 'image', 'excuser'],
              explain: 'La transparence limite la déception et fidélise.',
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
      title: 'Découvrir les indicateurs de gestion des stocks',
      guidance: 'guidé',
      message: {
        from: 'Antoine Morel',
        role: 'Directeur',
        text: [
          'Notre rayon vrac en libre-service plaît beaucoup, avec ses 240 références. Il demande, plus que les autres, une vigilance quotidienne sur les quantités en stock, en magasin comme en réserve. Notre logiciel suit chaque référence.',
          'Je t’ai laissé un mémo (document 1). Analyse ensuite la fiche de stock de la semoule en vrac (document 2), que nous achetons en sacs de 5 kg, et complète l’annexe.',
        ],
      },
      documents: [
        {
          id: 'd03-m1-doc1',
          number: 1,
          title: 'Mémo : les indicateurs de gestion des stocks',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'La fiche de stock suit, pour une référence, les mouvements de marchandises : les entrées (livraisons) et les sorties (ventes). Le stock initial est la quantité présente en début de période.' },
            {
              type: 'table',
              head: ['Indicateur', 'Définition'],
              rows: [
                ['Stock maximum', 'Quantité à ne pas dépasser, pour éviter le surstockage (place, argent immobilisé, dates).'],
                ['Stock minimum', 'Quantité qui couvre les ventes pendant le délai de livraison.'],
                ['Stock de sécurité', 'Quantité ajoutée au stock minimum pour faire face à un imprévu : retard de livraison, hausse des ventes.'],
                ['Stock d’alerte (seuil de réapprovisionnement)', 'Niveau qui déclenche la commande.'],
              ],
            },
            { type: 'formula', text: 'Stock d’alerte = stock minimum + stock de sécurité\nQuantité à commander = stock maximum − stock disponible' },
          ],
        },
        {
          id: 'd03-m1-doc2',
          number: 2,
          title: 'Fiche de stock — semoule de blé complète en vrac',
          look: 'fiche',
          blocks: [
            {
              type: 'facts',
              items: [
                ['Rayon', 'Vrac'],
                ['Fournisseur', 'Plateforme logistique Coop’Verte Centre'],
                ['Référence', 'VR 241'],
                ['Unité de conditionnement', 'sac de 5 kg'],
                ['Délai de livraison', '1 semaine'],
                ['Ventes moyennes', '10 kg par semaine'],
                ['Stock maximum', '8 sacs'],
                ['Stock minimum', '2 sacs'],
                ['Stock de sécurité', '1 sac'],
                ['Stock d’alerte', '3 sacs'],
              ],
            },
            {
              type: 'table',
              head: ['Date', 'Opération', 'Entrée', 'Sortie', 'Stock'],
              align: ['left', 'left', 'right', 'right', 'right'],
              rows: [
                ['03/09', 'Stock initial — commande de 5 sacs passée', '', '', '3'],
                ['05/09', 'Sortie', '', '1', '2'],
                ['10/09', 'Entrée', '5', '', '7'],
                ['11/09', '?', '', '', ''],
              ],
            },
          ],
        },
        {
          id: 'd03-m1-doc3',
          number: 3,
          title: 'Nous sommes le 11 septembre',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Mme Ndiaye, cliente restauratrice : « Bonjour, je vais vous prendre 4 sacs de semoule pour mon restaurant. »' }],
        },
        {
          id: "d03-revision-1-doc",
          number: 4,
          title: "Déclencher une alerte de réassort",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le savon Atelier se vend en moyenne à 6 unités par jour. Le délai de livraison est de 4 jours. Le magasin garde une sécurité de 8 unités. Il reste 31 unités utilisables et aucune réception confirmée."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd03-m1-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Analyse de la fiche de stock de la semoule en vrac',
          instructions: 'Réponds aux questions à l’aide des documents 1 et 2. Une semaine compte 6 jours ouvrables.',
          helps: [
            'Lis la fiche ligne par ligne : une sortie est une vente, une entrée une livraison.',
            'Stock minimum = ventes pendant le délai : 10 kg = 2 sacs. Ventes par jour = 10 kg ÷ 6 jours. Le stock de sécurité (1 sac = 5 kg) couvre 5 ÷ (10 ÷ 6) jours.',
            'Le 03/09, le stock (3) égale le stock d’alerte : on commande 8 − 3 = 5 sacs, livrés une semaine plus tard, le 10/09.',
          ],
          outcomeIds: R12,
          fields: [
            num('q1', '1. Quantité de semoule en stock le 3 septembre (en sacs)', 3, 'Stock initial : 3 sacs.', 'sacs'),
            num('q2', '2. Quantité vendue entre le 3 et le 10 septembre (en sacs)', 1, 'Une sortie de 1 sac le 05/09.', 'sacs'),
            { id: 'q2b', label: '2. À quel mouvement de stock cela correspond-il ?', kind: 'choice', options: [{ value: 'sortie', label: 'Une sortie de stock' }, { value: 'entree', label: 'Une entrée en stock' }], answer: 'sortie', explain: 'Une vente est une sortie de stock.' },
            { id: 'q3', label: '3. Que s’est-il passé le 10 septembre ?', kind: 'choice', options: [{ value: 'livraison', label: 'La livraison de la commande passée le 3/09 (entrée de 5 sacs)' }, { value: 'vente', label: 'Une vente de 5 sacs' }, { value: 'inventaire', label: 'Un inventaire' }], answer: 'livraison', explain: 'Entrée de 5 sacs : la commande du 03/09 est livrée une semaine plus tard.' },
            num('q4', '4. Niveau de stock à ne pas dépasser (en sacs)', 8, 'Stock maximum : 8 sacs, pour éviter le surstockage.', 'sacs'),
            num('q5', '5. Stock minimum, en kg, pour un délai d’une semaine', 10, 'Il couvre les ventes pendant le délai : 10 kg, soit 2 sacs.', 'kg'),
            num('q6', '6. Nombre de jours de vente couverts par le stock de sécurité', 3, '1 sac = 5 kg ; ventes = 10 ÷ 6 = 1,67 kg par jour ; 5 ÷ 1,67 ≈ 3 jours.', 'jours', 0.01),
            { id: 'q7', label: '7. Intérêt du stock de sécurité', kind: 'choice', options: [{ value: 'a', label: 'Faire face à un imprévu (retard de livraison, hausse des ventes) sans rupture' }, { value: 'b', label: 'Remplir la réserve au maximum' }, { value: 'c', label: 'Obtenir une remise du fournisseur' }], answer: 'a', explain: 'C’est une marge contre les aléas.' },
            { id: 'q8', label: '8. Comment le stock d’alerte a-t-il été déterminé ?', kind: 'choice', options: [{ value: 'a', label: 'Stock minimum + stock de sécurité = 2 + 1 = 3' }, { value: 'b', label: 'Stock maximum − stock minimum = 6' }, { value: 'c', label: 'Ventes de la semaine + 1 = 3' }], answer: 'a', explain: 'Stock d’alerte = stock minimum + stock de sécurité.' },
            num('q10', '10. Stock après la vente du 11/09 (en sacs)', 3, '7 − 4 = 3 sacs.', 'sacs'),
            { id: 'q11', label: '11. Quelle décision prendre ?', kind: 'choice', options: [{ value: 'commander', label: 'Commander, car le stock a atteint le stock d’alerte' }, { value: 'attendre', label: 'Attendre que le stock soit à 0' }, { value: 'rien', label: 'Rien, le stock est suffisant' }], answer: 'commander', explain: '3 sacs = stock d’alerte : on déclenche la commande.' },
            num('q11b', '11. Quantité à commander (en sacs)', 5, '8 − 3 = 5 sacs.', 'sacs'),
            { id: 'q11c', label: '11. Date de la livraison', kind: 'choice', options: [{ value: '12', label: '12 septembre' }, { value: '18', label: '18 septembre' }, { value: '25', label: '25 septembre' }], answer: '18', explain: 'Une semaine après le 11 : le 18 septembre.' },
          ],
        },
        {
          id: "d03-revision-1",
          label: "Annexe complémentaire",
          title: "Déclencher une alerte de réassort",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Le stock d’alerte additionne la consommation pendant le délai et la sécurité.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "6 × 4 + 8 = 32 unités."
          ],
          outcomeIds: [
            "d03-r1",
            "d03-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Calcule le stock d’alerte.",
              kind: "number",
              answer: 32,
              explain: "6 × 4 + 8 = 32 unités."
            },
            {
              id: "q2",
              label: "Quelle action prends-tu et quel événement pourrait modifier ta décision ?",
              kind: "written",
              lines: 3,
              model: "Je déclenche l’alerte à 31 unités, sous le seuil de 32. Une livraison confirmée et suffisamment proche modifierait le besoin, après vérification de sa date et de sa quantité."
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
      title: 'Surveiller les variations de stocks',
      guidance: 'guidé',
      message: {
        from: 'Antoine Morel',
        role: 'Directeur',
        text: [
          'Nous informons nos clients de tous les événements du magasin sur notre page Facebook. Ces publications sont très suivies et pèsent sur nos ventes : il faut anticiper les variations de stock et bien réagir face aux imprévus.',
          'Découvre les événements récents (document 1) et propose les actions à prévoir dans l’annexe.',
        ],
      },
      documents: [
        {
          id: 'd03-m2-doc1',
          number: 1,
          title: 'Publications sur la page Facebook du magasin',
          look: 'memo',
          blocks: [
            { type: 'quote', author: 'La Coop’Verte Ussel — 18 septembre', text: 'Sociétaires, profitez de votre avantage : −10 % sur tout votre panier, le jour de votre choix, du 1er au 31 octobre !' },
            { type: 'quote', author: 'La Coop’Verte Ussel — 20 septembre', text: 'Connaissez-vous les pâtes à l’épeautre de la Ferme du Plateau ? Rencontrez la productrice, qui vous expliquera leur fabrication et vous donnera des idées de recettes. Dégustation vendredi et samedi !' },
            { type: 'quote', author: 'La Coop’Verte Ussel — 9 octobre', text: 'Les nouvelles confitures des Vergers de la Diège (mirabelle, quetsche, fraise-rhubarbe) ont rencontré un tel succès que nous sommes en rupture de stock. Notre producteur fait tout pour nous réapprovisionner très vite !' },
          ],
        },
        {
          id: 'd03-m2-doc2',
          number: 2,
          title: 'Consignes de Yanis, chef du rayon épicerie',
          look: 'courriel',
          blocks: [
            { type: 'p', text: 'Événement 1 — L’opération sociétaires commence dans une semaine. Il faut augmenter les stocks de sécurité de 2 unités pour chaque référence, donc relever les stocks d’alerte d’autant. Mets à jour l’extrait du logiciel et dis-moi si je dois commander, et combien (jusqu’au stock maximum).' },
            { type: 'p', text: 'Événement 2 — Une animation triple en moyenne les ventes habituelles du produit. Pour la dégustation, prévois 2 paquets de plus par jour. L’animation dure 2 jours. Je ne peux pas suivre les indicateurs habituels : calcule la commande exceptionnelle. Ventes moyennes : 3,5 paquets par jour.' },
          ],
        },
        {
          id: "d03-revision-2-doc",
          number: 3,
          title: "Reconstituer un stock après une sortie oubliée",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Journal des gourdes réutilisables. Stock lundi matin 54. Livraison mardi 24. Ventes de lundi à mercredi 35. Mercredi, 3 unités cassées ont été retirées, sans mouvement informatique. Comptage jeudi matin 40."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd03-m2-a1',
          kind: 'fields',
          layout: 'columns',
          columns: ['Nouveau stock d’alerte', 'Commander ?', 'Quantité'],
          label: 'Événement 1',
          title: 'L’opération sociétaires « −10 % » — état des stocks au 23 septembre',
          instructions: 'Pour chaque référence, calcule le nouveau stock d’alerte, décide s’il faut commander et combien (jusqu’au stock maximum).',
          helps: [
            'Nouveau stock d’alerte = ancien + 2.',
            'On commande si le stock disponible est inférieur ou égal au nouveau stock d’alerte. Quantité = stock maximum − stock disponible.',
            'Riz : 4 + 2 = 6 ; 4 ≤ 6 → commander 12 − 4 = 8.',
          ],
          outcomeIds: R2,
          fields: EVENT_STOCK.flatMap((x) => {
            const label = `${x.ref} — ${x.name} (dispo ${x.dispo}, max ${x.max}, alerte ${x.alerte})`;
            return [
              { id: `${x.id}.0`, label, kind: 'number' as const, answer: x.nouvelle, explain: `${x.alerte} + 2 = ${x.nouvelle}.` },
              { id: `${x.id}.1`, label, kind: 'choice' as const, options: OUI_NON, answer: x.commande ? 'oui' : 'non', explain: x.commande ? `${x.dispo} ≤ ${x.nouvelle} : il faut commander.` : `${x.dispo} > ${x.nouvelle} : pas de commande.` },
              { id: `${x.id}.2`, label, kind: 'number' as const, answer: x.commande, explain: x.commande ? `${x.max} − ${x.dispo} = ${x.commande}.` : 'Pas de commande : 0.' },
            ];
          }),
        },
        {
          id: 'd03-m2-a2',
          kind: 'fields',
          label: 'Événement 2',
          title: 'Animation « pâtes à l’épeautre »',
          instructions: 'Calcule la quantité à commander en plus pour l’animation.',
          helps: ['Les ventes sont multipliées par 3 : le supplément par jour est de 2 fois les ventes habituelles.', 'Ajoute les 2 paquets de dégustation par jour, sur 2 jours.', `(3 − 1) × 3,5 × 2 = 14 ; + 2 × 2 = 4 ; total ${ANIMATION_EXTRA}.`],
          outcomeIds: R2,
          fields: [
            num('ventes', 'Ventes pendant l’animation (paquets par jour)', ANIMATION.moyenne * ANIMATION.multiplicateur, '3,5 × 3 = 10,5 paquets par jour.', 'paquets', 0.01),
            num('extra', 'Quantité à commander en plus pour l’animation', ANIMATION_EXTRA, `Supplément de vente (10,5 − 3,5) × 2 = 14 + dégustation 2 × 2 = 4 : ${ANIMATION_EXTRA} paquets.`, 'paquets', 0.01),
          ],
        },
        {
          id: 'd03-m2-a3',
          kind: 'fields',
          label: 'Événement 3',
          title: 'Rupture des confitures des Vergers de la Diège',
          instructions: 'Analyse la troisième publication.',
          helps: ['La rupture vient d’un succès inattendu.', 'Le magasin ne pouvait pas prévoir la demande d’une nouveauté.', 'Pour s’en prémunir, on augmente la marge contre les imprévus.'],
          outcomeIds: R2,
          fields: [
            { id: 'cause', label: '1. À quoi la rupture est-elle due ?', kind: 'choice', options: [{ value: 'succes', label: 'À un succès commercial plus fort que prévu pour une nouveauté' }, { value: 'erreur', label: 'À une erreur de commande du magasin' }, { value: 'retard', label: 'À un retard du transporteur' }], answer: 'succes', explain: 'Les ventes ont dépassé les prévisions.' },
            { id: 'mauvaise', label: '2. Est-ce une mauvaise gestion des stocks du magasin ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Pour une nouveauté, le magasin n’a pas d’historique de ventes : c’est un aléa.' },
            {
              id: 'info',
              label: '3. En plus du post Facebook, comment informer les clients ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'affiche', label: 'Une affichette en rayon, à l’emplacement du produit' },
                { value: 'caisse', label: 'Une information orale en caisse et au rayon' },
                { value: 'reservation', label: 'Proposer de réserver le produit' },
                { value: 'retirer', label: 'Retirer l’étiquette prix sans rien dire' },
              ],
              answers: ['affiche', 'caisse', 'reservation'],
              explain: 'On informe sur le lieu de vente et on garde le client.',
            },
            { id: 'indic', label: '4. Quel indicateur augmenter pour anticiper ce type d’aléa ?', kind: 'choice', options: [{ value: 'secu', label: 'Le stock de sécurité' }, { value: 'max', label: 'Le stock maximum seulement' }, { value: 'min', label: 'Le délai de livraison' }], answer: 'secu', explain: 'Le stock de sécurité protège contre la hausse imprévue des ventes.' },
          ],
        },
        {
          id: "d03-revision-2",
          label: "Annexe complémentaire",
          title: "Reconstituer un stock après une sortie oubliée",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Reconstitue d’abord le solde avant de traiter l’écriture oubliée.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "54 + 24 − 35 = 43."
          ],
          outcomeIds: [
            "d03-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel stock le système affiche-t-il avant la correction ?",
              kind: "number",
              answer: 43,
              explain: "54 + 24 − 35 = 43."
            },
            {
              id: "q2",
              label: "Quel mouvement régularise l’écart et quelle preuve faut-il conserver ?",
              kind: "written",
              lines: 3,
              model: "Enregistrer la sortie de 3 unités pour casse selon la procédure. Conserver le relevé de casse daté et le comptage à 40 qui confirme le stock corrigé."
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
      title: 'Connaître la valeur du stock',
      guidance: 'accompagné',
      message: {
        from: 'Clara Petit',
        role: 'Gestionnaire des stocks',
        text: [
          'En gestion, il faut connaître la quantité de produits en stock, mais aussi la valeur du stock en euros : elle nous sert notamment pour l’inventaire.',
          'Les produits entrés en stock sont valorisés à leur prix d’achat, qui peut varier selon les saisons ou les années. Pour le rayon hygiène, nous utilisons la méthode du coût unitaire moyen pondéré (CUMP), adaptée aux produits non périssables qui restent longtemps en stock.',
          'Je dois m’absenter : enregistre le bon de réception du 10 octobre (annexe 1), puis calcule la valeur du stock Bulle Verte (annexe 2).',
        ],
      },
      documents: [
        {
          id: 'd03-m3-doc1',
          number: 1,
          title: 'État des stocks du rayon hygiène au 10 octobre — fournisseur Bulle Verte',
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Quantité', 'Prix d’achat HT'],
              align: ['left', 'left', 'right', 'right'],
              rows: HYGIENE.map((h) => [h.ref, h.name, String(h.qte), eur(h.pa)]),
            },
          ],
        },
        {
          id: 'd03-m3-doc2',
          number: 2,
          title: 'Bordereau d’expédition n° 165879 — Bulle Verte, livraison du 10/10',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Client', 'La Coop’Verte, 19200 Ussel'], ['Nombre de colis', String(HYGIENE.reduce((n, h) => n + (h.colis ?? 0), 0))]] },
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'UC*', 'Cartons livrés', 'Prix d’achat unitaire HT'],
              align: ['left', 'left', 'right', 'right', 'right'],
              rows: HYGIENE.filter((h) => h.colis).map((h) => [h.ref, h.name, String(h.uc), String(h.colis), eur(h.paIn!)]),
            },
            { type: 'note', text: '* UC : unités par carton. Exemple : pour BV101, un carton contient 4 flacons.' },
          ],
        },
        {
          id: 'd03-m3-doc3',
          number: 3,
          title: 'Coût unitaire moyen pondéré',
          look: 'postit',
          blocks: [{ type: 'p', text: 'CUMP = (PA HT × quantité en stock + PA HT × quantité entrée) ÷ (quantité en stock + quantité entrée). Exemple BV101 : (58,26 + 77,52) ÷ (6 + 8) = 9,70 €.' }],
        },
        {
          id: "d03-revision-3-doc",
          number: 4,
          title: "Valoriser une entrée avec un coût différent",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le stock de paniers est de 10 unités à 8 € HT. La nouvelle livraison apporte 15 unités à 9 € HT. Après l’entrée, sept paniers sont vendus. La méthode interne est le CUMP après chaque entrée."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd03-m3-a1',
          kind: 'fields',
          layout: 'columns',
          columns: ['Quantité (unités)', 'Prix unitaire HT (€)'],
          label: 'Annexe 1',
          title: 'Enregistrement des mouvements de stock — entrée du 10/10',
          instructions: 'Dans le logiciel, saisis pour chaque article livré la quantité entrée (en unités, pas en cartons) et son prix unitaire. La première ligne est faite.',
          helps: ['La quantité se saisit en unités : cartons × UC.', 'Le prix unitaire est le prix d’achat HT du bordereau, pas celui de l’état des stocks.', 'BV101 : 2 cartons × 4 = 8 unités à 9,69 €.'],
          outcomeIds: R1,
          fields: HYGIENE.filter((h) => h.colis).flatMap((h, i) =>
            i === 0
              ? [{ id: `${h.ref}-ex`, label: `${h.ref} — ${h.name}`, kind: 'given' as const, value: `${cumpRow(h).qIn} unités à ${eur(h.paIn!)} (exemple)` }]
              : [
                  num(`${h.ref}.0`, `${h.ref} — ${h.name}`, cumpRow(h).qIn, `${h.colis} × ${h.uc} = ${cumpRow(h).qIn}.`),
                  num(`${h.ref}.1`, `${h.ref} — ${h.name}`, h.paIn!, `${eur(h.paIn!)} (bordereau).`, undefined, 0.001),
                ],
          ),
        },
        CUMP_GRID,
        {
          id: 'd03-m3-a3',
          kind: 'fields',
          label: 'Annexe 2 (suite)',
          title: 'Exploiter la valorisation',
          instructions: 'Réponds à l’aide de ton tableau.',
          helps: ['Additionne la colonne « Montant » de l’état au 10/10, puis la colonne « Valeur ».', 'Arrondis au centime.', `Avant : ${eur(HYG_TOTAL_AVANT)}.`],
          outcomeIds: R1,
          fields: [
            num('avant', 'Valeur totale du stock avant les entrées du 10 octobre', HYG_TOTAL_AVANT, `Somme des montants : ${eur(HYG_TOTAL_AVANT)}.`, '€', 0.06),
            num('apres', 'Valeur totale du stock après les entrées', HYG_TOTAL_APRES, `Somme des valeurs : ${eur(HYG_TOTAL_APRES)}.`, '€', 0.06),
            {
              id: 'interet',
              label: 'Quel est l’intérêt de calculer un coût moyen pour chaque produit ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Valoriser le stock à un prix unique, même si les produits ont été achetés à des prix différents' },
                { value: 'b', label: 'Fixer le prix de vente du produit' },
                { value: 'c', label: 'Calculer les remises du fournisseur' },
              ],
              answer: 'a',
              explain: 'Les flacons identiques achetés à des prix différents sont mélangés en rayon : on les valorise à un coût moyen.',
            },
          ],
        },
        {
          id: "d03-revision-3",
          label: "Annexe complémentaire",
          title: "Valoriser une entrée avec un coût différent",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Additionne les valeurs des deux lots avant de diviser par le nombre d’unités.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "(10 × 8 + 15 × 9) ÷ 25 = 8,60 €."
          ],
          outcomeIds: [
            "d03-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Calcule le nouveau CUMP en euros.",
              kind: "number",
              answer: 8.6,
              explain: "(10 × 8 + 15 × 9) ÷ 25 = 8,60 €."
            },
            {
              id: "q2",
              label: "Calcule la valeur du stock restant en euros.",
              kind: "number",
              answer: 154.8,
              explain: "(25 − 7) × 8,60 = 154,80 €."
            },
            {
              id: "q3",
              label: "Explique pourquoi le dernier prix d’achat seul serait trompeur.",
              kind: "written",
              lines: 3,
              model: "Le stock avant l’entrée comprend aussi des unités achetées à 8 €. Le CUMP pondère l’ancien stock et la nouvelle entrée selon leurs quantités."
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
      title: 'Optimiser la durée de stockage',
      guidance: 'accompagné',
      message: {
        from: 'Clara Petit',
        role: 'Gestionnaire des stocks',
        text: [
          'Malgré un suivi rigoureux, nous ne sommes pas à l’abri d’aléas qui provoquent des ruptures ou du surstockage. Et stocker trop longtemps nous coûte cher.',
          'Pour ajuster nos décisions, utilise les indicateurs du document 1 : ils montrent la durée de stockage de nos produits et repèrent les produits à risque. Analyse quelques chocolats, qui connaissent des ruptures fréquentes depuis quelques semaines (document 2).',
        ],
      },
      documents: [
        {
          id: 'd03-m4-doc1',
          number: 1,
          title: 'Les indicateurs de suivi du stock',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Indicateur', 'Formule', 'Ce qu’il mesure'],
              rows: [
                ['Stock moyen', '(stock initial + stock final) ÷ 2', 'Quantité (ou valeur) moyenne en stock sur la période.'],
                ['Coefficient de rotation', 'quantité vendue ÷ stock moyen (ou CA HT ÷ stock moyen en valeur)', 'Nombre de fois où le stock moyen a été renouvelé.'],
                ['Durée de stockage', 'nombre de jours de la période ÷ coefficient de rotation', 'Nombre moyen de jours pendant lesquels un produit reste en stock. Plus elle est courte, plus le risque de rupture est grand.'],
              ],
            },
            { type: 'note', text: 'On compte 30 jours par mois et 360 jours par an. Exemple — pâte à tartiner, janvier : stock initial 30, stock final 20, ventes 84. Stock moyen = 25 ; coefficient = 84 ÷ 25 = 3,36 ; durée = 30 ÷ 3,36 = 8,93 jours.' },
          ],
        },
        {
          id: 'd03-m4-doc2',
          number: 2,
          title: 'Extrait du cadencier — mai, juin, juillet',
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Désignation', 'SI mai', 'L mai', 'V mai', 'SI juin', 'L juin', 'V juin', 'SI juil.', 'L juil.', 'V juil.', 'SF'],
              align: ['left', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right'],
              rows: CHOCOLATS.map((c) => [c.name, String(c.siMois[0]), String(c.l[0]), String(c.v[0]), String(c.siMois[1]), String(c.l[1]), String(c.v[1]), String(c.siMois[2]), String(c.l[2]), String(c.v[2]), String(c.sf)]),
            },
            { type: 'note', text: 'SI : stock initial · L : livraisons · V : ventes · SF : stock final. Les commandes sont égales aux livraisons.' },
          ],
        },
        {
          id: 'd03-m4-doc3',
          number: 3,
          title: 'Préconisation de l’enseigne',
          look: 'postit',
          blocks: [{ type: 'p', text: `Pour l’épicerie sucrée, le réseau préconise une durée moyenne de stockage de ${PRECO_CHOCO} jours.` }],
        },
        {
          id: "d03-revision-4-doc",
          number: 4,
          title: "Comparer la durée de stockage de deux références",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Référence",
                "Stock initial",
                "Stock final",
                "Ventes sur 30 jours"
              ],
              rows: [
                [
                  "Crème mains",
                  "30",
                  "18",
                  "72"
                ],
                [
                  "Huile sèche",
                  "40",
                  "32",
                  "24"
                ]
              ]
            },
            {
              type: "p",
              text: "Le magasin utilise (stock initial + stock final) ÷ 2 pour le stock moyen. Durée = 30 × stock moyen ÷ ventes."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd03-m4-a1',
          kind: 'fields',
          layout: 'columns',
          columns: ['Ventes (3 mois)', 'Stock moyen', 'Coefficient de rotation', 'Durée de stockage (jours)'],
          label: 'Annexe 1',
          title: 'Calcul des indicateurs de suivi du stock (arrondis à deux décimales)',
          instructions: 'La période compte 3 mois, soit 90 jours.',
          helps: ['Ventes de la période = ventes de mai + juin + juillet.', 'Stock moyen = (SI de mai + SF) ÷ 2. Coefficient = ventes ÷ stock moyen. Durée = 90 ÷ coefficient.', `Équateur : ventes ${CHOCOLATS[0].ventes} ; stock moyen ${CHOCOLATS[0].moyen} ; coefficient ${fr(CHOCOLATS[0].coef)} ; durée ${fr(CHOCOLATS[0].duree)} jours.`],
          outcomeIds: R12,
          fields: CHOCOLATS.flatMap((c) => [
            num(`${c.id}.0`, c.name, c.ventes, `${c.v.join(' + ')} = ${c.ventes}.`),
            num(`${c.id}.1`, c.name, c.moyen, `(${c.si} + ${c.sf}) ÷ 2 = ${fr(c.moyen)}.`, undefined, 0.001),
            num(`${c.id}.2`, c.name, c.coef, `${c.ventes} ÷ ${fr(c.moyen)} = ${fr(c.coef)}.`, undefined, 0.011),
            num(`${c.id}.3`, c.name, c.duree, `90 ÷ ${fr(c.coef)} = ${fr(c.duree)} jours.`, undefined, 0.02),
          ]),
        },
        {
          id: 'd03-m4-a2',
          kind: 'fields',
          layout: 'columns',
          columns: ['Constat', 'Risque', 'Décision'],
          label: 'Annexe 2',
          title: `Analyse des résultats — préconisation : ${PRECO_CHOCO} jours`,
          instructions: 'Pour chaque chocolat, compare la durée à la préconisation, déduis le risque et choisis la ou les décisions.',
          helps: ['Durée plus courte que préconisé → les produits partent vite → risque de rupture. Plus longue → surstockage.', 'Rupture : on augmente le stock d’alerte ou le stock maximum. Surstockage : on les diminue, et on peut écouler par une promotion.', 'Un seul chocolat correspond exactement à 8 jours.'],
          outcomeIds: R2,
          fields: CHOCOLATS.flatMap((c) => {
            const constat = Math.abs(c.duree - PRECO_CHOCO) < 0.05 ? 'egal' : c.duree > PRECO_CHOCO ? 'sup' : 'inf';
            const risque = constat === 'egal' ? 'aucun' : constat === 'sup' ? 'surstock' : 'rupture';
            return [
              {
                id: `${c.id}.0`,
                label: `${c.name} (${fr(c.duree)} jours)`,
                kind: 'choice' as const,
                select: true,
                options: [
                  { value: 'sup', label: 'Durée supérieure à la préconisation' },
                  { value: 'inf', label: 'Durée inférieure à la préconisation' },
                  { value: 'egal', label: 'Durée conforme à la préconisation' },
                ],
                answer: constat,
                explain: `${fr(c.duree)} jours contre ${PRECO_CHOCO} préconisés.`,
              },
              {
                id: `${c.id}.1`,
                label: `${c.name} (${fr(c.duree)} jours)`,
                kind: 'choice' as const,
                select: true,
                options: [
                  { value: 'surstock', label: 'Surstockage' },
                  { value: 'rupture', label: 'Rupture de stock' },
                  { value: 'aucun', label: 'Pas de risque détecté' },
                ],
                answer: risque,
                explain: risque === 'aucun' ? 'Pas de risque.' : `Risque : ${risque === 'rupture' ? 'rupture de stock' : 'surstockage'}.`,
              },
              {
                id: `${c.id}.2`,
                label: `${c.name} (${fr(c.duree)} jours)`,
                kind: 'multi' as const,
                options: [
                  { value: 'diminuer', label: 'Diminuer l’alerte et/ou le maximum' },
                  { value: 'augmenter', label: 'Augmenter l’alerte et/ou le maximum' },
                  { value: 'promo', label: 'Organiser une promotion' },
                  { value: 'satisfaisant', label: 'Gestion satisfaisante' },
                ],
                answers: c.answer,
                explain:
                  risque === 'rupture'
                    ? 'Augmenter le stock d’alerte et/ou le stock maximum.'
                    : risque === 'surstock'
                      ? 'Diminuer les niveaux de stock et écouler le surplus par une promotion.'
                      : 'Gestion satisfaisante : on poursuit ainsi.',
              },
            ];
          }),
        },
        {
          id: "d03-revision-4",
          label: "Annexe complémentaire",
          title: "Comparer la durée de stockage de deux références",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Compare les durées sur la même période et à partir des mêmes unités.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "30 × 24 ÷ 72 = 10."
          ],
          outcomeIds: [
            "d03-r1",
            "d03-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Calcule la durée de stockage de la crème en jours.",
              kind: "number",
              answer: 10,
              explain: "30 × 24 ÷ 72 = 10."
            },
            {
              id: "q2",
              label: "Calcule la durée de stockage de l’huile en jours.",
              kind: "number",
              answer: 45,
              explain: "30 × 36 ÷ 24 = 45."
            },
            {
              id: "q3",
              label: "Propose une mesure à tester pour chaque produit.",
              kind: "written",
              lines: 3,
              model: "Sur la crème, maintenir un suivi rapproché du seuil et de la disponibilité. Sur l’huile, diminuer la taille du prochain réassort et suivre les ventes avant d’engager une remise."
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
      title: 'Optimiser la gestion des stocks grâce à la méthode des 20/80',
      guidance: 'autonome',
      hero: { id: 'd03-legumes', alt: 'Étal de légumes frais : tomates, carottes, courgettes' },
      message: {
        from: 'Antoine Morel',
        role: 'Directeur',
        text: [
          'Notre rayon fruits et légumes doit être géré avec beaucoup de vigilance : pas question de surstocker des produits périssables, et les ruptures nuisent à notre image.',
          'Pour repérer les produits à surveiller de près, segmente les légumes avec la méthode des 20/80 (document 1) : trouve les 20 % de légumes qui font l’essentiel des ventes de juin (document 2).',
        ],
      },
      documents: [
        {
          id: 'd03-m5-doc1',
          number: 1,
          title: 'La méthode des 20/80 (loi de Pareto)',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'L’analyse consiste à rechercher les 20 % de références qui représentent environ 80 % des ventes (ou de la valeur du stock). On peut alors suivre ce groupe de produits avec plus de rigueur. À l’inverse, les 80 % de références restantes ne représentent qu’environ 20 % des ventes. Cette loi n’est pas toujours vérifiée.' },
            {
              type: 'list',
              title: 'Démarche',
              items: [
                '1. Classer les produits par chiffre d’affaires décroissant.',
                '2. Calculer la part de chaque référence dans le nombre total de références.',
                '3. Cumuler les pourcentages de références.',
                '4. Calculer la part de chaque référence dans le CA total.',
                '5. Cumuler les pourcentages de CA.',
                '6. Repérer si 20 % des produits représentent environ 80 % du CA.',
              ],
            },
          ],
        },
        {
          id: 'd03-m5-doc2',
          number: 2,
          title: 'Ventes de légumes du 1er au 30 juin',
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Désignation', 'CA HT', 'Désignation', 'CA HT'],
              align: ['left', 'right', 'left', 'right'],
              rows: Array.from({ length: 10 }, (_, i) => [LEGUMES[i][0], eur(LEGUMES[i][1]), LEGUMES[i + 10][0], eur(LEGUMES[i + 10][1])]),
            },
            { type: 'facts', items: [['Nombre de références', '20'], ['CA HT total', eur(LEG_TOTAL)]] },
          ],
        },
        {
          id: "d03-revision-5-doc",
          number: 3,
          title: "Prioriser les contrôles sur les références importantes",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Dix références représentent ensemble 10 000 € de ventes mensuelles. Muesli compte pour 4 700 €, Café pour 3 200 €. Les huit autres références représentent chacune moins de 500 € et totalisent 2 100 €. Parmi elles, le sel en recharge est promis dans trois abonnements cette semaine."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd03-m5-a1',
          kind: 'fields',
          label: 'Annexe — étape 1',
          title: 'Classer les légumes par CA décroissant (les 8 premiers)',
          instructions: 'Choisis le légume de chaque rang.',
          helps: ['Repère d’abord les plus gros chiffres d’affaires.', 'Quatre légumes dépassent 2 000 €.', 'Rang 1 : tomates ; rang 2 : pommes de terre.'],
          outcomeIds: R12,
          fields: LEG_SORTED.slice(0, 8).map((l, i) => ({
            id: `rang${i + 1}`,
            label: `Rang ${i + 1}`,
            kind: 'choice' as const,
            select: true,
            options: [...LEGUMES].sort((a, b) => a[0].localeCompare(b[0], 'fr')).map(([n]) => ({ value: n, label: n })),
            answer: l.name,
            explain: `Rang ${i + 1} : ${l.name} (${eur(l.ca)}).`,
          })),
        },
        {
          id: 'd03-m5-a2',
          kind: 'grid',
          label: 'Annexe — étapes 2 à 5',
          title: 'Analyse des ventes du 01/06 au 30/06 (8 premiers rangs)',
          instructions: 'Complète les pourcentages, arrondis à deux décimales. Les deux premières lignes sont données en exemple.',
          helps: ['Part des références = 1 ÷ 20 × 100 = 5 % par légume. Le cumul ajoute 5 % à chaque rang.', 'Part du CA = CA du légume ÷ CA total × 100. Le CA cumulé ajoute la part du rang à celui du rang précédent.', `Carottes : ${fr(LEG_SORTED[2].ca)} ÷ ${fr(LEG_TOTAL)} × 100 = ${fr(LEG_SORTED[2].partCa)} %.`],
          outcomeIds: R12,
          groups: [{ label: 'Calculs', columns: ['CA HT', 'Part réf. %', 'Réf. cumulées %', 'Part CA %', 'CA cumulé %'] }],
          rows: LEG_SORTED.slice(0, 8).map((l, i) => {
            const ex = i < 2;
            const c = (answer: number, explain: string) => (ex ? answer : { answer, explain, tolerance: 0.011 });
            return {
              id: `leg${i + 1}`,
              label: `${i + 1}. ${l.name}`,
              cells: [
                l.ca,
                c(5, '1 ÷ 20 × 100 = 5 %.'),
                c(l.cumRef, `${i + 1} × 5 = ${l.cumRef} %.`),
                c(l.partCa, `${fr(l.ca)} ÷ ${fr(LEG_TOTAL)} × 100 = ${fr(l.partCa)} %.`),
                c(l.cumCa, `CA cumulé jusqu’au rang ${i + 1} ÷ CA total = ${fr(l.cumCa)} %.`),
              ],
            };
          }),
        },
        {
          id: 'd03-m5-a3',
          kind: 'fields',
          label: 'Annexe — étape 6',
          title: 'Analyse selon la méthode des 20/80',
          instructions: 'Tire les conclusions de ton tableau.',
          helps: ['20 % de 20 références = 4 références.', `Les 4 premières représentent ${fr(LEG_SORTED[3].cumCa)} % du CA.`, 'Le légume qui a le moins d’impact est le dernier du classement.'],
          outcomeIds: R2,
          fields: [
            { id: 'top', label: '1. Quelles sont les 4 références qui génèrent environ 80 % du CA ?', kind: 'multi', options: LEG_SORTED.slice(0, 8).map((l) => ({ value: l.name, label: l.name })), answers: LEG_SORTED.slice(0, 4).map((l) => l.name), explain: `${LEG_SORTED.slice(0, 4).map((l) => l.name).join(', ')} : ${fr(LEG_SORTED[3].cumCa)} % du CA.` },
            { id: 'verifiee', label: 'La loi des 20/80 est-elle vérifiée ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: `20 % des références font ${fr(LEG_SORTED[3].cumCa)} % du CA, soit environ 80 %.` },
            { id: 'pourquoi', label: '2. Pourquoi faut-il les surveiller ?', kind: 'choice', options: [{ value: 'a', label: 'Une rupture sur ces produits ferait perdre une grande part du CA du rayon' }, { value: 'b', label: 'Ce sont les produits les moins chers' }, { value: 'c', label: 'Ils se conservent plus longtemps' }], answer: 'a', explain: 'Ce sont eux qui font le chiffre d’affaires : une rupture coûte cher.' },
            { id: 'moins', label: '3. Quelle référence a le moins d’impact sur le CA ?', kind: 'choice', select: true, options: [...LEGUMES].sort((a, b) => a[0].localeCompare(b[0], 'fr')).map(([n]) => ({ value: n, label: n })), answer: LEG_SORTED[LEG_SORTED.length - 1].name, explain: `${LEG_SORTED[LEG_SORTED.length - 1].name} : ${eur(LEG_SORTED[LEG_SORTED.length - 1].ca)}.` },
          ],
        },
        {
          id: "d03-revision-5",
          label: "Annexe complémentaire",
          title: "Prioriser les contrôles sur les références importantes",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Le classement commercial et l’engagement envers les clients sont deux informations différentes.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "(4 700 + 3 200) ÷ 10 000 × 100 = 79 %."
          ],
          outcomeIds: [
            "d03-r1",
            "d03-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle part des ventes représentent Muesli et Café en pourcentage ?",
              kind: "number",
              answer: 79,
              explain: "(4 700 + 3 200) ÷ 10 000 × 100 = 79 %."
            },
            {
              id: "q2",
              label: "Propose deux fréquences de suivi et une exception justifiée.",
              kind: "written",
              lines: 3,
              model: "Contrôle plus fréquent de Muesli et Café, qui concentrent 79 % des ventes pour 20 % des références. Contrôle courant pour les autres, avec vérification anticipée du sel avant les trois abonnements."
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
          id: 'd03-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les schémas.',
          helps: ['Reprends le mémo de la mission 1.', 'Les objectifs de la surveillance des stocks sont deux risques opposés.', 'Durée de stockage, coefficient de rotation, stock moyen.'],
          outcomeIds: R12,
          fields: [
            { id: 'max', label: '1. À ne pas dépasser : le stock…', kind: 'text', accept: ['maximum', 'stock maximum', 'max'], explain: 'Le stock maximum.' },
            { id: 'alerte1', label: '1. Stock d’alerte = stock … + stock de sécurité', kind: 'text', accept: ['minimum', 'stock minimum', 'mini'], explain: 'Stock minimum + stock de sécurité.' },
            { id: 'obj', label: '2. Surveiller les variations sert à éviter les ruptures et à…', kind: 'choice', options: [{ value: 'a', label: 'limiter les coûts de stockage en évitant les surstocks' }, { value: 'b', label: 'augmenter les prix' }], answer: 'a', explain: 'Ni rupture, ni surstock.' },
            { id: 'valeur', label: '3. On calcule la valeur du stock pour gérer l’entreprise et pour…', kind: 'choice', options: [{ value: 'a', label: 'respecter la réglementation lors de l’inventaire' }, { value: 'b', label: 'fixer les remises fournisseurs' }], answer: 'a', explain: 'La valeur du stock est obligatoire à l’inventaire.' },
            { id: 'duree', label: '4. Nombre moyen de jours de stockage :', kind: 'text', accept: ['durée de stockage', 'duree de stockage', 'la durée de stockage'], explain: 'La durée de stockage.' },
            { id: 'coef', label: '4. Nombre de renouvellements du stock sur la période :', kind: 'text', accept: ['coefficient de rotation', 'le coefficient de rotation', 'rotation'], explain: 'Le coefficient de rotation.' },
            { id: 'moyen', label: '4. Quantités moyennes stockées :', kind: 'text', accept: ['stock moyen', 'le stock moyen'], explain: 'Le stock moyen.' },
            num('pareto', '5. 20 % des produits représentent environ … % des ventes', 80, '80 %.', '%'),
          ],
        },
        {
          id: 'd03-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq questions de calcul rapide.',
          helps: ['Utilise la calculatrice.', 'Pense aux formules de la fiche de révision.', 'Durée = jours de la période ÷ coefficient.'],
          outcomeIds: R12,
          fields: [
            num('q1', 'Stock minimum 12, stock de sécurité 4 : stock d’alerte ?', 16, '12 + 4 = 16.'),
            num('q2', 'Stock maximum 40, stock disponible 14 : quantité à commander ?', 26, '40 − 14 = 26.'),
            num('q3', '10 unités à 5 € en stock, 10 unités entrées à 6 € : CUMP ?', 5.5, '(50 + 60) ÷ 20 = 5,50 €.', '€', 0.001),
            num('q4', 'Ventes 120, stock moyen 20 sur un mois : coefficient de rotation ?', 6, '120 ÷ 20 = 6.'),
            num('q5', 'Coefficient 6 sur un mois de 30 jours : durée de stockage ?', 5, '30 ÷ 6 = 5 jours.', 'jours'),
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Fiche de stock : entrées (livraisons), sorties (ventes), stock.', 'Stock maximum, stock minimum, stock de sécurité, stock d’alerte.', 'CUMP : coût moyen d’un produit acheté à des prix différents.', 'Stock moyen, coefficient de rotation, durée de stockage.', 'Méthode des 20/80 : 20 % des références font environ 80 % des ventes.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Commander dès que le stock atteint le stock d’alerte, jusqu’au stock maximum.', 'Relever les stocks de sécurité avant un événement commercial.', 'Comparer la durée de stockage à la préconisation : plus courte → rupture ; plus longue → surstock.', 'Classer par CA décroissant, puis cumuler les pourcentages.'] },
        {
          title: 'Formules à connaître',
          kind: 'formules',
          items: [
            'Stock d’alerte = stock minimum + stock de sécurité',
            'Quantité à commander = stock maximum − stock disponible',
            'CUMP = (valeur du stock + valeur de l’entrée) ÷ (quantité en stock + quantité entrée)',
            'Stock moyen = (SI + SF) ÷ 2',
            'Coefficient de rotation = ventes ÷ stock moyen',
            'Durée de stockage = jours de la période ÷ coefficient',
          ],
        },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Saisir des cartons au lieu d’unités.', 'Diviser 90 jours par la durée au lieu du coefficient.', 'Confondre stock minimum et stock d’alerte.', 'Oublier qu’une durée courte signale un risque de rupture.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Mettre à jour le stock à chaque réception.', 'Informer les clients en cas de rupture.', 'Surveiller en priorité les produits du « top 20 % ».'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Stock maximum', 'Stock minimum', 'Stock d’alerte', 'Stock de sécurité', 'Rupture de stock', 'Surstockage', 'CUMP', 'Rotation', '20/80'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Le seuil d’alerte couvre le besoin pendant le délai de livraison et la marge de sécurité retenue.",
            "Le CUMP sert à valoriser les sorties et le stock, tandis que la rotation décrit la vitesse d’écoulement.",
            "Un classement 20/80 fournit un ordre de contrôle. Analyse aussi les produits indispensables et les risques de rupture."
          ]
        },
      ],
    },

    /* ================================ APPLICATION 1 ================================ */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Fixer et repérer les niveaux de stock',
      guidance: 'autonome',
      message: {
        from: 'Mathieu Roche',
        role: 'Chef du rayon surgelés, hypermarché',
        text: ['Tu m’assistes au rayon surgelés pendant l’été. Aide-moi à référencer une nouvelle glace, la Banquise Praliné noisette, et à fixer ses niveaux de stock. Ensuite, fais le point sur les autres références de la marque.'],
      },
      documents: [
        {
          id: 'd03-a1-doc1',
          number: 1,
          title: 'Gestion du rayon surgelés',
          look: 'memo',
          blocks: [
            {
              type: 'list',
              items: [
                `La dernière nouveauté Banquise s’est vendue à ${GLACE.ventesJour} unités par jour en moyenne sur la période d’été.`,
                `Habituellement, pour les glaces, le stock de sécurité correspond à ${GLACE.joursSecu} jour de vente et le délai d’approvisionnement est de ${GLACE.delai} jours.`,
                'Pour les surgelés, le stock maximum est fixé au double du stock d’alerte.',
              ],
            },
            {
              type: 'table',
              caption: 'Autres références de la marque',
              head: ['Référence', 'Unités par carton', 'Stock disponible', 'Stock maximum', 'Stock d’alerte'],
              align: ['left', 'right', 'right', 'right', 'right'],
              rows: GLACES.map((g) => [g.name, String(g.uc), String(g.dispo), String(g.max), String(g.alerte)]),
            },
            { type: 'note', text: 'On commande des cartons entiers. Si besoin, arrondir au nombre de cartons inférieur pour ne pas dépasser le stock maximum.' },
          ],
        },
      ],
      activities: [
        {
          id: 'd03-a1-a1',
          kind: 'fields',
          label: '1',
          title: 'Niveaux de stock de la glace Banquise Praliné noisette',
          instructions: 'Établis chaque niveau de stock, en unités.',
          helps: ['Stock de sécurité = ventes d’une journée.', 'Stock minimum = ventes pendant le délai de 2 jours. Alerte = minimum + sécurité.', 'Maximum = 2 × alerte.'],
          outcomeIds: R2,
          fields: [
            num('secu', 'Stock de sécurité', GLACE_NIV.secu, `${GLACE.ventesJour} × 1 jour = ${GLACE_NIV.secu}.`, 'unités'),
            num('mini', 'Stock minimum', GLACE_NIV.mini, `${GLACE.ventesJour} × 2 jours = ${GLACE_NIV.mini}.`, 'unités'),
            num('alerte', 'Stock d’alerte', GLACE_NIV.alerte, `${GLACE_NIV.mini} + ${GLACE_NIV.secu} = ${GLACE_NIV.alerte}.`, 'unités'),
            num('max', 'Stock maximum', GLACE_NIV.max, `2 × ${GLACE_NIV.alerte} = ${GLACE_NIV.max}.`, 'unités'),
          ],
        },
        {
          id: 'd03-a1-a2',
          kind: 'fields',
          layout: 'columns',
          columns: ['Commande ?', 'Cartons à commander'],
          label: '2',
          title: 'Faut-il commander les autres références ?',
          instructions: 'Pour chaque référence, décide s’il faut commander et combien de cartons.',
          helps: ['On commande si le stock disponible est inférieur ou égal au stock d’alerte.', 'Cartons = (stock maximum − stock disponible) ÷ unités par carton, arrondi à l’inférieur.', `Double chocolat : (80 − 36) ÷ 10 = 4,4 → 4 cartons.`],
          outcomeIds: R2,
          fields: GLACES.flatMap((g) => [
            { id: `${g.id}.0`, label: g.name, kind: 'choice' as const, options: OUI_NON, answer: g.commande ? 'oui' : 'non', explain: g.commande ? `${g.dispo} ≤ ${g.alerte} : on commande.` : `${g.dispo} > ${g.alerte} : pas de commande.` },
            num(`${g.id}.1`, g.name, g.cartons, g.commande ? `(${g.max} − ${g.dispo}) ÷ ${g.uc} = ${fr((g.max - g.dispo) / g.uc)} → ${g.cartons} carton(s).` : '0.'),
          ]),
        },
      ],
      selfAssessment: ['Je sais calculer les niveaux de stock d’un produit.', 'Je sais décider d’une commande et la calculer en cartons.'],
    },

    /* ================================ APPLICATION 2 ================================ */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Optimiser la durée de stockage',
      guidance: 'autonome',
      hero: { id: 'd03-linge', alt: 'Lit avec parure et coussins dans une boutique de linge de maison' },
      message: {
        from: 'Inès Garnier',
        role: 'Responsable, boutique Lin & Coton, Limoges',
        text: ['Je m’inquiète de la quantité de produits en réserve. Fais-moi un bilan des durées de stockage de nos familles de produits sur l’année, et compare-les aux préconisations de l’enseigne.'],
      },
      documents: [
        {
          id: 'd03-a2-doc1',
          number: 1,
          title: 'Données de l’année et préconisations de l’enseigne',
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Famille', 'Catégorie', 'Stock moyen', 'Quantité vendue sur l’année', 'Durée préconisée'],
              align: ['left', 'left', 'right', 'right', 'right'],
              rows: LINGE.map((x) => [x.name, x.cat, String(x.moyen), String(x.ventes), `${x.preco} jours`]),
            },
            { type: 'note', text: 'Une année compte 360 jours.' },
          ],
        },
      ],
      activities: [
        {
          id: 'd03-a2-a1',
          kind: 'fields',
          layout: 'columns',
          columns: ['Coefficient', 'Durée (jours)', 'Constat'],
          label: '1 et 2',
          title: 'Analyse et améliorations possibles',
          instructions: 'Calcule les indicateurs de chaque famille, puis tire un constat.',
          helps: ['Coefficient = quantité vendue ÷ stock moyen.', 'Durée = 360 ÷ coefficient. Compare-la à la préconisation de la catégorie.', 'Parures : 240 ÷ 40 = 6 → 360 ÷ 6 = 60 jours < 80 : risque de rupture.'],
          outcomeIds: R12,
          fields: LINGE.flatMap((x) => [
            num(`${x.id}.0`, `${x.name} (${x.cat}, ${x.preco} j)`, x.coef, `${x.ventes} ÷ ${x.moyen} = ${fr(x.coef)}.`, undefined, 0.011),
            num(`${x.id}.1`, `${x.name} (${x.cat}, ${x.preco} j)`, x.duree, `360 ÷ ${fr(x.coef)} = ${fr(x.duree)} jours.`, undefined, 0.06),
            {
              id: `${x.id}.2`,
              label: `${x.name} (${x.cat}, ${x.preco} j)`,
              kind: 'choice' as const,
              select: true,
              options: [
                { value: 'rupture', label: 'Durée inférieure : risque de rupture → augmenter l’alerte' },
                { value: 'surstock', label: 'Durée supérieure : risque de surstock → réduire l’alerte' },
                { value: 'ok', label: 'Durée conforme : rien à changer' },
              ],
              answer: x.verdict,
              explain: `${fr(x.duree)} jours contre ${x.preco} préconisés.`,
            },
          ]),
        },
      ],
      selfAssessment: ['Je sais calculer une durée de stockage sur un an.', 'Je sais proposer une amélioration à partir d’une durée de stockage.'],
    },

    /* ================================ APPLICATION 3 ================================ */
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Utiliser la méthode des 20/80',
      guidance: 'autonome',
      message: {
        from: 'Hugo Lambert',
        role: 'Créateur du site Kiosk’Sport (e-commerce)',
        text: [
          'J’ai l’impression d’immobiliser beaucoup de trésorerie sur certaines références. J’essaie de répondre à la demande et d’anticiper les modes, en commandant certaines références en grande quantité.',
          'Aide-moi à visualiser la valeur du stock par famille, pour repérer celles qui pèsent le plus et que je dois écouler en priorité. Vérifie si le stock suit la loi des 20/80.',
        ],
      },
      documents: [
        {
          id: 'd03-a3-doc1',
          number: 1,
          title: 'État du stock par famille de produits',
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Famille', 'Nombre de références', 'Valeur du stock'],
              align: ['left', 'right', 'right'],
              rows: [...SPORT.map(([n, r, v]) => [n, String(r), eur(v)]), ['Total', String(SPORT_REFS), eur(SPORT_VAL)]],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd03-a3-a1',
          kind: 'grid',
          label: '1',
          title: 'Tableau 20/80 par valeur du stock (classement décroissant)',
          instructions: 'Les familles sont déjà classées par valeur décroissante. Complète les pourcentages (deux décimales) des 4 premières.',
          helps: ['Part des références = références de la famille ÷ total des références × 100.', 'Part du stock = valeur de la famille ÷ valeur totale × 100. Les colonnes « cumulées » additionnent les lignes précédentes.', `Vestes : ${SPORT_SORTED[0].refs} ÷ ${SPORT_REFS} × 100 = ${fr(SPORT_SORTED[0].partRef)} %.`],
          outcomeIds: R12,
          groups: [{ label: 'Calculs', columns: ['Réf.', 'Valeur €', 'Part réf. %', 'Réf. cumulées %', 'Part stock %', 'Stock cumulé %'] }],
          rows: SPORT_SORTED.slice(0, 4).map((x) => ({
            id: x.name,
            label: x.name,
            cells: [
              x.refs,
              x.val,
              { answer: x.partRef, explain: `${x.refs} ÷ ${SPORT_REFS} × 100 = ${fr(x.partRef)} %.`, tolerance: 0.011 },
              { answer: x.cumRef, explain: `Cumul : ${fr(x.cumRef)} %.`, tolerance: 0.011 },
              { answer: x.partVal, explain: `${fr(x.val)} ÷ ${fr(SPORT_VAL)} × 100 = ${fr(x.partVal)} %.`, tolerance: 0.011 },
              { answer: x.cumVal, explain: `Cumul : ${fr(x.cumVal)} %.`, tolerance: 0.011 },
            ],
          })),
        },
        {
          id: 'd03-a3-a2',
          kind: 'fields',
          label: '2',
          title: 'Bilan pour Hugo Lambert',
          instructions: 'Conclus ton analyse.',
          helps: ['Regarde la ligne où les références cumulées atteignent environ 20 %.', `Vestes et sweats : ${fr(SPORT_SORTED[1].cumRef)} % des références, ${fr(SPORT_SORTED[1].cumVal)} % de la valeur.`, 'Ces deux familles sont à mettre en avant.'],
          outcomeIds: R2,
          fields: [
            { id: 'loi', label: 'La loi des 20/80 est-elle vérifiée ?', kind: 'choice', options: [{ value: 'oui', label: 'La loi des 20/80 est vérifiée' }, { value: 'non', label: 'La loi des 20/80 n’est pas vérifiée' }], answer: 'oui', explain: `${fr(SPORT_SORTED[1].cumRef)} % des références représentent ${fr(SPORT_SORTED[1].cumVal)} % de la valeur du stock.` },
            { id: 'familles', label: 'Quelles familles mettre en avant en priorité sur le site ?', kind: 'multi', options: SPORT_SORTED.slice(0, 5).map((x) => ({ value: x.name, label: x.name })), answers: SPORT_SORTED.slice(0, 2).map((x) => x.name), explain: 'Les vestes et les sweats immobilisent l’essentiel de la trésorerie.' },
          ],
        },
      ],
      selfAssessment: ['Je sais appliquer la méthode des 20/80 à la valeur d’un stock.'],
    },

    /* ================================ APPLICATION 4 ================================ */
    {
      id: 'application-4',
      kind: 'application',
      number: 4,
      title: 'Déterminer la valeur du stock',
      guidance: 'autonome',
      message: {
        from: 'Paul Laurent',
        role: 'Responsable de rayon, Voltéo (électroménager et multimédia)',
        text: ['Aide-moi à gérer le stock du casque audio sans fil Sonik S3 pour le mois de juin. Je voudrais aussi comparer deux méthodes de valorisation.'],
      },
      documents: [
        {
          id: 'd03-a4-doc1',
          number: 1,
          title: 'Mouvements observés pour le casque Sonik S3',
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Date', 'Mouvement'],
              rows: [
                ['1er juin', 'Quantité disponible après comptage : 5 casques achetés 122 € l’unité'],
                ['4 juin', 'Commande de 4 casques à 126 € l’unité'],
                ['6 juin', 'Livraison de la commande du 4 juin'],
                ['8 juin', 'Mise en avant du produit. Vente de 4 casques'],
                ['9 juin', 'Commande de 7 casques à 124 € l’unité'],
                ['11 juin', 'Produit toujours mis en avant. Vente de 5 casques : rupture de stock'],
                ['12 juin', 'Livraison de la commande du 9 juin'],
                ['14 juin', 'Fin de la mise en avant. Vente d’un casque'],
                ['20 juin', 'Vente de 2 casques'],
                ['22 juin', 'Commande de 3 casques à 125 € l’unité'],
                ['24 juin', 'Livraison de la commande du 22 juin'],
                ['29 juin', 'Vente de 2 casques'],
              ],
            },
            { type: 'note', text: 'CUMP après chaque entrée : on recalcule le coût moyen à chaque livraison ; les sorties sont valorisées au dernier CUMP. CUMP de fin de période : (valeur du stock initial + valeur de toutes les entrées) ÷ (quantité initiale + quantités entrées).' },
          ],
        },
        {
          id: "d03-revision-6-doc",
          number: 2,
          title: "Arbitrer le stock de matériel de randonnée",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Article",
                "Stock initial",
                "Stock actuel",
                "Ventes sur 30 jours",
                "Prix d’achat unitaire"
              ],
              rows: [
                [
                  "Lampe",
                  "24",
                  "8",
                  "48",
                  "11 €"
                ],
                [
                  "Boussole",
                  "18",
                  "14",
                  "8",
                  "7 €"
                ]
              ]
            },
            {
              type: "p",
              text: "La lampe se vend en moyenne 1,6 unité par jour. Délai de quatre jours et stock de sécurité de 4. Pour l’alerte, arrondis le besoin pendant le délai à l’unité supérieure."
            }
          ]
        },
        {
          id: "d03-revision-dossier-doc1",
          number: 3,
          title: "Journal du stock de bouteilles",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Mouvement depuis lundi",
                "Quantité",
                "Coût"
              ],
              rows: [
                [
                  "Stock initial",
                  "24",
                  "8 € HT par unité"
                ],
                [
                  "Livraison reçue mardi",
                  "16",
                  "10 € HT par unité"
                ],
                [
                  "Ventes depuis l’entrée",
                  "25",
                  "Valorisées au CUMP après entrée"
                ]
              ]
            },
            {
              type: "p",
              text: "Le stock physique vendredi est de 13. Deux sorties pour casse sont justifiées et restent à enregistrer."
            }
          ]
        },
        {
          id: "d03-revision-dossier-doc2",
          number: 4,
          title: "Politique de réassort",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Ventes prévues de 4 unités par jour. Délai fournisseur de 3 jours. Stock de sécurité de 5 unités. La commande vise un niveau de 25 unités disponibles, livraisons confirmées comprises. Commande par carton de 6, arrondi du besoin au carton supérieur."
            }
          ]
        },
        {
          id: "d03-revision-dossier-doc3",
          number: 5,
          title: "Message reçu avant validation",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Un carton de 6 apparaît comme « annoncé » dans l’extranet, sans date ni confirmation. Puis le fournisseur confirme son arrivée demain matin, avant les prochaines ventes. Le responsable demande de comparer les deux situations."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd03-a4-a1',
          kind: 'grid',
          label: '1',
          title: 'Fiche de stock — CUMP après chaque entrée',
          instructions: 'Complète le stock, le CUMP et la valeur après chaque mouvement (arrondis au centime). La première ligne est donnée.',
          helps: ['Après une sortie, le CUMP ne change pas : seule la quantité baisse.', 'Après une entrée : CUMP = (stock × ancien CUMP + entrée × prix) ÷ (stock + entrée).', `06/06 : (5 × 122 + 4 × 126) ÷ 9 = ${fr(CASQUE.steps[1].cump)} €.`],
          outcomeIds: R1,
          groups: [{ label: 'Fiche de stock', columns: ['Entrée', 'Prix', 'Sortie', 'Stock', 'CUMP', 'Valeur'] }],
          rows: CASQUE.steps.map((s, i) => ({
            id: `c${i}`,
            label: `${s.date} — ${s.libelle}`,
            cells: [
              s.entree ?? '—',
              s.pu ?? '—',
              s.sortie ?? '—',
              i === 0 ? s.q : { answer: s.q, explain: `Stock après le mouvement : ${s.q}.` },
              i === 0 ? s.cump : { answer: s.cump, explain: s.entree ? `Nouveau CUMP : ${fr(s.cump)} €.` : `Sortie : le CUMP reste ${fr(s.cump)} €.`, tolerance: 0.011 },
              i === 0 ? s.valeur : { answer: s.valeur, explain: `${s.q} × ${fr(s.cump)} = ${fr(s.valeur)} €.`, tolerance: 0.06 },
            ],
          })),
        },
        {
          id: 'd03-a4-a2',
          kind: 'fields',
          label: '2 à 6',
          title: 'Comparer et analyser',
          instructions: `Calcule le CUMP de fin de période, compare, puis vérifie les indicateurs (période de 30 jours, durée préconisée : 11 jours).`,
          helps: ['CUMP fin de période = (5 × 122 + 4 × 126 + 7 × 124 + 3 × 125) ÷ 19.', `Stock moyen = (stock du 1er juin + stock du 29 juin) ÷ 2 ; ventes = ${CASQUE.ventes}.`, `Coefficient = ${CASQUE.ventes} ÷ ${CASQUE.moyen} ; durée = 30 ÷ coefficient.`],
          outcomeIds: R12,
          fields: [
            num('cumpFin', '2. CUMP de fin de période', CASQUE.cumpFin, `2 357 ÷ 19 = ${fr(CASQUE.cumpFin)} €.`, '€', 0.011),
            num('valFin', '2. Valeur du stock final avec ce CUMP', CASQUE.valeurFin, `${CASQUE.final.q} × ${fr(CASQUE.cumpFin)} = ${fr(CASQUE.valeurFin)} €.`, '€', 0.06),
            {
              id: 'methode',
              label: '3. Quelle méthode donne la valeur la plus importante au 29 juin ?',
              kind: 'choice',
              options: [
                { value: 'apres', label: 'Le CUMP après chaque entrée' },
                { value: 'fin', label: 'Le CUMP de fin de période' },
              ],
              answer: CASQUE.final.valeur > CASQUE.valeurFin ? 'apres' : 'fin',
              explain: `${fr(CASQUE.final.valeur)} € contre ${fr(CASQUE.valeurFin)} €.`,
            },
            num('moyen', '4. Stock moyen', CASQUE.moyen, `(5 + ${CASQUE.final.q}) ÷ 2 = ${fr(CASQUE.moyen)}.`, undefined, 0.001),
            num('coef', '4. Coefficient de rotation', CASQUE.coef, `${CASQUE.ventes} ÷ ${fr(CASQUE.moyen)} = ${fr(CASQUE.coef)}.`, undefined, 0.011),
            num('duree', '4. Durée de stockage', CASQUE.duree, `30 ÷ ${fr(CASQUE.coef)} = ${fr(CASQUE.duree)} jours.`, 'jours', 0.02),
            { id: 'comment', label: '5. Comparée aux 11 jours préconisés, la durée est…', kind: 'choice', options: [{ value: 'inf', label: 'légèrement inférieure : stock un peu juste' }, { value: 'sup', label: 'très supérieure : surstock' }], answer: 'inf', explain: `${fr(CASQUE.duree)} jours, un peu moins que 11 : le stock tourne vite.` },
            { id: 'origine', label: '6. Origine probable de la rupture du 11 juin', kind: 'choice', options: [{ value: 'a', label: 'La mise en avant a fait grimper les ventes sans que la commande soit augmentée à temps' }, { value: 'b', label: 'Une erreur de comptage le 1er juin' }, { value: 'c', label: 'Un retard de livraison du fournisseur' }], answer: 'a', explain: 'La mise en avant n’a pas été anticipée : la commande du 9 juin arrive trop tard.' },
          ],
        },
        {
          id: "d03-revision-6",
          label: "Nouveau cas d’application",
          title: "Arbitrer le stock de matériel de randonnée",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Calcule le seuil de la lampe, puis compare la durée d’écoulement des deux articles.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "1,6 × 4 = 6,4, arrondi à 7, puis 7 + 4 = 11."
          ],
          outcomeIds: [
            "d03-r1",
            "d03-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Calcule le stock d’alerte de la lampe.",
              kind: "number",
              answer: 11,
              explain: "1,6 × 4 = 6,4, arrondi à 7, puis 7 + 4 = 11."
            },
            {
              id: "q2",
              label: "Calcule la durée de stockage de la boussole en jours.",
              kind: "number",
              answer: 60,
              explain: "Stock moyen de 16, donc 30 × 16 ÷ 8 = 60 jours."
            },
            {
              id: "q3",
              label: "Écris la décision de réassort et le suivi pour les deux articles.",
              kind: "written",
              lines: 3,
              model: "Lancer l’alerte pour la lampe à 8 unités, sous le seuil de 11. Pour la boussole, suspendre le réassort immédiat et suivre les ventes, car le stock moyen représente 60 jours d’écoulement."
            }
          ]
        },
        {
          id: "d03-revision-dossier",
          label: "Dossier de décision",
          title: "Réassortir avec un inventaire corrigé et une livraison incertaine",
          instructions: "Lis les documents 3 et 4, puis écris ton diagnostic initial. Passe ensuite au document 5 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Reconstitue le stock en quantité et en valeur, puis traite la livraison selon son statut.",
            "Pour le CUMP, additionne les valeurs des deux lots et divise par le total d’unités. Ensuite, pour le réassort, sépare stock constaté et arrivages confirmés.",
            "Exemple. 5 unités à 4 € et 5 à 6 € valent ensemble 50 €, soit 5 € par unité. Après 2 sorties, il reste 8 unités. Une livraison confirmée de 4 porterait le disponible prévisionnel à 12."
          ],
          outcomeIds: [
            "d03-r1",
            "d03-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Calcule le CUMP après l’entrée et le stock théorique après ventes.",
              kind: "written",
              lines: 6,
              model: "Le CUMP est (24 × 8 + 16 × 10) ÷ 40 = 8,80 € HT. Le stock théorique après ventes est de 15 unités, pour 132 € HT."
            },
            {
              id: "q2",
              label: "Passe l’écriture de casse et valorise le stock corrigé.",
              kind: "written",
              lines: 6,
              model: "Sortie de 2 unités pour 17,60 € HT, avec le justificatif. Stock corrigé de 13 unités, soit 114,40 € HT, concordant avec le physique."
            },
            {
              id: "q3",
              label: "Calcule le seuil d’alerte et la commande avec et sans livraison confirmée.",
              kind: "written",
              lines: 6,
              model: "Seuil de 4 × 3 + 5 = 17. Sans confirmation, 13 unités sont disponibles, soit 12 à commander, deux cartons. Avec l’arrivée de 6 confirmée avant les prochaines ventes, le disponible prévisionnel est de 19, soit un carton pour atteindre 25."
            },
            {
              id: "q4",
              label: "Écris la décision et le point de contrôle à effectuer demain.",
              kind: "written",
              lines: 6,
              model: "Commander un carton supplémentaire d’après la confirmation. Vérifier demain les 6 unités annoncées. Si la livraison n’arrive pas, recalculer le disponible et relancer avant qu’une rupture se profile."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais valoriser un stock avec le CUMP.', 'Je sais relier une rupture à un événement commercial non anticipé.',
        "Je justifie la concordance entre stock physique, mouvements et valorisation.",
        "Je compare deux commandes selon le statut réel de la livraison.",
        "Je précise le contrôle qui pourrait déclencher une nouvelle décision."],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais lire une fiche de stock et utiliser les stocks minimum, de sécurité, d’alerte et maximum.',
        'Je sais adapter les stocks à un événement commercial ou à un aléa.',
        'Je sais valoriser un stock avec la méthode du CUMP.',
        'Je sais calculer un stock moyen, un coefficient de rotation et une durée de stockage.',
        'Je sais appliquer la méthode des 20/80.',
      ],
    },
  ],
};
