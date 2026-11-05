import type { Chapter, ChoiceOption, Field, GridActivity, PlanningActivity } from '../../domain/chapter';
import { psycho, type PsyInput } from './d05';

const w = (id: string, label: string, model: string, criteria?: string[], lines = 3): Field => ({ id, label, kind: 'written', model, criteria, lines });

/**
 * SCÉNARIO 1 — Assurer les opérations préalables à la vente
 *
 * Une seule entreprise, six missions enchaînées (site, réapprovisionnement, réception, stocks, réorganisation, prix).
 * Entreprise, marques, personnages et chiffres : ORIGINAUX et fictifs. Tous les résultats sont calculés ici puis testés.
 */

const R1 = ['s1-r1']; // Processus d'achat et d'approvisionnement maîtrisé.
const R2 = ['s1-r2']; // État des stocks renseigné et analysé.
const R3 = ['s1-r3']; // Stocks optimisés.
const R23 = ['s1-r2', 's1-r3'];

export const r1 = (n: number) => Math.round((n + Number.EPSILON) * 10) / 10;
export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });
const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

/* =============================== Mission 2 : réapprovisionnement =============================== */

export const REAPPRO = [
  { ref: '3 159 852 036 008', name: 'Arlo / Pryde', stock: 5, alerte: 8, max: 15, cond: 2 },
  { ref: '3 159 852 167 007', name: 'Arlo / Riderr', stock: 8, alerte: 10, max: 15, cond: 2 },
  { ref: '3 159 852 369 808', name: 'Arlo / Teigen', stock: 12, alerte: 5, max: 15, cond: 2 },
  { ref: '3 159 852 009 790', name: 'Arlo / Reima', stock: 11, alerte: 7, max: 20, cond: 2 },
  { ref: '3 159 852 349 791', name: 'Arlo / Tallyn', stock: 10, alerte: 15, max: 20, cond: 2 },
  { ref: '3 159 852 346 317', name: 'Arlo / Kerrigan (sac)', stock: 6, alerte: 10, max: 15, cond: 4 },
  { ref: '3 159 852 664 773', name: 'Arlo / Fab12', stock: 2, alerte: 4, max: 20, cond: 2 },
  { ref: '3 159 852 073 649', name: 'Arlo / Lea03', stock: 8, alerte: 10, max: 20, cond: 2 },
  { ref: '3 159 852 371 307', name: 'Arlo / Sawyer (cartable)', stock: 18, alerte: 10, max: 20, cond: 4 },
  { ref: '3 159 852 258 641', name: 'Arlo / Flora (sac)', stock: 11, alerte: 15, max: 20, cond: 4 },
].map((p, i) => {
  const commande = p.stock <= p.alerte;
  const qte = commande ? Math.floor((p.max - p.stock) / p.cond) * p.cond : 0;
  return { ...p, id: `r${i + 1}`, commande, qte };
});
export const NOUVELLES = [
  { ref: '3 159 852 007 009', name: 'Arlo / Noa (portefeuille)', cond: 5, qte: 30, pa: 9.8 },
  { ref: '3 159 852 006 319', name: 'Arlo / Tabbi mini (sac bandoulière)', cond: 10, qte: 30, pa: 31.6 },
];
export const FOURNISSEUR = { nom: 'Distri’Shoes', compte: '401017', remise: 15, delai: 6 };
const PA: Record<string, number> = { r1: 28.4, r2: 24.9, r5: 26.5, r6: 34.2, r7: 21.6, r8: 23.8, r10: 39.9 };
export const BON = (() => {
  const lignes = [
    ...REAPPRO.filter((p) => p.commande).map((p) => ({ ref: p.ref, name: p.name, qte: p.qte, pa: PA[p.id] })),
    ...NOUVELLES.map((n) => ({ ref: n.ref, name: n.name, qte: n.qte, pa: n.pa })),
  ].map((l) => ({ ...l, montant: r2(l.qte * l.pa) }));
  const brut = r2(lignes.reduce((n, l) => n + l.montant, 0));
  const remise = r2((brut * FOURNISSEUR.remise) / 100);
  return { lignes, brut, remise, net: r2(brut - remise) };
})();

/* =============================== Mission 3 : réception =============================== */

export const RECEPTION = [
  { id: 'pryde', ref: '036 008', name: 'Pryde', cmd: 10, bl: 5, lot: 2, recu: 10, abime: 0 },
  { id: 'riderr', ref: '167 007', name: 'Riderr', cmd: 6, bl: 3, lot: 2, recu: 6, abime: 0 },
  { id: 'tallyn', ref: '349 791', name: 'Tallyn', cmd: 10, bl: 5, lot: 2, recu: 10, abime: 0 },
  { id: 'kerrigan', ref: '346 317', name: 'Kerrigan', cmd: 8, bl: 2, lot: 4, recu: 8, abime: 0 },
  { id: 'fab', ref: '664 773', name: 'Fab12', cmd: 18, bl: 9, lot: 2, recu: 18, abime: 0 },
  { id: 'lea', ref: '073 649', name: 'Lea03', cmd: 12, bl: 6, lot: 2, recu: 12, abime: 8 },
  { id: 'flora', ref: '258 641', name: 'Flora', cmd: 8, bl: 2, lot: 4, recu: 8, abime: 0 },
  { id: 'noa', ref: '007 009', name: 'Noa', cmd: 30, bl: 6, lot: 5, recu: 30, abime: 0 },
  { id: 'tabbi', ref: '006 319', name: 'Tabbi mini', cmd: 30, bl: 3, lot: 10, recu: 20, abime: 10 },
].map((r) => {
  const manque = r.cmd - r.recu;
  const anomalie = r.abime > 0 && manque > 0 ? 'manque-abime' : r.abime > 0 ? 'abime' : manque > 0 ? 'manque' : 'conforme';
  return { ...r, blUnites: r.bl * r.lot, manque, anomalie };
});
const ANOMALIES: ChoiceOption[] = [
  { value: 'conforme', label: 'Conforme' },
  { value: 'manque', label: 'Quantité manquante' },
  { value: 'abime', label: 'Produits endommagés' },
  { value: 'manque-abime', label: 'Manquants et endommagés' },
];

