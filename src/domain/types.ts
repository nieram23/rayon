/**
 * Modèle de données de la plateforme Rayon.
 *
 * Principe : les contenus pédagogiques (src/content) décrivent CE QUI EST ENSEIGNÉ.
 * Les données de suivi (progression, maîtrise) décrivent CE QUE L'ÉLÈVE A FAIT.
 * Les deux ne sont jamais mélangés : un dossier existe indépendamment de tout élève.
 *
 * Tous les identifiants sont stables (ex. « d05 », « d05-r1 ») : ils serviront de
 * clés en base de données lors d'un futur jalon. Ne jamais les renuméroter.
 */

/* ------------------------------------------------------------------ */
/* Programme                                                          */
/* ------------------------------------------------------------------ */

export type PartId = 'p1' | 'p2' | 'p3';
export type MetaCompetenceId = 'mc1' | 'mc2' | 'mc3';
export type UnitKind = 'dossier' | 'scenario';

/** Disponibilité éditoriale d'un dossier (indépendante de l'élève). */
export type Availability = 'a-venir' | 'disponible';

/** Origine d'une information pédagogique. */
export type ContentSource =
  /** Repris de la grille / du sommaire du manuel de référence. */
  | 'manuel'
  /** Ajouté par l'équipe pédagogique de la plateforme (n'est pas une citation du manuel). */
  | 'ajout-pedagogique';

export interface Part {
  id: PartId;
  number: 1 | 2 | 3;
  title: string;
  /** Nom court utilisé dans les filtres et la navigation mobile. */
  shortTitle: string;
  /** Accroche éditoriale (rédigée pour la plateforme). */
  tagline: string;
  description: string;
  /** Clé du thème graphique (couleurs, illustration). */
  theme: PartId;
}

export interface MetaCompetence {
  id: MetaCompetenceId;
  label: string;
  /** Libellé court pour les petits écrans. */
  short: string;
}

/** Compétence professionnelle travaillée dans un dossier (formulation du sommaire). */
export interface ProfessionalSkill {
  id: string;
  text: string;
}

/** Résultat attendu (ou critère d'observation) servant à évaluer la maîtrise. */
export interface ExpectedOutcome {
  id: string;
  text: string;
  source: ContentSource;
  /** Méta-compétence(s) auxquelles ce résultat contribue. */
  metaCompetenceIds: MetaCompetenceId[];
  /** Pour un scénario : résultat équivalent déjà évalué dans un dossier. */
  echoesOutcomeId?: string;
  note?: string;
}

/** Un dossier pédagogique ou un scénario transversal. */
export interface LearningUnit {
  id: string;
  kind: UnitKind;
  /** Numéro affiché : 1 à 13 pour les dossiers, 1 à 2 pour les scénarios. */
  number: number;
  /** Ordre global dans le parcours (1 à 15). */
  order: number;
  partId: PartId;
  /** Intitulé exact (sommaire du manuel). */
  title: string;
  /** Description courte rédigée pour la plateforme. */
  summary: string;
  /** Présentation générale rédigée pour la plateforme. */
  overview: string;
  skills: ProfessionalSkill[];
  metaCompetenceIds: MetaCompetenceId[];
  /** Résultats attendus issus de la grille du manuel. */
  outcomes: ExpectedOutcome[];
  /** Critères complémentaires prévus pour les futures activités (hors manuel). */
  plannedCriteria: ExpectedOutcome[];
  /** Pistes de situations professionnelles à développer ultérieurement. */
  plannedSituations: string[];
  /** Pour un scénario : dossiers dont les compétences sont remobilisées. */
  mobilisesUnitIds?: string[];
  availability: Availability;
  /** Missions du dossier — vide tant que le dossier n'est pas développé. */
  missions: MissionDefinition[];
}

/* ------------------------------------------------------------------ */
/* Structure des futurs chapitres (jalon 2 et suivants)               */
/* ------------------------------------------------------------------ */

/** Formes de production prévues : pas de QCM ou de champ texte par défaut. */
export type ProductionKind =
  | 'tableau'
  | 'bon-de-commande'
  | 'schema'
  | 'plan-annote'
  | 'calcul'
  | 'courriel'
  | 'classement'
  | 'tableau-de-bord'
  | 'presentoir'
  | 'justification'
  | 'choix-argumente';

/** Mode de vérification d'une production. */
export type VerificationMode =
  /** Réponse fermée, vérifiable automatiquement de façon fiable. */
  | 'automatique'
  /** Grille d'autoévaluation proposée à l'élève. */
  | 'autoevaluation'
  /** Production ouverte : correction par l'enseignant uniquement. */
  | 'enseignant';

export interface ResourceDocument {
  id: string;
  number: number;
  title: string;
  kind: 'presentation' | 'courriel' | 'catalogue' | 'etat' | 'conditions' | 'plan' | 'autre';
}

export interface HelpLevel {
  level: 1 | 2 | 3;
  /** 1 : indice · 2 : rappel de méthode · 3 : aide détaillée. */
  content: string;
}

export interface ProductionDefinition {
  id: string;
  kind: ProductionKind;
  instructions: string;
  verification: VerificationMode;
  outcomeIds: string[];
}

export interface MissionDefinition {
  id: string;
  unitId: string;
  order: number;
  /** Commence obligatoirement par un verbe d'action. */
  title: string;
  problem: string;
  instructions: string[];
  documentIds: string[];
  productions: ProductionDefinition[];
  helps: HelpLevel[];
}

/* ------------------------------------------------------------------ */
/* Évaluation                                                         */
/* ------------------------------------------------------------------ */

/** Niveaux de maîtrise de la grille (1 à 4). */
export type MasteryLevel = 1 | 2 | 3 | 4;
/** `null` = Non évalué (≠ Non maîtrisé). */
export type MasteryValue = MasteryLevel | null;

export interface MasteryLevelDefinition {
  level: MasteryLevel | null;
  code: 'NE' | '1' | '2' | '3' | '4';
  label: string;
  description: string;
}

export interface MasteryAssessment {
  outcomeId: string;
  unitId: string;
  level: MasteryLevel;
  /**
   * « enseignant » : niveau validé par le professeur (seul niveau officiel).
   * « indicatif » : proposition du système, jamais déduite d'un simple score de quiz.
   */
  origin: 'enseignant' | 'indicatif';
  assessedAt: string;
  comment?: string;
}

/* ------------------------------------------------------------------ */
/* Suivi : trois indicateurs distincts                                */
/* ------------------------------------------------------------------ */

export type ProgressStatus = 'non-commence' | 'en-cours' | 'termine';

export interface UnitProgress {
  unitId: string;
  /** PROGRESSION : part des activités accomplies. */
  activitiesDone: number;
  activitiesTotal: number;
  /** RÉUSSITE : qualité des réponses vérifiables (0–100), null si rien de vérifiable. */
  successRate: number | null;
  lastMissionId?: string;
  lastMissionTitle?: string;
  lastVisitedAt?: string;
}

/* ------------------------------------------------------------------ */
/* Utilisateurs et modes                                              */
/* ------------------------------------------------------------------ */

/**
 * « local » : données réelles de l'élève, stockées uniquement dans ce navigateur.
 * « demo »  : données simulées, signalées comme telles à l'écran.
 */
export type DataMode = 'local' | 'demo';

export interface StudentProfile {
  pseudo: string;
  classLabel: string;
  createdAt: string;
}
