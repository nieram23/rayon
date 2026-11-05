import { useMemo } from 'react';
import { ALL_OUTCOMES, UNITS } from '../content';
import { levelOf, needsWork, summarize } from '../domain/progress';
import { teacherData, type ProductionState } from '../services/teacherData';
import { useApp } from './AppContext';
import { useTeacherSource } from './TeacherSource';

/** Vue enseignant agrégée. Recalculée quand l'enseignant modifie un niveau. */
export function useTeacher() {
  const { teacherRevision, bumpTeacher } = useApp();
  const real = useTeacherSource();
  // Site en ligne : vrais élèves. Sans serveur (aperçu) : jeu de démonstration.
  const source = real ? real.source : teacherData;
  return useMemo(() => {
    if (!source) {
      return {
        real: true,
        loading: real?.loading ?? false,
        error: real?.error ?? null,
        reload: real?.reload ?? (() => undefined),
        classes: [],
        students: [] as Array<never>,
        productions: [],
        difficulties: [],
        setLevel: () => undefined,
        setProductionState: (_id: string, _s: ProductionState) => undefined,
        resetOverrides: () => undefined,
      };
    }
    const teacherData = source;
    const classes = teacherData.listClasses();
    const students = teacherData.listStudents().map((s) => {
      const progress = teacherData.progressOf(s.id);
      const mastery = teacherData.masteryOf(s.id);
      const summary = summarize(UNITS, progress);
      const evaluated = ALL_OUTCOMES.filter((r) => levelOf(r.outcome.id, mastery) !== null).length;
      const toRework = ALL_OUTCOMES.filter((r) => needsWork(levelOf(r.outcome.id, mastery))).length;
      return { ...s, progress, mastery, summary, evaluated, toRework, className: classes.find((c) => c.id === s.classId)?.label ?? '' };
    });
    return {
      real: !!real,
      loading: real?.loading ?? false,
      error: real?.error ?? null,
      reload: real?.reload ?? (() => undefined),
      classes,
      students,
      productions: teacherData.productions(),
      difficulties: teacherData.difficulties(),
      setLevel: (studentId: string, outcomeId: string, level: 1 | 2 | 3 | 4 | null) => {
        void Promise.resolve(teacherData.setTeacherLevel(studentId, outcomeId, level)).catch(() => real?.reload());
        bumpTeacher();
        real?.touch();
      },
      setProductionState: (id: string, state: ProductionState) => {
        if (real?.source) {
          void real.source.setProductionState(id, state).catch(() => real.reload());
          real.touch();
        }
      },
      resetOverrides: () => {
        teacherData.resetOverrides();
        bumpTeacher();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherRevision, source, real?.version, real?.loading, real?.error]);
}

export type TeacherView = ReturnType<typeof useTeacher>;
export type TeacherStudent = TeacherView['students'][number];
