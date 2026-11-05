import type { Chapter, Field, PlanningActivity } from '../../domain/chapter';

/**
 * DOSSIER 2 — Réceptionner et contrôler les marchandises
 *
 * Progression calquée sur le manuel de référence (contexte, 6 missions, synthèse, 3 applications).
 * Magasin, enseigne, fournisseurs, transporteurs, personnages, documents et chiffres : ORIGINAUX et fictifs.
 */

const R1 = ['d02-r1']; // La marchandise sensible est sécurisée.
const R2 = ['d02-r2']; // Les dates limites de vente et de péremption sont respectées.
const R12 = ['d02-r1', 'd02-r2'];
const OUI_NON = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];
const VF = [
  { value: 'vrai', label: 'Vrai' },
  { value: 'faux', label: 'Faux' },
];

/* =========================== Planning (mission 1) =========================== */

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
/** Du lundi 21/09 au mardi 13/10. */
export const PLANNING_DAYS = Array.from({ length: 23 }, (_, i) => {
  const num = i < 10 ? 21 + i : i - 9;
  const id = i < 10 ? `s${21 + i}` : `o${i - 9}`;
  return { id, dow: DOW[i % 7], num, month: i < 10 ? 'septembre' : 'octobre' };
});

const PLANNING: PlanningActivity = {
  id: 'd02-m1-a1',
  kind: 'planning',
  label: 'Annexe',
  title: 'Planning de suivi des livraisons — du 21/09 au 13/10',
  instructions:
    'Nous sommes le mercredi 30 septembre. Mets le planning à jour avec les documents 1 à 4 : commandes nouvelles, livraisons effectives, nouvelles dates prévues et relances à faire aujourd’hui.',
  helps: [
    'Traite les documents un par un : les bons de commande (nouvelles lignes et livraison effective), puis les deux courriels (nouvelles dates).',
    'Une relance se fait le lendemain d’une livraison prévue mais non reçue, si personne ne t’a prévenu. Cherche la commande dont la date prévue est passée, sans livraison et sans courriel.',
    'Cde 372 : livrée le 29. Cde 374 et 375 : commandées le 30, livraisons prévues le 6 et le 2. Cde 370 : nouvelle date le 1er. Cde 371 : nouvelle date le 5. Cde 373 : prévue le 29, rien reçu → relance le 30.',
  ],
  outcomeIds: R1,
  days: PLANNING_DAYS,
  rows: [
    {
      id: '368',
      label: '368',
      given: [
        { day: 's21', symbol: 'commande' },
        { day: 's25', symbol: 'prevue' },
        { day: 's26', symbol: 'relance' },
        { day: 's29', symbol: 'effective' },
      ],
      expected: [],
    },
    { id: '369', label: '369', given: [{ day: 's23', symbol: 'commande' }, { day: 'o5', symbol: 'prevue' }], expected: [] },
    {
      id: '370',
      label: '370',
      given: [{ day: 's25', symbol: 'commande' }, { day: 's28', symbol: 'prevue' }],
      expected: [{ day: 'o1', symbol: 'prevue', explain: 'Le fournisseur a prévenu (document 3) : livraison reportée au jeudi 1er octobre. Pas de relance, puisqu’il a informé le magasin.' }],
    },
    {
      id: '371',
      label: '371',
      given: [{ day: 's25', symbol: 'commande' }, { day: 's29', symbol: 'prevue' }],
      expected: [{ day: 'o5', symbol: 'prevue', explain: 'Le transporteur a prévenu (document 4) : livraison le lundi 5 octobre à cause de la grève.' }],
    },
    {
      id: '372',
      label: '372',
      given: [{ day: 's28', symbol: 'commande' }, { day: 's29', symbol: 'prevue' }],
      expected: [{ day: 's29', symbol: 'effective', explain: 'Le bon de commande 0372 porte le tampon « Livré le 29/09 ».' }],
    },
    {
      id: '373',
      label: '373',
      given: [{ day: 's24', symbol: 'commande' }, { day: 's29', symbol: 'prevue' }],
      expected: [{ day: 's30', symbol: 'relance', explain: 'Livraison prévue le 29, rien reçu et aucune nouvelle : on relance le lendemain, le 30 (document 2).' }],
    },
    {
      id: '374',
      label: '374',
      given: [],
      expected: [
        { day: 's30', symbol: 'commande', explain: 'Bon de commande 0374 daté du 30 septembre.' },
        { day: 'o6', symbol: 'prevue', explain: 'Livraison demandée le 6 octobre.' },
      ],
    },
    {
      id: '375',
      label: '375',
      given: [],
      expected: [
        { day: 's30', symbol: 'commande', explain: 'Bon de commande 0375 daté du 30 septembre.' },
        { day: 'o2', symbol: 'prevue', explain: 'Livraison demandée le 2 octobre.' },
      ],
    },
  ],
};

/* =========================== Procédure (mission 2) =========================== */

const STEP_OPTIONS = [
  { value: 'bl', label: 'Vérifier le bordereau de livraison et les étiquettes de colisage' },
  { value: 'transport', label: 'Compléter le document de transport et le remettre au chauffeur' },
  { value: 'deballer', label: 'Déballer les produits par référence' },
  { value: 'fiche', label: 'Compléter la fiche de contrôle (bulletin d’arrivage)' },
  { value: 'stock', label: 'Mettre à jour le stock dans le logiciel de gestion' },
];
const step = (n: number, answer: string, explain: string): Field => ({
  id: `e${n}`,
  label: `Étape ${n}`,
  kind: 'choice',
  select: true,
  options: STEP_OPTIONS,
  answer,
  explain,
});
const given = (n: number, value: string): Field => ({ id: `e${n}`, label: `Étape ${n}`, kind: 'given', value });

/* =========================== Mission 4 : produits à ranger =========================== */

const ZONES = [
  { value: 'A', label: 'Zone A — Liquides' },
  { value: 'B', label: 'Zone B — Traiteur' },
  { value: 'C', label: 'Zone C — Froid négatif' },
  { value: 'D', label: 'Zone D — Froid positif' },
  { value: 'E', label: 'Zone E — Boucherie, poissonnerie' },
  { value: 'F', label: 'Zone F — Fruits et légumes ambiants' },
  { value: 'G', label: 'Zone G — Épicerie et vrac' },
];
export const STOCK_ITEMS: Array<{ id: string; bon: number; name: string; zone: string; why: string }> = [
  { id: 'lait', bon: 1, name: 'Lait demi-écrémé 1 L bio', zone: 'A', why: 'Liquide stocké sur palette.' },
  { id: 'potatoes', bon: 1, name: 'Potatoes 1 kg — surgelées', zone: 'C', why: 'Produit surgelé : congélateur à −18 °C.' },
  { id: 'frites', bon: 1, name: 'Frites 2 kg — surgelées', zone: 'C', why: 'Produit surgelé : congélateur.' },
  { id: 'steak', bon: 1, name: 'Galettes végétales traiteur × 4', zone: 'B', why: 'Produit traiteur, rangé en FIFO.' },
  { id: 'the', bon: 1, name: 'Canettes de thé glacé × 6', zone: 'A', why: 'Boissons : zone des liquides.' },
  { id: 'huile', bon: 2, name: 'Huile d’olive vierge extra 75 cl', zone: 'A', why: 'Liquide, palette lourde : gerbeur.' },
  { id: 'olives', bon: 2, name: 'Olives vertes en bocal 250 g', zone: 'G', why: 'Épicerie : zone des autres produits.' },
  { id: 'miel', bon: 3, name: 'Miel de châtaignier 500 g', zone: 'G', why: 'Épicerie non réfrigérée.' },
  { id: 'tomates', bon: 3, name: 'Tomates en grappe 1 kg', zone: 'F', why: 'Les tomates se conservent à température ambiante.' },
  { id: 'salade', bon: 3, name: 'Salade batavia', zone: 'D', why: 'Les salades se gardent au frais, entre 4 et 5 °C.' },
  { id: 'myrtilles', bon: 3, name: 'Myrtilles — barquette 250 g', zone: 'D', why: 'Petits fruits rouges : froid positif.' },
];

/* =========================== Mission 6 : dates =========================== */

/** Contrôle du jeudi 8 octobre. Règles : document 3 (charte). */
export const DATES: Array<{ id: string; zone: string; name: string; qte: number; dlc?: string; ddm?: string; answer: string; why: string }> = [
  { id: 'p1', zone: 'B', name: 'Houmous nature 200 g', qte: 2, dlc: '13/10', answer: 'reduit', why: 'DLC dans 5 jours (≤ 6 jours) : mise en vente à prix réduit.' },
  { id: 'p2', zone: 'B', name: 'Taboulé frais 300 g', qte: 3, dlc: '12/10', answer: 'reduit', why: 'DLC dans 4 jours : prix réduit.' },
  { id: 'p3', zone: 'B', name: 'Tarte aux légumes', qte: 1, dlc: '11/10', answer: 'don', why: 'DLC dans 3 jours (≤ 3 jours) : don à l’association.' },
  { id: 'p4', zone: 'D', name: 'Myrtilles 250 g', qte: 6, dlc: '15/10', answer: 'garder', why: 'DLC dans 7 jours : aucune action, on laisse en rayon.' },
  { id: 'p5', zone: 'D', name: 'Yaourts nature × 4', qte: 10, dlc: '07/10', answer: 'retrait', why: 'DLC dépassée depuis hier : retrait immédiat de la vente, produit détruit.' },
  { id: 'p6', zone: 'E', name: 'Filets de truite', qte: 3, dlc: '13/10', answer: 'reduit', why: 'DLC dans 5 jours : prix réduit.' },
  { id: 'p7', zone: 'E', name: 'Pavés de saumon', qte: 15, dlc: '20/10', answer: 'garder', why: 'DLC dans 12 jours : aucune action.' },
  { id: 'p8', zone: 'G', name: 'Flocons d’avoine 750 g', qte: 8, ddm: '15/11', answer: 'reduit', why: 'DDM dans moins de 2 mois : déstockage à prix réduit.' },
  { id: 'p9', zone: 'G', name: 'Céréales aux noix 500 g', qte: 4, ddm: '20/10', answer: 'don', why: 'DDM dans 12 jours (≤ 3 semaines) : don à l’association.' },
  { id: 'p10', zone: 'G', name: 'Lentilles vertes 500 g', qte: 3, ddm: '20/12', answer: 'garder', why: 'DDM dans plus de 2 mois : aucune action.' },
];
const DECISIONS = [
  { value: 'garder', label: 'Aucune action' },
  { value: 'reduit', label: 'Vente à prix réduit' },
  { value: 'don', label: 'Don à l’association' },
  { value: 'retrait', label: 'Retrait et destruction' },
];

/** Relevés de température à la réception du 5 octobre. */
export const TEMPS: Array<{ id: string; cde: string; name: string; cat: string; t: string; ok: boolean; why: string }> = [
  { id: 't1', cde: '369', name: 'Potatoes surgelées', cat: 'Surgelé (−18 °C)', t: '−19,4 °C', ok: true, why: '−19,4 °C est plus froid que −18 °C : conforme.' },
  { id: 't2', cde: '369', name: 'Frites surgelées', cat: 'Surgelé (−18 °C)', t: '−20,7 °C', ok: true, why: 'Conforme.' },
  { id: 't3', cde: '369', name: 'Galettes végétales traiteur', cat: 'Traiteur (6 à 8 °C)', t: '12,5 °C', ok: false, why: '12,5 °C dépasse 8 °C : la chaîne du froid est rompue, le produit est refusé.' },
  { id: 't4', cde: '371', name: 'Galettes de céréales traiteur', cat: 'Traiteur (6 à 8 °C)', t: '6,1 °C', ok: true, why: 'Entre 6 et 8 °C : conforme.' },
  { id: 't5', cde: '371', name: 'Salade batavia', cat: 'Fruits et légumes frais (4 °C)', t: '3,8 °C', ok: true, why: 'Sous 4 °C : conforme.' },
  { id: 't6', cde: '371', name: 'Myrtilles', cat: 'Fruits et légumes frais (4 °C)', t: '5,6 °C', ok: false, why: '5,6 °C dépasse 4 °C : non conforme, produit refusé et signalé.' },
  { id: 't7', cde: '371', name: 'Yaourts nature', cat: 'Produits laitiers (6 à 8 °C)', t: '7,0 °C', ok: true, why: 'Entre 6 et 8 °C : conforme.' },
];

/* =========================== Mission 5 : matériels =========================== */

const MATERIELS = [
  { value: 'chariot', label: 'Chariot élévateur' },
  { value: 'diable', label: 'Diable' },
  { value: 'palette', label: 'Palette' },
  { value: 'rayonnage', label: 'Rayonnage / palettier' },
  { value: 'roll', label: 'Roll' },
  { value: 'gerbeur', label: 'Gerbeur' },
  { value: 'transpalette', label: 'Transpalette' },
];
const SIGN_OPTIONS = [
  { value: 'chaussures', label: 'Port obligatoire des chaussures de sécurité' },
  { value: 'telephone', label: 'Interdiction d’utiliser le téléphone' },
  { value: 'danger-chariots', label: 'Attention danger, circulation de chariots' },
  { value: 'stockage', label: 'Interdiction de stocker une charge à cet emplacement' },
  { value: 'chariots', label: 'Interdit aux chariots' },
  { value: 'gauche', label: 'Interdiction de tourner à gauche' },
  { value: 'monter', label: 'Interdiction de monter à plusieurs sur un chariot' },
  { value: 'sortie', label: 'Sortie de secours' },
];

/* ==================================== CHAPITRE ==================================== */

