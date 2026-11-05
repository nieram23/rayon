import type { Chapter, ChoiceOption, Field, StorePlan } from '../../domain/chapter';

/**
 * DOSSIER 4 — Agencer la surface de vente en respectant les règles d'hygiène et de sécurité
 *
 * Progression calquée sur le manuel de référence (contexte, 5 missions, synthèse, 3 applications).
 * Magasins, marques, personnages, documents et chiffres : ORIGINAUX et fictifs.
 * Les repères réglementaires (accessibilité, port de charges, DEEE, températures) sont des règles générales,
 * simplifiées pour la classe. Tous les résultats chiffrés sont calculés ici puis testés.
 */

const R1 = ['d04-r1']; // L'agencement de l'unité commerciale est pertinent.
const R2 = ['d04-r2']; // Les déchets sont valorisés et le gaspillage est réduit.
const R3 = ['d04-r3']; // Les règles d'hygiène et de sécurité sont respectées.
const R13 = ['d04-r1', 'd04-r3'];
const OUI_NON: ChoiceOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];
export const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : d, maximumFractionDigits: d });
const eur = (n: number) => `${n.toLocaleString('fr-FR')} €`;
const num = (id: string, label: string, answer: number, explain: string, unit?: string, tolerance?: number): Field => ({ id, label, kind: 'number', answer, explain, unit, tolerance });
const letters = (ls: string[]): ChoiceOption[] => ls.map((l) => ({ value: l, label: `Repère ${l}` }));

/* =============================== Mission 1 : plan du local =============================== */

export const PLAN_LOCAL: StorePlan = {
  title: 'Plan du local avant aménagement (1 carreau ≈ 1 m)',
  width: 24,
  height: 15,
  areas: [
    { x: 0, y: 0, w: 9, h: 5, tone: 'gris', dashed: true },
    { x: 9, y: 0, w: 4, h: 3, tone: 'gris', dashed: true },
    { x: 13, y: 0, w: 4, h: 3, label: 'Bureau', tone: 'violet' },
    { x: 0.5, y: 13.6, w: 8, h: 1.2, tone: 'bleu', dashed: true },
    { x: 15.5, y: 13.6, w: 8, h: 1.2, label: 'Vitrine', tone: 'bleu' },
    { x: 9.5, y: 13.6, w: 5, h: 1.2, tone: 'jaune', dashed: true },
    { x: 4, y: 7, w: 16, h: 5, label: 'Surface de vente', sub: '≈ 140 m²', tone: 'blanc', dashed: true },
  ],
  marks: [
    { x: 4.5, y: 2.5, kind: 'lettre', label: 'A' },
    { x: 11, y: 1.5, kind: 'lettre', label: 'B' },
    { x: 4.5, y: 12.6, kind: 'lettre', label: 'C' },
    { x: 12, y: 12.6, kind: 'lettre', label: 'D' },
    { x: 4.5, y: 0.4, kind: 'entree', label: 'LIVRAISON' },
    { x: 1.2, y: 6.2, kind: 'sortie' },
    { x: 22.6, y: 5, kind: 'sortie' },
    { x: 8.2, y: 5.8, kind: 'extincteur' },
    { x: 18, y: 11.5, kind: 'extincteur' },
  ],
  legend: 'La façade donne sur la galerie marchande (bas du plan). L’accès livraison donne sur la cour de service (haut du plan).',
};

export const ACCESS = [
  { id: 'banque', label: 'Banque d’accueil et caisse : hauteur 0,95 m', value: 0.95, rule: 0.8, sens: 'max' as const, unit: 'm', explain: 'Une partie de la banque doit être à 0,80 m au plus, avec un vide en dessous pour les genoux.' },
  { id: 'allee', label: 'Allée principale : largeur 1,40 m', value: 1.4, rule: 1.2, sens: 'min' as const, unit: 'm', explain: 'Au moins 1,20 m : 1,40 m convient.' },
  { id: 'second', label: 'Allées secondaires : largeur 0,80 m', value: 0.8, rule: 0.9, sens: 'min' as const, unit: 'm', explain: 'Au moins 0,90 m : il faut élargir.' },
  { id: 'presentoir', label: 'Présentoir de casques : produits à partir de 0,50 m du sol', value: 0.5, rule: 0.4, sens: 'min' as const, unit: 'm', explain: 'Les produits en libre-service doivent être entre 0,40 m et 1,30 m : 0,50 m convient.' },
  { id: 'enseigne', label: 'Panneau suspendu « Nouveautés » : bas du panneau à 2,00 m', value: 2, rule: 2.2, sens: 'min' as const, unit: 'm', explain: 'Un élément en hauteur dans une circulation doit laisser au moins 2,20 m de passage.' },
].map((a) => ({ ...a, conforme: a.sens === 'max' ? a.value <= a.rule : a.value >= a.rule }));

/* =============================== Mission 3 : zones et CA =============================== */

export const ZONE_PRODUCTS = [
  { id: 'casques', name: 'Casques sans fil, nouvelle gamme', note: 'Nouveauté, produit phare de l’enseigne', ca: 21500, zone: 1 },
  { id: 'access', name: 'Câbles, piles, adaptateurs', note: 'Petits prix, achats d’impulsion', ca: 4500, zone: 2 },
  { id: 'portables', name: 'Enceintes portables', note: 'En promotion pour la rentrée', ca: 8200, zone: 3 },
  { id: 'multiroom', name: 'Enceintes connectées multiroom', note: 'Offre de lancement à −20 %', ca: 5300, zone: 3 },
  { id: 'ecouteurs', name: 'Écouteurs filaires et étuis', note: 'Achats d’impulsion, complémentaires des casques', ca: 2500, zone: 4 },
  { id: 'tv', name: 'Téléviseurs grand écran', note: 'Produit volumineux, que le client vient chercher', ca: 7000, zone: 5 },
  { id: 'vinyle', name: 'Platines vinyle et amplificateurs', note: 'Clientèle de passionnés, achat réfléchi', ca: 3000, zone: 6 },
];
export const ZONE_TOTAL = ZONE_PRODUCTS.reduce((n, p) => n + p.ca, 0);
export const zonePart = (ca: number) => r2((ca / ZONE_TOTAL) * 100);
const pairCa = (a: number, b: number) => ZONE_PRODUCTS.filter((p) => p.zone === a || p.zone === b).reduce((n, p) => n + p.ca, 0);
export const ZONE_PAIRS = [
  { id: 'z12', label: 'Zones 1 et 2', ca: pairCa(1, 2), repere: 'environ 50 %' },
  { id: 'z34', label: 'Zones 3 et 4', ca: pairCa(3, 4), repere: '25 à 35 %' },
  { id: 'z56', label: 'Zones 5 et 6', ca: pairCa(5, 6), repere: '15 à 25 %' },
].map((z) => ({ ...z, part: zonePart(z.ca) }));
const ZONE_OPTIONS: ChoiceOption[] = [1, 2, 3, 4, 5, 6].map((z) => ({ value: String(z), label: `Zone ${z}` }));

const ZONES_PLAN: StorePlan = {
  title: 'Les six zones d’un magasin (entrée à droite, caisse à gauche)',
  width: 24,
  height: 14,
  areas: [
    { x: 15, y: 8, w: 8, h: 4, label: 'Zone 1', sub: 'après l’entrée', tone: 'rose' },
    { x: 1, y: 8, w: 7, h: 4, label: 'Zone 2', sub: 'abords de la caisse', tone: 'rose' },
    { x: 15, y: 1, w: 8, h: 6, label: 'Zone 3', sub: 'mur de droite', tone: 'orange' },
    { x: 9, y: 4.5, w: 5, h: 7.5, label: 'Zone 4', sub: 'allée centrale', tone: 'orange' },
    { x: 7, y: 1, w: 7, h: 3, label: 'Zone 5', sub: 'fond du magasin', tone: 'bleu' },
    { x: 1, y: 1, w: 5, h: 6, label: 'Zone 6', sub: 'coin du fond', tone: 'bleu' },
  ],
  marks: [
    { x: 19, y: 13.2, kind: 'entree', label: 'ENTRÉE' },
    { x: 4, y: 13, kind: 'caisse' },
  ],
  arrows: [
    { points: [[19, 12.7], [14.5, 12.4], [14.5, 4.25], [8.5, 4.25], [8.5, 12.4], [6, 12.8]], tone: 'rouge' },
  ],
  legend: 'Zones roses : 1 et 2. Zones orange : 3 et 4. Zones bleues : 5 et 6. La flèche rouge montre le parcours habituel des clients.',
};

export const IMPLANTATION_1: StorePlan = {
  title: 'Implantation 1',
  width: 24,
  height: 14,
  areas: [
    { x: 16, y: 7.5, w: 7, h: 4, label: 'Casques', tone: 'rose' },
    { x: 15, y: 1, w: 8, h: 5.5, label: 'Enceintes', tone: 'orange' },
    { x: 7, y: 1, w: 7, h: 3, label: 'Téléviseurs', tone: 'bleu' },
    { x: 1, y: 1, w: 5, h: 6, label: 'Vinyle', tone: 'bleu' },
    { x: 9.5, y: 5, w: 4, h: 6.5, label: 'Écouteurs', tone: 'orange' },
    { x: 1, y: 8, w: 6, h: 3, label: 'Accessoires', tone: 'rose' },
  ],
  marks: [
    { x: 19.5, y: 13.2, kind: 'entree', label: 'ENTRÉE' },
    { x: 4, y: 12.4, kind: 'caisse' },
    { x: 20, y: 11.9, kind: 'lettre', label: 'P' },
    { x: 21.8, y: 1.9, kind: 'lettre', label: 'Q' },
    { x: 2, y: 2, kind: 'lettre', label: 'R' },
  ],
  arrows: [{ points: [[19.5, 12.7], [14.5, 12.3], [14.5, 4.5], [8.3, 4.5], [8.3, 12], [6, 12.4]], tone: 'rouge' }],
};

export const IMPLANTATION_2: StorePlan = {
  title: 'Implantation 2',
  width: 24,
  height: 14,
  areas: [
    { x: 16, y: 7.5, w: 7, h: 4, label: 'Téléviseurs', tone: 'bleu' },
    { x: 15, y: 1, w: 8, h: 5.5, label: 'Accessoires', tone: 'rose' },
    { x: 7, y: 1, w: 7, h: 3, label: 'Casques', tone: 'rose' },
    { x: 1, y: 1, w: 5, h: 6, label: 'Enceintes', tone: 'orange' },
    { x: 9.5, y: 5, w: 4, h: 6.5, label: 'Vinyle', tone: 'bleu' },
    { x: 1, y: 8, w: 6, h: 3, label: 'Écouteurs', tone: 'orange' },
  ],
  marks: [
    { x: 4.5, y: 13.2, kind: 'entree', label: 'ENTRÉE' },
    { x: 19, y: 7, kind: 'caisse' },
  ],
  arrows: [{ points: [[4.5, 12.7], [8.3, 12.2], [8.3, 4.5], [14.5, 4.5], [14.5, 7], [16.5, 7]], tone: 'rouge' }],
};

/* =============================== Mission 4 : manutention =============================== */

export const PAUL = { age: 16, poids: 60 };
export const PAUL_MAX = r2(PAUL.poids * 0.2);
export const MATERIEL = [
  { value: 'main', label: 'À la main', max: 25 },
  { value: 'diable', label: 'Diable', max: 300 },
  { value: 'manuel', label: 'Transpalette manuel', max: 2000 },
  { value: 'electrique', label: 'Transpalette électrique', max: 1500 },
];
export const SITUATIONS = [
  { id: 's1', text: 'Ranger en rayon un carton de 6 casques', poids: 5, distance: 3, palette: false, answer: 'main' },
  { id: 's2', text: 'Monter 8 cartons de barres de son de 9 kg de la réserve au rayon', poids: 72, distance: 15, palette: false, answer: 'diable' },
  { id: 's3', text: 'Sortir du camion une palette de téléviseurs de 650 kg et la poser 5 m plus loin, dans la réserve', poids: 650, distance: 5, palette: true, answer: 'manuel' },
  { id: 's4', text: 'Transférer une palette d’enceintes de 1 200 kg du quai commun de la galerie jusqu’à la réserve, à 60 m', poids: 1200, distance: 60, palette: true, answer: 'electrique' },
  { id: 's5', text: 'Décaler de 3 m, dans la réserve, une palette de caissons de basses de 1 800 kg', poids: 1800, distance: 3, palette: true, answer: 'manuel' },
];
/** Règle du document : à la main ≤ 25 kg ; colis empilés ≤ 300 kg → diable ; palette : électrique si long trajet et ≤ 1 500 kg, sinon manuel. */
export function bestTool(s: { poids: number; distance: number; palette: boolean }): string {
  if (!s.palette) return s.poids <= 25 ? 'main' : 'diable';
  if (s.distance > 20 && s.poids <= 1500) return 'electrique';
  return 'manuel';
}

export const NIVEAUX: ChoiceOption[] = [
  { value: 'chapeau', label: 'Niveau chapeau (au-dessus de 1,70 m)' },
  { value: 'yeux', label: 'Niveau des yeux (1,20 m à 1,70 m)' },
  { value: 'mains', label: 'Niveau des mains (0,60 m à 1,20 m)' },
  { value: 'sol', label: 'Niveau du sol (sous 0,60 m)' },
];
export const PRODUITS_NIVEAUX = [
  { id: 'premium', name: 'Casque à réduction de bruit haut de gamme, 349 €, forte marge', answer: 'yeux', explain: 'Le niveau le plus vendeur accueille les produits à forte marge.' },
  { id: 'mdd', name: 'Écouteurs à la marque de l’enseigne', answer: 'mains', explain: 'Marques de l’enseigne, nouveautés et promotions se placent à portée de main.' },
  { id: 'promo', name: 'Housses de transport en promotion', answer: 'mains', explain: 'Promotion : niveau des mains.' },
  { id: 'caisson', name: 'Caisson de basses de 18 kg', answer: 'sol', explain: 'Produit lourd et volumineux : en bas, pour la sécurité et la manutention.' },
  { id: 'premier', name: 'Câbles audio premier prix', answer: 'sol', explain: 'Premiers prix : le client les cherche, ils vont en bas.' },
  { id: 'plv', name: 'Boîtes vides de démonstration et visuels légers', answer: 'chapeau', explain: 'Le niveau chapeau sert à la visibilité, avec des éléments légers uniquement.' },
];

