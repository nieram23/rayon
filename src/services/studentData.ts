import type { Availability, DataMode, LearningUnit, MasteryAssessment, UnitProgress } from '../domain/types';
import { CHAPTERS } from '../content/chapters';
import { chapterProgress } from './chapterStore';
import { KEYS, readJSON } from './storage';

/**
 * Source des données de suivi d'un élève.
 * Jalon 1 : deux implémentations (locale réelle, démonstration simulée).
 * Jalon futur : une implémentation « ApiStudentData » branchée sur une base de données
 * authentifiée, sans modifier les pages qui consomment cette interface.
 */
export interface StudentDataSource {
  readonly mode: DataMode;
  getProgress(): UnitProgress[];
  getMastery(): MasteryAssessment[];
  /** Disponibilité affichée. En démonstration, certains dossiers sont SIMULÉS comme ouverts. */
  availabilityOf(unit: LearningUnit): Availability;
}

/** Données réelles de l'élève, enregistrées uniquement dans ce navigateur. */
export class LocalStudentData implements StudentDataSource {
  readonly mode = 'local' as const;
  /** Progression calculée à partir des réponses réellement saisies dans les chapitres. */
  getProgress(): UnitProgress[] {
    return Object.values(CHAPTERS)
      .map(chapterProgress)
      .filter((p): p is UnitProgress => !!p);
  }
  getMastery(): MasteryAssessment[] {
    return readJSON<MasteryAssessment[]>(KEYS.mastery, []);
  }
  availabilityOf(unit: LearningUnit): Availability {
    return unit.availability;
  }
}

/** Unités simulées comme « ouvertes » en démonstration (aucune mission réelle n'existe). */
export const DEMO_OPEN_UNITS = ['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 'd08', 's1', 'd09', 'd10', 'd11', 'd12', 'd13'];

const DEMO_PROGRESS: UnitProgress[] = [
  {
    unitId: 'd01',
    activitiesDone: 6,
    activitiesTotal: 6,
    successRate: 74,
    lastVisitedAt: '2026-10-21T10:12:00Z',
  },
  {
    unitId: 'd02',
    activitiesDone: 3,
    activitiesTotal: 7,
    successRate: 58,
    lastMissionId: 'demo-d02-m3',
    lastMissionTitle: 'Mission 3 (démonstration)',
    lastVisitedAt: '2026-11-03T16:40:00Z',
  },
  {
    unitId: 'd03',
    activitiesDone: 1,
    activitiesTotal: 5,
    successRate: null,
    lastVisitedAt: '2026-10-28T09:05:00Z',
  },
];

const DEMO_MASTERY: MasteryAssessment[] = [
  { outcomeId: 'd01-r1', unitId: 'd01', level: 3, origin: 'enseignant', assessedAt: '2026-10-22T08:00:00Z' },
  { outcomeId: 'd02-r1', unitId: 'd02', level: 2, origin: 'indicatif', assessedAt: '2026-11-03T16:41:00Z' },
  { outcomeId: 'd02-r2', unitId: 'd02', level: 1, origin: 'enseignant', assessedAt: '2026-11-04T08:00:00Z' },
];

export class DemoStudentData implements StudentDataSource {
  readonly mode = 'demo' as const;
  getProgress() {
    return DEMO_PROGRESS;
  }
  getMastery() {
    return DEMO_MASTERY;
  }
  availabilityOf(unit: LearningUnit): Availability {
    return DEMO_OPEN_UNITS.includes(unit.id) ? 'disponible' : unit.availability;
  }
}

export function createStudentData(mode: DataMode): StudentDataSource {
  return mode === 'demo' ? new DemoStudentData() : new LocalStudentData();
}
