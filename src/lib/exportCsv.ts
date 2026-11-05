import { ALL_OUTCOMES, UNITS, unitCode } from '../content';
import { levelOf, masteryFor, progressRatio } from '../domain/progress';
import type { TeacherStudent } from '../state/useTeacher';

function cell(v: string | number): string {
  const s = String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Export CSV (séparateur « ; », compatible Excel / LibreOffice en français).
 * Une ligne par élève : progression par unité, puis niveau par résultat attendu.
 */
export function buildResultsCsv(students: TeacherStudent[]): string {
  const header = [
    'Élève',
    'Classe',
    'Progression totale (%)',
    ...UNITS.map((u) => `${unitCode(u)} progression (%)`),
    ...ALL_OUTCOMES.map((r) => `${r.outcome.id} niveau`),
    ...ALL_OUTCOMES.map((r) => `${r.outcome.id} origine`),
  ];
  const rows = students.map((s) => {
    const byId = new Map(s.progress.map((p) => [p.unitId, p]));
    return [
      s.pseudo,
      s.className,
      Math.round(s.summary.overall * 100),
      ...UNITS.map((u) => Math.round(progressRatio(byId.get(u.id)) * 100)),
      ...ALL_OUTCOMES.map((r) => levelOf(r.outcome.id, s.mastery) ?? 'NE'),
      ...ALL_OUTCOMES.map((r) => masteryFor(r.outcome.id, s.mastery)?.origin ?? ''),
    ];
  });
  const legend = ['# DÉMONSTRATION — données fictives. Niveaux : NE = non évalué, 1 à 4 = grille de maîtrise.'];
  return '﻿' + [legend, header, ...rows].map((r) => r.map(cell).join(';')).join('\n');
}

export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Dans l'aperçu hébergé, les téléchargements sont bloqués : on copie le CSV à la place. */
export const DOWNLOAD_BLOCKED = import.meta.env.VITE_ARTIFACT === '1';

export async function exportResults(filename: string, content: string): Promise<string> {
  if (!DOWNLOAD_BLOCKED) {
    downloadText(filename, content);
    return 'Fichier CSV téléchargé.';
  }
  try {
    await navigator.clipboard.writeText(content);
    return 'CSV copié dans le presse-papiers (le téléchargement est bloqué dans cet aperçu).';
  } catch {
    return 'Export impossible dans cet aperçu : lancez l’application en local pour télécharger le CSV.';
  }
}
