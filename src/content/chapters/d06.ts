import type { Chapter, ChoiceOption, Field } from '../../domain/chapter';

/**
 * DOSSIER 6 — Participer aux opérations d'inventaire
 *
 * Progression calquée sur le manuel de référence (contexte, 4 missions, synthèse, 3 applications).
 * Magasins, marques, personnages, documents et chiffres : ORIGINAUX et fictifs.
 * Tous les résultats chiffrés sont calculés ici puis testés.
 */

const R1 = ['d06-r1']; // Causes et conséquences de la démarque identifiées, solutions adaptées.

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });
const sgn = (n: number) => (n > 0 ? `+${fr(n)}` : fr(n).replace('-', '−'));

/* =============================== Mission 2 : rayon snacking =============================== */

export const SNACKING_CA = 1240;
export const SNACKING = [
  { id: 'cola', name: 'Cola classique 50 cl', pv: 1.29, theo: 34, rayon: 10, reserve: 22 },
  { id: 'zero', name: 'Cola zéro 50 cl', pv: 1.29, theo: 12, rayon: 4, reserve: 8 },
  { id: 'limo', name: 'Limonade citron 50 cl', pv: 1.29, theo: 22, rayon: 10, reserve: 10 },
  { id: 'the', name: 'Thé glacé pêche 50 cl', pv: 1.35, theo: 5, rayon: 5, reserve: 0 },
  { id: 'jus', name: 'Jus de pomme 25 cl', pv: 1.39, theo: 49, rayon: 10, reserve: 40 },
  { id: 'gaspacho', name: 'Gaspacho 25 cl', pv: 1.89, theo: 18, rayon: 6, reserve: 8 },
  { id: 'chips', name: 'Chips nature 45 g', pv: 0.99, theo: 4, rayon: 2, reserve: 0 },
  { id: 'ancienne', name: 'Chips à l’ancienne 45 g', pv: 0.99, theo: 30, rayon: 10, reserve: 20 },
  { id: 'fruits', name: 'Mélange fruits secs 40 g', pv: 1.6, theo: 50, rayon: 10, reserve: 38 },
].map((p) => {
  const reel = p.rayon + p.reserve;
  const ecart = reel - p.theo;
  return { ...p, reel, ecart, demarque: ecart < 0 ? r2(-ecart * p.pv) : 0, surmarque: ecart > 0 ? r2(ecart * p.pv) : 0 };
});
export const SNACK_TOT = (() => {
  const theo = SNACKING.reduce((n, p) => n + p.theo, 0);
  const reel = SNACKING.reduce((n, p) => n + p.reel, 0);
  const demarque = r2(SNACKING.reduce((n, p) => n + p.demarque, 0));
  const surmarque = r2(SNACKING.reduce((n, p) => n + p.surmarque, 0));
  const nette = r2(demarque - surmarque);
  return { theo, reel, ecart: reel - theo, demarque, surmarque, nette, taux: r2((nette / SNACKING_CA) * 100) };
})();

/* =============================== Mission 3 : DLC =============================== */

export const AUJOURDHUI = { jour: 30, mois: 3, label: '30 mars' };
export const SEUILS: Record<string, { label: string; jours: number }> = {
  traiteur: { label: 'Produits traiteur', jours: 3 },
  laitier: { label: 'Produits laitiers, charcuterie, produits de la mer', jours: 5 },
  oeufs: { label: 'Œufs', jours: 7 },
};
/** Nombre de jours entre le 30 mars et une date (même année, mars ou avril). */
export const joursAvant = (j: number, m: number) => (m === 3 ? j : 31 + j) - AUJOURDHUI.jour;
export const FRAIS = [
  { id: 'salade', name: 'Salade piémontaise 300 g', famille: 'traiteur', type: 'DLC', j: 2, m: 4 },
  { id: 'lait', name: 'Lait frais demi-écrémé 1 L', famille: 'laitier', type: 'DLC', j: 3, m: 4 },
  { id: 'jambon', name: 'Jambon blanc 4 tranches', famille: 'laitier', type: 'DLC', j: 4, m: 4 },
  { id: 'lasagnes', name: 'Lasagnes bolognaises 400 g', famille: 'traiteur', type: 'DLC', j: 5, m: 4 },
  { id: 'yaourts', name: 'Yaourts nature × 8', famille: 'laitier', type: 'DLC', j: 6, m: 4 },
  { id: 'creme', name: 'Crème fraîche épaisse 20 cl', famille: 'laitier', type: 'DLC', j: 8, m: 4 },
  { id: 'oeufs', name: 'Œufs plein air × 12', famille: 'oeufs', type: 'DLC', j: 10, m: 4 },
  { id: 'biscuits', name: 'Biscuits au beurre 200 g', famille: 'epicerie', type: 'DDM', j: 2, m: 4 },
].map((p) => {
  const restant = joursAvant(p.j, p.m);
  const seuil = SEUILS[p.famille]?.jours;
  const decision = p.type === 'DDM' ? 'garder' : restant <= seuil ? 'retirer' : restant <= seuil + 3 ? 'promo' : 'garder';
  return { ...p, restant, decision, date: `${String(p.j).padStart(2, '0')}/${String(p.m).padStart(2, '0')}` };
});
const DECISIONS: ChoiceOption[] = [
  { value: 'garder', label: 'Laisser en rayon' },
  { value: 'promo', label: 'Mettre en promotion « date courte »' },
  { value: 'retirer', label: 'Retirer de la vente et donner à une association' },
];

/* =============================== Application 1 : étiquette =============================== */

export const TROTT = { prix: 129.9, remise: 20 };
export const TROTT_PROMO = r2(TROTT.prix * (1 - TROTT.remise / 100));

/* =============================== Application 2 : accessoires =============================== */

export const ACCESS_CA = 2480;
export const ACCESSOIRES = [
  { ref: '2054', name: 'Chouchou imprimé foulard', theo: 10, reel: 10, pv: 6.99 },
  { ref: '4732', name: 'Bandeau imprimé rouge', theo: 9, reel: 7, pv: 7.99 },
  { ref: '4733', name: 'Bandeau imprimé bleu', theo: 10, reel: 10, pv: 7.99 },
  { ref: '1020', name: 'Barrette fantaisie', theo: 6, reel: 5, pv: 6.99 },
  { ref: '2022', name: 'Chouchou fleuri', theo: 10, reel: 8, pv: 5.99 },
  { ref: '2023', name: 'Lot de barrettes', theo: 12, reel: 9, pv: 9.99 },
  { ref: '2024', name: 'Lot de 3 chouchous', theo: 14, reel: 15, pv: 6.99 },
  { ref: '3133', name: 'Lot de 3 pinces', theo: 10, reel: 7, pv: 8.99 },
].map((a) => {
  const vTheo = r2(a.theo * a.pv);
  const vReel = r2(a.reel * a.pv);
  return { ...a, vTheo, vReel, ecart: a.reel - a.theo, vEcart: r2(vReel - vTheo) };
});
export const ACC_TOT = (() => {
  const vTheo = r2(ACCESSOIRES.reduce((n, a) => n + a.vTheo, 0));
  const vReel = r2(ACCESSOIRES.reduce((n, a) => n + a.vReel, 0));
  const vEcart = r2(vReel - vTheo);
  return {
    theo: ACCESSOIRES.reduce((n, a) => n + a.theo, 0),
    reel: ACCESSOIRES.reduce((n, a) => n + a.reel, 0),
    vTheo,
    vReel,
    vEcart,
    taux: r2((-vEcart / ACCESS_CA) * 100),
  };
})();

/* =============================== Application 3 : trousses =============================== */

export const TROUSSES_CA = 2500;
export const TROUSSES_COEF = 1.5;
export const TROUSSES = [
  { ref: '3045052604810', name: 'Trousse ronde cuir naturel', reserve: 8, magasin: 2, theo: 11, pa: 12.4 },
  { ref: '5400852538549', name: 'Trousse ronde verte', reserve: 5, magasin: 5, theo: 10, pa: 9.8 },
  { ref: '9346799445280', name: 'Trousse mandala rose', reserve: 5, magasin: 10, theo: 16, pa: 7.2 },
  { ref: '3108726488243', name: 'Trousse confettis 4D', reserve: 8, magasin: 10, theo: 18, pa: 6.6 },
  { ref: '3700408389819', name: 'Trousse ronde basique bleue', reserve: 15, magasin: 10, theo: 27, pa: 2.4 },
  { ref: '3700408426064', name: 'Trousse rectangulaire graphique', reserve: 4, magasin: 4, theo: 8, pa: 5.2 },
  { ref: '3700516240705', name: 'Trousse ronde voitures', reserve: 20, magasin: 7, theo: 30, pa: 4.6 },
  { ref: '3329680083231', name: 'Trousse trapèze cuir noir', reserve: 6, magasin: 6, theo: 13, pa: 14.0 },
  { ref: '3700126717123', name: 'Mini-trousse cuir marron', reserve: 10, magasin: 20, theo: 30, pa: 3.8 },
  { ref: '3700516222046', name: 'Trousse ronde pastel', reserve: 9, magasin: 0, theo: 9, pa: 5.6 },
].map((t) => {
  const reel = t.reserve + t.magasin;
  const ecart = reel - t.theo;
  const pv = r2(t.pa * TROUSSES_COEF);
  return { ...t, reel, ecart, pv, ecartHT: r2(ecart * t.pa), ecartTTC: r2(ecart * pv) };
});
export const TROUSSES_TOT = (() => {
  const ecartTTC = r2(TROUSSES.reduce((n, t) => n + t.ecartTTC, 0));
  const ecartHT = r2(TROUSSES.reduce((n, t) => n + t.ecartHT, 0));
  return { reel: TROUSSES.reduce((n, t) => n + t.reel, 0), theo: TROUSSES.reduce((n, t) => n + t.theo, 0), ecartHT, ecartTTC, taux: r2((-ecartTTC / TROUSSES_CA) * 100) };
})();

const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

/* ================================================================================== */

