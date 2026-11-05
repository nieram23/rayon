/**
 * Espace enseignant — DONNÉES RÉELLES.
 * Construites à partir des comptes élèves et de leurs réponses enregistrées sur le serveur.
 * Les niveaux validés par l'enseignant et le statut des productions sont enregistrés
 * dans les données de l'élève (l'élève voit ainsi les niveaux validés dans son espace).
 */
import { ALL_OUTCOMES } from '../content';
import { CHAPTERS } from '../content/chapters';
import type { ActivityAnswer } from '../domain/chapter';
import { allActivities } from '../domain/check';
import type { MasteryAssessment, MasteryLevel, MasteryValue, UnitProgress } from '../domain/types';
import type { Account, CloudBackend, DataRow } from './cloud';
import { progressFromRecord, type ChapterRecord } from './chapterStore';
import { KEYS } from './storage';
import type { ClassGroup, DemoDifficulty, DemoProduction, DemoStudent, ProductionState, TeacherDataSource } from './teacherData';

/** Clé (dans les données de l'élève) du statut de correction de ses productions. */
export const PRODUCTION_STATE_KEY = 'teacher.productions';

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'sans-classe';

function levelOfClass(label: string): string {
  const l = label.toLowerCase();
  if (/(^|\s)(1re|1ère|1ere|premi|1\s?mcv|1mcv)/.test(l) || /^1/.test(l)) return 'Première';
  if (/(tle|term|^t\s?mcv)/.test(l)) return 'Terminale';
  if (/(2nde|2de|second|^2)/.test(l)) return 'Seconde';
  return '';
}

const DAY = 86_400_000;

export class RealTeacherData implements TeacherDataSource {
  readonly real = true;
  private classes: ClassGroup[];
  private students: DemoStudent[];
  private progress = new Map<string, UnitProgress[]>();
  private mastery = new Map<string, MasteryAssessment[]>();
  private prodStates = new Map<string, Record<string, ProductionState>>();
  private prods: DemoProduction[] = [];
  private diffs: DemoDifficulty[] = [];

  constructor(
    accounts: Account[],
    rows: DataRow[],
    private backend: CloudBackend | null,
    now = Date.now(),
  ) {
    const pupils = accounts.filter((a) => a.role === 'student');
    const byClass = new Map<string, ClassGroup>();
    this.students = pupils.map((a) => {
      const label = a.classLabel.trim() || 'Sans classe';
      const id = slug(label);
      if (!byClass.has(id)) byClass.set(id, { id, label, level: levelOfClass(label), studentIds: [] });
      byClass.get(id)!.studentIds.push(a.id);
      return { id: a.id, pseudo: a.displayName, classId: id };
    });
    this.classes = [...byClass.values()].sort((x, y) => x.label.localeCompare(y.label, 'fr'));

    const byUser = new Map<string, Map<string, unknown>>();
    for (const r of rows) {
      if (!byUser.has(r.userId)) byUser.set(r.userId, new Map());
      byUser.get(r.userId)!.set(r.key, r.value);
    }

    for (const s of this.students) {
      const data = byUser.get(s.id) ?? new Map<string, unknown>();
      const prog: UnitProgress[] = [];
      const states = (data.get(PRODUCTION_STATE_KEY) as Record<string, ProductionState> | undefined) ?? {};
      this.prodStates.set(s.id, { ...states });
      this.mastery.set(s.id, Array.isArray(data.get(KEYS.mastery)) ? [...(data.get(KEYS.mastery) as MasteryAssessment[])] : []);

      for (const [unitId, ch] of Object.entries(CHAPTERS)) {
        const rec = data.get(`answers.${unitId}`) as Partial<ChapterRecord> | undefined;
        if (!rec) continue;
        const p = progressFromRecord(ch, rec);
        if (p) prog.push(p);
        const answers = (rec.answers ?? {}) as Record<string, ActivityAnswer>;
        let hardest: string | null = null;
        for (const a of allActivities(ch)) {
          const ans = answers[a.id];
          if (!ans) continue;
          if (a.kind === 'open' && ans.submitted) {
            const id = `${s.id}:${a.id}`;
            this.prods.push({
              id,
              studentId: s.id,
              unitId,
              label: a.title,
              kind: `${a.label} · ${a.title}`,
              submittedAt: ans.updatedAt,
              state: states[a.id] ?? 'a-corriger',
            });
          }
          if (!hardest) {
            if ((ans.helpsUsed ?? 0) >= 3) hardest = `Aide détaillée consultée : ${a.label} « ${a.title} »`;
            else if ((ans.attempts ?? 0) >= 3 && ans.total && (ans.correct ?? 0) < ans.total)
              hardest = `${ans.attempts} tentatives sans réussite complète : ${a.label} « ${a.title} »`;
          }
        }
        if (hardest) this.diffs.push({ studentId: s.id, unitId, label: hardest });
        else if (p && p.activitiesDone < p.activitiesTotal && p.lastVisitedAt && now - Date.parse(p.lastVisitedAt) > 10 * DAY)
          this.diffs.push({ studentId: s.id, unitId, label: 'Dossier commencé puis interrompu depuis plus de 10 jours' });
      }
      this.progress.set(s.id, prog);
    }
  }

  listClasses() {
    return this.classes;
  }
  listStudents(classId?: string) {
    return classId ? this.students.filter((s) => s.classId === classId) : this.students;
  }
  getStudent(id: string) {
    return this.students.find((s) => s.id === id);
  }
  progressOf(studentId: string) {
    return this.progress.get(studentId) ?? [];
  }
  masteryOf(studentId: string) {
    return this.mastery.get(studentId) ?? [];
  }
  setTeacherLevel(studentId: string, outcomeId: string, level: MasteryValue) {
    const list = (this.mastery.get(studentId) ?? []).filter((a) => a.outcomeId !== outcomeId);
    if (level !== null)
      list.push({
        outcomeId,
        unitId: ALL_OUTCOMES.find((r) => r.outcome.id === outcomeId)?.unit.id ?? '',
        level: level as MasteryLevel,
        origin: 'enseignant',
        assessedAt: new Date().toISOString(),
      });
    this.mastery.set(studentId, list);
    return this.save(studentId, KEYS.mastery, list);
  }
  setProductionState(productionId: string, state: ProductionState) {
    const p = this.prods.find((x) => x.id === productionId);
    if (!p) return Promise.resolve();
    p.state = state;
    const activityId = productionId.slice(p.studentId.length + 1);
    const map = { ...(this.prodStates.get(p.studentId) ?? {}), [activityId]: state };
    this.prodStates.set(p.studentId, map);
    return this.save(p.studentId, PRODUCTION_STATE_KEY, map);
  }
  productions() {
    return this.prods;
  }
  difficulties() {
    return this.diffs;
  }
  resetOverrides() {
    /* Données réelles : rien à réinitialiser globalement. */
  }

  private async save(studentId: string, key: string, value: unknown) {
    if (!this.backend) return;
    await this.backend.upsert(studentId, [{ key, value }]);
  }
}
