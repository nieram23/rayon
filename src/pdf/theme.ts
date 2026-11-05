/** Couleurs et réglages typographiques de la version papier (alignés sur le site). */
export const C = {
  ink: '#16181d',
  ink2: '#3b3f48',
  ink3: '#6b7079',
  line: '#d9d3c5',
  lineSoft: '#ebe6da',
  paper: '#f5f2ea',
  card: '#fffdf8',
  tag: '#f2c14e',
  tagSoft: '#fcf1d3',
  answer: '#1d6fb8',
  answerSoft: '#e8f1fb',
  danger: '#c8372d',
  white: '#ffffff',
};

export const PART_COLORS: Record<string, { main: string; dark: string; soft: string }> = {
  p1: { main: '#1f8a70', dark: '#145c4b', soft: '#e2f1eb' },
  p2: { main: '#e0623a', dark: '#a5401f', soft: '#fbe7de' },
  p3: { main: '#3f63c9', dark: '#2a4594', soft: '#e5ebfa' },
};

export const ZONE_TONES: Record<string, string> = {
  rose: '#f7d6dc',
  bleu: '#d6ecf3',
  violet: '#e1dcf2',
  jaune: '#fbefc9',
  vert: '#e1efd2',
  orange: '#f8d9c6',
  gris: '#e6e4df',
};

/** Polices : texte (lisible), titres, secours pour les symboles mathématiques. */
export const FONT_BODY = 'Atkinson';
export const FONT_TITLE = 'Bricolage';
export const FONT_MATH = 'NotoMath';

/**
 * Remplace les caractères absents des polices par un équivalent lisible
 * (les symboles ≥ ≤ ≈ → sont rendus par la police de secours).
 */
export function clean(s: string): string {
  return s
    .replace(/ /g, ' ')
    .replace(/ᵉʳ/g, 'er')
    .replace(/ʳᵉ/g, 're')
    .replace(/ᵉ/g, 'e')
    .replace(/ʳ/g, 'r')
    .replace(/①/g, '(1)')
    .replace(/②/g, '(2)')
    .replace(/③/g, '(3)')
    .replace(/[✓✔]/g, 'oui')
    .replace(/☐/g, '');
}

const MATH = /[→←↑↓≥≤≈≠×÷±∑√∞]/;

/** Découpe un texte en segments « texte » et « symbole » pour appliquer la police de secours. */
export function splitMath(s: string): Array<{ t: string; math: boolean }> {
  const out: Array<{ t: string; math: boolean }> = [];
  let cur = '';
  let curMath = false;
  for (const ch of s) {
    const m = MATH.test(ch) && ch !== '×' && ch !== '÷' && ch !== '±';
    if (m !== curMath && cur) {
      out.push({ t: cur, math: curMath });
      cur = '';
    }
    curMath = m;
    cur += ch;
  }
  if (cur) out.push({ t: cur, math: curMath });
  return out;
}
