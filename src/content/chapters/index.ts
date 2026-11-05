import type { Chapter } from '../../domain/chapter';
import { D01 } from './d01';
import { D02 } from './d02';
import { D03 } from './d03';
import { D04 } from './d04';
import { D05 } from './d05';
import { D06 } from './d06';
import { D07 } from './d07';
import { D08 } from './d08';
import { S1 } from './s1';
import { D09 } from './d09';
import { D10 } from './d10';
import { D11 } from './d11';
import { D12 } from './d12';
import { D13 } from './d13';

/** Chapitres développés, indexés par identifiant d'unité. Ajouter ici chaque nouveau dossier. */
export const CHAPTERS: Record<string, Chapter> = {
  d01: D01,
  d02: D02,
  d03: D03,
  d04: D04,
  d05: D05,
  d06: D06,
  d07: D07,
  d08: D08,
  s1: S1,
  d09: D09,
  d10: D10,
  d11: D11,
  d12: D12,
  d13: D13,
};

export function getChapter(unitId: string): Chapter | undefined {
  return CHAPTERS[unitId];
}
