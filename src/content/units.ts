import type {
  ContentSource,
  ExpectedOutcome,
  LearningUnit,
  MetaCompetenceId,
  PartId,
  UnitKind,
} from '../domain/types';

/**
 * Les 13 dossiers et 2 scénarios transversaux.
 *
 * - `title`, `skills` et `outcomes` (source « manuel ») : formulations du sommaire et de la grille.
 * - `summary`, `overview`, `plannedSituations` : rédigés pour la plateforme.
 * - `plannedCriteria` : critères ajoutés par l'équipe pédagogique (jamais présentés comme citation).
 *
 * Pour ouvrir un dossier : passer `availability` à « disponible » et renseigner `missions`.
 */

/** Unités dont le chapitre est développé (voir src/content/chapters). */
const OPEN_UNITS = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 's1', 'd09', 'd10', 'd11', 'd12', 'd13'];

interface UnitInput {
  id: string;
  kind: UnitKind;
  number: number;
  order: number;
  partId: PartId;
  title: string;
  summary: string;
  overview: string;
  skills: string[];
  metaCompetenceIds: MetaCompetenceId[];
  outcomes: Array<[text: string, mc: MetaCompetenceId[] | null, echoes?: string]>;
  plannedCriteria?: Array<[text: string, mc: MetaCompetenceId[] | null, note?: string]>;
  plannedSituations: string[];
  mobilisesUnitIds?: string[];
}

function build(u: UnitInput): LearningUnit {
  const outcome = (
    i: number,
    text: string,
    mc: MetaCompetenceId[] | null,
    source: ContentSource,
    prefix: string,
    extra: Partial<ExpectedOutcome> = {},
  ): ExpectedOutcome => ({
    id: `${u.id}-${prefix}${i + 1}`,
    text,
    source,
    // null : le résultat contribue aux méta-compétences du dossier (grille du manuel).
    metaCompetenceIds: mc ?? u.metaCompetenceIds,
    ...extra,
  });

  return {
    id: u.id,
    kind: u.kind,
    number: u.number,
    order: u.order,
    partId: u.partId,
    title: u.title,
    summary: u.summary,
    overview: u.overview,
    skills: u.skills.map((text, i) => ({ id: `${u.id}-c${i + 1}`, text })),
    metaCompetenceIds: u.metaCompetenceIds,
    outcomes: u.outcomes.map(([text, mc, echoes], i) =>
      outcome(i, text, mc, 'manuel', 'r', echoes ? { echoesOutcomeId: echoes } : {}),
    ),
    plannedCriteria: (u.plannedCriteria ?? []).map(([text, mc, note], i) =>
      outcome(i, text, mc, 'ajout-pedagogique', 'x', note ? { note } : {}),
    ),
    plannedSituations: u.plannedSituations,
    mobilisesUnitIds: u.mobilisesUnitIds,
    availability: OPEN_UNITS.includes(u.id) ? 'disponible' : 'a-venir',
    missions: [],
  };
}

