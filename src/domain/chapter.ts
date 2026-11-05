/**
 * Structure d'un chapitre (dossier développé).
 * Un chapitre = une suite d'étapes ; chaque étape contient des documents ressources
 * (à lire) et des activités (annexes à compléter), strictement séparés.
 */

export type StepKind = 'ouverture' | 'mission' | 'synthese' | 'application' | 'bilan';

/* ------------------------------ Images ------------------------------ */

/** Référence vers une photo du registre (src/content/images.ts). */
export interface ImageRef {
  id: string;
  alt: string;
  /** Légende affichée sous l'image. */
  caption?: string;
}

/* ------------------------------ Documents ------------------------------ */

export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; title?: string }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string; align?: Array<'left' | 'right' | 'center'> }
  | { type: 'facts'; items: Array<[label: string, value: string]> }
  | { type: 'note'; text: string }
  | { type: 'formula'; text: string; example?: string }
  | { type: 'image'; image: ImageRef; float?: boolean }
  | { type: 'quote'; text: string; author: string }
  /** Plan de réserve : zones colorées. */
  | { type: 'zones'; title?: string; zones: Array<{ id: string; label: string; sub?: string; tone: 'rose' | 'bleu' | 'violet' | 'jaune' | 'vert' | 'orange' | 'gris'; wide?: boolean }> }
  /** Pictogrammes de sécurité. */
  | { type: 'signs'; signs: SignKey[]; labels?: string[] }
  /** Plan de magasin dessiné (unités libres, 1 unité ≈ 1 m). */
  | { type: 'plan'; plan: StorePlan };

export type SignKey =
  | 'chaussures'
  | 'telephone'
  | 'danger-chariots'
  | 'stockage'
  | 'chariots'
  | 'gauche'
  | 'monter'
  | 'sortie'
  | 'extincteur'
  | 'alarme'
  | 'sol-glissant'
  | 'gants'
  | 'entree-interdite'
  | 'rassemblement'
  | 'fumer'
  | 'electrique';

export type PlanTone = 'rose' | 'bleu' | 'violet' | 'jaune' | 'vert' | 'orange' | 'gris' | 'blanc' | 'froid';

export interface StorePlan {
  title?: string;
  width: number;
  height: number;
  /** Surfaces : rayons, pièces, mobilier. */
  areas: Array<{ x: number; y: number; w: number; h: number; label?: string; sub?: string; tone?: PlanTone; dashed?: boolean }>;
  /** Repères ponctuels : lettre à identifier, sortie, extincteur, caisse, entrée. */
  marks?: Array<{ x: number; y: number; kind: 'lettre' | 'sortie' | 'extincteur' | 'caisse' | 'entree'; label?: string }>;
  /** Flèches de circulation. */
  arrows?: Array<{ points: Array<[number, number]>; tone?: 'ink' | 'rouge' | 'vert' | 'bleu' }>;
  /** Légende sous le plan. */
  legend?: string;
}

export interface ChapterDocument {
  id: string;
  number: number;
  title: string;
  /** Mise en forme : courriel, fiche produit, extrait de contrat… */
  look: 'texte' | 'fiche' | 'courriel' | 'contrat' | 'facture' | 'article' | 'procedure' | 'memo' | 'site' | 'postit';
  /** Pour « site » : adresse affichée dans la barre du navigateur. */
  url?: string;
  source?: string;
  blocks: DocBlock[];
}

/* ------------------------------ Activités ------------------------------ */

export interface ChoiceOption {
  value: string;
  label: string;
}

/** Champ unitaire d'une annexe. */
export type Field =
  | {
      id: string;
      label: string;
      kind: 'number';
      answer: number;
      /** Écart accepté (arrondis). */
      tolerance?: number;
      unit?: string;
      explain: string;
    }
  | { id: string; label: string; kind: 'choice'; options: ChoiceOption[]; answer: string; explain: string; select?: boolean; sign?: SignKey; image?: ImageRef }
  | { id: string; label: string; kind: 'multi'; options: ChoiceOption[]; answers: string[]; explain: string }
  | {
      id: string;
      label: string;
      kind: 'text';
      /** Réponses acceptées (comparaison sans majuscules, accents ni ponctuation). */
      accept: string[];
      placeholder?: string;
      explain: string;
    }
  | { id: string; label: string; kind: 'given'; value: string }
  /**
   * Réponse rédigée : non corrigée automatiquement. Après la vérification, l'élève compare
   * sa réponse au corrigé modèle et aux critères (autocorrection), l'enseignant valide.
   */
  | { id: string; label: string; kind: 'written'; lines?: number; model: string; criteria?: string[]; placeholder?: string };