const NOV_DAYS = Array.from({ length: 23 }, (_, i) => {
  const n = 9 + i;
  const dows = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return n <= 30 ? { id: `n${n}`, dow: dows[i % 7], num: n, month: 'novembre' } : { id: `d${n - 30}`, dow: dows[i % 7], num: n - 30, month: 'décembre' };
});
const PLANNING: PlanningActivity = {
  id: 's1-m3-a2',
  kind: 'planning',
  label: 'Annexe 2',
  title: 'Mettre à jour le planning de suivi des commandes',
  instructions: 'Nous sommes le jeudi 19 novembre. La commande 372, passée le 14 novembre, vient d’être livrée. Le délai du fournisseur est de 6 jours. Ajoute sur le planning la date de commande, la livraison prévue et la livraison effective de la commande 372.',
  helps: ['Trois repères sont à poser, tous sur la ligne 372.', 'Livraison prévue = date de commande + 6 jours.', '14 + 6 = 20 novembre ; la livraison effective est le 19, un jour d’avance.'],
  outcomeIds: R1,
  days: NOV_DAYS,
  rows: [
    { id: '369', label: '369', given: [{ day: 'n9', symbol: 'commande' }, { day: 'n12', symbol: 'prevue' }, { day: 'n13', symbol: 'relance' }, { day: 'n14', symbol: 'effective' }], expected: [] },
    { id: '370', label: '370', given: [{ day: 'n11', symbol: 'commande' }, { day: 'n23', symbol: 'prevue' }], expected: [] },
    { id: '371', label: '371', given: [{ day: 'n12', symbol: 'commande' }, { day: 'n16', symbol: 'prevue' }, { day: 'n16', symbol: 'effective' }], expected: [] },
    {
      id: '372',
      label: '372',
      given: [],
      expected: [
        { day: 'n14', symbol: 'commande', explain: 'Commande passée le samedi 14 novembre.' },
        { day: 'n20', symbol: 'prevue', explain: '14 + 6 jours = vendredi 20 novembre.' },
        { day: 'n19', symbol: 'effective', explain: 'Livrée le jeudi 19 novembre.' },
      ],
    },
  ],
};

/* =============================== Mission 4 : stocks =============================== */

export const STOCK_BASKETS = [
  { ref: '526 987', name: 'Lacet Classic', qte: 6, pv: 79.9, pa: 38 },
  { ref: '325 687', name: 'Lacet Twill', qte: 5, pv: 74.9, pa: 34 },
  { ref: '146 987', name: 'Canvas Low', qte: 4, pv: 69.9, pa: 32 },
  { ref: '260 035', name: 'Delta Run', qte: 3, pv: 65.8, pa: 30.5 },
  { ref: '364 027', name: 'Mustang 407', qte: 2, pv: 85.5, pa: 32.9 },
  { ref: '667 890', name: 'Mustang ML3', qte: 1, pv: 90.9, pa: 39.9 },
  { ref: '456 007', name: 'Urban Sky', qte: 7, pv: 52.8, pa: 24.5 },
  { ref: '361 971', name: 'Kickers 7', qte: 5, pv: 42.5, pa: 19.9 },
  { ref: '360 349', name: 'Skate Hazel', qte: 3, pv: 49.8, pa: 30.8 },
  { ref: '208 046', name: 'Golf Classic', qte: 6, pv: 39.9, pa: 22.9 },
].map((s) => ({ ...s, valeurPa: r2(s.qte * s.pa), valeurPv: r2(s.qte * s.pv) }));
export const STOCK_TOTAL = {
  pa: r2(STOCK_BASKETS.reduce((n, s) => n + s.valeurPa, 0)),
  pv: r2(STOCK_BASKETS.reduce((n, s) => n + s.valeurPv, 0)),
};

export const CADENCIER = [
  { ref: '605 367', si: 13, v: [18, 19, 32], sf: 19 },
  { ref: '301 890', si: 8, v: [19, 22, 38], sf: 24 },
  { ref: '334 894', si: 20, v: [20, 14, 21], sf: 45 },
  { ref: '354 038', si: 11, v: [28, 20, 20], sf: 18 },
  { ref: '364 037', si: 6, v: [8, 26, 19], sf: 23 },
].map((c) => {
  const ventes = c.v.reduce((a, b) => a + b, 0);
  const moyen = r1((c.si + c.sf) / 2);
  const coef = r1(ventes / moyen);
  const duree = r1(90 / coef);
  return { ...c, ventes, moyen, coef, duree, ok: coef >= 3 && duree < 30 };
});

/* =============================== Mission 5 : méthode ABC =============================== */

export const MOUVEMENTS: Array<[string, number]> = [
  ['603 258', 364], ['254 189', 128], ['520 148', 56], ['960 314', 9], ['147 025', 101], ['167 960', 19], ['367 558', 42], ['255 331', 68], ['940 319', 286], ['364 892', 181],
  ['943 067', 18], ['200 548', 11], ['364 520', 6], ['256 667', 23], ['364 816', 2], ['992 346', 4], ['643 137', 10], ['809 640', 8], ['319 640', 17], ['367 510', 21],
];
export const ABC = (() => {
  const total = MOUVEMENTS.reduce((n, [, q]) => n + q, 0);
  let cum = 0;
  const rows = [...MOUVEMENTS]
    .sort((a, b) => b[1] - a[1])
    .map(([ref, q], i) => {
      const before = cum;
      cum += q;
      const cumP = r2((cum / total) * 100);
      // Classe A : jusqu'à 80 % des sorties ; B : de 80 à 95 % ; C : le reste.
      const classe = (before / total) * 100 < 80 ? 'A' : (before / total) * 100 < 95 ? 'B' : 'C';
      return { rang: i + 1, ref, q, part: r2((q / total) * 100), cumP, classe };
    });
  return { total, rows };
})();

/* =============================== Mission 6 : prix psychologique =============================== */

