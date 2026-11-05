import type { LearningUnit, MasteryAssessment, MasteryValue, ProgressStatus, UnitProgress } from './types';

/**
 * Trois indicateurs à ne jamais confondre :
 *  - PROGRESSION : part des activités accomplies (quantité).
 *  - RÉUSSITE    : qualité des réponses vérifiables (score).
 *  - MAÎTRISE    : niveau 1–4 évalué sur critères professionnels (validé par l'enseignant).
 * Un dossier terminé à 100 % n'implique aucune maîtrise.
 */

export function progressRatio(p?: UnitProgress): number {
  if (!p || p.activitiesTotal === 0) return 0;
  return Math.min(1, p.activitiesDone / p.activitiesTotal);
}

export function statusOf(p?: UnitProgress): ProgressStatus {
  if (!p || p.activitiesDone === 0) return 'non-commence';
  if (p.activitiesTotal > 0 && p.activitiesDone >= p.activitiesTotal) return 'termine';
  return 'en-cours';
}

export const STATUS_LABEL: Record<ProgressStatus, string> = {
  'non-commence': 'Non commencé',
  'en-cours': 'En cours',
  termine: 'Terminé',
};

export interface ProgressSummary {
  started: number;
  finished: number;
  /** Progression totale sur les 15 unités (moyenne des ratios). */
  overall: number;
  lastVisited?: UnitProgress;
}

export function summarize(units: LearningUnit[], progress: UnitProgress[]): ProgressSummary {
  const byId = new Map(progress.map((p) => [p.unitId, p]));
  let started = 0;
  let finished = 0;
  let sum = 0;
  for (const u of units) {
    const p = byId.get(u.id);
    const s = statusOf(p);
    if (s !== 'non-commence') started++;
    if (s === 'termine') finished++;
    sum += progressRatio(p);
  }
  const lastVisited = [...progress]
    .filter((p) => p.lastVisitedAt)
    .sort((a, b) => (b.lastVisitedAt! > a.lastVisitedAt! ? 1 : -1))[0];
  return { started, finished, overall: units.length ? sum / units.length : 0, lastVisited };
}

/** Niveau retenu pour un résultat : le niveau validé par l'enseignant prime sur l'indicatif. */
export function masteryFor(outcomeId: string, assessments: MasteryAssessment[]): MasteryAssessment | undefined {
  const list = assessments.filter((a) => a.outcomeId === outcomeId);
  return list.find((a) => a.origin === 'enseignant') ?? list.find((a) => a.origin === 'indicatif');
}

export function levelOf(outcomeId: string, assessments: MasteryAssessment[]): MasteryValue {
  return masteryFor(outcomeId, assessments)?.level ?? null;
}

/** À retravailler = évalué 1 ou 2. */
export function needsWork(level: MasteryValue): boolean {
  return level === 1 || level === 2;
}

export interface MasteryDistribution {
  ne: number;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  total: number;
}

export function distribution(levels: MasteryValue[]): MasteryDistribution {
  const d: MasteryDistribution = { ne: 0, l1: 0, l2: 0, l3: 0, l4: 0, total: levels.length };
  for (const l of levels) {
    if (l === null) d.ne++;
    else d[`l${l}` as 'l1'] = d[`l${l}` as 'l1'] + 1;
  }
  return d;
}
