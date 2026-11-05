import type { Chapter, ChoiceOption, Field, GridActivity } from '../../domain/chapter';

const w = (id: string, label: string, model: string, criteria?: string[], lines = 3): Field => ({ id, label, kind: 'written', model, criteria, lines });

/**
 * DOSSIER 12 — Mener l'action commerciale et évaluer les résultats
 *
 * Progression calquée sur le manuel de référence (contexte, 4 missions, synthèse, 3 applications).
 * Enseignes, marques, personnages et chiffres : ORIGINAUX et fictifs. Tous les indicateurs sont calculés ici puis testés.
 */

const R1 = ['d12-r1']; // Supports et planification (contribuent à l'évaluation de l'action).
const R2 = ['d12-r1']; // Performances contrôlées et évaluées.
const R3 = ['d12-r2']; // Solutions et axes d'amélioration justifiés.
const R23 = ['d12-r1', 'd12-r2'];

export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });
const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

/* =============================== Mission 2 : budget de communication =============================== */

export const CA_N1 = 5000;
export const BUDGET = r2((CA_N1 * 5) / 100);
export const SUPPORTS = (() => {
  const radio = 40 + 15;
  const flyers = r2(300 * (0.15 + 0.35));
  const affiches = r2(10 * 2.99);
  const total = r2(radio + flyers + affiches);
  return { radio, flyers, affiches, total, ok: total <= BUDGET };
})();

/* =============================== Missions 3-4 : performances =============================== */

export const JOUETS = [
  { id: 'zombie', name: 'Jeu coopératif « Zombie Rush »', hebdo: 4, mois: 26, pa: 14.5, ttcHors: 28.99, ttcAction: 28.99, prevu: 30 },
  { id: 'cuisine', name: 'Cuisine d’imitation « Petit Chef »', hebdo: 2, mois: 30, pa: 58.4, ttcHors: 129.99, ttcAction: 99.99, prevu: 25 },
  { id: 'babyfoot', name: 'Table multijeux 4 en 1', hebdo: 1, mois: 11, pa: 190, ttcHors: 289.99, ttcAction: 249.99, prevu: 10 },
].map((j) => {
  const pvHors = r2(j.ttcHors / 1.2);
  const pvAction = r2(j.ttcAction / 1.2);
  const mHors = r2(pvHors - j.pa);
  const mAction = r2(pvAction - j.pa);
  const caHors = r2(pvHors * j.hebdo * 4);
  const caAction = r2(pvAction * j.mois);
  const mtHors = r2(mHors * j.hebdo * 4);
  const mtAction = r2(mAction * j.mois);
  return {
    ...j,
    hebdoAction: r2(j.mois / 4),
    pvHors,
    pvAction,
    mHors,
    mAction,
    caHors,
    caAction,
    mtHors,
    mtAction,
    caPrevu: r2(pvAction * j.prevu),
    margePrevue: r2(mAction * j.prevu),
  };
});
export const PERF_TOT = (() => {
  const sum = (k: 'caAction' | 'mtAction' | 'caPrevu' | 'margePrevue' | 'caHors') => r2(JOUETS.reduce((n, j) => n + j[k], 0));
  const ca = sum('caAction');
  return {
    prevuQ: JOUETS.reduce((n, j) => n + j.prevu, 0),
    realiseQ: JOUETS.reduce((n, j) => n + j.mois, 0),
    caPrevu: sum('caPrevu'),
    ca,
    margePrevue: sum('margePrevue'),
    marge: sum('mtAction'),
    caHors: sum('caHors'),
    evolution: r2(((ca - CA_N1) / CA_N1) * 100),
  };
})();

const PERF_GRID: GridActivity = {
  id: 'd12-m3-a1',
  kind: 'grid',
  label: 'Annexe 1',
  title: 'Tableau des performances commerciales',
  instructions: 'Complète le tableau pour chaque jouet. PV HT = PV TTC ÷ 1,20, arrondi au centime. Les « hors action » portent sur un mois de 4 semaines.',
  helps: [
    'Ventes hebdomadaires pendant l’action = ventes du mois ÷ 4.',
    'Marge unitaire = PV HT − prix d’achat HT. CA hors action = PV HT hors action × (ventes hebdo × 4).',
    `Zombie Rush : 28,99 ÷ 1,2 = ${fr(JOUETS[0].pvHors)} € ; marge ${fr(JOUETS[0].mHors)} € ; CA hors action ${fr(JOUETS[0].pvHors)} × 16 = ${fr(JOUETS[0].caHors)} €.`,
  ],
  outcomeIds: R23,
  groups: [
    { label: 'Ventes', columns: ['Hebdo hors action', 'Mois de l’action', 'Hebdo pendant'] },
    { label: 'Prix et marges unitaires', columns: ['PV HT hors', 'PV HT action', 'Marge hors', 'Marge action'] },
    { label: 'Sur un mois', columns: ['CA hors action', 'CA action', 'Marge hors', 'Marge action'] },
  ],
  rows: JOUETS.map((j) => {
    const c = (answer: number, explain: string) => ({ answer, explain, tolerance: 0.011 });
    return {
      id: j.id,
      label: j.name,
      sub: `PA HT ${eur(j.pa)}`,
      cells: [
        j.hebdo,
        j.mois,
        c(j.hebdoAction, `${j.mois} ÷ 4 = ${fr(j.hebdoAction)}.`),
        c(j.pvHors, `${fr(j.ttcHors)} ÷ 1,2 = ${fr(j.pvHors)} €.`),
        c(j.pvAction, `${fr(j.ttcAction)} ÷ 1,2 = ${fr(j.pvAction)} €.`),
        c(j.mHors, `${fr(j.pvHors)} − ${fr(j.pa)} = ${fr(j.mHors)} €.`),
        c(j.mAction, `${fr(j.pvAction)} − ${fr(j.pa)} = ${fr(j.mAction)} €.`),
        c(j.caHors, `${fr(j.pvHors)} × ${j.hebdo * 4} = ${fr(j.caHors)} €.`),
        c(j.caAction, `${fr(j.pvAction)} × ${j.mois} = ${fr(j.caAction)} €.`),
        c(j.mtHors, `${fr(j.mHors)} × ${j.hebdo * 4} = ${fr(j.mtHors)} €.`),
        c(j.mtAction, `${fr(j.mAction)} × ${j.mois} = ${fr(j.mtAction)} €.`),
      ],
    };
  }),
  legend: 'Marge unitaire = PV HT − prix d’achat HT · CA = PV HT × quantités',
};

/* =============================== Application 2 : soirée =============================== */

export const INVITES = [
  { id: 'a', nom: 'Maryse ALVÈS', ouverture: 'avril N−6', anciennete: 6, dernier: 'décembre N−1', moisDepuis: 4, panier: 180 },
  { id: 'b', nom: 'Romain LIGIER', ouverture: 'mars N−1', anciennete: 1, dernier: 'mars N', moisDepuis: 1, panier: 300 },
  { id: 'c', nom: 'Joana CALVET', ouverture: 'janvier N−4', anciennete: 4, dernier: 'janvier N−2', moisDepuis: 27, panier: 80 },
  { id: 'd', nom: 'Anaïs ZERGUI', ouverture: 'juin N−7', anciennete: 7, dernier: 'juin N−1', moisDepuis: 10, panier: 220 },
].map((c) => ({ ...c, choix: c.anciennete >= 5 && c.moisDepuis <= 12 }));
export const LETTRES = 300;
export const SOIREE = (() => {
  const papier = r2(LETTRES * (0.03 + 0.05));
  const envoi = r2(Math.min(LETTRES, 200) * 0.95 + Math.max(0, LETTRES - 200) * 0.85);
  const publipostage = r2(papier + envoi + 60);
  const organisation = 150 + 1000 + 40;
  const total = r2(publipostage + organisation);
  const ca = 100 * 50;
  const margeBrute = r2(ca * 0.4);
  return { papier, envoi, publipostage, organisation, total, ca, margeBrute, resultat: r2(margeBrute - total) };
})();

/* =============================== Application 3 : Black Friday =============================== */