export const ENQUETE_SAC: PsyInput = {
  prices: [79, 82.5, 84.5, 87, 90, 92.5, 95, 97, 100, 103],
  tropCher: [0, 5, 7, 9, 10, 13, 14, 11, 6, 5],
  qualite: [17, 15, 12, 11, 9, 6, 5, 4, 1, 0],
};
export const PSY_SAC = psycho(ENQUETE_SAC, 1);

/* ================================================================================== */

const GRID_PSY: GridActivity = {
  id: 's1-m6-a1',
  kind: 'grid',
  label: 'Annexe',
  title: 'Calculer le prix psychologique du sac Tabbi mini',
  instructions: `Complète le tableau à partir de l’enquête (${PSY_SAC.n} clients). Arrondis les pourcentages au dixième.`,
  helps: [
    `Pourcentage = réponses ÷ ${PSY_SAC.n} × 100.`,
    'A cumule les « trop cher » de haut en bas ; B part de 100 % et retire les « mauvaise qualité » des prix précédents.',
    'Acheteurs potentiels = 100 − (A + B). Le prix retenu est celui qui en compte le plus.',
  ],
  outcomeIds: R3,
  groups: [
    { label: '« Trop cher »', columns: ['Réponses', '%', 'Cumul A'] },
    { label: '« Mauvaise qualité »', columns: ['Réponses', '%', 'Cumul B'] },
    { label: 'Résultat', columns: ['Acheteurs (%)'] },
  ],
  rows: PSY_SAC.rows.map((r) => ({
    id: `p${String(r.price).replace('.', '_')}`,
    label: eur(r.price),
    cells: [
      r.nTrop,
      { answer: r.pTrop, explain: `${r.nTrop} ÷ ${PSY_SAC.n} × 100 = ${fr(r.pTrop, 1)} %.`, tolerance: 0.06 },
      { answer: r.A, explain: `Cumul : ${fr(r.A, 1)} %.`, tolerance: 0.16 },
      r.nQual,
      { answer: r.pQual, explain: `${r.nQual} ÷ ${PSY_SAC.n} × 100 = ${fr(r.pQual, 1)} %.`, tolerance: 0.06 },
      { answer: r.B, explain: `Cumul décroissant : ${fr(r.B, 1)} %.`, tolerance: 0.16 },
      { answer: r.acheteurs, explain: `100 − (${fr(r.A, 1)} + ${fr(r.B, 1)}) = ${fr(r.acheteurs, 1)} %.`, tolerance: 0.26 },
    ],
  })),
  legend: 'Acheteurs potentiels = 100 − (A + B).',
};

