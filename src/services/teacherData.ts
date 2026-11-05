import { ALL_OUTCOMES, UNITS } from '../content';
import type { MasteryAssessment, MasteryLevel, MasteryValue, UnitProgress } from '../domain/types';
import { KEYS, readJSON, removeKey, writeJSON } from './storage';
import { DEMO_OPEN_UNITS } from './studentData';
import { CHAPTERS } from '../content/chapters';

/**
 * Espace enseignant — JEU DE DONNÉES DE DÉMONSTRATION.
 * Aucune donnée scolaire réelle. Les élèves, classes, productions et difficultés
 * ci-dessous sont générés de façon déterministe et affichés avec la mention « Démonstration ».
 *
 * Jalon futur : remplacer DemoTeacherData par une source authentifiée
 * (rôle enseignant, classes rattachées, consentements), en conservant l'interface.
 */

export interface ClassGroup {
  id: string;
  label: string;
  level: string;
  studentIds: string[];
}

export interface DemoStudent {
  id: string;
  pseudo: string;
  classId: string;
}

export type ProductionState = 'a-corriger' | 'corrigee';

export interface DemoProduction {
  id: string;
  studentId: string;
  unitId: string;
  label: string;
  kind: string;
  submittedAt: string;
  state: ProductionState;
}

export interface DemoDifficulty {
  studentId: string;
  unitId: string;
  label: string;
}

export interface TeacherDataSource {
  listClasses(): ClassGroup[];
  listStudents(classId?: string): DemoStudent[];
  getStudent(id: string): DemoStudent | undefined;
  progressOf(studentId: string): UnitProgress[];
  masteryOf(studentId: string): MasteryAssessment[];
  /** Validation manuelle par l'enseignant (null = remettre « Non évalué »). */
  setTeacherLevel(studentId: string, outcomeId: string, level: MasteryValue): void;
  productions(): DemoProduction[];
  difficulties(): DemoDifficulty[];
  resetOverrides(): void;
}

