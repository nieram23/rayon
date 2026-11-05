/** Règles communes aux identifiants élèves. Doit rester identique à api/admin.ts. */
export const EMAIL_DOMAIN = 'rayon-mcv.example.com';
export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,39}$/;

/** Supabase identifie les comptes par une adresse : on en fabrique une à partir de l'identifiant (aucun courriel n'est envoyé). */
export const toEmail = (username: string) => `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;

const strip = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** « Léa », « Martin-Dupré » → « l.martin-dupre » (initiale du prénom, point, nom). */
export function suggestUsername(firstName: string, lastName: string): string {
  const f = strip(firstName);
  const l = strip(lastName);
  if (!l) return f.slice(0, 40);
  return (f ? `${f[0]}.${l}` : l).slice(0, 40);
}

/** Rend un identifiant unique en ajoutant 2, 3… si besoin. */
export function uniqueUsername(base: string, taken: Set<string>): string {
  let name = base.length >= 3 ? base : (base + 'eleve').slice(0, 40);
  if (!taken.has(name)) return name;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${name.slice(0, 37)}${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return name + Date.now();
}

/** Lettres et chiffres sans confusion possible à la recopie (pas de l, i, o, 0, 1). */
const PW_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
const PW_DIGITS = '23456789';
const PW_LETTERS = 'abcdefghjkmnpqrstuvwxyz';

/** Mot de passe de 6 caractères, au moins une lettre et un chiffre : « k7m4tp ». */
export function generatePassword(rand: () => number = secureRandom): string {
  const pick = (set: string) => set[Math.floor(rand() * set.length)];
  const chars = Array.from({ length: 6 }, () => pick(PW_CHARS));
  if (!chars.some((c) => PW_DIGITS.includes(c))) chars[Math.floor(rand() * 6)] = pick(PW_DIGITS);
  if (!chars.some((c) => PW_LETTERS.includes(c))) {
    const i = chars.findIndex((c) => PW_DIGITS.includes(c));
    chars[(i + 1 + Math.floor(rand() * 5)) % 6] = pick(PW_LETTERS);
  }
  return chars.join('');
}

function secureRandom(): number {
  try {
    const a = new Uint32Array(1);
    globalThis.crypto.getRandomValues(a);
    return a[0] / 2 ** 32;
  } catch {
    return Math.random();
  }
}

/** Découpe une ligne « Prénom Nom » (le premier mot est le prénom). Accepte aussi « Nom;Prénom ». */
export function parseStudentLine(line: string): { firstName: string; lastName: string } | null {
  const t = line.trim();
  if (!t) return null;
  if (t.includes(';') || t.includes('\t') || t.includes(',')) {
    const [a, b] = t.split(/[;\t,]/).map((x) => x.trim());
    return { lastName: a ?? '', firstName: b ?? '' };
  }
  const parts = t.split(/\s+/);
  // Format des exports de vie scolaire : « MARTIN Léa » (nom en majuscules en premier).
  const isUpper = (w: string) => /[A-ZÀ-Þ]/.test(w) && w === w.toUpperCase() && w.length > 1;
  if (parts.length > 1 && isUpper(parts[0]) && !parts.every(isUpper)) {
    const upper = parts.filter(isUpper);
    const rest = parts.filter((w) => !isUpper(w));
    return { lastName: upper.join(' '), firstName: rest.join(' ') };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}
