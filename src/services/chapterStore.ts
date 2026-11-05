import type { ActivityAnswer, Chapter, ChapterAnswers } from '../domain/chapter';
import { allActivities, isAutoCheckable, isDone } from '../domain/check';
import type { UnitProgress } from '../domain/types';
import { readJSON, writeJSON } from './storage';

/**
 * Réponses de l'élève aux chapitres, stockées localement (clé « answers.<unité> »).
 * Futur jalon : la même structure sera envoyée à la base de données.
 */

export interface ChapterRecord {
  answers: ChapterAnswers;
  /** Autoévaluation : critère → niveau 1 à 4 choisi par l'élève (n'est pas une maîtrise validée). */
  selfAssessment: Record<string, number>;
  lastStepId?: string;
  /** Étapes déjà ouvertes (synthèse, bilan…). */
  visited: string[];
  lastStepTitle?: string;
  lastVisitedAt?: string;
}

const key = (unitId: string) => `answers.${unitId}`;
const EMPTY: ChapterRecord = { answers: {}, selfAssessment: {}, visited: [] };

export function readChapter(unitId: string): ChapterRecord {
  const r = readJSON<ChapterRecord>(key(unitId), EMPTY);
  return { ...EMPTY, ...r, answers: r.answers ?? {}, selfAssessment: r.selfAssessment ?? {}, visited: r.visited ?? [] };
}

function write(unitId: string, r: ChapterRecord) {
  writeJSON(key(unitId), r);
}

export function saveAnswer(unitId: string, activityId: string, ans: ActivityAnswer) {
  const r = readChapter(unitId);
  r.answers[activityId] = ans;
  r.lastVisitedAt = new Date().toISOString();
  write(unitId, r);
}

export function saveSelfAssessment(unitId: string, criterion: string, level: number) {
  const r = readChapter(unitId);
  r.selfAssessment[criterion] = level;
  write(unitId, r);
}

export function markVisited(unitId: string, stepId: string, stepTitle: string) {
  const r = readChapter(unitId);
  r.lastStepId = stepId;
  if (!r.visited.includes(stepId)) r.visited.push(stepId);
  r.lastStepTitle = stepTitle;
  r.lastVisitedAt = new Date().toISOString();
  write(unitId, r);
}

export function resetChapter(unitId: string) {
  write(unitId, EMPTY);
}

/** Progression et réussite calculées à partir des réponses (jamais la maîtrise). */
export function chapterProgress(ch: Chapter): UnitProgress | undefined {
  return progressFromRecord(ch, readChapter(ch.unitId));
}

/** Même calcul à partir d'un enregistrement quelconque (données d'un élève lues par l'administrateur). */
export function progressFromRecord(ch: Chapter, raw: Partial<ChapterRecord> | undefined): UnitProgress | undefined {
  if (!raw) return undefined;
  const r: ChapterRecord = { ...EMPTY, ...raw, answers: raw.answers ?? {}, selfAssessment: raw.selfAssessment ?? {}, visited: raw.visited ?? [] };
  if (!r.lastVisitedAt) return undefined;
  const acts = allActivities(ch);
  const done = acts.filter((a) => isDone(a, r.answers[a.id])).length;
  let correct = 0;
  let total = 0;
  for (const a of acts) {
    const ans = r.answers[a.id];
    if (isAutoCheckable(a) && ans?.attempts && ans.total) {
      correct += ans.correct ?? 0;
      total += ans.total;
    }
  }
  return {
    unitId: ch.unitId,
    activitiesDone: done,
    activitiesTotal: acts.length,
    successRate: total ? Math.round((correct / total) * 100) : null,
    lastMissionId: r.lastStepId,
    lastMissionTitle: r.lastStepTitle,
    lastVisitedAt: r.lastVisitedAt,
  };
}