/* Générateur pseudo-aléatoire déterministe : la démo est identique à chaque visite. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PSEUDOS_A = ['Inès', 'Noah', 'Lina', 'Enzo', 'Maëlys', 'Yanis', 'Chloé', 'Rayan', 'Jade', 'Lucas', 'Sarah', 'Théo'];
const PSEUDOS_B = ['Manon', 'Adam', 'Léa', 'Hugo', 'Camille', 'Nolan', 'Zoé', 'Bilal', 'Emma', 'Tom'];
const INITIALS = 'BDFGLMPRSTV';

// Nombre réel d’activités par chapitre, calculé à partir du contenu.
const ACTIVITIES_TOTAL: Record<string, number> = Object.fromEntries(
  Object.entries(CHAPTERS).map(([id, ch]) => [id, ch.steps.reduce((n, st) => n + (st.activities?.length ?? 0), 0)]),
);
const PRODUCTION_KINDS: Record<string, string[]> = {
  d01: ['Bon de commande', 'Comparatif fournisseurs', 'Préparation de commande web'],
  d02: ['Fiche de réserves', 'Courriel de réclamation', 'Contrôle des dates'],
  d03: ['État des stocks annoté', 'Calcul d’indicateurs'],
  d08: ['Calcul des indices de sensibilité', 'Contrôle d’implantation du rayon'],
  d07: ['Courriels de réponse aux clients', 'Traitement des demandes de retour'],
  d06: ['Tableau d’inventaire valorisé', 'Compte rendu sur la démarque'],
  d05: ['Tableau d’analyse des marges', 'Calcul du prix psychologique'],
  d04: ['Contrôle de sécurité du local', 'Affiche « Les 5 M de l’hygiène »'],
};
const DIFFICULTY_LABELS = [
  'Aide détaillée (niveau 3) consultée à plusieurs reprises',
  'Plusieurs tentatives sur une même vérification',
  'Activité interrompue sans reprise depuis plus d’une semaine',
  'Production ouverte rendue incomplète',
];

type Overrides = Record<string, Record<string, MasteryValue>>;

class DemoTeacherData implements TeacherDataSource {
  private classes: ClassGroup[];
  private students: DemoStudent[];
  private progress = new Map<string, UnitProgress[]>();
  private baseMastery = new Map<string, MasteryAssessment[]>();
  private prods: DemoProduction[] = [];
  private diffs: DemoDifficulty[] = [];

  constructor() {
    const rnd = mulberry32(2026);
    const mk = (names: string[], classId: string, offset: number) =>
      names.map((n, i) => ({
        id: `${classId}-e${String(i + 1).padStart(2, '0')}`,
        pseudo: `${n} ${INITIALS[(i + offset) % INITIALS.length]}.`,
        classId,
      }));
    const a = mk(PSEUDOS_A, 'demo-1mcv', 0);
    const b = mk(PSEUDOS_B, 'demo-tmcv', 3);
    this.students = [...a, ...b];
    this.classes = [
      { id: 'demo-1mcv', label: '1re MCV A', level: 'Première', studentIds: a.map((s) => s.id) },
      { id: 'demo-tmcv', label: 'Tle MCV A', level: 'Terminale', studentIds: b.map((s) => s.id) },
    ];

    let prodN = 0;
    for (const s of this.students) {
      const prog: UnitProgress[] = [];
      const mastery: MasteryAssessment[] = [];
      DEMO_OPEN_UNITS.forEach((unitId, idx) => {
        const total = ACTIVITIES_TOTAL[unitId];
        // Les unités suivantes sont moins avancées que les premières.
        const reach = rnd() - idx * 0.3;
        const done = reach <= 0 ? 0 : Math.min(total, Math.round(reach * total * 1.4));
        if (done === 0) return;
        const day = 10 + Math.floor(rnd() * 24);
        prog.push({
          unitId,
          activitiesDone: done,
          activitiesTotal: total,
          successRate: done >= 2 ? Math.round(40 + rnd() * 55) : null,
          lastVisitedAt: `2026-${day > 31 ? '11' : '10'}-${String(day > 31 ? day - 31 : day).padStart(2, '0')}T14:00:00Z`,
        });
        const unit = UNITS.find((u) => u.id === unitId)!;
        if (done >= total * 0.6) {
          for (const o of unit.outcomes) {
            const r = rnd();
            const level = (r < 0.12 ? 1 : r < 0.4 ? 2 : r < 0.82 ? 3 : 4) as MasteryLevel;
            mastery.push({
              outcomeId: o.id,
              unitId,
              level,
              origin: done === total && rnd() > 0.35 ? 'enseignant' : 'indicatif',
              assessedAt: '2026-10-30T08:00:00Z',
            });
          }
        }
        for (const label of PRODUCTION_KINDS[unitId].slice(0, Math.min(done, PRODUCTION_KINDS[unitId].length))) {
          if (rnd() < 0.55) continue;
          prodN++;
          this.prods.push({
            id: `demo-prod-${prodN}`,
            studentId: s.id,
            unitId,
            label: `${label} (production de démonstration)`,
            kind: label,
            submittedAt: `2026-11-0${1 + Math.floor(rnd() * 3)}T1${Math.floor(rnd() * 8)}:00:00Z`,
            state: rnd() < 0.6 ? 'a-corriger' : 'corrigee',
          });
        }
        if (rnd() < 0.22) {
          this.diffs.push({ studentId: s.id, unitId, label: DIFFICULTY_LABELS[Math.floor(rnd() * DIFFICULTY_LABELS.length)] });
        }
      });
      this.progress.set(s.id, prog);
      this.baseMastery.set(s.id, mastery);
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
  masteryOf(studentId: string): MasteryAssessment[] {
    const base = this.baseMastery.get(studentId) ?? [];
    const ov = readJSON<Overrides>(KEYS.teacherOverrides, {})[studentId] ?? {};
    const touched = new Set(Object.keys(ov));
    // Un niveau saisi par l'enseignant remplace toute évaluation antérieure de ce résultat.
    const kept = base.filter((a) => !touched.has(a.outcomeId));
    const manual: MasteryAssessment[] = Object.entries(ov)
      .filter(([, level]) => level !== null)
      .map(([outcomeId, level]) => ({
        outcomeId,
        unitId: ALL_OUTCOMES.find((r) => r.outcome.id === outcomeId)?.unit.id ?? '',
        level: level as MasteryLevel,
        origin: 'enseignant',
        assessedAt: new Date().toISOString(),
      }));
    return [...kept, ...manual];
  }
  setTeacherLevel(studentId: string, outcomeId: string, level: MasteryValue) {
    const all = readJSON<Overrides>(KEYS.teacherOverrides, {});
    all[studentId] = { ...(all[studentId] ?? {}), [outcomeId]: level };
    writeJSON(KEYS.teacherOverrides, all);
  }
  productions() {
    return this.prods;
  }
  difficulties() {
    return this.diffs;
  }
  resetOverrides() {
    removeKey(KEYS.teacherOverrides);
  }
}

export const teacherData: TeacherDataSource = new DemoTeacherData();
