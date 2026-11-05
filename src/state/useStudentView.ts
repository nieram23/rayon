import { useMemo } from 'react';
import { ALL_OUTCOMES, UNITS } from '../content';
import { levelOf, masteryFor, needsWork, statusOf, summarize } from '../domain/progress';
import type { LearningUnit } from '../domain/types';
import { useApp } from './AppContext';

/** Vue dérivée des données de l'élève, commune à toutes les pages élève. */
export function useStudentView() {
  const { student } = useApp();
  return useMemo(() => {
    const progress = student.getProgress();
    const mastery = student.getMastery();
    const byId = new Map(progress.map((p) => [p.unitId, p]));
    const summary = summarize(UNITS, progress);
    const evaluated = ALL_OUTCOMES.filter((r) => levelOf(r.outcome.id, mastery) !== null);
    const toRework = ALL_OUTCOMES.filter((r) => needsWork(levelOf(r.outcome.id, mastery)));
    return {
      mode: student.mode,
      progress,
      mastery,
      summary,
      evaluated,
      toRework,
      progressOf: (u: LearningUnit) => byId.get(u.id),
      statusOf: (u: LearningUnit) => statusOf(byId.get(u.id)),
      availabilityOf: (u: LearningUnit) => student.availabilityOf(u),
      levelOf: (outcomeId: string) => levelOf(outcomeId, mastery),
      assessmentOf: (outcomeId: string) => masteryFor(outcomeId, mastery),
    };
  }, [student]);
}