/* =============================== Mission 5 : déchets =============================== */

export const DECHETS = [
  { id: 'cartons', text: 'Cartons vides de 40 × 40 cm, mis à plat', answer: 'bleu', explain: 'Emballages en carton pliés : conteneur bleu.' },
  { id: 'flacons', text: 'Flacons plastique vides de nettoyant pour écrans', answer: 'bleu', explain: 'Bouteilles et flacons en plastique : conteneur bleu.' },
  { id: 'bulle', text: 'Papier bulle de protection', answer: 'noir', explain: 'Les films et sacs plastiques ne vont pas dans le bleu : conteneur noir.' },
  { id: 'poly', text: 'Calages en polystyrène', answer: 'noir', explain: 'Le polystyrène est refusé dans le bleu : conteneur noir.' },
  { id: 'pots', text: 'Pots de café en verre de la salle de pause, sans couvercle', answer: 'vert', explain: 'Pots et bocaux en verre : conteneur vert.' },
  { id: 'bouteilles', text: 'Bouteilles d’eau gazeuse en verre', answer: 'vert', explain: 'Bouteilles en verre : conteneur vert.' },
  { id: 'scotch', text: 'Ruban adhésif usagé', answer: 'noir', explain: 'Déchet non recyclable : conteneur noir.' },
  { id: 'palettes', text: 'Palettes en bois non consignées', answer: 'decheterie', explain: 'Les palettes non consignées vont à la déchetterie.' },
  { id: 'grands', text: 'Grands cartons d’emballage de téléviseurs', answer: 'decheterie', explain: 'Les gros cartons se déposent à la déchetterie.' },
  { id: 'tv', text: 'Ancien téléviseur rapporté par un client qui en achète un neuf', answer: 'reprise', explain: 'Reprise « 1 pour 1 » obligatoire : filière des DEEE.' },
  { id: 'piles', text: 'Piles usagées déposées par les clients', answer: 'reprise', explain: 'Les piles suivent une filière de collecte spécifique.' },
];
export const DECHET_CATEGORIES = [
  { id: 'vert', label: 'Conteneur vert (verre)' },
  { id: 'bleu', label: 'Conteneur bleu (emballages, papiers)' },
  { id: 'noir', label: 'Conteneur noir (non recyclable)' },
  { id: 'decheterie', label: 'Déchetterie' },
  { id: 'reprise', label: 'Filière de reprise (DEEE, piles)' },
];

/* =============================== Applications =============================== */

export const RISQUES = [
  { id: 'lucas', text: 'Lucas, au laboratoire boucherie, part sans avoir nettoyé le sol en fin de journée.', risque: true, solution: 'nettoyer', explain: 'Graisse au sol : risque de chute et de développement des bactéries. Nettoyer et désinfecter avant de partir.' },
  { id: 'nadia', text: 'Nadia, au rayon fromage à la coupe, laisse ses couteaux sur le plan de travail pendant sa pause.', risque: true, solution: 'ranger', explain: 'Risque de coupure et d’hygiène : ranger les couteaux nettoyés dans leur support.' },
  { id: 'omar', text: 'Omar, à la boulangerie, porte chaque matin des sacs de farine de 40 kg sur plusieurs mètres.', risque: true, solution: 'materiel', explain: 'Charge trop lourde portée à la main : utiliser un diable et appliquer les gestes et postures.' },
  { id: 'sarah', text: 'Sarah, au rayon image et son, déballe des produits et laisse parfois les cartons dans l’allée.', risque: true, solution: 'allee', explain: 'Risque de chute pour les clients : évacuer les cartons au fur et à mesure, garder les allées dégagées.' },
  { id: 'lea', text: 'Léa, en caisse, ferme sa caisse avec sa clé et range son tiroir au coffre avant sa pause.', risque: false, solution: 'aucune', explain: 'Bonne pratique de sécurité : aucun risque.' },
  { id: 'vincent', text: 'Vincent, agent d’entretien, n’a pas le temps le samedi de vider les poubelles débordantes près des caisses.', risque: true, solution: 'poubelles', explain: 'Hygiène et image : renforcer les passages les jours d’affluence, vider avant débordement.' },
];
const SOLUTIONS: ChoiceOption[] = [
  { value: 'nettoyer', label: 'Nettoyer et désinfecter le sol avant de partir' },
  { value: 'ranger', label: 'Nettoyer les couteaux et les ranger dans leur support' },
  { value: 'materiel', label: 'Utiliser un matériel de manutention adapté' },
  { value: 'allee', label: 'Évacuer les cartons au fur et à mesure' },
  { value: 'poubelles', label: 'Prévoir des passages de vidage plus fréquents' },
  { value: 'aucune', label: 'Aucune : situation sans risque' },
];

export const TEMPERATURES: number[] = [
  -18, -19, -18, -18, -20, -18, -19, -18, -18, -19, -18, -18, -19, -18, -18, -15, -18, -19, -18, -18, -14, -18, -19, -18, -18, -19, -18, -18, -20, -18, -18,
];
export const SEUIL_NEG = -18;
export const JOURS_KO = TEMPERATURES.map((t, i) => ({ t, jour: i + 1 })).filter((x) => x.t > SEUIL_NEG);
export const ECART_MAX = Math.max(...TEMPERATURES) - SEUIL_NEG;

export const FROID_PLAN: StorePlan = {
  title: 'Supermarché Les Halles du Ried (1 carreau ≈ 2 m)',
  width: 30,
  height: 16,
  areas: [
    { x: 0, y: 0, w: 7, h: 16, tone: 'gris', label: 'Réserve' },
    { x: 0.5, y: 0.5, w: 6, h: 4, tone: 'froid', label: 'Chambre froide', sub: 'positive +3 °C' },
    { x: 0.5, y: 11.5, w: 6, h: 4, tone: 'froid', label: 'Chambre froide', sub: 'négative −18 °C' },
    { x: 0.5, y: 6, w: 6, h: 4, tone: 'orange', label: 'Réception', sub: 'quai livraison' },
    { x: 10, y: 3, w: 2, h: 8, tone: 'violet' },
    { x: 14, y: 3, w: 2, h: 8, tone: 'violet' },
    { x: 18, y: 3, w: 2, h: 8, tone: 'violet' },
    { x: 22, y: 3, w: 2, h: 8, tone: 'violet' },
  ],
  marks: [
    { x: 26.5, y: 15.3, kind: 'entree', label: 'ENTRÉE' },
    { x: 11, y: 14.3, kind: 'caisse' },
    { x: 15, y: 14.3, kind: 'caisse' },
    { x: 8.5, y: 2, kind: 'lettre', label: 'P' },
    { x: 27, y: 9, kind: 'lettre', label: 'Q' },
    { x: 8.5, y: 12.5, kind: 'lettre', label: 'R' },
    { x: 20, y: 1.2, kind: 'lettre', label: 'S' },
    { x: 7, y: 8, kind: 'sortie' },
  ],
  arrows: [{ points: [[26.5, 14.6], [27.5, 6], [26, 1.4], [10, 1.4], [8.6, 5], [8.6, 10], [10.5, 13.4]], tone: 'rouge' }],
  legend: 'Une porte de service relie la réserve à la surface de vente (pictogramme vert). La flèche rouge montre le parcours des clients.',
};

export const CINQ_M = [
  { id: 'planche', text: 'Une même planche à découper sert pour le poulet cru puis pour le jambon cuit.', answer: 'methodes', explain: 'Contamination croisée cru / cuit : erreur de méthode.' },
  { id: 'trancheuse', text: 'La trancheuse n’est pas démontée ni désinfectée après le service.', answer: 'materiel', explain: 'Matériel mal nettoyé.' },
  { id: 'souris', text: 'Des traces de souris sont repérées derrière les étagères de la réserve.', answer: 'milieu', explain: 'Nuisibles : milieu.' },
  { id: 'bijoux', text: 'Un vendeur garde ses bagues et ne se lave pas les mains en revenant de pause.', answer: 'main', explain: 'Hygiène du personnel : main-d’œuvre.' },
  { id: 'dlc', text: 'Un carton de yaourts est livré avec un emballage percé et une DLC dépassée.', answer: 'matieres', explain: 'Produit non conforme à la réception : matières premières.' },
  { id: 'ventil', text: 'La ventilation du laboratoire est en panne et la pièce est humide.', answer: 'milieu', explain: 'Aération et environnement de travail : milieu.' },
  { id: 'tenue', text: 'Une employée prépare les salades sans charlotte ni tablier propre.', answer: 'main', explain: 'Tenue du personnel : main-d’œuvre.' },
  { id: 'decongel', text: 'Des crevettes sont décongelées à température ambiante sur le plan de travail.', answer: 'methodes', explain: 'On décongèle au réfrigérateur, à +4 °C : erreur de méthode.' },
];

/* ================================================================================== */

