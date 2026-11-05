/**
 * Génération et téléchargement du cahier PDF, dans le navigateur.
 * Ce module et le générateur ne sont chargés qu'au premier clic (le site reste léger).
 */
import { pdf } from '@react-pdf/renderer';
import body400 from '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff?url';
import body700 from '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff?url';
import body400i from '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-italic.woff?url';
import body700i from '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-italic.woff?url';
import title500 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff?url';
import title700 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff?url';
import title800 from '@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff?url';
import math from '@fontsource/noto-sans-math/files/noto-sans-math-latin-400-normal.woff?url';
import { getChapter } from '../content/chapters';
import { getPart, getUnit } from '../content';
import { prepareAssets } from './assets';
import { ChapterPdf } from './ChapterPdf';
import { registerPdfFonts } from './fonts';

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

export async function buildChapterPdf(unitId: string, corrige: boolean): Promise<{ blob: Blob; filename: string }> {
  const unit = getUnit(unitId);
  const chapter = getChapter(unitId);
  if (!unit || !chapter) throw new Error('Dossier introuvable.');
  registerPdfFonts({ body400, body700, body400i, body700i, title500, title700, title800, math });
  const assets = await prepareAssets(chapter);
  const generatedOn = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const blob = await pdf(
    <ChapterPdf unit={unit} chapter={chapter} assets={assets} opts={{ corrige, partTitle: getPart(unit.partId)?.shortTitle ?? '', generatedOn }} />,
  ).toBlob();
  const code = unit.kind === 'dossier' ? `Dossier-${String(unit.number).padStart(2, '0')}` : `Scenario-${unit.number}`;
  return { blob, filename: `Rayon-${code}-${slug(unit.title)}${corrige ? '-CORRIGE' : ''}.pdf` };
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