export const PORTEFEUILLES = [
  { name: 'Porte-monnaie à languette', pv: 35, qte: 3, pa: 14 },
  { name: 'Portefeuille rayé', pv: 38, qte: 1, pa: 16 },
  { name: 'Porte-monnaie compact', pv: 35, qte: 2, pa: 15 },
  { name: 'Portefeuille deux volets', pv: 48, qte: 2, pa: 20 },
  { name: 'Porte-monnaie zippé', pv: 52, qte: 1, pa: 22 },
  { name: 'Porte-cartes', pv: 20, qte: 4, pa: 8 },
  { name: 'Portefeuille à pince', pv: 23, qte: 1, pa: 10 },
].map((p) => ({ ...p, ca: p.pv * p.qte, marge: (p.pv - p.pa) * p.qte }));
export const OBJ_BF = { ca: 700, volume: 15, marge: 300 };
export const BF = (() => {
  const ca = PORTEFEUILLES.reduce((n, p) => n + p.ca, 0);
  const volume = PORTEFEUILLES.reduce((n, p) => n + p.qte, 0);
  const marge = PORTEFEUILLES.reduce((n, p) => n + p.marge, 0);
  return { ca, volume, marge, tauxCa: r2((ca / OBJ_BF.ca) * 100), tauxVol: r2((volume / OBJ_BF.volume) * 100), tauxMarge: r2((marge / OBJ_BF.marge) * 100) };
})();

/* ================================================================================== */

