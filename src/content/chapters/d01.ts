import type { Chapter } from '../../domain/chapter';
import { cadencierRows, type CadencierInput } from './cadencier';

/**
 * DOSSIER 1 — Participer à l'approvisionnement et préparer les commandes
 *
 * Structure calquée sur la progression du manuel de référence (contexte professionnel,
 * 4 missions, synthèse, 2 applications), avec une densité comparable.
 * Entreprises, personnages, documents, textes et chiffres sont ORIGINAUX et fictifs.
 */

const R = ['d01-r1'];
const OUI_NON = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];
const CANAUX = [
  { value: 'direct', label: 'Canal direct' },
  { value: 'court', label: 'Canal court' },
  { value: 'long', label: 'Canal long' },
];

/* ======================== Cadenciers (données calculées) ======================== */

/** Mission 4 — semaines 45 à 48. Semaine 45 donnée, commandes S46 fixées par le directeur. */
export const CADENCIER_M4: CadencierInput[] = [
  {
    id: 'mf-70412',
    label: 'Caserne de pompiers — réf. 70412',
    colisage: 4,
    sales: [8, 20, 18, 12],
    firstOrder: 16,
    firstDelivery: 20,
    fixedOrders: { 1: 16 },
    blanks: ['1.S', '1.L', '2.S', '2.C', '2.L', '3.S', '3.C', '3.L'],
  },
  {
    id: 'mf-70418',
    label: 'Ferme et animaux — réf. 70418',
    colisage: 4,
    sales: [10, 22, 24, 8],
    firstOrder: 28,
    firstDelivery: 24,
    fixedOrders: { 1: 12 },
    extraOrders: { 3: 24 },
    blanks: ['1.S', '1.L', '2.S', '2.C', '2.L', '3.S', '3.C', '3.L'],
  },
  {
    id: 'mf-70425',
    label: 'Coffret chevaliers — réf. 70425',
    colisage: 2,
    sales: [12, 15, 13, 10],
    firstOrder: 12,
    firstDelivery: 26,
    fixedOrders: { 1: 10 },
    // Ventes S46 à déduire : le stock S47 est donné.
    blanks: ['1.S', '1.L', '1.V', '2.C', '2.L', '3.S', '3.C', '3.L'],
  },
  {
    id: 'mf-70431',
    label: 'Hôpital des animaux — réf. 70431',
    colisage: 4,
    sales: [20, 26, 14, 18],
    firstOrder: 24,
    firstDelivery: 32,
    fixedOrders: { 1: 8 },
    blanks: ['1.S', '1.L', '2.S', '2.C', '2.L', '3.S', '3.C', '3.L'],
  },
];

/** Application 2 — janvier, Le Garde-Manger. Livraisons et ventes à reporter depuis les documents. */
const APP2_BLANKS = ['1.S', '1.L', '1.V', '2.S', '2.C', '2.L', '2.V', '3.S', '3.C', '3.L', '3.V'];
export const CADENCIER_APP2: CadencierInput[] = [
  { id: 'gm-cepes', label: 'Sauce aux cèpes', colisage: 4, sales: [12, 15, 13, 4], firstOrder: 24, firstDelivery: 16, fixedOrders: { 1: 8 }, blanks: APP2_BLANKS },
  { id: 'gm-terrine', label: 'Terrine de canard', colisage: 6, sales: [18, 16, 20, 5], firstOrder: 24, firstDelivery: 28, fixedOrders: { 1: 12 }, blanks: APP2_BLANKS },
  { id: 'gm-miel', label: 'Miel de bruyère', colisage: 3, sales: [15, 17, 16, 5], firstOrder: 12, firstDelivery: 24, fixedOrders: { 1: 12 }, blanks: APP2_BLANKS },
];

const WEEK_COLS = ['S', 'C', 'L', 'V'];

/* ======================== Offres de confitures (application 1) ======================== */

interface Offer {
  id: string;
  name: string;
  produit: string;
  grams: number;
  ttc: number;
  ht: number;
  remise: number;
  seuilPort: number;
  port: number;
  delai: string;
  paiement: string;
}
const QTE = 500;
export const OFFERS: Offer[] = [
  { id: 'vergers', name: 'Les Vergers de Combraille', produit: 'Confiture 60 % de fruits', grams: 350, ttc: 6.33, ht: 6.0, remise: 3, seuilPort: 1500, port: 35, delai: '48 h', paiement: '30 jours' },
  { id: 'thaurion', name: 'Confiturerie du Thaurion', produit: 'Confiture cuite au chaudron', grams: 370, ttc: 6.12, ht: 5.8, remise: 4, seuilPort: 1000, port: 30, delai: '72 h', paiement: '30 jours' },
  { id: 'brunet', name: 'Maison Brunet', produit: 'Confiture extra 55 % de fruits', grams: 340, ttc: 5.8, ht: 5.5, remise: 2, seuilPort: 3000, port: 45, delai: '5 jours', paiement: '45 jours' },
];
const r2 = (n: number) => Math.round(n * 100) / 100;
export function offerFigures(o: Offer) {
  const total = r2(o.ht * QTE);
  const reduc = r2((total * o.remise) / 100);
  const net = r2(total - reduc);
  const port = net >= o.seuilPort ? 0 : o.port;
  const montant = r2(net + port);
  const kg = (QTE * o.grams) / 1000;
  return { total, reduc, net, port, montant, kg, auKg: r2(montant / kg) };
}
const euro = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

function offerActivity(o: Offer, n: number) {
  const f = offerFigures(o);
  return {
    id: `d01-a1-${o.id}`,
    kind: 'fields' as const,
    label: `Tableau ${n}`,
    title: `Offre — ${o.name}`,
    instructions: `Complète la fiche de calcul pour une commande de ${QTE} pots (document ${n}). Arrondis au centime.`,
    helps: [
      'Commence par le prix HT : la TVA des confitures est de 5,5 %.',
      'Prix HT = prix TTC ÷ 1,055. Total HT = prix HT × quantité. La réduction s’applique au total HT ; les frais de livraison dépendent du net commercial.',
      `Pour ${o.name} : ${o.ttc.toString().replace('.', ',')} ÷ 1,055 = ${o.ht.toFixed(2).replace('.', ',')} € ; × ${QTE} = ${euro(f.total)} ; réduction ${o.remise} % = ${euro(f.reduc)}.`,
    ] as [string, string, string],
    outcomeIds: R,
    fields: [
      { id: 'produit', label: 'Produit', kind: 'given' as const, value: o.produit },
      { id: 'cont', label: 'Contenance du pot', kind: 'number' as const, answer: o.grams, unit: 'g', explain: `Pot de ${o.grams} g.` },
      { id: 'ttc', label: 'Prix TTC d’un pot', kind: 'number' as const, answer: o.ttc, unit: '€', tolerance: 0.001, explain: `Prix affiché : ${euro(o.ttc)}.` },
      { id: 'ht', label: 'Prix HT d’un pot', kind: 'number' as const, answer: o.ht, unit: '€', tolerance: 0.006, explain: `${o.ttc.toString().replace('.', ',')} ÷ 1,055 = ${o.ht.toFixed(2).replace('.', ',')} €.` },
      { id: 'qte', label: 'Quantité', kind: 'number' as const, answer: QTE, unit: 'pots', explain: `${QTE} pots, tous parfums confondus.` },
      { id: 'total', label: 'Total HT', kind: 'number' as const, answer: f.total, unit: '€', tolerance: 0.01, explain: `${o.ht.toFixed(2).replace('.', ',')} × ${QTE} = ${euro(f.total)}.` },
      { id: 'reduc', label: 'Montant de la réduction', kind: 'number' as const, answer: f.reduc, unit: '€', tolerance: 0.01, explain: `${euro(f.total)} × ${o.remise} % = ${euro(f.reduc)}.` },
      { id: 'net', label: 'Net commercial HT', kind: 'number' as const, answer: f.net, unit: '€', tolerance: 0.01, explain: `${euro(f.total)} − ${euro(f.reduc)} = ${euro(f.net)}.` },
      {
        id: 'port',
        label: 'Frais de livraison',
        kind: 'number' as const,
        answer: f.port,
        unit: '€',
        tolerance: 0.01,
        explain: f.port ? `${euro(f.net)} < ${euro(o.seuilPort)} : frais de ${euro(o.port)}.` : `${euro(f.net)} ≥ ${euro(o.seuilPort)} : livraison offerte.`,
      },
      {
        id: 'delai',
        label: 'Délai de livraison',
        kind: 'choice' as const,
        options: [
          { value: '48 h', label: '48 h' },
          { value: '72 h', label: '72 h' },
          { value: '5 jours', label: '5 jours' },
        ],
        answer: o.delai,
        explain: `Délai annoncé : ${o.delai}.`,
      },
      { id: 'montant', label: 'Montant de la commande HT', kind: 'number' as const, answer: f.montant, unit: '€', tolerance: 0.01, explain: `${euro(f.net)} + ${euro(f.port)} = ${euro(f.montant)}.` },
    ],
  };
}

/* =================================== CHAPITRE =================================== */