interface ActivityBase {
  id: string;
  /** « Annexe 1 », « Question 2 »… */
  label: string;
  title: string;
  instructions: string;
  /** Aides progressives : 1 indice, 2 rappel de méthode, 3 aide détaillée. */
  helps: [string, string, string];
  outcomeIds: string[];
}

export interface FieldsActivity extends ActivityBase {
  kind: 'fields';
  layout?: 'table' | 'extranet' | 'checklist' | 'columns' | 'signs';
  /** Titre de la fenêtre pour la disposition « extranet » (formulaire). */
  windowTitle?: string;
  /** Pour « columns » : en-têtes des colonnes ; chaque champ a un id « ligne.colonne ». */
  columns?: string[];
  fields: Field[];
}

export interface ClassifyActivity extends ActivityBase {
  kind: 'classify';
  categories: Array<{ id: string; label: string; group?: string }>;
  items: Array<{ id: string; text: string; answer: string; explain: string }>;
}

export interface CircuitActivity extends ActivityBase {
  kind: 'circuit';
  circuits: Array<{
    id: string;
    typeAnswer: string;
    typeOptions: ChoiceOption[];
    /** Maillons du producteur au consommateur. */
    slots: Array<{ id: string; fixed?: string; answer?: string }>;
    slotOptions: ChoiceOption[];
    explain: string;
  }>;
}

export interface GridActivity extends ActivityBase {
  kind: 'grid';
  /** En-têtes de groupes (ex. semaines) puis sous-colonnes. */
  groups: Array<{ label: string; columns: string[] }>;
  rows: Array<{
    id: string;
    label: string;
    sub?: string;
    /** Une cellule par sous-colonne : valeur donnée (number) ou attendue ({ answer }). */
    cells: Array<number | string | { answer: number; explain: string; tolerance?: number }>;
  }>;
  legend?: string;
}

export interface OpenActivity extends ActivityBase {
  kind: 'open';
  prompts: Array<{ id: string; label: string; lines?: number }>;
  /** Points que l'élève vérifie lui-même avant d'enregistrer. */
  selfCheck: string[];
}

export type PlanningSymbol = 'commande' | 'prevue' | 'effective' | 'relance';

/** Planning de suivi des livraisons : l'élève pose des repères sur un calendrier. */
export interface PlanningActivity extends ActivityBase {
  kind: 'planning';
  days: Array<{ id: string; dow: string; num: number; month: string }>;
  rows: Array<{
    id: string;
    label: string;
    /** Repères déjà présents (non modifiables). */
    given: Array<{ day: string; symbol: PlanningSymbol }>;
    /** Repères attendus de l'élève. */
    expected: Array<{ day: string; symbol: PlanningSymbol; explain: string }>;
  }>;
}

export type Activity = FieldsActivity | ClassifyActivity | CircuitActivity | GridActivity | OpenActivity | PlanningActivity;

/* ------------------------------ Étapes ------------------------------ */

export interface ManagerMessage {
  from: string;
  role: string;
  text: string[];
}

export interface ChapterStep {
  id: string;
  kind: StepKind;
  /** Numéro de mission ou d'application. */
  number?: number;
  /** Titre commençant par un verbe d'action (missions). */
  title: string;
  /** Niveau de guidage décroissant (affiché). */
  guidance?: 'guidé' | 'accompagné' | 'autonome';
  message?: ManagerMessage;
  /** Photo d'illustration de l'étape. */
  hero?: ImageRef;
  documents: ChapterDocument[];
  activities: Activity[];
  /** Contenu libre pour la synthèse. */
  synthesis?: SynthesisSection[];
  /** Critères d'autoévaluation (application, bilan). */
  selfAssessment?: string[];
}

export interface SynthesisSection {
  title: string;
  kind: 'notions' | 'methodes' | 'formules' | 'erreurs' | 'pratiques' | 'mots-cles';
  items: string[];
}

export interface CompanyCard {
  name: string;
  tagline: string;
  facts: Array<[string, string]>;
}

export interface Chapter {
  unitId: string;
  /** Mission générale confiée à l'élève (ouverture). */
  mission: string;
  company: CompanyCard;
  /** Mention de fiction affichée à l'ouverture. */
  fictionNotice: string;
  steps: ChapterStep[];
}

/* ------------------------------ Réponses ------------------------------ */

export type AnswerValue = string | string[];

export interface ActivityAnswer {
  values: Record<string, AnswerValue>;
  attempts: number;
  /** Aides consultées (0 à 3). */
  helpsUsed: number;
  /** Résultat de la dernière vérification automatique. */
  correct?: number;
  total?: number;
  /** Activité ouverte : enregistrée par l'élève, en attente de correction. */
  submitted?: boolean;
  updatedAt: string;
}

export type ChapterAnswers = Record<string, ActivityAnswer>;