export const D06: Chapter = {
  unitId: 'd06',
  mission:
    "Grand Marché ferme une zone de vente pour compter les articles. Tu prépares la feuille de comptage, distingues les écarts documentés des écarts inexpliqués, puis proposes des mesures adaptées et vérifies les étiquettes du rayon.",
  fictionNotice: 'L’hypermarché Grand Marché, ses personnages, les autres entreprises, les marques et tous les chiffres de ce dossier sont imaginaires. Données créées pour Rayon.',
  company: {
    name: 'Grand Marché — Montluçon',
    tagline: 'Hypermarché, 45 000 références',
    facts: [
      ['Ton poste', 'Élève en PFMP, rayon Produits frais'],
      ['Ton tuteur', 'Thomas Lefèvre, responsable du rayon Produits frais'],
      ['La direction', 'Rachida Benamar, directrice adjointe'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Expliquer les écarts d’inventaire et limiter leur retour",
      hero: { id: 'd06-hero', alt: 'Allée centrale d’un hypermarché avec des caisses et des clients' },
      message: {
        from: 'Thomas Lefèvre',
        role: 'Responsable du rayon Produits frais',
        text: [
          'Bienvenue au Grand Marché ! Nous sommes un hypermarché indépendant affilié à la centrale d’achat Grand Marché : une offre très large, des prix bas toute l’année, 45 000 références alimentaires et non alimentaires.',
          'Mon équipe réalise bientôt l’inventaire du rayon. J’en profiterai pour te sensibiliser à la démarque, qui fait baisser la marge du magasin.',
        ],
      },
      documents: [
        {
          id: "d06-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "L’inventaire rapproche le stock compté et le stock indiqué par le système au même moment.",
                "Un écart peut venir d’un mauvais comptage, d’une sortie documentée sans saisie ou d’un événement encore inexpliqué. La preuve détermine la correction.",
                "Pour valoriser les unités manquantes, utilise le coût indiqué dans l’exercice et précise s’il est HT ou TTC."
              ]
            }
          ]
        },
        {
          id: 'd06-o-doc1',
          number: 1,
          title: 'L’hypermarché Grand Marché',
          look: 'article',
          blocks: [
            {
              type: 'facts',
              items: [
                ['Société', 'SAS Montluçon Distribution'],
                ['Enseigne', 'Grand Marché (groupement d’indépendants)'],
                ['Adresse', 'Zone commerciale des Marais, 03100 Montluçon'],
                ['Activité', 'Hypermarché à dominante alimentaire, 8 500 m²'],
                ['Concurrents', 'Autres hypermarchés de l’agglomération, magasins de hard-discount'],
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd06-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'Un magasin indépendant qui rejoint un groupement relève du commerce associé.', 'SAS = société par actions simplifiée.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['SAS Montluçon Distribution', 'Montluçon Distribution', 'Montlucon Distribution'], placeholder: 'Nom de la société', explain: 'SAS Montluçon Distribution (enseigne Grand Marché).' },
            { id: 'activite', label: 'Activité', kind: 'choice', options: [{ value: 'hyper', label: 'Hypermarché à dominante alimentaire' }, { value: 'superette', label: 'Supérette de proximité' }, { value: 'drive', label: 'Drive uniquement' }], answer: 'hyper', explain: '8 500 m², 45 000 références.' },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'associe', label: 'Commerce associé (groupement d’indépendants)' }, { value: 'integre', label: 'Commerce intégré' }, { value: 'isole', label: 'Commerce indépendant isolé' }], answer: 'associe', explain: 'Groupement d’indépendants : commerce associé.' },
            { id: 'statut', label: 'Statut juridique', kind: 'choice', options: [{ value: 'sas', label: 'SAS' }, { value: 'sarl', label: 'SARL' }, { value: 'ei', label: 'Entreprise individuelle' }], answer: 'sas', explain: 'SAS Montluçon Distribution.' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Montluçon', 'Montlucon', 'zone commerciale des Marais Montluçon'], placeholder: 'Ville', explain: 'Zone commerciale des Marais, Montluçon.' },
            { id: 'conc', label: 'Concurrents', kind: 'given', value: 'Autres hypermarchés de l’agglomération, magasins de hard-discount' },
          ],
        },
        {
          id: 'd06-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Premières réflexions',
          instructions: 'Réponds avec tes connaissances.',
          helps: ['Que se passe-t-il si le stock affiché par l’ordinateur est faux ?', 'Certains produits sont petits, chers ou se périment vite.', 'La démarque, c’est ce qui « disparaît » entre le stock prévu et le stock réel.'],
          outcomeIds: R1,
          fields: [
            {
              id: 'interet',
              label: '1. Quel est l’intérêt de connaître le nombre de produits en stock ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'commander', label: 'Commander au bon moment et éviter les ruptures' },
                { value: 'valeur', label: 'Connaître la valeur de la marchandise' },
                { value: 'pertes', label: 'Repérer les pertes et les vols' },
                { value: 'prix', label: 'Augmenter les prix' },
              ],
              answers: ['commander', 'valeur', 'pertes'],
              explain: 'Un stock juste sert à commander, à valoriser et à repérer la démarque.',
            },
            {
              id: 'produits',
              label: '2. Pour quels produits est-ce particulièrement important ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'perissables', label: 'Les produits périssables (dates courtes)' },
                { value: 'valeur', label: 'Les petits produits de valeur, faciles à voler' },
                { value: 'fragiles', label: 'Les produits fragiles' },
                { value: 'lourds', label: 'Les packs d’eau' },
              ],
              answers: ['perissables', 'valeur', 'fragiles'],
              explain: 'Ce sont les produits les plus exposés aux pertes.',
            },
            { id: 'sens', label: '3. Que signifie « démarque » dans la grande distribution ?', kind: 'choice', options: [{ value: 'a', label: 'La perte de marchandises (vol, casse, erreur) qui fait baisser la marge' }, { value: 'b', label: 'Une réduction de prix accordée par le fournisseur' }, { value: 'c', label: 'Le retrait d’une marque du magasin' }], answer: 'a', explain: 'Écart négatif entre le stock réel et le stock théorique.' },
          ],
        },
      ],
    },

    /* ================================ MISSION 1 ================================ */
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Participer aux opérations d’inventaire',
      guidance: 'guidé',
      message: {
        from: 'Thomas Lefèvre',
        role: 'Responsable du rayon Produits frais',
        text: ['J’ai planifié l’inventaire du rayon Produits frais pour les 5 et 6 mars. Je te remets quelques documents pour que tu sois opérationnel le jour J. Prépare ces deux journées en complétant les annexes.'],
      },
      documents: [
        {
          id: 'd06-m1-doc1',
          number: 1,
          title: 'L’obligation légale d’inventaire',
          look: 'texte',
          blocks: [{ type: 'p', text: 'Le Code de commerce (article L123-12) impose à tout commerçant d’enregistrer en comptabilité les mouvements de son patrimoine et de contrôler, au moins une fois par an, par un inventaire, l’existence et la valeur de ce qu’il possède, notamment ses stocks.' }],
        },
        {
          id: 'd06-m1-doc2',
          number: 2,
          title: 'Pourquoi et comment faire un inventaire ?',
          look: 'texte',
          blocks: [
            { type: 'list', title: 'Un inventaire régulier sert à :', items: ['connaître la valeur du stock ;', 'vérifier qu’aucune marchandise ne manque (perte, vol) : c’est mesurer la démarque ;', 'repérer d’éventuelles erreurs de gestion.'] },
            {
              type: 'table',
              head: ['Type d’inventaire', 'Principe'],
              rows: [
                ['Annuel', 'Comptage de tout le stock, dans tous les rayons, à la fin de l’exercice comptable.'],
                ['Permanent', 'Le stock est mis à jour à chaque entrée et à chaque sortie.'],
                ['Tournant', 'Une partie du stock est comptée à tour de rôle, sans arrêter l’activité du magasin.'],
              ],
            },
          ],
        },
        {
          id: 'd06-m1-doc3',
          number: 3,
          title: 'Procédure d’inventaire du rayon Produits frais',
          look: 'procedure',
          blocks: [
            { type: 'p', text: 'Les produits frais tournent vite et ont des dates limites courtes : le rayon est inventorié tous les trois mois, le jeudi, jour où il y a le moins de livraisons.' },
            { type: 'list', title: 'Avant (J−1)', items: ['Constituer les équipes.', 'Établir un plan par zone pour chaque équipe.', 'Ranger le rayon et la réserve ; mettre en réserve les produits qui ne tiennent pas en rayon.'] },
            { type: 'list', title: 'Pendant (J1 et J2)', items: ['J1 : compter les produits en réserve et relever les ventes de la journée (sorties caisse).', 'J2 : compter les produits en rayon avant l’ouverture.'] },
            { type: 'list', title: 'Après (fin de J2)', items: ['Additionner les quantités comptées (stock réel).', 'Comparer au stock informatique (stock théorique).', 'En cas de gros écart, refaire l’inventaire le mois suivant.'] },
          ],
        },
        {
          id: 'd06-m1-doc4',
          number: 4,
          title: 'Vocabulaire',
          look: 'postit',
          blocks: [{ type: 'p', text: 'UVC : unité de vente consommateur, le produit tel qu’il est vendu (à l’unité, en pack…). Stock réel : stock compté. Stock informatique (théorique) : entrées − sorties enregistrées.' }],
        },
        {
          id: "d06-revision-1-doc",
          number: 5,
          title: "Organiser un recomptage pendant l’inventaire",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "À 19 h, le système indique 27 gourdes. Le premier comptage trouve 24 en rayon et 2 en réserve. Une unité a été retirée du rayon à 18 h 55 pour une commande web et se trouve encore dans un bac à contrôler. Le retrait n’a pas encore été enregistré."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd06-m1-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Type d’inventaire',
          instructions: 'Identifie le type d’inventaire pratiqué au rayon Produits frais (documents 2 et 3).',
          helps: ['Tout le magasin est-il compté en même temps ?', 'Le rayon est compté tous les trois mois, les autres rayons continuent de vendre.', 'Une partie du stock à tour de rôle : inventaire tournant.'],
          outcomeIds: R1,
          fields: [
            { id: 'type', label: 'Type d’inventaire', kind: 'choice', options: [{ value: 'annuel', label: 'Annuel' }, { value: 'permanent', label: 'Permanent' }, { value: 'tournant', label: 'Tournant' }], answer: 'tournant', explain: 'Un seul rayon, tous les trois mois, sans fermer le magasin.' },
            { id: 'justif', label: 'Justification', kind: 'choice', options: [{ value: 'a', label: 'Seul le rayon Produits frais est compté, régulièrement, sans arrêter l’activité' }, { value: 'b', label: 'Tout le magasin est compté une fois par an' }, { value: 'c', label: 'Le stock est compté à chaque vente' }], answer: 'a', explain: 'C’est la définition de l’inventaire tournant.' },
          ],
        },
        {
          id: 'd06-m1-a2',
          kind: 'classify',
          label: 'Annexe 2',
          title: 'Organiser les tâches de l’inventaire',
          instructions: 'Classe chaque tâche dans la bonne phase (document 3).',
          helps: ['La préparation a lieu la veille.', 'J1 : réserve et ventes ; J2 : rayon avant l’ouverture.', 'La comparaison avec le stock informatique se fait à la fin.'],
          outcomeIds: R1,
          categories: [
            { id: 'prep', label: 'Préparation (J−1)' },
            { id: 'real', label: 'Réalisation (J1 et J2)' },
            { id: 'apres', label: 'Après l’inventaire' },
          ],
          items: [
            { id: 't1', text: 'Constituer les équipes de comptage', answer: 'prep', explain: 'Avant.' },
            { id: 't2', text: 'Remettre à chaque équipe le plan de sa zone', answer: 'prep', explain: 'Avant.' },
            { id: 't3', text: 'Ranger le rayon et mettre en réserve les produits qui ne tiennent pas en rayon', answer: 'prep', explain: 'Un rayon rangé se compte plus vite.' },
            { id: 't4', text: 'Compter les produits de la réserve', answer: 'real', explain: 'J1.' },
            { id: 't5', text: 'Relever les sorties caisse de la journée', answer: 'real', explain: 'J1.' },
            { id: 't6', text: 'Compter les produits en rayon avant l’ouverture', answer: 'real', explain: 'J2.' },
            { id: 't7', text: 'Additionner les quantités et les comparer au stock informatique', answer: 'apres', explain: 'Fin de J2.' },
            { id: 't8', text: 'Programmer un nouvel inventaire en cas de gros écart', answer: 'apres', explain: 'Le mois suivant.' },
          ],
        },
        {
          id: 'd06-m1-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Comparer stock théorique et stock réel',
          instructions: 'Pour chaque cas, dis si la situation est satisfaisante et choisis les raisons possibles.',
          helps: ['Si les deux stocks sont égaux, aucune marchandise n’a disparu.', 'Moins de produits que prévu : perte, vol, casse, erreur.', 'Plus de produits que prévu : une erreur a « créé » du stock (caisse, livraison, produit offert).'],
          outcomeIds: R1,
          fields: [
            { id: 'eg', label: 'Stock réel = stock informatique : satisfaisant ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Aucun écart : la gestion du rayon est fiable.' },
            { id: 'inf', label: 'Stock réel < stock informatique : satisfaisant ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Il manque des produits : c’est de la démarque.' },
            {
              id: 'infr',
              label: 'Stock réel < stock informatique : raisons possibles',
              kind: 'multi',
              options: [
                { value: 'vol', label: 'Vol' },
                { value: 'casse', label: 'Casse non enregistrée' },
                { value: 'livraison', label: 'Produits manquants à la livraison non détectés' },
                { value: 'offert', label: 'Produits offerts par le fournisseur' },
              ],
              answers: ['vol', 'casse', 'livraison'],
              explain: 'Un produit offert augmente le stock : c’est l’inverse.',
            },
            { id: 'sup', label: 'Stock réel > stock informatique : satisfaisant ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Un écart, même positif, révèle une erreur de gestion.' },
            {
              id: 'supr',
              label: 'Stock réel > stock informatique : raisons possibles',
              kind: 'multi',
              options: [
                { value: 'offert', label: 'Produits offerts par le fournisseur, non enregistrés' },
                { value: 'caisse', label: 'Erreur de caisse (produit scanné deux fois)' },
                { value: 'livraison', label: 'Livraison supérieure à la commande, non enregistrée' },
                { value: 'vol', label: 'Vol' },
              ],
              answers: ['offert', 'caisse', 'livraison'],
              explain: 'C’est de la surmarque.',
            },
          ],
        },
        {
          id: "d06-revision-1",
          label: "Annexe complémentaire",
          title: "Organiser un recomptage pendant l’inventaire",
          instructions: "Lis le document 5. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Précise le périmètre et l’heure avant de conclure à un écart.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "24 + 2 + 1 = 27."
          ],
          outcomeIds: [
            "d06-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel total physique obtient-on après vérification du bac ?",
              kind: "number",
              answer: 27,
              explain: "24 + 2 + 1 = 27."
            },
            {
              id: "q2",
              label: "Rédige la consigne de clôture du comptage.",
              kind: "written",
              lines: 3,
              model: "Faire recompter rayon, réserve et bac retrait. Inscrire 27 au total physique à 19 h, dont 1 réservée. Contrôler ensuite le mouvement de la réservation selon la procédure pour éviter une double sortie."
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
      title: 'Distinguer et évaluer la démarque',
      guidance: 'accompagné',
      message: {
        from: 'Thomas Lefèvre',
        role: 'Responsable du rayon Produits frais',
        text: [
          'Au Grand Marché, nous surveillons la démarque de près, car elle touche tous les rayons. Identifie d’abord les types de démarque repérés cette semaine (document 1).',
          'Ensuite, à partir du relevé du scanner du rayon Snacking, calcule la démarque et son taux. Dans l’alimentaire, le taux est en général de 1 %. Sur la période, le rayon a réalisé 1 240 € de chiffre d’affaires.',
        ],
      },
      documents: [
        {
          id: 'd06-m2-doc1',
          number: 1,
          title: 'Les types de démarque',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Type', 'Définition', 'Exemples'],
              rows: [
                ['Démarque connue', 'Stock réel < stock théorique ; la perte est constatée et enregistrée', 'Produit abîmé, cassé, périmé, défectueux ; produit soldé ou démarqué'],
                ['Démarque inconnue', 'Stock réel < stock théorique ; la cause n’est découverte qu’à l’inventaire', 'Vol, erreur d’étiquetage, erreur de caisse, erreur de livraison non détectée'],
                ['Surmarque', 'Stock réel > stock théorique', 'Produit offert par le fournisseur, livraison en trop, erreur de caisse ou d’étiquetage'],
              ],
            },
          ],
        },
        {
          id: 'd06-m2-doc2',
          number: 2,
          title: 'Relevé du scanner lors de l’inventaire du rayon Snacking',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Produit', 'Rayon', 'Réserve'],
              align: ['left', 'right', 'right'],
              rows: SNACKING.map((p) => [p.name, String(p.rayon), String(p.reserve)]),
            },
            { type: 'formula', text: 'Démarque = stock réel − stock théorique (en quantité, puis × PV TTC)\nDémarque nette = démarque − surmarque\nTaux de démarque = démarque nette ÷ CA de la période × 100' },
          ],
        },
        {
          id: "d06-revision-2-doc",
          number: 3,
          title: "Ventiler la démarque après le comptage",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le stock théorique avant régularisation est de 80 unités. Le comptage confirme 73 unités. Trois unités retirées pour casse ont une fiche signée mais aucune sortie saisie. Les quatre autres manquants n’ont pas de justificatif. Le coût d’achat est de 6 € HT par unité."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd06-m2-a1',
          kind: 'classify',
          label: 'Annexe 1',
          title: 'Extrait du cahier de démarque',
          instructions: 'Classe chaque situation de la semaine (document 1).',
          helps: ['Le stock a-t-il baissé ou augmenté ?', 'Si la perte est constatée et notée, elle est connue. Si on ne la découvre qu’à l’inventaire, elle est inconnue.', 'Vol, double scan : inconnue ; casse, promotion date courte : connue ; produit en plus : surmarque.'],
          outcomeIds: R1,
          categories: [
            { id: 'inconnue', label: 'Démarque inconnue' },
            { id: 'connue', label: 'Démarque connue' },
            { id: 'surmarque', label: 'Surmarque' },
          ],
          items: [
            { id: 's1', text: 'Un pack de bouteilles a été éventré ; le personnel a décidé de vendre les bouteilles à l’unité.', answer: 'connue', explain: 'Produit abîmé, constaté.' },
            { id: 's2', text: 'Des sachets de fromage râpé à 3 jours de leur DLC sont passés à −30 % dans le bac des dates courtes.', answer: 'connue', explain: 'Produit démarqué volontairement.' },
            { id: 's3', text: 'Une cliente glisse des autocollants pour enfants dans son sac.', answer: 'inconnue', explain: 'Vol.' },
            { id: 's4', text: 'Pour l’achat d’une palette de lait, le fournisseur offre 10 packs.', answer: 'surmarque', explain: 'Produits offerts : stock en plus.' },
            { id: 's5', text: 'Au déballage, deux tee-shirts de plus que la commande ont été livrés.', answer: 'surmarque', explain: 'Livraison en trop.' },
            { id: 's6', text: 'Un client mange des chaussons aux pommes dans le magasin sans les payer.', answer: 'inconnue', explain: 'Vol.' },
            { id: 's7', text: 'Les soldes de la semaine : produits à −40 %.', answer: 'connue', explain: 'Baisse de valeur connue.' },
            { id: 's8', text: 'Une barquette de viande est ouverte et doit être jetée.', answer: 'connue', explain: 'Produit abîmé, enregistré.' },
            { id: 's9', text: 'Une collègue a entré 15 flacons de gel douche en stock alors que seulement 5 ont été livrés.', answer: 'inconnue', explain: 'Erreur de réception : le stock informatique est faux.' },
            { id: 's10', text: 'Une hôtesse de caisse a scanné deux fois un produit que le client n’avait pris qu’une fois.', answer: 'surmarque', explain: 'Le produit sort deux fois de l’informatique : le stock réel est supérieur.' },
          ],
        },
        {
          id: 'd06-m2-a2',
          kind: 'grid',
          label: 'Annexe 2',
          title: 'Valoriser la démarque du rayon Snacking',
          instructions: 'Calcule le stock réel (rayon + réserve), l’écart en quantité, puis la démarque ou la surmarque en euros (écart × PV TTC). Mets 0 quand il n’y en a pas.',
          helps: ['Stock réel = rayon + réserve (document 2).', 'Écart = stock réel − stock théorique : négatif = démarque, positif = surmarque.', `Cola classique : 10 + 22 = 32 ; 32 − 34 = −2 ; 2 × 1,29 = 2,58 € de démarque.`],
          outcomeIds: R1,
          groups: [
            { label: 'Données', columns: ['PV TTC', 'Stock théorique'] },
            { label: 'Inventaire', columns: ['Stock réel', 'Écart'] },
            { label: 'Valorisation', columns: ['Démarque (€)', 'Surmarque (€)'] },
          ],
          rows: SNACKING.map((p) => ({
            id: p.id,
            label: p.name,
            cells: [
              p.pv,
              p.theo,
              { answer: p.reel, explain: `${p.rayon} + ${p.reserve} = ${p.reel}.` },
              { answer: p.ecart, explain: `${p.reel} − ${p.theo} = ${sgn(p.ecart)}.` },
              { answer: p.demarque, explain: p.demarque ? `${-p.ecart} × ${fr(p.pv)} = ${fr(p.demarque)} €.` : 'Pas de démarque : 0.', tolerance: 0.011 },
              { answer: p.surmarque, explain: p.surmarque ? `${p.ecart} × ${fr(p.pv)} = ${fr(p.surmarque)} €.` : 'Pas de surmarque : 0.', tolerance: 0.011 },
            ],
          })),
          legend: 'Écart négatif = démarque ; écart positif = surmarque.',
        },
        {
          id: 'd06-m2-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Calculer et analyser le taux de démarque',
          instructions: 'Totalise ton tableau, puis calcule le taux de démarque du rayon.',
          helps: ['Additionne chaque colonne.', 'Démarque nette = total démarque − total surmarque.', `Taux = démarque nette ÷ ${SNACKING_CA} × 100.`],
          outcomeIds: R1,
          fields: [
            num('theo', '1. Total du stock théorique', SNACK_TOT.theo, `${SNACK_TOT.theo} UVC.`, 'UVC'),
            num('reel', '2. Total du stock réel', SNACK_TOT.reel, `${SNACK_TOT.reel} UVC.`, 'UVC'),
            num('dem', '3. Total de la démarque', SNACK_TOT.demarque, `${fr(SNACK_TOT.demarque)} €.`, '€', 0.011),
            num('sur', '4. Total de la surmarque', SNACK_TOT.surmarque, `${fr(SNACK_TOT.surmarque)} €.`, '€', 0.011),
            num('nette', '5. Démarque nette', SNACK_TOT.nette, `${fr(SNACK_TOT.demarque)} − ${fr(SNACK_TOT.surmarque)} = ${fr(SNACK_TOT.nette)} €.`, '€', 0.011),
            num('taux', '6. Taux de démarque', SNACK_TOT.taux, `${fr(SNACK_TOT.nette)} ÷ ${SNACKING_CA} × 100 = ${fr(SNACK_TOT.taux)} %.`, '%', 0.011),
            { id: 'analyse', label: '7. Comparé à la moyenne du secteur (1 %), ce taux est…', kind: 'choice', options: [{ value: 'sup', label: 'Supérieur : il faut chercher les causes et agir' }, { value: 'inf', label: 'Inférieur : le rayon est bien géré' }], answer: SNACK_TOT.taux > 1 ? 'sup' : 'inf', explain: `${fr(SNACK_TOT.taux)} % > 1 %.` },
            { id: 'pire', label: '8. Quel produit pèse le plus dans la démarque ?', kind: 'choice', select: true, options: SNACKING.map((p) => ({ value: p.id, label: p.name })), answer: [...SNACKING].sort((a, b) => b.demarque - a.demarque)[0].id, explain: `${[...SNACKING].sort((a, b) => b.demarque - a.demarque)[0].name} : ${eur([...SNACKING].sort((a, b) => b.demarque - a.demarque)[0].demarque)}.` },
          ],
        },
        {
          id: "d06-revision-2",
          label: "Annexe complémentaire",
          title: "Ventiler la démarque après le comptage",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Traite les trois unités documentées avant de valoriser l’écart inexpliqué.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "3 × 6 = 18 € HT."
          ],
          outcomeIds: [
            "d06-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle est la démarque connue en euros HT ?",
              kind: "number",
              answer: 18,
              explain: "3 × 6 = 18 € HT."
            },
            {
              id: "q2",
              label: "Quelle est la démarque inexpliquée en euros HT ?",
              kind: "number",
              answer: 24,
              explain: "4 × 6 = 24 € HT."
            },
            {
              id: "q3",
              label: "Indique les deux suites à donner.",
              kind: "written",
              lines: 3,
              model: "Régulariser la casse avec la fiche signée. Après recomptage, ouvrir une recherche sur les quatre unités restantes en contrôlant réceptions, ventes et transferts avant toute attribution de cause."
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
      title: 'Lutter contre la démarque connue et inconnue',
      guidance: 'accompagné',
      message: {
        from: 'Rachida Benamar',
        role: 'Directrice adjointe',
        text: [
          'Je suis inquiète du taux de démarque inconnue du magasin. Pour chaque système antivol de notre catalogue, indique à quel produit ou à quel endroit nous pourrions l’utiliser.',
          'J’ai aussi relevé des situations qui reviennent souvent : propose-moi des solutions. Enfin, Thomas a besoin d’un contrôle des dates au rayon Frais.',
        ],
      },
      documents: [
        {
          id: 'd06-m3-doc1',
          number: 1,
          title: 'Catalogue des moyens de protection contre le vol',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Moyen', 'Caractéristiques'],
              rows: [
                ['Antivol bouchon', 'Gros bouchon en plastique avec marqueur magnétique, qui se clipse sur le col d’une bouteille.'],
                ['Spider', 'Alarme autonome : boîtier relié à des câbles qui entourent le produit ; pour les articles à forte valeur.'],
                ['Boîtier antivol', 'Boîte transparente fermée dans laquelle on place un petit article.'],
                ['Antivol à clou', 'S’accroche aux tissus grâce à un clou ; retiré en caisse avec un détacheur.'],
                ['Antivol optique', 'Pince qui se referme sur la branche d’une monture de lunettes.'],
                ['Caméra de surveillance', 'Enregistre ce qui se passe dans et autour du magasin.'],
                ['Étiquette RFID', 'Étiquette autocollante à puce radio, détectée à distance.'],
                ['Miroir', 'Miroir bombé qui permet de voir les angles morts.'],
                ['Portique', 'Porte de détection qui sonne si un antivol n’a pas été désactivé.'],
              ],
            },
          ],
        },
        {
          id: 'd06-m3-doc2',
          number: 2,
          title: 'DLC et DDM',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'La date limite de consommation (DLC, « à consommer jusqu’au… ») concerne les produits frais très périssables. Après cette date, le produit peut présenter un risque pour la santé : il ne doit plus être vendu.' },
            { type: 'p', text: 'La date de durabilité minimale (DDM, « à consommer de préférence avant… ») concerne surtout l’épicerie et les boissons. Après cette date, le produit peut perdre du goût mais peut être consommé sans danger.' },
          ],
        },
        {
          id: 'd06-m3-doc3',
          number: 3,
          title: `Message de Thomas Lefèvre — le ${AUJOURDHUI.label}`,
          look: 'memo',
          blocks: [
            { type: 'p', text: 'Pour respecter les dates et lutter contre le gaspillage, nous retirons les produits à DLC avant la date et nous les donnons aux associations partenaires :' },
            { type: 'list', items: Object.values(SEUILS).map((s) => `${s.label} : retrait ${s.jours} jours avant la DLC.`) },
            { type: 'p', text: 'Les produits à moins de 3 jours de leur date de retrait passent en promotion « date courte ». Les produits à DDM restent en rayon.' },
          ],
        },
        {
          id: "d06-revision-3-doc",
          number: 4,
          title: "Choisir des mesures ciblées et les mesurer",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Pendant quatre semaines, le rayon relève 9 casses sur un présentoir instable et 5 écarts sans cause établie sur des articles déplacés entre réserve et rayon. Les équipes peuvent renforcer le mobilier et enregistrer les transferts au moment du déplacement."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd06-m3-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Choisir les moyens de lutte contre la démarque inconnue',
          instructions: 'Pour chaque moyen de protection, choisis le produit, le rayon ou la zone concernés (document 1).',
          helps: ['Regarde sur quoi chaque antivol se fixe.', 'Les équipements qui ne se posent pas sur un produit protègent une zone.', 'Portique : aux sorties ; miroir : dans les angles morts.'],
          outcomeIds: R1,
          fields: (
            [
              ['bouchon', 'Antivol bouchon', 'alcool'],
              ['spider', 'Spider', 'valeur'],
              ['boitier', 'Boîtier antivol', 'petits'],
              ['clou', 'Antivol à clou', 'textile'],
              ['optique', 'Antivol optique', 'lunettes'],
              ['camera', 'Caméra de surveillance', 'zones'],
              ['rfid', 'Étiquette RFID', 'emballes'],
              ['miroir', 'Miroir', 'angles'],
              ['portique', 'Portique', 'sorties'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            select: true,
            options: [
              { value: 'alcool', label: 'Bouteilles d’alcool et de champagne' },
              { value: 'valeur', label: 'Coffrets de parfum, enceintes, articles chers' },
              { value: 'petits', label: 'Cartes mémoire, lames de rasoir' },
              { value: 'textile', label: 'Vêtements' },
              { value: 'lunettes', label: 'Lunettes de soleil' },
              { value: 'zones', label: 'Caisses, entrées, réserve, rayons sensibles' },
              { value: 'emballes', label: 'Produits emballés de valeur (DVD, cosmétiques)' },
              { value: 'angles', label: 'Angles morts et fins de rayon' },
              { value: 'sorties', label: 'Sorties du magasin et des caisses' },
            ],
            answer,
            explain: 'Le moyen est adapté à la forme et à la valeur du produit ou à la zone à surveiller.',
          })),
        },
        {
          id: 'd06-m3-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Proposer des solutions aux situations récurrentes',
          instructions: 'Pour chaque situation, choisis la recommandation la plus adaptée.',
          helps: ['Cherche la cause de chaque perte.', 'Certaines solutions concernent la formation, d’autres la manutention, l’étiquetage ou les commandes.', 'Un stock invendable se traite avant qu’il ne soit trop tard : promotion, retour fournisseur, commandes ajustées.'],
          outcomeIds: R1,
          fields: (
            [
              ['carton', 'Un carton a été écrasé en réserve pendant la mise en rayon des produits laitiers.', 'manut'],
              ['prix', 'Des erreurs de prix ont été détectées sur le jambon 4 tranches.', 'etiquette'],
              ['cahier', 'Des produits défectueux n’ont pas été notés dans le cahier de démarque.', 'cahier'],
              ['froid', 'Une palette de yaourts a été oubliée en réserve : la chaîne du froid a été rompue.', 'reception'],
              ['cahiers', 'Un stock de cahiers à l’effigie d’un dessin animé passé de mode risque d’être invendable.', 'commande'],
              ['caisse', 'Des réductions de prix ont été accordées en caisse sans motif.', 'caisse'],
            ] as const
          ).map(([id, label, answer]): Field => ({
            id,
            label,
            kind: 'choice',
            select: true,
            options: [
              { value: 'manut', label: 'Former aux gestes de manutention et limiter les empilages' },
              { value: 'etiquette', label: 'Contrôler les étiquettes chaque matin et après chaque changement de prix' },
              { value: 'cahier', label: 'Rappeler à l’équipe d’enregistrer chaque casse dans le cahier de démarque' },
              { value: 'reception', label: 'Ranger les produits froids dès la réception et contrôler la réserve' },
              { value: 'commande', label: 'Ajuster les commandes et écouler le stock en promotion' },
              { value: 'caisse', label: 'Imposer la validation d’un responsable pour toute réduction en caisse' },
            ],
            answer,
            explain: 'La solution agit sur la cause de la démarque.',
          })),
        },
        {
          id: 'd06-m3-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Vérifier les dates du rayon Frais',
          instructions: `Nous sommes le ${AUJOURDHUI.label}. Pour chaque produit, choisis la décision à prendre (documents 2 et 3).`,
          helps: ['Compte les jours entre le 30 mars et la date du produit (mars compte 31 jours).', 'Compare au délai de retrait de sa famille : si les jours restants sont inférieurs ou égaux au délai, on retire ; jusqu’à 3 jours de plus, promotion.', 'DDM : le produit reste en rayon.'],
          outcomeIds: R1,
          fields: FRAIS.map(
            (p): Field => ({
              id: p.id,
              label: `${p.name} — ${p.type} ${p.date}`,
              kind: 'choice',
              select: true,
              options: DECISIONS,
              answer: p.decision,
              explain:
                p.type === 'DDM'
                  ? 'DDM : consommable sans danger, il reste en rayon.'
                  : `${p.restant} jour(s) avant la DLC, retrait à ${SEUILS[p.famille].jours} jours : ${DECISIONS.find((d) => d.value === p.decision)!.label.toLowerCase()}.`,
            }),
          ),
        },
        {
          id: "d06-revision-3",
          label: "Annexe complémentaire",
          title: "Choisir des mesures ciblées et les mesurer",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Associe chaque mesure à un problème précis et définis la prochaine période de comparaison.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Réparer puis tester la stabilité du présentoir et comparer le nombre de casses sur quatre semaines. Scanner chaque transfert au départ et contrôler les écarts non expliqués sur la même période."
          ],
          outcomeIds: [
            "d06-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Construis un plan à deux actions pour le mois suivant.",
              kind: "written",
              lines: 3,
              model: "Réparer puis tester la stabilité du présentoir et comparer le nombre de casses sur quatre semaines. Scanner chaque transfert au départ et contrôler les écarts non expliqués sur la même période."
            },
            {
              id: "q2",
              label: "Quelle conclusion serait prématurée après une seule semaine ?",
              kind: "written",
              lines: 3,
              model: "Attribuer automatiquement la disparition des écarts à une action. La fréquentation, les volumes et les comptages peuvent varier. Il faut comparer des périodes et des volumes comparables."
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
      title: 'Étiqueter et sécuriser les produits',
      guidance: 'autonome',
      message: {
        from: 'Thomas Lefèvre',
        role: 'Responsable du rayon Produits frais',
        text: [
          'L’étiquetage des produits est très réglementé, qu’il soit sur papier ou électronique (document 1). Précise l’intérêt de chaque information de nos étiquettes électroniques de gondole (document 2).',
          'Il est aussi de notre responsabilité que le rayon soit propre et bien rangé. Pour les situations observées pendant ta PFMP, indique le problème pour le client et pour le magasin (document 3).',
        ],
      },
      documents: [
        {
          id: 'd06-m4-doc1',
          number: 1,
          title: 'La réglementation de l’affichage des prix',
          look: 'texte',
          blocks: [
            {
              type: 'list',
              items: [
                'Le prix de tout produit exposé doit être affiché, sur le produit ou sur une étiquette ou un panneau à côté.',
                'Il est indiqué en euros, toutes taxes comprises ; le client n’a pas à le demander.',
                'Les produits préemballés alimentaires et d’hygiène affichent aussi le prix au kilo ou au litre.',
                'Pour un lot, on affiche le prix du lot et le prix de chaque élément.',
              ],
            },
          ],
        },
        {
          id: 'd06-m4-doc2',
          number: 2,
          title: 'L’étiquette électronique de gondole (EEG)',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'L’EEG est un petit écran fixé sur la tablette du rayon. Le prix est modifié à distance depuis le logiciel du magasin : il est toujours identique à celui de la caisse, et le personnel gagne du temps pour conseiller les clients. Avant l’ouverture, l’écran affiche des informations de gestion pour l’employé ; après l’ouverture, les informations pour le client.' },
            {
              type: 'table',
              caption: 'Avant l’ouverture (affichage employé)',
              head: ['Information', 'Exemple'],
              rows: [['Dénomination', 'JUS POMME FRAMBOISE 90 CL'], ['Fournisseur', 'VERGERS DU CENTRE'], ['Stock', '2'], ['À recevoir', '6'], ['Facing', '3'], ['Ventes de la veille', '10']],
            },
            {
              type: 'table',
              caption: 'Après l’ouverture (affichage client)',
              head: ['Information', 'Exemple'],
              rows: [['Dénomination et contenance', 'JAMBON BLANC 4 TRANCHES 150 G'], ['Prix', '2,15 €'], ['Prix au kilo', '14,33 €/kg'], ['Code-barres', '3 2 1 4 5 6 7 8 9 0 1 2 8']],
            },
            { type: 'note', text: 'Limite : quand tous les prix changent en même temps, le système peut saturer ; il faut alors contrôler les étiquettes.' },
          ],
        },
        {
          id: 'd06-m4-doc3',
          number: 3,
          title: 'Extrait du guide de sécurité du magasin',
          look: 'procedure',
          blocks: [
            {
              type: 'list',
              items: [
                'Faire la rotation des produits périssables pour ne pas dépasser les DLC.',
                'Vérifier la stabilité des présentoirs et le poids maximal des étagères.',
                'Stocker les produits lourds près du sol ; limiter les empilages.',
                'Contrôler régulièrement les rayons pour retirer la casse et l’enregistrer.',
                'Ouvrir les cartons avec soin pendant la mise en rayon.',
                'Vérifier la présence des antivols sur les produits sensibles.',
              ],
            },
          ],
        },
        {
          id: "d06-revision-4-doc",
          number: 4,
          title: "Réconcilier l’étiquette, le produit et la caisse",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Support",
                "Référence",
                "Libellé",
                "Prix TTC"
              ],
              rows: [
                [
                  "Produit",
                  "GE48",
                  "Gourde inox 480 mL",
                  "Prix non imprimé"
                ],
                [
                  "Étiquette rayon",
                  "GE84",
                  "Gourde inox 840 mL",
                  "17,90 €"
                ],
                [
                  "Fichier prix validé",
                  "GE48",
                  "Gourde inox 480 mL",
                  "14,90 €"
                ]
              ]
            },
            {
              type: "p",
              text: "Le rayon utilise le fichier prix validé et vérifie le scan avant de rouvrir la zone."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd06-m4-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Les informations de l’EEG',
          instructions: 'Pour chaque information, indique quand elle s’affiche et à quoi elle sert.',
          helps: ['Le stock et les quantités à recevoir n’intéressent pas le client.', 'Le facing est le nombre de produits visibles de face sur la première rangée.', 'Le prix au kilo permet au client de comparer deux formats.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Affichage', 'Intérêt'],
          fields: (
            [
              ['denom', 'Dénomination du produit', 'deux', 'identifier', 'Employé et client reconnaissent le produit.'],
              ['fournisseur', 'Fournisseur', 'avant', 'commande', 'Savoir qui contacter pour commander.'],
              ['contenance', 'Contenance', 'apres', 'comparer', 'Le client sait quelle quantité il achète.'],
              ['stock', 'Stock', 'avant', 'reappro', 'Savoir s’il faut réapprovisionner.'],
              ['recevoir', 'À recevoir', 'avant', 'commande', 'Éviter de commander deux fois.'],
              ['facing', 'Facing', 'avant', 'reappro', 'Remplir le rayon avec le bon nombre de faces.'],
              ['code', 'Code-barres', 'apres', 'caisse', 'Le prix de l’étiquette correspond à celui de la caisse.'],
              ['prix', 'Prix en € et prix au kilo', 'apres', 'comparer', 'Information obligatoire pour choisir et comparer.'],
            ] as const
          ).flatMap(([id, label, aff, interet, explain]): Field[] => [
            { id: `${id}.0`, label, kind: 'choice', select: true, options: [{ value: 'avant', label: 'Avant l’ouverture' }, { value: 'apres', label: 'Après l’ouverture' }, { value: 'deux', label: 'Les deux' }], answer: aff, explain },
            {
              id: `${id}.1`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'identifier', label: 'Identifier le produit' },
                { value: 'commande', label: 'Gérer les commandes' },
                { value: 'reappro', label: 'Réapprovisionner le rayon' },
                { value: 'comparer', label: 'Informer le client et lui permettre de comparer' },
                { value: 'caisse', label: 'Faire correspondre étiquette et caisse' },
              ],
              answer: interet,
              explain,
            },
          ]),
        },
        {
          id: 'd06-m4-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Problématiques rencontrées',
          instructions: 'Pour chaque situation, choisis le problème pour le client et pour le magasin.',
          helps: ['Un prix différent en caisse : qui est lésé, et quelle image pour le magasin ?', 'Un prix absent est contraire à la réglementation (document 1).', 'Un emballage percé est un risque sanitaire et une perte.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Problème pour le client', 'Problème pour le magasin'],
          fields: (
            [
              ['jambon', 'Une cliente revient à l’accueil : son jambon est passé à 2,37 € en caisse alors que l’étiquette indique 2,07 €.', 'paye', 'image'],
              ['yaourts', 'Un client demande le prix d’un pack de yaourts : il n’y a pas d’étiquette sur l’étagère.', 'info', 'reglement'],
              ['viande', 'Dans le bac réfrigéré, une barquette de viande est percée.', 'sante', 'perte'],
            ] as const
          ).flatMap(([id, label, client, magasin]): Field[] => [
            {
              id: `${id}.0`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'paye', label: 'Il paie plus cher que prévu' },
                { value: 'info', label: 'Il ne connaît pas le prix et doit chercher quelqu’un' },
                { value: 'sante', label: 'Risque pour sa santé' },
              ],
              answer: client,
              explain: 'Le client est lésé, mal informé ou exposé à un risque.',
            },
            {
              id: `${id}.1`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'image', label: 'Mauvaise image, client mécontent, remboursement de l’écart' },
                { value: 'reglement', label: 'Non-respect de l’obligation d’affichage, vente perdue' },
                { value: 'perte', label: 'Produit à retirer et à enregistrer en démarque connue' },
              ],
              answer: magasin,
              explain: 'Chaque erreur coûte au magasin.',
            },
          ]),
        },
        {
          id: 'd06-m4-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Sécuriser les produits',
          instructions: 'Réponds à l’aide du document 3.',
          helps: ['Relis le guide de sécurité.', 'Les produits lourds se rangent en bas.', 'Une casse non enregistrée devient de la démarque inconnue.'],
          outcomeIds: R1,
          fields: [
            { id: 'lourds', label: '1. Où ranger des packs de lait ?', kind: 'choice', options: [{ value: 'bas', label: 'Près du sol' }, { value: 'haut', label: 'En haut de l’étagère' }], answer: 'bas', explain: 'Les produits lourds se stockent près du sol.' },
            {
              id: 'regles',
              label: '2. Quelles règles limitent à la fois les accidents et la démarque ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'rotation', label: 'Faire la rotation des dates' },
                { value: 'cartons', label: 'Ouvrir les cartons avec soin' },
                { value: 'casse', label: 'Retirer et enregistrer la casse' },
                { value: 'empiler', label: 'Empiler au maximum pour gagner de la place' },
              ],
              answers: ['rotation', 'cartons', 'casse'],
              explain: 'Empiler davantage augmente les risques de chute et de casse.',
            },
          ],
        },
        {
          id: "d06-revision-4",
          label: "Annexe complémentaire",
          title: "Réconcilier l’étiquette, le produit et la caisse",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "La bonne étiquette correspond à la référence et au volume, pas seulement à la famille de produits.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "GE48. Gourde inox 480 mL. 14,90 € TTC."
          ],
          outcomeIds: [
            "d06-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris le contenu de l’étiquette de rayon.",
              kind: "written",
              lines: 3,
              model: "GE48. Gourde inox 480 mL. 14,90 € TTC."
            },
            {
              id: "q2",
              label: "Quel test clôt le signalement ?",
              kind: "written",
              lines: 3,
              model: "Scanner GE48 sur le produit, vérifier qu’il passe à 14,90 € TTC et remplacer l’ancienne étiquette. Contrôler que GE84 reste affichée au bon emplacement."
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
          id: 'd06-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les quatre parties.',
          helps: ['Reprends le document 2 de la mission 1.', 'Démarque = stock réel − stock théorique.', 'Pense aux mentions obligatoires de l’étiquette.'],
          outcomeIds: R1,
          fields: [
            { id: 'types', label: '1. Les trois types d’inventaire (plusieurs réponses)', kind: 'multi', options: [{ value: 'annuel', label: 'Annuel' }, { value: 'permanent', label: 'Permanent' }, { value: 'tournant', label: 'Tournant' }, { value: 'mensuel', label: 'Mensuel obligatoire' }], answers: ['annuel', 'permanent', 'tournant'], explain: 'L’inventaire obligatoire est au moins annuel.' },
            { id: 'prep', label: '1. Une tâche de la phase de préparation', kind: 'choice', options: [{ value: 'equipes', label: 'Constituer les équipes' }, { value: 'comparer', label: 'Comparer au stock informatique' }, { value: 'compter', label: 'Compter la réserve' }], answer: 'equipes', explain: 'Avec le plan par zone et le rangement.' },
            { id: 'formule', label: '2. Démarque = stock réel − stock…', kind: 'text', accept: ['théorique', 'theorique', 'informatique', 'stock théorique', 'stock informatique'], explain: 'Stock théorique (informatique).' },
            { id: 'taux', label: '2. Taux de démarque = démarque ÷ … × 100', kind: 'choice', options: [{ value: 'ca', label: 'CA du rayon' }, { value: 'stock', label: 'Stock réel' }, { value: 'marge', label: 'Marge' }], answer: 'ca', explain: 'Démarque ÷ CA × 100.' },
            {
              id: 'lutte',
              label: '3. Moyens de lutte contre la démarque (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'antivols', label: 'Poser des antivols et surveiller' },
                { value: 'commandes', label: 'Ajuster les commandes' },
                { value: 'reception', label: 'Contrôler les réceptions' },
                { value: 'ignorer', label: 'Ne pas enregistrer la casse' },
              ],
              answers: ['antivols', 'commandes', 'reception'],
              explain: 'Sans enregistrement, la casse devient de la démarque inconnue.',
            },
            { id: 'mentions', label: '4. Mentions obligatoires de l’étiquette (plusieurs réponses)', kind: 'multi', options: [{ value: 'prix', label: 'Prix TTC' }, { value: 'kg', label: 'Prix au kilo ou au litre' }, { value: 'denom', label: 'Dénomination' }, { value: 'stock', label: 'Stock' }], answers: ['prix', 'kg', 'denom'], explain: 'Le stock est une information de gestion.' },
          ],
        },
        {
          id: 'd06-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq questions rapides.',
          helps: ['Relis la fiche de révision.', 'Écart = réel − théorique.', 'Taux = démarque ÷ CA × 100.'],
          outcomeIds: R1,
          fields: [
            num('q1', 'Stock théorique 40, stock réel 37 : écart ?', -3, '37 − 40 = −3.'),
            num('q2', '3 produits manquants à 4,50 € : démarque en € ?', 13.5, '3 × 4,50 = 13,50 €.', '€', 0.001),
            num('q3', 'Démarque 30 € pour un CA de 2 000 € : taux ?', 1.5, '30 ÷ 2 000 × 100 = 1,5 %.', '%', 0.001),
            { id: 'q4', label: 'Un vol est une démarque…', kind: 'choice', options: [{ value: 'inconnue', label: 'Inconnue' }, { value: 'connue', label: 'Connue' }], answer: 'inconnue', explain: 'Elle n’est découverte qu’à l’inventaire.' },
            { id: 'q5', label: 'Après la DDM, un produit…', kind: 'choice', options: [{ value: 'peut', label: 'Peut être consommé sans danger' }, { value: 'danger', label: 'Est dangereux' }], answer: 'peut', explain: 'C’est la DLC qui est impérative.' },
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Inventaire : obligation légale, au moins une fois par an.', 'Inventaire annuel, permanent, tournant.', 'Stock réel (compté) et stock théorique (informatique).', 'Démarque connue, démarque inconnue, surmarque.', 'DLC (impérative) et DDM (indicative).', 'Étiquette électronique de gondole : prix identique en rayon et en caisse.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Préparer (équipes, plan, rangement), compter (réserve puis rayon), comparer.', 'Calculer l’écart, le valoriser au PV TTC, puis le taux de démarque.', 'Adapter le moyen antivol au produit ou à la zone.', 'Contrôler les dates et décider : laisser, promouvoir, retirer et donner.'] },
        { title: 'Formules à connaître', kind: 'formules', items: ['Écart = stock réel − stock théorique', 'Démarque en € = quantité manquante × prix', 'Démarque nette = démarque − surmarque', 'Taux de démarque = démarque nette ÷ CA × 100'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Oublier la réserve dans le stock réel.', 'Confondre démarque connue (enregistrée) et inconnue (découverte à l’inventaire).', 'Croire qu’une surmarque est une bonne nouvelle : c’est aussi une erreur.', 'Retirer un produit à DDM comme s’il était à DLC.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Enregistrer chaque casse dans le cahier de démarque.', 'Contrôler les étiquettes et les dates chaque matin.', 'Donner aux associations plutôt que jeter.', 'Garder le rayon propre, rangé et stable.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Inventaire', 'Stock réel', 'Stock théorique', 'Démarque connue', 'Démarque inconnue', 'Surmarque', 'Taux de démarque', 'DLC', 'DDM', 'EEG'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Un comptage fiable précise l’heure, le périmètre et les mouvements intervenus pendant l’opération.",
            "Une cause établie se justifie par une trace. Une hypothèse de cause appelle une vérification.",
            "Une bonne mesure de prévention se contrôle au moyen d’un relevé comparable."
          ]
        },
      ],
    },

    /* ================================ APPLICATION 1 ================================ */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Réaliser une étiquette prix',
      guidance: 'autonome',
      hero: { id: 'd06-trottinette', alt: 'Trottinette urbaine pliable aux roues larges' },
      message: {
        from: 'Yanis Bertrand',
        role: 'Responsable de rayon, Glisse & Sport',
        text: ['Tu es vendeur ou vendeuse chez Glisse & Sport. Je veux mettre en avant une nouvelle trottinette, en promotion du 1ᵉʳ au 10 avril. Prépare son étiquette prix et l’affiche promotionnelle.'],
      },
      documents: [
        {
          id: 'd06-a1-doc1',
          number: 1,
          title: 'Fiche produit — trottinette Roulix Urban 200',
          look: 'texte',
          blocks: [
            { type: 'facts', items: [['Marque', 'Roulix'], ['Modèle', 'Urban 200, réf. RX200-BL'], ['Prix habituel', eur(TROTT.prix)], ['Promotion', `−${TROTT.remise} % du 1ᵉʳ au 10 avril`]] },
            { type: 'list', items: ['Cadre en aluminium, pliable en 3 secondes', 'Roues de 200 mm en polyuréthane', 'Guidon réglable en hauteur, poignées ergonomiques', 'Utilisateur jusqu’à 100 kg'] },
          ],
        },
        {
          id: 'd06-a1-doc2',
          number: 2,
          title: 'Consignes pour l’affiche promotionnelle',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Logo du magasin · prix avant et après promotion · le mot « promotion » · pourcentage de remise · désignation du produit · dates de l’offre · un slogan accrocheur, sans faute !' }],
        },
      ],
      activities: [
        {
          id: 'd06-a1-a1',
          kind: 'fields',
          label: '1',
          title: 'Préparer l’étiquette prix',
          instructions: 'Calcule le prix promotionnel et choisis les mentions de l’étiquette.',
          helps: [`Remise = ${fr(TROTT.prix)} × ${TROTT.remise} ÷ 100.`, 'Prix promotionnel = prix habituel − remise.', 'Une étiquette de promotion affiche l’ancien prix barré et le nouveau prix.'],
          outcomeIds: R1,
          fields: [
            num('remise', '1. Montant de la remise', r2(TROTT.prix - TROTT_PROMO), `${fr(TROTT.prix)} × 20 % = ${fr(r2(TROTT.prix - TROTT_PROMO))} €.`, '€', 0.011),
            num('promo', '2. Prix promotionnel', TROTT_PROMO, `${fr(TROTT.prix)} − ${fr(r2(TROTT.prix - TROTT_PROMO))} = ${fr(TROTT_PROMO)} €.`, '€', 0.011),
            {
              id: 'mentions',
              label: '3. Mentions à faire figurer sur l’étiquette (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'designation', label: 'Désignation et marque' },
                { value: 'ancien', label: 'Prix habituel barré' },
                { value: 'nouveau', label: 'Prix promotionnel TTC' },
                { value: 'ref', label: 'Référence' },
                { value: 'marge', label: 'Marge réalisée' },
              ],
              answers: ['designation', 'ancien', 'nouveau', 'ref'],
              explain: 'La marge ne s’affiche jamais au client.',
            },
          ],
        },
        {
          id: 'd06-a1-a2',
          kind: 'open',
          label: '2',
          title: 'Concevoir l’affiche promotionnelle',
          instructions: 'Rédige le contenu de ton affiche en respectant les consignes du document 2.',
          helps: ['Reprends chaque consigne du post-it.', 'Un slogan court : 4 à 8 mots.', 'Exemple de slogan : « Filez en ville, pliez en 3 secondes ! »'],
          outcomeIds: R1,
          prompts: [
            { id: 'slogan', label: 'Slogan', lines: 1 },
            { id: 'contenu', label: 'Texte de l’affiche (désignation, prix, remise, dates…)', lines: 5 },
          ],
          selfCheck: ['Le mot « promotion » et le pourcentage apparaissent.', 'Les deux prix et les dates sont indiqués.', 'Le texte ne contient aucune faute.', 'Le slogan donne envie.'],
        },
      ],
      selfAssessment: ['Je sais calculer un prix promotionnel.', 'Je sais réaliser une étiquette et une affiche conformes.'],
    },

    /* ================================ APPLICATION 2 ================================ */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Évaluer la démarque',
      guidance: 'autonome',
      hero: { id: 'd06-accessoires', alt: 'Présentoir de bijoux fantaisie et d’accessoires pour cheveux' },
      message: {
        from: 'Marion Delahaye',
        role: 'Responsable, boutique Line & Mode, Quimper',
        text: ['Après l’inventaire, les bijoux et accessoires sont très touchés par la démarque inconnue. Compare le stock théorique au stock compté, évalue la démarque et propose-moi des actions.'],
      },
      documents: [
        {
          id: 'd06-a2-doc1',
          number: 1,
          title: 'Extrait de la fiche inventaire — accessoires pour cheveux',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Produit', 'Libellé', 'Stock théorique', 'Quantité inventoriée', 'PV TTC'],
              align: ['left', 'left', 'right', 'right', 'right'],
              rows: ACCESSOIRES.map((a) => [a.ref, a.name, String(a.theo), String(a.reel), eur(a.pv)]),
            },
            { type: 'note', text: `CA du rayon accessoires sur la période : ${eur(ACCESS_CA)} TTC. Taux moyen de démarque inconnue dans l’enseigne : 1 %.` },
          ],
        },
      ],
      activities: [
        {
          id: 'd06-a2-a1',
          kind: 'grid',
          label: '1',
          title: 'Comparer stocks théoriques et stocks inventoriés',
          instructions: 'Valorise chaque stock au PV TTC, puis calcule l’écart en quantité et en valeur.',
          helps: ['Valeur = quantité × PV TTC.', 'Écart = stock réel − stock théorique (négatif si démarque).', `Réf. 2023 : 12 × 9,99 = 119,88 € ; 9 × 9,99 = 89,91 € ; écart −3, soit −29,97 €.`],
          outcomeIds: R1,
          groups: [
            { label: 'Stock théorique', columns: ['Quantité', 'Valeur'] },
            { label: 'Stock réel', columns: ['Quantité', 'Valeur'] },
            { label: 'Écart', columns: ['Quantité', 'Valeur'] },
          ],
          rows: ACCESSOIRES.map((a) => ({
            id: a.ref,
            label: `${a.ref} — ${a.name}`,
            cells: [
              a.theo,
              { answer: a.vTheo, explain: `${a.theo} × ${fr(a.pv)} = ${fr(a.vTheo)} €.`, tolerance: 0.011 },
              a.reel,
              { answer: a.vReel, explain: `${a.reel} × ${fr(a.pv)} = ${fr(a.vReel)} €.`, tolerance: 0.011 },
              { answer: a.ecart, explain: `${a.reel} − ${a.theo} = ${sgn(a.ecart)}.` },
              { answer: a.vEcart, explain: `${fr(a.vReel)} − ${fr(a.vTheo)} = ${sgn(a.vEcart)} €.`, tolerance: 0.011 },
            ],
          })),
        },
        {
          id: 'd06-a2-a2',
          kind: 'fields',
          label: '2',
          title: 'Évaluer la démarque et ses conséquences',
          instructions: 'Totalise, calcule le taux de démarque et analyse.',
          helps: ['Additionne les colonnes de valeur.', `Démarque = valeur réelle − valeur théorique ; taux = démarque ÷ ${ACCESS_CA} × 100.`, 'La démarque est une perte sèche : elle réduit directement la marge.'],
          outcomeIds: R1,
          fields: [
            num('vtheo', '1. Valeur totale du stock théorique', ACC_TOT.vTheo, `${fr(ACC_TOT.vTheo)} €.`, '€', 0.021),
            num('vreel', '2. Valeur totale du stock réel', ACC_TOT.vReel, `${fr(ACC_TOT.vReel)} €.`, '€', 0.021),
            num('dem', '3. Montant de la démarque (valeur positive)', -ACC_TOT.vEcart, `${fr(ACC_TOT.vTheo)} − ${fr(ACC_TOT.vReel)} = ${fr(-ACC_TOT.vEcart)} €.`, '€', 0.021),
            num('taux', '4. Taux de démarque', ACC_TOT.taux, `${fr(-ACC_TOT.vEcart)} ÷ ${ACCESS_CA} × 100 = ${fr(ACC_TOT.taux)} %.`, '%', 0.011),
            {
              id: 'cons',
              label: '5. Conséquences pour la boutique (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'marge', label: 'Perte de marge' },
                { value: 'rupture', label: 'Ruptures non prévues : le stock informatique est faux' },
                { value: 'commandes', label: 'Commandes faussées' },
                { value: 'gain', label: 'Augmentation du CA' },
              ],
              answers: ['marge', 'rupture', 'commandes'],
              explain: `Avec ${fr(ACC_TOT.taux)} % contre 1 % en moyenne, la boutique doit agir.`,
            },
            {
              id: 'actions',
              label: '6. Actions à mener (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'presentoir', label: 'Rapprocher le présentoir de la caisse, dans le champ de vision des vendeuses' },
                { value: 'antivol', label: 'Poser des étiquettes antivol sur les lots' },
                { value: 'miroir', label: 'Installer un miroir sur l’angle mort' },
                { value: 'sensibiliser', label: 'Sensibiliser l’équipe et saluer chaque client' },
                { value: 'fond', label: 'Placer le présentoir au fond du magasin' },
              ],
              answers: ['presentoir', 'antivol', 'miroir', 'sensibiliser'],
              explain: 'Les petits articles se placent sous surveillance, pas dans une zone isolée.',
            },
          ],
        },
        {
          id: 'd06-a2-a3',
          kind: 'open',
          label: '3',
          title: 'Rédiger un compte rendu',
          instructions: 'Rédige un compte rendu à Marion Delahaye sur l’impact de la démarque inconnue et les actions à mener.',
          helps: ['Commence par les chiffres : montant et taux, comparés à 1 %.', 'Explique les conséquences pour la boutique.', 'Termine par 3 actions concrètes, classées par priorité.'],
          outcomeIds: R1,
          prompts: [{ id: 'cr', label: 'Compte rendu', lines: 10 }],
          selfCheck: ['Le montant et le taux sont cités.', 'La comparaison avec la moyenne de 1 % est faite.', 'Au moins trois actions sont proposées.', 'Le ton est professionnel, sans faute.'],
        },
      ],
      selfAssessment: ['Je sais valoriser un écart d’inventaire.', 'Je sais calculer un taux de démarque et proposer des actions.'],
    },

    /* ================================ APPLICATION 3 ================================ */
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Réaliser un inventaire avec le tableur',
      guidance: 'autonome',
      hero: { id: 'd06-papeterie', alt: 'Chariot rempli de fournitures scolaires colorées' },
      message: {
        from: 'Camille Roux',
        role: 'Responsable du rayon Papeterie, magasin Culture & Loisirs',
        text: ['Un inventaire vient d’être réalisé au rayon Papeterie. Étudie les résultats de l’îlot « Meilleures ventes » des trousses : calcule le stock réel, compare-le au stock théorique et valorise les écarts. L’an dernier, le taux de démarque du rayon était de 1,3 %.'],
      },
      documents: [
        {
          id: 'd06-a3-doc1',
          number: 1,
          title: 'Relevé de l’inventaire et données de gestion',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Désignation', 'Réserve', 'Magasin', 'Stock théorique', 'PA HT'],
              align: ['left', 'right', 'right', 'right', 'right'],
              rows: TROUSSES.map((t) => [t.name, String(t.reserve), String(t.magasin), String(t.theo), eur(t.pa)]),
            },
            { type: 'note', text: `Coefficient multiplicateur appliqué : ${fr(TROUSSES_COEF)} (PV TTC = PA HT × 1,5). CA TTC de l’îlot sur la période : ${eur(TROUSSES_CA)}.` },
          ],
        },
        {
          id: "d06-revision-5-doc",
          number: 2,
          title: "Traiter l’inventaire d’un magasin de loisirs créatifs",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le fichier indique 60 boîtes de feutres à 4,50 € HT l’unité. Le premier comptage donne 53. Le recomptage trouve 2 boîtes en réserve omises au premier passage. Une fiche de casse explique 3 boîtes sorties sans saisie."
            }
          ]
        },
        {
          id: "d06-revision-dossier-doc1",
          number: 3,
          title: "Comptage et valeurs de stock",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Référence",
                "Stock théorique",
                "Rayon",
                "Réserve",
                "Coût unitaire HT"
              ],
              rows: [
                [
                  "Tasse T6",
                  "70",
                  "42",
                  "23",
                  "4 €"
                ],
                [
                  "Gourde G8",
                  "30",
                  "18",
                  "13",
                  "9 €"
                ],
                [
                  "Carnet C2",
                  "54",
                  "32",
                  "18",
                  "2,50 €"
                ]
              ]
            },
            {
              type: "p",
              text: "Périmètre figé à 19 h. La fiche de casse signée de T6 porte sur 3 unités non sorties du système."
            }
          ]
        },
        {
          id: "d06-revision-dossier-doc2",
          number: 4,
          title: "Journal des mouvements",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Pour C2, deux unités ont été transférées vers un autre magasin à 18 h 40. Le bon est signé par les deux magasins. Aucune sortie n’a été saisie. Pour G8, l’équipe signale une suspicion d’erreur de lecture entre deux volumes proches."
            }
          ]
        },
        {
          id: "d06-revision-dossier-doc3",
          number: 5,
          title: "Résultat du recomptage",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Une unité comptée dans G8 porte en réalité la référence G9. Aucun autre écart de comptage n’est constaté. La responsable veut distinguer le coût des anomalies expliquées de celui qui reste à investiguer."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd06-a3-a1',
          kind: 'grid',
          label: '1',
          title: 'Tableau d’inventaire des trousses',
          instructions: 'Calcule le stock réel, l’écart, le PV TTC, puis l’écart valorisé au PA HT et au PV TTC. Tu peux reproduire ce tableau dans un tableur.',
          helps: ['Stock réel = réserve + magasin. Écart = réel − théorique.', 'PV TTC = PA HT × 1,5. Écart valorisé = écart × prix.', `Première ligne : 8 + 2 = 10 ; 10 − 11 = −1 ; PV 12,40 × 1,5 = 18,60 € ; écart −12,40 € HT et −18,60 € TTC.`],
          outcomeIds: R1,
          groups: [
            { label: 'Quantités', columns: ['Réserve', 'Magasin', 'Stock réel', 'Théorique', 'Écart'] },
            { label: 'Valorisation', columns: ['PA HT', 'PV TTC', 'Écart HT', 'Écart TTC'] },
          ],
          rows: TROUSSES.map((t) => ({
            id: t.ref,
            label: t.name,
            cells: [
              t.reserve,
              t.magasin,
              { answer: t.reel, explain: `${t.reserve} + ${t.magasin} = ${t.reel}.` },
              t.theo,
              { answer: t.ecart, explain: `${t.reel} − ${t.theo} = ${sgn(t.ecart)}.` },
              t.pa,
              { answer: t.pv, explain: `${fr(t.pa)} × 1,5 = ${fr(t.pv)} €.`, tolerance: 0.011 },
              { answer: t.ecartHT, explain: `${sgn(t.ecart)} × ${fr(t.pa)} = ${sgn(t.ecartHT)} €.`, tolerance: 0.011 },
              { answer: t.ecartTTC, explain: `${sgn(t.ecart)} × ${fr(t.pv)} = ${sgn(t.ecartTTC)} €.`, tolerance: 0.011 },
            ],
          })),
        },
        {
          id: 'd06-a3-a2',
          kind: 'fields',
          label: '2',
          title: 'Calculer le taux de démarque',
          instructions: 'Totalise et compare à l’an dernier.',
          helps: ['Additionne les colonnes du tableau.', `Taux = démarque TTC ÷ ${TROUSSES_CA} × 100.`, 'Un coefficient multiplicateur permet de passer du PA HT au PV TTC.'],
          outcomeIds: R1,
          fields: [
            num('reel', '1. Stock réel total', TROUSSES_TOT.reel, `${TROUSSES_TOT.reel} trousses.`),
            num('theo', '2. Stock théorique total', TROUSSES_TOT.theo, `${TROUSSES_TOT.theo} trousses.`),
            num('ht', '3. Démarque valorisée au PA HT (valeur positive)', -TROUSSES_TOT.ecartHT, `${fr(-TROUSSES_TOT.ecartHT)} €.`, '€', 0.021),
            num('ttc', '4. Démarque valorisée au PV TTC (valeur positive)', -TROUSSES_TOT.ecartTTC, `${fr(-TROUSSES_TOT.ecartTTC)} €.`, '€', 0.021),
            num('taux', '5. Taux de démarque', TROUSSES_TOT.taux, `${fr(-TROUSSES_TOT.ecartTTC)} ÷ ${TROUSSES_CA} × 100 = ${fr(TROUSSES_TOT.taux)} %.`, '%', 0.011),
            { id: 'evol', label: '6. Par rapport à l’an dernier (1,3 %), la démarque…', kind: 'choice', options: [{ value: 'hausse', label: 'Augmente' }, { value: 'baisse', label: 'Diminue' }], answer: TROUSSES_TOT.taux > 1.3 ? 'hausse' : 'baisse', explain: `${fr(TROUSSES_TOT.taux)} % contre 1,3 %.` },
            { id: 'cible', label: '7. Quelle trousse surveiller en priorité ?', kind: 'choice', select: true, options: TROUSSES.map((t) => ({ value: t.ref, label: t.name })), answer: [...TROUSSES].sort((a, b) => a.ecartTTC - b.ecartTTC)[0].ref, explain: `${[...TROUSSES].sort((a, b) => a.ecartTTC - b.ecartTTC)[0].name} : la perte la plus élevée en valeur.` },
          ],
        },
        {
          id: 'd06-a3-a3',
          kind: 'open',
          label: '3',
          title: 'Envoyer un compte rendu par courriel',
          instructions: 'Rédige le courriel de compte rendu à Camille Roux.',
          helps: ['Objet clair, formule de politesse, phrases courtes.', 'Donne les chiffres clés et l’évolution par rapport à l’an dernier.', 'Propose une ou deux actions ciblées sur les références les plus touchées.'],
          outcomeIds: R1,
          prompts: [
            { id: 'objet', label: 'Objet', lines: 1 },
            { id: 'corps', label: 'Message', lines: 9 },
          ],
          selfCheck: ['L’objet résume le message.', 'Le taux est comparé à celui de l’an dernier.', 'Les références les plus touchées sont citées.', 'Une solution est proposée.'],
        },
        {
          id: "d06-revision-5",
          label: "Nouveau cas d’application",
          title: "Traiter l’inventaire d’un magasin de loisirs créatifs",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Repars du comptage corrigé et déduis ensuite la casse documentée de l’écart total.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "53 + 2 = 55."
          ],
          outcomeIds: [
            "d06-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel stock physique retiens-tu ?",
              kind: "number",
              answer: 55,
              explain: "53 + 2 = 55."
            },
            {
              id: "q2",
              label: "Quelle démarque demeure inexpliquée en euros HT ?",
              kind: "number",
              answer: 9,
              explain: "(60 − 55 − 3) × 4,50 = 9 € HT."
            },
            {
              id: "q3",
              label: "Écris la note à la responsable.",
              kind: "written",
              lines: 3,
              model: "Stock physique de 55. Régulariser trois boîtes en casse avec le justificatif et ouvrir une vérification sur les deux restantes. Revoir le plan de comptage pour inclure explicitement la réserve."
            }
          ]
        },
        {
          id: "d06-revision-dossier",
          label: "Dossier de décision",
          title: "Mener une enquête de démarque sans conclure trop tôt",
          instructions: "Lis les documents 3 et 4, puis écris ton diagnostic initial. Passe ensuite au document 5 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Établis une ligne par référence, en distinguant correction du physique et régularisation du système.",
            "Pour chaque référence, additionne rayon et réserve, puis soustrais le stock théorique. Corrige ensuite le physique en cas de mauvais comptage et le théorique en cas de mouvement oublié.",
            "Exemple. Le système indique 20, le physique corrigé 16 et un bon justifie 3 sorties non saisies. Le théorique corrigé est 17. Il reste une unité inexpliquée, à valoriser au coût unitaire."
          ],
          outcomeIds: [
            "d06-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Calcule les écarts bruts avant recomptage et explique le cas positif.",
              kind: "written",
              lines: 6,
              model: "T6, 65 − 70 = −5. G8, 31 − 30 = +1. C2, 50 − 54 = −4. Le +1 de G8 est provisoire et peut venir d’une confusion de référence."
            },
            {
              id: "q2",
              label: "Rapproche les justificatifs et le recomptage. Quels écarts négatifs restent en unités et en valeur ?",
              kind: "written",
              lines: 6,
              model: "T6, −5 dont 3 en casse, reste 2, soit 8 €. G8 revient à 30 après retrait de l’unité G9, écart nul. C2, −4 dont 2 en transfert justifié, reste 2, soit 5 €. Total inexpliqué de 13 € HT."
            },
            {
              id: "q3",
              label: "Classe les corrections entre saisies de mouvement et correction du comptage.",
              kind: "written",
              lines: 6,
              model: "Saisir les sorties de 3 T6 pour casse et de 2 C2 pour transfert après validation. Retirer G9 du comptage G8 et le rattacher à sa référence sans créer de sortie G8. Vérifier le total de G9 avant clôture."
            },
            {
              id: "q4",
              label: "Propose un contrôle ciblé pour les écarts persistants et un indicateur de suivi.",
              kind: "written",
              lines: 6,
              model: "Revoir réceptions, ventes et transferts de T6 et C2 autour des heures relevées, puis recompter le même périmètre. Suivre le montant des écarts inexpliqués et le délai de saisie des mouvements."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais organiser un tableau d’inventaire.', 'Je sais valoriser une démarque au prix d’achat et au prix de vente.',
        "Je rapproche chaque écart de comptage des justificatifs disponibles.",
        "Je sépare correction du comptage, saisie de mouvement et investigation.",
        "Je valorise uniquement l’écart inexpliqué résiduel."],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais préparer et réaliser un inventaire.',
        'Je sais distinguer démarque connue, démarque inconnue et surmarque.',
        'Je sais calculer une démarque et un taux de démarque.',
        'Je sais proposer des moyens de lutte adaptés.',
        'Je sais contrôler les dates et l’étiquetage des produits.',
      ],
    },
  ],
};