export const S1: Chapter = {
  unitId: 's1',
  mission:
    'Tu fais ta PFMP chez Foulées.fr, site de vente en ligne de chaussures et d’accessoires. En une semaine, tu enchaînes toutes les opérations préalables à la vente : vérifier le site, commander, réceptionner, gérer et réorganiser le stock, puis fixer le prix d’un nouveau produit.',
  fictionNotice: 'Foulées.fr, le fournisseur Distri’Shoes, la marque Arlo, les personnages et tous les chiffres de ce scénario sont imaginaires.',
  company: {
    name: 'Foulées.fr — Limoges',
    tagline: 'Vente en ligne de chaussures et d’accessoires pour toute la famille',
    facts: [
      ['Ton poste', 'Élève en PFMP, logistique et commerce'],
      ['Ton tuteur', 'Karim Robin, responsable logistique et commercial'],
      ['Organisation', 'Travail en binôme ou en groupe selon les missions'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: 'Contexte professionnel',
      hero: { id: 's1-hero', alt: 'Main faisant défiler des chaussures sur une tablette' },
      message: {
        from: 'Karim Robin',
        role: 'Responsable logistique et commercial, Foulées.fr',
        text: [
          'Bienvenue chez Foulées.fr ! Nous vendons en ligne des chaussures de marque et des accessoires pour hommes, femmes et enfants, depuis notre entrepôt de Limoges.',
          'Cette semaine, je te confie six missions qui s’enchaînent, comme dans la vraie vie : sois organisé, méthodique et vigilant. Chaque erreur se répercute sur l’étape suivante.',
        ],
      },
      documents: [
        {
          id: 's1-o-doc1',
          number: 1,
          title: 'Fiche de l’entreprise',
          look: 'fiche',
          blocks: [
            {
              type: 'facts',
              items: [
                ['Société', 'Foulées SAS, au capital de 150 000 €'],
                ['Siège et entrepôt', '14 rue de la Gare, 87000 Limoges'],
                ['Activité', 'Vente à distance de chaussures et d’accessoires'],
                ['Fournisseur principal', `${FOURNISSEUR.nom}, Strasbourg — compte fournisseur n° ${FOURNISSEUR.compte}`],
              ],
            },
          ],
        },
      ],
      activities: [
        {
          id: 's1-o-a1',
          kind: 'fields',
          label: 'Questions',
          title: 'Identifier les tâches de la semaine',
          instructions: 'Avant de commencer, repère les grandes étapes du travail qui t’attend.',
          helps: ['Pense à tout le parcours d’un produit, du fournisseur au client.', 'On commande avant de réceptionner, on réceptionne avant de stocker.', 'Le prix se fixe avant la mise en vente.'],
          outcomeIds: R1,
          fields: [
            {
              id: 'ordre',
              label: 'Quelle est la bonne succession des opérations ?',
              kind: 'choice',
              options: [
                { value: 'a', label: 'Commander → réceptionner et contrôler → stocker et suivre → fixer le prix → vendre' },
                { value: 'b', label: 'Vendre → commander → fixer le prix → réceptionner' },
                { value: 'c', label: 'Réceptionner → commander → vendre → stocker' },
              ],
              answer: 'a',
              explain: 'Ce sont les opérations préalables à la vente.',
            },
            {
              id: 'comportements',
              label: 'Quels comportements professionnels sont attendus ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'organise', label: 'Être organisé et méthodique' },
                { value: 'rigoureux', label: 'Être rigoureux dans les calculs' },
                { value: 'vigilant', label: 'Être vigilant à la réception' },
                { value: 'rapide', label: 'Aller vite sans vérifier' },
              ],
              answers: ['organise', 'rigoureux', 'vigilant'],
              explain: 'La vitesse ne doit jamais remplacer le contrôle.',
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
      title: 'Vérifier la conformité du site Internet de l’entreprise',
      guidance: 'accompagné',
      message: { from: 'Karim Robin', role: 'Responsable logistique et commercial', text: ['Notre site vient d’être refait. Vérifie, en binôme, que toutes les mentions obligatoires y figurent, puis validez votre grille avec le groupe.'] },
      documents: [
        {
          id: 's1-m1-doc1',
          number: 1,
          title: 'Extrait du site foulees.example',
          look: 'site',
          url: 'foulees.example/mentions-legales',
          blocks: [
            {
              type: 'facts',
              items: [
                ['Éditeur', 'Foulées SAS, au capital de 150 000 €'],
                ['Siège', '14 rue de la Gare, 87000 Limoges'],
                ['Contact', 'contact@foulees.example · 05 55 00 45 67'],
                ['Immatriculation', 'RCS Limoges 904 512 336'],
                ['Hébergeur', 'Nuage Hébergement SAS, 3 allée des Serveurs, 59000 Lille'],
              ],
            },
            { type: 'list', title: 'Pied de page', items: ['Conditions générales de vente', 'Livraison et retours : retour gratuit sous 30 jours, formulaire en ligne', 'Paiement sécurisé'] },
            { type: 'note', text: 'Aucune page sur le droit de rétractation de 14 jours, aucune politique de confidentialité ; les cookies sont déposés sans bandeau de consentement.' },
          ],
        },
        {
          id: 's1-m1-doc2',
          number: 2,
          title: 'Les mentions légales d’un site marchand',
          look: 'texte',
          blocks: [{ type: 'p', text: 'Un site marchand doit permettre d’identifier le vendeur (raison sociale, statut, capital, adresse, coordonnées, RCS) et son hébergeur. Il présente ses CGV, le droit de rétractation et la procédure de retour. Conformément au RGPD, il informe sur la protection des données et recueille le consentement avant le dépôt des cookies.' }],
        },
      ],
      activities: [
        {
          id: 's1-m1-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Recenser les mentions obligatoires du site',
          instructions: 'Pour chaque mention obligatoire, indique si elle figure sur le site.',
          helps: ['Compare chaque ligne au document 1.', 'Lis attentivement la note en bas du document 1.', 'Trois mentions manquent.'],
          outcomeIds: R1,
          layout: 'checklist',
          fields: (
            [
              ['raison', 'Raison sociale', 'oui'],
              ['capital', 'Capital social', 'oui'],
              ['statut', 'Statut juridique', 'oui'],
              ['adresse', 'Adresse', 'oui'],
              ['coord', 'Téléphone et courriel', 'oui'],
              ['hebergeur', 'Hébergeur', 'oui'],
              ['rcs', 'Numéro RCS', 'oui'],
              ['cgv', 'CGV', 'oui'],
              ['retractation', 'Droit de rétractation', 'non'],
              ['retour', 'Procédure de retour', 'oui'],
              ['donnees', 'Protection des données', 'non'],
              ['cookies', 'Consentement aux cookies', 'non'],
            ] as const
          ).map(([id, label, answer]): Field => ({ id, label, kind: 'choice', options: OUI_NON, answer, explain: answer === 'oui' ? 'Présente.' : 'Absente : à ajouter.' })),
        },
        {
          id: 's1-m1-a2',
          kind: 'fields',
          label: 'Annexe 1 (détails)',
          title: 'Détailler les mentions à corriger',
          instructions: 'Pour chaque mention absente, rédige ce qu’il faut ajouter sur le site.',
          helps: ['Relis le document 2.', 'La rétractation : 14 jours.', 'Les cookies : un bandeau avec « Accepter » et « Refuser ».'],
          outcomeIds: R1,
          fields: [
            w('retract', 'Droit de rétractation', 'Ajouter une page indiquant que le client dispose de 14 jours après la réception pour se rétracter, avec le formulaire de rétractation.', ['14 jours.'], 2),
            w('donnees', 'Protection des données', 'Ajouter une politique de confidentialité : données collectées, utilisation, droits d’accès, de rectification et de suppression.', ['Droits du client.'], 2),
            w('cookies', 'Consentement aux cookies', 'Afficher un bandeau à la première visite avec les boutons « Accepter » et « Refuser » avant tout dépôt de cookie publicitaire.', ['Accepter et refuser.'], 2),
          ],
        },
      ],
    },

    /* ================================ MISSION 2 ================================ */
    {
      id: 'mission-2',
      kind: 'mission',
      number: 2,
      title: 'Réapprovisionner les stocks',
      guidance: 'accompagné',
      message: { from: 'Karim Robin', role: 'Responsable logistique et commercial', text: [`Nous sommes le 14 novembre. Prépare la commande de produits Arlo à passer à ${FOURNISSEUR.nom}. Je la contrôlerai avant envoi.`] },
      documents: [
        {
          id: 's1-m2-doc1',
          number: 1,
          title: 'État des stocks Arlo au 14 novembre',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Stock', 'Stock d’alerte', 'Stock maximum', 'Conditionnement'],
              align: ['left', 'left', 'right', 'right', 'right', 'right'],
              rows: REAPPRO.map((p) => [p.ref, p.name, String(p.stock), String(p.alerte), String(p.max), `lot de ${p.cond}`]),
            },
            { type: 'note', text: 'On commande dès que le stock atteint le stock d’alerte, sans jamais dépasser le stock maximum, par lots entiers.' },
          ],
        },
        {
          id: 's1-m2-doc2',
          number: 2,
          title: 'Fiche fournisseur et nouvelles références',
          look: 'fiche',
          blocks: [
            { type: 'facts', items: [['Fournisseur', `${FOURNISSEUR.nom}, 10 rue des Marchands, 67000 Strasbourg`], ['Remise', `${FOURNISSEUR.remise} % sur tous les articles`], ['Règlement', 'Virement fin de mois'], ['Port', 'Franco de port'], ['Délai de livraison', `${FOURNISSEUR.delai} jours`]] },
            {
              type: 'table',
              caption: 'Prix d’achat HT unitaires',
              head: ['Article', 'Prix d’achat HT'],
              align: ['left', 'right'],
              rows: [...REAPPRO.filter((p) => p.commande).map((p) => [p.name, eur(PA[p.id])]), ...NOUVELLES.map((n) => [`${n.name} (nouveau, lot de ${n.cond})`, eur(n.pa)])],
            },
            { type: 'note', text: 'Nouvelles références à commander : 30 articles de chacune.' },
          ],
        },
      ],
      activities: [
        {
          id: 's1-m2-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Fiche de réapprovisionnement',
          instructions: 'Pour chaque référence, décide s’il faut commander et calcule la quantité (0 si pas de commande).',
          helps: ['On commande si stock ≤ stock d’alerte.', 'Quantité = stock maximum − stock, arrondie au multiple inférieur du conditionnement.', 'Pryde : 15 − 5 = 10, lots de 2 → 10. Kerrigan : 15 − 6 = 9, lots de 4 → 8.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Commande ?', 'Quantité commandée'],
          fields: REAPPRO.flatMap((p): Field[] => [
            { id: `${p.id}.0`, label: p.name, kind: 'choice', options: OUI_NON, answer: p.commande ? 'oui' : 'non', explain: p.commande ? `${p.stock} ≤ ${p.alerte}.` : `${p.stock} > ${p.alerte}.` },
            num(`${p.id}.1`, p.name, p.qte, p.commande ? `${p.max} − ${p.stock} = ${p.max - p.stock} → ${p.qte} (lots de ${p.cond}).` : '0.'),
          ]),
        },
        {
          id: 's1-m2-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Bon de commande',
          instructions: 'Calcule le montant brut de la commande (références à réapprovisionner + nouvelles références), la remise et le net commercial.',
          helps: ['Montant de chaque ligne = quantité × prix d’achat HT.', `Additionne toutes les lignes, puis applique ${FOURNISSEUR.remise} % de remise.`, 'Net commercial = montant brut − remise.'],
          outcomeIds: R1,
          fields: [
            num('lignes', '1. Nombre de lignes sur le bon de commande', BON.lignes.length, `${BON.lignes.length - 2} réapprovisionnements + 2 nouvelles références.`),
            num('brut', '2. Montant brut HT', BON.brut, BON.lignes.map((l) => `${l.qte} × ${fr(l.pa)}`).join(' + ') + ` = ${fr(BON.brut)} €.`, '€', 0.021),
            num('remise', `3. Remise de ${FOURNISSEUR.remise} %`, BON.remise, `${fr(BON.brut)} × 15 % = ${fr(BON.remise)} €.`, '€', 0.021),
            num('net', '4. Net commercial HT', BON.net, `${fr(BON.brut)} − ${fr(BON.remise)} = ${fr(BON.net)} €.`, '€', 0.021),
          ],
        },
      ],
    },

    /* ================================ MISSION 3 ================================ */
    {
      id: 'mission-3',
      kind: 'mission',
      number: 3,
      title: 'Réceptionner et contrôler la livraison',
      guidance: 'accompagné',
      message: { from: 'Karim Robin', role: 'Responsable logistique et commercial', text: ['La commande 372 arrive aujourd’hui, 19 novembre. Le transporteur vient d’arriver : applique notre procédure de réception et sois vigilant.'] },
      documents: [
        {
          id: 's1-m3-doc1',
          number: 1,
          title: 'Procédure de réception',
          look: 'procedure',
          blocks: [
            {
              type: 'list',
              items: [
                '1. Accueillir le livreur ; vérifier le destinataire.',
                '2. Récupérer le bordereau de livraison et le document de transport.',
                '3. Mettre à jour le planning de suivi des commandes.',
                '4. Contrôler l’état apparent des colis ; accepter ou refuser.',
                '5. Écrire les réserves précises sur le document de transport, le signer et le rendre au chauffeur.',
                '6. Déballer, ranger par référence, rapprocher bon de commande, bordereau et produits reçus.',
                '7. Compléter la fiche de contrôle.',
                '8. Confirmer les réserves au transporteur sous 3 jours ; informer le fournisseur des anomalies.',
              ],
            },
          ],
        },
        {
          id: 's1-m3-doc2',
          number: 2,
          title: 'Constat au déballage des 2 palettes',
          look: 'postit',
          blocks: [{ type: 'p', text: 'Sacs Tabbi mini : seulement 2 lots de 10 au lieu de 3, et 1 lot de 10 abîmé (bandoulières arrachées). Lea03 : 4 lots reçus, dont 8 paires endommagées (boîtes écrasées). Tout le reste est conforme.' }],
        },
        {
          id: 's1-m3-doc3',
          number: 3,
          title: 'Bordereau de livraison n° 20367',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Unité', 'Qté commandée', 'Lots livrés'],
              align: ['left', 'left', 'left', 'right', 'right'],
              rows: RECEPTION.map((r) => [r.ref, r.name, `lot de ${r.lot}`, String(r.cmd), String(r.bl)]),
            },
          ],
        },
      ],
      activities: [
        {
          id: 's1-m3-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Étapes de la réception',
          instructions: 'Réponds sur les premières étapes de la procédure.',
          helps: ['Les réserves s’écrivent sur le document de transport, avant le départ du chauffeur.', 'Elles doivent être précises.', 'Elles sont confirmées au transporteur sous 3 jours.'],
          outcomeIds: R1,
          fields: [
            { id: 'quand', label: '1. Quand écrire les réserves ?', kind: 'choice', options: [{ value: 'avant', label: 'Sur le document de transport, avant le départ du chauffeur' }, { value: 'apres', label: 'Le lendemain, par courriel' }], answer: 'avant', explain: 'Étape 5 de la procédure.' },
            { id: 'reserve', label: '2. Quelle réserve est recevable ?', kind: 'choice', options: [{ value: 'precise', label: '« 1 lot de 10 sacs réf. 006 319 abîmé, bandoulières arrachées ; 8 paires réf. 073 649 boîtes écrasées »' }, { value: 'vague', label: '« Sous réserve de déballage »' }], answer: 'precise', explain: 'Une réserve vague n’a aucune valeur.' },
            num('delai', '3. Délai pour confirmer les réserves au transporteur', 3, '3 jours.', 'jours'),
          ],
        },
        PLANNING,
        {
          id: 's1-m3-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Fiche de contrôle',
          instructions: 'Pour chaque référence, calcule les unités livrées d’après le bordereau, puis indique l’anomalie constatée au déballage (document 2).',
          helps: ['Unités = lots livrés × unités par lot.', 'Compare ensuite au constat du document 2.', 'Tabbi : 3 lots annoncés, 2 reçus dont 1 abîmé → manquants et endommagés.'],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Unités annoncées (BL)', 'Anomalie'],
          fields: RECEPTION.flatMap((r): Field[] => [
            num(`${r.id}.0`, r.name, r.blUnites, `${r.bl} × ${r.lot} = ${r.blUnites}.`),
            { id: `${r.id}.1`, label: r.name, kind: 'choice', select: true, options: ANOMALIES, answer: r.anomalie, explain: ANOMALIES.find((a) => a.value === r.anomalie)!.label + '.' },
          ]),
        },
        {
          id: 's1-m3-a4',
          kind: 'open',
          label: 'Annexe 4',
          title: 'Prévenir le fournisseur',
          instructions: `Rédige le message téléphonique à laisser à ${FOURNISSEUR.nom} pour signaler les anomalies de la commande 372.`,
          helps: ['Présente-toi et cite le numéro de commande.', 'Énumère les anomalies avec références et quantités.', 'Demande le remplacement ou un avoir, et laisse un numéro de rappel.'],
          outcomeIds: R1,
          prompts: [{ id: 'message', label: 'Message téléphonique', lines: 7 }],
          selfCheck: ['Je me présente et je cite la commande 372.', 'Les deux anomalies sont précises (références, quantités).', 'Je propose une solution (renvoi, avoir).', 'Le ton est poli et le message court.'],
        },
      ],
    },

    /* ================================ MISSION 4 ================================ */
    {
      id: 'mission-4',
      kind: 'mission',
      number: 4,
      title: 'Gérer les stocks',
      guidance: 'autonome',
      message: { from: 'Karim Robin', role: 'Responsable logistique et commercial', text: ['Fais le point sur la valeur du stock de baskets homme, puis calcule les indicateurs de suivi des accessoires du 3ᵉ trimestre. Je veux le moins de stock mort possible.'] },
      documents: [
        {
          id: 's1-m4-doc1',
          number: 1,
          title: 'État des stocks — baskets homme, 20 novembre',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Désignation', 'Quantité', 'PV HT', 'PA HT'],
              align: ['left', 'left', 'right', 'right', 'right'],
              rows: STOCK_BASKETS.map((s) => [s.ref, s.name, String(s.qte), eur(s.pv), eur(s.pa)]),
            },
          ],
        },
        {
          id: 's1-m4-doc2',
          number: 2,
          title: 'Cadencier des accessoires — 3ᵉ trimestre',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Stock au 1ᵉʳ juillet', 'Ventes juillet', 'Ventes août', 'Ventes septembre', 'Stock final'],
              align: ['left', 'right', 'right', 'right', 'right', 'right'],
              rows: CADENCIER.map((c) => [c.ref, String(c.si), ...c.v.map(String), String(c.sf)]),
            },
            { type: 'note', text: 'Objectifs de l’entreprise : coefficient de rotation d’au moins 3 sur le trimestre, durée de stockage inférieure à 30 jours. Arrondis au dixième.' },
          ],
        },
      ],
      activities: [
        {
          id: 's1-m4-a0',
          kind: 'grid',
          label: 'Annexe 1 (tableau)',
          title: 'Tableau de valorisation du stock de baskets',
          instructions: 'Valorise chaque ligne du stock au prix d’achat et au prix de vente HT. Tu peux reproduire ce tableau dans un tableur.',
          helps: ['Valeur au PA = quantité × PA HT.', 'Valeur au PV = quantité × PV HT.', 'Lacet Classic : 6 × 38 = 228 € ; 6 × 79,90 = 479,40 €.'],
          outcomeIds: R2,
          groups: [
            { label: 'Données', columns: ['Quantité', 'PV HT', 'PA HT'] },
            { label: 'Valorisation', columns: ['Valeur au PA', 'Valeur au PV'] },
          ],
          rows: STOCK_BASKETS.map((b) => ({
            id: b.ref.replace(' ', ''),
            label: `${b.ref} — ${b.name}`,
            cells: [b.qte, b.pv, b.pa, { answer: b.valeurPa, explain: `${b.qte} × ${fr(b.pa)} = ${fr(b.valeurPa)} €.`, tolerance: 0.011 }, { answer: b.valeurPv, explain: `${b.qte} × ${fr(b.pv)} = ${fr(b.valeurPv)} €.`, tolerance: 0.011 }],
          })),
        },
        {
          id: 's1-m4-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Valoriser le stock',
          instructions: 'Calcule la valeur totale du stock de baskets au prix d’achat et au prix de vente.',
          helps: ['Valeur d’une ligne = quantité × prix.', 'Additionne les six lignes.', 'Le stock se valorise au prix d’achat dans les comptes.'],
          outcomeIds: R2,
          fields: [
            num('pa', 'Valeur du stock au PA HT', STOCK_TOTAL.pa, STOCK_BASKETS.map((s) => `${s.qte} × ${fr(s.pa)}`).join(' + ') + ` = ${fr(STOCK_TOTAL.pa)} €.`, '€', 0.021),
            num('pv', 'Valeur du stock au PV HT', STOCK_TOTAL.pv, `${fr(STOCK_TOTAL.pv)} €.`, '€', 0.021),
          ],
        },
        {
          id: 's1-m4-a2',
          kind: 'grid',
          label: 'Annexe 2',
          title: 'Indicateurs des stocks',
          instructions: 'Calcule, pour chaque référence, les ventes du trimestre, le stock moyen, le coefficient de rotation et la durée de stockage. La première ligne est donnée en exemple.',
          helps: ['Ventes = somme des trois mois ; stock moyen = (stock au 1ᵉʳ juillet + stock final) ÷ 2.', 'Coefficient = ventes ÷ stock moyen ; durée = 90 ÷ coefficient.', 'Arrondis chaque résultat au dixième avant de continuer.'],
          outcomeIds: R23,
          groups: [{ label: '3ᵉ trimestre', columns: ['Ventes', 'Stock moyen', 'Coefficient', 'Durée (jours)'] }],
          rows: CADENCIER.map((c, i) => {
            const cell = (answer: number, explain: string, tolerance?: number) => (i === 0 ? answer : { answer, explain, tolerance });
            return {
              id: c.ref.replace(' ', ''),
              label: c.ref,
              cells: [
                cell(c.ventes, `${c.v.join(' + ')} = ${c.ventes}.`),
                cell(c.moyen, `(${c.si} + ${c.sf}) ÷ 2 = ${fr(c.moyen, 1)}.`, 0.06),
                cell(c.coef, `${c.ventes} ÷ ${fr(c.moyen, 1)} = ${fr(c.coef, 1)}.`, 0.06),
                cell(c.duree, `90 ÷ ${fr(c.coef, 1)} = ${fr(c.duree, 1)} jours.`, 0.16),
              ],
            };
          }),
        },
        {
          id: 's1-m4-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Analyser et agir',
          instructions: 'Pour chaque référence, indique si les objectifs sont atteints et l’action à proposer.',
          helps: ['Objectifs : coefficient ≥ 3 et durée < 30 jours.', 'Un stock qui tourne trop lentement immobilise de l’argent.', 'Action : réduire les commandes ou animer les ventes.'],
          outcomeIds: R3,
          layout: 'columns',
          columns: ['Objectifs atteints ?', 'Action'],
          fields: CADENCIER.flatMap((c): Field[] => [
            { id: `${c.ref.replace(' ', '')}.0`, label: c.ref, kind: 'choice', options: OUI_NON, answer: c.ok ? 'oui' : 'non', explain: `Coefficient ${fr(c.coef, 1)}, durée ${fr(c.duree, 1)} jours.` },
            {
              id: `${c.ref.replace(' ', '')}.1`,
              label: c.ref,
              kind: 'choice',
              select: true,
              options: [
                { value: 'maintenir', label: 'Maintenir la gestion actuelle' },
                { value: 'reduire', label: 'Réduire les commandes et mettre le produit en avant' },
              ],
              answer: c.ok ? 'maintenir' : 'reduire',
              explain: c.ok ? 'Le stock tourne bien.' : 'Le stock tourne trop lentement : risque de stock mort.',
            },
          ]),
        },
        {
          id: 's1-m4-a4',
          kind: 'fields',
          label: 'Annexe 2 (analyse)',
          title: 'Rédiger l’analyse et l’action à proposer',
          instructions: 'Pour chaque référence qui n’atteint pas les objectifs, rédige l’analyse et l’action proposée, comme dans l’exemple de la première ligne.',
          helps: ['Compare le coefficient à 3 et la durée à 30 jours.', 'Un coefficient faible = un stock qui dort.', 'Actions : réduire la prochaine commande, mettre le produit en avant, proposer une offre.'],
          outcomeIds: R3,
          fields: [
            { id: 'exemple', label: `Exemple — ${CADENCIER[0].ref}`, kind: 'given', value: `Coefficient ${fr(CADENCIER[0].coef, 1)}, bien supérieur à 3 ; durée de ${fr(CADENCIER[0].duree, 1)} jours : conforme aux attentes.` },
            ...CADENCIER.filter((c) => !c.ok).map((c) => w(`an-${c.ref.replace(' ', '')}`, c.ref, `Coefficient de ${fr(c.coef, 1)} et durée de ${fr(c.duree, 1)} jours : objectifs non atteints, le stock tourne trop lentement. Réduire la prochaine commande et mettre l’article en avant sur la page d’accueil du site.`, ['Je compare aux objectifs.', 'Je propose une action.'], 3)),
          ],
        },
      ],
    },

    /* ================================ MISSION 5 ================================ */
    {
      id: 'mission-5',
      kind: 'mission',
      number: 5,
      title: 'Participer à la réorganisation du stock de produits',
      guidance: 'autonome',
      message: { from: 'Karim Robin', role: 'Responsable logistique et commercial', text: ['Je veux revoir l’implantation de l’entrepôt pour limiter les déplacements : les articles qui sortent le plus (classe A) seront rangés près de la zone de préparation. Classe les références de la famille Ados selon la méthode ABC.'] },
      documents: [
        {
          id: 's1-m5-doc1',
          number: 1,
          title: 'Sorties du 3ᵉ trimestre — famille Ados',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Référence', 'Quantités sorties', 'Référence', 'Quantités sorties'],
              align: ['left', 'right', 'left', 'right'],
              rows: MOUVEMENTS.slice(0, 10).map(([r, q], i) => [r, String(q), MOUVEMENTS[i + 10][0], String(MOUVEMENTS[i + 10][1])]),
            },
            { type: 'note', text: 'Méthode ABC : classer par sorties décroissantes et cumuler les pourcentages. Classe A : les références qui réalisent les premiers 80 % des sorties ; B : de 80 à 95 % ; C : les dernières 5 %.' },
          ],
        },
      ],
      activities: [
        {
          id: 's1-m5-a0',
          kind: 'grid',
          label: 'Annexe (tableau)',
          title: 'Tableau d’analyse ABC',
          instructions: 'Les références sont déjà classées par sorties décroissantes. Calcule la part de chaque référence et le cumul des pourcentages (au centième). Tu peux reproduire ce tableau dans un tableur.',
          helps: [`Part = sorties ÷ ${ABC.total} × 100.`, 'Cumul = cumul de la ligne précédente + part de la ligne.', 'Classe A tant que le cumul précédent est inférieur à 80 %.'],
          outcomeIds: R3,
          groups: [
            { label: 'Données', columns: ['Rang', 'Sorties'] },
            { label: 'Analyse', columns: ['Part (%)', 'Cumul (%)'] },
          ],
          rows: ABC.rows.map((r) => ({
            id: `abc${r.rang}`,
            label: r.ref,
            cells: [r.rang, r.q, { answer: r.part, explain: `${r.q} ÷ ${ABC.total} × 100 = ${fr(r.part)} %.`, tolerance: 0.011 }, { answer: r.cumP, explain: `Cumul : ${fr(r.cumP)} %.`, tolerance: 0.021 }],
          })),
          legend: 'Classe A : premiers 80 % des sorties · B : de 80 à 95 % · C : derniers 5 %',
        },
        {
          id: 's1-m5-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Classer les références selon la méthode ABC',
          instructions: 'Calcule le total des sorties, puis identifie les références de classe A.',
          helps: ['Additionne les 20 quantités.', 'Range les quantités de la plus grande à la plus petite et cumule.', `Arrête la classe A quand le cumul atteint 80 % du total (${ABC.total} × 80 % = ${fr(ABC.total * 0.8)}).`],
          outcomeIds: R3,
          fields: [
            num('total', '1. Total des sorties du trimestre', ABC.total, `${ABC.total} articles.`),
            {
              id: 'classeA',
              label: '2. Références de classe A (plusieurs réponses)',
              kind: 'multi',
              options: ABC.rows.slice(0, 9).map((r) => ({ value: r.ref, label: r.ref })).sort((a, b) => a.label.localeCompare(b.label)),
              answers: ABC.rows.filter((r) => r.classe === 'A').map((r) => r.ref),
              explain: `Classe A : ${ABC.rows.filter((r) => r.classe === 'A').map((r) => `${r.ref} (${r.q})`).join(', ')}.`,
            },
            num('partRef', '3. Part des références en classe A', r2((ABC.rows.filter((r) => r.classe === 'A').length / ABC.rows.length) * 100), `${ABC.rows.filter((r) => r.classe === 'A').length} ÷ 20 × 100.`, '%', 0.01),
            { id: 'ou', label: '4. Où ranger les références de classe A ?', kind: 'choice', options: [{ value: 'pres', label: 'Près de la zone de préparation des commandes' }, { value: 'fond', label: 'Au fond de l’entrepôt' }], answer: 'pres', explain: 'Elles sont prélevées le plus souvent.' },
          ],
        },
        {
          id: 's1-m5-a2',
          kind: 'fields',
          label: 'Présentation',
          title: 'Préparer la présentation orale',
          instructions: 'Prépare ce que tu diras à l’autre groupe pour présenter ta liste.',
          helps: ['Annonce la méthode utilisée.', 'Cite les références de classe A et leur part des sorties.', 'Termine par l’intérêt de les rapprocher de la zone de préparation.'],
          outcomeIds: R3,
          fields: [w('oral', 'Ce que je présente', `Nous avons classé les 20 références par sorties décroissantes et cumulé les pourcentages. ${ABC.rows.filter((r) => r.classe === 'A').length} références réalisent environ 80 % des sorties : ce sont les articles de classe A. Les ranger près de la zone de préparation réduit les déplacements et accélère les commandes.`, ['Méthode expliquée.', 'Classe A citée.', 'Intérêt pour l’entrepôt.'], 6)],
        },
      ],
    },

    /* ================================ MISSION 6 ================================ */
    {
      id: 'mission-6',
      kind: 'mission',
      number: 6,
      title: 'Déterminer un prix psychologique',
      guidance: 'autonome',
      message: { from: 'Karim Robin', role: 'Responsable logistique et commercial', text: [`Pour finir, il faut fixer le prix du nouveau sac Tabbi mini. Trouve le prix qui touche le maximum de clients, à partir de l’enquête menée auprès de ${PSY_SAC.n} clients.`] },
      documents: [
        {
          id: 's1-m6-doc1',
          number: 1,
          title: `Résultats de l’enquête auprès de ${PSY_SAC.n} clients`,
          look: 'fiche',
          blocks: [
            {
              type: 'table',
              head: ['Prix de vente', '« Trop cher » au-dessus de ce prix', '« Mauvaise qualité » en dessous de ce prix'],
              align: ['left', 'right', 'right'],
              rows: ENQUETE_SAC.prices.map((p, i) => [eur(p), String(ENQUETE_SAC.tropCher[i]), String(ENQUETE_SAC.qualite[i])]),
            },
          ],
        },
      ],
      activities: [
        GRID_PSY,
        {
          id: 's1-m6-a2',
          kind: 'fields',
          label: 'Décision',
          title: 'Fixer le prix',
          instructions: 'Conclus.',
          helps: ['Cherche le pourcentage d’acheteurs le plus élevé.', `Le sac coûte ${eur(NOUVELLES[1].pa)} HT à l’achat, avant remise.`, 'Le prix retenu doit rester bien supérieur au coût d’achat.'],
          outcomeIds: R3,
          fields: [
            num('prix', '1. Prix psychologique', PSY_SAC.best.price, `${eur(PSY_SAC.best.price)} : ${fr(PSY_SAC.best.acheteurs, 1)} % d’acheteurs potentiels.`, '€', 0.001),
            num('ach', '2. Pourcentage d’acheteurs potentiels', PSY_SAC.best.acheteurs, `${fr(PSY_SAC.best.acheteurs, 1)} %.`, '%', 0.26),
            { id: 'rentable', label: '3. Ce prix est-il compatible avec le coût d’achat ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: `${eur(PSY_SAC.best.price)} TTC contre ${eur(NOUVELLES[1].pa)} HT d’achat : la marge est confortable.` },
          ],
        },
      ],
      selfAssessment: ['J’ai mené toutes les missions dans l’ordre, en contrôlant mes résultats.', 'J’ai travaillé de façon organisée et vigilante.'],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais vérifier la conformité d’un site marchand.',
        'Je sais établir une commande en respectant les niveaux de stock et le conditionnement.',
        'Je sais réceptionner, contrôler une livraison et prévenir le fournisseur.',
        'Je sais valoriser un stock et calculer ses indicateurs.',
        'Je sais appliquer la méthode ABC.',
        'Je sais déterminer un prix psychologique.',
      ],
    },
  ],
};
