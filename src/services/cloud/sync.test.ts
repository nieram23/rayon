import { beforeEach, describe, expect, it } from 'vitest';
import { generatePassword, parseStudentLine, suggestUsername, uniqueUsername, USERNAME_RE } from '../../lib/accounts';
import { readJSON, writeJSON, removeKey, clearWorkData, listKeys, writeRaw } from '../storage';
import { SyncEngine, isSynced } from './sync';
import type { CloudBackend, DataRow } from './types';

// Stockage du navigateur simulé pour la file d'attente hors ligne.
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() {
    return mem.size;
  },
} as Storage;

/** Serveur factice en mémoire. */
function fakeBackend() {
  const rows = new Map<string, unknown>();
  const state = { offline: false, upserts: 0 };
  const b = {
    kind: 'mock',
    state,
    rows,
    async pull(userId: string): Promise<DataRow[]> {
      return [...rows].map(([key, value]) => ({ userId, key, value, updatedAt: '' }));
    },
    async upsert(_u: string, list: Array<{ key: string; value: unknown }>) {
      if (state.offline) throw new Error('Failed to fetch');
      state.upserts++;
      for (const r of list) rows.set(r.key, r.value);
    },
    async remove(_u: string, keys: string[]) {
      if (state.offline) throw new Error('Failed to fetch');
      keys.forEach((k) => rows.delete(k));
    },
  };
  return b as unknown as CloudBackend & typeof b;
}

describe('identifiants', () => {
  it('propose initiale.nom sans accents', () => {
    expect(suggestUsername('Léa', 'Martin-Dupré')).toBe('l.martin-dupre');
    expect(suggestUsername('Élodie', 'Le Gall')).toBe('e.le-gall');
    expect(USERNAME_RE.test('l.martin-dupre')).toBe(true);
    expect(USERNAME_RE.test('m.bournicon')).toBe(true);
  });
  it('évite les doublons', () => {
    expect(uniqueUsername('lea.martin', new Set(['lea.martin', 'lea.martin2']))).toBe('lea.martin3');
    expect(uniqueUsername('al', new Set())).toMatch(/^al/);
    expect(uniqueUsername('al', new Set()).length).toBeGreaterThanOrEqual(3);
  });
  it('reconnaît les formats de liste', () => {
    expect(parseStudentLine('Léa Martin')).toEqual({ firstName: 'Léa', lastName: 'Martin' });
    expect(parseStudentLine('DUPONT Inès')).toEqual({ firstName: 'Inès', lastName: 'DUPONT' });
    expect(parseStudentLine('LE GALL Anne Sophie')).toEqual({ firstName: 'Anne Sophie', lastName: 'LE GALL' });
    expect(parseStudentLine('Petit;Noah')).toEqual({ firstName: 'Noah', lastName: 'Petit' });
    expect(parseStudentLine('   ')).toBeNull();
  });
  it('génère des mots de passe de 6 caractères faciles à recopier', () => {
    for (let i = 0; i < 300; i++) {
      const p = generatePassword();
      expect(p).toMatch(/^[a-hjkmnp-z2-9]{6}$/);
      expect(p).toMatch(/\d/);
      expect(p).toMatch(/[a-z]/);
    }
  });
});

describe('synchronisation', () => {
  beforeEach(() => clearWorkData());

  it('ne synchronise ni le profil ni les préférences', () => {
    expect(isSynced('profile')).toBe(false);
    expect(isSynced('mode')).toBe(false);
    expect(isSynced('answers.d01')).toBe(true);
    expect(isSynced('mastery')).toBe(true);
  });

  it('charge les données du serveur à la connexion et remplace celles du poste', async () => {
    writeRaw('answers.d02', { answers: { old: 1 } });
    const b = fakeBackend();
    b.rows.set('answers.d01', { answers: { a: 1 }, lastVisitedAt: 'x' });
    const e = new SyncEngine(b, 'u1');
    await e.start();
    expect(readJSON('answers.d01', null)).toEqual({ answers: { a: 1 }, lastVisitedAt: 'x' });
    expect(readJSON('answers.d02', null)).toBeNull();
    await e.stop();
  });

  it('envoie chaque écriture au serveur', async () => {
    const b = fakeBackend();
    const e = new SyncEngine(b, 'u1');
    await e.start();
    writeJSON('answers.d03', { answers: { q: 2 } });
    writeJSON('profile', { pseudo: 'x' });
    expect(e.hasPending()).toBe(true);
    await e.flush();
    expect(b.rows.get('answers.d03')).toEqual({ answers: { q: 2 } });
    expect(b.rows.has('profile')).toBe(false);
    expect(e.status).toBe('saved');
    removeKey('answers.d03');
    await e.flush();
    expect(b.rows.has('answers.d03')).toBe(false);
    await e.stop();
  });

  it('garde les réponses hors ligne et les renvoie ensuite', async () => {
    const b = fakeBackend();
    const e = new SyncEngine(b, 'u1');
    await e.start();
    b.state.offline = true;
    writeJSON('answers.d04', { answers: { z: 1 } });
    await e.flush();
    expect(e.status).toBe('error');
    expect(await e.stop()).toBe(false);
    // Nouvelle séance sur le même poste, réseau revenu : la réponse est renvoyée.
    b.state.offline = false;
    clearWorkData();
    const e2 = new SyncEngine(b, 'u1');
    await e2.start();
    await e2.flush();
    expect(b.rows.get('answers.d04')).toEqual({ answers: { z: 1 } });
    expect(readJSON('answers.d04', null)).toEqual({ answers: { z: 1 } });
    await e2.stop();
  });

  it('efface les données de travail du poste à la déconnexion', () => {
    writeRaw('answers.d01', { a: 1 });
    writeRaw('mode', 'local');
    clearWorkData();
    expect(listKeys()).toEqual(['mode']);
  });
});