export const D02: Chapter = {
  unitId: 'd02',
  fictionNotice:
    'Le magasin Grain de Sel, ses fournisseurs, ses transporteurs, ses personnages, ainsi que l’hypermarché du Grand Vallon, sont fictifs. Documents et chiffres créés pour Rayon.',
  mission:
    "Chez Grain de Sel, l’équipe reçoit plusieurs fournisseurs le même matin. Elle doit libérer le quai sans précipiter les contrôles. Tu organises les arrivées, traites les écarts et indiques où placer les lots selon leur état, leur destination et leur date.",
  company: {
    name: 'Grain de Sel — Limoges',
    tagline: 'Magasin bio et local, 400 m²',
    facts: [
      ['Ton poste', 'Élève en PFMP, à la réception des marchandises'],
      ['Ta tutrice', 'Sophie Marchal, directrice du magasin'],
      ['Ton collègue', 'Hugo Lamy, réceptionnaire'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Réceptionner une livraison pendant une journée chargée",
      hero: { id: 'd02-hero', alt: 'Deux clients choisissent des bocaux et des légumes dans un magasin bio' },
      message: {
        from: 'Sophie Marchal',
        role: 'Directrice, Grain de Sel Limoges',
        text: [
          'Bienvenue chez Grain de Sel ! Ici, la qualité de nos produits frais, c’est notre réputation. Et tout commence à la réception des marchandises.',
          'Je souhaite te sensibiliser à ce poste stratégique. Tu vas aider Hugo, notre réceptionnaire, dans le suivi et le contrôle des commandes fournisseurs. Commence par découvrir l’enseigne.',
        ],
      },
      documents: [
        {
          id: "d02-revision-reperes",
          number: 3,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "Le bon de commande indique ce que le magasin a demandé. Le bon de livraison indique ce que le fournisseur annonce avoir livré.",
                "À la réception, compare les deux bons au comptage réel. Une réserve est une mention précise qui documente un écart.",
                "Un lot en attente de décision reste identifié et séparé du stock vendable."
              ]
            }
          ]
        },
        {
          id: 'd02-o-doc1',
          number: 1,
          title: 'Grain de Sel, le bio près de chez vous',
          look: 'article',
          blocks: [
            {
              type: 'p',
              text: 'Grain de Sel est un réseau de 85 magasins bio franchisés, créé en 2004 à Clermont-Ferrand. Chaque magasin est une entreprise indépendante — à Limoges, une SARL — qui exploite la marque et le concept de l’enseigne en échange d’une redevance. Le réseau fournit l’assortiment de base, une plateforme logistique régionale et la communication.',
            },
            {
              type: 'p',
              text: 'Le concept : un magasin chaleureux, des produits bio de qualité à des prix accessibles, et une rémunération juste pour les producteurs locaux. Le magasin de Limoges propose environ 4 500 références : fruits et légumes, produits frais (crèmerie, traiteur, boucherie-poissonnerie), épicerie, cosmétiques et produits d’entretien écologiques.',
            },
            {
              type: 'p',
              text: 'Un espace « Vrac » de 60 silos et distributeurs permet d’acheter la quantité voulue de céréales, légumes secs, fruits secs, café ou lessive, en venant avec ses propres contenants : moins d’emballages, moins de gaspillage, et un prix au kilo souvent plus bas.',
            },
            {
              type: 'facts',
              items: [
                ['Adresse', '14 avenue du Lac, 87000 Limoges'],
                ['Clientèle', 'Familles et jeunes actifs attentifs à leur alimentation, environ 650 passages par jour'],
                ['Concurrents', 'Deux magasins bio d’autres enseignes, rayons bio des supermarchés, marchés de producteurs'],
              ],
            },
          ],
        },
        {
          id: 'd02-o-doc2',
          number: 2,
          title: 'Ce que disent les clients',
          look: 'memo',
          source: 'Extraits de l’enquête de satisfaction du magasin (fictive)',
          blocks: [
            { type: 'quote', author: 'Camille, 34 ans', text: 'Les fruits et légumes sont toujours frais, et on sait d’où ils viennent : beaucoup sont produits dans la Haute-Vienne.' },
            { type: 'quote', author: 'Rachid, 52 ans', text: 'L’équipe connaît ses produits et prend le temps de conseiller. Et le vrac me fait faire des économies.' },
            { type: 'quote', author: 'Léonie, 27 ans', text: 'Le magasin est agréable et propre. Je n’ai jamais trouvé un produit périmé en rayon.' },
          ],
        },
      ],
      activities: [
        {
          id: 'd02-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: [
            'Toutes les réponses sont dans le document 1.',
            'Un magasin franchisé est indépendant mais exploite la marque d’un réseau : c’est une forme de commerce associé (la franchise).',
            'Raison sociale : Grain de Sel. Type de commerce : commerce associé, en franchise. Localisation : Limoges.',
          ],
          outcomeIds: R12,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['Grain de Sel', 'Grain de sel Limoges', 'Grain de Sel bio'], placeholder: 'Nom de l’enseigne', explain: 'L’enseigne s’appelle Grain de Sel.' },
            { id: 'activite', label: 'Activité', kind: 'given', value: 'Vente de produits alimentaires et non alimentaires bio' },
            {
              id: 'type',
              label: 'Type de commerce',
              kind: 'choice',
              options: [
                { value: 'franchise', label: 'Commerce associé — franchise' },
                { value: 'integre', label: 'Commerce intégré (succursale)' },
                { value: 'isole', label: 'Commerce indépendant isolé' },
              ],
              answer: 'franchise',
              explain: 'Le magasin est indépendant et exploite la marque du réseau contre une redevance : c’est une franchise.',
            },
            { id: 'statut', label: 'Statut juridique', kind: 'given', value: 'SARL (société à responsabilité limitée)' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Limoges', '14 avenue du Lac Limoges', 'Limoges Haute-Vienne'], placeholder: 'Ville', explain: 'Le magasin est situé 14 avenue du Lac, à Limoges.' },
            { id: 'conc', label: 'Concurrents', kind: 'given', value: 'Autres magasins bio, rayons bio des supermarchés, marchés de producteurs' },
            {
              id: 'cible',
              label: 'Clientèle cible',
              kind: 'choice',
              options: [
                { value: 'familles', label: 'Familles et jeunes actifs attentifs à leur alimentation' },
                { value: 'pros', label: 'Restaurateurs professionnels' },
                { value: 'touristes', label: 'Touristes de passage' },
              ],
              answer: 'familles',
              explain: 'Document 1, ligne « Clientèle ».',
            },
          ],
        },
        {
          id: 'd02-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Découvrir le magasin',
          instructions: 'Réponds à l’aide des documents 1 et 2.',
          helps: [
            'Le 2e paragraphe du document 1 liste les familles de produits ; le 3e explique le vrac.',
            'Les points forts cités par les clients concernent la fraîcheur, le conseil, les prix et la propreté.',
            'Le vrac : achat à la quantité, dans ses propres contenants, sans emballage jetable.',
          ],
          outcomeIds: R12,
          fields: [
            {
              id: 'produits',
              label: '1. Quels produits l’enseigne vend-elle ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'fl', label: 'Fruits et légumes' },
                { value: 'frais', label: 'Produits frais' },
                { value: 'epicerie', label: 'Épicerie' },
                { value: 'cosmetiques', label: 'Cosmétiques et entretien écologiques' },
                { value: 'electro', label: 'Électroménager' },
              ],
              answers: ['fl', 'frais', 'epicerie', 'cosmetiques'],
              explain: 'Le magasin ne vend pas d’électroménager.',
            },
            {
              id: 'vrac',
              label: '2. Qu’est-ce que l’espace « Vrac » ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Un espace où le client se sert la quantité voulue, dans ses propres contenants, sans emballage jetable.' },
                { value: 'b', label: 'Un espace de produits en promotion vendus par lots.' },
                { value: 'c', label: 'La réserve du magasin.' },
              ],
              answer: 'a',
              explain: 'Le vrac réduit les emballages et le gaspillage.',
            },
            {
              id: 'forts',
              label: '3. Quels sont les points forts du magasin selon les clients ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'fraicheur', label: 'La fraîcheur et l’origine locale des produits' },
                { value: 'conseil', label: 'Le conseil de l’équipe' },
                { value: 'proprete', label: 'Un magasin propre, sans produit périmé' },
                { value: 'parking', label: 'Un grand parking' },
              ],
              answers: ['fraicheur', 'conseil', 'proprete'],
              explain: 'Les clients ne parlent pas de parking. La fraîcheur et l’absence de produits périmés dépendent directement de la réception et du contrôle des dates.',
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
      title: 'Mettre à jour le planning des réceptions',
      guidance: 'guidé',
      message: {
        from: 'Sophie Marchal',
        role: 'Directrice',
        text: [
          'Les contrôles liés à la réception commencent dès la mise à jour du planning des livraisons. Nous recevons des livraisons chaque jour, soit de la plateforme régionale du réseau, soit directement de nos fournisseurs : il faut suivre précisément les arrivées.',
          'Mets à jour le planning (annexe) à l’aide des documents 1 à 4. Nous sommes le mercredi 30 septembre.',
        ],
      },
      documents: [
        {
          id: 'd02-m1-doc1',
          number: 1,
          title: 'Bons de commande passés',
          look: 'facture',
          blocks: [
            { type: 'p', text: 'Bon de commande n° 0372 — Coopérative Légumes du Limousin, 87410 Le Palais-sur-Vienne. Commande du 28/09, livraison demandée le 29/09. Tampon : « LIVRÉ LE 29/09 — document validé ».' },
            {
              type: 'table',
              head: ['Désignation', 'Quantité', 'Prix unitaire HT'],
              align: ['left', 'right', 'right'],
              rows: [
                ['Tomates en grappe 1 kg', '40', '1,05 €'],
                ['Poireaux botte 2 kg', '30', '2,40 €'],
                ['Pommes de terre 1 kg', '100', '0,65 €'],
                ['Noix fraîches, filet 750 g', '25', '4,60 €'],
              ],
            },
            { type: 'p', text: 'Bon de commande n° 0374 — Moulin de Solignac (huiles et olives), daté du 30/09. Livraison demandée le 6 octobre.' },
            { type: 'p', text: 'Bon de commande n° 0375 — Fromagerie des Monts, 87120 Eymoutiers, daté du 30/09. Livraison demandée le 2 octobre.' },
            { type: 'note', text: 'Rappel imprimé sur les bons : les produits reçus endommagés ou ne respectant pas la chaîne du froid seront refusés, comme les références en surplus et les produits ne respectant pas les dates minimales demandées.' },
          ],
        },
        {
          id: 'd02-m1-doc2',
          number: 2,
          title: 'Information pour les relances fournisseurs',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Comme convenu avec nos fournisseurs : en cas de commande prévue mais non livrée, nous relançons le fournisseur dès le lendemain par courriel.' }],
        },
        {
          id: 'd02-m1-doc3',
          number: 3,
          title: 'Courriel du fournisseur Les Vergers d’Aixe',
          look: 'courriel',
          blocks: [
            { type: 'facts', items: [['De', 'expedition@vergers-aixe.fr'], ['À', 'reception@graindesel-limoges.fr'], ['Objet', 'Livraison commande n° 370'], ['Date', 'lundi 28/09, 7 h 52']] },
            { type: 'p', text: 'Bonjour, un orage de grêle a abîmé une partie des pommes que nous devions vous livrer ce matin. Nous trions la récolte et vous livrerons jeudi 1er octobre. Veuillez nous excuser pour ce retard. Cordialement, Mme Ferrand, responsable des expéditions.' },
          ],
        },
        {
          id: 'd02-m1-doc4',
          number: 4,
          title: 'Courriel d’un transporteur',
          look: 'courriel',
          blocks: [
            { type: 'facts', items: [['De', 'exploitation@transports-delmas.fr'], ['À', 'reception@graindesel-limoges.fr'], ['Objet', 'Livraison commande n° 371'], ['Date', 'mardi 29/09, 6 h 15']] },
            { type: 'p', text: 'Bonjour, en raison d’un mouvement de grève de nos chauffeurs, nous ne pourrons pas assurer votre livraison cette semaine. Elle aura lieu lundi 5 octobre. Cordialement, M. Delmas, responsable d’exploitation.' },
          ],
        },
        {
          id: "d02-revision-1-doc",
          number: 5,
          title: "Reprogrammer un créneau après une panne de quai",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le quai est fermé de 9 h à 9 h 45. Il accueille un seul véhicule à la fois. Les produits frais doivent passer avant 10 h 30. L’équipe fait une pause à 11 h."
            },
            {
              type: "table",
              head: [
                "Fournisseur",
                "Arrivée initiale",
                "Durée",
                "Flexibilité annoncée"
              ],
              rows: [
                [
                  "Verger du Lac",
                  "9 h",
                  "20 min",
                  "Après 10 h 15"
                ],
                [
                  "Frais du Val",
                  "9 h 25",
                  "30 min",
                  "De 9 h 45 à 10 h"
                ],
                [
                  "Épices du Sud",
                  "10 h",
                  "20 min",
                  "De 10 h à 10 h 30"
                ]
              ]
            }
          ]
        },
      ],
      activities: [
        PLANNING,
        {
          id: 'd02-m1-a2',
          kind: 'fields',
          label: 'Question',
          title: 'Y a-t-il des relances à effectuer ?',
          instructions: 'Justifie tes choix à partir du planning et des documents.',
          helps: ['Une relance concerne une livraison prévue, passée, non reçue.', 'Si le fournisseur ou le transporteur a prévenu, on ne relance pas : on note la nouvelle date.', 'Seule la 373 est en retard sans explication.'],
          outcomeIds: R1,
          fields: [
            {
              id: 'relances',
              label: 'Quelle(s) commande(s) faut-il relancer aujourd’hui ?',
              kind: 'multi',
              options: ['369', '370', '371', '372', '373', '374', '375'].map((v) => ({ value: v, label: v })),
              answers: ['373'],
              explain: 'La 373 devait arriver le 29 : aucune livraison, aucune nouvelle. Relance par courriel aujourd’hui.',
            },
            {
              id: 'pourquoi',
              label: 'Pourquoi ne relance-t-on pas la commande 371 ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Le transporteur a prévenu et donné une nouvelle date de livraison.' },
                { value: 'b', label: 'Elle a déjà été livrée.' },
                { value: 'c', label: 'On ne relance jamais un transporteur.' },
              ],
              answer: 'a',
              explain: 'Le magasin est informé : il suffit de mettre le planning à jour (livraison prévue le 5).',
            },
          ],
        },
        {
          id: "d02-revision-1",
          label: "Annexe complémentaire",
          title: "Reprogrammer un créneau après une panne de quai",
          instructions: "Lis le document 5. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Propose d’abord un créneau pour la livraison soumise à l’échéance la plus stricte.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "La livraison se termine à 10 h 15, après 30 minutes au quai."
          ],
          outcomeIds: [
            "d02-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle heure de fin obtient-on si Frais du Val commence à 9 h 45 ?",
              kind: "written",
              lines: 3,
              model: "La livraison se termine à 10 h 15, après 30 minutes au quai."
            },
            {
              id: "q2",
              label: "Remets au responsable un planning sans chevauchement et indique qui prévenir.",
              kind: "written",
              lines: 3,
              model: "Frais du Val 9 h 45–10 h 15, Épices du Sud 10 h 15–10 h 35, Verger du Lac 10 h 35–10 h 55. Je demande confirmation des nouvelles heures aux trois chauffeurs et informe le quai et l’équipe froid."
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
      title: 'Améliorer la procédure de réception des produits',
      guidance: 'guidé',
      hero: { id: 'd02-quai', alt: 'Réceptionnaire contrôlant une palette filmée avec un bloc-notes sur un quai de livraison' },
      message: {
        from: 'Sophie Marchal',
        role: 'Directrice',
        text: [
          'Pour renforcer notre qualité de service, je veux revoir la procédure de réception, la formaliser par écrit et l’afficher, pour qu’elle soit appliquée par tous.',
          'Complète la procédure (annexe 1) avec les documents 1 et 2. Ensuite, repère sur le document de transport (annexe 2) le transporteur, le fournisseur et le client.',
        ],
      },
      documents: [
        {
          id: 'd02-m2-doc1',
          number: 1,
          title: 'Étapes à intégrer à la procédure',
          look: 'memo',
          blocks: [
            {
              type: 'list',
              items: [
                'Vérifier le bordereau de livraison et les étiquettes de colisage.',
                'Compléter le document de transport et le remettre au chauffeur.',
                'Déballer les produits par référence.',
                'Compléter la fiche de contrôle (bulletin d’arrivage).',
                'Mettre à jour le stock dans le logiciel de gestion.',
              ],
            },
          ],
        },
        {
          id: 'd02-m2-doc2',
          number: 2,
          title: 'La réception des marchandises chez Grain de Sel',
          look: 'texte',
          blocks: [
            { type: 'list', items: ['Les marchandises sont reçues de 7 h à 11 h 30.'] },
            { type: 'p', text: 'Le réceptionnaire vérifie d’abord que la marchandise est bien destinée au magasin, grâce au bordereau de livraison et aux étiquettes de colisage. Il décharge ensuite avec un transpalette manuel ou un gerbeur, en respectant les règles de sécurité.' },
            { type: 'p', text: 'Il contrôle l’état apparent des palettes et récupère les documents : le bordereau (ou bon) de livraison, qui liste les produits expédiés par le fournisseur et constitue le contrat de vente ; le document de transport, présent quand un transporteur livre pour le compte du fournisseur, qui matérialise le contrat de transport.' },
            { type: 'p', text: 'Après le contrôle de l’état apparent, il complète le bordereau de livraison ou le document de transport et en remet un exemplaire au transporteur, qui peut repartir.' },
            {
              type: 'list',
              title: 'Deux types de litiges',
              items: [
                'La réserve concerne le transporteur : colis manquant, colis endommagé, température non respectée pendant le transport.',
                'L’anomalie concerne le fournisseur : produit manquant, produit en surplus, erreur de référence, date non conforme.',
              ],
            },
            { type: 'p', text: 'Pour terminer, le réceptionnaire range la zone de réception afin d’être prêt pour la livraison suivante.' },
          ],
        },
        {
          id: 'd02-m2-doc3',
          number: 3,
          title: 'Récépissé d’expédition n° 368',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Case 1', 'Case 2', 'Case 3'],
              rows: [['Ferme du Mas Blanc — 23400 Bourganeuf', 'Grain de Sel — 14 av. du Lac, 87000 Limoges', 'Transports Delmas — 87220 Feytiat']],
            },
            { type: 'facts', items: [['Date', '2 octobre'], ['Nombre de colis', '6 cartons'], ['Poids', '90 kg'], ['Nature', 'Produits alimentaires'], ['Instructions de l’expéditeur', 'Respecter la chaîne du froid : transport à température dirigée entre 4 °C et 7 °C'], ['Matières dangereuses', 'Non']] },
          ],
        },
        {
          id: "d02-revision-2-doc",
          number: 4,
          title: "Réparer une procédure qui laisse passer les erreurs",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Un audit relève 12 arrivages. Trois bons ont été signés avant le comptage, deux palettes ont été rangées sans vérification du lot et une anomalie de conditionnement a été signalée seulement à l’oral. La consigne interne demande un relevé signé conservé pour chaque réception."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd02-m2-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Procédure de réception d’une marchandise',
          instructions: 'Place les cinq étapes du document 1 au bon endroit de la procédure (matériel : table roulante, documents, fournitures, transpalette).',
          helps: [
            'Avant de décharger, on vérifie que la livraison est pour nous. Le chauffeur ne repart qu’après avoir reçu son document.',
            'Une fois le chauffeur parti, on déballe, on contrôle les références, puis on remplit la fiche de contrôle avant de ranger et de mettre à jour le stock.',
            'Ordre : 2 = bordereau ; 7 = document de transport ; 8 = déballer ; 10 = fiche de contrôle ; 12 = stock.',
          ],
          outcomeIds: R12,
          fields: [
            given(1, 'Accueillir le livreur.'),
            step(2, 'bl', 'On vérifie que la marchandise est destinée au magasin avant de décharger.'),
            given(3, 'Récupérer les documents : bordereau de livraison, document de transport.'),
            given(4, 'Décharger la marchandise et consulter le planning des commandes.'),
            given(5, 'Contrôler l’état apparent des colis et la température du chargement si nécessaire.'),
            given(6, 'Accepter ou refuser les colis.'),
            step(7, 'transport', 'Le chauffeur repart avec son exemplaire complété (et les éventuelles réserves).'),
            given(8.5 as number, 'Le chauffeur repart.'),
            step(8, 'deballer', 'Après le départ du chauffeur, on déballe produit par produit.'),
            given(9, 'Contrôler les références en rapprochant le bon de commande, le bon de livraison et les produits reçus.'),
            step(10, 'fiche', 'Le contrôle est consigné sur la fiche (bulletin d’arrivage).'),
            given(11, 'Ranger les produits en réserve ou en bout de rayon.'),
            step(12, 'stock', 'Le stock informatique est mis à jour pour correspondre au stock physique.'),
            given(13, 'Informer le transporteur des réserves (LRAR sous 3 jours) et le fournisseur des anomalies (courriel).'),
            given(14, 'Ranger les documents et le poste de travail.'),
            given(15, 'Rendre compte au responsable.'),
          ].map((f) => (f.id === 'e8.5' ? { ...f, id: 'chauffeur', label: 'Puis' } : f)),
        },
        {
          id: 'd02-m2-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Document de transport',
          instructions: 'Sur le récépissé d’expédition (document 3), identifie chaque case.',
          helps: ['L’expéditeur est celui qui envoie la marchandise.', 'Le destinataire la reçoit ; le transporteur l’achemine.', 'Ferme du Mas Blanc = fournisseur ; Grain de Sel = client ; Transports Delmas = transporteur.'],
          outcomeIds: R1,
          fields: [
            ...[
              ['c1', 'Case 1 — Ferme du Mas Blanc', 'fournisseur'],
              ['c2', 'Case 2 — Grain de Sel', 'client'],
              ['c3', 'Case 3 — Transports Delmas', 'transporteur'],
            ].map(([id, label, answer]) => ({
              id,
              label,
              kind: 'choice' as const,
              options: [
                { value: 'fournisseur', label: 'Fournisseur (expéditeur)' },
                { value: 'client', label: 'Client (destinataire)' },
                { value: 'transporteur', label: 'Transporteur' },
              ],
              answer,
              explain: `${label.split(' — ')[1]} : ${answer}.`,
            })),
            {
              id: 'temp',
              label: 'Quelle température faut-il vérifier à l’arrivée de ce chargement ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Entre 4 °C et 7 °C' },
                { value: 'b', label: '−18 °C ou moins' },
                { value: 'c', label: 'Aucune' },
              ],
              answer: 'a',
              explain: 'Instructions de l’expéditeur : température dirigée entre 4 °C et 7 °C.',
            },
          ],
        },
        {
          id: 'd02-m2-a3',
          kind: 'fields',
          label: 'À toi de jouer',
          title: 'Le métier de réceptionnaire',
          instructions: 'Vérifie que tu connais les bases du métier.',
          helps: ['Relis le document 2.', 'Pense aux litiges : qui est responsable de quoi ?', 'Le transporteur répond de l’état des colis, le fournisseur de leur contenu.'],
          outcomeIds: R1,
          fields: [
            { id: 'q1', label: 'Un carton arrive écrasé. C’est une…', kind: 'choice', options: [{ value: 'reserve', label: 'Réserve (transporteur)' }, { value: 'anomalie', label: 'Anomalie (fournisseur)' }], answer: 'reserve', explain: 'L’état du colis relève du transport.' },
            { id: 'q2', label: 'Il manque 5 fromages dans un carton intact. C’est une…', kind: 'choice', options: [{ value: 'reserve', label: 'Réserve (transporteur)' }, { value: 'anomalie', label: 'Anomalie (fournisseur)' }], answer: 'anomalie', explain: 'Le carton est intact : l’erreur vient de la préparation du fournisseur.' },
            { id: 'q3', label: 'Le chauffeur peut repartir avant que tu aies contrôlé l’état apparent des colis.', kind: 'choice', options: VF, answer: 'faux', explain: 'Les réserves doivent être notées sur le document du transporteur avant son départ.' },
          ],
        },
        {
          id: "d02-revision-2",
          label: "Annexe complémentaire",
          title: "Réparer une procédure qui laisse passer les erreurs",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Distingue les contrôles avant signature et les traces à conserver après.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Identifier le fournisseur et retrouver le bon de commande. Compter et vérifier références, lots et état. Reporter précisément les anomalies sur les documents et isoler les produits concernés. Faire valider la décision et signer. Enregistrer l’entrée acceptée et classer les justificatifs."
          ],
          outcomeIds: [
            "d02-r1",
            "d02-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Réécris en cinq actions la procédure utilisable au quai.",
              kind: "written",
              lines: 3,
              model: "Identifier le fournisseur et retrouver le bon de commande. Compter et vérifier références, lots et état. Reporter précisément les anomalies sur les documents et isoler les produits concernés. Faire valider la décision et signer. Enregistrer l’entrée acceptée et classer les justificatifs."
            },
            {
              id: "q2",
              label: "Quel contrôle rapide le responsable peut-il faire la semaine suivante ?",
              kind: "written",
              lines: 3,
              model: "Comparer un échantillon de bons signés aux relevés datés, puis compter les réceptions dont la fiche comporte quantités, lots et décision. Revoir avec l’équipe les dossiers incomplets."
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
      title: 'Assurer la réception d’un produit et traiter les litiges',
      guidance: 'accompagné',
      message: {
        from: 'Hugo Lamy',
        role: 'Réceptionnaire, Grain de Sel',
        text: [
          'Salut, moi c’est Hugo, je m’occupe des réceptions. Tu m’aides aujourd’hui, vendredi 2 octobre ?',
          'Contrôle la livraison de la commande n° 375 (documents 1, 2 et 3) en appliquant la nouvelle procédure. Complète la fiche de contrôle (annexe 1) et l’analyse (annexe 2), puis rédige le courriel de litige.',
        ],
      },
      documents: [
        {
          id: 'd02-m3-doc1',
          number: 1,
          title: 'Bordereau de livraison n° 62149',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Fournisseur', 'Fromagerie des Monts — 87120 Eymoutiers'], ['Client', 'Grain de Sel, 14 av. du Lac, 87000 Limoges'], ['Livraison', 'le 2 octobre'], ['Vos références', 'commande n° 0375 du 30 septembre'], ['Transport', 'franco de port, à température dirigée entre 4 °C et 7 °C'], ['Emballage', 'cartons sur palette']] },
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Unité', 'Qté commandée', 'Qté livrée'],
              align: ['left', 'left', 'left', 'right', 'right'],
              rows: [
                ['3 145 697 005 637', 'Tomme de montagne', 'Pièce', '10', '10'],
                ['3 145 697 035 697', 'Comté doux 12 mois', 'Pièce', '50', '50'],
                ['3 145 697 004 008', 'Morbier', 'Pièce', '30', '30'],
                ['3 145 697 314 731', 'Fromage frais aux herbes 280 g', 'Pièce', '20', '20'],
                ['3 145 697 504 367', 'Vacherin 600 g', 'Pièce', '25', '20'],
              ],
            },
            { type: 'facts', items: [['Nombre de colis', '7'], ['Poids total', '120 kg']] },
          ],
        },
        {
          id: 'd02-m3-doc2',
          number: 2,
          title: 'Colis reçus et contrôles effectués',
          look: 'memo',
          blocks: [
            { type: 'image', image: { id: 'd02-palette-thermo-cut', alt: 'Palette filmée et thermomètre infrarouge affichant 5 °C' }, float: true },
            {
              type: 'table',
              head: ['Référence lue sur le colis', 'Quantité reçue'],
              align: ['left', 'right'],
              rows: [
                ['3 145 697 005 637', '10'],
                ['3 145 697 035 697', '50'],
                ['3 145 697 004 008', '30'],
                ['3 145 697 314 730', '20'],
                ['3 145 697 504 367', '20'],
              ],
            },
            { type: 'list', items: ['Température relevée à l’ouverture du camion : 5 °C.', 'État apparent des 7 colis : bon.', 'Dates limites de consommation : toutes supérieures à 3 mois.'] },
          ],
        },
        {
          id: 'd02-m3-doc3',
          number: 3,
          title: 'Récépissé d’expédition n° 25/687',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Expéditeur', 'Fromagerie des Monts'], ['Destinataire', 'Grain de Sel, Limoges'], ['Transporteur', 'TLC Express, 87170 Isle'], ['Date', '2 octobre'], ['Nombre de colis', '7 — 1 palette Europe'], ['Poids', '120 kg'], ['Instructions', 'Respecter la chaîne du froid (4 °C à 7 °C)']] },
          ],
        },
        {
          id: 'd02-m3-doc4',
          number: 4,
          title: 'Le visa',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Le visa comporte ton nom, la date et ta signature. Les observations recensent tous les litiges.' }],
        },
        {
          id: "d02-revision-3-doc",
          number: 5,
          title: "Documenter un écart sans bloquer toute la livraison",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Article",
                "Commandé",
                "Annoncé sur le bon",
                "Constaté"
              ],
              rows: [
                [
                  "Confiture 220 g",
                  "48",
                  "48",
                  "46 intactes et 2 cassées"
                ],
                [
                  "Miel 250 g",
                  "36",
                  "36",
                  "34 intacts"
                ]
              ]
            },
            {
              type: "p",
              text: "Le chauffeur peut reprendre immédiatement les produits cassés. Le responsable autorise l’entrée des unités conformes et demande une trace des manquants et de la reprise."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd02-m3-a1',
          kind: 'fields',
          layout: 'extranet',
          windowTitle: 'Bulletin d’arrivage — contrôle réception marchandise',
          label: 'Annexe 1',
          title: 'Fiche de contrôle de la réception',
          instructions: 'Compare le bordereau (document 1) et les colis reçus (document 2), puis complète le bulletin d’arrivage.',
          helps: [
            'Rapproche les lignes une par une : référence, puis quantité.',
            'Une ligne a une quantité différente ; une autre a une référence qui ne correspond pas d’un chiffre. La température est-elle dans la plage 4–7 °C ?',
            'Vacherin : 25 attendus, 20 reçus. Fromage frais : 314 731 attendu, 314 730 reçu. 5 °C : conforme.',
          ],
          outcomeIds: R12,
          fields: [
            { id: 'date', label: 'Bulletin d’arrivage du', kind: 'given', value: '02/10' },
            { id: 'fourn', label: 'Fournisseur', kind: 'text', accept: ['Fromagerie des Monts', 'La Fromagerie des Monts'], placeholder: 'Nom', explain: 'Fournisseur : Fromagerie des Monts.' },
            { id: 'transp', label: 'Transporteur', kind: 'text', accept: ['TLC Express', 'TLC'], placeholder: 'Nom', explain: 'Transporteur : TLC Express (document 3).' },
            { id: 'cde', label: 'N° de commande', kind: 'number', answer: 375, explain: 'Commande n° 0375.' },
            { id: 'livr', label: 'N° de livraison', kind: 'number', answer: 62149, explain: 'Bordereau n° 62149.' },
            { id: 'conf', label: 'Arrivage', kind: 'choice', options: [{ value: 'conforme', label: 'Conforme' }, { value: 'non', label: 'Non conforme' }], answer: 'non', explain: 'Deux anomalies : l’arrivage n’est pas conforme.' },
            {
              id: 'litiges',
              label: 'Litige(s) constaté(s)',
              kind: 'multi',
              options: [
                { value: 'colis-manquant', label: 'Colis manquant' },
                { value: 'colis-defectueux', label: 'Colis défectueux' },
                { value: 'temperature', label: 'Température non conforme' },
                { value: 'produit-manquant', label: 'Produit manquant' },
                { value: 'erreur-ref', label: 'Erreur de référence' },
                { value: 'date', label: 'Date non conforme' },
              ],
              answers: ['produit-manquant', 'erreur-ref'],
              explain: 'Les 7 colis sont là, en bon état, à 5 °C, avec des dates correctes. Mais il manque 5 vacherins et une référence est erronée.',
            },
            {
              id: 'ref-manq',
              label: 'Produit manquant — désignation',
              kind: 'choice',
              select: true,
              options: [
                { value: 'tomme', label: 'Tomme de montagne' },
                { value: 'comte', label: 'Comté doux 12 mois' },
                { value: 'morbier', label: 'Morbier' },
                { value: 'frais', label: 'Fromage frais aux herbes' },
                { value: 'vacherin', label: 'Vacherin 600 g' },
              ],
              answer: 'vacherin',
              explain: 'Vacherin : commandé 25, livré 20.',
            },
            { id: 'att', label: 'Quantité attendue', kind: 'number', answer: 25, explain: '25 commandés.' },
            { id: 'recu', label: 'Quantité reçue', kind: 'number', answer: 20, explain: '20 reçus : il en manque 5.' },
            {
              id: 'ref-err',
              label: 'Erreur de référence — désignation',
              kind: 'choice',
              select: true,
              options: [
                { value: 'tomme', label: 'Tomme de montagne' },
                { value: 'comte', label: 'Comté doux 12 mois' },
                { value: 'morbier', label: 'Morbier' },
                { value: 'frais', label: 'Fromage frais aux herbes' },
                { value: 'vacherin', label: 'Vacherin 600 g' },
              ],
              answer: 'frais',
              explain: 'Fromage frais : référence 314 731 commandée, 314 730 reçue.',
            },
            {
              id: 'action',
              label: 'Action engagée',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Noter les anomalies sur le bordereau et informer le fournisseur par courriel' },
                { value: 'b', label: 'Envoyer une LRAR au transporteur sous 3 jours' },
                { value: 'c', label: 'Refuser toute la livraison' },
              ],
              answer: 'a',
              explain: 'Ce sont des anomalies (fournisseur) : on les note sur le bordereau et on prévient le fournisseur par courriel.',
            },
          ],
        },
        {
          id: 'd02-m3-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Analyse du litige',
          instructions: 'Identifie le responsable des litiges de la livraison n° 62149.',
          helps: ['Réserve = transporteur ; anomalie = fournisseur.', 'Les colis sont arrivés en bon état et à bonne température.', 'Les deux litiges viennent de la préparation de commande.'],
          outcomeIds: R1,
          fields: [
            { id: 'resp', label: 'Qui est responsable des litiges ?', kind: 'choice', options: [{ value: 'fournisseur', label: 'Le fournisseur' }, { value: 'transporteur', label: 'Le transporteur' }], answer: 'fournisseur', explain: 'Produit manquant et erreur de référence : responsabilité du fournisseur.' },
            { id: 'res', label: 'Faut-il émettre des réserves sur le récépissé du transporteur ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Colis complets, intacts et à 5 °C : rien à reprocher au transporteur.' },
          ],
        },
        {
          id: 'd02-m3-a3',
          kind: 'open',
          label: 'Courriel',
          title: 'Rédiger le courriel de litige',
          instructions: 'Rédige le courriel au fournisseur (adresse : commandes@fromageriedesmonts.fr).',
          helps: [
            'L’objet rappelle le numéro de livraison. Commence par un titre de civilité.',
            'Rappelle la livraison (n°, date), décris précisément chaque anomalie avec les quantités et les références, puis indique ce que tu attends.',
            'Exemple d’attente : livraison des 5 vacherins manquants et remplacement des 20 fromages frais par la bonne référence, ou avoir.',
          ],
          outcomeIds: R1,
          prompts: [
            { id: 'objet', label: 'Objet', lines: 1 },
            { id: 'corps', label: 'Message', lines: 10 },
          ],
          selfCheck: [
            'L’objet contient le n° de livraison.',
            'J’ai salué avec un titre de civilité.',
            'L’introduction rappelle le n° et la date de livraison.',
            'Le développement indique les deux litiges, chiffrés.',
            'J’ai conclu avec une demande précise et une formule de politesse.',
            'J’ai signé avec mon nom et ma fonction.',
          ],
        },
        {
          id: "d02-revision-3",
          label: "Annexe complémentaire",
          title: "Documenter un écart sans bloquer toute la livraison",
          instructions: "Lis le document 5. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Les unités physiquement présentes et les unités effectivement acceptées peuvent être différentes.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "46 confitures + 34 miels = 80 unités acceptées."
          ],
          outcomeIds: [
            "d02-r1",
            "d02-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien d’unités acceptées faut-il enregistrer ?",
              kind: "number",
              answer: 80,
              explain: "46 confitures + 34 miels = 80 unités acceptées."
            },
            {
              id: "q2",
              label: "Rédige une réserve exploitable avec les deux anomalies et la suite.",
              kind: "written",
              lines: 3,
              model: "Confiture 220 g, 48 présentées dont 2 pots cassés repris par le chauffeur, 46 acceptées. Miel 250 g, 34 reçus sur 36 annoncés, 2 manquants. Confirmer les réserves sur le bon et joindre le relevé au dossier fournisseur."
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
      title: 'Réaliser une mise en stock',
      guidance: 'accompagné',
      message: {
        from: 'Sophie Marchal',
        role: 'Directrice',
        text: [
          'Ce matin, 5 octobre, nous avons réceptionné trois livraisons (document 2). Avec le plan de la réserve et la procédure de rangement (document 1), indique où ranger chaque produit et complète les bons d’entrée en stock : un bon par réception.',
        ],
      },
      documents: [
        {
          id: 'd02-m4-doc1',
          number: 1,
          title: 'Plan de la réserve et procédure de rangement',
          look: 'procedure',
          blocks: [
            {
              type: 'zones',
              title: 'Plan de la réserve',
              zones: [
                { id: 'rec', label: 'Zone de réception', sub: 'Tri des déchets', tone: 'gris' },
                { id: 'B', label: 'Zone B', sub: 'Traiteur', tone: 'orange' },
                { id: 'E', label: 'Zone E', sub: 'Boucherie, poissonnerie', tone: 'vert', wide: true },
                { id: 'A', label: 'Zone A', sub: 'Liquides', tone: 'rose' },
                { id: 'C', label: 'Zone C', sub: 'Chambre froide négative', tone: 'bleu' },
                { id: 'D', label: 'Zone D', sub: 'Chambre froide positive', tone: 'violet' },
                { id: 'F', label: 'Zone F', sub: 'Fruits et légumes ambiants', tone: 'jaune' },
                { id: 'G', label: 'Zone G', sub: 'Épicerie et vrac', tone: 'bleu' },
              ],
            },
            { type: 'note', text: 'La réserve doit être correctement rangée et propre. La vigilance de chacun est exigée.' },
            {
              type: 'list',
              items: [
                'Zone A : liquides (boissons, lait, huiles), stockés sur palettes aux niveaux 0, 1 et 2. Utiliser le gerbeur : les palettes sont lourdes.',
                'Zones B et E : produits traiteur, boucherie et poissonnerie, rangés selon la méthode FIFO*. Utiliser les chariots à roulettes.',
                'Zone C : produits surgelés, en congélateurs (−18 °C).',
                'Zone D : produits frais en meubles réfrigérés (4 °C à 8 °C), dont les fruits et légumes à garder au frais : salades, fraises, cerises, framboises, myrtilles.',
                'Zone F : fruits et légumes conservés à température ambiante : tomates, pommes, poires, agrumes, bananes, kiwis.',
                'Zone G : tous les autres produits (épicerie, vrac, miel, conserves). Utiliser le gerbeur.',
                'Dans tous les cas, trier les déchets dans les bacs identifiés.',
              ],
            },
            { type: 'p', text: '* FIFO (First In, First Out, « premier entré, premier sorti ») : les produits dont la date est la plus proche sont placés devant, ceux dont la date est la plus éloignée derrière.' },
          ],
        },
        {
          id: 'd02-m4-doc2',
          number: 2,
          title: 'Documents des livraisons du 5 octobre',
          look: 'facture',
          blocks: [
            { type: 'p', text: '① Bon de livraison n° 203698 — Plateforme Bio Centre (réseau Grain de Sel), commande n° 369. Vérifié, conforme.' },
            { type: 'table', head: ['Désignation', 'Qté livrée'], align: ['left', 'right'], rows: STOCK_ITEMS.filter((x) => x.bon === 1).map((x) => [x.name, ['150', '50', '30', '40', '30'][STOCK_ITEMS.filter((y) => y.bon === 1).indexOf(x)]]) },
            { type: 'p', text: '② Bulletin d’arrivage — Moulin de Solignac, commande n° 374, livraison n° 203024. Arrivage conforme.' },
            { type: 'table', head: ['Désignation', 'Qté livrée'], align: ['left', 'right'], rows: [['Huile d’olive vierge extra 75 cl', '25'], ['Olives vertes en bocal 250 g', '100']] },
            { type: 'p', text: '③ Bon de livraison n° 20-36-674 — Coopérative Légumes du Limousin, commande n° 371. Livraison conforme.' },
            { type: 'table', head: ['Désignation', 'Qté livrée'], align: ['left', 'right'], rows: [['Miel de châtaignier 500 g', '40'], ['Tomates en grappe 1 kg', '30'], ['Salade batavia', '40'], ['Myrtilles — barquette 250 g', '20']] },
          ],
        },
        {
          id: 'd02-m4-doc3',
          number: 3,
          title: 'Numérotation',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Le dernier numéro de bon d’entrée en stock est le 0259.' }],
        },
        {
          id: "d02-revision-4-doc",
          number: 4,
          title: "Choisir l’ordre et l’emplacement des lots",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Lot",
                "État",
                "Date limite interne de mise en rayon",
                "Destination"
              ],
              rows: [
                [
                  "L21",
                  "Conforme",
                  "12 octobre",
                  "Réserve sèche B"
                ],
                [
                  "L27",
                  "Conforme",
                  "18 octobre",
                  "Réserve sèche B"
                ],
                [
                  "L29",
                  "Étiquette lot illisible",
                  "Inconnue",
                  "En attente de décision"
                ]
              ]
            },
            {
              type: "p",
              text: "Le rayon demande 10 unités. L21 en contient 16 et L27 en contient 24. La réserve utilise la date la plus proche en premier."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd02-m4-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Où ranger chaque produit ?',
          instructions: 'Pour chaque produit reçu, choisis sa zone de stockage dans la réserve.',
          helps: [
            'Commence par la température : surgelé, frais, ou ambiant ?',
            'Les liquides vont en A, le traiteur en B, l’épicerie en G. Attention : tous les fruits et légumes ne vont pas au même endroit.',
            'Tomates : ambiant (F). Salade et myrtilles : froid positif (D).',
          ],
          outcomeIds: R12,
          fields: STOCK_ITEMS.map((x) => ({ id: x.id, label: x.name, kind: 'choice' as const, select: true, options: ZONES, answer: x.zone, explain: `${x.name} : zone ${x.zone}. ${x.why}` })),
        },
        {
          id: 'd02-m4-a2',
          kind: 'fields',
          layout: 'extranet',
          windowTitle: 'Bons d’entrée en stock — 05/10',
          label: 'Annexe 2',
          title: 'Bons d’entrée en stock',
          instructions: 'Un bon par réception, numérotés à la suite du dernier bon (document 3), dans l’ordre des documents ①, ② et ③.',
          helps: ['Le premier nouveau bon suit 0259.', 'Les bons se suivent : un numéro par réception.', '0260 pour la plateforme, 0261 pour le Moulin, 0262 pour la Coopérative.'],
          outcomeIds: R1,
          fields: [
            { id: 'b1', label: 'Bon n° — Plateforme Bio Centre', kind: 'number', answer: 260, explain: '0259 + 1 = 0260.' },
            { id: 'q1', label: 'Nombre de lignes du bon ①', kind: 'number', answer: 5, explain: '5 références livrées par la plateforme.' },
            { id: 'b2', label: 'Bon n° — Moulin de Solignac', kind: 'number', answer: 261, explain: '0261.' },
            { id: 'q2', label: 'Quantité totale entrée (bon ②)', kind: 'number', answer: 125, explain: '25 + 100 = 125 produits.' },
            { id: 'b3', label: 'Bon n° — Coopérative Légumes du Limousin', kind: 'number', answer: 262, explain: '0262.' },
            { id: 'q3', label: 'Quantité totale entrée (bon ③)', kind: 'number', answer: 130, explain: '40 + 30 + 40 + 20 = 130 produits.' },
          ],
        },
        {
          id: 'd02-m4-a3',
          kind: 'fields',
          label: 'Question',
          title: 'Appliquer la méthode FIFO',
          instructions: 'Hugo range 40 galettes végétales en zone B, où il en reste 6 de la livraison précédente.',
          helps: ['FIFO : premier entré, premier sorti.', 'Les produits dont la date est la plus proche doivent sortir en premier.', 'Les 6 anciennes galettes passent devant.'],
          outcomeIds: R2,
          fields: [
            {
              id: 'fifo',
              label: 'Comment doit-il ranger ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Les 6 anciennes devant, les 40 nouvelles derrière.' },
                { value: 'b', label: 'Les 40 nouvelles devant, elles sont plus fraîches.' },
                { value: 'c', label: 'Peu importe, tant qu’elles sont au froid.' },
              ],
              answer: 'a',
              explain: 'Les produits à date courte sortent d’abord : on évite la perte et la vente d’un produit périmé.',
            },
          ],
        },
        {
          id: "d02-revision-4",
          label: "Annexe complémentaire",
          title: "Choisir l’ordre et l’emplacement des lots",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Repère le lot dont la traçabilité est insuffisante avant de comparer les dates.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "16 − 10 = 6 unités."
          ],
          outcomeIds: [
            "d02-r1",
            "d02-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien d’unités L21 restent en réserve après le réassort ?",
              kind: "number",
              answer: 6,
              explain: "16 − 10 = 6 unités."
            },
            {
              id: "q2",
              label: "Indique comment ranger les trois lots et tracer le transfert.",
              kind: "written",
              lines: 3,
              model: "L21 devant L27 dans la zone B. L29 est identifié et isolé en zone d’attente. J’enregistre le transfert de 10 unités L21 vers le rayon avec la date et mon identifiant."
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
      title: 'Respecter les règles de manutention et de sécurité',
      guidance: 'accompagné',
      message: {
        from: 'Sophie Marchal',
        role: 'Directrice',
        text: [
          'Pour prévenir les accidents liés à la manutention des colis et des charges, j’ai conçu une fiche d’information et de formation, la « Top sécurité n° 06 », pour mes collaborateurs. Je voudrais que tu la testes : complète l’annexe.',
        ],
      },
      documents: [
        {
          id: 'd02-m5-doc1',
          number: 1,
          title: 'Le matériel de manutention',
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Matériel', 'Définition'],
              rows: [
                ['Chariot élévateur', 'Engin à moteur, avec conducteur assis, pour transporter et lever des charges lourdes.'],
                ['Diable', 'Matériel à 2 roues, poussé à la main, pour transporter quelques cartons.'],
                ['Palette', 'Support de manutention en bois ou en plastique, sur lequel on empile les colis.'],
                ['Rayonnage / palettier', 'Structure métallique fixe pour stocker les marchandises en hauteur.'],
                ['Roll', 'Cage métallique sur 4 roulettes pour déplacer des produits jusqu’au rayon.'],
                ['Gerbeur', 'Engin, piloté à pied, pour déplacer et lever des charges à hauteur.'],
                ['Transpalette', 'Matériel à fourches pour déplacer des palettes au sol, sur de courtes distances.'],
              ],
            },
          ],
        },
        {
          id: 'd02-m5-doc2',
          number: 2,
          title: 'L’ordre et le rangement',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'La zone de travail doit être rangée chaque jour ; les allées doivent rester dégagées. Cette rigueur fait gagner du temps et réduit les risques d’accident : chutes de plain-pied, chutes d’objets, collisions avec les engins.' },
          ],
        },
        {
          id: "d02-revision-5-doc",
          number: 3,
          title: "Sécuriser une manutention au moment du rush",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Une palette pèse 310 kg. Le transpalette prévu porte 500 kg et sa roue avant est bloquée. Une allée piétonne longe le quai. Un matériel contrôlé de capacité 600 kg se trouve à l’autre extrémité de la réserve. L’équipe a un moyen de baliser le passage."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd02-m5-a1',
          kind: 'fields',
          label: 'Top sécurité — 1',
          title: 'Indique le nom de chaque matériel',
          instructions: 'Retrouve le matériel décrit.',
          helps: ['Distingue ce qui roule au sol (transpalette, diable, roll) et ce qui soulève (chariot, gerbeur).', 'Le chariot a un conducteur assis ; le gerbeur se pilote à pied.', 'Le palettier est fixe ; la palette est un simple support.'],
          outcomeIds: R1,
          fields: [
            ['m1', 'Je soulève une palette jusqu’au 3e niveau du rayonnage ; mon conducteur est assis.', 'chariot', 'd02-mat-chariot-cut'],
            ['m2', 'Je déplace une palette au sol sur quelques mètres ; on me tire à la main.', 'transpalette', 'd02-mat-transpalette-cut'],
            ['m3', 'Je porte 3 cartons sur 2 roues, jusqu’au rayon.', 'diable', 'd02-mat-diable-cut'],
            ['m4', 'Cage sur roulettes, je transporte les produits jusqu’à la surface de vente.', 'roll', 'd02-mat-roll-cut'],
            ['m5', 'Je lève des charges en hauteur, mais on me pilote à pied.', 'gerbeur', 'd02-mat-gerbeur-cut'],
            ['m6', 'Structure métallique fixe, je stocke les palettes en hauteur.', 'rayonnage', 'd02-mat-rayonnage-cut'],
            ['m7', 'Support en bois sur lequel on empile les colis.', 'palette', 'd02-mat-palette-cut'],
          ].map(([id, label, answer, img]) => ({
            id,
            label,
            kind: 'choice' as const,
            select: true,
            options: MATERIELS,
            answer,
            image: { id: img, alt: `Matériel de manutention n° ${id.slice(1)}` },
            explain: `${MATERIELS.find((m) => m.value === answer)!.label}.`,
          })),
        },
        {
          id: 'd02-m5-a2',
          kind: 'fields',
          layout: 'signs',
          label: 'Top sécurité — 2',
          title: 'Complète la signification de chaque pictogramme de l’entrepôt',
          instructions: 'Choisis la signification de chaque pictogramme.',
          helps: [
            'La forme et la couleur donnent le sens : cercle bleu = obligation ; cercle rouge barré = interdiction ; triangle jaune = danger ; rectangle vert = secours.',
            'Regarde ensuite le dessin à l’intérieur : chaussure, téléphone, chariot, rayonnage, flèche, personnes.',
            'Le cercle barré avec deux personnes sur un chariot interdit de monter à plusieurs.',
          ],
          outcomeIds: R1,
          fields: (['chaussures', 'telephone', 'danger-chariots', 'stockage', 'chariots', 'gauche', 'monter', 'sortie'] as const).map((sg, i) => ({
            id: `s${i + 1}`,
            label: `Pictogramme ${i + 1}`,
            kind: 'choice' as const,
            select: true,
            sign: sg,
            options: SIGN_OPTIONS,
            answer: sg,
            explain: `Pictogramme ${i + 1} : ${SIGN_OPTIONS.find((o) => o.value === sg)!.label.toLowerCase()}.`,
          })),
        },
        {
          id: 'd02-m5-a3',
          kind: 'fields',
          layout: 'checklist',
          label: 'Top sécurité — 3',
          title: 'Vrai ou faux ?',
          instructions: 'Coche Vrai ou Faux pour chaque affirmation.',
          helps: ['Pense à la sécurité de tous, pas seulement à la tienne.', 'Un engin de manutention n’est jamais un moyen de transport de personnes.', 'Une seule affirmation est vraie : celle sur le but des consignes.'],
          outcomeIds: R1,
          fields: [
            ['a', 'Le port des chaussures de sécurité est facultatif quand je réceptionne des marchandises.', 'faux', 'Il est obligatoire en zone de réception : chute de charge, roue de transpalette.'],
            ['b', 'Je peux transporter un collègue sur mon chariot.', 'faux', 'Interdit : un seul conducteur, aucun passager.'],
            ['c', 'Si le transpalette n’est pas disponible, je peux pousser la palette à la main.', 'faux', 'Risque de blessure au dos et aux mains : on attend le matériel adapté.'],
            ['d', 'Je peux laisser les chariots dans les allées quand je ne m’en sers pas.', 'faux', 'Les allées doivent rester dégagées.'],
            ['e', 'Le respect des consignes vise à favoriser la sécurité et à réduire les risques.', 'vrai', 'C’est le but de toute consigne de sécurité.'],
            ['f', 'L’implication de tous les collaborateurs n’est pas obligatoire.', 'faux', 'La sécurité est l’affaire de chacun.'],
            ['g', 'Le Code de la route ne s’applique pas à la circulation des chariots (stops, passages piétons).', 'faux', 'Les règles de circulation de l’entrepôt s’en inspirent et doivent être respectées.'],
            ['h', 'Je peux laisser les fourches d’un chariot en position haute pendant que je déballe.', 'faux', 'Fourches toujours en position basse à l’arrêt.'],
            ['i', 'Je peux laisser les déchets s’accumuler au sol et tout ramasser le soir.', 'faux', 'Risque de chute : on trie et on évacue au fur et à mesure.'],
          ].map(([id, label, answer, explain]) => ({ id, label: `${id}. ${label}`, kind: 'choice' as const, options: VF, answer, explain })),
        },
        {
          id: "d02-revision-5",
          label: "Annexe complémentaire",
          title: "Sécuriser une manutention au moment du rush",
          instructions: "Lis le document 3. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "La capacité de levage et l’état du matériel sont deux conditions à vérifier.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "J’arrête son usage, le signale et l’identifie comme indisponible selon la procédure interne. Je préviens le responsable pour contrôle avant remise en service."
          ],
          outcomeIds: [
            "d02-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Que fais-tu du transpalette défectueux ?",
              kind: "written",
              lines: 3,
              model: "J’arrête son usage, le signale et l’identifie comme indisponible selon la procédure interne. Je préviens le responsable pour contrôle avant remise en service."
            },
            {
              id: "q2",
              label: "Comment transfères-tu la palette en sécurité ?",
              kind: "written",
              lines: 3,
              model: "Je libère et balise le trajet, garde les piétons hors de la zone de circulation, contrôle le transpalette de 600 kg et le charge conformément à la procédure de l’établissement."
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
      title: 'Respecter les règles d’hygiène',
      guidance: 'autonome',
      hero: { id: 'd02-froid', alt: 'Client choisissant une barquette de viande dans un meuble réfrigéré de magasin' },
      message: {
        from: 'Sophie Marchal',
        role: 'Directrice',
        text: [
          'Je veux que nos clients soient entièrement satisfaits : la qualité de nos produits doit être irréprochable. Les normes de conservation doivent être suivies scrupuleusement, notamment le respect de la chaîne du froid (documents 1, 2 et 3).',
          'Je te confie la gestion des dates des produits stockés. Hugo a recensé les produits concernés (annexe 1). Vérifie aussi les températures relevées à l’arrivée des livraisons du 5 octobre (annexe 2).',
        ],
      },
      documents: [
        {
          id: 'd02-m6-doc1',
          number: 1,
          title: 'DDM et DLC : ce qu’il faut savoir',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'La date de durabilité minimale (DDM), indiquée par la mention « À consommer de préférence avant le… », est la date jusqu’à laquelle le produit garde toutes ses qualités : goût, texture, valeur nutritive. Une fois cette date passée, le produit peut perdre un peu de ses qualités, mais il ne présente pas de danger s’il a été bien conservé et que son emballage est intact. Exemples : pâtes, céréales, café, conserves, biscuits.' },
            { type: 'p', text: 'La date limite de consommation (DLC), indiquée par la mention « À consommer jusqu’au… », concerne les produits très périssables : viandes, poissons, plats préparés, produits laitiers frais. Après cette date, le produit peut présenter un risque pour la santé.' },
            { type: 'note', text: 'Un produit dont la DLC est atteinte doit obligatoirement être retiré de la vente.' },
          ],
        },
        {
          id: 'd02-m6-doc2',
          number: 2,
          title: 'La chaîne du froid',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Respecter la chaîne du froid, c’est maintenir un produit à la bonne température, sans interruption, de sa fabrication jusqu’au consommateur. Le froid ralentit ou stoppe le développement des microbes responsables des intoxications alimentaires. Toute remontée de température les fait se multiplier et réduit la durée de vie du produit : la date indiquée n’est plus garantie.' },
            {
              type: 'table',
              caption: 'Températures de conservation appliquées chez Grain de Sel',
              head: ['Produits', 'Température'],
              rows: [
                ['Surgelés', '−18 °C ou moins'],
                ['Viandes, poissons, produits frais entamés', '0 °C à 4 °C'],
                ['Fruits et légumes frais réfrigérés', '4 °C maximum'],
                ['Produits laitiers, traiteur, desserts frais', '6 °C à 8 °C'],
              ],
            },
          ],
        },
        {
          id: 'd02-m6-doc3',
          number: 3,
          title: 'Charte qualité Grain de Sel (extrait)',
          look: 'contrat',
          blocks: [
            { type: 'p', text: 'Article 5 — Les dates des produits stockés sont contrôlées tous les 15 jours.' },
            {
              type: 'list',
              items: [
                'Produit dont la DLC est dépassée : retrait immédiat de la vente et destruction.',
                'Produit frais dont la DLC arrive dans 3 jours ou moins, produit dont la DDM arrive dans 3 semaines ou moins : don à l’association d’aide alimentaire partenaire.',
                'Produit frais dont la DLC arrive dans 4 à 6 jours, produit dont la DDM arrive dans moins de 2 mois : vente à prix réduit (étiquette « anti-gaspi »).',
                'Autres produits : aucune action.',
              ],
            },
          ],
        },
        {
          id: "d02-revision-6-doc",
          number: 4,
          title: "Décider à partir du relevé de froid",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le plan de réception interne fixe une plage de 0 à 4 °C pour la référence F16. À l’arrivée, trois unités relevées donnent 3,2 °C, 5,1 °C et 4,8 °C. À la seconde mesure sur les unités en écart, les valeurs sont 5,0 °C et 4,9 °C. Le protocole demande une décision du responsable si le dépassement est confirmé."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd02-m6-a1',
          kind: 'fields',
          layout: 'columns',
          columns: ['Décision'],
          label: 'Annexe 1',
          title: 'Gestion des dates des produits — contrôle du jeudi 8 octobre',
          instructions: 'Pour chaque produit, calcule le nombre de jours restants et applique la charte (document 3).',
          helps: [
            'Compte les jours entre le 8 octobre et la date du produit. Vérifie s’il s’agit d’une DLC ou d’une DDM : les seuils ne sont pas les mêmes.',
            'DLC : dépassée → retrait ; 3 jours ou moins → don ; 4 à 6 jours → prix réduit. DDM : 3 semaines ou moins → don ; moins de 2 mois → prix réduit.',
            'Houmous, DLC le 13 : 5 jours → prix réduit. Céréales, DDM le 20/10 : 12 jours → don.',
          ],
          outcomeIds: R2,
          fields: DATES.map((d) => ({
            id: `${d.id}.0`,
            label: `${d.name} (zone ${d.zone}, ×${d.qte}) — ${d.dlc ? `DLC ${d.dlc}` : `DDM ${d.ddm}`}`,
            kind: 'choice' as const,
            select: true,
            options: DECISIONS,
            answer: d.answer,
            explain: d.why,
          })),
        },
        {
          id: 'd02-m6-a2',
          kind: 'fields',
          layout: 'columns',
          columns: ['OK / NOK'],
          label: 'Annexe 2',
          title: 'Vérification des températures — réception du 5 octobre',
          instructions: 'Compare chaque température relevée à la règle du document 2.',
          helps: [
            'Repère d’abord la catégorie du produit, puis sa température maximale.',
            'Pour les surgelés, plus c’est froid, mieux c’est : −19 °C est conforme.',
            'Deux produits sont trop chauds : les galettes végétales (12,5 °C) et les myrtilles (5,6 °C).',
          ],
          outcomeIds: R12,
          fields: TEMPS.map((t) => ({
            id: `${t.id}.0`,
            label: `Cde ${t.cde} — ${t.name} · ${t.cat} · relevé ${t.t}`,
            kind: 'choice' as const,
            options: [
              { value: 'ok', label: 'OK' },
              { value: 'nok', label: 'NOK' },
            ],
            answer: t.ok ? 'ok' : 'nok',
            explain: t.why,
          })),
        },
        {
          id: 'd02-m6-a3',
          kind: 'open',
          label: 'Annexe 2 (suite)',
          title: 'Action à engager pour les produits NOK',
          instructions: 'Explique ce que le magasin doit faire pour les produits dont la température n’est pas conforme.',
          helps: ['Peut-on vendre un produit dont la chaîne du froid a été rompue ?', 'Le litige est-il lié au transport ? Où doit-il être noté ?', 'Refus du produit, réserve sur le document de transport, information du fournisseur.'],
          outcomeIds: R12,
          prompts: [{ id: 'action', label: 'Action envisagée', lines: 4 }],
          selfCheck: ['J’ai indiqué que les produits ne sont pas mis en vente.', 'J’ai indiqué qui prévenir et comment.'],
        },
        {
          id: "d02-revision-6",
          label: "Annexe complémentaire",
          title: "Décider à partir du relevé de froid",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Compare chaque relevé à la plage du document et distingue contrôle initial et confirmation.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "5,1 et 4,8 dépassent 4 °C."
          ],
          outcomeIds: [
            "d02-r2",
            "d02-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien de mesures initiales sont hors plage ?",
              kind: "number",
              answer: 2,
              explain: "5,1 et 4,8 dépassent 4 °C."
            },
            {
              id: "q2",
              label: "Écris la note de réception du lot.",
              kind: "written",
              lines: 3,
              model: "Lot F16 retenu en zone adaptée sans mise en vente. Deux dépassements confirmés, 5,1 puis 5,0 °C et 4,8 puis 4,9 °C. J’inscris l’heure, le numéro de lot et les valeurs, puis demande la décision du responsable."
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
          id: 'd02-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les schémas de la synthèse.',
          helps: ['Reprends les missions une par une.', 'Pense aux deux documents de la livraison et aux deux types de litiges.', 'DDM = date de durabilité minimale ; DLC = date limite de consommation.'],
          outcomeIds: R12,
          fields: [
            { id: 'bc', label: '1. À la date de commande, on établit le…', kind: 'text', accept: ['bon de commande', 'BC'], explain: 'Le bon de commande.' },
            { id: 'bl', label: '1. À la livraison effective, on reçoit le bon de livraison et le…', kind: 'text', accept: ['document de transport', 'récépissé', 'récépissé d’expédition', 'recepisse d expedition'], explain: 'Le document de transport (récépissé d’expédition).' },
            {
              id: 'ordre',
              label: '2. Après l’accueil du chauffeur, la première étape est de…',
              kind: 'choice',
              options: [
                { value: 'a', label: 'vérifier le bordereau de livraison et les étiquettes de colisage' },
                { value: 'b', label: 'mettre à jour le stock' },
                { value: 'c', label: 'déballer les produits' },
              ],
              answer: 'a',
              explain: 'On vérifie d’abord que la livraison est bien pour le magasin.',
            },
            { id: 'reserves', label: '3. Les litiges qui concernent le transporteur s’appellent des…', kind: 'text', accept: ['réserves', 'reserves', 'réserve'], explain: 'Des réserves.' },
            { id: 'anomalies', label: '3. Les litiges qui concernent le fournisseur s’appellent des…', kind: 'text', accept: ['anomalies', 'anomalie'], explain: 'Des anomalies.' },
            { id: 'froid', label: '4. Entre le stockage en froid négatif et à température ambiante : le stockage en…', kind: 'text', accept: ['froid positif', 'chambre froide positive'], explain: 'Le froid positif (0 à 8 °C).' },
            { id: 'ddm', label: '5-6. DDM signifie date de…', kind: 'text', accept: ['durabilité minimale', 'durabilite minimale'], explain: 'Date de durabilité minimale.' },
            { id: 'dlc', label: '5-6. DLC signifie date…', kind: 'text', accept: ['limite de consommation'], explain: 'Date limite de consommation.' },
          ],
        },
        {
          id: 'd02-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq questions pour faire le point.',
          helps: ['Relis la fiche de révision.', 'Attention aux surgelés : plus c’est froid, mieux c’est.', 'Une DLC dépassée : jamais en vente.'],
          outcomeIds: R12,
          fields: [
            { id: 'q1', label: 'Une palette arrive à −16 °C pour des surgelés. Conforme ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Les surgelés doivent être à −18 °C ou moins.' },
            { id: 'q2', label: 'Le délai pour confirmer une réserve au transporteur par LRAR est de…', kind: 'number', answer: 3, unit: 'jours', explain: '3 jours.' },
            { id: 'q3', label: 'Des pâtes dont la DDM est dépassée d’une semaine sont dangereuses.', kind: 'choice', options: VF, answer: 'faux', explain: 'Une DDM dépassée n’est pas un risque sanitaire si l’emballage est intact.' },
            { id: 'q4', label: 'FIFO signifie…', kind: 'choice', options: [{ value: 'a', label: 'premier entré, premier sorti' }, { value: 'b', label: 'dernier entré, premier sorti' }], answer: 'a', explain: 'First In, First Out.' },
            { id: 'q5', label: 'Il manque 3 produits dans un colis intact : à qui écrire ?', kind: 'choice', options: [{ value: 'f', label: 'Au fournisseur' }, { value: 't', label: 'Au transporteur' }], answer: 'f', explain: 'Colis intact : l’erreur vient du fournisseur (anomalie).' },
          ],
        },
      ],
      synthesis: [
        {
          title: 'Notions essentielles',
          kind: 'notions',
          items: [
            'Planning des réceptions : date de commande → date prévisionnelle → date effective ; relance le lendemain d’une livraison prévue non reçue.',
            'Bon (bordereau) de livraison : contrat de vente avec le fournisseur. Document de transport : contrat de transport.',
            'Réserve : litige avec le transporteur (colis manquant ou endommagé, température). Anomalie : litige avec le fournisseur (produit manquant ou en surplus, erreur de référence, date non conforme).',
            'DDM : « à consommer de préférence avant ». DLC : « à consommer jusqu’au », date impérative.',
          ],
        },
        {
          title: 'Méthodes',
          kind: 'methodes',
          items: [
            'Procédure de réception : accueil → bordereau → documents → déchargement → état apparent → acceptation ou refus → document de transport → départ du chauffeur → déballage → contrôle des références → fiche de contrôle → rangement → stock → litiges → rangement du poste → compte rendu.',
            'Ranger selon la température (froid négatif, froid positif, ambiant) et selon la méthode FIFO.',
            'Contrôler les dates tous les 15 jours et appliquer la charte : retrait, don, prix réduit.',
          ],
        },
        {
          title: 'Repères à connaître',
          kind: 'formules',
          items: ['Surgelés : −18 °C ou moins', 'Viandes, poissons : 0 à 4 °C', 'Fruits et légumes frais : 4 °C maximum', 'Laitiers, traiteur : 6 à 8 °C', 'Réserve → LRAR sous 3 jours', 'Anomalie → courriel au fournisseur'],
        },
        {
          title: 'Erreurs fréquentes',
          kind: 'erreurs',
          items: [
            'Laisser partir le chauffeur avant d’avoir contrôlé l’état apparent des colis.',
            'Confondre réserve et anomalie, et écrire au mauvais interlocuteur.',
            'Ranger les produits neufs devant les anciens.',
            'Jeter un produit à DDM dépassée qui pourrait être donné.',
          ],
        },
        {
          title: 'Bonnes pratiques professionnelles',
          kind: 'pratiques',
          items: ['Porter ses chaussures de sécurité en réception.', 'Garder les allées dégagées et trier les déchets au fur et à mesure.', 'Mesurer la température à l’ouverture du camion pour les produits frais.'],
        },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Planning', 'Procédure', 'Contrôles', 'Litiges', 'Réserve', 'Anomalie', 'FIFO', 'Chaîne du froid', 'DDM', 'DLC', 'Sécurité'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Une réception rapprochée du bon de commande révèle les écarts commerciaux. Le contrôle physique révèle les écarts de quantité, d’état ou de température.",
            "La mise à disposition en rayon intervient après décision et enregistrement.",
            "En cas de doute, identifie et isole le lot, conserve la trace du contrôle et alerte la personne habilitée."
          ]
        },
      ],
    },

    /* ================================ APPLICATION 1 ================================ */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Découvrir le métier d’agréeur',
      guidance: 'autonome',
      hero: { id: 'd02-fraises', alt: 'Barquettes de fraises alignées dans des cagettes' },
      message: {
        from: 'Thomas Rivière',
        role: 'Agréeur, hypermarché du Grand Vallon, Brive',
        text: [
          'Tu fais une PFMP dans notre hypermarché. Je suis l’agréeur du magasin : je contrôle la qualité des fruits et légumes à leur arrivée.',
          'Découvre mon métier (document 1), puis prends en charge l’agréage d’une livraison de fraises (documents 2 et 3).',
        ],
      },
      documents: [
        {
          id: 'd02-a1-doc1',
          number: 1,
          title: 'Fiche métier : agréeur / agréeuse',
          look: 'fiche',
          blocks: [
            { type: 'p', text: 'L’agréeur, aussi appelé contrôleur qualité, vérifie que les fruits et légumes livrés correspondent au cahier des charges de l’enseigne : variété, calibre, maturité, aspect, absence de défauts, température et traçabilité.' },
            { type: 'list', title: 'Activités', items: ['Prélever des échantillons à la réception et les contrôler.', 'Mesurer le calibre, la maturité, la température.', 'Accepter ou refuser une livraison, et rédiger la fiche d’agréage.', 'Échanger avec les fournisseurs et les acheteurs sur les non-conformités.'] },
            { type: 'list', title: 'Évolutions possibles', items: ['Responsable qualité d’un entrepôt ou d’une plateforme.', 'Acheteur fruits et légumes.', 'Chef de rayon fruits et légumes.'] },
          ],
        },
        {
          id: 'd02-a1-doc2',
          number: 2,
          title: 'Bordereau de livraison n° 203157 et produits reçus',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Fournisseur', 'Les Jardins de la Corrèze, 19100 Brive'], ['Livraison', '10 octobre'], ['Commande', 'n° 25MAD02 du 7 octobre'], ['Transport', 'température dirigée entre 4 °C et 7 °C']] },
            { type: 'table', head: ['Désignation', 'Unité', 'Qté commandée', 'Qté livrée'], align: ['left', 'left', 'right', 'right'], rows: [['Fraises — calibre 3, maturité 2', 'Barquette 500 g', '800', '800'], ['Fruits de la passion', 'Pièce', '150', '150'], ['Kiwis', 'Pièce', '500', '500']] },
            { type: 'list', title: 'Produits reçus (fraises)', items: ['50 cagettes de 16 barquettes de 500 g.', 'Échantillon de 10 barquettes : calibre moyen mesuré 36 mm.', 'Maturité observée : stade 2 (fruit entièrement rouge).', 'Température à cœur : 5 °C.'] },
          ],
        },
        {
          id: 'd02-a1-doc3',
          number: 3,
          title: 'Cahier des charges — fraises (extrait)',
          look: 'contrat',
          blocks: [
            { type: 'table', head: ['Calibre', 'Diamètre'], rows: [['1', 'moins de 20 mm'], ['2', '20 à 40 mm'], ['3', 'plus de 40 mm']] },
            { type: 'table', head: ['Stade de maturité', 'Aspect'], rows: [['0', 'blanche à verte'], ['1', 'rougissante, pointe blanche'], ['2', 'entièrement rouge']] },
            { type: 'note', text: 'Tout écart de calibre ou de maturité par rapport à la commande rend le lot non conforme.' },
          ],
        },
      ],
      activities: [
        {
          id: 'd02-a1-a1',
          kind: 'fields',
          label: '1 à 3',
          title: 'Le métier d’agréeur',
          instructions: 'Réponds à l’aide du document 1.',
          helps: ['Le second nom est cité dès la première phrase.', 'Les activités tournent autour du contrôle et de la décision.', 'Les évolutions mènent à la qualité, aux achats ou au management du rayon.'],
          outcomeIds: R12,
          fields: [
            { id: 'nom', label: '1. Quel est le second nom de l’agréeur ?', kind: 'choice', options: [{ value: 'commercial', label: 'Commercial' }, { value: 'qualite', label: 'Contrôleur qualité' }, { value: 'env', label: 'Responsable environnement' }], answer: 'qualite', explain: 'Contrôleur qualité.' },
            {
              id: 'act',
              label: '2. Quelles sont ses activités ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'echantillon', label: 'Prélever et contrôler des échantillons' },
                { value: 'mesurer', label: 'Mesurer calibre, maturité, température' },
                { value: 'decider', label: 'Accepter ou refuser une livraison' },
                { value: 'caisse', label: 'Tenir la caisse' },
              ],
              answers: ['echantillon', 'mesurer', 'decider'],
              explain: 'L’agréeur ne tient pas la caisse.',
            },
            {
              id: 'evol',
              label: '3. Vers quels métiers peut-il évoluer ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'rq', label: 'Responsable qualité' },
                { value: 'acheteur', label: 'Acheteur fruits et légumes' },
                { value: 'chef', label: 'Chef de rayon fruits et légumes' },
                { value: 'compta', label: 'Comptable' },
              ],
              answers: ['rq', 'acheteur', 'chef'],
              explain: 'Document 1, « Évolutions possibles ».',
            },
          ],
        },
        {
          id: 'd02-a1-a2',
          kind: 'fields',
          layout: 'extranet',
          windowTitle: 'Fiche d’agréage — fraises',
          label: '4',
          title: 'Complète la fiche d’agréage',
          instructions: 'Contrôle la livraison de fraises à l’aide des documents 2 et 3.',
          helps: ['Calcule le nombre de barquettes reçues : cagettes × barquettes par cagette.', 'Compare le calibre mesuré au tableau des calibres.', '36 mm correspond au calibre 2, alors que le calibre 3 a été commandé.'],
          outcomeIds: R12,
          fields: [
            { id: 'nb', label: 'Barquettes reçues', kind: 'number', answer: 800, explain: '50 × 16 = 800 barquettes : quantité conforme.' },
            { id: 'qte', label: 'Quantité conforme ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: '800 commandées, 800 reçues.' },
            { id: 'cal', label: 'Calibre constaté', kind: 'number', answer: 2, explain: '36 mm : entre 20 et 40 mm, calibre 2.' },
            { id: 'calok', label: 'Calibre conforme ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Calibre 3 commandé, calibre 2 reçu.' },
            { id: 'mat', label: 'Maturité conforme ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Stade 2 commandé et constaté.' },
            { id: 'temp', label: 'Température conforme ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: '5 °C, dans la plage 4–7 °C.' },
            { id: 'dec', label: 'Décision', kind: 'choice', options: [{ value: 'accepte', label: 'Lot accepté' }, { value: 'refus', label: 'Lot non conforme : refus ou réfaction de prix' }], answer: 'refus', explain: 'Le calibre ne correspond pas au cahier des charges : lot non conforme.' },
          ],
        },
      ],
      selfAssessment: ['Je sais décrire le rôle d’un agréeur.', 'Je sais contrôler un lot par rapport à un cahier des charges.'],
    },

    /* ================================ APPLICATION 2 ================================ */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Réceptionner une livraison',
      guidance: 'autonome',
      message: {
        from: 'Julie Mercier',
        role: 'Responsable réception, hypermarché du Grand Vallon',
        text: ['Tu poursuis ta PFMP à l’hypermarché. Aujourd’hui, tu réceptionnes seul la livraison n° 203679 de yaourts. Contrôle tout, signale les litiges et traite-les.'],
      },
      documents: [
        {
          id: 'd02-a2-doc1',
          number: 1,
          title: 'Courriel de commande',
          look: 'courriel',
          blocks: [
            { type: 'facts', items: [['De', 'appro@grandvallon-hyper.fr'], ['À', 'commercial@laiterie-vezere.fr'], ['Objet', 'Commande n° 203186']] },
            { type: 'p', text: 'Bonjour, je souhaite commander les références suivantes : 3 222 658 702 368, quantité 80 ; 3 222 658 426 907, quantité 60 ; 3 222 658 900 347, quantité 150 ; 3 222 658 934 037, quantité 40. Cordialement, Mme Lemaire, responsable approvisionnements.' },
          ],
        },
        {
          id: 'd02-a2-doc2',
          number: 2,
          title: 'Bon de livraison n° 203679 — Laiterie de la Vézère',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Livraison', 'le 11 octobre'], ['Commande', 'n° 203186 du 7 octobre'], ['Nombre de colis', '2 palettes'], ['Poids total', '320 kg']] },
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Unité', 'Qté commandée', 'Qté livrée'],
              align: ['left', 'left', 'left', 'right', 'right'],
              rows: [
                ['3 222 658 900 347', 'Yaourt vanille', 'Pack de 4', '150', '150'],
                ['3 222 658 934 037', 'Yaourt fraise', 'Pack de 4', '40', '40'],
                ['3 222 658 426 907', 'Yaourt citron', 'Pack de 4', '60', '60'],
                ['3 222 658 702 368', 'Yaourt abricot', 'Pack de 4', '80', '80'],
              ],
            },
          ],
        },
        {
          id: 'd02-a2-doc3',
          number: 3,
          title: 'Document de transport n° 220114',
          look: 'facture',
          blocks: [{ type: 'facts', items: [['Expéditeur', 'Laiterie de la Vézère'], ['Destinataire', 'Hypermarché du Grand Vallon, Brive'], ['Transporteur', 'Transports Louiset'], ['Colis', '2 palettes, 320 kg'], ['Nature', 'Produits laitiers à transporter entre 4 °C et 6 °C']] }],
        },
        {
          id: 'd02-a2-doc4',
          number: 4,
          title: 'Extraits du contrat avec la Laiterie de la Vézère',
          look: 'contrat',
          blocks: [
            { type: 'p', text: 'Article 6 — Les livraisons doivent être conformes aux commandes. Les produits endommagés ou ne respectant pas la chaîne du froid sont laissés au chauffeur. Les produits en surplus et les erreurs de référence sont placés en zone « litiges » et traités avec le service gestion des litiges.' },
            { type: 'p', text: 'Le transporteur est responsable du calage des marchandises : elles doivent être sanglées aux parois de la remorque et livrées en bon état. Il a une obligation de résultat.' },
            { type: 'p', text: 'Article 8 — Les réserves sont notées sur le document de transport et confirmées par lettre recommandée avec avis de réception sous 3 jours. Les anomalies sont notées sur le bon de livraison et signalées par courriel au fournisseur.' },
          ],
        },
        {
          id: 'd02-a2-doc5',
          number: 5,
          title: 'Marchandises reçues',
          look: 'memo',
          blocks: [
            { type: 'image', image: { id: 'd02-palettes-cut', alt: 'Deux palettes de cartons filmés' }, float: true },
            { type: 'table', head: ['Palette', 'Référence', 'Quantité'], align: ['left', 'left', 'right'], rows: [['1', '3 222 658 934 037', '40'], ['1', '3 222 658 426 907', '60'], ['1', '3 222 658 900 347', '50'], ['2', '3 222 658 701 638', '80'], ['2', '3 222 658 900 347', '100']] },
            { type: 'list', items: ['Température relevée : 5 °C.', 'Sur la palette 2, 25 packs de la référence 3 222 658 900 347 sont éventrés : les cartons ont glissé pendant le transport.', 'Les étiquettes de colisage indiquent : Hypermarché du Grand Vallon, Brive.'] },
          ],
        },
      ],
      activities: [
        {
          id: 'd02-a2-a1',
          kind: 'fields',
          label: '1',
          title: 'Les produits nous sont-ils destinés ?',
          instructions: 'Vérifie le destinataire.',
          helps: ['Où lit-on le destinataire d’un colis ?', 'Regarde les étiquettes de colisage.', 'Elles indiquent bien l’hypermarché.'],
          outcomeIds: R1,
          fields: [{ id: 'dest', label: 'Les produits sont-ils destinés à l’hypermarché ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: 'Les étiquettes de colisage indiquent l’hypermarché du Grand Vallon.' }],
        },
        {
          id: 'd02-a2-a2',
          kind: 'fields',
          layout: 'columns',
          columns: ['Courriel', 'Bon de livraison', 'Reçu'],
          label: '2',
          title: 'Pointer la livraison',
          instructions: 'Pour chaque référence, reporte la quantité commandée, la quantité indiquée sur le bon et la quantité réellement reçue (bons produits, palettes 1 et 2 additionnées).',
          helps: ['Additionne les quantités d’une même référence sur les deux palettes.', 'Une référence reçue ne figure pas dans la commande : elle remplace une autre.', 'Vanille : 50 + 100 = 150 reçus, dont 25 éventrés. Abricot (702 368) : 0 reçu ; à la place, 80 packs de 701 638.'],
          outcomeIds: R1,
          fields: [
            ['vanille', 'Yaourt vanille — 900 347', 150, 150, 150],
            ['fraise', 'Yaourt fraise — 934 037', 40, 40, 40],
            ['citron', 'Yaourt citron — 426 907', 60, 60, 60],
            ['abricot', 'Yaourt abricot — 702 368', 80, 80, 0],
          ].flatMap(([id, label, a, b, c]) =>
            [a, b, c].map((v, i) => ({
              id: `${id}.${i}`,
              label: label as string,
              kind: 'number' as const,
              answer: v as number,
              explain: i === 2 && id === 'abricot' ? 'Aucun pack de la référence 702 368 : ce sont des packs 701 638 qui ont été livrés.' : `${label} : ${v}.`,
            })),
          ),
        },
        {
          id: 'd02-a2-a3',
          kind: 'fields',
          label: '3 et 4',
          title: 'La livraison est-elle conforme ?',
          instructions: 'Identifie les litiges et l’endroit où les noter.',
          helps: ['Deux problèmes : un sur l’état des colis, un sur la référence.', 'L’état du colis relève du transporteur (calage). La référence relève du fournisseur.', 'Réserve sur le document de transport (packs éventrés) ; anomalie sur le bon de livraison (erreur de référence).'],
          outcomeIds: R1,
          fields: [
            { id: 'conf', label: 'La livraison est-elle conforme ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Deux litiges.' },
            { id: 'eventres', label: 'Packs éventrés : combien ?', kind: 'number', answer: 25, explain: '25 packs de yaourt vanille.' },
            { id: 'type1', label: 'Les packs éventrés sont…', kind: 'choice', options: [{ value: 'reserve', label: 'une réserve, notée sur le document de transport' }, { value: 'anomalie', label: 'une anomalie, notée sur le bon de livraison' }], answer: 'reserve', explain: 'Les cartons ont glissé : défaut de calage, responsabilité du transporteur.' },
            { id: 'type2', label: 'Les 80 packs de référence 701 638 sont…', kind: 'choice', options: [{ value: 'reserve', label: 'une réserve, notée sur le document de transport' }, { value: 'anomalie', label: 'une anomalie, notée sur le bon de livraison' }], answer: 'anomalie', explain: 'Erreur de référence : responsabilité du fournisseur.' },
            { id: 'sort1', label: 'Que faire des packs éventrés ?', kind: 'choice', options: [{ value: 'chauffeur', label: 'Les laisser au chauffeur' }, { value: 'rayon', label: 'Les mettre en rayon à prix réduit' }, { value: 'litige', label: 'Les placer en zone litiges' }], answer: 'chauffeur', explain: 'Article 6 : les produits endommagés sont laissés au chauffeur.' },
            { id: 'sort2', label: 'Que faire des packs de mauvaise référence ?', kind: 'choice', options: [{ value: 'chauffeur', label: 'Les laisser au chauffeur' }, { value: 'rayon', label: 'Les mettre en rayon' }, { value: 'litige', label: 'Les placer en zone litiges' }], answer: 'litige', explain: 'Article 6 : erreurs de référence en zone litiges.' },
            { id: 'stock', label: 'Combien de packs de yaourt vanille entrent en stock ?', kind: 'number', answer: 125, explain: '150 − 25 éventrés = 125.' },
          ],
        },
        {
          id: 'd02-a2-a4',
          kind: 'open',
          label: '5 et 6',
          title: 'Traiter les litiges par écrit',
          instructions: 'Rédige la lettre recommandée au transporteur, puis le courriel au fournisseur.',
          helps: ['Deux destinataires, deux litiges différents.', 'Rappelle les numéros (livraison, document de transport, commande), la date et les quantités.', 'Termine par ta demande : avoir ou remplacement, et formule de politesse.'],
          outcomeIds: R1,
          prompts: [
            { id: 'lrar', label: 'Lettre recommandée avec AR à Transports Louiset (corps de la lettre)', lines: 8 },
            { id: 'mail', label: 'Courriel à la Laiterie de la Vézère', lines: 8 },
          ],
          selfCheck: ['La lettre confirme la réserve dans le délai de 3 jours.', 'Chaque écrit cite les numéros de documents et les quantités.', 'J’ai formulé une demande précise.', 'J’ai utilisé des formules de politesse adaptées.'],
        },
      ],
      selfAssessment: ['Je sais pointer une livraison.', 'Je sais distinguer et traiter une réserve et une anomalie.'],
    },

    /* ================================ APPLICATION 3 ================================ */
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Recenser les manquements aux règles de sécurité et d’hygiène',
      guidance: 'autonome',
      message: {
        from: 'Julie Mercier',
        role: 'Responsable réception',
        text: ['Je veux te sensibiliser aux règles de sécurité. Recense les manquements aux règles de manutention, de sécurité et d’hygiène constatés aujourd’hui, et indique les solutions à apporter.'],
      },
      documents: [
        {
          id: "d02-revision-7-doc",
          number: 1,
          title: "Réceptionner des fruits chez un primeur",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Un primeur attend 60 barquettes du lot FR8. Le chauffeur en présente 60, dont 4 écrasées et 6 sans numéro de lot lisible. Les 4 écrasées portent un numéro lisible. Le magasin accepte les unités conformes et isole les unités non traçables. Une autre livraison attend le quai à 8 h 40."
            }
          ]
        },
        {
          id: "d02-revision-dossier-doc1",
          number: 2,
          title: "Bon de commande BC72 et bon de livraison BL72",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Référence",
                "Commandé",
                "Annoncé sur BL",
                "Constaté à 8 h 15"
              ],
              rows: [
                [
                  "Crème CR8",
                  "40",
                  "40",
                  "30 unités lot C16, 10 lot C17"
                ],
                [
                  "Yaourt YA4",
                  "24",
                  "24",
                  "22 unités contrôlées conformes et 2 écrasées"
                ]
              ]
            },
            {
              type: "p",
              text: "La mise en rayon de 30 crèmes est prévue à 9 h."
            }
          ]
        },
        {
          id: "d02-revision-dossier-doc2",
          number: 3,
          title: "Relevé et consigne interne",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "C16 mesuré à 3,4 °C. C17 mesuré à 5,2 °C puis à 5,1 °C au contrôle. Plage interne de réception pour CR8 de 0 à 4 °C. Isoler le lot hors plage, saisir uniquement les unités acceptées et faire décider la suite par le responsable. Pour YA4, noter l’état et la quantité par écrit."
            }
          ]
        },
        {
          id: "d02-revision-dossier-doc3",
          number: 4,
          title: "Rectification du chauffeur",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "À 8 h 25, le chauffeur présente 6 unités supplémentaires qu’il attribue à C16. Leur étiquette porte C18 et le bon de livraison ne les mentionne pas. Il propose de remplacer les unités C17 par ces six unités."
            }
          ]
        }],
      activities: [
        ...[
          ['1', 'Manuel, le réceptionnaire, roule souvent avec les fourches du chariot en position haute.', ['securite', 'manutention'], 'a', 'Rouler fourches basses, charge vers le mât.', 'd02-sit-chariot-cut'],
          ['2', 'Maxime a déposé des colis reçus ce matin devant l’extincteur.', ['securite'], 'b', 'Dégager l’accès à l’extincteur et ranger les colis dans une zone prévue.', 'd02-sit-extincteur-cut'],
          ['3', 'Les fromages reçus il y a 2 heures sont toujours posés sur le comptoir du bureau de réception.', ['hygiene'], 'c', 'Ranger immédiatement en chambre froide : la chaîne du froid est en jeu.', 'd02-sit-fromages-cut'],
          ['4', 'Ces cartons empilés de travers menacent de tomber à tout moment.', ['securite', 'manutention'], 'd', 'Restabiliser la pile : les plus lourds en bas, filmer ou sangler.', 'd02-sit-cartons-cut'],
          ['5', 'La poubelle de cartons déborde dans l’allée piétons.', ['securite', 'hygiene'], 'e', 'Vider et trier les déchets au fur et à mesure, dégager l’allée.', 'd02-sit-poubelle-cut'],
          ['6', 'Rémy vient décharger les camions en short et en sandales.', ['securite'], 'f', 'Porter la tenue de travail et les chaussures de sécurité obligatoires.', 'd02-sit-sandales-cut'],
        ].map(([n, desc, risks, sol, why]) => ({
          id: `d02-a3-s${n}`,
          kind: 'fields' as const,
          label: `Situation ${n}`,
          title: desc as string,
          instructions: 'Coche le ou les risques, puis choisis la solution à apporter.',
          helps: [
            'Sécurité : risque de blessure ou d’accident. Manutention : façon de déplacer ou d’empiler. Hygiène : propreté et conservation des aliments.',
            'Une situation peut relever de plusieurs risques.',
            `Solution attendue : ${why}`,
          ] as [string, string, string],
          outcomeIds: R12,
          fields: [
            {
              id: 'risques',
              label: 'Risque lié à…',
              kind: 'multi' as const,
              options: [
                { value: 'securite', label: 'la sécurité' },
                { value: 'manutention', label: 'la manutention' },
                { value: 'hygiene', label: 'l’hygiène' },
              ],
              answers: risks as string[],
              explain: `Risque(s) : ${(risks as string[]).join(', ')}.`,
            },
            {
              id: 'solution',
              label: 'Solution à apporter',
              kind: 'choice' as const,
              select: true,
              options: [
                { value: 'a', label: 'Rouler fourches en position basse' },
                { value: 'b', label: 'Dégager l’accès au matériel de secours' },
                { value: 'c', label: 'Ranger sans attendre au froid' },
                { value: 'd', label: 'Restabiliser et sangler la pile' },
                { value: 'e', label: 'Évacuer et trier les déchets au fur et à mesure' },
                { value: 'f', label: 'Porter les EPI (chaussures de sécurité)' },
              ],
              answer: sol as string,
              explain: why as string,
            },
          ],
        })),
        {
          id: "d02-revision-7",
          label: "Nouveau cas d’application",
          title: "Réceptionner des fruits chez un primeur",
          instructions: "Lis le document 1. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Les défauts concernent des unités différentes. Prends une décision pour chaque groupe.",
            "Relis le document 1 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "60 − 4 − 6 = 50."
          ],
          outcomeIds: [
            "d02-r1",
            "d02-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien de barquettes entrent en stock vendable ?",
              kind: "number",
              answer: 50,
              explain: "60 − 4 − 6 = 50."
            },
            {
              id: "q2",
              label: "Rédige la consigne à l’équipe qui prend le relais.",
              kind: "written",
              lines: 3,
              model: "Entrer 50 barquettes FR8 conformes. Signaler 4 barquettes écrasées sur le bon et demander au responsable la décision de reprise. Isoler 6 barquettes à numéro illisible en zone d’attente identifiée. Ranger le lot accepté puis libérer le quai avant 8 h 40."
            }
          ]
        },
        {
          id: "d02-revision-dossier",
          label: "Dossier de décision",
          title: "Traiter une livraison urgente sans rendre vendable un lot douteux",
          instructions: "Lis les documents 2 et 3, puis écris ton diagnostic initial. Passe ensuite au document 4 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Sépare la quantité annoncée, la quantité observée et la quantité autorisée à entrer en stock. Vérifie chaque lot individuellement.",
            "Fais une ligne par lot, avec quantité observée, preuve, décision et quantité à saisir. Un même produit peut donner plusieurs lignes.",
            "Exemple. Un bon annonce 20 produits. Tu en constates 20, dont 4 sont isolés sur décision du responsable. La réserve signale 4 isolés et l’entrée en stock vendable porte sur 16. Recommence ce rapprochement pour les unités présentées en plus."
          ],
          outcomeIds: [
            "d02-r1",
            "d02-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Complète le relevé initial par référence et indique la décision sur chaque groupe.",
              kind: "written",
              lines: 6,
              model: "CR8, 40 constatées. Accepter 30 C16, isoler 10 C17 et inscrire les deux mesures. YA4, 24 constatées, 22 acceptées et 2 écrasées à signaler avec décision de reprise ou d’isolement. Total vendable 52 unités."
            },
            {
              id: "q2",
              label: "Rédige une réserve exploitable à partir de BC72 et BL72.",
              kind: "written",
              lines: 6,
              model: "BL72, 8 h 15. CR8, lot C17, 10 unités mises en attente après mesures de 5,2 °C et 5,1 °C, 30 C16 acceptées. YA4, 2 unités écrasées sur 24, 22 acceptées. Reprise ou autre suite à confirmer avec le responsable."
            },
            {
              id: "q3",
              label: "La substitution proposée peut-elle être saisie immédiatement ? Indique les vérifications nécessaires.",
              kind: "written",
              lines: 6,
              model: "L’offre concerne C18, absent du bon. Isoler les 6 unités le temps de vérifier leur origine, l’étiquette, l’état, la température et la décision du responsable. Demander un document corrigé avant toute entrée validée. Conserver la trace de C17 séparément."
            },
            {
              id: "q4",
              label: "Écris la consigne de 8 h 30 pour le rayon et le suivi fournisseur.",
              kind: "written",
              lines: 6,
              model: "Mettre en rayon les 30 unités C16 acceptées, après enregistrement, et interdire le prélèvement de C17 ou C18 en attente. Le responsable décide du sort des 10 C17 et des 6 C18. Le suivi fournisseur conserve BL72, les mesures et les décisions."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais repérer une situation dangereuse en réception.', 'Je sais proposer une solution adaptée.',
        "Je distingue les lots observés, isolés et acceptés.",
        "J’appuie chaque décision sur une trace de contrôle.",
        "Je transmets au rayon uniquement le stock libéré."],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais mettre à jour un planning de réception et décider d’une relance.',
        'Je sais appliquer une procédure de réception et compléter une fiche de contrôle.',
        'Je sais distinguer une réserve d’une anomalie et rédiger un écrit de litige.',
        'Je sais ranger les produits en réserve selon leur température et la méthode FIFO.',
        'Je connais le matériel de manutention et les pictogrammes de sécurité.',
        'Je sais appliquer les règles DDM / DLC et contrôler la chaîne du froid.',
      ],
    },
  ],
};
