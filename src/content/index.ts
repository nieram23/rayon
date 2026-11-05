import type { ExpectedOutcome, LearningUnit, MetaCompetenceId, PartId } from '../domain/types';
import { META_COMPETENCES, PARTS } from './programme';
import { UNITS } from './units';

export { PARTS, META_COMPETENCES, UNITS };
export { MASTERY_LEVELS, SOURCE_NOTICE } from './programme';

const unitById = new Map(UNITS.map((u) => [u.id, u]));

export function getUnit(id: string): LearningUnit | undefined {
  return unitById.get(id);
}

export function getPart(id: PartId) {
  return PARTS.find((p) => p.id === id)!;
}

export function getMeta(id: MetaCompetenceId) {
  return META_COMPETENCES.find((m) => m.id === id)!;
}

export function unitsOfPart(partId: PartId): LearningUnit[] {
  return UNITS.filter((u) => u.partId === partId);
}

/** Libellé court : « Dossier 5 », « Scénario 1 ». */
export function unitLabel(u: LearningUnit): string {
  return u.kind === 'dossier' ? `Dossier ${u.number}` : `Scénario ${u.number}`;
}

/** Code compact pour badges : « D05 », « S1 ». */
export function unitCode(u: LearningUnit): string {
  return u.kind === 'dossier' ? `D${String(u.number).padStart(2, '0')}` : `S${u.number}`;
}

/** Parties couvertes : un scénario peut porter sur plusieurs parties (via ses méta-compétences). */
export function partsCovered(u: LearningUnit): PartId[] {
  if (u.kind === 'dossier') return [u.partId];
  return u.metaCompetenceIds.map((m) => (`p${m.slice(2)}` as PartId));
}

export interface OutcomeRef {
  outcome: ExpectedOutcome;
  unit: LearningUnit;
}

/** Tous les résultats attendus (grille du manuel), avec leur dossier. */
export const ALL_OUTCOMES: OutcomeRef[] = UNITS.flatMap((unit) => unit.outcomes.map((outcome) => ({ outcome, unit })));

export function outcomesOfMeta(mc: MetaCompetenceId): OutcomeRef[] {
  return ALL_OUTCOMES.filter((r) => r.outcome.metaCompetenceIds.includes(mc));
}

export function unitsOfMeta(mc: MetaCompetenceId): LearningUnit[] {
  return UNITS.filter((u) => u.metaCompetenceIds.includes(mc));
}

/** Scénarios qui remobilisent un dossier donné. */
export function scenariosUsing(unitId: string): LearningUnit[] {
  return UNITS.filter((u) => u.mobilisesUnitIds?.includes(unitId));
}

export function neighbours(u: LearningUnit) {
  const i = UNITS.findIndex((x) => x.id === u.id);
  return { prev: UNITS[i - 1], next: UNITS[i + 1] };
}