export const D01: Chapter = {
  unitId: 'd01',
  fictionNotice:
    'Toupie & Cie, ses magasins, ses marques, ses fournisseurs et ses personnages sont fictifs, comme l’épicerie Le Garde-Manger. Les documents et les chiffres ont été créés pour Rayon.',
  mission:
    "À Toupie & Cie, le samedi des familles attire des clients venus jouer en magasin et d’autres qui ont réservé en ligne. Ton responsable te confie le réassort des jeux d’atelier et la préparation des retraits. Au fil des missions, tu compares les circuits, calcules les quantités, contrôles les engagements du fournisseur et renseignes le client si une référence manque.",
  company: {
    name: 'Toupie & Cie — Guéret',
    tagline: 'Spécialiste du jeu et du jouet de 0 à 14 ans',
    facts: [
      ['Ton poste', 'Élève en PFMP, au rayon et à la réserve'],
      ['Ton tuteur', 'Karim Benali, directeur du magasin'],
      ['Période', 'D’octobre à décembre, avant Noël'],
    ],
  },
  steps: [
    /* =============================== CONTEXTE PROFESSIONNEL =============================== */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Sécuriser les commandes avant le samedi des familles",
      hero: { id: 'd01-hero', alt: 'Une mère et sa fille choisissent une peluche dans le rayon d’un magasin de jouets' },
      message: {
        from: 'Karim Benali',
        role: 'Directeur, Toupie & Cie Guéret',
        text: [
          'Bienvenue chez Toupie & Cie ! Tu arrives au bon moment : d’octobre à décembre, nous réalisons près de la moitié de notre chiffre d’affaires annuel.',
          'Pendant ta PFMP, je veux que tu participes à nos approvisionnements : comprendre nos circuits, passer une commande à notre centrale, contrôler une commande passée en direct chez un fournisseur et préparer les commandes de nos clients du site. Commence par découvrir l’enseigne.',
        ],
      },
      documents: [
        {
          id: "d01-revision-reperes",
          number: 3,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "La centrale regroupe des achats pour plusieurs magasins. En direct, le magasin traite avec le fournisseur.",
                "Une commande par carton se saisit en nombre de cartons. Vérifie combien d’unités contient un carton avant de comparer les offres.",
                "Pour un retrait, compte les produits disponibles et non réservés, vérifie la commande complète, puis confirme au client."
              ]
            }
          ]
        },
        {
          id: 'd01-o-doc1',
          number: 1,
          title: 'Toupie & Cie, le jouet en coopérative',
          look: 'article',
          blocks: [
            {
              type: 'p',
              text: 'Fondée en 1978 par une douzaine de marchands de jouets indépendants, Toupie & Cie réunit aujourd’hui 180 magasins, dont 165 en France et 15 en Belgique et en Suisse, ainsi qu’un site marchand. L’enseigne vend des jeux et des jouets pour les enfants de 0 à 14 ans.',
            },
            {
              type: 'p',
              text: 'Alors que plusieurs chaînes de jouets ont fermé des magasins ces dernières années, Toupie & Cie progresse. Son secret : son modèle coopératif. Chaque magasin appartient à son directeur, qui reste un commerçant indépendant tout en étant associé de la coopérative. Il peut adapter une partie de son assortiment aux habitudes de sa clientèle et gère son magasin comme une véritable entreprise.',
            },
            {
              type: 'p',
              text: 'La coopérative met en commun ce qu’un commerçant seul ne pourrait pas financer : une centrale d’achat, un entrepôt national, une marque propre de jouets en bois (« Atelier Sapin »), le catalogue de Noël, la publicité nationale et le site marchand.',
            },
            {
              type: 'facts',
              items: [
                ['Magasin d’accueil', 'Toupie & Cie, zone commerciale de Guéret (Creuse), 950 m²'],
                ['Effectif', '1 directeur, 6 vendeurs, 2 saisonniers à Noël'],
                ['Concurrents locaux', 'Rayon jouets de l’hypermarché, grande surface spécialisée en jeux vidéo et jouets, sites de vente en ligne'],
              ],
            },
          ],
        },
        {
          id: 'd01-o-doc2',
          number: 2,
          title: 'Interview de la directrice générale du réseau',
          look: 'article',
          source: 'Interview fictive, lettre interne du réseau, septembre N',
          blocks: [
            {
              type: 'quote',
              author: 'Nadia Ferreira, directrice générale de Toupie & Cie',
              text: 'Le transport nous coûte 18 % plus cher que l’an dernier. Nous avons choisi de ne pas répercuter cette hausse sur nos clients : nos prix restent bloqués sur tout le catalogue de Noël. Pour y arriver, la centrale a renégocié ses volumes avec les fabricants et regroupé les livraisons. Les magasins, eux, commandent plus tôt — dès le mois de mai — et reçoivent leurs produits par camions complets.',
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd01-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'À l’aide du document 1, complète la fiche d’identité de ton entreprise d’accueil.',
          helps: [
            'Toutes les réponses se trouvent dans le document 1.',
            'Le type de commerce dépend de qui possède les magasins : une seule entreprise (commerce intégré) ou des commerçants indépendants regroupés (commerce associé).',
            'Le directeur possède son magasin ET il est associé de la coopérative : c’est le commerce associé.',
          ],
          outcomeIds: R,
          fields: [
            { id: 'raison', label: 'Raison sociale (nom de l’enseigne)', kind: 'text', accept: ['Toupie & Cie', 'Toupie et Cie', 'Toupie & compagnie', 'Toupie et compagnie', 'Toupie'], placeholder: 'Nom de l’enseigne', explain: 'L’enseigne s’appelle Toupie & Cie.' },
            {
              id: 'activite',
              label: 'Activité',
              kind: 'choice',
              options: [
                { value: 'vente', label: 'Vente au détail de jeux et jouets pour les 0-14 ans' },
                { value: 'fabrication', label: 'Fabrication de jouets' },
                { value: 'gros', label: 'Vente en gros aux magasins' },
              ],
              answer: 'vente',
              explain: 'Le magasin vend des jouets aux consommateurs finaux : c’est du commerce de détail.',
            },
            {
              id: 'forme',
              label: 'Type de commerce',
              kind: 'choice',
              options: [
                { value: 'integre', label: 'Commerce intégré (succursales)' },
                { value: 'associe', label: 'Commerce associé' },
                { value: 'isole', label: 'Commerce indépendant isolé' },
              ],
              answer: 'associe',
              explain: 'Des commerçants indépendants regroupés dans une coopérative : commerce associé.',
            },
            { id: 'statut', label: 'Statut juridique du réseau', kind: 'given', value: 'Coopérative' },
            { id: 'loc', label: 'Localisation (ville du magasin)', kind: 'text', accept: ['Guéret', 'Gueret', 'Guéret Creuse', 'zone commerciale de Guéret'], placeholder: 'Ville', explain: 'Le magasin est situé dans la zone commerciale de Guéret, dans la Creuse.' },
            {
              id: 'concurrents',
              label: 'Concurrents (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'hyper', label: 'Rayon jouets de l’hypermarché' },
                { value: 'gss', label: 'Grande surface spécialisée' },
                { value: 'web', label: 'Sites de vente en ligne' },
                { value: 'centrale', label: 'Centrale d’achat Toupie & Cie' },
              ],
              answers: ['hyper', 'gss', 'web'],
              explain: 'La centrale d’achat fait partie du réseau : ce n’est pas un concurrent, c’est le fournisseur du magasin.',
            },
          ],
        },
        {
          id: 'd01-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Comprendre l’enseigne',
          instructions: 'Réponds aux questions à l’aide des documents 1 et 2.',
          helps: [
            'Pour les questions 1 et 2, relis le 2e paragraphe du document 1. Pour les questions 3 et 4, le document 2.',
            'Une stratégie de prix « bloqués » consiste à garder le même prix malgré la hausse des coûts. La politique d’approvisionnement, c’est la façon dont le magasin commande et reçoit ses produits.',
            'Les commandes se font dès mai, et la centrale regroupe les livraisons en camions complets.',
          ],
          outcomeIds: R,
          fields: [
            {
              id: 'q1',
              label: '1. Quelle est la particularité des magasins Toupie & Cie au niveau de l’assortiment et de la gestion ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Tous les magasins ont le même assortiment, décidé par le siège.' },
                { value: 'b', label: 'Chaque directeur adapte une partie de son assortiment et gère son magasin comme un chef d’entreprise.' },
                { value: 'c', label: 'Les magasins ne vendent que la marque propre Atelier Sapin.' },
              ],
              answer: 'b',
              explain: 'Le directeur est indépendant : il adapte son assortiment à sa clientèle tout en profitant des moyens de la coopérative.',
            },
            {
              id: 'q2',
              label: '2. À quelle période de l’année la gestion des commandes et des stocks est-elle la plus stratégique ?',
              kind: 'choice',
              options: [
                { value: 'ete', label: 'En juillet-août' },
                { value: 'noel', label: 'D’octobre à décembre, avant Noël' },
                { value: 'rentree', label: 'En septembre' },
              ],
              answer: 'noel',
              explain: 'Près de la moitié du chiffre d’affaires se fait avant Noël : une rupture à ce moment coûte très cher.',
            },
            {
              id: 'q3',
              label: '3. Quelle stratégie de prix l’enseigne a-t-elle choisie face à la hausse du coût du transport ?',
              kind: 'choice',
              options: [
                { value: 'hausse', label: 'Augmenter ses prix de 18 %' },
                { value: 'bloques', label: 'Bloquer ses prix sur tout le catalogue de Noël' },
                { value: 'promo', label: 'Lancer des promotions sur les jouets en bois' },
              ],
              answer: 'bloques',
              explain: 'Les prix restent bloqués : la hausse n’est pas répercutée sur les clients.',
            },
            {
              id: 'q4',
              label: '4. Quelle politique d’approvisionnement lui permet de tenir cet engagement ? (deux réponses)',
              kind: 'multi',
              options: [
                { value: 'tot', label: 'Commander plus tôt, dès le mois de mai' },
                { value: 'camions', label: 'Regrouper les livraisons en camions complets' },
                { value: 'express', label: 'Se faire livrer en express chaque jour' },
                { value: 'stockzero', label: 'Supprimer tout stock en magasin' },
              ],
              answers: ['tot', 'camions'],
              explain: 'Anticiper et regrouper les volumes réduit le coût du transport par produit.',
            },
          ],
        },
      ],
    },

    /* =============================== MISSION 1 =============================== */
    {
      id: 'mission-1',
      kind: 'mission',
      number: 1,
      title: 'Identifier les circuits d’approvisionnement',
      guidance: 'guidé',
      hero: { id: 'd01-entrepot', alt: 'Allée d’un grand entrepôt logistique avec des rayonnages de palettes' },
      message: {
        from: 'Karim Benali',
        role: 'Directeur',
        text: [
          'Toupie & Cie est une coopérative : chaque magasin est un adhérent et reste une entreprise indépendante. En tant que directeur, je décide moi-même de mes achats. Je peux commander soit auprès de notre centrale d’achat, soit directement chez un fabricant.',
          'Nous avons aussi un site marchand avec un service « Réservé, retiré » : le client retire son achat au magasin de son choix sous 2 heures. Il faut donc avoir le bon produit, en bonne quantité, au bon moment et au bon endroit.',
          'Après avoir lu les documents 1 et 2, complète les deux circuits d’approvisionnement que nous utilisons (annexe 1), puis indique les avantages et les inconvénients de chacun pour notre magasin (annexe 2).',
        ],
      },
      documents: [
        {
          id: 'd01-m1-doc1',
          number: 1,
          title: 'Les canaux de distribution',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Le canal de distribution désigne le chemin qu’emprunte un produit entre celui qui le fabrique et celui qui l’achète pour l’utiliser : le consommateur final. On le classe selon le nombre d’intermédiaires.' },
            {
              type: 'list',
              items: [
                'Canal direct : aucun intermédiaire. Un apiculteur vend lui-même son miel sur le marché ; un artisan vend ses meubles dans son atelier.',
                'Canal court : un seul intermédiaire, le détaillant. Le fabricant livre le magasin, qui vend au client. Le magasin sélectionne lui-même ses produits, souvent de qualité ou exclusifs, et peut négocier en direct les prix, les quantités, les délais de livraison et de paiement. Il peut aussi signer un contrat d’exclusivité avec une marque. En contrepartie, il assume la gestion administrative des commandes et parfois un stock important.',
                'Canal long : au moins deux intermédiaires entre le fabricant et le consommateur, par exemple un grossiste ou une centrale d’achat, puis un magasin. Chaque étape ajoute des coûts et peut faire monter le prix final ; l’origine et la qualité du produit deviennent aussi moins lisibles. De plus en plus de consommateurs réclament davantage de transparence et un meilleur respect de l’environnement.',
              ],
            },
          ],
        },
        {
          id: 'd01-m1-doc2',
          number: 2,
          title: 'Le rôle de la centrale d’achat',
          look: 'texte',
          blocks: [
            { type: 'image', image: { id: 'd01-entrepot-2', alt: 'Entrepôt d’une centrale d’achat : palettes de cartons et chariot élévateur' }, float: true },
            { type: 'p', text: 'Une centrale d’achat regroupe les commandes d’un ensemble de magasins. Grâce aux volumes obtenus, elle décroche de meilleures conditions commerciales : remises, délais de livraison, délais de paiement.' },
            { type: 'p', text: 'En général, la centrale recherche les fournisseurs, les référence (inscrit leurs produits au catalogue), négocie les conditions et réalise les achats. Les fabricants livrent le plus souvent l’entrepôt de la centrale ; les magasins passent ensuite commande auprès de leur centrale et sont livrés « à la demande », ce qui allège la gestion de leurs stocks.' },
          ],
        },
        {
          id: "d01-revision-1-doc",
          number: 3,
          title: "Comparer deux circuits pour un même atelier",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Une livraison est nécessaire vendredi à 15 h au plus tard. Besoin de 24 jeux Mémo. Les unités restantes seront vendues le mois prochain."
            },
            {
              type: "table",
              head: [
                "Solution",
                "Conditionnement",
                "Prix par unité HT",
                "Frais HT",
                "Arrivée confirmée"
              ],
              rows: [
                [
                  "Centrale",
                  "Cartons de 12",
                  "6,10 €",
                  "0 €",
                  "Jeudi à 16 h"
                ],
                [
                  "Fabricant local",
                  "Cartons de 8",
                  "5,80 €",
                  "14 €",
                  "Vendredi à 17 h"
                ]
              ]
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd01-m1-a1',
          kind: 'circuit',
          label: 'Annexe 1',
          title: 'L’approvisionnement de Toupie & Cie Guéret',
          instructions: 'Pour chaque circuit, place les acteurs du fabricant au consommateur, puis indique le type de canal. Les marchandises descendent, l’argent remonte.',
          helps: [
            'Un des deux circuits passe par la centrale d’achat, l’autre non.',
            'Compte les intermédiaires entre le fabricant et le consommateur : un seul = canal court ; deux ou plus = canal long.',
            'Circuit A : fabricant Mondo Figs → magasin → consommateur. Circuit B : fabricant Atelier Sapin → centrale d’achat → magasin → consommateur.',
          ],
          outcomeIds: R,
          circuits: [
            {
              id: 'A',
              typeAnswer: 'court',
              typeOptions: CANAUX,
              slots: [{ id: '1', answer: 'fab-mf' }, { id: '2', fixed: 'Toupie & Cie Guéret' }, { id: '3', answer: 'conso' }],
              slotOptions: [
                { value: 'fab-mf', label: 'Fabricant Mondo Figs (figurines)' },
                { value: 'centrale', label: 'Centrale d’achat Toupie & Cie' },
                { value: 'conso', label: 'Consommateur' },
              ],
              explain: 'Mondo Figs livre directement le magasin : un seul intermédiaire, c’est un canal court.',
            },
            {
              id: 'B',
              typeAnswer: 'long',
              typeOptions: CANAUX,
              slots: [{ id: '1', answer: 'fab-as' }, { id: '2', answer: 'centrale' }, { id: '3', fixed: 'Toupie & Cie Guéret' }, { id: '4', answer: 'conso' }],
              slotOptions: [
                { value: 'fab-as', label: 'Fabricant Atelier Sapin (Vosges)' },
                { value: 'centrale', label: 'Centrale d’achat Toupie & Cie' },
                { value: 'conso', label: 'Consommateur' },
              ],
              explain: 'Le produit passe par la centrale puis par le magasin : deux intermédiaires, c’est un canal long.',
            },
          ],
        },
        {
          id: 'd01-m1-a2',
          kind: 'classify',
          label: 'Annexe 2',
          title: 'Les atouts et les limites des deux canaux pour Toupie & Cie Guéret',
          instructions: 'Classe chaque affirmation dans la bonne case du tableau.',
          helps: [
            'Demande-toi qui fait le travail : le magasin seul (canal court) ou la centrale (canal long) ?',
            'Le regroupement des volumes est le grand atout de la centrale ; le choix et la négociation directe sont ceux du canal court.',
            'Les limites du canal court concernent la charge de travail et le stock ; celles du canal long, le prix et la liberté de choix.',
          ],
          outcomeIds: R,
          categories: [
            { id: 'c-av', label: 'Avantage', group: 'Canal court' },
            { id: 'c-in', label: 'Inconvénient', group: 'Canal court' },
            { id: 'l-av', label: 'Avantage', group: 'Canal long' },
            { id: 'l-in', label: 'Inconvénient', group: 'Canal long' },
          ],
          items: [
            { id: 'i1', text: 'Le magasin négocie lui-même les prix, les quantités et les délais avec le fabricant.', answer: 'c-av', explain: 'Sans intermédiaire, la négociation est directe.' },
            { id: 'i2', text: 'Le magasin peut obtenir une exclusivité sur une marque dans sa zone.', answer: 'c-av', explain: 'Un accord direct permet ce type de contrat.' },
            { id: 'i3', text: 'Le magasin propose des produits qu’il a sélectionnés lui-même.', answer: 'c-av', explain: 'Le choix des produits revient au magasin.' },
            { id: 'i4', text: 'Le magasin gère seul les commandes, les factures et les relances.', answer: 'c-in', explain: 'Le travail administratif n’est pas pris en charge par une centrale.' },
            { id: 'i5', text: 'Les quantités minimales imposées par le fabricant obligent à stocker davantage.', answer: 'c-in', explain: 'Sans livraison à la demande, le stock en réserve augmente.' },
            { id: 'i6', text: 'Les commandes regroupées des 180 magasins permettent d’obtenir de meilleures remises.', answer: 'l-av', explain: 'C’est la raison d’être d’une centrale d’achat.' },
            { id: 'i7', text: 'Le magasin est livré chaque semaine selon ses besoins et stocke moins.', answer: 'l-av', explain: 'L’entrepôt de la centrale joue le rôle de réserve.' },
            { id: 'i8', text: 'Le référencement et la négociation sont faits par la centrale : le directeur gagne du temps.', answer: 'l-av', explain: 'La centrale prend en charge la recherche des fournisseurs.' },
            { id: 'i9', text: 'Chaque intermédiaire supplémentaire peut augmenter le prix final.', answer: 'l-in', explain: 'Chaque intermédiaire se rémunère.' },
            { id: 'i10', text: 'Le magasin ne peut commander que les produits référencés par la centrale.', answer: 'l-in', explain: 'Le choix des fournisseurs est fait par la centrale.' },
          ],
        },
        {
          id: 'd01-m1-a3',
          kind: 'open',
          label: 'Annexe 3',
          title: 'Conseiller le directeur',
          instructions: 'Rédige une réponse argumentée de quelques lignes.',
          helps: [
            'Pense au type de produits : marque propre exclusive d’un côté, marque partenaire de l’autre.',
            'Les produits Atelier Sapin ne s’achètent qu’à la centrale ; les figurines Mondo Figs sont commandées en direct grâce à un accord.',
            'Structure possible : « Les deux canaux sont complémentaires : … pour …, car … ; … pour …, car … ».',
          ],
          outcomeIds: R,
          prompts: [{ id: 'conseil', label: 'Le magasin devrait-il tout acheter à la centrale ? Justifie en t’appuyant sur les deux canaux.', lines: 5 }],
          selfCheck: ['J’ai donné mon avis clairement.', 'J’ai cité au moins un avantage de chaque canal.', 'J’ai utilisé un exemple de produit du magasin.'],
        },
        {
          id: "d01-revision-1",
          label: "Annexe complémentaire",
          title: "Comparer deux circuits pour un même atelier",
          instructions: "Lis le document 3. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Le circuit à retenir doit respecter l’échéance avant toute comparaison des coûts.",
            "Relis le document 3 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "24 × 6,10 = 146,40 € HT."
          ],
          outcomeIds: [
            "d01-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel est le coût total par la centrale en euros HT ?",
              kind: "number",
              answer: 146.4,
              explain: "24 × 6,10 = 146,40 € HT."
            },
            {
              id: "q2",
              label: "Quel est le coût total par le fabricant en euros HT ?",
              kind: "number",
              answer: 153.2,
              explain: "24 × 5,80 + 14 = 153,20 € HT."
            },
            {
              id: "q3",
              label: "Rédige le conseil au responsable et indique quel changement permettrait de rouvrir la comparaison.",
              kind: "written",
              lines: 3,
              model: "Je retiens la centrale. Elle livre jeudi et coûte 146,40 € HT. On réétudierait le fabricant si le délai devenait compatible et si ses conditions rendaient le coût complet ou le service plus intéressant."
            }
          ]
        },
      ],
    },

    /* =============================== MISSION 2 =============================== */
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Établir une commande auprès d’une centrale d’achat',
      guidance: 'guidé',
      message: {
        from: 'Karim Benali',
        role: 'Directeur',
        text: [
          'Chez Toupie & Cie, nous commandons nos produits six mois à l’avance pour avoir les marchandises de fin d’année. Nous commandons notamment auprès de la centrale les produits de notre marque propre Atelier Sapin : des jeux et jouets en bois fabriqués par un atelier des Vosges.',
          'Aujourd’hui, il faut commander le seau de 150 blocs en hêtre, une de nos meilleures ventes. Avec les documents 1 à 4, calcule les prévisions de vente (annexe 1), puis passe la commande sur l’extranet de la centrale (annexe 2).',
        ],
      },
      documents: [
        {
          id: 'd01-m2-doc1',
          number: 1,
          title: 'Le seau de 150 blocs en hêtre',
          look: 'fiche',
          blocks: [
            { type: 'image', image: { id: 'd01-blocs-cut', alt: 'Jeu de construction : blocs en bois naturel de différentes formes' }, float: true },
            { type: 'note', text: 'Univers de produits : jeux et jouets en bois' },
            {
              type: 'p',
              text: 'Seau de 150 blocs en hêtre non traité : cubes, arches, cylindres, triangles et planchettes à empiler pour construire tours, ponts, maisons ou châteaux. Les pièces se rangent dans un seau en carton recyclé avec poignée, pratique pour le transport. Un livret présente 20 modèles de difficulté croissante. Ce jeu développe la motricité fine, la concentration et la créativité de l’enfant. Dès 2 ans.',
            },
            {
              type: 'facts',
              items: [
                ['Référence centrale', 'AS-150B'],
                ['Dimensions du seau', '24 × 24 × 30 cm'],
                ['Prix de vente TTC', '29,90 €'],
                ['Coefficient multiplicateur', '1,6'],
              ],
            },
          ],
        },
        {
          id: 'd01-m2-doc2',
          number: 2,
          title: 'Éléments à prendre en compte pour déterminer le nombre de seaux à commander',
          look: 'memo',
          blocks: [
            { type: 'p', text: 'Atelier Sapin est une marque française distribuée exclusivement par Toupie & Cie, très appréciée des clients. Le seau de 150 blocs figure dans la sélection du catalogue de Noël. Les produits du catalogue se commandent obligatoirement à la centrale : ce sont des produits de qualité que les clients viendront demander, le magasin doit les avoir en rayon.' },
            {
              type: 'table',
              head: ['', 'Magasin', 'Réservé, retiré (site)'],
              rows: [
                ['Ventes réalisées en N-1 (quantité)', '40', '6'],
                ['Prévision des ventes pour N', '+ 10 %', '+ 50 %'],
                ['Fréquence des livraisons', '1 fois par semaine', '1 fois par semaine'],
                ['Colisage (produits par carton)', '4', '4'],
              ],
            },
          ],
        },
        {
          id: 'd01-m2-doc3',
          number: 3,
          title: 'Informations transmises par le siège',
          look: 'procedure',
          blocks: [
            { type: 'image', image: { id: 'd01-clavier', alt: 'Mains sur le clavier d’un ordinateur portable pendant une saisie de commande' }, float: true },
            {
              type: 'list',
              title: 'Procédure de commande à la centrale Toupie & Cie',
              items: [
                'Se connecter à l’extranet Toupie Pro avec l’identifiant du magasin.',
                'Cliquer sur « Commandes ».',
                'Rechercher le produit par univers.',
                'Respecter le colisage : la quantité est saisie à l’unité. Si le colisage est de 4, le carton contient 4 produits : on commande 4, 8, 12…',
                'Valider la commande.',
                'Vérifier la confirmation de commande reçue par courriel.',
                'La commande est transmise immédiatement à la centrale et traitée sous 2 jours ouvrés.',
              ],
            },
          ],
        },
        {
          id: 'd01-m2-doc4',
          number: 4,
          title: 'Rappel sur le coefficient multiplicateur',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Le coefficient multiplicateur permet à une entreprise commerciale de fixer le prix de vente toutes taxes comprises (PV TTC) d’un produit à partir de son prix d’achat hors taxes (PA HT).' },
            { type: 'formula', text: 'PV TTC = PA HT × coefficient\nPA HT = PV TTC ÷ coefficient', example: 'un commerçant achète un produit 10 € HT et applique un coefficient de 2 : il le revend 2 × 10 = 20 € TTC.' },
          ],
        },
        {
          id: "d01-revision-2-doc",
          number: 5,
          title: "Préparer le réassort des jeux d’atelier",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’extranet affiche 19 jeux Mémo en stock, dont 3 abîmés. Huit jeux en stock sont déjà réservés. Un carton de 12 est confirmé pour jeudi. Il faut 32 jeux libres vendredi pour l’atelier et les ventes. La centrale accepte les commandes par carton de 12."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd01-m2-a1',
          kind: 'fields',
          layout: 'columns',
          columns: ['Magasin', 'Réservé, retiré'],
          label: 'Annexe 1',
          title: 'Prévision des ventes du seau de 150 blocs',
          instructions: 'Complète le tableau. Arrondis les quantités à l’entier supérieur et les montants au centime.',
          helps: [
            'Une hausse de 10 % : on multiplie par 1,10. Une hausse de 50 % : par 1,50.',
            'Additionne les deux prévisions, puis prends le premier multiple de 4 supérieur ou égal. PA HT = PV TTC ÷ coefficient (document 4).',
            'Magasin : 40 × 1,10 = 44. Site : 6 × 1,50 = 9. Total 53, soit 56 avec le colisage. PA HT : 29,90 ÷ 1,6. Montant : 56 × PA HT.',
          ],
          outcomeIds: R,
          fields: [
            { id: 'prev.0', label: 'Nombre de ventes prévues en N (quantité)', kind: 'number', answer: 44, explain: 'Magasin : 40 × 1,10 = 44.' },
            { id: 'prev.1', label: 'Nombre de ventes prévues en N (quantité)', kind: 'number', answer: 9, explain: 'Site : 6 × 1,50 = 9.' },
            { id: 'tot', label: 'Total à commander (arrondi selon le colisage)', kind: 'number', answer: 56, explain: '44 + 9 = 53 ; le premier multiple de 4 supérieur ou égal est 56 (14 cartons).' },
            { id: 'pv', label: 'PV TTC', kind: 'number', answer: 29.9, unit: '€', explain: 'Donné par le document 1 : 29,90 €.' },
            { id: 'coef', label: 'Coefficient multiplicateur appliqué', kind: 'number', answer: 1.6, explain: 'Donné par le document 1 : 1,6.' },
            { id: 'pa', label: 'PA HT', kind: 'number', answer: 18.69, unit: '€', tolerance: 0.011, explain: '29,90 ÷ 1,6 = 18,6875, soit 18,69 €.' },
            { id: 'mt', label: 'Montant de la commande HT en N', kind: 'number', answer: 1046.64, unit: '€', tolerance: 0.15, explain: '56 × 18,69 = 1 046,64 € (1 046,50 € avec 18,6875 : accepté).' },
          ],
        },
        {
          id: 'd01-m2-a2',
          kind: 'fields',
          layout: 'extranet',
          label: 'Annexe 2',
          title: 'Saisie de la commande sur l’extranet',
          instructions: 'Remplis la ligne de commande comme sur l’extranet Toupie Pro.',
          helps: [
            'Univers, référence et colisage figurent dans les documents 1 et 2.',
            'La quantité saisie est celle qui respecte le colisage, pas la prévision brute.',
            'Jeux et jouets en bois · AS-150B · colisage 4 · quantité 56 · PA HT 18,69 € · total 1 046,64 €.',
          ],
          outcomeIds: R,
          fields: [
            {
              id: 'univ',
              label: 'Univers',
              kind: 'choice',
              options: [
                { value: 'bois', label: 'Jeux et jouets en bois' },
                { value: 'construction', label: 'Construction plastique' },
                { value: 'eveil', label: 'Éveil premier âge' },
              ],
              answer: 'bois',
              explain: 'Le produit appartient à l’univers « Jeux et jouets en bois ».',
            },
            { id: 'desig', label: 'Désignation', kind: 'text', accept: ['Seau de 150 blocs en hêtre', 'Seau 150 blocs en hêtre', 'Seau de 150 blocs', 'Seau 150 blocs hêtre', 'Seau 150 blocs'], placeholder: 'Nom du produit', explain: 'Seau de 150 blocs en hêtre.' },
            {
              id: 'ref',
              label: 'Référence',
              kind: 'choice',
              options: [
                { value: 'AS-150B', label: 'AS-150B' },
                { value: 'AS-200P', label: 'AS-200P' },
                { value: 'MF-70412', label: 'MF-70412' },
              ],
              answer: 'AS-150B',
              explain: 'Référence centrale : AS-150B.',
            },
            { id: 'col', label: 'Colisage', kind: 'number', answer: 4, explain: '4 seaux par carton.' },
            { id: 'qte', label: 'Quantité', kind: 'number', answer: 56, explain: '56 seaux = 14 cartons de 4.' },
            { id: 'pa', label: 'Prix d’achat HT', kind: 'number', answer: 18.69, unit: '€', tolerance: 0.011, explain: '29,90 ÷ 1,6 = 18,69 €.' },
            { id: 'tht', label: 'Total HT', kind: 'number', answer: 1046.64, unit: '€', tolerance: 0.15, explain: '56 × 18,69 = 1 046,64 €.' },
          ],
        },
        {
          id: 'd01-m2-a3',
          kind: 'fields',
          label: 'À toi de jouer',
          title: 'Les centrales d’achat en question',
          instructions: 'Vérifie que tu as compris le fonctionnement d’une centrale d’achat.',
          helps: ['Relis le document 2 de la mission 1.', 'Une centrale existe parce que ses adhérents achètent ensemble.', 'Les volumes regroupés donnent du poids dans la négociation.'],
          outcomeIds: R,
          fields: [
            {
              id: 'c1',
              label: 'Pourquoi une centrale obtient-elle de meilleures conditions qu’un magasin seul ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Parce qu’elle achète de gros volumes pour plusieurs magasins.' },
                { value: 'b', label: 'Parce qu’elle fabrique elle-même les produits.' },
                { value: 'c', label: 'Parce qu’elle ne paie pas la TVA.' },
              ],
              answer: 'a',
              explain: 'Le regroupement des commandes donne du poids face aux fabricants.',
            },
            {
              id: 'c2',
              label: 'Qui référence les produits Atelier Sapin ?',
              kind: 'choice',
              options: [
                { value: 'mag', label: 'Le directeur du magasin de Guéret' },
                { value: 'centrale', label: 'La centrale d’achat Toupie & Cie' },
                { value: 'client', label: 'Les clients du site' },
              ],
              answer: 'centrale',
              explain: 'La centrale inscrit les produits au catalogue de l’enseigne.',
            },
            {
              id: 'c3',
              label: 'Les acheteurs publics (écoles, mairies, hôpitaux) peuvent eux aussi passer par une centrale d’achat. Vrai ou faux ?',
              kind: 'choice',
              options: [
                { value: 'vrai', label: 'Vrai' },
                { value: 'faux', label: 'Faux' },
              ],
              answer: 'vrai',
              explain: 'Il existe des centrales d’achat publiques : le principe du regroupement des achats est le même.',
            },
          ],
        },
        {
          id: "d01-revision-2",
          label: "Annexe complémentaire",
          title: "Préparer le réassort des jeux d’atelier",
          instructions: "Lis le document 5. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Sépare la quantité physiquement présente de celle qui est libre pour l’atelier.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "19 − 3 − 8 = 8 jeux libres."
          ],
          outcomeIds: [
            "d01-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien de jeux sont libres immédiatement ?",
              kind: "number",
              answer: 8,
              explain: "19 − 3 − 8 = 8 jeux libres."
            },
            {
              id: "q2",
              label: "Combien de cartons supplémentaires faut-il commander ?",
              kind: "number",
              answer: 1,
              explain: "8 + 12 = 20 jeux libres attendus. Le manque de 12 correspond à un carton."
            },
            {
              id: "q3",
              label: "Écris une ligne de saisie et le point de contrôle à prévoir jeudi.",
              kind: "written",
              lines: 3,
              model: "Mémo, 1 carton de 12 unités. Je vérifie que le carton attendu jeudi a bien été reçu et que les 8 réservations restent isolées avant de promettre du stock aux visiteurs."
            }
          ]
        },
      ],
    },

    /* =============================== MISSION 3 =============================== */
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Établir une commande en direct auprès d’un fournisseur',
      guidance: 'accompagné',
      hero: { id: 'd01-figurines', alt: 'Rayon de boîtes de jeux de figurines dans un magasin de jouets' },
      message: {
        from: 'Karim Benali',
        role: 'Directeur',
        text: [
          'Le magasin de Guéret a l’exclusivité d’être « magasin expert Mondo Figs » dans la Creuse. Nous avons signé un accord commercial avec la marque : chaque partie doit respecter ses engagements (document 1).',
          'J’ai passé une commande annuelle auprès de ce fournisseur. Je mets à ta disposition le bon de commande (document 3) et le bilan de l’an dernier (document 2). Vérifie que les engagements ont bien été respectés et complète l’annexe.',
        ],
      },
      documents: [
        {
          id: 'd01-m3-doc1',
          number: 1,
          title: 'Extrait de l’accord commercial « magasin expert »',
          look: 'contrat',
          blocks: [
            {
              type: 'list',
              title: 'Le magasin expert s’engage à :',
              items: [
                'réaliser un chiffre d’affaires minimum de 25 000 € par an avec la marque ;',
                'implanter la marchandise sur au moins 40 mètres linéaires ;',
                'avoir en magasin, toute l’année, au moins 60 % des références de la marque ;',
                'avoir en magasin au moins 90 % des nouveautés ;',
                'avoir en magasin au moins 50 % des produits « licence » (sous licence de films et dessins animés).',
              ],
            },
            {
              type: 'list',
              title: 'Conditions en termes de communication :',
              items: [
                'mettre le catalogue Mondo Figs à disposition des clients, à l’entrée du magasin et dans le rayon, sur le présentoir dédié ;',
                'afficher la publicité et l’information sur le lieu de vente dans l’espace Mondo Figs ;',
                'installer les maquettes de démonstration dans l’espace Mondo Figs ;',
                'consacrer une double page du catalogue de Noël du magasin aux produits de la marque.',
              ],
            },
            {
              type: 'list',
              title: 'Le fournisseur s’engage à :',
              items: [
                'répondre à la demande du magasin ;',
                'livrer des produits conformes (composition, qualité, emballage, étiquetage, sécurité, code EAN) ;',
                'accorder une remise « partenaire expert » de 2 % sur chaque commande ;',
                'accorder une remise supplémentaire selon le chiffre d’affaires réalisé en N-1, calculée sur le net commercial :',
              ],
            },
            {
              type: 'table',
              head: ['CA N-1 avec la marque', 'Remise supplémentaire'],
              rows: [
                ['De 0 € à 25 000 €', '0 %'],
                ['De 25 001 € à 50 000 €', '1 %'],
                ['De 50 001 € à 75 000 €', '1,5 %'],
                ['À partir de 75 001 €', '2 %'],
              ],
            },
            {
              type: 'list',
              title: 'Conditions en termes de communication (fournisseur) :',
              items: [
                'approvisionner le magasin en catalogues toute l’année et fournir un présentoir ;',
                'fournir la PLV en quantité suffisante pour les promotions de Pâques et de Noël ;',
                'envoyer des maquettes de démonstration des nouveautés de Noël.',
              ],
            },
          ],
        },
        {
          id: 'd01-m3-doc2',
          number: 2,
          title: 'Bilan de l’année N-1 pour la marque Mondo Figs',
          look: 'memo',
          blocks: [
            {
              type: 'facts',
              items: [
                ['Chiffre d’affaires réalisé dans le rayon', '58 000 €'],
                ['Linéaire attribué à la marque', '36 m'],
                ['Références en magasin', '65 %'],
                ['Nouveautés en magasin', '88 %'],
                ['Produits « licence » en magasin', '42 %'],
              ],
            },
          ],
        },
        {
          id: 'd01-m3-doc3',
          number: 3,
          title: 'Bon de commande n° MF-2611-084',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Facturé à', 'Toupie & Cie — ZC du Verger, 23000 Guéret'], ['Fournisseur', 'Mondo Figs SAS']] },
            {
              type: 'table',
              head: ['', 'Montants'],
              align: ['left', 'right'],
              rows: [
                ['Total HT', '60 000,00 €'],
                ['Remise 2 % partenaire expert', '1 200,00 €'],
                ['Net commercial', '58 800,00 €'],
                ['Remise 2 % CA', '1 176,00 €'],
                ['Total HT', '57 624,00 €'],
                ['TVA (20 %)', '11 524,80 €'],
                ['Total TTC', '69 148,80 €'],
              ],
            },
          ],
        },
        {
          id: "d01-revision-3-doc",
          number: 4,
          title: "Contrôler la confirmation du fournisseur direct",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Bon envoyé le lundi. Référence PU36, 30 puzzles à 7,20 € HT, remise de 5 % sur les produits, port de 12 € HT, livraison vendredi. Confirmation reçue mardi. Référence PU63, 30 puzzles à 7,20 € HT, port de 12 € HT, remise absente, livraison vendredi."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd01-m3-a1',
          kind: 'fields',
          layout: 'checklist',
          label: 'Annexe',
          title: 'Respect de l’accord commercial',
          instructions: 'Compare l’accord (document 1), le bilan N-1 (document 2) et le bon de commande (document 3). Coche Oui ou Non et détaille les calculs.',
          helps: [
            'Compare chaque chiffre du bilan au minimum de l’accord. Pour la remise supplémentaire, cherche d’abord la tranche du CA N-1.',
            'Le CA N-1 est de 58 000 € : dans quelle tranche ? La remise se calcule sur le net commercial (58 800 €).',
            '58 000 € → tranche 50 001–75 000 € → 1,5 %. 58 800 × 1,5 % = 882 €. Total HT correct : 58 800 − 882 = 57 918 €.',
          ],
          outcomeIds: R,
          fields: [
            { id: 'ca', label: 'Chiffre d’affaires minimum', kind: 'choice', options: OUI_NON, answer: 'oui', explain: '58 000 € ≥ 25 000 € : respecté.' },
            { id: 'r1', label: 'Remise de 2 % appliquée correctement', kind: 'choice', options: OUI_NON, answer: 'oui', explain: '60 000 × 2 % = 1 200 € : correct.' },
            { id: 'r1calc', label: 'Détail du calcul : montant de la remise partenaire', kind: 'number', answer: 1200, unit: '€', explain: '60 000 × 2 % = 1 200 €.' },
            { id: 'r2', label: 'Remise supplémentaire par tranche de CA appliquée correctement', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Le fournisseur a appliqué 2 % alors que 58 000 € de CA donne droit à 1,5 %.' },
            { id: 'taux', label: 'Détail du calcul : taux réellement applicable', kind: 'number', answer: 1.5, unit: '%', explain: 'Tranche 50 001–75 000 € : 1,5 %.' },
            { id: 'mtr2', label: 'Détail du calcul : montant correct de la remise', kind: 'number', answer: 882, unit: '€', tolerance: 0.01, explain: '58 800 × 1,5 % = 882 €.' },
            { id: 'net', label: 'Détail du calcul : total HT correct', kind: 'number', answer: 57918, unit: '€', tolerance: 0.01, explain: '58 800 − 882 = 57 918 €.' },
            { id: 'ttc', label: 'Détail du calcul : total TTC correct', kind: 'number', answer: 69501.6, unit: '€', tolerance: 0.01, explain: '57 918 × 1,20 = 69 501,60 €.' },
            { id: 'refs', label: 'Pourcentage minimum de références et de nouveautés en rayon', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Références : 65 % ≥ 60 %, mais nouveautés : 88 % < 90 %. L’engagement n’est pas entièrement tenu.' },
            { id: 'lic', label: 'Pourcentage minimum de produits « licence »', kind: 'choice', options: OUI_NON, answer: 'non', explain: '42 % < 50 % : non respecté.' },
            { id: 'ml', label: 'Nombre minimum de mètres linéaires', kind: 'choice', options: OUI_NON, answer: 'non', explain: '36 m < 40 m : il manque 4 mètres.' },
          ],
        },
        {
          id: 'd01-m3-a2',
          kind: 'open',
          label: 'Annexe (suite)',
          title: 'Ton analyse pour le directeur',
          instructions: 'Réponds comme si tu préparais une note pour Karim Benali.',
          helps: [
            'Pars des engagements non respectés : nouveautés, licences, linéaires.',
            'Pour l’intérêt du partenariat, pense aux remises, à la PLV, aux maquettes, à l’exclusivité locale. Pour les linéaires : la place prise par une marque est retirée aux autres.',
            'Exemple : référencer les nouveautés et licences manquantes avant Noël, gagner 4 m en réorganisant le rayon. Signaler l’erreur de remise au fournisseur.',
          ],
          outcomeIds: R,
          prompts: [
            { id: 'actions', label: 'Actions à mener par le magasin pour respecter tous ses engagements et atteindre l’objectif', lines: 4 },
            { id: 'erreur', label: 'Que faire concernant l’erreur sur la remise ?', lines: 2 },
            { id: 'interet', label: 'Quel est l’intérêt pour le magasin d’une telle collaboration avec Mondo Figs ?', lines: 4 },
            { id: 'lineaires', label: 'Quelles sont les conséquences, pour le magasin, en termes de mètres linéaires occupés ?', lines: 3 },
          ],
          selfCheck: [
            'J’ai cité les trois engagements non respectés.',
            'J’ai proposé une action concrète pour chacun.',
            'J’ai indiqué qu’il faut signaler l’erreur au fournisseur.',
            'J’ai donné au moins deux avantages du partenariat et une contrainte.',
          ],
        },
        {
          id: "d01-revision-3",
          label: "Annexe complémentaire",
          title: "Contrôler la confirmation du fournisseur direct",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Vérifie séparément la référence, les lignes de prix et la date.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "30 × 7,20 × 0,95 + 12 = 217,20 €."
          ],
          outcomeIds: [
            "d01-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel total HT devrait figurer sur la confirmation ?",
              kind: "number",
              answer: 217.2,
              explain: "30 × 7,20 × 0,95 + 12 = 217,20 €."
            },
            {
              id: "q2",
              label: "Rédige le courriel de demande de rectification.",
              kind: "written",
              lines: 3,
              model: "Bonjour, notre bon porte sur 30 puzzles PU36 et prévoit 5 % de remise. Votre confirmation mentionne PU63 et omet la remise. Merci d’adresser une confirmation corrigée à 217,20 € HT, port compris, en confirmant la livraison vendredi."
            }
          ]
        },
      ],
    },

    /* =============================== MISSION 4 =============================== */
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Préparer une commande issue de l’omnicanal',
      guidance: 'autonome',
      hero: { id: 'd01-retrait', alt: 'Une cliente consulte son smartphone en tenant un sac de courses devant un magasin' },
      message: {
        from: 'Karim Benali',
        role: 'Directeur',
        text: [
          'Nous sommes en novembre, la saison bat son plein. Les clients viennent avec le catalogue de Noël pour acheter leurs jouets. Ils peuvent aussi commander sur le site et venir retirer leurs produits dans les deux heures : c’est le service « Réservé, retiré ».',
          'Comme magasin expert Mondo Figs, nous générons un trafic plus important lié à cette marque, y compris en retrait de commandes web.',
          'Je suis absent aujourd’hui. Commence à anticiper les commandes : prends d’abord connaissance du fonctionnement du site (document 1) et complète l’annexe 1. Ensuite, avec les documents 2 et 3, remplis le cadencier de novembre (annexe 2).',
        ],
      },
      documents: [
        {
          id: 'd01-m4-doc1',
          number: 1,
          title: 'Toupie & Cie accélère sur l’omnicanal',
          look: 'article',
          source: 'Article fictif, lettre interne du réseau',
          blocks: [
            { type: 'p', text: 'Pionnière de la vente de jouets en ligne parmi les enseignes indépendantes, Toupie & Cie a entièrement rénové son site pour accélérer sa stratégie omnicanale.' },
            {
              type: 'quote',
              author: 'Nadia Ferreira, directrice générale',
              text: 'Nos adhérents ont vite compris qu’Internet pouvait être une vitrine et un moyen de communication pour l’enseigne, et qu’il renforçait notre réseau de magasins. Nous voulons proposer à la fois la livraison à domicile et la réservation d’un jouet en magasin.',
            },
            { type: 'p', text: 'Lors d’un retrait en magasin, le jouet est prélevé dans le stock du magasin et le paiement est encaissé dans sa caisse. Le stock de chaque magasin est affiché en ligne ; il est actualisé toutes les 5 minutes, et presque en temps réel à l’approche de Noël. Le site propose 9 000 références ; chaque magasin en possède entre 10 000 et 13 000, qui restent visibles en ligne.' },
            { type: 'p', text: 'Avec 180 magasins, la plupart des familles disposent d’un point de retrait à moins de 30 minutes de chez elles.' },
          ],
        },
        {
          id: 'd01-m4-doc2',
          number: 2,
          title: 'Le cadencier',
          look: 'procedure',
          blocks: [
            { type: 'p', text: 'Le cadencier permet de gérer les stocks en tenant compte de la fréquence des mouvements de marchandises (entrées et sorties). L’objectif est d’éviter les ruptures de stock ou, à l’inverse, le surstockage. Le principe repose sur la connaissance de la cadence des ventes et du niveau moyen des stocks, afin de déclencher les commandes.' },
            { type: 'note', text: 'Les livraisons sont réalisées une semaine après les commandes.' },
            {
              type: 'table',
              head: ['Case', 'Calcul'],
              rows: [
                ['Stock (S)', 'Stock de la semaine précédente + livraison de la semaine précédente − ventes de la semaine précédente'],
                ['Ventes (V)', 'Stock de la semaine + livraison de la semaine − stock de la semaine suivante'],
                ['Livraison (L)', 'À reporter du bon de livraison (= commande de la semaine précédente)'],
                ['Commande (C)', '(ventes des 2 semaines précédentes) ÷ 2 − stock de la semaine, arrondi au colisage supérieur'],
              ],
            },
            {
              type: 'formula',
              text: 'Exemple — caserne de pompiers (réf. 70412)\nStock S46 = 0 + 20 − 8 = 12\nCommande S47 = (8 + 20) ÷ 2 − 8 = 6 → colisage de 4 → 8',
            },
          ],
        },
        {
          id: 'd01-m4-doc3',
          number: 3,
          title: 'Bon de livraison du fournisseur Mondo Figs',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Livré à', 'Toupie & Cie Guéret'], ['Date', '09/11/N (semaine 46)']] },
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Quantité', 'Colisage'],
              rows: CADENCIER_M4.map((c) => [c.id.replace('mf-', ''), c.label.split(' — ')[0], String(c.firstOrder), String(c.colisage)]),
            },
          ],
        },
        {
          id: 'd01-m4-doc4',
          number: 4,
          title: 'Note du directeur',
          look: 'postit',
          blocks: [
            {
              type: 'p',
              text: 'La semaine 49 est une très grosse semaine de chiffre d’affaires. Il faut anticiper les commandes supplémentaires sur la référence 70418 (Ferme et animaux), très demandée en « Réservé, retiré ». Nous commanderons donc 24 boîtes supplémentaires en semaine 48. Pense à bien les ajouter !',
            },
          ],
        },
        {
          id: "d01-revision-4-doc",
          number: 5,
          title: "Traiter deux retraits qui mobilisent le même stock",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Retrait",
                "Heure de validation",
                "Contenu"
              ],
              rows: [
                [
                  "R41",
                  "9 h 02",
                  "2 jeux Mémo et 1 puzzle PU36"
                ],
                [
                  "R42",
                  "9 h 09",
                  "1 jeu Mémo"
                ]
              ]
            },
            {
              type: "p",
              text: "Le bac retrait contient 2 jeux Mémo et 1 puzzle PU36 conformes. Il n’y a aucun autre Mémo disponible immédiatement. La règle interne réserve les articles dans l’ordre de validation. Un message « prêt » est envoyé après contrôle de la commande complète."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd01-m4-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Analyse du service « Réservé, retiré »',
          instructions: 'À l’aide du document 1, réponds aux questions.',
          helps: [
            'Les réponses aux questions fermées se trouvent dans les paragraphes 2 à 4 du document 1.',
            'Un atout d’efficacité est ce qui permet au service de fonctionner vite et sans erreur.',
            'Les deux atouts : un stock affiché en ligne actualisé très souvent, et la rapidité (retrait sous 2 h).',
          ],
          outcomeIds: R,
          fields: [
            {
              id: 'modalites',
              label: 'Quelles sont les deux modalités de livraison proposées aux clients du site ?',
              kind: 'multi',
              options: [
                { value: 'domicile', label: 'Livraison à domicile' },
                { value: 'retrait', label: 'Retrait en magasin (« Réservé, retiré »)' },
                { value: 'relais', label: 'Point relais' },
                { value: 'casier', label: 'Casier automatique' },
              ],
              answers: ['domicile', 'retrait'],
              explain: 'Le document cite la livraison à domicile et la réservation en magasin.',
            },
            {
              id: 'maillage',
              label: 'En quoi les 180 magasins du réseau sont-ils un atout pour ce service ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'La plupart des familles ont un point de retrait à moins de 30 minutes.' },
                { value: 'b', label: 'Ils permettent de vendre plus cher.' },
                { value: 'c', label: 'Ils remplacent l’entrepôt de la centrale.' },
              ],
              answer: 'a',
              explain: 'Le maillage du territoire garantit un point de retrait proche du client.',
            },
            {
              id: 'atouts',
              label: 'Quels sont les deux atouts de Toupie & Cie qui contribuent à l’efficacité du service ?',
              kind: 'multi',
              options: [
                { value: 'stock', label: 'Un stock affiché en ligne et actualisé très souvent' },
                { value: 'refs', label: 'Les références de chaque magasin visibles sur le site' },
                { value: 'prix', label: 'Des prix plus bas sur le site' },
                { value: 'livreurs', label: 'Une flotte de livreurs propre à l’enseigne' },
              ],
              answers: ['stock', 'refs'],
              explain: 'Le client voit ce qui est réellement disponible dans son magasin, et l’offre du magasin s’ajoute à celle du site.',
            },
          ],
        },
        {
          id: 'd01-m4-a1b',
          kind: 'open',
          label: 'Annexe 1 (suite)',
          title: 'Les avantages du « Réservé, retiré »',
          instructions: 'Rédige deux réponses courtes.',
          helps: [
            'Pense à ce qui se passe quand le client entre dans le magasin pour récupérer son jouet.',
            'Pour le magasin : la vente encaissée, le trafic, les ventes additionnelles. Pour le client : la rapidité, la gratuité, la certitude d’avoir le produit.',
            'Exemple : « Le magasin encaisse la vente et peut proposer un produit complémentaire… »',
          ],
          outcomeIds: R,
          prompts: [
            { id: 'mag', label: 'Quels sont les avantages du « Réservé, retiré » pour le magasin de Guéret ?', lines: 3 },
            { id: 'client', label: 'Quels sont les avantages pour le client ?', lines: 3 },
          ],
          selfCheck: ['J’ai donné au moins deux avantages pour le magasin.', 'J’ai donné au moins deux avantages pour le client.'],
        },
        {
          id: 'd01-m4-a2',
          kind: 'grid',
          label: 'Annexe 2',
          title: 'Cadencier du mois de novembre — références Mondo Figs (extrait)',
          instructions:
            'Complète les cases vides avec les documents 2, 3 et 4. Avance semaine par semaine. Pour la réf. 70425, les ventes de la semaine 46 sont à retrouver à partir des stocks.',
          helps: [
            'Ordre conseillé pour chaque semaine : le stock, puis la livraison (bon de livraison ou commande de la semaine précédente), puis la commande.',
            'Ventes manquantes : V = stock de la semaine + livraison de la semaine − stock de la semaine suivante. N’oublie pas les 24 boîtes de la note du directeur (réf. 70418, semaine 48).',
            'Réf. 70412 : S46 = 12 ; L46 = 16 ; S47 = 12 + 16 − 20 = 8 ; L47 = 16 ; C47 = (8 + 20) ÷ 2 − 8 = 6 → 8.',
          ],
          outcomeIds: R,
          groups: ['Semaine 45 (02/11 – 07/11)', 'Semaine 46 (09/11 – 14/11)', 'Semaine 47 (16/11 – 21/11)', 'Semaine 48 (23/11 – 28/11)'].map((label) => ({ label, columns: WEEK_COLS })),
          rows: cadencierRows(CADENCIER_M4),
          legend: 'S = stock · C = commande · L = livraison · V = ventes',
        },
        {
          id: "d01-revision-4",
          label: "Annexe complémentaire",
          title: "Traiter deux retraits qui mobilisent le même stock",
          instructions: "Lis le document 5. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Simule le prélèvement du premier ticket avant d’affecter le stock au second.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "R41 prêt après contrôle et mise en bac identifié. R42 en attente de stock. Les deux Mémo disponibles sont affectés à R41, validé en premier."
          ],
          outcomeIds: [
            "d01-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Indique les deux statuts à enregistrer et justifie.",
              kind: "written",
              lines: 3,
              model: "R41 prêt après contrôle et mise en bac identifié. R42 en attente de stock. Les deux Mémo disponibles sont affectés à R41, validé en premier."
            },
            {
              id: "q2",
              label: "Rédige le message pour R42 en proposant deux suites.",
              kind: "written",
              lines: 3,
              model: "Bonjour, votre jeu Mémo est temporairement indisponible au retrait. Nous pouvons vous prévenir après confirmation du réassort ou annuler cette réservation à votre demande. Nous vous confirmerons la disponibilité avant votre déplacement."
            }
          ]
        },
      ],
    },

    /* =============================== SYNTHÈSE =============================== */
    {
      id: 'synthese',
      kind: 'synthese',
      title: 'Synthèse',
      documents: [],
      activities: [
        {
          id: 'd01-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse du dossier',
          instructions: 'Complète chaque schéma de la synthèse, puis consulte la fiche de révision ci-dessous.',
          helps: [
            'Reprends les circuits de la mission 1 et le schéma de la mission 2.',
            'En canal court, un seul intermédiaire ; en canal long, deux. La centrale négocie, le magasin transmet ses quantités.',
            'Le cadencier sert à éviter deux choses opposées : manquer de produits et en avoir trop.',
          ],
          outcomeIds: R,
          fields: [
            { id: 'court', label: '1. Canal court : Fournisseur → … → Consommateur', kind: 'text', accept: ['Détaillant', 'Magasin', 'Le magasin', 'Le détaillant', 'Magasin de détail', 'Commerçant'], placeholder: 'Intermédiaire', explain: 'Fournisseur → détaillant (magasin) → consommateur.' },
            { id: 'long1', label: '1. Canal long : Fournisseur → … → Magasin → Consommateur', kind: 'text', accept: ['Centrale d’achat', 'Centrale d achat', 'Centrale', 'Grossiste', 'Centrale d’achats'], placeholder: 'Premier intermédiaire', explain: 'Fournisseur → centrale d’achat (ou grossiste) → magasin → consommateur.' },
            {
              id: 'centrale',
              label: '2. Commande à une centrale : le magasin transmet… ',
              kind: 'choice',
              options: [
                { value: 'a', label: '… les références et les quantités selon ses prévisions de vente ; la centrale négocie prix, remises et délais.' },
                { value: 'b', label: '… ses prix de vente ; la centrale fixe les quantités.' },
              ],
              answer: 'a',
              explain: 'Le magasin prévoit et transmet ses besoins ; la centrale négocie avec le fournisseur, puis livre.',
            },
            {
              id: 'direct',
              label: '3. Commande en direct : le magasin…',
              kind: 'choice',
              options: [
                { value: 'a', label: '… transmet ses références et quantités et négocie lui-même les conditions commerciales avec le fournisseur.' },
                { value: 'b', label: '… passe par la centrale, qui transmet au fournisseur.' },
              ],
              answer: 'a',
              explain: 'En direct, le magasin négocie seul ; le fournisseur le livre directement.',
            },
            {
              id: 'objectifs',
              label: '4. Le cadencier, alimenté par les ventes du magasin et du Réservé-retiré, sert à… (deux réponses)',
              kind: 'multi',
              options: [
                { value: 'rupture', label: 'Éviter la rupture de stock' },
                { value: 'surstock', label: 'Éviter le surstockage' },
                { value: 'prix', label: 'Fixer le prix de vente' },
                { value: 'remise', label: 'Calculer les remises' },
              ],
              answers: ['rupture', 'surstock'],
              explain: 'Le cadencier sert à éviter à la fois la rupture de stock et le surstockage.',
            },
          ],
        },
        {
          id: 'd01-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Cinq questions pour vérifier tes connaissances avant l’application.',
          helps: ['Relis la fiche de révision.', 'Attention aux pièges sur le colisage et la base de calcul des remises.', 'Vérifie chaque calcul avec la calculatrice.'],
          outcomeIds: R,
          fields: [
            { id: 'q1', label: 'Un magasin a besoin de 37 produits ; le colisage est de 6. Combien commande-t-il ?', kind: 'number', answer: 42, explain: 'Le premier multiple de 6 supérieur ou égal à 37 est 42.' },
            { id: 'q2', label: 'PV TTC 45 € et coefficient 1,8 : quel est le PA HT ?', kind: 'number', answer: 25, unit: '€', tolerance: 0.001, explain: '45 ÷ 1,8 = 25 €.' },
            {
              id: 'q3',
              label: 'Une remise supplémentaire « sur le net commercial » se calcule…',
              kind: 'choice',
              options: [
                { value: 'a', label: 'sur le total HT avant toute remise' },
                { value: 'b', label: 'sur le montant obtenu après la première remise' },
                { value: 'c', label: 'sur le total TTC' },
              ],
              answer: 'b',
              explain: 'Les remises s’appliquent en cascade : la seconde porte sur le net après la première.',
            },
            { id: 'q4', label: 'Stock 10, livraison 8, ventes 12 : quel est le stock de la semaine suivante ?', kind: 'number', answer: 6, explain: '10 + 8 − 12 = 6.' },
            {
              id: 'q5',
              label: 'Un client réserve en ligne et retire en magasin. Le produit est prélevé…',
              kind: 'choice',
              options: [
                { value: 'a', label: 'dans le stock du magasin' },
                { value: 'b', label: 'dans l’entrepôt de la centrale' },
                { value: 'c', label: 'chez le fabricant' },
              ],
              answer: 'a',
              explain: 'D’où l’importance du cadencier : les ventes web puisent dans le stock du magasin.',
            },
          ],
        },
      ],
      synthesis: [
        {
          title: 'Notions essentielles',
          kind: 'notions',
          items: [
            'Canal court : fournisseur → détaillant → consommateur. Le magasin choisit et négocie directement.',
            'Canal long : fournisseur → centrale d’achat (ou grossiste) → magasin → consommateur. Meilleures conditions grâce aux volumes, moins de liberté.',
            'Centrale d’achat : référence les produits, négocie, stocke et livre les magasins du réseau.',
            'Omnicanal : le client passe d’un canal à l’autre ; le stock du magasin sert aussi les ventes en ligne.',
          ],
        },
        {
          title: 'Méthodes',
          kind: 'methodes',
          items: [
            'Prévoir : ventes N-1 × (1 + taux d’évolution), arrondi à l’entier supérieur.',
            'Respecter le colisage : premier multiple du colisage supérieur ou égal au besoin.',
            'Contrôler un bon de commande : taux de chaque remise, base de calcul, totaux.',
            'Cadencier : S, puis L, puis C, semaine après semaine ; V se déduit des stocks si besoin.',
          ],
        },
        {
          title: 'Formules à connaître',
          kind: 'formules',
          items: [
            'PA HT = PV TTC ÷ coefficient',
            'Prix HT = prix TTC ÷ (1 + taux de TVA)',
            'Net commercial = total HT − remises',
            'S(w) = S(w-1) + L(w-1) − V(w-1)',
            'C(w) = (V(w-2) + V(w-1)) ÷ 2 − S(w), arrondi au colisage',
          ],
        },
        {
          title: 'Erreurs fréquentes',
          kind: 'erreurs',
          items: [
            'Commander la prévision brute (53) au lieu d’un multiple du colisage (56).',
            'Calculer la deuxième remise sur le total HT au lieu du net commercial.',
            'Oublier qu’une commande n’est livrée que la semaine suivante.',
            'Comparer des prix de pots de contenances différentes sans ramener au kilo.',
          ],
        },
        {
          title: 'Bonnes pratiques professionnelles',
          kind: 'pratiques',
          items: [
            'Anticiper les commandes des temps forts plusieurs mois à l’avance.',
            'Vérifier la confirmation de commande après chaque saisie.',
            'Signaler toute erreur d’un fournisseur, même en faveur du magasin.',
          ],
        },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Canal court', 'Canal long', 'Centrale d’achat', 'Fournisseur', 'Colisage', 'Coefficient multiplicateur', 'Cadencier', 'Omnicanal'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Distingue le circuit d’achat, qui relie les entreprises, du parcours de retrait, qui relie le magasin au client.",
            "Pour commander, déduis les unités utilisables et les arrivages confirmés, puis convertis le besoin en colis.",
            "Une commande fournisseur validée et une réservation client prête correspondent à deux vérifications différentes."
          ]
        },
      ],
    },

    /* =============================== APPLICATION 1 =============================== */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Choisir un fournisseur',
      guidance: 'autonome',
      hero: { id: 'd01-epicerie', alt: 'Intérieur d’une épicerie fine : étagères en bois garnies de bocaux et de produits du terroir' },
      message: {
        from: 'Léa Dufour',
        role: 'Responsable de l’épicerie fine Le Garde-Manger, Aubusson',
        text: [
          'Tu réalises une de tes PFMP dans notre boutique. Nous sélectionnons uniquement des produits du terroir et travaillons directement avec nos fournisseurs.',
          'Je souhaite élargir ma gamme avec une nouvelle marque de confitures. J’ai contacté trois producteurs : Les Vergers de Combraille, la Confiturerie du Thaurion et la Maison Brunet. Voici leurs offres. Aide-moi à faire le meilleur choix : je veux commander 500 pots, tous parfums confondus.',
        ],
      },
      documents: OFFERS.map((o, i) => ({
        id: `d01-a1-doc${i + 1}`,
        number: i + 1,
        title: o.name,
        look: 'fiche' as const,
        blocks: [
          { type: 'image' as const, image: { id: `d01-confiture-${i + 1}-cut`, alt: `Pot de confiture de la marque ${o.name}` }, float: true },
          {
            type: 'facts' as const,
            items: [
              ['Produit', o.produit],
              ['Conditionnement', `Pot de ${o.grams} g`],
              ['Prix de vente', `${euro(o.ttc)} TTC, soit ${euro(r2((o.ttc * 1000) / o.grams))} le kg`],
              ['Remise', `${o.remise} % pour toute commande de 500 pots`],
              ['Livraison', `${o.delai}, offerte à partir de ${euro(o.seuilPort)} HT (sinon ${euro(o.port)})`],
              ['Règlement', `sous ${o.paiement}`],
              ['TVA', '5,5 %'],
            ] as Array<[string, string]>,
          },
        ],
      })),
      activities: [
        ...OFFERS.map((o, i) => offerActivity(o, i + 1)),
        {
          id: 'd01-a1-comp',
          kind: 'fields',
          layout: 'columns',
          columns: OFFERS.map((o) => o.name),
          label: 'Tableau comparatif',
          title: 'Comparer les trois fournisseurs',
          instructions: 'Reporte tes résultats, puis ramène chaque offre au prix du kilo pour comparer des pots de tailles différentes.',
          helps: [
            'Reprends la contenance, la réduction et le montant de chaque fiche de calcul.',
            'Nombre de kg = 500 × contenance (en kg). Prix au kg = montant ÷ nombre de kg.',
            `Thaurion : 500 × 0,370 = 185 kg ; ${euro(offerFigures(OFFERS[1]).montant)} ÷ 185 = ${euro(offerFigures(OFFERS[1]).auKg)}/kg.`,
          ],
          outcomeIds: R,
          fields: [
            ...OFFERS.map((o, i) => ({ id: `cont.${i}`, label: 'Contenance du pot (g)', kind: 'number' as const, answer: o.grams, explain: `${o.name} : ${o.grams} g.` })),
            ...OFFERS.map((o, i) => ({ id: `reduc.${i}`, label: 'Montant de la réduction (€)', kind: 'number' as const, answer: offerFigures(o).reduc, tolerance: 0.01, explain: `${o.name} : ${euro(offerFigures(o).reduc)}.` })),
            ...OFFERS.map((o, i) => ({ id: `mt.${i}`, label: 'Montant de la commande HT (€)', kind: 'number' as const, answer: offerFigures(o).montant, tolerance: 0.01, explain: `${o.name} : ${euro(offerFigures(o).montant)}.` })),
            ...OFFERS.map((o, i) => ({
              id: `kg.${i}`,
              label: 'Prix du kilo HT (€)',
              kind: 'number' as const,
              answer: offerFigures(o).auKg,
              tolerance: 0.011,
              explain: `${o.name} : ${euro(offerFigures(o).montant)} ÷ ${offerFigures(o).kg} kg = ${euro(offerFigures(o).auKg)}.`,
            })),
          ],
        },
        {
          id: 'd01-a1-choix',
          kind: 'fields',
          label: 'Choix',
          title: 'Le moins cher n’est pas toujours le meilleur achat',
          instructions: 'Tire les conclusions de ton tableau comparatif.',
          helps: ['Compare d’abord les montants, puis les prix au kilo.', 'Le pot le moins cher contient aussi moins de confiture.', 'Le meilleur rapport quantité-prix est le prix au kilo le plus bas.'],
          outcomeIds: R,
          fields: [
            {
              id: 'moins-cher',
              label: 'Quel fournisseur propose la commande la moins chère en montant ?',
              kind: 'choice',
              options: OFFERS.map((o) => ({ value: o.id, label: o.name })),
              answer: 'brunet',
              explain: `Maison Brunet : ${euro(offerFigures(OFFERS[2]).montant)}, même avec les frais de livraison.`,
            },
            {
              id: 'meilleur',
              label: 'Quel fournisseur offre le meilleur rapport quantité-prix ?',
              kind: 'choice',
              options: OFFERS.map((o) => ({ value: o.id, label: o.name })),
              answer: 'thaurion',
              explain: `Le Thaurion est le moins cher au kilo (${euro(offerFigures(OFFERS[1]).auKg)}) grâce à ses pots de 370 g.`,
            },
          ],
        },
        {
          id: 'd01-a1-justif',
          kind: 'open',
          label: 'Choix et justification',
          title: 'Ta recommandation à Léa Dufour',
          instructions: 'Justifie ton choix de fournisseur en quelques lignes.',
          helps: [
            'Nomme le fournisseur retenu, puis donne tes arguments chiffrés.',
            'Pense aussi au délai de livraison, au délai de paiement et à la qualité (taux de fruits, fabrication).',
            'Structure possible : « Je recommande… car… (prix au kg). De plus… Point de vigilance : … »',
          ],
          outcomeIds: R,
          prompts: [{ id: 'reco', label: 'Choix et justification', lines: 6 }],
          selfCheck: ['J’ai nommé un fournisseur.', 'J’ai utilisé au moins un calcul.', 'J’ai cité au moins un critère autre que le prix.'],
        },
      ],
      selfAssessment: ['Je sais calculer un prix HT à partir d’un prix TTC.', 'Je sais calculer un net commercial et des frais de livraison conditionnels.', 'Je sais construire un tableau comparatif et justifier un choix.'],
    },

    /* =============================== APPLICATION 2 =============================== */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Compléter un cadencier',
      guidance: 'autonome',
      message: {
        from: 'Léa Dufour',
        role: 'Responsable, Le Garde-Manger',
        text: [
          'Tu poursuis ta PFMP dans la boutique, qui travaille directement avec ses fournisseurs et ses producteurs (document 1).',
          'Je te remets les livraisons et les ventes de janvier de trois produits de la Ferme des Combes, un producteur du Périgord (documents 2 et 3). À toi de compléter le cadencier.',
        ],
      },
      documents: [
        {
          id: 'd01-a2-doc1',
          number: 1,
          title: 'Le Garde-Manger — épicerie fine à Aubusson',
          look: 'site',
          url: 'www.legardemanger-aubusson.fr',
          blocks: [
            { type: 'image', image: { id: 'd01-devanture', alt: 'Devanture d’une épicerie fine avec vitrine garnie de produits' } },
            { type: 'p', text: 'Bienvenue au Garde-Manger, votre épicerie fine au cœur d’Aubusson, ouverte du mardi au samedi. Nous sélectionnons nous-mêmes des produits artisanaux et locaux, directement auprès de nos producteurs.' },
            {
              type: 'list',
              title: 'Nos producteurs',
              items: ['Ferme des Combes (Périgord) — terrines et sauces', 'Rucher de la Tardes (Creuse) — miels', 'Les Vergers de Combraille — confitures', 'Moulin de Felletin — huiles', 'Fromagerie du plateau de Millevaches'],
            },
            { type: 'p', text: 'Nous connaissons chacun de nos producteurs et pouvons vous conseiller sur l’origine et la fabrication de chaque produit. Paniers gourmands sur mesure, livraison gratuite à Aubusson et alentours.' },
          ],
        },
        {
          id: 'd01-a2-doc2',
          number: 2,
          title: 'Les livraisons des semaines 1 à 4 — Ferme des Combes',
          look: 'facture',
          blocks: [
            { type: 'facts', items: [['Livré à', 'Le Garde-Manger, 12 rue Vieille, 23200 Aubusson'], ['Date', '31/01/N']] },
            {
              type: 'table',
              head: ['Références', 'Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
              rows: [
                ['Sauce aux cèpes', '16', '24', '8', '4'],
                ['Terrine de canard', '28', '24', '12', '0'],
                ['Miel de bruyère', '24', '12', '12', '12'],
              ],
            },
          ],
        },
        {
          id: 'd01-a2-doc3',
          number: 3,
          title: 'Les ventes des semaines 1 à 4',
          look: 'memo',
          blocks: [
            {
              type: 'table',
              head: ['Références', 'Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
              rows: CADENCIER_APP2.map((c) => [c.label, ...c.sales.map(String)]),
            },
            { type: 'image', image: { id: 'd01-produits-terroir', alt: 'Bocaux et pots de produits du terroir alignés sur une étagère' } },
          ],
        },
        {
          id: "d01-revision-5-doc",
          number: 4,
          title: "Arbitrer un réapprovisionnement en librairie",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Librairie La Virgule. Atelier mercredi à 14 h. Il faut 28 carnets disponibles pour les participants. Dix carnets sont en rayon, dont deux déjà réservés. Six autres arrivent mardi. Le grossiste propose des lots de 5 à 3 € HT l’unité, livrés mercredi à 10 h sans frais. L’atelier local propose 14 unités à 2,70 € HT avec 9 € de port et livraison jeudi."
            }
          ]
        },
        {
          id: "d01-revision-dossier-doc1",
          number: 5,
          title: "État de stock à mercredi 9 h",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le magasin prépare un atelier vendredi à 16 h et deux retraits vendredi à 11 h. Le système compte 22 jeux en réserve, dont 3 invendables. Les retraits R61 et R62 exigent respectivement 4 et 5 jeux. L’atelier mobilise 24 jeux vendables en plus des retraits."
            }
          ]
        },
        {
          id: "d01-revision-dossier-doc2",
          number: 6,
          title: "Confirmations et offres fournisseurs",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Solution",
                "Quantité",
                "Coût HT",
                "Arrivée"
              ],
              rows: [
                [
                  "Commande déjà confirmée",
                  "12 unités",
                  "Déjà engagée",
                  "Vendredi 10 h"
                ],
                [
                  "Centrale, commande urgente",
                  "Carton de 8",
                  "48 € par carton",
                  "Vendredi 14 h"
                ],
                [
                  "Fabricant voisin",
                  "À l’unité",
                  "7,50 € par unité et 10 € de port",
                  "Jeudi 17 h"
                ]
              ]
            },
            {
              type: "p",
              text: "Le budget supplémentaire est de 75 € HT. On ne commande que le nécessaire au conditionnement près."
            }
          ]
        },
        {
          id: "d01-revision-dossier-doc3",
          number: 7,
          title: "Mise à jour reçue vendredi à 9 h",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "La commande confirmée de 12 unités est décalée à lundi. Tu avais choisi le fabricant pour le complément initial, et ses deux jeux sont déjà reçus. Le port indiqué dans l’offre s’applique à chaque commande. La centrale n’accepte plus de commande urgente pour cette semaine. Le fabricant voisin peut livrer vendredi à 15 h, au maximum 8 unités. La responsable de l’atelier accepte de réduire le groupe si elle est prévenue à 10 h. Les retraits déjà promis passent en priorité."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd01-a2-a1',
          kind: 'fields',
          label: '1',
          title: 'Identifier le canal d’approvisionnement',
          instructions: 'Identifie le type de canal d’approvisionnement utilisé par la boutique.',
          helps: ['Combien d’intermédiaires entre le producteur et le client ?', 'La boutique achète directement aux producteurs, sans centrale.', 'Producteur → boutique → client.'],
          outcomeIds: R,
          fields: [{ id: 'canal', label: 'Type de canal', kind: 'choice', options: CANAUX, answer: 'court', explain: 'Un seul intermédiaire (la boutique) : canal court.' }],
        },
        {
          id: 'd01-a2-a2',
          kind: 'open',
          label: '2',
          title: 'Justifier le choix du canal',
          instructions: 'À l’aide du document 1, justifie le choix de ce canal et liste les critères de sélection des produits utilisés par la boutique.',
          helps: ['Que met en avant le site de la boutique ?', 'Cherche les mots : artisanaux, locaux, connaissance des producteurs, conseil.', 'Critères possibles : origine locale, fabrication artisanale, relation directe, capacité de conseil, qualité.'],
          outcomeIds: R,
          prompts: [
            { id: 'justif', label: 'Pourquoi ce canal ?', lines: 3 },
            { id: 'criteres', label: 'Critères de sélection des produits', lines: 3 },
          ],
          selfCheck: ['J’ai relié le canal court au positionnement de la boutique.', 'J’ai listé au moins trois critères.'],
        },
        {
          id: 'd01-a2-a3',
          kind: 'grid',
          label: '3',
          title: 'Cadencier du mois de janvier',
          instructions: 'Complète le cadencier en tenant compte des livraisons (document 2) et des ventes (document 3). Les commandes sont livrées la semaine suivante.',
          helps: [
            'Reporte d’abord les livraisons et les ventes des documents, puis calcule les stocks et les commandes.',
            'Même méthode qu’à la mission 4 : S = S + L − V de la semaine précédente ; C = moyenne des 2 dernières ventes − stock, arrondie au colisage.',
            'Vérifie : la livraison d’une semaine doit égaler la commande que tu as calculée la semaine précédente.',
          ],
          outcomeIds: R,
          groups: ['Semaine 1 (03/01 – 08/01)', 'Semaine 2 (10/01 – 15/01)', 'Semaine 3 (17/01 – 22/01)', 'Semaine 4 (24/01 – 29/01)'].map((label) => ({ label, columns: WEEK_COLS })),
          rows: cadencierRows(CADENCIER_APP2),
          legend: 'S = stock · C = commande · L = livraison · V = ventes',
        },
        {
          id: "d01-revision-5",
          label: "Nouveau cas d’application",
          title: "Arbitrer un réapprovisionnement en librairie",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Calcule d’abord le besoin restant, puis vérifie le délai et le nombre de lots.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "28 − (10 − 2 + 6) = 14."
          ],
          outcomeIds: [
            "d01-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien manque-t-il de carnets ?",
              kind: "number",
              answer: 14,
              explain: "28 − (10 − 2 + 6) = 14."
            },
            {
              id: "q2",
              label: "Quel montant HT doit être saisi chez le grossiste ?",
              kind: "number",
              answer: 45,
              explain: "Trois lots de 5 à 3 € l’unité, soit 45 € HT."
            },
            {
              id: "q3",
              label: "Établis la note de commande et le contrôle du mercredi.",
              kind: "written",
              lines: 3,
              model: "Commander 15 carnets, soit trois lots de 5, pour 45 € HT au grossiste. Mercredi à 10 h, contrôler les quantités et la conformité, puis isoler 28 carnets pour l’atelier. Écarter l’offre locale, qui arrive le lendemain de l’atelier."
            }
          ]
        },
        {
          id: "d01-revision-dossier",
          label: "Dossier de décision",
          title: "Tenir un engagement client quand le réassort prend du retard",
          instructions: "Lis les documents 5 et 6, puis écris ton diagnostic initial. Passe ensuite au document 7 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Construis deux soldes distincts, avant les retraits et avant l’atelier. Applique ensuite l’alerte du dernier document sans réutiliser les unités déjà affectées.",
            "Trace trois lignes, « stock utilisable », « retraits promis » et « disponible atelier ». Mets les arrivages sur la ligne de l’échéance qu’ils précèdent.",
            "Exemple avec d’autres quantités. Sur 16 jeux dont 2 abîmés, 5 sont réservés. Il reste 9 jeux pour l’atelier. Si l’atelier en demande 12, le besoin est de 3, à arrondir seulement chez un fournisseur qui impose un colis."
          ],
          outcomeIds: [
            "d01-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Reconstitue la situation prévue avant l’alerte. Combien manque-t-il et quel achat est possible ?",
              kind: "written",
              lines: 6,
              model: "Le stock utilisable est de 19, dont 9 pour les retraits. Pour l’atelier, il reste 10 + 12 = 22 jeux, soit 2 manquants. La centrale impose 48 € et arrive à temps. Le fabricant livre deux jeux pour 25 € HT avant le vendredi et coûte moins cher."
            },
            {
              id: "q2",
              label: "Calcule la situation vendredi si les deux jeux du fabricant sont déjà reçus.",
              kind: "written",
              lines: 6,
              model: "Il y a 21 jeux utilisables, dont 9 pour les retraits. Il reste 12 jeux pour l’atelier, soit 12 manquants après le retard."
            },
            {
              id: "q3",
              label: "Teste la solution d’un achat supplémentaire chez le fabricant sous le budget global. Quel groupe peut-on finalement accueillir ?",
              kind: "written",
              lines: 6,
              model: "Après 25 € engagés, il reste 50 €. Avec 10 € de port, 5 unités coûtent 47,50 € et 6 coûtent 55 €. On peut donc porter l’atelier à 17 places en dépensant 72,50 € HT au total."
            },
            {
              id: "q4",
              label: "Prépare le message de 10 h et le contrôle de 15 h.",
              kind: "written",
              lines: 6,
              model: "Les deux retraits restent maintenus à 11 h après contrôle de leurs 9 jeux. L’atelier passe à 17 places sous réserve de la réception des 5 jeux à 15 h. Je réserve 12 jeux dès maintenant, contrôle le lot à 15 h et confirme à la responsable la capacité réellement disponible."
            }
          ]
        },
      ],
      selfAssessment: ['Je sais identifier un canal d’approvisionnement et le justifier.', 'Je sais compléter un cadencier sans modèle.',
        "Je distingue le stock utilisable des quantités déjà réservées.",
        "Je recalcule un achat avec le budget résiduel et le nouveau délai.",
        "J’annonce une capacité qui tient compte de la réception encore à confirmer."],
    },

    /* =============================== BILAN =============================== */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais distinguer un canal court d’un canal long et expliquer le rôle d’une centrale d’achat.',
        'Je sais calculer une quantité à commander en respectant le colisage.',
        'Je sais calculer un prix d’achat HT et le montant d’une commande.',
        'Je sais vérifier le respect d’un accord commercial et les remises d’un bon de commande.',
        'Je sais compléter un cadencier pour éviter ruptures et surstocks.',
        'Je sais comparer des fournisseurs et justifier un choix.',
      ],
    },
  ],
};
