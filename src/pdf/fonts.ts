import { Font } from '@react-pdf/renderer';
import { FONT_BODY, FONT_MATH, FONT_TITLE } from './theme';

export interface FontSources {
  body400: string;
  body700: string;
  body400i: string;
  body700i: string;
  title500: string;
  title700: string;
  title800: string;
  math: string;
}

let done = false;

/** Enregistre les polices du site pour le PDF (une seule fois). */
export function registerPdfFonts(src: FontSources) {
  if (done) return;
  done = true;
  Font.register({
    family: FONT_BODY,
    fonts: [
      { src: src.body400, fontWeight: 400 },
      { src: src.body700, fontWeight: 700 },
      { src: src.body400i, fontWeight: 400, fontStyle: 'italic' },
      { src: src.body700i, fontWeight: 700, fontStyle: 'italic' },
    ],
  });
  Font.register({
    family: FONT_TITLE,
    fonts: [
      { src: src.title500, fontWeight: 500 },
      { src: src.title700, fontWeight: 700 },
      { src: src.title800, fontWeight: 800 },
    ],
  });
  Font.register({ family: FONT_MATH, src: src.math });
  // Pas de césure automatique (règles anglaises par défaut) : les mots restent entiers.
  Font.registerHyphenationCallback((word) => [word]);
}