const RAW: UnitInput[] = [
  /* ----------------------------- PARTIE 1 ----------------------------- */
  {
    id: 'd01',
    kind: 'dossier',
    number: 1,
    order: 1,
    partId: 'p1',
    title: 'Participer à l’approvisionnement et préparer les commandes',
    summary: 'Identifier les besoins du magasin, commander au bon fournisseur et préparer les commandes clients du web.',
    overview:
      'Un rayon vide fait perdre des ventes, un rayon trop plein immobilise de l’argent. Dans ce dossier, tu apprendras à repérer ce qu’il faut commander, à comparer les propositions de la centrale d’achat et des fournisseurs directs, à remplir un bon de commande en tenant compte des délais, des quantités et des coûts, puis à préparer les commandes passées par les clients sur les différents canaux de l’enseigne.',
    skills: [
      'Établir les commandes des produits auprès de la centrale d’achat et/ou d’un fournisseur direct, en tenant compte des contraintes.',
      'Préparer les commandes des clients issues de l’omnicanal.',
    ],
    metaCompetenceIds: ['mc1'],
    outcomes: [
      ['Le processus d’achat et d’approvisionnement est maîtrisé dans le respect des coûts et des délais impartis.', null],
    ],
    plannedSituations: [
      'Identifier les besoins d’approvisionnement d’un magasin.',
      'Comparer des propositions fournisseurs.',
      'Compléter un bon de commande.',
      'Préparer une commande issue d’un site marchand.',
      'Prendre en compte les délais, les quantités et les coûts.',
    ],
  },
  {
    id: 'd02',
    kind: 'dossier',
    number: 2,
    order: 2,
    partId: 'p1',
    title: 'Réceptionner et contrôler les marchandises',
    summary: 'Contrôler une livraison, repérer les anomalies et préparer les réclamations et retours fournisseurs.',
    overview:
      'Le camion est à quai. Avant de signer quoi que ce soit, il faut vérifier que ce qui arrive correspond à ce qui a été commandé, en quantité comme en qualité. Tu apprendras à confronter bon de commande et bon de livraison, à repérer les produits manquants, abîmés ou dont les dates posent problème, à émettre des réserves, puis à relancer le fournisseur et à préparer les retours.',
    skills: [
      'Réceptionner, contrôler et stocker les marchandises (quantitatif et qualitatif).',
      'Effectuer les relances et préparer les retours fournisseurs.',
    ],
    metaCompetenceIds: ['mc1'],
    outcomes: [
      ['La marchandise sensible est sécurisée.', null],
      ['Les dates limites de vente et de péremption des produits sont respectées.', null],
    ],
    plannedSituations: [
      'Comparer un bon de commande et un bon de livraison.',
      'Repérer les quantités manquantes.',
      'Identifier des produits endommagés.',
      'Contrôler les dates limites applicables.',
      'Compléter un document de réserve ou de retour.',
      'Préparer un courriel de réclamation fournisseur.',
    ],
  },
  {
    id: 'd03',
    kind: 'dossier',
    number: 3,
    order: 3,
    partId: 'p1',
    title: 'Gérer les stocks',
    summary: 'Lire un état des stocks, repérer ruptures et surstocks, calculer des indicateurs et réapprovisionner.',
    overview:
      'Combien reste-t-il réellement en réserve ? Quand faut-il recommander ? Dans ce dossier, tu exploiteras un état des stocks et un outil de gestion commerciale pour repérer les ruptures et les surstocks, calculer les indicateurs utiles et décider des réapprovisionnements, tout en respectant les règles d’hygiène et de sécurité propres au stockage.',
    skills: [
      'Veiller à la gestion rigoureuse des stocks et au réapprovisionnement en tenant compte des règles d’hygiène et de sécurité.',
      'Enrichir et exploiter le système d’information commercial.',
    ],
    metaCompetenceIds: ['mc1'],
    outcomes: [
      ['L’état des stocks est correctement renseigné et analysé.', null],
      ['Les stocks sont optimisés.', null],
    ],
    plannedSituations: [
      'Analyser un état des stocks.',
      'Identifier les ruptures et les surstocks.',
      'Calculer des indicateurs de gestion.',
      'Déterminer des besoins de réapprovisionnement.',
      'Exploiter un logiciel ou un tableau de gestion commerciale.',
    ],
  },
  {
    id: 'd04',
    kind: 'dossier',
    number: 4,
    order: 4,
    partId: 'p1',
    title: 'Agencer la surface de vente en respectant les règles d’hygiène et de sécurité',
    summary: 'Analyser un plan de magasin, sécuriser la circulation, trier et valoriser les déchets.',
    overview:
      'Un magasin bien agencé se parcourt facilement, sans danger, et donne une bonne image de l’enseigne. Tu analyseras des plans de surface de vente pour repérer les problèmes de circulation, d’accessibilité ou de sécurité, tu proposeras des aménagements adaptés au type d’unité commerciale, et tu identifieras les bonnes pratiques de tri, de valorisation des déchets et de lutte contre le gaspillage.',
    skills: [
      'Participer à l’agencement de la surface de vente.',
      'Veiller au respect des règles d’hygiène et de sécurité.',
      'Respecter les règles de valorisation des déchets et réduire le gaspillage.',
    ],
    metaCompetenceIds: ['mc2', 'mc1'],
    outcomes: [
      ['L’agencement de l’unité commerciale est pertinent et différencié selon les types d’unités commerciales.', null],
      ['Les déchets sont valorisés et le gaspillage est réduit.', null],
      ['Les règles d’hygiène et de sécurité sont scrupuleusement respectées.', null],
    ],
    plannedSituations: [
      'Analyser un plan de magasin.',
      'Repérer des problèmes de circulation ou de sécurité.',
      'Proposer un aménagement.',
      'Identifier les pratiques de tri et de valorisation des déchets.',
      'Améliorer l’accessibilité et la fonctionnalité d’un espace commercial.',
    ],
  },
  {
    id: 'd05',
    kind: 'dossier',
    number: 5,
    order: 5,
    partId: 'p1',
    title: 'Fixer le prix de vente',
    summary: 'Calculer un prix, exploiter la TVA, une marge ou un coefficient, et vérifier sa cohérence commerciale.',
    overview:
      'Un prix ne se choisit pas au hasard : il doit couvrir le coût d’achat, dégager une marge et rester cohérent avec la politique de l’enseigne et les prix pratiqués autour. Tu apprendras à passer du prix d’achat au prix de vente, à utiliser la TVA, le taux de marque et le coefficient multiplicateur, et à vérifier qu’un prix proposé tient la route.',
    skills: ['Établir le prix en fonction de variables commerciales données.'],
    metaCompetenceIds: ['mc1'],
    outcomes: [
      ['Les produits commercialisés sont connus et leurs caractéristiques techniques (et commerciales) sont maîtrisées.', null],
    ],
    plannedCriteria: [
      [
        'Les calculs de prix (coût d’achat, marge, taux de marque, coefficient multiplicateur, TVA) sont exacts.',
        null,
        'Critère ajouté pour les futures activités : la grille du manuel ne contient pas de résultat portant sur les calculs de prix.',
      ],
      [
        'Le prix de vente retenu est cohérent avec les variables commerciales données et la politique de l’enseigne.',
        null,
        'Critère ajouté pour les futures activités.',
      ],
    ],
    plannedSituations: [
      'Calculer un prix de vente.',
      'Exploiter un taux de TVA.',
      'Calculer une marge ou un taux de marque.',
      'Analyser un coefficient multiplicateur.',
      'Prendre en compte une politique commerciale.',
      'Vérifier la cohérence d’un prix proposé.',
    ],
  },
  {
    id: 'd06',
    kind: 'dossier',
    number: 6,
    order: 6,
    partId: 'p1',
    title: 'Participer aux opérations d’inventaire',
    summary: 'Compter, comparer stock théorique et stock physique, expliquer les écarts et lutter contre la démarque.',
    overview:
      'Ce que dit le logiciel et ce qu’il y a vraiment dans les rayons ne coïncident pas toujours. Tu participeras à un inventaire, tu compareras stock théorique et stock physique, tu identifieras les invendus et les causes possibles de démarque (casse, vol, erreurs), puis tu choisiras les mesures de prévention, d’étiquetage et de sécurisation adaptées.',
    skills: [
      'Participer aux opérations d’inventaire.',
      'Identifier les invendus.',
      'Lutter contre la démarque.',
      'Étiqueter les produits et les sécuriser.',
    ],
    metaCompetenceIds: ['mc1'],
    outcomes: [
      ['Les causes et les conséquences de la démarque sont clairement identifiées et les solutions proposées sont adaptées.', null],
    ],
    plannedSituations: [
      'Réaliser un inventaire fictif interactif.',
      'Comparer le stock théorique au stock physique.',
      'Identifier un écart.',
      'Déterminer les causes possibles de démarque.',
      'Choisir des mesures de prévention.',
      'Sécuriser les produits sensibles.',
    ],
  },
  {
    id: 'd07',
    kind: 'dossier',
    number: 7,
    order: 7,
    partId: 'p1',
    title: 'Gérer les retours et les échanges des clients',
    summary: 'Traiter une demande de retour, distinguer garantie légale et geste commercial, répondre au client.',
    overview:
      'Un client revient avec un produit : faut-il rembourser, échanger, refuser ? Tu analyseras des demandes de retour, vérifieras les justificatifs, distingueras ce qu’impose la loi de ce que propose l’enseigne, puis tu formuleras une réponse professionnelle et une solution adaptée — en gardant le client.',
    skills: ['Gérer les retours et les échanges des clients.'],
    metaCompetenceIds: ['mc1'],
    outcomes: [['Les axes d’amélioration proposés sont réalisables.', null]],
    plannedSituations: [
      'Analyser une demande de retour.',
      'Identifier les conditions de remboursement ou d’échange.',
      'Distinguer garantie légale et politique commerciale.',
      'Vérifier un justificatif d’achat.',
      'Préparer une réponse professionnelle à un client.',
      'Proposer une solution adaptée à une situation donnée.',
    ],
  },
  {
    id: 's1',
    kind: 'scenario',
    number: 1,
    order: 8,
    partId: 'p1',
    title: 'Assurer les opérations préalables à la vente',
    summary: 'Une semaine dans la même entreprise : commander, réceptionner, stocker et fixer les prix, sans filet.',
    overview:
      'Ce scénario n’est pas un questionnaire récapitulatif. Tu seras placé dans une seule entreprise et tu enchaîneras, comme en situation réelle, les tâches de la partie 1 : passer les commandes validées avec ta hiérarchie, réceptionner et contrôler la livraison, relancer un fournisseur, gérer le stock et fixer les prix. Chaque décision aura des conséquences sur la suite.',
    skills: [
      'Établir les commandes des produits auprès de la centrale d’achats et/ou des fournisseurs indépendants sélectionnés avec la hiérarchie, en tenant compte des contraintes.',
      'Réceptionner, contrôler les marchandises et stocker les marchandises (quantitatif et qualitatif).',
      'Effectuer les relances et préparer les retours fournisseurs.',
      'Veiller à la gestion rigoureuse des stocks et au réapprovisionnement en tenant compte des règles de sécurité et d’hygiène.',
      'Établir le prix en fonction de variables commerciales données.',
    ],
    metaCompetenceIds: ['mc1'],
    outcomes: [
      ['Le processus d’achat et d’approvisionnement est maîtrisé dans le respect des coûts et des délais impartis.', ['mc1'], 'd01-r1'],
      ['L’état des stocks est correctement renseigné et analysé.', ['mc1'], 'd03-r1'],
      ['Les stocks sont optimisés.', ['mc1'], 'd03-r2'],
    ],
    plannedSituations: [],
    mobilisesUnitIds: ['d01', 'd02', 'd03', 'd05'],
  },

  /* ----------------------------- PARTIE 2 ----------------------------- */
  {
    id: 'd08',
    kind: 'dossier',
    number: 8,
    order: 9,
    partId: 'p2',
    title: 'Implanter les produits',
    summary: 'Lire un plan de rayon, repérer zones chaudes et froides, organiser les familles de produits.',
    overview:
      'Pourquoi le pain est-il au fond du magasin et les bonbons près des caisses ? Tu découvriras les logiques d’implantation et les principes du merchandising, tu analyseras des plans de rayon, repéreras les zones chaudes et froides, organiseras les familles de produits et proposeras une implantation commerciale adaptée.',
    skills: ['Assurer les opérations préalables à la vente.', 'Mettre en scène l’offre et en assurer la visibilité.'],
    metaCompetenceIds: ['mc2'],
    outcomes: [
      ['Les enjeux de la mise en valeur des produits et des services associés sont précisés.', null],
      ['L’attractivité des produits, des rayons et de l’unité commerciale est analysée.', null],
      ['Des actions de remédiation sont mises en place le cas échéant.', null],
    ],
    plannedSituations: [
      'Analyser un plan de rayon.',
      'Identifier les zones chaudes et froides.',
      'Comprendre les logiques d’implantation.',
      'Organiser les familles de produits.',
      'Exploiter les principes de merchandising.',
      'Proposer une implantation commerciale adaptée.',
    ],
  },
  {
    id: 'd09',
    kind: 'dossier',
    number: 9,
    order: 10,
    partId: 'p2',
    title: 'Mettre en scène l’offre',
    summary: 'Préparer une vitrine, organiser une tête de gondole, créer une ambiance et une signalétique.',
    overview:
      'La vitrine est le premier vendeur du magasin. Tu choisiras les produits à valoriser, prépareras une vitrine et une tête de gondole, créeras une ambiance commerciale cohérente et une signalétique claire pour accueillir, informer et orienter le client — puis tu justifieras chacun de tes choix.',
    skills: [
      'Aménager la vitrine et/ou le rayon.',
      'Mettre en scène l’offre et en optimiser la visibilité.',
      'Accueillir, informer et orienter le client dans l’unité commerciale et à l’extérieur.',
    ],
    metaCompetenceIds: ['mc2'],
    outcomes: [
      [
        'L’attractivité des produits, des rayons et de l’unité commerciale est analysée et des actions de remédiation sont mises en place le cas échéant.',
        null,
      ],
    ],
    plannedSituations: [
      'Préparer une vitrine commerciale.',
      'Choisir les produits à valoriser.',
      'Organiser une tête de gondole.',
      'Créer une ambiance commerciale cohérente.',
      'Concevoir une signalétique.',
      'Justifier les choix de présentation.',
      'Analyser l’attractivité d’un rayon.',
    ],
  },
  {
    id: 'd10',
    kind: 'dossier',
    number: 10,
    order: 11,
    partId: 'p2',
    title: 'Valoriser l’offre sur les sites marchands et les réseaux sociaux',
    summary: 'Améliorer une fiche produit, créer un contenu pour un réseau social, respecter la charte de l’enseigne.',
    overview:
      'Le rayon continue en ligne. Tu analyseras et amélioreras des fiches produits, concevras des contenus commerciaux pour les réseaux sociaux, adapteras le message à une clientèle cible et vérifieras que tout reste conforme à la politique de communication de l’enseigne.',
    skills: ['Valoriser l’offre sur les sites marchands et les réseaux sociaux.'],
    metaCompetenceIds: ['mc2'],
    outcomes: [
      ['L’information est conforme à la politique de l’enseigne, visible et attractive.', null],
      ['La politique de communication est en adéquation avec l’offre produit et la clientèle.', null],
    ],
    plannedSituations: [
      'Analyser une fiche produit.',
      'Améliorer la présentation d’une offre.',
      'Concevoir un contenu commercial pour un réseau social.',
      'Adapter un message à une clientèle cible.',
      'Vérifier le respect de la politique de communication de l’enseigne.',
    ],
  },

  /* ----------------------------- PARTIE 3 ----------------------------- */
  {
    id: 'd11',
    kind: 'dossier',
    number: 11,
    order: 12,
    partId: 'p3',
    title: 'Préparer l’action commerciale',
    summary: 'Fixer les objectifs d’une opération, choisir la cible et les produits, bâtir un budget, convaincre.',
    overview:
      'Avant une animation commerciale, il faut savoir ce qu’on veut obtenir. Tu identifieras les objectifs d’une opération, choisiras un public cible et les gammes de produits à mettre en avant, compareras plusieurs actions génératrices de trafic, prépareras un budget et défendras ta proposition auprès de ton responsable.',
    skills: [
      'Proposer des actions commerciales génératrices de trafic dans l’unité commerciale.',
      'Sélectionner les gammes de produits à mettre en avant en lien avec la stratégie de l’unité commerciale.',
    ],
    metaCompetenceIds: ['mc3'],
    outcomes: [
      ['Les propositions d’actions commerciales sont argumentées et cohérentes avec les objectifs à atteindre.', null],
      ['Les recommandations de l’enseigne sont respectées.', null],
    ],
    plannedSituations: [
      'Identifier les objectifs d’une opération commerciale.',
      'Choisir un public cible.',
      'Sélectionner les produits.',
      'Comparer différentes actions commerciales.',
      'Préparer un budget.',
      'Justifier une proposition auprès d’un responsable.',
    ],
  },
  {
    id: 'd12',
    kind: 'dossier',
    number: 12,
    order: 13,
    partId: 'p3',
    title: 'Mener l’action commerciale et évaluer les résultats',
    summary: 'Planifier l’opération, communiquer, puis analyser le tableau de bord et proposer des corrections.',
    overview:
      'L’opération est lancée : il faut l’organiser, la faire connaître, puis mesurer ce qu’elle a rapporté. Tu construiras un rétroplanning, prépareras les supports d’animation, calculeras des indicateurs de performance, exploiteras un tableau de bord et compareras objectifs et réalisations pour proposer des améliorations argumentées.',
    skills: [
      'Participer à la planification et à l’organisation des actions de promotion des marchandises.',
      'Communiquer sur l’événement.',
      'Participer à l’évaluation et à l’analyse des performances des actions commerciales.',
      'Comparer les résultats aux objectifs fixés et proposer des actions correctrices.',
    ],
    metaCompetenceIds: ['mc3'],
    outcomes: [
      [
        'Les performances commerciales et financières des actions de conquête de nouveaux clients sont contrôlées et évaluées en analysant les tableaux de bord.',
        null,
      ],
      ['Les solutions / axes d’amélioration sont justifiés.', null],
    ],
    plannedSituations: [
      'Construire un rétroplanning.',
      'Préparer les supports d’une animation.',
      'Analyser les résultats d’une opération.',
      'Calculer des indicateurs de performance.',
      'Exploiter un tableau de bord.',
      'Comparer objectifs et réalisations.',
      'Proposer des améliorations argumentées.',
    ],
  },
  {
    id: 'd13',
    kind: 'dossier',
    number: 13,
    order: 14,
    partId: 'p3',
    title: 'Développer sa clientèle grâce aux canaux digitaux',
    summary: 'Cibler, prospecter en ligne, concevoir une opération interactive et collecter des contacts légalement.',
    overview:
      'Les nouveaux clients se trouvent aussi en ligne. Tu identifieras une clientèle cible, prépareras une campagne de prospection digitale, choisiras le bon canal, concevras une opération commerciale interactive et collecteras des contacts dans le respect des règles applicables, avant d’analyser les résultats de la campagne.',
    skills: [
      'Démarcher une nouvelle clientèle.',
      'Recourir aux sites marchands et aux réseaux sociaux.',
      'Inciter à l’achat par une action commerciale interactive.',
      'Générer des contacts positifs, utiles.',
    ],
    metaCompetenceIds: ['mc3'],
    outcomes: [
      [
        'Les supports utilisés respectent les contraintes et la réglementation et sont attractifs pour les clients actuels et potentiels.',
        null,
      ],
    ],
    plannedSituations: [
      'Identifier une clientèle cible.',
      'Préparer une campagne de prospection digitale.',
      'Choisir un canal de communication.',
      'Concevoir une opération commerciale interactive.',
      'Collecter des contacts dans le respect des règles applicables.',
      'Analyser les résultats d’une campagne.',
    ],
  },
  {
    id: 's2',
    kind: 'scenario',
    number: 2,
    order: 15,
    partId: 'p3',
    title: 'Rendre l’unité commerciale attractive et développer la clientèle',
    summary: 'Préparer, réaliser fictivement puis évaluer une opération commerciale complète, de la vitrine au bilan.',
    overview:
      'Dernière étape du parcours : tu prépares une opération commerciale de bout en bout. Aménager la vitrine et le rayon, implanter les produits, installer la signalétique, communiquer sur l’événement, puis analyser les performances obtenues. Les compétences des parties 2 et 3 sont mobilisées ensemble, dans une même entreprise.',
    skills: [
      'Aménager la vitrine et/ou le rayon.',
      'Mettre en scène l’offre et en optimiser la visibilité.',
      'Implanter les produits selon une logique commerciale et/ou d’entreprise.',
      'Mettre en place la signalétique.',
      'Communiquer sur l’événement.',
      'Participer à l’évaluation et à l’analyse des performances des actions commerciales.',
    ],
    metaCompetenceIds: ['mc2', 'mc3'],
    outcomes: [
      ['L’agencement de l’unité commerciale est pertinent et différencié selon les types d’unités commerciales.', ['mc2'], 'd04-r1'],
      [
        'L’attractivité des produits, des rayons et de l’unité commerciale est analysée et des actions de remédiation sont mises en place le cas échéant.',
        ['mc2'],
        'd09-r1',
      ],
      [
        'Les performances commerciales et financières des actions de conquête de nouveaux clients sont contrôlées et évaluées en analysant les tableaux de bord.',
        ['mc3'],
        'd12-r1',
      ],
    ],
    plannedSituations: [],
    mobilisesUnitIds: ['d04', 'd08', 'd09', 'd12'],
  },
];

export const UNITS: LearningUnit[] = RAW.map(build).sort((a, b) => a.order - b.order);
