import type { MasteryLevelDefinition, MetaCompetence, Part } from '../domain/types';

/**
 * Organisation éditoriale : reprise du sommaire d'un manuel de Bac Pro MCV option A.
 * Elle ne se substitue pas au référentiel officiel du diplôme.
 */
export const SOURCE_NOTICE =
  "Les intitulés des parties, dossiers et compétences ainsi que les résultats attendus reprennent l'organisation d'un manuel de Bac Pro MCV option A (sommaire et grille de suivi). Cette organisation éditoriale ne remplace pas le référentiel officiel du diplôme.";

export const PARTS: Part[] = [
  {
    id: 'p1',
    number: 1,
    title: 'Assurer les opérations préalables à la vente',
    shortTitle: 'Opérations préalables',
    tagline: 'De la commande au rayon : tout ce qui se passe avant l’arrivée du client.',
    description:
      'Commander, réceptionner, stocker, fixer les prix, inventorier, gérer les retours : la partie « réserve » du métier, celle qui garantit qu’un produit est au bon endroit, au bon prix, au bon moment.',
    theme: 'p1',
  },
  {
    id: 'p2',
    number: 2,
    title: 'Rendre l’unité commerciale attractive et fonctionnelle',
    shortTitle: 'Unité attractive',
    tagline: 'Donner envie d’entrer, de circuler et d’acheter — en magasin comme en ligne.',
    description:
      'Implanter les produits, mettre en scène l’offre en vitrine et en rayon, valoriser les produits sur les sites marchands et les réseaux sociaux.',
    theme: 'p2',
  },
  {
    id: 'p3',
    number: 3,
    title: 'Développer la clientèle',
    shortTitle: 'Développer la clientèle',
    tagline: 'Faire venir de nouveaux clients, puis mesurer ce qui a vraiment fonctionné.',
    description:
      'Préparer et mener une action commerciale, en évaluer les résultats, conquérir une clientèle grâce aux canaux digitaux.',
    theme: 'p3',
  },
];

export const META_COMPETENCES: MetaCompetence[] = [
  { id: 'mc1', label: 'Assurer les opérations préalables à la vente', short: 'Opérations préalables' },
  { id: 'mc2', label: 'Rendre l’unité commerciale attractive et fonctionnelle', short: 'Unité attractive' },
  { id: 'mc3', label: 'Développer la clientèle', short: 'Clientèle' },
];

export const MASTERY_LEVELS: MasteryLevelDefinition[] = [
  {
    level: null,
    code: 'NE',
    label: 'Non évalué',
    description: 'Aucune évaluation n’a encore porté sur ce résultat. Ce n’est pas un échec.',
  },
  {
    level: 1,
    code: '1',
    label: 'Non maîtrisé',
    description:
      'Les connaissances ou méthodes nécessaires ne sont pas acquises, même avec un accompagnement important.',
  },
  {
    level: 2,
    code: '2',
    label: 'Insuffisamment maîtrisé',
    description:
      'Certains éléments sont compris, mais des difficultés persistent dans l’application des méthodes ou la réalisation du travail.',
  },
  {
    level: 3,
    code: '3',
    label: 'Maîtrisé',
    description:
      'Les tâches attendues sont réalisées correctement dans une situation professionnelle adaptée au niveau de formation.',
  },
  {
    level: 4,
    code: '4',
    label: 'Bien maîtrisé',
    description:
      'Les tâches sont réalisées avec autonomie, précision et une justification pertinente, y compris en adaptant la méthode.',
  },
];
