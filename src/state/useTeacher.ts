import { useMemo } from 'react';
import { ALL_OUTCOMES, UNITS } from '../content';
import { levelOf, needsWork, summarize } from '../domain/progress';
import { teacherData } from '../services/teacherData';
import { useApp } from './AppContext';

/** Vue enseignant agrégée. Recalculée quand l'enseignant modifie un niveau. */
export function useTeacher() {
  const { teacherRevision, bumpTeacher } = useApp();
  return useMemo(() => {
    const classes = teacherData.listClasses();
    const students = teacherData.listStudents().map((s) => {
      const progress = teacherData.progressOf(s.id);
      const mastery = teacherData.masteryOf(s.id);
      const summary = summarize(UNITS, progress);
      const evaluated = ALL_OUTCOMES.filter((r) => levelOf(r.outcome.id, mastery) !== null).length;
      const toRework = ALL_OUTCOMES.filter((r) => needsWork(levelOf(r.outcome.id, mastery))).length;
      return { ...s, progress, mastery, summary, evaluated, toRework, className: classes.find((c) => c.id === s.classId)!.label };
    });
    return {
      classes,
      students,
      productions: teacherData.productions(),
      difficulties: teacherData.difficulties(),
      setLevel: (studentId: string, outcomeId: string, level: 1 | 2 | 3 | 4 | null) => {
        teacherData.setTeacherLevel(studentId, outcomeId, level);
        bumpTeacher();
      },
      resetOverrides: () => {
        teacherData.resetOverrides();
        bumpTeacher();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherRevision]);
}

export type TeacherView = ReturnType<typeof useTeacher>;
export type TeacherStudent = TeacherView['students'][number];