export const D04: Chapter = {
  unitId: 'd04',
  mission:
    "Onde & Image veut installer une démonstration audio le samedi. Tu contrôles les circulations, proposes une implantation, rends les informations visibles et organises le traitement des déchets. Ton responsable attend une liste de corrections que l’équipe peut appliquer avant l’ouverture.",
  fictionNotice: 'L’enseigne Onde & Image, ses magasins, ses personnages et ses chiffres sont imaginaires. Les règles de sécurité citées sont des repères généraux simplifiés pour la classe.',
  company: {
    name: 'Onde & Image — Mulhouse',
    tagline: 'Boutique spécialisée son et image, 140 m² de vente',
    facts: [
      ['Ton poste', 'Élève en PFMP, préparation de l’ouverture'],
      ['Ton tuteur', 'Bastien Keller, gérant'],
      ['L’équipe', 'Yasmine Benali et Hugo Marchal (vendeurs), Paul Ritter (apprenti)'],
    ],
  },
  steps: [
    /* ================================ CONTEXTE ================================ */
    {
      id: 'ouverture',
      kind: 'ouverture',
      title: "Préparer un espace de démonstration accessible",
      hero: { id: 'd04-hero', alt: 'Boutique de matériel audio avec casques et enceintes exposés sur des murs lumineux' },
      message: {
        from: 'Bastien Keller',
        role: 'Gérant, Onde & Image Mulhouse',
        text: [
          'Bienvenue ! Dans trois semaines, nous ouvrons notre boutique dans la galerie marchande du centre-ville. Le local est encore vide : tout est à installer.',
          'Avant d’accueillir le moindre client, nous devons être irréprochables sur la sécurité. Lis la fiche de présentation de l’enseigne et complète la fiche d’identité.',
        ],
      },
      documents: [
        {
          id: "d04-revision-reperes",
          number: 3,
          title: "Trois repères pour commencer",
          look: "memo",
          blocks: [
            {
              type: "list",
              items: [
                "L’emprise est la place occupée par le meuble. Soustrais-la à la largeur initiale pour estimer le passage libre.",
                "Vérifie le mobilier, les câbles et la circulation dans la situation réelle, avec un client arrêté si l’installation est destinée à un essai.",
                "Utilise les limites indiquées dans les documents du cas. Elles décrivent la consigne de l’entreprise fictive."
              ]
            }
          ]
        },
        {
          id: 'd04-o-doc1',
          number: 1,
          title: 'L’enseigne Onde & Image',
          look: 'article',
          blocks: [
            {
              type: 'p',
              text: 'Onde & Image est un réseau de 65 boutiques franchisées spécialisées dans le son et l’image : casques, enceintes, téléviseurs, platines vinyle et accessoires. Chaque boutique appartient à un commerçant indépendant qui utilise l’enseigne, le concept de magasin et les fournisseurs du réseau, en échange d’une redevance.',
            },
            {
              type: 'list',
              title: 'Le concept de magasin',
              items: [
                'Des boutiques de 120 à 200 m² en centre-ville ou en galerie marchande.',
                'Des espaces d’écoute où le client teste les produits avant d’acheter.',
                'Des vendeurs experts qui conseillent et installent le matériel.',
              ],
            },
            {
              type: 'facts',
              items: [
                ['Boutique', 'Onde & Image, galerie marchande du centre-ville, 68100 Mulhouse'],
                ['Société', 'SARL Keller Audio, gérant Bastien Keller'],
                ['Surface', '140 m² de vente, 45 m² de réserve et locaux du personnel'],
                ['Classement', 'Établissement recevant du public (ERP) de type M (magasin), 5ᵉ catégorie'],
                ['Concurrents', 'Rayons image et son des hypermarchés, sites de vente en ligne'],
              ],
            },
          ],
        },
        {
          id: 'd04-o-doc2',
          number: 2,
          title: 'Courriel de la mairie',
          look: 'courriel',
          blocks: [
            { type: 'facts', items: [['De', 'Service urbanisme et sécurité, mairie de Mulhouse'], ['À', 'Bastien Keller'], ['Objet', 'Visite avant ouverture']] },
            {
              type: 'p',
              text: 'Monsieur, votre établissement recevra du public. Avant l’ouverture, nous vérifierons le respect des règles de sécurité incendie et d’accessibilité aux personnes handicapées. Merci de tenir à disposition le registre de sécurité, les attestations de vérification des extincteurs et le plan d’évacuation.',
            },
          ],
        },
      ],
      activities: [
        {
          id: 'd04-o-a1',
          kind: 'fields',
          label: 'Annexe',
          title: 'Fiche d’identité de l’entreprise',
          instructions: 'Complète la fiche d’identité à l’aide du document 1.',
          helps: ['Toutes les réponses sont dans le document 1.', 'Un commerçant indépendant qui utilise l’enseigne d’un réseau contre une redevance : c’est une franchise.', 'Commerce associé ou intégré ? Ici, c’est une franchise.'],
          outcomeIds: R1,
          fields: [
            { id: 'raison', label: 'Raison sociale', kind: 'text', accept: ['SARL Keller Audio', 'Keller Audio'], placeholder: 'Nom de la société', explain: 'SARL Keller Audio (enseigne Onde & Image).' },
            { id: 'enseigne', label: 'Enseigne', kind: 'given', value: 'Onde & Image' },
            {
              id: 'activite',
              label: 'Activité',
              kind: 'choice',
              options: [
                { value: 'son', label: 'Vente de matériel son et image' },
                { value: 'repar', label: 'Réparation d’électroménager' },
                { value: 'disque', label: 'Vente de disques et de livres' },
              ],
              answer: 'son',
              explain: 'Casques, enceintes, téléviseurs, platines vinyle et accessoires.',
            },
            { id: 'type', label: 'Type de commerce', kind: 'choice', options: [{ value: 'franchise', label: 'Commerce associé : franchise' }, { value: 'integre', label: 'Commerce intégré (succursale)' }, { value: 'isole', label: 'Commerce indépendant isolé' }], answer: 'franchise', explain: 'Un indépendant qui utilise l’enseigne contre une redevance : franchise.' },
            { id: 'loc', label: 'Localisation', kind: 'text', accept: ['Mulhouse', 'galerie marchande Mulhouse', 'centre-ville de Mulhouse'], placeholder: 'Ville', explain: 'Galerie marchande du centre-ville de Mulhouse.' },
            num('surface', 'Surface de vente', 140, '140 m² de vente.', 'm²'),
            { id: 'erp', label: 'Classement de sécurité', kind: 'choice', options: [{ value: 'erp', label: 'ERP de type M' }, { value: 'entrepot', label: 'Entrepôt' }, { value: 'bureau', label: 'Immeuble de bureaux' }], answer: 'erp', explain: 'Un magasin qui accueille des clients est un ERP de type M.' },
          ],
        },
        {
          id: 'd04-o-a2',
          kind: 'fields',
          label: 'Questions',
          title: 'Préparer la visite avant ouverture',
          instructions: 'Réponds à l’aide des documents 1 et 2.',
          helps: ['Relis l’objet et le contenu du courriel.', 'Deux domaines sont contrôlés : l’un concerne le feu, l’autre les personnes handicapées.', 'Le magasin accueille du public : il doit protéger les personnes.'],
          outcomeIds: R3,
          fields: [
            {
              id: 'controle',
              label: '1. Quels domaines la mairie va-t-elle contrôler ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'incendie', label: 'La sécurité incendie' },
                { value: 'access', label: 'L’accessibilité aux personnes handicapées' },
                { value: 'prix', label: 'Le niveau des prix' },
                { value: 'deco', label: 'La décoration de la vitrine' },
              ],
              answers: ['incendie', 'access'],
              explain: 'Courriel : sécurité incendie et accessibilité.',
            },
            {
              id: 'pourquoi',
              label: '2. Pourquoi ces règles s’imposent-elles à la boutique ?',
              kind: 'choice',
              options: [
                { value: 'erp', label: 'Elle reçoit du public : elle doit protéger clients et salariés' },
                { value: 'franchise', label: 'Parce qu’elle est franchisée' },
                { value: 'taille', label: 'Parce qu’elle dépasse 1 000 m²' },
              ],
              answer: 'erp',
              explain: 'Tout ERP, même petit, doit assurer la sécurité des personnes.',
            },
            {
              id: 'docs',
              label: '3. Quels documents faut-il préparer ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'registre', label: 'Le registre de sécurité' },
                { value: 'extinct', label: 'Les attestations de vérification des extincteurs' },
                { value: 'plan', label: 'Le plan d’évacuation' },
                { value: 'catalogue', label: 'Le catalogue des produits' },
              ],
              answers: ['registre', 'extinct', 'plan'],
              explain: 'Ces trois documents sont listés dans le courriel.',
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
      title: 'Appréhender les règles de sécurité des locaux',
      guidance: 'guidé',
      message: {
        from: 'Bastien Keller',
        role: 'Gérant',
        text: [
          'Voici le plan du local tel que nous l’avons récupéré. Avant d’installer le mobilier, je veux que tu repères les différents espaces, puis que tu fasses le point sur la sécurité et l’accessibilité.',
          'J’ai aussi reçu le devis du fournisseur de mobilier : vérifie qu’il respecte les règles d’accessibilité.',
        ],
      },
      documents: [
        {
          id: 'd04-m1-doc1',
          number: 1,
          title: 'Plan du local',
          look: 'texte',
          blocks: [
            { type: 'plan', plan: PLAN_LOCAL },
            {
              type: 'list',
              title: 'Indications du bailleur',
              items: [
                'La réserve est la plus grande pièce du fond. Elle communique avec la porte de livraison.',
                'Les sanitaires du personnel sont accessibles depuis la réserve, à côté du bureau.',
                'L’entrée des clients est au centre de la façade, entre deux vitrines.',
              ],
            },
          ],
        },
        {
          id: 'd04-m1-doc2',
          number: 2,
          title: 'Les règles de sécurité dans un magasin',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Un magasin est un établissement recevant du public (ERP). Son exploitant doit permettre l’évacuation rapide de tous et limiter le risque d’incendie.' },
            {
              type: 'table',
              head: ['Équipement', 'Règles à respecter'],
              rows: [
                ['Sorties de secours', 'En nombre suffisant selon l’effectif, signalées par un pictogramme vert éclairé, jamais encombrées ni fermées à clé pendant l’ouverture.'],
                ['Extincteurs', 'Au moins un pour 200 m² et par niveau, visibles, signalés, accessibles et vérifiés chaque année.'],
                ['Éclairage de sécurité', 'Il reste allumé en cas de coupure pour guider vers les sorties.'],
                ['Alarme', 'Un signal sonore audible dans tout le magasin.'],
                ['Affichage', 'Plan d’évacuation, consignes de sécurité et numéros d’urgence visibles.'],
              ],
            },
          ],
        },
        {
          id: 'd04-m1-doc3',
          number: 3,
          title: 'État des lieux du gérant, à trois semaines de l’ouverture',
          look: 'memo',
          blocks: [
            {
              type: 'list',
              items: [
                'La sortie de secours de la réserve est bloquée par les cartons du mobilier livré hier.',
                'Les deux extincteurs ont été vérifiés le mois dernier, mais celui de la surface de vente est posé au sol derrière la future caisse.',
                'L’éclairage de sécurité a été testé : il fonctionne.',
                'Le plan d’évacuation n’est pas encore affiché.',
              ],
            },
          ],
        },
        {
          id: 'd04-m1-doc4',
          number: 4,
          title: 'L’accessibilité aux personnes handicapées',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Tout client, quel que soit son handicap, doit pouvoir entrer, circuler, se servir et payer. Quelques repères pour un magasin :' },
            {
              type: 'table',
              head: ['Élément', 'Repère'],
              rows: [
                ['Banque d’accueil, caisse', 'Une partie à 0,80 m de haut au maximum, avec un vide en dessous'],
                ['Allées principales', 'Largeur d’au moins 1,20 m'],
                ['Allées secondaires', 'Largeur d’au moins 0,90 m'],
                ['Produits en libre-service', 'Accessibles entre 0,40 m et 1,30 m de hauteur'],
                ['Éléments suspendus dans une circulation', 'Au moins 2,20 m sous l’élément'],
                ['Affichage', 'Lisible par une personne assise, contrasté'],
              ],
            },
          ],
        },
        {
          id: 'd04-m1-doc5',
          number: 5,
          title: 'La responsabilité du commerçant',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Le commerçant a une obligation générale de sécurité : les locaux, les produits et les services qu’il propose ne doivent pas mettre en danger ses clients ni ses salariés.' },
            {
              type: 'list',
              title: 'S’il ne respecte pas ces règles, il s’expose à :',
              items: [
                'une fermeture administrative du magasin décidée par le maire ou le préfet ;',
                'une amende pouvant aller jusqu’à 45 000 € pour un local non accessible ;',
                'l’obligation d’indemniser la victime d’un accident (responsabilité civile), voire des poursuites pénales ;',
                'un refus de son assureur de couvrir les dommages en cas de manquement grave.',
              ],
            },
          ],
        },
        {
          id: "d04-revision-1-doc",
          number: 6,
          title: "Libérer le chemin d’évacuation",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Le plan interne impose un passage libre de 1,40 m sur le chemin E. Entre les meubles, la largeur est de 1,55 m. Un présentoir empiète de 25 cm. Une multiprise traverse le passage. Le responsable peut déplacer le présentoir et utiliser une prise murale dans la zone d’essai."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd04-m1-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Repérer les espaces sur le plan',
          instructions: 'À l’aide du document 1, indique la lettre qui correspond à chaque espace.',
          helps: ['Lis les indications du bailleur sous le plan.', 'La façade est en bas du plan, la livraison en haut.', 'La plus grande pièce du fond, près de la porte de livraison, est la réserve.'],
          outcomeIds: R1,
          fields: [
            { id: 'reserve', label: 'Réserve', kind: 'choice', select: true, options: letters(['A', 'B', 'C', 'D']), answer: 'A', explain: 'A : la grande pièce du fond, près de la livraison.' },
            { id: 'sanit', label: 'Sanitaires du personnel', kind: 'choice', select: true, options: letters(['A', 'B', 'C', 'D']), answer: 'B', explain: 'B : à côté du bureau, accessible depuis la réserve.' },
            { id: 'vitrine', label: 'Vitrine', kind: 'choice', select: true, options: letters(['A', 'B', 'C', 'D']), answer: 'C', explain: 'C : sur la façade, à gauche de l’entrée.' },
            { id: 'entree', label: 'Entrée des clients', kind: 'choice', select: true, options: letters(['A', 'B', 'C', 'D']), answer: 'D', explain: 'D : au centre de la façade, entre les deux vitrines.' },
          ],
        },
        {
          id: 'd04-m1-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Contrôler la sécurité du local',
          instructions: 'Compare l’état des lieux (document 3) aux règles (document 2). Pour chaque point, dis s’il est conforme et choisis l’action à mener.',
          helps: ['Un point est conforme seulement s’il respecte toute la règle.', 'Une sortie doit être dégagée, un extincteur visible et accessible.', 'Sortie encombrée → dégager ; extincteur au sol → le fixer au mur et le signaler ; plan absent → l’afficher.'],
          outcomeIds: R3,
          layout: 'columns',
          columns: ['Conforme ?', 'Action à mener'],
          fields: (
            [
              ['sortie', 'Sortie de secours de la réserve', 'non', 'degager', 'Une sortie doit toujours rester dégagée.'],
              ['nombre', 'Nombre d’extincteurs (185 m² au total, un seul niveau)', 'oui', 'rien', 'Au moins 1 pour 200 m² : 2 extincteurs suffisent.'],
              ['extinct', 'Extincteur de la surface de vente', 'non', 'fixer', 'Il doit être fixé au mur, visible et signalé.'],
              ['eclairage', 'Éclairage de sécurité', 'oui', 'rien', 'Testé et fonctionnel.'],
              ['plan', 'Plan d’évacuation', 'non', 'afficher', 'Il doit être affiché avant l’ouverture.'],
            ] as const
          ).flatMap(([id, label, conf, action, explain]): Field[] => [
            { id: `${id}.0`, label, kind: 'choice', options: OUI_NON, answer: conf, explain },
            {
              id: `${id}.1`,
              label,
              kind: 'choice',
              select: true,
              options: [
                { value: 'rien', label: 'Aucune action' },
                { value: 'degager', label: 'Dégager le passage' },
                { value: 'fixer', label: 'Fixer au mur et signaler' },
                { value: 'afficher', label: 'Afficher près de l’entrée' },
              ],
              answer: action,
              explain,
            },
          ]),
        },
        {
          id: 'd04-m1-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Vérifier le devis du mobilier',
          instructions: 'Pour chaque proposition du fournisseur, indique la valeur réglementaire (document 4) et dis si la proposition est conforme.',
          helps: ['Cherche la ligne correspondante dans le document 4.', 'Attention au sens : la banque doit être à 0,80 m au plus ; les allées et le passage sous un panneau ont un minimum.', 'Banque 0,95 m > 0,80 m : non conforme.'],
          outcomeIds: R13,
          layout: 'columns',
          columns: ['Valeur réglementaire', 'Conforme ?'],
          fields: ACCESS.flatMap((a): Field[] => [
            num(`${a.id}.0`, a.label, a.rule, `${a.sens === 'max' ? 'Au maximum' : 'Au minimum'} ${fr(a.rule)} m.`, 'm', 0.001),
            { id: `${a.id}.1`, label: a.label, kind: 'choice', options: OUI_NON, answer: a.conforme ? 'oui' : 'non', explain: a.explain },
          ]),
        },
        {
          id: 'd04-m1-a4',
          kind: 'fields',
          label: 'Annexe 4',
          title: 'Mesurer la responsabilité du gérant',
          instructions: 'Réponds à l’aide du document 5.',
          helps: ['Le document 5 liste quatre conséquences.', 'Certaines sont administratives, d’autres financières ou judiciaires.', 'Aucune réponse ne dit que le franchiseur paie à la place du gérant.'],
          outcomeIds: R3,
          fields: [
            {
              id: 'cons',
              label: '1. À quoi s’expose le gérant s’il ouvre sans respecter les règles ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'fermeture', label: 'Une fermeture administrative' },
                { value: 'amende', label: 'Une amende' },
                { value: 'indemniser', label: 'L’obligation d’indemniser une victime' },
                { value: 'assurance', label: 'Un refus de prise en charge par son assurance' },
                { value: 'franchiseur', label: 'Rien : le franchiseur est responsable à sa place' },
              ],
              answers: ['fermeture', 'amende', 'indemniser', 'assurance'],
              explain: 'Le gérant de la boutique reste responsable de son établissement.',
            },
            num('amende', '2. Montant maximum de l’amende pour un local non accessible', 45000, 'Jusqu’à 45 000 €.', '€'),
          ],
        },
        {
          id: "d04-revision-1",
          label: "Annexe complémentaire",
          title: "Libérer le chemin d’évacuation",
          instructions: "Lis le document 6. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Calcule la largeur restante après l’empiètement.",
            "Relis le document 6 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "1,55 − 0,25 = 1,30 m."
          ],
          outcomeIds: [
            "d04-r1",
            "d04-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Quelle largeur reste en mètres ?",
              kind: "number",
              answer: 1.3,
              explain: "1,55 − 0,25 = 1,30 m."
            },
            {
              id: "q2",
              label: "Écris deux actions avant ouverture et leur contrôle.",
              kind: "written",
              lines: 3,
              model: "Retirer le présentoir de l’axe E et mesurer de nouveau le passage. Raccorder la démonstration à la prise murale sans câble dans le cheminement, puis parcourir le trajet jusqu’à la sortie."
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
      title: 'Respecter les obligations d’affichage',
      guidance: 'accompagné',
      message: {
        from: 'Bastien Keller',
        role: 'Gérant',
        text: [
          'Le réseau nous a envoyé un lot d’affiches et de pictogrammes. Je ne veux pas surcharger les murs : distingue ce qui est obligatoire de ce qui est simplement informatif.',
          'Prépare aussi le panneau des consignes de sécurité qui sera fixé près de l’entrée et dans la réserve.',
        ],
      },
      documents: [
        {
          id: 'd04-m2-doc1',
          number: 1,
          title: 'Affichage obligatoire et affichage informatif',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Certaines informations doivent être affichées par la loi : elles protègent le client ou assurent sa sécurité. Les autres sont facultatives : elles servent à informer, orienter ou faire vendre.' },
            {
              type: 'list',
              title: 'Affichage obligatoire en magasin',
              items: [
                'Le prix de chaque produit exposé, de façon lisible.',
                'L’interdiction de fumer et de vapoter.',
                'Les consignes de sécurité, le plan d’évacuation et les numéros d’urgence.',
                'Les horaires d’ouverture, visibles de l’extérieur.',
                'L’information sur la garantie légale de conformité des produits.',
              ],
            },
            {
              type: 'list',
              title: 'Affichage informatif (facultatif)',
              items: ['Promotions et nouveautés', 'Signalétique des rayons', 'Conseils d’utilisation', 'Programme de fidélité, réseaux sociaux de la boutique'],
            },
          ],
        },
        {
          id: 'd04-m2-doc2',
          number: 2,
          title: 'Les familles de pictogrammes',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Forme et couleur', 'Famille', 'Message'],
              rows: [
                ['Carré ou rectangle rouge', 'Matériel incendie', 'Où trouver le matériel de lutte contre le feu'],
                ['Cercle rouge barré', 'Interdiction', 'Ce qu’il ne faut pas faire'],
                ['Triangle jaune bordé de noir', 'Danger (prévention)', 'Un risque à connaître'],
                ['Rond bleu', 'Obligation', 'Ce qu’il faut faire ou porter'],
                ['Carré ou rectangle vert', 'Évacuation et secours', 'Par où sortir, où se rassembler, où trouver les secours'],
              ],
            },
            { type: 'signs', signs: ['extincteur', 'fumer', 'electrique', 'chaussures', 'sortie'], labels: ['Extincteur', 'Interdit de fumer', 'Danger électrique', 'Chaussures de sécurité', 'Sortie de secours'] },
          ],
        },
        {
          id: 'd04-m2-doc3',
          number: 3,
          title: 'Informations pratiques de la galerie marchande',
          look: 'memo',
          blocks: [
            {
              type: 'list',
              items: [
                'En cas d’évacuation, toutes les boutiques se rassemblent sur le parking Nord, devant l’entrée principale de la galerie.',
                'Un défibrillateur et une trousse de secours sont disponibles à l’accueil central de la galerie.',
                'Numéros d’urgence : pompiers 18, SAMU 15, police 17, numéro d’urgence européen 112, urgences pour les personnes sourdes ou malentendantes 114 (par SMS).',
                'Responsable sécurité de la boutique : Bastien Keller, 06 12 34 56 78.',
              ],
            },
          ],
        },
        {
          id: "d04-revision-2-doc",
          number: 4,
          title: "Revoir l’affichage au point de décision",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’équipe a placé le prix de l’enceinte de démonstration derrière l’appareil. La flèche vers l’accueil masque partiellement le panneau de sortie. La consigne du magasin prévoit un prix lisible pour chaque modèle et le maintien de la signalisation de sécurité en vue directe."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd04-m2-a1',
          kind: 'classify',
          label: 'Annexe 1',
          title: 'Trier les affiches reçues',
          instructions: 'Pour chaque affiche, indique si elle est obligatoire ou informative (document 1).',
          helps: ['Une affiche obligatoire protège le client ou assure sa sécurité.', 'Ce qui fait vendre ou oriente est informatif.', 'Les horaires et la garantie légale sont obligatoires ; la carte de fidélité ne l’est pas.'],
          outcomeIds: R3,
          categories: [
            { id: 'obligatoire', label: 'Obligatoire' },
            { id: 'informatif', label: 'Informatif' },
          ],
          items: [
            { id: 'prix', text: 'Étiquettes de prix des casques exposés', answer: 'obligatoire', explain: 'Le prix de chaque produit exposé doit être affiché.' },
            { id: 'horaires', text: 'Horaires d’ouverture sur la porte d’entrée', answer: 'obligatoire', explain: 'Visibles de l’extérieur.' },
            { id: 'promo', text: 'Affiche « −20 % sur les enceintes connectées »', answer: 'informatif', explain: 'Une promotion fait vendre : facultatif.' },
            { id: 'fumer', text: 'Pictogramme « Interdit de fumer et de vapoter »', answer: 'obligatoire', explain: 'Obligatoire dans tous les lieux publics.' },
            { id: 'garantie', text: 'Information sur la garantie légale de conformité', answer: 'obligatoire', explain: 'Elle doit être affichée en magasin.' },
            { id: 'rayons', text: 'Panneaux « Casques », « Enceintes », « Vinyle »', answer: 'informatif', explain: 'Signalétique d’orientation.' },
            { id: 'consignes', text: 'Consignes de sécurité et numéros d’urgence', answer: 'obligatoire', explain: 'Sécurité des personnes.' },
            { id: 'fidelite', text: 'Affiche du programme de fidélité', answer: 'informatif', explain: 'Facultatif.' },
            { id: 'reseaux', text: 'QR code vers le compte Instagram de la boutique', answer: 'informatif', explain: 'Facultatif.' },
          ],
        },
        {
          id: 'd04-m2-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Identifier les pictogrammes du lot',
          instructions: 'Pour chaque pictogramme, indique sa famille (document 2).',
          helps: ['Regarde d’abord la forme, puis la couleur.', 'Cercle barré = interdiction, triangle = danger, rond bleu = obligation.', 'Carré rouge = incendie, carré vert = évacuation et secours.'],
          outcomeIds: R3,
          layout: 'signs',
          fields: (
            [
              ['alarme', 'alarme', 'incendie', 'Carré rouge : bouton d’alarme incendie.'],
              ['interdite', 'entree-interdite', 'interdiction', 'Cercle rouge barré : entrée interdite.'],
              ['glissant', 'sol-glissant', 'danger', 'Triangle jaune : sol glissant.'],
              ['gants', 'gants', 'obligation', 'Rond bleu : port de gants obligatoire.'],
              ['rassemblement', 'rassemblement', 'evacuation', 'Carré vert : point de rassemblement.'],
              ['tel', 'telephone', 'interdiction', 'Cercle rouge barré : téléphone interdit.'],
            ] as const
          ).map(([id, sign, answer, explain], i): Field => ({
            id,
            label: `Pictogramme ${i + 1}`,
            kind: 'choice',
            select: true,
            sign,
            options: [
              { value: 'incendie', label: 'Matériel incendie' },
              { value: 'interdiction', label: 'Interdiction' },
              { value: 'danger', label: 'Danger' },
              { value: 'obligation', label: 'Obligation' },
              { value: 'evacuation', label: 'Évacuation et secours' },
            ],
            answer,
            explain,
          })),
        },
        {
          id: 'd04-m2-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Placer les pictogrammes dans la boutique',
          instructions: 'Choisis l’endroit le plus adapté pour chaque pictogramme.',
          helps: ['Un pictogramme se place là où le risque ou l’équipement se trouve.', 'La réserve n’est pas accessible aux clients ; on y manipule des cutters et des cartons.', 'Le point de rassemblement est à l’extérieur.'],
          outcomeIds: R3,
          fields: [
            { id: 'interdite', label: 'Entrée interdite', kind: 'choice', options: [{ value: 'reserve', label: 'Sur la porte de la réserve, côté magasin' }, { value: 'entree', label: 'Sur la porte d’entrée des clients' }, { value: 'caisse', label: 'Derrière la caisse' }], answer: 'reserve', explain: 'La réserve est interdite aux clients.' },
            { id: 'glissant', label: 'Sol glissant', kind: 'choice', options: [{ value: 'nettoyage', label: 'Sur un chevalet, pendant et après le lavage du sol' }, { value: 'vitrine', label: 'Collé en permanence sur la vitrine' }, { value: 'reserve', label: 'Dans le bureau' }], answer: 'nettoyage', explain: 'Signalisation temporaire, là où le sol est mouillé.' },
            { id: 'gants', label: 'Port de gants obligatoire', kind: 'choice', options: [{ value: 'deballage', label: 'Au poste de déballage de la réserve' }, { value: 'ecoute', label: 'Dans l’espace d’écoute' }, { value: 'caisse', label: 'À la caisse' }], answer: 'deballage', explain: 'Manipulation de cartons, de cerclages et de cutters.' },
            { id: 'alarme', label: 'Bouton d’alarme incendie', kind: 'choice', options: [{ value: 'sorties', label: 'Près des sorties, à côté du bouton lui-même' }, { value: 'vitrine', label: 'Dans la vitrine' }, { value: 'sanitaires', label: 'Dans les sanitaires' }], answer: 'sorties', explain: 'Le pictogramme signale l’emplacement du déclencheur, près des sorties.' },
          ],
        },
        {
          id: 'd04-m2-a4',
          kind: 'fields',
          label: 'Annexe 4',
          title: 'Compléter le panneau des consignes de sécurité',
          instructions: 'Complète le panneau à l’aide du document 3.',
          helps: ['Tous les numéros sont dans le document 3.', 'Le 112 fonctionne dans toute l’Union européenne.', 'Le défibrillateur est à l’accueil central de la galerie.'],
          outcomeIds: R3,
          layout: 'extranet',
          windowTitle: 'Consignes de sécurité — Onde & Image',
          fields: [
            num('pompiers', 'Pompiers', 18, 'Le 18.'),
            num('samu', 'SAMU (urgence médicale)', 15, 'Le 15.'),
            num('police', 'Police', 17, 'Le 17.'),
            num('europe', 'Numéro d’urgence européen', 112, 'Le 112.'),
            num('sourds', 'Urgences pour personnes sourdes ou malentendantes (SMS)', 114, 'Le 114.'),
            { id: 'rassemblement', label: 'Point de rassemblement', kind: 'choice', options: [{ value: 'parking', label: 'Parking Nord, devant l’entrée principale de la galerie' }, { value: 'reserve', label: 'Dans la réserve' }, { value: 'galerie', label: 'Dans l’allée de la galerie, devant la vitrine' }], answer: 'parking', explain: 'À l’extérieur, sur le parking Nord.' },
            { id: 'defib', label: 'Défibrillateur et trousse de secours', kind: 'text', accept: ['accueil', 'accueil central', 'accueil central de la galerie', 'à l’accueil', 'a l accueil central'], placeholder: 'Emplacement', explain: 'À l’accueil central de la galerie.' },
            { id: 'contact', label: 'Responsable sécurité', kind: 'given', value: 'Bastien Keller — 06 12 34 56 78' },
          ],
        },
        {
          id: "d04-revision-2",
          label: "Annexe complémentaire",
          title: "Revoir l’affichage au point de décision",
          instructions: "Lis le document 4. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Observe l’endroit où le client choisit le produit et celui où il cherche sa sortie.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Placer le prix au bord du support de démonstration, au regard du bon modèle. Déplacer la flèche accueil sur un panneau distinct. Laisser la sortie visible dans l’axe du cheminement."
          ],
          outcomeIds: [
            "d04-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Propose un emplacement pour chacun des trois supports.",
              kind: "written",
              lines: 3,
              model: "Placer le prix au bord du support de démonstration, au regard du bon modèle. Déplacer la flèche accueil sur un panneau distinct. Laisser la sortie visible dans l’axe du cheminement."
            },
            {
              id: "q2",
              label: "Décris un contrôle après installation.",
              kind: "written",
              lines: 3,
              model: "Faire le trajet depuis l’entrée et le point d’essai, relever le prix du bon modèle et vérifier que la flèche accueil n’occulte plus le panneau de sortie."
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
      title: 'Aménager l’espace de vente selon le sens de circulation',
      guidance: 'accompagné',
      message: {
        from: 'Bastien Keller',
        role: 'Gérant',
        text: [
          'Le local est sûr : passons à l’organisation des rayons. Le réseau nous a transmis une méthode fondée sur le parcours des clients, et le chiffre d’affaires mensuel prévu pour chaque famille de produits.',
          'Le bureau d’études propose deux implantations. Aide-moi à choisir la bonne.',
        ],
      },
      documents: [
        {
          id: 'd04-m3-doc1',
          number: 1,
          title: 'Le sens de circulation et les zones du magasin',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'En France, la plupart des clients tournent à droite en entrant et parcourent le magasin dans le sens inverse des aiguilles d’une montre. Ils ralentissent près de l’entrée et autour de la caisse, et vont moins souvent au fond. On découpe donc la surface en six zones.' },
            {
              type: 'table',
              head: ['Zones', 'Fréquentation', 'Part habituelle du CA', 'Produits à y placer'],
              rows: [
                ['1', 'Très forte (zone chaude)', 'Zones 1 et 2 : environ 50 %', 'Nouveautés et produits phares'],
                ['2', 'Très forte (zone chaude)', '', 'Achats d’impulsion, petits prix, près de la caisse'],
                ['3', 'Moyenne', 'Zones 3 et 4 : 25 à 35 %', 'Promotions'],
                ['4', 'Moyenne', '', 'Achats d’impulsion, produits complémentaires'],
                ['5', 'Faible (zone froide)', 'Zones 5 et 6 : 15 à 25 %', 'Produits volumineux que le client vient chercher'],
                ['6', 'Faible (zone froide)', '', 'Produits de spécialistes, achats réfléchis'],
              ],
            },
            { type: 'note', text: 'Les produits que le client vient chercher « sans appui » sont placés au fond : ils l’obligent à traverser le magasin et à passer devant les autres rayons.' },
          ],
        },
        {
          id: 'd04-m3-doc2',
          number: 2,
          title: 'Plan type des zones',
          look: 'texte',
          blocks: [{ type: 'plan', plan: ZONES_PLAN }],
        },
        {
          id: 'd04-m3-doc3',
          number: 3,
          title: 'Familles de produits et CA mensuel prévu',
          look: 'facture',
          blocks: [
            {
              type: 'table',
              head: ['Famille', 'Caractéristique', 'CA prévu'],
              align: ['left', 'left', 'right'],
              rows: [...ZONE_PRODUCTS.map((p) => [p.name, p.note, eur(p.ca)]), ['Total', '', eur(ZONE_TOTAL)]],
            },
          ],
        },
        {
          id: 'd04-m3-doc4',
          number: 4,
          title: 'Les deux implantations proposées',
          look: 'texte',
          blocks: [
            { type: 'plan', plan: IMPLANTATION_1 },
            { type: 'plan', plan: IMPLANTATION_2 },
          ],
        },
        {
          id: "d04-revision-3-doc",
          number: 5,
          title: "Choisir un emplacement selon le parcours",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Zone",
                "Visiteurs observés en 30 min",
                "Contrainte"
              ],
              rows: [
                [
                  "A, entrée",
                  "85",
                  "Passage à conserver sans arrêt prolongé"
                ],
                [
                  "B, fond du rayon audio",
                  "36",
                  "Prise disponible et espace latéral de 3 m²"
                ],
                [
                  "C, côté caisse",
                  "52",
                  "Pas de prise et file d’attente"
                ]
              ]
            },
            {
              type: "p",
              text: "Un essai prend trois minutes et requiert une prise. Une petite affiche peut être mise près de l’entrée sans empiéter sur le passage."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd04-m3-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Affecter chaque famille à une zone et calculer sa part du CA',
          instructions: 'Choisis la zone de chaque famille (documents 1 et 3), puis calcule sa part du CA total. Arrondis au centième.',
          helps: ['Lis la caractéristique de chaque famille et cherche la ligne correspondante dans le document 1.', `Part du CA = CA de la famille ÷ CA total × 100. Le CA total est de ${eur(ZONE_TOTAL)}.`, `Casques : ${eur(21500)} ÷ ${eur(ZONE_TOTAL)} × 100 = ${fr(zonePart(21500))} %.`],
          outcomeIds: R1,
          layout: 'columns',
          columns: ['Zone', '% du CA'],
          fields: ZONE_PRODUCTS.flatMap((p): Field[] => [
            { id: `${p.id}.0`, label: p.name, kind: 'choice', select: true, options: ZONE_OPTIONS, answer: String(p.zone), explain: `${p.note} : zone ${p.zone}.` },
            num(`${p.id}.1`, p.name, zonePart(p.ca), `${eur(p.ca)} ÷ ${eur(ZONE_TOTAL)} × 100 = ${fr(zonePart(p.ca))} %.`, '%', 0.011),
          ]),
        },
        {
          id: 'd04-m3-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Contrôler la répartition du CA par zones',
          instructions: 'Calcule la part du CA réalisée par chaque paire de zones, puis compare-la aux repères du document 1.',
          helps: ['Additionne le CA des familles des deux zones, puis divise par le CA total.', 'Zones 1 et 2 : casques + accessoires.', `Zones 1 et 2 : (${eur(21500)} + ${eur(4500)}) ÷ ${eur(ZONE_TOTAL)} × 100 = ${fr(ZONE_PAIRS[0].part)} %.`],
          outcomeIds: R1,
          fields: [
            ...ZONE_PAIRS.map((z) => num(z.id, `${z.label} (repère : ${z.repere})`, z.part, `${eur(z.ca)} ÷ ${eur(ZONE_TOTAL)} × 100 = ${fr(z.part)} %.`, '%', 0.011)),
            { id: 'conforme', label: 'La répartition prévue respecte-t-elle les repères ?', kind: 'choice', options: OUI_NON, answer: 'oui', explain: `${fr(ZONE_PAIRS[0].part)} %, ${fr(ZONE_PAIRS[1].part)} % et ${fr(ZONE_PAIRS[2].part)} % : les trois parts sont dans les repères.` },
          ],
        },
        {
          id: 'd04-m3-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Choisir l’implantation',
          instructions: 'Compare les deux implantations du document 4 à la méthode du document 1.',
          helps: ['Où est l’entrée ? Le client tourne-t-il à droite ? Où est la caisse ?', 'Dans la bonne implantation, les familles sont dans les zones que tu as trouvées à l’annexe 1.', 'L’implantation 2 met l’entrée à gauche, la caisse loin de la sortie et les casques (nouveautés) au fond.'],
          outcomeIds: R1,
          fields: [
            { id: 'choix', label: '1. Quelle implantation retiens-tu ?', kind: 'choice', options: [{ value: '1', label: 'Implantation 1' }, { value: '2', label: 'Implantation 2' }], answer: '1', explain: 'L’implantation 1 suit le parcours naturel des clients.' },
            {
              id: 'justif',
              label: '2. Justifie ton choix (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'droite', label: 'L’entrée à droite permet au client de tourner à droite et de faire tout le tour' },
                { value: 'caisse', label: 'La caisse est placée à la sortie, avec les achats d’impulsion' },
                { value: 'fond', label: 'Les produits de destination au fond font traverser tout le magasin' },
                { value: 'phare', label: 'Les nouveautés sont vues dès l’entrée' },
                { value: 'tv', label: 'Les téléviseurs à l’entrée attirent le regard' },
              ],
              answers: ['droite', 'caisse', 'fond', 'phare'],
              explain: 'Placer des produits de destination à l’entrée raccourcit le parcours du client.',
            },
            { id: 'sens', label: '3. Dans l’implantation retenue, le sens de circulation est…', kind: 'choice', options: [{ value: 'inverse', label: 'Le sens inverse des aiguilles d’une montre' }, { value: 'aiguilles', label: 'Le sens des aiguilles d’une montre' }], answer: 'inverse', explain: 'Entrée à droite, sortie à gauche : sens inverse des aiguilles d’une montre.' },
            { id: 'chaude', label: '4. Quel repère de l’implantation 1 est en zone chaude ?', kind: 'choice', options: letters(['P', 'Q', 'R']), answer: 'P', explain: 'P est juste après l’entrée.' },
            { id: 'froide', label: '5. Quel repère de l’implantation 1 est en zone froide ?', kind: 'choice', options: letters(['P', 'Q', 'R']), answer: 'R', explain: 'R est dans le coin du fond.' },
          ],
        },
        {
          id: "d04-revision-3",
          label: "Annexe complémentaire",
          title: "Choisir un emplacement selon le parcours",
          instructions: "Lis le document 5. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Le lieu qui reçoit le plus de visiteurs ne convient pas forcément à un essai de trois minutes.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Installer en B, où la prise et l’espace latéral permettent l’arrêt. À l’entrée, indiquer le rayon audio sur une affiche visible sans réduire le passage."
          ],
          outcomeIds: [
            "d04-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Où installer l’essai et comment y orienter les clients ?",
              kind: "written",
              lines: 3,
              model: "Installer en B, où la prise et l’espace latéral permettent l’arrêt. À l’entrée, indiquer le rayon audio sur une affiche visible sans réduire le passage."
            },
            {
              id: "q2",
              label: "Quel relevé permet de vérifier la décision ?",
              kind: "written",
              lines: 3,
              model: "Compter les arrivées et essais en B sur des créneaux comparables, puis observer les attentes et les gênes dans les allées."
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
      title: 'Implanter les produits en respectant les règles de sécurité',
      guidance: 'autonome',
      message: {
        from: 'Bastien Keller',
        role: 'Gérant',
        text: [
          'Le mobilier est installé, les premières livraisons arrivent demain. Je veux que chacun manipule les colis sans se blesser, avec le bon matériel.',
          'Ensuite, place les premiers produits sur les étagères en respectant les niveaux de présentation.',
        ],
      },
      documents: [
        {
          id: 'd04-m4-doc1',
          number: 1,
          title: 'Porter et déplacer les charges en sécurité',
          look: 'procedure',
          blocks: [
            {
              type: 'list',
              title: 'Port à la main',
              items: [
                'Au-delà de 25 kg, une charge ne doit pas être portée à la main de façon habituelle : on utilise un matériel adapté.',
                'Un jeune de moins de 18 ans ne porte pas plus de 20 % de son poids sans avis du médecin du travail.',
                'Dos droit, jambes fléchies, charge près du corps.',
              ],
            },
            {
              type: 'table',
              head: ['Matériel', 'Charge maximale', 'Usage'],
              rows: [
                ['Diable', '300 kg', 'Plusieurs colis empilés, sans palette'],
                ['Transpalette manuel', '2 000 kg', 'Palette, trajets courts'],
                ['Transpalette électrique', '1 500 kg', 'Palette, trajets longs (plus de 20 m)'],
              ],
            },
            { type: 'note', text: 'Le transpalette électrique ne se conduit qu’après une formation et avec une autorisation de conduite délivrée par l’employeur. Il est en principe interdit aux moins de 18 ans.' },
          ],
        },
        {
          id: 'd04-m4-doc2',
          number: 2,
          title: 'L’équipe de la boutique',
          look: 'memo',
          blocks: [
            {
              type: 'table',
              head: ['Prénom', 'Âge', 'Remarque'],
              rows: [
                ['Paul', `${PAUL.age} ans`, `Apprenti, ${PAUL.poids} kg`],
                ['Yasmine', '24 ans', 'Formée, autorisation de conduite du transpalette électrique'],
                ['Hugo', '35 ans', 'Pas d’autorisation de conduite'],
                ['Toi', '17 ans', 'Élève en PFMP'],
              ],
            },
          ],
        },
        {
          id: 'd04-m4-doc3',
          number: 3,
          title: 'Les niveaux de présentation',
          look: 'texte',
          blocks: [
            {
              type: 'table',
              head: ['Niveau', 'Hauteur', 'Produits à y placer'],
              rows: [
                ['Chapeau', 'Au-dessus de 1,70 m', 'Visuels, produits légers de démonstration ; jamais de produits lourds'],
                ['Yeux', '1,20 m à 1,70 m', 'Le niveau le plus vendeur : haut de gamme, forte marge'],
                ['Mains', '0,60 m à 1,20 m', 'Marques de l’enseigne, nouveautés, promotions'],
                ['Sol', 'Sous 0,60 m', 'Premiers prix, produits lourds ou volumineux'],
              ],
            },
          ],
        },
        {
          id: "d04-revision-4-doc",
          number: 4,
          title: "Vérifier le mobilier avant de charger le rayon",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Un module a trois tablettes. Charge maximale par tablette de 18 kg et par module de 42 kg. L’équipe prévoit 6 enceintes de 3 kg en bas, 5 en milieu et 4 en haut. Deux enceintes de plus sont proposées en haut."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd04-m4-a1',
          kind: 'fields',
          label: 'Annexe 1',
          title: 'Choisir le matériel de manutention',
          instructions: 'Pour chaque situation, choisis le matériel adapté (document 1).',
          helps: ['Commence par le poids, puis regarde s’il y a une palette, enfin la distance.', 'Sans palette : à la main jusqu’à 25 kg, sinon diable. Avec palette : électrique pour un long trajet, si le poids le permet.', '1 800 kg dépasse la limite du transpalette électrique : transpalette manuel.'],
          outcomeIds: R3,
          fields: SITUATIONS.map((s): Field => ({
            id: s.id,
            label: `${s.text} (${s.poids} kg)`,
            kind: 'choice',
            select: true,
            options: MATERIEL.map(({ value, label }) => ({ value, label })),
            answer: s.answer,
            explain:
              s.answer === 'main'
                ? `${s.poids} kg ≤ 25 kg : à la main.`
                : s.answer === 'diable'
                  ? `${s.poids} kg sans palette : diable (300 kg maximum).`
                  : s.answer === 'electrique'
                    ? `Palette de ${s.poids} kg sur ${s.distance} m : transpalette électrique (1 500 kg maximum).`
                    : `Palette de ${s.poids} kg sur ${s.distance} m : transpalette manuel.`,
          })),
        },
        {
          id: 'd04-m4-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Qui peut faire quoi ?',
          instructions: 'Réponds à l’aide des documents 1 et 2.',
          helps: ['Pour Paul, calcule 20 % de son poids.', `${PAUL.poids} × 20 ÷ 100.`, 'Seule une personne a l’autorisation de conduite.'],
          outcomeIds: R3,
          fields: [
            num('paulmax', '1. Charge maximale que Paul peut porter sans avis médical', PAUL_MAX, `${PAUL.poids} × 20 % = ${fr(PAUL_MAX)} kg.`, 'kg', 0.01),
            { id: 'paul15', label: '2. Paul peut-il porter seul un carton de 15 kg ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: `15 kg > ${fr(PAUL_MAX)} kg.` },
            { id: 'electrique', label: '3. Qui peut conduire le transpalette électrique (situation 4) ?', kind: 'choice', options: [{ value: 'yasmine', label: 'Yasmine' }, { value: 'hugo', label: 'Hugo' }, { value: 'paul', label: 'Paul' }, { value: 'toi', label: 'Toi' }], answer: 'yasmine', explain: 'Elle seule est formée et autorisée.' },
          ],
        },
        {
          id: 'd04-m4-a3',
          kind: 'fields',
          label: 'Annexe 3',
          title: 'Placer les produits sur les étagères',
          instructions: 'Choisis le niveau de présentation de chaque produit (document 3).',
          helps: ['Commence par les produits lourds : la sécurité d’abord.', 'Forte marge → yeux ; marque de l’enseigne et promotion → mains.', 'Premier prix → sol ; éléments légers de visibilité → chapeau.'],
          outcomeIds: R13,
          fields: PRODUITS_NIVEAUX.map((p): Field => ({ id: p.id, label: p.name, kind: 'choice', select: true, options: NIVEAUX, answer: p.answer, explain: p.explain })),
        },
        {
          id: "d04-revision-4",
          label: "Annexe complémentaire",
          title: "Vérifier le mobilier avant de charger le rayon",
          instructions: "Lis le document 4. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Vérifie le module entier même lorsque chaque niveau respecte sa limite.",
            "Relis le document 4 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "(6 + 5 + 4) × 3 = 45 kg."
          ],
          outcomeIds: [
            "d04-r3",
            "d04-r1"
          ],
          fields: [
            {
              id: "q1",
              label: "Quel poids représente la configuration initiale en kg ?",
              kind: "number",
              answer: 45,
              explain: "(6 + 5 + 4) × 3 = 45 kg."
            },
            {
              id: "q2",
              label: "Propose un chargement conforme privilégiant les niveaux bas.",
              kind: "written",
              lines: 3,
              model: "Placer 6 enceintes en bas, 5 au milieu et 3 en haut, soit 18, 15 et 9 kg, pour un total de 42 kg. Ranger le surplus en réserve et vérifier la notice du mobilier."
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
      title: 'Traiter les déchets',
      guidance: 'autonome',
      message: {
        from: 'Bastien Keller',
        role: 'Gérant',
        text: [
          'La boutique est presque prête, mais la réserve déborde d’emballages. Renseigne-toi sur les consignes de tri de l’agglomération et indique-moi comment trier chaque déchet.',
          'N’oublie pas que nous vendons du matériel électronique : nous avons aussi des obligations de reprise.',
        ],
      },
      documents: [
        {
          id: 'd04-m5-doc1',
          number: 1,
          title: 'Site de l’agglomération : le conteneur bleu',
          look: 'site',
          url: 'agglo-rivesud.example/tri/conteneur-bleu',
          blocks: [
            { type: 'list', title: 'J’y dépose', items: ['Bouteilles et flacons en plastique', 'Briques et emballages en carton, pliés', 'Emballages en métal', 'Tous les papiers'] },
            { type: 'list', title: 'Je n’y dépose pas', items: ['Sacs, films et papier bulle', 'Polystyrène', 'Barquettes et pots en plastique', 'Produits d’hygiène'] },
          ],
        },
        {
          id: 'd04-m5-doc2',
          number: 2,
          title: 'Site de l’agglomération : le conteneur vert',
          look: 'site',
          url: 'agglo-rivesud.example/tri/conteneur-vert',
          blocks: [
            { type: 'list', title: 'J’y dépose', items: ['Bouteilles en verre', 'Pots et bocaux en verre, sans bouchon ni couvercle'] },
            { type: 'list', title: 'Je n’y dépose pas', items: ['Verres à boire', 'Vaisselle'] },
          ],
        },
        {
          id: 'd04-m5-doc3',
          number: 3,
          title: 'Conseils pour bien utiliser les conteneurs',
          look: 'texte',
          blocks: [
            {
              type: 'list',
              items: [
                'Les déchets non recyclables vont dans le conteneur noir.',
                'Pliez les cartons à plat avant de les déposer.',
                'Les gros cartons et les encombrants vont à la déchetterie (accès gratuit pour les commerçants avec le badge déchets).',
                'Déposez les emballages en vrac, sans sac, bien vidés : inutile de les laver.',
                'Les palettes non consignées vont à la déchetterie ; les palettes consignées sont rendues au transporteur.',
              ],
            },
          ],
        },
        {
          id: 'd04-m5-doc4',
          number: 4,
          title: 'Les obligations de reprise d’un vendeur d’équipements électriques',
          look: 'article',
          blocks: [
            { type: 'p', text: 'Les déchets d’équipements électriques et électroniques (DEEE) contiennent des matières polluantes et des métaux recyclables. Ils ne vont jamais dans les conteneurs de la ville.' },
            {
              type: 'list',
              items: [
                'Reprise « 1 pour 1 » : tout vendeur reprend gratuitement l’ancien appareil d’un client qui achète un appareil équivalent.',
                'Reprise « 0 pour 1 » : les magasins qui consacrent au moins 400 m² aux équipements électriques reprennent aussi les petits appareils (moins de 25 cm) sans obligation d’achat.',
                'Les piles et petites batteries usagées se déposent dans un bac de collecte en magasin.',
                'Les appareils repris sont remis à un éco-organisme qui les recycle.',
              ],
            },
          ],
        },
        {
          id: "d04-revision-5-doc",
          number: 5,
          title: "Organiser la collecte après la démonstration",
          look: "memo",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "La démonstration laisse 12 cartons secs, 2 piles usagées et 1 boîtier électronique défectueux. Le magasin a un bac carton en réserve, un collecteur de piles et une zone de reprise pour le matériel électrique. Le prestataire enlève le carton mercredi."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd04-m5-a1',
          kind: 'classify',
          label: 'Annexe 1',
          title: 'Trier les déchets de la boutique',
          instructions: 'Indique où va chaque déchet (documents 1 à 4).',
          helps: ['Commence par le verre, puis le bleu ; ce qui est refusé dans le bleu va dans le noir.', 'Gros cartons et palettes non consignées : déchetterie.', 'Appareils électriques et piles : filière de reprise.'],
          outcomeIds: R2,
          categories: DECHET_CATEGORIES,
          items: DECHETS,
        },
        {
          id: 'd04-m5-a2',
          kind: 'fields',
          label: 'Annexe 2',
          title: 'Réduire et valoriser les déchets',
          instructions: 'Réponds à l’aide des documents 3 et 4.',
          helps: ['Une palette consignée a une valeur : on la rend.', 'Regarde la surface de la boutique et la règle du « 0 pour 1 ».', 'Un déchet non trié est un déchet qui ne sera pas recyclé.'],
          outcomeIds: R2,
          fields: [
            { id: 'consignee', label: '1. Que fais-tu des palettes consignées ?', kind: 'choice', options: [{ value: 'rendre', label: 'Je les rends au transporteur' }, { value: 'decheterie', label: 'Je les porte à la déchetterie' }, { value: 'noir', label: 'Je les mets dans le conteneur noir' }], answer: 'rendre', explain: 'Consignée = réutilisée : on la rend au transporteur.' },
            { id: 'zero', label: '2. Un client rapporte un vieux casque sans rien acheter. La boutique est-elle obligée de le reprendre ?', kind: 'choice', options: [{ value: 'non', label: 'Non : la boutique consacre moins de 400 m² aux appareils électriques' }, { value: 'oui', label: 'Oui : tout vendeur doit tout reprendre' }], answer: 'non', explain: '140 m² < 400 m² : le « 0 pour 1 » ne s’impose pas, mais la boutique peut l’accepter.' },
            {
              id: 'reduire',
              label: '3. Comment réduire le volume des déchets ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'plier', label: 'Plier les cartons à plat' },
                { value: 'reutiliser', label: 'Réutiliser le papier bulle et les calages pour les colis clients' },
                { value: 'fournisseur', label: 'Demander aux fournisseurs des emballages réduits ou réutilisables' },
                { value: 'tout', label: 'Tout mettre dans le conteneur noir, c’est plus rapide' },
              ],
              answers: ['plier', 'reutiliser', 'fournisseur'],
              explain: 'Le meilleur déchet est celui qu’on ne produit pas.',
            },
          ],
        },
        {
          id: "d04-revision-5",
          label: "Annexe complémentaire",
          title: "Organiser la collecte après la démonstration",
          instructions: "Lis le document 5. Rédige tes réponses en t’appuyant sur les faits du document. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Associe chaque flux à son point de collecte et prévois un responsable.",
            "Relis le document 5 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "Aplatir les cartons secs et les déposer en réserve dans le bac carton avant mercredi. Déposer les piles dans le collecteur prévu et le boîtier dans la zone de reprise du matériel électrique. Le chef de rayon vérifie que les allées sont dégagées."
          ],
          outcomeIds: [
            "d04-r2"
          ],
          fields: [
            {
              id: "q1",
              label: "Rédige la consigne de fermeture.",
              kind: "written",
              lines: 3,
              model: "Aplatir les cartons secs et les déposer en réserve dans le bac carton avant mercredi. Déposer les piles dans le collecteur prévu et le boîtier dans la zone de reprise du matériel électrique. Le chef de rayon vérifie que les allées sont dégagées."
            },
            {
              id: "q2",
              label: "Quel écart inscris-tu si le bac carton est plein ?",
              kind: "written",
              lines: 3,
              model: "Signaler la saturation et prévoir une zone temporaire autorisée hors circulation ou un enlèvement anticipé, avec heure et responsable. Ne pas déposer les cartons dans l’allée."
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
          id: 'd04-s-a1',
          kind: 'fields',
          label: 'Synthèse',
          title: 'Complète la synthèse',
          instructions: 'Complète les cinq parties de la synthèse.',
          helps: ['Reprends les règles de la mission 1 et les familles de pictogrammes de la mission 2.', 'Zone chaude près de l’entrée et de la caisse, zone froide au fond.', 'Niveau le plus vendeur : les yeux ; le moins vendeur : le sol.'],
          outcomeIds: R13,
          fields: [
            { id: 'oblig', label: '1. Le commerçant a une obligation générale de…', kind: 'text', accept: ['sécurité', 'securite'], explain: 'Obligation générale de sécurité.' },
            { id: 'locaux', label: '1. Sécurité des locaux (plusieurs réponses)', kind: 'multi', options: [{ value: 'extinct', label: 'Extincteurs' }, { value: 'sorties', label: 'Sorties de secours dégagées' }, { value: 'plan', label: 'Plan d’évacuation affiché' }, { value: 'musique', label: 'Musique d’ambiance' }], answers: ['extinct', 'sorties', 'plan'], explain: 'La musique n’est pas une règle de sécurité.' },
            num('allee', '1. Accessibilité : largeur minimale d’une allée principale', 1.2, '1,20 m.', 'm', 0.001),
            { id: 'affich', label: '2. Affichages obligatoires (plusieurs réponses)', kind: 'multi', options: [{ value: 'fumer', label: 'Interdiction de fumer' }, { value: 'prix', label: 'Prix' }, { value: 'horaires', label: 'Horaires' }, { value: 'urgence', label: 'Numéros d’urgence' }, { value: 'promo', label: 'Promotions' }], answers: ['fumer', 'prix', 'horaires', 'urgence'], explain: 'Les promotions sont facultatives.' },
            { id: 'froide', label: '3. Zone la moins fréquentée, pour les produits achetés sans appui :', kind: 'text', accept: ['zone froide', 'froide', 'la zone froide'], explain: 'La zone froide.' },
            { id: 'chaude', label: '3. Zone la plus fréquentée, pour les produits phares et nouveautés :', kind: 'text', accept: ['zone chaude', 'chaude', 'la zone chaude'], explain: 'La zone chaude.' },
            { id: 'materiel', label: '4. Exemple de matériel adapté à une palette de 800 kg', kind: 'choice', options: [{ value: 'manuel', label: 'Transpalette' }, { value: 'diable', label: 'Diable' }, { value: 'main', label: 'Port à la main' }], answer: 'manuel', explain: '800 kg sur palette : transpalette.' },
            { id: 'plus', label: '4. Niveau le plus vendeur', kind: 'choice', options: NIVEAUX, answer: 'yeux', explain: 'Le niveau des yeux.' },
            { id: 'moins', label: '4. Niveau le moins vendeur', kind: 'choice', options: NIVEAUX, answer: 'sol', explain: 'Le niveau du sol.' },
            { id: 'recy', label: '5. Exemple de déchet recyclable', kind: 'choice', options: [{ value: 'carton', label: 'Carton plié' }, { value: 'scotch', label: 'Ruban adhésif' }, { value: 'poly', label: 'Polystyrène' }], answer: 'carton', explain: 'Le carton va dans le conteneur bleu.' },
            { id: 'consigne', label: '5. Exemple de déchet consigné', kind: 'choice', options: [{ value: 'palette', label: 'Palette consignée' }, { value: 'bulle', label: 'Papier bulle' }, { value: 'verre', label: 'Bouteille en verre' }], answer: 'palette', explain: 'La palette consignée est rendue.' },
          ],
        },
        {
          id: 'd04-s-quiz',
          kind: 'fields',
          label: 'Quiz',
          title: 'Quiz du dossier',
          instructions: 'Six questions rapides.',
          helps: ['Relis la fiche de révision ci-dessous.', 'Formes : cercle barré, triangle, rond bleu, carré vert, carré rouge.', 'Repères : 0,80 m ; 1,20 m ; 0,90 m ; 25 kg ; 1 pour 1.'],
          outcomeIds: R13,
          fields: [
            { id: 'q1', label: 'Un rond bleu signale…', kind: 'choice', options: [{ value: 'obligation', label: 'Une obligation' }, { value: 'interdiction', label: 'Une interdiction' }, { value: 'danger', label: 'Un danger' }], answer: 'obligation', explain: 'Rond bleu = obligation.' },
            num('q2', 'Hauteur maximale d’une partie de la banque d’accueil', 0.8, '0,80 m.', 'm', 0.001),
            { id: 'q3', label: 'Le client tourne en général…', kind: 'choice', options: [{ value: 'droite', label: 'À droite' }, { value: 'gauche', label: 'À gauche' }], answer: 'droite', explain: 'À droite, puis sens inverse des aiguilles d’une montre.' },
            num('q4', 'CA de 13 000 € sur un total de 52 000 € : part en % ?', 25, '13 000 ÷ 52 000 × 100 = 25 %.', '%', 0.01),
            { id: 'q5', label: 'Le papier bulle va dans le conteneur…', kind: 'choice', options: [{ value: 'noir', label: 'Noir' }, { value: 'bleu', label: 'Bleu' }, { value: 'vert', label: 'Vert' }], answer: 'noir', explain: 'Les films plastiques sont refusés dans le bleu.' },
            { id: 'q6', label: 'Un client achète un téléviseur et rapporte l’ancien : le magasin…', kind: 'choice', options: [{ value: 'doit', label: 'Doit le reprendre gratuitement' }, { value: 'peut', label: 'Peut le refuser' }, { value: 'payant', label: 'Le reprend contre paiement' }], answer: 'doit', explain: 'Reprise « 1 pour 1 » obligatoire.' },
          ],
        },
      ],
      synthesis: [
        { title: 'Notions essentielles', kind: 'notions', items: ['ERP : établissement recevant du public, soumis aux règles de sécurité incendie et d’accessibilité.', 'Obligation générale de sécurité du commerçant envers clients et salariés.', 'Affichage obligatoire (prix, horaires, interdiction de fumer, consignes et numéros d’urgence, garantie légale) et affichage informatif.', 'Sens de circulation, zones chaudes et zones froides, six zones de vente.', 'Niveaux de présentation : chapeau, yeux, mains, sol.', 'Tri sélectif, déchetterie, déchets consignés, reprise des DEEE.'] },
        { title: 'Méthodes', kind: 'methodes', items: ['Contrôler un local point par point : sorties, extincteurs, éclairage, alarme, affichage.', 'Identifier un pictogramme par sa forme puis par sa couleur.', 'Affecter une famille à une zone selon son rôle commercial, puis calculer sa part du CA.', 'Choisir le matériel de manutention selon le poids, la palette et la distance.', 'Trier un déchet en vérifiant d’abord ce qui est refusé dans chaque conteneur.'] },
        { title: 'Repères à connaître', kind: 'formules', items: ['Part du CA = CA de la famille ÷ CA total × 100', 'Zones 1 et 2 ≈ 50 % du CA ; 3 et 4 : 25 à 35 % ; 5 et 6 : 15 à 25 %', 'Banque d’accueil ≤ 0,80 m ; allées ≥ 1,20 m (0,90 m secondaires) ; libre-service entre 0,40 et 1,30 m ; passage ≥ 2,20 m', 'Extincteurs : au moins 1 pour 200 m² et par niveau', 'Port à la main : pas plus de 25 kg de façon habituelle ; moins de 18 ans : 20 % du poids'] },
        { title: 'Erreurs fréquentes', kind: 'erreurs', items: ['Stocker des cartons devant une sortie de secours « juste pour la journée ».', 'Placer les produits lourds en hauteur.', 'Mettre les produits de destination à l’entrée : le client ne traverse plus le magasin.', 'Jeter le papier bulle ou le polystyrène dans le conteneur bleu.', 'Confier le transpalette électrique à une personne non autorisée.'] },
        { title: 'Bonnes pratiques professionnelles', kind: 'pratiques', items: ['Garder les allées dégagées pendant la mise en rayon.', 'Signaler un sol mouillé avec un chevalet.', 'Plier les cartons et réutiliser les calages.', 'Proposer systématiquement la reprise de l’ancien appareil.'] },
        { title: 'Mots-clés', kind: 'mots-cles', items: ['Obligation générale de sécurité', 'ERP', 'Accessibilité', 'Pictogramme', 'Sens de circulation', 'Zone chaude', 'Zone froide', 'Niveau de présentation', 'Tri sélectif', 'DEEE'] },
        {
          title: "Les réflexes à retenir des nouveaux cas",
          kind: "pratiques",
          items: [
            "Une implantation se lit à hauteur du client et dans le sens réel du déplacement.",
            "Contrôle la circulation, la stabilité et la sécurité des produits avant de comparer l’attrait des emplacements.",
            "Chaque anomalie doit déboucher sur une action et un contrôle de réalisation."
          ]
        },
      ],
    },

    /* ================================ APPLICATION 1 ================================ */
    {
      id: 'application-1',
      kind: 'application',
      number: 1,
      title: 'Repérer les risques dans les rayons',
      guidance: 'autonome',
      hero: { id: 'd04-hyper', alt: 'Allée d’hypermarché avec un chariot au premier plan' },
      message: {
        from: 'Martin Weber',
        role: 'Responsable de secteur, hypermarché Grand Ried',
        text: ['Tu fais ta PFMP chez nous. Dans un hypermarché, des dizaines de métiers se croisent et chacun a ses règles d’hygiène et de sécurité. Analyse ces situations observées cette semaine : y a-t-il un risque, et que faut-il faire ?'],
      },
      documents: [],
      activities: [
        {
          id: 'd04-a1-a1',
          kind: 'fields',
          label: '1',
          title: 'Analyser des situations de travail',
          instructions: 'Pour chaque situation, indique s’il y a un risque et choisis la solution à mettre en place.',
          helps: ['Demande-toi : qui pourrait se blesser ou tomber malade ?', 'Les risques possibles : chute, coupure, mal de dos, développement des bactéries.', 'Une seule situation est sans risque.'],
          outcomeIds: R3,
          layout: 'columns',
          columns: ['Risque ?', 'Solution'],
          fields: RISQUES.flatMap((r): Field[] => [
            { id: `${r.id}.0`, label: r.text, kind: 'choice', options: OUI_NON, answer: r.risque ? 'oui' : 'non', explain: r.explain },
            { id: `${r.id}.1`, label: r.text, kind: 'choice', select: true, options: SOLUTIONS, answer: r.solution, explain: r.explain },
          ]),
        },
      ],
      selfAssessment: ['Je sais repérer un risque d’hygiène ou de sécurité.', 'Je sais proposer une solution adaptée.'],
    },

    /* ================================ APPLICATION 2 ================================ */
    {
      id: 'application-2',
      kind: 'application',
      number: 2,
      title: 'Implanter les produits en respectant la chaîne du froid',
      guidance: 'autonome',
      hero: { id: 'd04-froid', alt: 'Cliente devant un bac de produits surgelés en supermarché' },
      message: {
        from: 'Élodie Fuchs',
        role: 'Tutrice, supermarché Les Halles du Ried',
        text: ['Nous réaménageons les rayons produits frais et surgelés. C’est une zone sensible : la chaîne du froid ne doit jamais être rompue. Aide-moi à placer ces rayons, puis analyse le relevé de températures de notre chambre froide.'],
      },
      documents: [
        {
          id: 'd04-a2-doc1',
          number: 1,
          title: 'La chaîne du froid',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'La chaîne du froid consiste à maintenir un produit à basse température, sans interruption, de sa fabrication jusqu’à son achat. Une rupture favorise la multiplication des bactéries, altère le goût, l’odeur ou l’aspect du produit et peut provoquer des intoxications alimentaires.' },
            {
              type: 'list',
              items: [
                'Produits frais : en général entre 0 et +4 °C.',
                'Produits surgelés : −18 °C ou moins.',
                'Les produits réceptionnés passent immédiatement en chambre froide, jamais d’attente sur le quai.',
                'Les rayons froids sont placés près des chambres froides pour limiter le trajet des marchandises.',
                'Les surgelés sont pris en dernier par les clients : on les place en fin de parcours.',
                'Un produit décongelé ne doit jamais être recongelé.',
              ],
            },
          ],
        },
        { id: 'd04-a2-doc2', number: 2, title: 'Plan du supermarché', look: 'texte', blocks: [{ type: 'plan', plan: FROID_PLAN }] },
        {
          id: 'd04-a2-doc3',
          number: 3,
          title: 'Relevé des températures de la chambre froide négative — août',
          look: 'texte',
          blocks: [0, 8, 16, 24].map((start) => ({
            type: 'table' as const,
            head: ['Jour', ...TEMPERATURES.slice(start, start + 8).map((_, i) => String(start + i + 1))],
            rows: [['°C', ...TEMPERATURES.slice(start, start + 8).map((t) => String(t).replace('-', '−'))]],
          })),
        },
      ],
      activities: [
        {
          id: 'd04-a2-a1',
          kind: 'fields',
          label: '1',
          title: 'Placer les rayons froids',
          instructions: 'Choisis l’emplacement de chaque rayon sur le plan (document 2) et justifie.',
          helps: ['Repère les deux chambres froides dans la réserve.', 'Frais : près de la chambre froide positive. Surgelés : près de la négative ET en fin de parcours.', 'P est en face de la chambre froide positive ; R est juste avant les caisses, en face de la chambre négative.'],
          outcomeIds: R13,
          fields: [
            { id: 'frais', label: '1. Emplacement du rayon produits frais', kind: 'choice', options: letters(['P', 'Q', 'R', 'S']), answer: 'P', explain: 'P : à côté de la chambre froide positive, sur le parcours.' },
            { id: 'surg', label: '2. Emplacement du rayon surgelés', kind: 'choice', options: letters(['P', 'Q', 'R', 'S']), answer: 'R', explain: 'R : près de la chambre négative et juste avant les caisses.' },
            {
              id: 'justif',
              label: '3. Pourquoi ces emplacements ? (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'trajet', label: 'Le trajet entre la chambre froide et le rayon est très court' },
                { value: 'dernier', label: 'Les surgelés sont pris en dernier, juste avant de payer' },
                { value: 'parcours', label: 'Le client traverse tout le magasin avant d’atteindre les surgelés' },
                { value: 'entree', label: 'Les produits froids attirent le client dès l’entrée' },
              ],
              answers: ['trajet', 'dernier', 'parcours'],
              explain: 'Q est loin de la réserve et au début du parcours : les produits se réchaufferaient.',
            },
            {
              id: 'flux',
              label: '4. Un camion livre des surgelés. Quel trajet suivent-ils ?',
              kind: 'choice',
              options: [
                { value: 'ok', label: 'Quai → chambre froide négative tout de suite → bac du rayon R' },
                { value: 'quai', label: 'Quai, en attente jusqu’au soir → bac du rayon R' },
                { value: 'direct', label: 'Quai → surface de vente par l’entrée clients' },
              ],
              answer: 'ok',
              explain: 'Les surgelés ne doivent jamais attendre hors du froid.',
            },
          ],
        },
        {
          id: 'd04-a2-a2',
          kind: 'fields',
          label: '2',
          title: 'Analyser le relevé de températures',
          instructions: 'Analyse le document 3, puis réponds.',
          helps: ['La température doit rester à −18 °C ou moins.', '−15 °C est plus chaud que −18 °C.', `Écart = température la plus haute − (−18).`],
          outcomeIds: R3,
          fields: [
            num('jours', 'a. Nombre de jours où la température n’est pas conforme', JOURS_KO.length, `Les ${JOURS_KO.map((j) => j.jour).join(' et ')} août.`, 'jours'),
            num('ecart', 'a. Écart maximal au-dessus de −18 °C', ECART_MAX, `${String(Math.max(...TEMPERATURES)).replace('-', '−')} − (−18) = ${ECART_MAX} °C.`, '°C'),
            { id: 'quoi', label: 'a. Que s’est-il passé ces jours-là ?', kind: 'choice', options: [{ value: 'rupture', label: 'La température est remontée au-dessus de −18 °C : rupture de la chaîne du froid' }, { value: 'trop', label: 'La chambre froide était trop froide' }, { value: 'rien', label: 'Rien d’anormal' }], answer: 'rupture', explain: 'Une température plus haute que −18 °C est une rupture de la chaîne du froid.' },
            {
              id: 'causes',
              label: 'b. Causes possibles (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'porte', label: 'Porte de la chambre froide restée ouverte' },
                { value: 'panne', label: 'Panne ou défaut du groupe froid' },
                { value: 'quai', label: 'Marchandises laissées trop longtemps sur le quai avant rangement' },
                { value: 'clients', label: 'Trop de clients dans le magasin' },
              ],
              answers: ['porte', 'panne', 'quai'],
              explain: 'La fréquentation n’agit pas sur la chambre froide de la réserve.',
            },
            {
              id: 'mesures',
              label: 'c. Mesures à prendre immédiatement (plusieurs réponses)',
              kind: 'multi',
              options: [
                { value: 'controle', label: 'Contrôler l’état des produits stockés' },
                { value: 'retirer', label: 'Retirer de la vente les produits décongelés' },
                { value: 'reparer', label: 'Faire vérifier ou réparer l’installation' },
                { value: 'noter', label: 'Noter l’incident et les mesures sur le registre' },
                { value: 'recongeler', label: 'Recongeler les produits et les remettre en rayon' },
              ],
              answers: ['controle', 'retirer', 'reparer', 'noter'],
              explain: 'On ne recongèle jamais un produit décongelé.',
            },
          ],
        },
      ],
      selfAssessment: ['Je sais placer les rayons froids pour respecter la chaîne du froid.', 'Je sais repérer une rupture de la chaîne du froid et réagir.'],
    },

    /* ================================ APPLICATION 3 ================================ */
    {
      id: 'application-3',
      kind: 'application',
      number: 3,
      title: 'Identifier les règles d’hygiène',
      guidance: 'autonome',
      hero: { id: 'd04-hygiene', alt: 'Main gantée tenant une boîte de culture de bactéries' },
      message: {
        from: 'Claire Muller',
        role: 'Tutrice, épicerie fine Le Comptoir d’Alsace',
        text: ['Ici, nous vendons des produits frais en libre-service et à la coupe. Avant de travailler au comptoir, tu dois connaître les dangers microbiologiques et les règles d’hygiène. Lis notre fiche, puis réalise avec un camarade une affiche pour l’équipe.'],
      },
      documents: [
        {
          id: 'd04-a3-doc1',
          number: 1,
          title: 'Les dangers microbiologiques : la méthode des 5 M',
          look: 'texte',
          blocks: [
            { type: 'p', text: 'Des bactéries et des virus peuvent contaminer les aliments, puis s’y multiplier. Pour prévenir, on recherche les causes possibles de contamination avec la méthode des 5 M.' },
            {
              type: 'table',
              head: ['Cause', 'Moyens de prévention'],
              rows: [
                ['Matériel', 'Nettoyer et désinfecter les outils et les surfaces selon un plan de nettoyage.'],
                ['Milieu', 'Séparer zones propres et zones sales, aérer, lutter contre les nuisibles (insectes, rongeurs).'],
                ['Méthodes', 'Éviter les contaminations croisées entre aliments crus et cuits, se laver les mains entre deux opérations, respecter les températures.'],
                ['Main-d’œuvre', 'Tenue propre, cheveux couverts, mains lavées, pas de bijoux, formation à l’hygiène.'],
                ['Matières premières', 'Contrôler la fraîcheur, les dates limites, l’état des emballages et les températures à la réception.'],
              ],
            },
            {
              type: 'list',
              title: 'Quelques règles de base',
              items: [
                'Un plat chaud non consommé tout de suite est maintenu à +63 °C au moins.',
                'Pour le refroidir, il doit passer de +63 °C à moins de +10 °C en moins de 2 heures.',
                'On décongèle au réfrigérateur, à +4 °C, jamais à température ambiante.',
                'Le froid ralentit la multiplication des bactéries mais ne les tue pas.',
              ],
            },
          ],
        },
        {
          id: "d04-revision-6-doc",
          number: 2,
          title: "Contrôler une installation en animalerie",
          look: "fiche",
          source: "Document de travail fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "L’enseigne prévoit un îlot près de la caisse. La consigne fixe 1,30 m libre, la mesure donne 1,20 m. Une tablette de 25 kg reçoit quatre sacs de 7 kg. Les sacs supplémentaires peuvent aller en réserve et un marquage au sol indique un autre emplacement."
            }
          ]
        },
        {
          id: "d04-revision-dossier-doc1",
          number: 3,
          title: "Mesures prises dans deux zones",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "table",
              head: [
                "Zone",
                "Passage avant installation",
                "Emprise du meuble",
                "Visiteurs observés en 30 min"
              ],
              rows: [
                [
                  "A, entrée",
                  "1,85 m",
                  "0,50 m",
                  "80"
                ],
                [
                  "B, rayon audio",
                  "1,75 m",
                  "0,30 m",
                  "42"
                ]
              ]
            },
            {
              type: "p",
              text: "La consigne interne demande 1,40 m libre sur les deux trajets. Un câble traverse la zone A si on utilise la prise actuelle. B possède une prise dans le meuble."
            }
          ]
        },
        {
          id: "d04-revision-dossier-doc2",
          number: 4,
          title: "Notice du mobilier et produits",
          look: "fiche",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Maximum 12 kg par tablette et 32 kg sur le meuble. Trois tablettes. Les enceintes pèsent 4 kg chacune. Le plan de vente initial en prévoit 3 en haut, 3 au milieu et 3 en bas. Il existe une réserve immédiatement accessible."
            }
          ]
        },
        {
          id: "d04-revision-dossier-doc3",
          number: 5,
          title: "Proposition de dernière minute",
          look: "courriel",
          source: "Dossier de décision fictif rédigé pour Rayon",
          blocks: [
            {
              type: "p",
              text: "Un meuble étroit réduit l’emprise en A à 0,40 m. Le responsable maintient l’exigence de circulation et demande un contrôle réel avec un client arrêté. Il autorise une affiche en A et l’essai en B."
            }
          ]
        },
      ],
      activities: [
        {
          id: 'd04-a3-a1',
          kind: 'classify',
          label: '1',
          title: 'Relier chaque situation à une cause de contamination',
          instructions: 'Pour chaque situation observée, indique de quel « M » elle relève.',
          helps: ['Demande-toi : est-ce un objet, un lieu, une façon de faire, une personne ou un produit ?', 'Une façon de faire = méthode ; une personne = main-d’œuvre.', 'Nuisibles et humidité = milieu ; DLC dépassée = matières premières.'],
          outcomeIds: R3,
          categories: [
            { id: 'materiel', label: 'Matériel' },
            { id: 'milieu', label: 'Milieu' },
            { id: 'methodes', label: 'Méthodes' },
            { id: 'main', label: 'Main-d’œuvre' },
            { id: 'matieres', label: 'Matières premières' },
          ],
          items: CINQ_M,
        },
        {
          id: 'd04-a3-a2',
          kind: 'fields',
          label: '2',
          title: 'Appliquer les règles de température',
          instructions: 'Réponds à l’aide des règles de base.',
          helps: ['Relis la liste « Quelques règles de base ».', 'Le maintien au chaud se fait à +63 °C au moins.', 'Le refroidissement dure moins de 2 heures.'],
          outcomeIds: R3,
          fields: [
            num('chaud', '1. Température minimale de maintien d’un plat chaud', 63, '+63 °C au moins.', '°C'),
            num('refroid', '2. Durée maximale pour refroidir un plat de +63 °C à +10 °C', 2, 'Moins de 2 heures.', 'h'),
            { id: 'decongel', label: '3. Où décongeler un produit ?', kind: 'choice', options: [{ value: 'frigo', label: 'Au réfrigérateur, à +4 °C' }, { value: 'plan', label: 'Sur le plan de travail' }, { value: 'vitrine', label: 'Dans la vitrine du comptoir' }], answer: 'frigo', explain: 'Au réfrigérateur, jamais à température ambiante.' },
            { id: 'froid', label: '4. Le froid positif tue-t-il les bactéries ?', kind: 'choice', options: OUI_NON, answer: 'non', explain: 'Il ralentit leur multiplication, sans les tuer.' },
          ],
        },
        {
          id: 'd04-a3-a3',
          kind: 'open',
          label: '3',
          title: 'Réaliser une affiche « Les 5 M de l’hygiène »',
          instructions: 'En binôme, sur un logiciel de mise en page ou de présentation, réalise une affiche A4 très visuelle qui présente les cinq sources de contamination et un geste de prévention pour chacune. Décris ici le contenu de ton affiche.',
          helps: ['Une affiche se lit en quelques secondes : peu de texte, des pictogrammes.', 'Un bloc par « M » : un titre, une image, un geste.', 'Exemple pour « Main-d’œuvre » : pictogramme de mains sous le robinet, « Je me lave les mains en revenant de pause ».'],
          outcomeIds: R3,
          prompts: [
            { id: 'titre', label: 'Titre de l’affiche', lines: 1 },
            { id: 'contenu', label: 'Les cinq blocs : pour chaque « M », l’image ou le pictogramme choisi et le geste de prévention', lines: 6 },
            { id: 'lieu', label: 'Où l’afficheras-tu dans le magasin ? Pourquoi ?', lines: 2 },
          ],
          selfCheck: ['Les cinq « M » sont présents.', 'Chaque bloc donne un geste concret.', 'L’affiche utilise des images ou des pictogrammes.', 'Le texte est court et lisible de loin.'],
        },
        {
          id: "d04-revision-6",
          label: "Nouveau cas d’application",
          title: "Contrôler une installation en animalerie",
          instructions: "Lis le document 2. Saisis les résultats chiffrés et indique ton raisonnement dans les réponses rédigées. Clique sur « Vérifier mes réponses » après avoir répondu pour consulter le corrigé.",
          kind: "fields",
          helps: [
            "Traite la circulation et la charge séparément, puis décris les contrôles.",
            "Relis le document 2 et relève la contrainte ou la donnée qui détermine ta première réponse. Justifie ensuite ta décision avec une valeur ou un fait précis.",
            "25 ÷ 7 = 3 sacs entiers au maximum."
          ],
          outcomeIds: [
            "d04-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Combien de sacs au maximum peuvent rester sur la tablette ?",
              kind: "number",
              answer: 3,
              explain: "25 ÷ 7 = 3 sacs entiers au maximum."
            },
            {
              id: "q2",
              label: "Écris la fiche de décision avant ouverture.",
              kind: "written",
              lines: 3,
              model: "Déplacer l’îlot vers le repère autorisé et mesurer au moins 1,30 m de passage. Retirer au moins un sac, placer au plus 21 kg sur la tablette et contrôler sa stabilité. Reporter les mesures avant ouverture."
            }
          ]
        },
        {
          id: "d04-revision-dossier",
          label: "Dossier de décision",
          title: "Valider une implantation en arbitrant entre sécurité et visibilité",
          instructions: "Lis les documents 3 et 4, puis écris ton diagnostic initial. Passe ensuite au document 5 pour revoir ta décision. Note tes calculs et les faits qui justifient chaque choix dans les zones de réponse. Après avoir répondu, clique sur « Vérifier mes réponses » pour comparer avec les propositions de corrigé.",
          kind: "fields",
          helps: [
            "Contrôle séparément le passage, le câble, la charge par tablette et le poids total.",
            "Compare chaque mesure à sa propre limite. Un emplacement peut respecter la largeur et rester inutilisable à cause d’un câble ou d’un arrêt de clients.",
            "Exemple. Une allée de 1,70 m moins 0,25 m d’emprise laisse 1,45 m. Deux tablettes chargées à 10 kg chacune respectent un plafond de 12 kg par tablette, mais dépassent un plafond total de 18 kg."
          ],
          outcomeIds: [
            "d04-r3"
          ],
          fields: [
            {
              id: "q1",
              label: "Compare les deux zones initiales et identifie les conditions qui bloquent chacune.",
              kind: "written",
              lines: 6,
              model: "A laisse 1,35 m, sous le minimum de 1,40 m, et le câble traverse le passage. B laisse 1,45 m et a une prise intégrée. B est envisageable après vérification du passage pendant un essai."
            },
            {
              id: "q2",
              label: "Corrige la charge du meuble en conservant le plus grand nombre d’enceintes possible.",
              kind: "written",
              lines: 6,
              model: "Neuf enceintes font 36 kg. Huit font 32 kg, par exemple 3 en bas, 3 au milieu et 2 en haut. Les tablettes portent 12, 12 et 8 kg. La neuvième va en réserve."
            },
            {
              id: "q3",
              label: "Le meuble étroit suffit-il à valider A ? Propose le parcours retenu.",
              kind: "written",
              lines: 6,
              model: "Il laisse 1,45 m hors présence des clients, mais le câble et l’arrêt restent à contrôler. Retenir l’affiche d’orientation en A, puis la démonstration en B avec prise intégrée et contrôle du passage."
            },
            {
              id: "q4",
              label: "Rédige trois critères de décision à cocher avant ouverture.",
              kind: "written",
              lines: 6,
              model: "Passage mesuré au moins à 1,40 m en situation d’essai. Câble hors cheminement et accès à la sortie libre. Charge maximale de 12 kg par tablette et de 32 kg au total vérifiée après installation."
            }
          ]
        },
      ],
      selfAssessment: ['Je connais les cinq causes de contamination.', 'Je sais appliquer les règles de température de base.', 'Je sais concevoir un support visuel pour l’équipe.',
        "Je vérifie ensemble le passage, le branchement et la charge.",
        "Je distingue la visibilité d’une zone de la faisabilité d’un essai.",
        "Je formule des contrôles mesurables avant ouverture."],
    },

    /* ================================ BILAN ================================ */
    {
      id: 'bilan',
      kind: 'bilan',
      title: 'Évaluez votre réussite',
      documents: [],
      activities: [],
      selfAssessment: [
        'Je sais contrôler la sécurité et l’accessibilité d’un local commercial.',
        'Je sais distinguer l’affichage obligatoire de l’affichage informatif et lire un pictogramme.',
        'Je sais organiser une surface de vente selon le sens de circulation et les zones.',
        'Je sais choisir le bon matériel de manutention et les niveaux de présentation.',
        'Je sais trier les déchets et appliquer les règles de reprise.',
        'Je sais appliquer les règles d’hygiène et de la chaîne du froid.',
      ],
    },
  ],
};
