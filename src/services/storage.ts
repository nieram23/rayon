/**
 * Accès sécurisé au stockage local du navigateur.
 * Le stockage peut être indisponible (navigation privée, iframe, quota) :
 * chaque accès est protégé et l'application continue de fonctionner en mémoire.
 */

const PREFIX = 'rayon.v1.';
const memory = new Map<string, string>();

function ls(): Storage | null {
  try {
    const s = window.localStorage;
    const k = PREFIX + '__test';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
}

export function isPersistent(): boolean {
  return ls() !== null;
}

export function readJSON<T>(key: string, fallback: T): T {
  const full = PREFIX + key;
  try {
    const raw = ls()?.getItem(full) ?? memory.get(full) ?? null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Écouteur appelé à chaque écriture ou suppression (synchronisation vers le serveur). */
type WriteListener = (key: string, value: unknown | undefined) => void;
let listener: WriteListener | null = null;
export function setWriteListener(fn: WriteListener | null) {
  listener = fn;
}

export function writeJSON(key: string, value: unknown): void {
  writeRaw(key, value);
  listener?.(key, value);
}

/** Écriture locale sans déclencher la synchronisation (données reçues du serveur). */
export function writeRaw(key: string, value: unknown): void {
  const full = PREFIX + key;
  const raw = JSON.stringify(value);
  memory.set(full, raw);
  try {
    ls()?.setItem(full, raw);
  } catch {
    /* stockage plein ou bloqué : la valeur reste en mémoire pour la session */
  }
}

export function removeKey(key: string): void {
  removeRaw(key);
  listener?.(key, undefined);
}

export function removeRaw(key: string): void {
  const full = PREFIX + key;
  memory.delete(full);
  try {
    ls()?.removeItem(full);
  } catch {
    /* ignoré */
  }
}

export const KEYS = {
  profile: 'profile',
  mode: 'mode',
  progress: 'progress',
  mastery: 'mastery',
  teacherOverrides: 'demo.teacherOverrides',
} as const;

/** Toutes les clés Rayon présentes dans ce navigateur (sans le préfixe). */
export function listKeys(): string[] {
  const out = new Set<string>();
  for (const k of memory.keys()) if (k.startsWith(PREFIX)) out.add(k.slice(PREFIX.length));
  const s = ls();
  if (s) for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k?.startsWith(PREFIX)) out.add(k.slice(PREFIX.length));
  }
  return [...out].filter((k) => !k.startsWith('__'));
}

/** Efface les données de travail de ce navigateur (poste partagé : à chaque connexion et déconnexion). */
export function clearWorkData(): void {
  for (const k of listKeys()) if (k !== KEYS.mode) removeRaw(k);
}