export const D12: Chapter = {
  unitId: 'd12',
  mission:
    "La Toupie Royale a validé une animation autour des jeux de société. Tu ordonnes les préparatifs, adaptes les supports de communication et suis les résultats. La responsable attend un compte rendu qui distingue les ventes, la marge et le coût de l’action.",
  fictionNotice: 'La Toupie Royale, les autres enseignes, les marques, les personnages et tous les chiffres de ce dossier sont imaginaires.',
  company: {
    name: 'La Toupie Royale — Voiron',
    tagline: 'Réseau de magasins de jeux et jouets',
    facts: [
      ['Ton poste', 'Élève en PFMP, actions commerciales'],
      ['Ton tuteur', 'Samir Bendaoud, responsable du magasin'],
      ['Clientèle', 'Habitants de Voiron et des environs (20 km), de 5 à 80 ans'],
    ],
  },
  steps: [
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Conduire une opération et rendre compte des résultats",
      hero: { id: 'd12-hero', alt: 'Petite fille souriante montrant un jouet dans les rayons d’un magasin' },
      message: { from: 'Samir Bendaoud', role: 'Responsable, La Toupie Royale Voiron', text: ['Bienvenue ! Nos équipes accueillent, conseillent et assurent à chaque client un achat réussi, au juste prix et avec le sourire. Du ciblage de la clientèle à l’analyse des résultats, tu vas mener avec moi une action commerciale complète.'] },
      documents: [
        {
          id: "d12-revision-reperes",
          number: 2,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Un rétroplanning part de l’heure de l’événement et remonte vers les tâches qui doivent être terminées avant.",
                "Pour mesurer l’atteinte d’un objectif, compare le réalisé au prévu. Pour mesurer une évolution, compare le nouveau résultat à une période de référence.",
                "Le chiffre d’affaires représente les ventes. Pour évaluer l’action, examine aussi la marge et les coûts directs indiqués dans le cas."
              ]
            }
          ]
        },
        { id: 'd12-o-doc1', number: 1, title: 'Le réseau La Toupie Royale', look: 'article', blocks: [{ type: 'p', text: 'La Toupie Royale est un réseau de plus de 200 magasins de jeux et jouets en France, en Suisse et en Belgique. Chaque magasin est tenu par un commerçant affilié qui bénéficie de l’enseigne, de la centrale d’achat et des opérations nationales.' }, { type: 'facts', items: [['Société', 'SAS Jouets du Voironnais'], ['Magasin', 'Zone commerciale de Voiron (Isère)'], ['Concurrents directs', 'Autres enseignes spécialisées dans le jouet']] }] },
      ],
      activities: [
        {
          id: 'd12-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité et premières questions',
          instructions: 'Complète la fiche, puis réponds.',
          helps: ['Les réponses de la fiche sont dans le document 1.', 'Un concurrent indirect vend aussi des jouets, sans en être spécialiste.', 'Pense aux médias et aux supports hors médias.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['SAS Jouets du Voironnais', 'Jouets du Voironnais'], explain: 'SAS Jouets du Voironnais.' },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'associe', label: 'Commerce associé (affiliation)' }, { value: 'integre', label: 'Commerce intégré' }], answer: 'associe', explain: 'Commerçant affilié.' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Voiron', 'zone commerciale de Voiron'], explain: 'Voiron.' },
            { id: 'supports', label: '1. Supports de communication possibles (plusieurs réponses)', kind: 'multi', options: [{ value: 'radio', label: 'Radio' }, { value: 'flyer', label: 'Flyer, catalogue' }, { value: 'reseaux', label: 'Réseaux sociaux' }, { value: 'plv', label: 'PLV en magasin' }, { value: 'facture', label: 'Facture fournisseur' }], answers: ['radio', 'flyer', 'reseaux', 'plv'], explain: 'La facture n’est pas un support de communication.' },
            { id: 'indirects', label: '2. Concurrents indirects (plusieurs réponses)', kind: 'multi', options: [{ value: 'hyper', label: 'Rayons jouets des hypermarchés' }, { value: 'web', label: 'Grands sites de vente en ligne' }, { value: 'culture', label: 'Grandes surfaces culturelles' }, { value: 'jouet', label: 'Autres magasins spécialisés en jouets' }], answers: ['hyper', 'web', 'culture'], explain: 'Les magasins spécialisés sont des concurrents directs.' },
          ],
        },
      ],
    },
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Planifier les actions commerciales',
      guidance: 'guidé',
      message: { from: 'Samir Bendaoud', role: 'Responsable', text: ['Avant de faire le plan de cette année, analyse le calendrier des actions de l’an dernier. Justifie la période de chaque action, puis indique son objectif et sa cible.'] },
      documents: [
        { id: 'd12-m1-doc1', number: 1, title: 'Plan publi-promotionnel de l’an dernier', look: 'texte', blocks: [{ type: 'table', head: ['Action', 'Période'], rows: [['Soldes', 'Janvier et juillet'], ['Carnaval', 'Février'], ['Anniversaire d’une poupée célèbre', 'Mars'], ['Loisirs de plein air', 'Avril à août'], ['Tournoi de toupies de combat', 'Septembre'], ['Récolte de jouets avec la ressourcerie', 'Septembre'], ['Anniversaire du magasin', 'Octobre'], ['Halloween', 'Octobre'], ['Black Friday', 'Novembre'], ['Noël', 'Octobre à décembre']] }, { type: 'note', text: 'Ressourcerie : lieu qui collecte les objets dont les propriétaires n’ont plus besoin, pour les remettre en circulation et réduire les déchets.' }] },
        { id: 'd12-m1-doc2', number: 2, title: 'Les profils clients', look: 'texte', blocks: [{ type: 'list', items: ['Enfants et adolescents : ils consomment avant tout, influencent beaucoup les achats des parents ; petit budget, payé sur leurs économies.', '« Kidultes » : adultes qui se font plaisir avec des jeux plutôt destinés aux adultes, ou qui font plaisir à un proche.', 'Parents : viennent le samedi et le mercredi après-midi avec les enfants ; adorent les remises.', 'Grands-parents : habitent près du magasin, achètent des cadeaux et ne regardent pas à la dépense.'] }] },
        { id: 'd12-m1-doc3', number: 3, title: 'Les objectifs des actions commerciales', look: 'texte', blocks: [{ type: 'p', text: 'La promotion des ventes stimule les ventes à court terme : réductions de prix, concours, offres d’essai, cadeaux. Elle peut aussi élargir la clientèle ou faire découvrir de nouveaux produits. L’animation dynamise le point de vente, crée du trafic, fait connaître des produits ; elle peut aussi différencier l’enseigne, développer sa notoriété, déstocker ou fidéliser.' }] },
        {
          id: "d12-revision-1-doc",
          number: 4,
          title: "Planifier avec un délai d’impression incompressible",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’événement a lieu samedi à 14 h. Le visuel doit être relu mardi. L’imprimeur demande un fichier validé mercredi à midi pour livraison vendredi à 10 h. Les produits doivent être installés vendredi avant 17 h. Le responsable est disponible mardi et vendredi matin."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd12-m1-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Bilan annuel des actions commerciales',
          instructions: 'Pour chaque action, choisis la justification de la période, l’objectif principal et la cible.',
          helps: ['Les soldes sont fixés par la réglementation.', 'La rentrée scolaire relance les jeux de cour ; Noël est le premier temps fort de l’année.', 'La récolte de jouets donne une image responsable.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Justification de la période', 'Objectif principal', 'Cible'],
          fields: (
            [
              ['soldes', 'Soldes', 'legal', 'destocker', 'parents'],
              ['tournoi', 'Tournoi de toupies de combat', 'rentree', 'trafic', 'enfants'],
              ['recolte', 'Récolte de jouets', 'rentree', 'image', 'parents'],
              ['anniv', 'Anniversaire du magasin', 'date', 'fideliser', 'tous'],
              ['noel', 'Noël', 'fetes', 'ventes', 'grands'],
              ['plein', 'Loisirs de plein air', 'beau', 'ventes', 'parents'],
            ] as const
          ).flatMap(([id, label, periode, objectif, cible]): Field[] => [
            {
              id: `${id}.0`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'legal', label: 'Dates fixées par la réglementation' },
                { value: 'rentree', label: 'Rentrée : retour à l’école et aux jeux de cour' },
                { value: 'date', label: 'Date de création du magasin' },
                { value: 'fetes', label: 'Fêtes de fin d’année : achats de cadeaux' },
                { value: 'beau', label: 'Beaux jours : activités en extérieur' },
              ],
              answer: periode,
              explain: 'Période liée à l’événement.',
            },
            {
              id: `${id}.1`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'destocker', label: 'Déstocker' },
                { value: 'trafic', label: 'Créer du trafic, animer le magasin' },
                { value: 'image', label: 'Développer une image responsable' },
                { value: 'fideliser', label: 'Fidéliser la clientèle' },
                { value: 'ventes', label: 'Augmenter les ventes' },
              ],
              answer: objectif,
              explain: 'Objectif principal de l’action.',
            },
            {
              id: `${id}.2`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'enfants', label: 'Enfants et adolescents' },
                { value: 'parents', label: 'Parents' },
                { value: 'grands', label: 'Grands-parents' },
                { value: 'tous', label: 'Tous les clients' },
              ],
              answer: cible,
              explain: 'Cible principale.',
            },
          ]),
        },
        {
          id: "d12-revision-1",
          label: "Annexe complémentaire",
          title: "Planifier avec un délai d’impression incompressible",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Repère la tâche qui bloque l’impression et la personne qui doit la valider.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Mardi, préparer et faire valider le visuel par le responsable. Mercredi avant midi, la communication transmet le fichier. Vendredi à 10 h, l’accueil réceptionne les affiches, puis le rayon installe avant 17 h."
          ],
          outcomeIds: [
            "d12-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Donne le planning et les responsables.",
              kind: "written",
              lines: 3,
              model: "Mardi, préparer et faire valider le visuel par le responsable. Mercredi avant midi, la communication transmet le fichier. Vendredi à 10 h, l’accueil réceptionne les affiches, puis le rayon installe avant 17 h."
            },
            {
              id: "q2",
              label: "Que proposes-tu si la livraison papier est reportée au samedi à 15 h ?",
              kind: "written",
              lines: 3,
              model: "Prévoir une impression locale approuvée ou un affichage numérique pour le début de l’événement, avec le même message validé. Prévenir l’équipe dès confirmation du retard."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Communiquer sur l’événement',
      guidance: 'accompagné',
      message: { from: 'Samir Bendaoud', role: 'Responsable', text: [`J’ai reçu trois jouets en grande quantité, à écouler avec une opération. Le budget de communication ne doit pas dépasser 5 % du chiffre d’affaires d’une opération semblable l’an dernier (${eur(CA_N1)}). Choisis les supports et calcule les dépenses.`] },
      documents: [
        { id: 'd12-m2-doc1', number: 1, title: 'Les supports de communication', look: 'texte', blocks: [{ type: 'table', head: ['Support', 'Avantages', 'Inconvénients'], rows: [['Télévision', 'Montre l’intérêt du produit', 'Très coûteuse'], ['Radio', 'Peu coûteuse, répète le message', 'Écoute peu attentive, pas de visuel'], ['Presse', 'Large couverture, beaucoup de lecteurs', 'Coût élevé'], ['Réseaux sociaux, site', 'Interaction, transmission rapide', 'Présence et mises à jour régulières'], ['Affichage', 'Grande audience, ciblage géographique', 'Peu sélectif'], ['Publipostage, courriel', 'Message personnalisé, coût faible (courriel)', 'Délai pour le courrier'], ['Flyer, catalogue', 'Montre les produits en promotion', 'Ne touche pas toute la cible'], ['PLV', 'Facile à utiliser, s’adapte', 'N’attire pas en magasin']] }] },
        { id: 'd12-m2-doc2', number: 2, title: 'Les jouets à mettre en avant', look: 'fiche', blocks: [{ type: 'list', items: JOUETS.map((j) => `${j.name} : ${eur(j.ttcAction)} TTC${j.ttcAction < j.ttcHors ? ` au lieu de ${eur(j.ttcHors)}` : ''}.`) }] },
        { id: 'd12-m2-doc3', number: 3, title: 'Coûts des supports', look: 'facture', blocks: [{ type: 'table', head: ['Support', 'Coût'], rows: [['Radio locale', '3 diffusions par jour : 40 € par mois + création du spot 15 €'], ['Flyer A5', 'Papier 0,15 € + impression 0,35 € par flyer'], ['Affiche PLV 42 × 60 cm', '2,99 € l’affiche'], ['Presse locale', 'À partir de 5 000 € le quart de page'], ['Réseaux sociaux', 'Gratuit']] }] },
        {
          id: "d12-revision-2-doc",
          number: 4,
          title: "Écrire deux supports cohérents",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’atelier « Découvrir les jeux coopératifs » se déroule samedi de 14 h à 15 h à La Toupie Royale, rayon jeux. Entrée gratuite, dix places sur inscription à l’accueil. Le magasin utilise une affiche d’entrée et une publication sociale."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd12-m2-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Choisir les supports',
          instructions: 'Choisis deux supports adaptés pour chaque action.',
          helps: ['Les enfants et les ados sont sur les réseaux sociaux.', 'Les grands-parents écoutent la radio locale et lisent les flyers.', 'La PLV soutient l’action une fois le client dans le magasin.'],
          outcomeIds: R1,
          fields: (
            [
              ['tournoi', 'Tournoi de toupies de combat', ['reseaux', 'plv']],
              ['recolte', 'Récolte de jouets avec la ressourcerie', ['reseaux', 'radio']],
              ['noel', 'Noël', ['flyer', 'radio']],
            ] as const
          ).map(([id, label, answers]): Field => ({
            id,
            label: `${label} (2 réponses)`,
            kind: 'multi',
            options: [
              { value: 'reseaux', label: 'Réseaux sociaux' },
              { value: 'radio', label: 'Radio locale' },
              { value: 'flyer', label: 'Flyer, catalogue' },
              { value: 'plv', label: 'PLV' },
              { value: 'tv', label: 'Télévision' },
            ],
            answers: [...answers],
            explain: 'Supports adaptés à la cible et peu coûteux.',
          })),
        },
        {
          id: 'd12-m2-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Coût de l’opération',
          instructions: 'Le responsable retient un mois de radio, 300 flyers A5 et 10 affiches PLV. Calcule le budget et les dépenses.',
          helps: [`Budget = ${eur(CA_N1)} × 5 %.`, 'Radio = 40 + 15 ; flyers = 300 × (0,15 + 0,35) ; affiches = 10 × 2,99.', 'Compare le total au budget.'],
          outcomeIds: R1,
          fields: [
            num('budget', '1. Budget maximum', BUDGET, `${eur(CA_N1)} × 5 % = ${eur(BUDGET)}.`, '€', 0.011),
            num('radio', '2. Coût de la radio', SUPPORTS.radio, '40 + 15 = 55 €.', '€', 0.011),
            num('flyers', '3. Coût des flyers', SUPPORTS.flyers, `300 × 0,50 = ${eur(SUPPORTS.flyers)}.`, '€', 0.011),
            num('affiches', '4. Coût des affiches', SUPPORTS.affiches, `10 × 2,99 = ${eur(SUPPORTS.affiches)}.`, '€', 0.011),
            num('total', '5. Total', SUPPORTS.total, `${fr(SUPPORTS.radio)} + ${fr(SUPPORTS.flyers)} + ${fr(SUPPORTS.affiches)} = ${eur(SUPPORTS.total)}.`, '€', 0.011),
            { id: 'ok', label: '6. Le budget est-il respecté ?', kind: 'choice', options: OUI_NON, answer: SUPPORTS.ok ? 'oui' : 'non', explain: `${eur(SUPPORTS.total)} ≤ ${eur(BUDGET)}.` },
          ],
        },
        {
          id: 'd12-m2-a3',
          kind: 'fields',
          label: 'Annexe 1 (justification)',
          title: 'Justifier le choix des supports',
          instructions: 'Justifie par écrit les supports choisis pour chaque action.',
          helps: ['Relie chaque support à la cible de l’action.', 'Pense au coût : réseaux sociaux gratuits, radio peu coûteuse.', 'La PLV soutient l’action en magasin.'],
          outcomeIds: R1,
          fields: [
            w('tournoi', 'Tournoi de toupies de combat', 'Les enfants et ados sont sur les réseaux sociaux (gratuit, viral) ; la PLV en magasin annonce les dates et les inscriptions.', ['Support + cible.']),
            w('recolte', 'Récolte de jouets', 'Les réseaux sociaux et la radio locale touchent largement les familles de Voiron et valorisent l’image responsable du magasin.', ['Support + cible.']),
            w('noel', 'Noël', 'Le catalogue montre tous les jouets aux parents et grands-parents ; la radio locale touche les grands-parents qui habitent près du magasin.', ['Support + cible.']),
          ],
        },
        {
          id: "d12-revision-2",
          label: "Annexe complémentaire",
          title: "Écrire deux supports cohérents",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Chaque support doit donner le lieu, l’heure et le mode d’inscription.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Découvrir les jeux coopératifs. Samedi de 14 h à 15 h, rayon jeux de La Toupie Royale. Gratuit, dix places. Inscris-toi à l’accueil."
          ],
          outcomeIds: [
            "d12-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Écris le texte de l’affiche.",
              kind: "written",
              lines: 3,
              model: "Découvrir les jeux coopératifs. Samedi de 14 h à 15 h, rayon jeux de La Toupie Royale. Gratuit, dix places. Inscris-toi à l’accueil."
            },
            {
              id: "q2",
              label: "Écris une publication sociale et donne le contrôle à effectuer.",
              kind: "written",
              lines: 3,
              model: "« Envie de jouer en équipe ? Viens découvrir les jeux coopératifs samedi de 14 h à 15 h au rayon jeux. Atelier gratuit, dix places. Inscription à l’accueil. » Faire confirmer l’horaire, le lieu et les places avant diffusion."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Participer à l’évaluation et à l’analyse des performances',
      guidance: 'accompagné',
      message: { from: 'Samir Bendaoud', role: 'Responsable', text: ['L’opération du mois dernier est terminée. Prépare l’analyse des résultats : complète le tableau des performances, puis relève les points forts et les points faibles dans l’enquête de satisfaction.'] },
      documents: [
        { id: 'd12-m3-doc1', number: 1, title: 'Résultats de l’enquête auprès des acheteurs', look: 'texte', blocks: [{ type: 'table', head: ['Question', 'Oui', 'Non'], align: ['left', 'right', 'right'], rows: [['Avez-vous entendu parler de cette action ?', '45 %', '55 %'], ['Êtes-vous client régulier du magasin ?', '65 %', '35 %'], ['Êtes-vous prêt à acheter ces produits ?', '65 %', '35 %']] }, { type: 'list', items: ['Comment avez-vous été informé ? Réseaux sociaux 40 %, catalogue 30 %, magasin 15 %, bouche-à-oreille 10 %, radio 5 %.', 'Autres produits souhaités en promotion : figurines (35 %), produits dérivés de dessins animés (30 %).', 'Acheteurs : 70 % de femmes ; 60 % venus sans enfant.', 'Avis sur l’action : très intéressante 50 %, intéressante 35 %, peu intéressante 10 %, inintéressante 5 %.'] }] },
        {
          id: "d12-revision-3-doc",
          number: 2,
          title: "Séparer évolution du chiffre d’affaires et résultat de l’action",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Période de deux heures",
                "Chiffre d’affaires",
                "Marge sur ventes"
              ],
              rows: [
                [
                  "Samedi de référence",
                  "400 €",
                  "140 €"
                ],
                [
                  "Samedi d’animation",
                  "520 €",
                  "182 €"
                ]
              ]
            },
            {
              type: "p",
              text: "La fiche de suivi retient 60 € de coûts directs pour l’animation. L’équipe compare la marge après coûts directs à la marge de la période de référence."
            }
          ]
        },
      ],
      activities: [
        PERF_GRID,
        {
          id: 'd12-m3-a2',
          kind: 'fields',
          label: 'Déduction',
          title: 'Que peux-tu en déduire ?',
          instructions: 'Interprète le tableau.',
          helps: ['Compare les ventes hebdomadaires avant et pendant.', 'Compare les marges totales sur un mois.', 'Une baisse de prix réduit la marge unitaire mais peut augmenter la marge totale.'],
          outcomeIds: R2,
          fields: JOUETS.map((j): Field => ({ id: `d-${j.id}`, label: `${j.name} : la marge totale du mois de l’action est…`, kind: 'choice', options: [{ value: 'sup', label: 'Supérieure à un mois sans action' }, { value: 'inf', label: 'Inférieure à un mois sans action' }], answer: j.mtAction > j.mtHors ? 'sup' : 'inf', explain: `${eur(j.mtAction)} contre ${eur(j.mtHors)}.` })),
        },
        {
          id: 'd12-m3-a3',
          kind: 'classify',
          label: 'Annexe 2',
          title: 'Points forts et points à améliorer',
          instructions: 'Classe chaque résultat de l’enquête.',
          helps: ['Un résultat majoritairement positif est un point fort.', 'Moins d’un client sur deux a entendu parler de l’action.', 'La radio ne touche presque personne.'],
          outcomeIds: R23,
          categories: [
            { id: 'fort', label: 'Point fort' },
            { id: 'faible', label: 'Point à améliorer' },
          ],
          items: [
            { id: 'avis', text: '85 % jugent l’action intéressante ou très intéressante', answer: 'fort', explain: 'Bonne perception.' },
            { id: 'reseaux', text: '40 % ont été informés par les réseaux sociaux', answer: 'fort', explain: 'Support efficace.' },
            { id: 'notoriete', text: '55 % n’ont pas entendu parler de l’action', answer: 'faible', explain: 'Communication insuffisante.' },
            { id: 'radio', text: 'Seulement 5 % informés par la radio', answer: 'faible', explain: 'Support peu efficace pour cette cible.' },
            { id: 'nouveaux', text: '35 % des acheteurs ne sont pas des clients réguliers', answer: 'fort', explain: 'L’action attire de nouveaux clients.' },
            { id: 'figurines', text: '35 % auraient aimé une promotion sur les figurines', answer: 'faible', explain: 'Choix de produits à élargir.' },
          ],
        },
        {
          id: 'd12-m3-a4',
          kind: 'fields',
          label: 'Annexe 2 (suite)',
          title: 'Rédiger les éléments à retenir de l’enquête',
          instructions: 'Rédige deux points forts et deux points à améliorer, chiffres à l’appui.',
          helps: ['Un point = un constat chiffré.', 'Points forts : perception de l’action, nouveaux clients, réseaux sociaux.', 'À améliorer : notoriété de l’action, choix des produits.'],
          outcomeIds: R3,
          layout: 'columns',
          columns: ['Points forts', 'Points à améliorer'],
          fields: [
            w('p1.0', 'Point 1', '85 % des acheteurs jugent l’action intéressante ou très intéressante.', ['Chiffre cité.'], 2),
            w('p1.1', 'Point 1', '55 % n’ont pas entendu parler de l’action : la communication est insuffisante.', ['Chiffre cité.'], 2),
            w('p2.0', 'Point 2', '35 % des acheteurs ne sont pas des clients réguliers : l’action attire de nouveaux clients.', ['Chiffre cité.'], 2),
            w('p2.1', 'Point 2', 'La radio n’a informé que 5 % des acheteurs, et 35 % auraient voulu des figurines en promotion.', ['Chiffre cité.'], 2),
          ],
        },
        {
          id: "d12-revision-3",
          label: "Annexe complémentaire",
          title: "Séparer évolution du chiffre d’affaires et résultat de l’action",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Calcule l’évolution du chiffre d’affaires puis l’écart de marge après déduction des coûts.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "(520 − 400) ÷ 400 × 100 = 30 %."
          ],
          outcomeIds: [
            "d12-r1",
            "d12-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle évolution du chiffre d’affaires obtiens-tu en pourcentage ?",
              kind: "number",
              answer: 30,
              explain: "(520 − 400) ÷ 400 × 100 = 30 %."
            },
            {
              id: "q2",
              label: "Quel écart de marge après coûts obtient-on en euros ?",
              kind: "number",
              answer: -18,
              explain: "182 − 60 − 140 = −18 €."
            },
            {
              id: "q3",
              label: "Rédige une conclusion pour la responsable.",
              kind: "written",
              lines: 3,
              model: "Le chiffre d’affaires augmente de 30 %, mais la marge après coûts directs est de 122 €, soit 18 € de moins que la référence. Vérifier aussi la fréquentation et la comparabilité des deux samedis."
            }
          ]
        },
      ],
    },
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Comparer les résultats et proposer des actions correctrices',
      guidance: 'autonome',
      message: { from: 'Samir Bendaoud', role: 'Responsable', text: ['Compare maintenant les résultats aux objectifs du siège et au chiffre d’affaires de l’an dernier, puis rédige le compte rendu par courriel au siège, avec moi en copie.'] },
      documents: [
        { id: 'd12-m4-doc1', number: 1, title: 'Objectifs fixés par le siège', look: 'memo', blocks: [{ type: 'table', head: ['Jouet', 'Quantités prévues'], align: ['left', 'right'], rows: JOUETS.map((j) => [j.name, String(j.prevu)]) }, { type: 'note', text: `CA et marge prévus = quantités prévues × prix et marge de l’action. CA de l’opération semblable l’an dernier : ${eur(CA_N1)} HT.` }] },
        {
          id: "d12-revision-4-doc",
          number: 2,
          title: "Tirer une action correctrice de deux écarts",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Indicateur",
                "Objectif",
                "Résultat"
              ],
              rows: [
                [
                  "Inscrits",
                  "20",
                  "20"
                ],
                [
                  "Présents",
                  "16",
                  "11"
                ],
                [
                  "Ventes liées",
                  "8",
                  "7"
                ]
              ]
            },
            {
              type: "p",
              text: "Cinq absents indiquent avoir oublié l’horaire. Parmi les onze présents, deux disent ne pas avoir trouvé le rayon immédiatement. Le magasin peut envoyer un rappel aux inscrits par le canal prévu lors de l’inscription."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd12-m4-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Atteinte des objectifs',
          instructions: 'Calcule les objectifs et les résultats totaux, puis compare.',
          helps: ['Prévu = quantité prévue × PV HT action (ou marge unitaire action).', 'Réalisé = résultats du tableau de la mission 3.', 'Additionne les trois jouets.'],
          outcomeIds: R2,
          layout: 'columns',
          columns: ['Qté prévue', 'Qté réalisée', 'CA prévu', 'CA réalisé'],
          fields: JOUETS.flatMap((j): Field[] => [
            num(`${j.id}.0`, j.name, j.prevu, `${j.prevu}.`),
            num(`${j.id}.1`, j.name, j.mois, `${j.mois}.`),
            num(`${j.id}.2`, j.name, j.caPrevu, `${j.prevu} × ${fr(j.pvAction)} = ${eur(j.caPrevu)}.`, '€', 0.011),
            num(`${j.id}.3`, j.name, j.caAction, `${eur(j.caAction)}.`, '€', 0.011),
          ]),
        },
        {
          id: 'd12-m4-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Analyse globale et évolution',
          instructions: 'Totalise et calcule le taux d’évolution du CA.',
          helps: ['Additionne les CA réalisés.', `Taux d’évolution = (CA N − ${CA_N1}) ÷ ${CA_N1} × 100.`, 'Compare le total réalisé au total prévu.'],
          outcomeIds: R2,
          fields: [
            num('caPrevu', '1. CA total prévu', PERF_TOT.caPrevu, `${eur(PERF_TOT.caPrevu)}.`, '€', 0.021),
            num('ca', '2. CA total réalisé', PERF_TOT.ca, `${eur(PERF_TOT.ca)}.`, '€', 0.021),
            num('margePrevue', '3. Marge totale prévue', PERF_TOT.margePrevue, `${eur(PERF_TOT.margePrevue)}.`, '€', 0.021),
            num('marge', '4. Marge totale réalisée', PERF_TOT.marge, `${eur(PERF_TOT.marge)}.`, '€', 0.021),
            num('evol', '5. Taux d’évolution du CA par rapport à l’an dernier', PERF_TOT.evolution, `(${fr(PERF_TOT.ca)} − ${CA_N1}) ÷ ${CA_N1} × 100 = ${fr(PERF_TOT.evolution)} %.`, '%', 0.011),
            { id: 'atteint', label: '6. L’objectif global de CA est-il atteint ?', kind: 'choice', options: OUI_NON, answer: PERF_TOT.ca >= PERF_TOT.caPrevu ? 'oui' : 'non', explain: `${eur(PERF_TOT.ca)} contre ${eur(PERF_TOT.caPrevu)}.` },
            { id: 'jouet', label: '7. Quel jouet n’atteint pas son objectif de quantités ?', kind: 'choice', options: JOUETS.map((j) => ({ value: j.id, label: j.name })), answer: JOUETS.find((j) => j.mois < j.prevu)!.id, explain: JOUETS.filter((j) => j.mois < j.prevu).map((j) => `${j.mois} vendus pour ${j.prevu} prévus`).join(', ') + '.' },
          ],
        },
        {
          id: 'd12-m4-a3',
          kind: 'open',
          label: 'Annexe 3',
          title: 'Rédiger le compte rendu',
          instructions: 'Rédige le courriel de compte rendu au siège (responsable du magasin en copie) : bilan chiffré, points forts, points faibles, préconisations.',
          helps: ['Objet : « Compte rendu de l’opération … ».', 'Un paragraphe chiffré, un paragraphe qualitatif (enquête).', 'Préconisations : plus de réseaux sociaux, moins de radio, élargir aux figurines…'],
          outcomeIds: R23,
          prompts: [
            { id: 'objet', label: 'Objet', lines: 1 },
            { id: 'corps', label: 'Message', lines: 12 },
          ],
          selfCheck: ['Les chiffres clés sont cités (CA, marge, évolution).', 'Points forts et faibles sont tirés de l’enquête.', 'Au moins deux préconisations justifiées.', 'Le courriel est professionnel.'],
        },
        {
          id: 'd12-m4-a1b',
          kind: 'fields',
          label: 'Annexe 1 (marges)',
          title: 'Atteinte des objectifs de marge',
          instructions: 'Calcule la marge prévue et la marge réalisée pour chaque jouet, puis analyse.',
          helps: ['Marge prévue = quantité prévue × marge unitaire pendant l’action.', 'Marge réalisée = résultat du tableau de la mission 3.', 'Compare jouet par jouet.'],
          outcomeIds: R2,
          layout: 'columns',
          columns: ['Marge prévue', 'Marge réalisée'],
          fields: [
            ...JOUETS.flatMap((j): Field[] => [
              num(`${j.id}.0`, j.name, j.margePrevue, `${j.prevu} × ${fr(j.mAction)} = ${eur(j.margePrevue)}.`, '€', 0.011),
              num(`${j.id}.1`, j.name, j.mtAction, `${j.mois} × ${fr(j.mAction)} = ${eur(j.mtAction)}.`, '€', 0.011),
            ]),
            w('analyse', 'Analyse', 'Les objectifs de CA et de marge sont dépassés au total grâce à la cuisine ; le jeu coopératif n’atteint pas son objectif de quantités : il faudra mieux le mettre en avant.', ['Je compare prévu et réalisé.', 'Je cite le jouet en retard.'], 3),
          ],
        },
        {
          id: "d12-revision-4",
          label: "Annexe complémentaire",
          title: "Tirer une action correctrice de deux écarts",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Cherche où l’écart est le plus marqué et relie-le aux observations.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "11 ÷ 20 × 100 = 55 %."
          ],
          outcomeIds: [
            "d12-r1",
            "d12-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel est le taux de présence parmi les inscrits ?",
              kind: "number",
              answer: 55,
              explain: "11 ÷ 20 × 100 = 55 %."
            },
            {
              id: "q2",
              label: "Propose deux corrections et le relevé de la prochaine édition.",
              kind: "written",
              lines: 3,
              model: "Envoyer un rappel avant l’événement et ajouter un repère à l’entrée vers le rayon. Suivre le taux de présence et le nombre de participants qui demandent leur chemin, puis comparer les ventes liées."
            }
          ]
        },
      ],
    },
    {
      id: 'synthese',
      kind: 'synthese',
      title: 'Synthèse',
      documents: [],
      activities: [
        {
          id: 'd12-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les quatre parties de la synthèse.',
          helps: ['La planification tient compte du calendrier, du plan publi-promotionnel et de la cible.', 'Médias / hors médias.', 'Évaluation quantitative et qualitative.'],
          outcomeIds: R23,
          fields: [
            { id: 'objectifs', label: '1. Objectifs possibles d’une action (plusieurs réponses)', kind: 'multi', options: [{ value: 'ventes', label: 'Augmenter les ventes' }, { value: 'trafic', label: 'Créer du trafic' }, { value: 'destocker', label: 'Déstocker' }, { value: 'fideliser', label: 'Fidéliser' }, { value: 'image', label: 'Développer l’image et la notoriété' }], answers: ['ventes', 'trafic', 'destocker', 'fideliser', 'image'], explain: 'Tous sont des objectifs possibles.' },
            { id: 'medias', label: '2. Télévision, radio, cinéma, presse, site, affichage sont des supports…', kind: 'text', accept: ['médias', 'medias', 'média', 'les médias'], explain: 'Médias.' },
            { id: 'hors', label: '2. Marketing direct, flyer, sponsoring, mécénat, PLV sont des supports…', kind: 'text', accept: ['hors médias', 'hors medias', 'hors-médias', 'hors média'], explain: 'Hors médias.' },
            { id: 'quanti', label: '3. Volume des ventes et marge réalisée : évaluation…', kind: 'choice', options: [{ value: 'quanti', label: 'Quantitative' }, { value: 'quali', label: 'Qualitative' }], answer: 'quanti', explain: 'Chiffres.' },
            { id: 'quali', label: '3. Enquête de satisfaction : évaluation…', kind: 'choice', options: [{ value: 'quali', label: 'Qualitative' }, { value: 'quanti', label: 'Quantitative' }], answer: 'quali', explain: 'Opinions.' },
            { id: 'compare', label: '4. On compare les résultats… (plusieurs réponses)', kind: 'multi', options: [{ value: 'annees', label: 'Avec ceux des années précédentes' }, { value: 'objectifs', label: 'Avec les objectifs fixés' }, { value: 'concurrents', label: 'Avec le CA des concurrents (inconnu)' }], answers: ['annees', 'objectifs'], explain: 'Puis on propose des actions correctrices.' },
          ],
        },
        {
          id: 'd12-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq questions rapides.',
          helps: ['Relis la fiche de révision.', 'Taux d’évolution = (N − N−1) ÷ N−1 × 100.', 'Marge = CA − coût d’achat.'],
          outcomeIds: R23,
          fields: [
            num('q1', 'CA 6 000 € contre 5 000 € l’an dernier : taux d’évolution ?', 20, '(6 000 − 5 000) ÷ 5 000 × 100 = 20 %.', '%', 0.001),
            num('q2', 'PV TTC 60 €, TVA 20 % : PV HT ?', 50, '60 ÷ 1,2 = 50 €.', '€', 0.001),
            num('q3', 'PV HT 50 €, PA 30 €, 10 ventes : marge totale ?', 200, '(50 − 30) × 10 = 200 €.', '€', 0.001),
            { id: 'q4', label: 'Le sponsoring consiste à…', kind: 'choice', options: [{ value: 'a', label: 'Financer un événement en échange de visibilité commerciale' }, { value: 'b', label: 'Faire un don sans contrepartie' }], answer: 'a', explain: 'Le mécénat est sans contrepartie commerciale.' },
            { id: 'q5', label: 'Pour évaluer une action, on utilise…', kind: 'multi', options: [{ value: 'ventes', label: 'Les ventes et la marge' }, { value: 'enquete', label: 'Une enquête de satisfaction' }, { value: 'meteo', label: 'La météo' }], answers: ['ventes', 'enquete'], explain: 'Évaluation quantitative et qualitative.' },
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['Plan publi-promotionnel : calendrier, événements, clientèle ciblée.', 'Objectifs : augmenter les ventes, créer du trafic, déstocker, fidéliser, développer l’image.', 'Supports médias (TV, radio, presse, cinéma, Internet, affichage) et hors médias (marketing direct, flyer, PLV, sponsoring, mécénat).', 'Évaluation quantitative (ventes, CA, marge) et qualitative (enquête de satisfaction).'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Choisir les supports selon la cible et le budget.', 'Comparer les ventes avec et sans action, sur la même durée.', 'Comparer les résultats aux objectifs et à l’année précédente.', 'Relever points forts et points faibles, puis proposer des actions correctrices.'] },
        { title: 'Formules à connaître', kind: 'formules', items: ['PV HT = PV TTC ÷ 1,20', 'Marge unitaire = PV HT − prix d’achat HT', 'CA = PV HT × quantités ; marge totale = marge unitaire × quantités', 'Taux d’évolution = (valeur N − valeur N−1) ÷ valeur N−1 × 100', 'Taux de réalisation = réalisé ÷ prévu × 100'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Comparer un mois d’action à une semaine sans action.', 'Calculer la marge sur le prix TTC.', 'Dépasser le budget de communication.', 'Conclure sans s’appuyer sur les chiffres.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Plan publi-promotionnel', 'Promotion des ventes', 'Mécénat', 'Sponsoring', 'Taux d’évolution', 'Actions correctrices'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Un planning rend visibles les dépendances, les responsables et les dates limites.",
            "Chaque support donne les informations nécessaires pour participer et utilise la même promesse.",
            "Compare des périodes de même durée, distingue écart et évolution, et examine la marge après les coûts suivis."
          ]
        },
      ],
    },
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Participer à la communication des actions promotionnelles',
      guidance: 'autonome',
      hero: { id: 'd12-chocolats', alt: 'Rayon de chocolats de Noël dans un supermarché' },
      message: { from: 'Marine Bertet', role: 'Tutrice, supermarché Les Halles de Voreppe', text: ['Pour Noël, nous mettons en avant les chocolats de la marque Cacaoline : −50 % sur le deuxième produit, le moins cher des deux, du 15 au 24 décembre. Rédige le spot radio, le publipostage et le flyer.'] },
      documents: [
        { id: 'd12-a1-doc1', number: 1, title: 'Écrire un spot radio', look: 'texte', blocks: [{ type: 'p', text: 'Un spot commence par une partie « comédie » : le produit est mis en situation dans une petite saynète (dialogue, bruitages, chanson). Il faut capter l’auditeur dès la première seconde. Vient ensuite la partie « institutionnelle » : les informations précises sur le produit et l’offre. Une dernière partie peut donner les mentions légales obligatoires.' }] },
        { id: 'd12-a1-doc2', number: 2, title: 'La méthode AIDA', look: 'texte', blocks: [{ type: 'table', head: ['Étape', 'Rôle'], rows: [['A — Attention', 'Une accroche originale, une question, une exclamation'], ['I — Intérêt', 'Faire comprendre vite ce que l’on propose'], ['D — Désir', 'Développer les avantages, donner envie'], ['A — Action', 'Pousser à agir pour profiter de l’offre']] }] },
      ],
      activities: [
        {
          id: 'd12-a1-a1',
          kind: 'classify',
          label: '1',
          title: 'Reconnaître les étapes AIDA',
          instructions: 'Associe chaque phrase du publipostage à l’étape AIDA.',
          helps: ['L’accroche ouvre le message.', 'L’intérêt présente l’offre.', 'L’action donne la date et le lieu.'],
          outcomeIds: R1,
          categories: [
            { id: 'attention', label: 'Attention' },
            { id: 'interet', label: 'Intérêt' },
            { id: 'desir', label: 'Désir' },
            { id: 'action', label: 'Action' },
          ],
          items: [
            { id: 'a', text: '« Et si Noël fondait de plaisir cette année ? »', answer: 'attention', explain: 'Accroche.' },
            { id: 'b', text: '« Du 15 au 24 décembre, −50 % sur le deuxième produit Cacaoline. »', answer: 'interet', explain: 'Présentation de l’offre.' },
            { id: 'c', text: '« Un cœur fondant, un chocolat fin : de quoi régaler petits et grands. »', answer: 'desir', explain: 'Avantages.' },
            { id: 'd', text: '« Rendez-vous vite au rayon confiserie, l’offre est limitée ! »', answer: 'action', explain: 'Incitation à agir.' },
          ],
        },
        {
          id: 'd12-a1-a2',
          kind: 'open',
          label: '2-3',
          title: 'Rédiger le spot radio et le flyer',
          instructions: 'Rédigez le spot radio (comédie + partie institutionnelle) et le texte du flyer, qui annonce aussi une peluche offerte pour 4 produits achetés le 20 décembre.',
          helps: ['Le spot dure 30 secondes : 4 à 6 répliques.', 'Le flyer : accroche, bénéfices, offre, dates, lieu, QR code vers une vidéo.', 'Mots magiques : offert, exceptionnel, découvrez…'],
          outcomeIds: R1,
          prompts: [
            { id: 'spot', label: 'Spot radio', lines: 8 },
            { id: 'flyer', label: 'Texte du flyer', lines: 7 },
          ],
          selfCheck: ['Le spot capte l’attention dès le début.', 'L’offre, les dates et le lieu sont précis.', 'Le flyer suit la méthode AIDA.', 'Aucune faute.'],
        },
        {
          id: 'd12-a1-a3',
          kind: 'fields',
          label: '2 (publipostage)',
          title: 'Rédiger le publipostage selon la méthode AIDA',
          instructions: 'Rédige chaque partie du publipostage : il doit annoncer qu’une peluche d’ourson est offerte le 20 décembre pour 4 produits achetés.',
          helps: ['Attention : une accroche courte.', 'Intérêt : l’offre et ses dates. Désir : les bénéfices. Action : quand et où venir.', 'Utilise « vous », pas « nous ».'],
          outcomeIds: R1,
          fields: [
            w('a', 'A — Attention (accroche)', 'Et si Noël fondait de plaisir cette année ?', ['Une question ou une exclamation.'], 1),
            w('i', 'I — Intérêt', 'Du 15 au 24 décembre, le deuxième produit Cacaoline est à −50 %. Le 20 décembre, une peluche ourson de 20 cm est offerte pour 4 produits achetés.', ['Offre + dates.'], 2),
            w('d', 'D — Désir', 'Un chocolat fin au cœur fondant, à offrir ou à partager en famille.', ['Bénéfices pour le client.'], 2),
            w('ac', 'A — Action', 'Rendez-vous vite au rayon confiserie de votre supermarché : offre dans la limite des stocks !', ['Incitation + lieu.'], 2),
          ],
        },
      ],
      selfAssessment: ['Je sais concevoir des supports de communication attractifs.'],
    },
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Mettre en place une soirée événementielle',
      guidance: 'autonome',
      hero: { id: 'd12-soiree', alt: 'Façade illuminée d’un grand magasin de mode' },
      message: { from: 'Hugo Prévost', role: 'Responsable, grand magasin Les Galeries du Centre', text: ['Le 25 avril, nous organisons une soirée de lancement de la collection Printemps-Été d’une marque de mode. Sélectionne les clients à inviter, calcule le coût de la soirée et sa rentabilité.'] },
      documents: [
        { id: 'd12-a2-doc1', number: 1, title: 'Consignes', look: 'memo', blocks: [{ type: 'list', items: ['Soirée de 19 h à minuit : avant-première de la collection, petits fours offerts, cocktail, DJ à partir de 21 h ; 20 % de remise sur toute commande.', 'Invitations par courrier aux clients qui ont au moins 5 ans d’ancienneté et un achat dans les 12 derniers mois.', `${LETTRES} lettres envoyées.`, 'Taux de marge brute moyen sur les ventes de la soirée : 40 % du CA.'] }] },
        { id: 'd12-a2-doc2', number: 2, title: 'Coûts de l’événement', look: 'facture', blocks: [{ type: 'table', head: ['Poste', 'Coût'], rows: [['Enveloppe', '0,03 €'], ['Lettre et impression', '0,05 €'], ['Affranchissement', '0,95 € l’envoi, 0,85 € au-delà de 200 envois'], ['Réalisation du publipostage', '60 €'], ['Petits fours et cocktail', '150 €'], ['DJ', '1 000 €'], ['Affichage', '40 €']] }] },
      ],
      activities: [
        {
          id: 'd12-a2-a1',
          kind: 'fields',
          label: '1',
          title: 'Sélectionner les clients',
          instructions: 'Indique si chaque client est invité.',
          helps: ['Deux conditions à vérifier ensemble.', 'Ancienneté : au moins 5 ans.', 'Dernier achat : il y a 12 mois au plus (nous sommes en avril N).'],
          outcomeIds: R1,
          fields: INVITES.map((c): Field => ({ id: c.id, label: `${c.nom} — contrat ${c.ouverture}, dernier achat ${c.dernier}, panier ${c.panier} €`, kind: 'choice', options: OUI_NON, answer: c.choix ? 'oui' : 'non', explain: c.choix ? 'Les deux conditions sont remplies.' : c.anciennete < 5 ? 'Moins de 5 ans d’ancienneté.' : 'Pas d’achat depuis plus de 12 mois.' })),
        },
        {
          id: 'd12-a2-a2',
          kind: 'fields',
          label: '2-3',
          title: 'Coût et rentabilité de l’événement',
          instructions: 'Calcule le coût total, puis la rentabilité : 100 clients ont dépensé en moyenne 50 € HT.',
          helps: ['Papier = 300 × (0,03 + 0,05). Affranchissement = 200 × 0,95 + 100 × 0,85.', 'Publipostage = papier + affranchissement + 60 € ; organisation = 150 + 1 000 + 40.', 'Résultat = marge brute (40 % du CA) − coût total.'],
          outcomeIds: R2,
          fields: [
            num('envoi', '1. Affranchissement', SOIREE.envoi, `200 × 0,95 + 100 × 0,85 = ${eur(SOIREE.envoi)}.`, '€', 0.011),
            num('publi', '2. Coût total du publipostage', SOIREE.publipostage, `${fr(SOIREE.papier)} + ${fr(SOIREE.envoi)} + 60 = ${eur(SOIREE.publipostage)}.`, '€', 0.011),
            num('orga', '3. Coût de l’organisation', SOIREE.organisation, `150 + 1 000 + 40 = ${eur(SOIREE.organisation)}.`, '€', 0.011),
            num('total', '4. Coût total de l’événement', SOIREE.total, `${eur(SOIREE.total)}.`, '€', 0.011),
            num('ca', '5. CA réalisé', SOIREE.ca, '100 × 50 = 5 000 €.', '€', 0.011),
            num('mb', '6. Marge brute (40 %)', SOIREE.margeBrute, `${SOIREE.ca} × 40 % = ${eur(SOIREE.margeBrute)}.`, '€', 0.011),
            num('res', '7. Résultat de l’opération', SOIREE.resultat, `${fr(SOIREE.margeBrute)} − ${fr(SOIREE.total)} = ${eur(SOIREE.resultat)}.`, '€', 0.011),
            { id: 'rentable', label: '8. L’opération est-elle rentable ?', kind: 'choice', options: OUI_NON, answer: SOIREE.resultat > 0 ? 'oui' : 'non', explain: 'Résultat positif, et la soirée fidélise les meilleurs clients.' },
          ],
        },
      ],
      selfAssessment: ['Je sais cibler les invités d’un événement et en calculer la rentabilité.'],
    },
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Analyser les performances d’une opération',
      guidance: 'autonome',
      message: { from: 'Magali Prost', role: 'Responsable, boutique Cuir & Temps, Nice', text: ['Fais l’évaluation quantitative et qualitative de notre journée « Black Friday » sur les portefeuilles, puis envoie-moi un compte rendu.'] },
      documents: [
        { id: 'd12-a3-doc1', number: 1, title: 'Ventes de la journée et objectifs', look: 'facture', blocks: [{ type: 'table', head: ['Article', 'Prix promo', 'Vendus', 'Coût d’achat'], align: ['left', 'right', 'right', 'right'], rows: PORTEFEUILLES.map((p) => [p.name, eur(p.pv), String(p.qte), eur(p.pa)]) }, { type: 'note', text: `Objectifs : CA ${OBJ_BF.ca} €, volume ${OBJ_BF.volume} articles, marge brute ${OBJ_BF.marge} €.` }] },
        { id: 'd12-a3-doc2', number: 2, title: 'Enquête auprès des clients', look: 'texte', blocks: [{ type: 'table', head: ['Question', 'Satisfait', 'Moyen', 'Insatisfait'], align: ['left', 'right', 'right', 'right'], rows: [['Choix des produits en promotion', '20 %', '36 %', '44 %'], ['Information sur l’opération', '10 %', '28 %', '62 %'], ['Ambiance', '86 %', '10 %', '4 %'], ['Intention de revenir', '88 %', '7 %', '5 %'], ['Durée de l’opération suffisante', '14 %', '24 %', '62 %'], ['Accueil du personnel', '98 %', '1 %', '1 %']] }] },
        {
          id: "d12-revision-5-doc",
          number: 3,
          title: "Évaluer une journée dégustation en épicerie",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’épicerie fixe un objectif de 30 essais et de 12 achats liés. Elle relève 36 essais et 9 achats. La marge liée est de 72 € et les coûts directs de dégustation de 45 €. L’équipe a noté trois demandes pour un format plus petit."
            }
          ]
        },
        {
          id: "d12-revision-dossier-doc1",
          number: 4,
          title: "Rétroplanning et budget",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Animation samedi de 14 h à 16 h. Message validé mardi, envoi imprimeur mercredi midi, affiches vendredi. Les kits sont prêts vendredi à 15 h. Coûts prévus de 35 € pour l’impression et 40 € pour l’animation. Objectifs de 20 présents et 10 ventes liées."
            }
          ]
        },
        {
          id: "d12-revision-dossier-doc2",
          number: 5,
          title: "Alerte de mercredi",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’imprimeur annule sans facturer. Le magasin peut imprimer localement pour 25 €, à installer vendredi, ou utiliser uniquement ses écrans et son site pour 10 €. Les écrans ne sont visibles qu’après l’entrée. L’animation a besoin d’attirer les passants."
            }
          ]
        },
        {
          id: "d12-revision-dossier-doc3",
          number: 6,
          title: "Bilan après installation des affiches locales",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Mesure",
                "Samedi de référence",
                "Samedi de l’animation"
              ],
              rows: [
                [
                  "CA sur le créneau",
                  "460 €",
                  "620 €"
                ],
                [
                  "Marge sur ventes",
                  "160 €",
                  "232 €"
                ],
                [
                  "Fréquentation magasin",
                  "80",
                  "110"
                ]
              ]
            },
            {
              type: "p",
              text: "L’atelier relève 22 présents et 8 ventes attribuées. Le coût de l’animation est de 40 €, auquel s’ajoute l’impression locale."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd12-a3-a1',
          kind: 'fields',
          label: '1',
          title: 'Mesurer la rentabilité',
          instructions: 'Calcule les résultats de la journée et les taux de réalisation.',
          helps: ['CA = somme des prix × quantités.', 'Marge = somme des (prix − coût) × quantités.', 'Taux de réalisation = réalisé ÷ objectif × 100.'],
          outcomeIds: R2,
          fields: [
            num('ca', 'CA de la journée', BF.ca, `${eur(BF.ca)}.`, '€', 0.011),
            num('vol', 'Volume vendu', BF.volume, `${BF.volume} articles.`),
            num('marge', 'Marge brute', BF.marge, `${eur(BF.marge)}.`, '€', 0.011),
            num('tCa', 'Taux de réalisation du CA', BF.tauxCa, `${BF.ca} ÷ ${OBJ_BF.ca} × 100 = ${fr(BF.tauxCa)} %.`, '%', 0.011),
            num('tMarge', 'Taux de réalisation de la marge', BF.tauxMarge, `${BF.marge} ÷ ${OBJ_BF.marge} × 100 = ${fr(BF.tauxMarge)} %.`, '%', 0.011),
          ],
        },
        {
          id: 'd12-a3-a2',
          kind: 'fields',
          label: '2',
          title: 'Points forts, points faibles, améliorations',
          instructions: 'Exploite l’enquête.',
          helps: ['Points forts : plus de 80 % de satisfaits.', 'Points faibles : plus de 40 % d’insatisfaits.', 'À chaque point faible, une amélioration.'],
          outcomeIds: R3,
          fields: [
            { id: 'forts', label: 'Points forts (plusieurs réponses)', kind: 'multi', options: [{ value: 'ambiance', label: 'Ambiance' }, { value: 'revenir', label: 'Intention de revenir' }, { value: 'accueil', label: 'Accueil du personnel' }, { value: 'choix', label: 'Choix des produits' }], answers: ['ambiance', 'revenir', 'accueil'], explain: 'Plus de 85 % de satisfaits.' },
            { id: 'info', label: 'Information insuffisante (62 % d’insatisfaits) : amélioration', kind: 'choice', options: [{ value: 'a', label: 'Annoncer l’opération une semaine avant sur les réseaux et par courriel aux clients' }, { value: 'b', label: 'Supprimer l’affichage' }], answer: 'a', explain: 'Mieux informer en amont.' },
            { id: 'duree', label: 'Durée trop courte (62 %) : amélioration', kind: 'choice', options: [{ value: 'a', label: 'Étendre l’opération au week-end du Black Friday' }, { value: 'b', label: 'Réduire à une demi-journée' }], answer: 'a', explain: 'Plus de temps pour venir.' },
            { id: 'choix', label: 'Choix décevant (44 %) : amélioration', kind: 'choice', options: [{ value: 'a', label: 'Élargir la sélection aux sacs et ceintures' }, { value: 'b', label: 'Garder les mêmes produits' }], answer: 'a', explain: 'Offre plus large.' },
          ],
        },
        {
          id: 'd12-a3-a3',
          kind: 'open',
          label: '3',
          title: 'Compte rendu par courriel',
          instructions: 'Rédige le compte rendu de fin de journée à ta responsable.',
          helps: ['Commence par les chiffres et les taux de réalisation.', 'Résume l’enquête en points forts et faibles.', 'Termine par trois propositions.'],
          outcomeIds: R23,
          prompts: [{ id: 'cr', label: 'Courriel', lines: 10 }],
          selfCheck: ['Les résultats chiffrés sont comparés aux objectifs.', 'L’enquête est exploitée.', 'Des améliorations sont proposées.'],
        },
        {
          id: "d12-revision-5",
          label: "Nouveau cas d’application",
          title: "Évaluer une journée dégustation en épicerie",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Compare objectifs et résultats avant de proposer une modification.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "9 ÷ 36 × 100 = 25 %."
          ],
          outcomeIds: [
            "d12-r1",
            "d12-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel taux d’achat parmi les personnes ayant essayé obtiens-tu ?",
              kind: "number",
              answer: 25,
              explain: "9 ÷ 36 × 100 = 25 %."
            },
            {
              id: "q2",
              label: "Quel résultat après coûts directs obtiens-tu ?",
              kind: "number",
              answer: 27,
              explain: "72 − 45 = 27 €."
            },
            {
              id: "q3",
              label: "Écris le bilan et une correction testable.",
              kind: "written",
              lines: 3,
              model: "Les essais dépassent l’objectif de six, les achats sont en dessous de trois, et la marge après coûts est de 27 €. Tester un format plus petit avec un prix visible et comparer le taux d’achat sur un créneau équivalent."
            }
          ]
        },
        {
          id: "d12-revision-dossier",
          label: "Dossier de décision",
          title: "Piloter une animation quand le support prévu devient indisponible",
          instructions: "Lis les documents 4 et 5, puis écris ton diagnostic initial. Passe ensuite au document 6 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Rédige la décision opérationnelle, puis compare objectifs, volume de fréquentation et résultat après coûts.",
            "Mets en regard objectif et réalisé. Pour le résultat de l’animation, retire les coûts directs de la marge du jour, puis compare au jour de référence.",
            "Exemple. Avec 100 € de marge pendant l’action, 30 € de coûts et 65 € de marge habituelle, on obtient 70 € après coûts, soit +5 €. L’écart de chiffre d’affaires se calcule séparément."
          ],
          outcomeIds: [
            "d12-r1",
            "d12-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Choisis un support de repli et précise le nouveau chemin critique.",
              kind: "written",
              lines: 6,
              model: "Imprimer localement pour 25 € afin de garder une affiche visible des passants. Réutiliser le visuel validé, vérifier la sortie papier, installer vendredi et contrôler lieu, horaire et mode d’inscription. Budget direct total de 65 €."
            },
            {
              id: "q2",
              label: "Compare les objectifs de présence et de vente au bilan.",
              kind: "written",
              lines: 6,
              model: "22 présents, soit +2. Huit ventes attribuées, soit −2. Le taux d’achat parmi les présents est de 8 ÷ 22, environ 36,4 %, contre un objectif implicite de 10 ÷ 20, soit 50 %."
            },
            {
              id: "q3",
              label: "Calcule la variation du CA et l’écart de marge après coûts directs.",
              kind: "written",
              lines: 6,
              model: "CA en hausse de 160 €, soit environ 34,8 %. Marge après coûts de 232 − 65 = 167 €, soit 7 € de plus que la référence. La fréquentation augmente aussi de 37,5 %, donc la comparaison brute n’isole pas l’effet de l’animation."
            },
            {
              id: "q4",
              label: "Propose une correction sans augmenter immédiatement le budget.",
              kind: "written",
              lines: 6,
              model: "Conserver l’affiche et tester un argumentaire de fin d’atelier avec prix et accès au rayon. Sur un autre samedi comparable, mesurer les ventes attribuées par participant et le coût direct. Noter la fréquentation pour interpréter la comparaison."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais évaluer une opération de façon quantitative et qualitative.',
        "Je préserve l’objectif du support lors du changement de planning.",
        "Je distingue la fréquentation, les ventes attribuées et la marge après coûts.",
        "Je propose une correction dont l’effet peut être observé au prochain créneau."],
    },
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais planifier des actions commerciales sur l’année.',
        'Je sais choisir des supports de communication en respectant un budget.',
        'Je sais calculer et analyser les performances d’une action.',
        'Je sais comparer les résultats aux objectifs et proposer des actions correctrices.',
      ],
    },
  ],
};
