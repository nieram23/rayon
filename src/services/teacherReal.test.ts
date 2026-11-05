import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../content/chapters';
import { allActivities } from '../domain/check';
import type { Account, CloudBackend, DataRow } from './cloud';
import { PRODUCTION_STATE_KEY, RealTeacherData } from './teacherReal';

const acc = (id: string, name: string, cls: string, role: 'student' | 'admin' = 'student'): Account => ({
  id, username: id, displayName: name, classLabel: cls, role, createdAt: '2026-11-01T00:00:00Z', lastSeenAt: null,
});

describe('espace enseignant : vraies données', () => {
  const ch = CHAPTERS.d01;
  const acts = allActivities(ch);
  const open = acts.find((a) => a.kind === 'open')!;
  const first = acts.find((a) => a.kind !== 'open')!;
  const rows: DataRow[] = [
    {
      userId: 'lea',
      key: 'answers.d01',
      updatedAt: '',
      value: {
        answers: {
          [first.id]: { values: {}, attempts: 4, helpsUsed: 1, correct: 2, total: 5, updatedAt: '2026-11-05T10:00:00Z' },
          [open.id]: { values: {}, attempts: 1, helpsUsed: 0, submitted: true, updatedAt: '2026-11-05T11:00:00Z' },
        },
        selfAssessment: {},
        visited: [],
        lastVisitedAt: '2026-11-05T11:00:00Z',
      },
    },
  ];
  const writes: Array<[string, string, unknown]> = [];
  const backend = { upsert: async (u: string, list: Array<{ key: string; value: unknown }>) => list.forEach((l) => writes.push([u, l.key, l.value])) } as unknown as CloudBackend;
  const t = new RealTeacherData([acc('admin', 'Prof', '', 'admin'), acc('lea', 'Léa Martin', '1re MCV A'), acc('noah', 'Noah Petit', '1re MCV A'), acc('ines', 'Inès D.', '')], rows, backend, Date.parse('2026-11-05T12:00:00Z'));

  it('ne montre que les élèves, regroupés par classe', () => {
    expect(t.listStudents().map((s) => s.pseudo)).toEqual(['Léa Martin', 'Noah Petit', 'Inès D.']);
    expect(t.listClasses().map((c) => [c.label, c.level, c.studentIds.length])).toEqual([
      ['1re MCV A', 'Première', 2],
      ['Sans classe', '', 1],
    ]);
  });

  it('calcule la progression réelle, les productions rendues et les difficultés', () => {
    expect(t.progressOf('lea')[0]).toMatchObject({ unitId: 'd01', activitiesTotal: acts.length });
    expect(t.progressOf('noah')).toEqual([]);
    expect(t.productions()).toEqual([expect.objectContaining({ studentId: 'lea', unitId: 'd01', state: 'a-corriger' })]);
    expect(t.difficulties()[0].label).toMatch(/4 tentatives/);
  });

  it('enregistre les niveaux validés et le statut des productions dans les données de l’élève', async () => {
    await t.setTeacherLevel('lea', 'd01-r1', 3);
    expect(t.masteryOf('lea')).toEqual([expect.objectContaining({ outcomeId: 'd01-r1', level: 3, origin: 'enseignant' })]);
    await t.setProductionState(t.productions()[0].id, 'corrigee');
    expect(writes).toEqual([
      ['lea', 'mastery', t.masteryOf('lea')],
      ['lea', PRODUCTION_STATE_KEY, { [open.id]: 'corrigee' }],
    ]);
  });
});
