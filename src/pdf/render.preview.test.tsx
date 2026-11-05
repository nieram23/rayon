import { test } from 'vitest';
import { renderToFile } from '@react-pdf/renderer';
import { CHAPTERS } from '../content/chapters';
import { getPart, getUnit } from '../content';
import { ChapterPdf } from './ChapterPdf';

import './render.fonts';

const ONLY = process.env.PDF_ONLY?.split(',');
test('rendu de tous les cahiers', async () => {
  for (const [id, ch] of Object.entries(CHAPTERS)) {
    if (ONLY && !ONLY.includes(id)) continue;
    const unit = getUnit(id)!;
    for (const corrige of [false, true]) {
      const t = Date.now();
      await renderToFile(
        <ChapterPdf unit={unit} chapter={ch} assets={{ images: {}, photos: {} }} opts={{ corrige, partTitle: getPart(unit.partId)!.shortTitle, generatedOn: '5 novembre 2026' }} />,
        `${process.env.PDF_OUT ?? '/tmp/pdf'}/${id}${corrige ? '-corrige' : ''}.pdf`,
      );
      console.log(id, corrige ? 'corrigé' : 'élève', Date.now() - t, 'ms');
    }
  }
}, 600000);
