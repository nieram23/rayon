/**
 * Simulateur de serveur, utilisé uniquement pour les tests (VITE_CLOUD=mock).
 * Il imite Supabase dans le navigateur. Il n'est jamais inclus dans le site publié
 * lorsque Supabase est configuré.
 */
import { USERNAME_RE } from '../../lib/accounts';
import type { Account, CloudBackend, CreateResult, DataRow, NewStudent } from './types';

const DB_KEY = 'rayon-mock.db';
const SESSION_KEY = 'rayon-mock.session';
export const MOCK_ADMIN = { username: 'm.bournicon', password: 'test-admin' };

interface MockDb {
  users: Array<Account & { password: string }>;
  data: DataRow[];
}

function load(): MockDb {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    /* ignoré */
  }
  return { users: [], data: [] };
}
function save(db: MockDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
const delay = () => new Promise((r) => setTimeout(r, 60));
const uid = () => 'u-' + Math.random().toString(36).slice(2, 10);

export class MockBackend implements CloudBackend {
  readonly kind = 'mock' as const;
  private listeners = new Set<() => void>();

  private me(): string | null {
    return localStorage.getItem(SESSION_KEY);
  }
  private requireAdmin(db: MockDb) {
    const u = db.users.find((x) => x.id === this.me());
    if (u?.role !== 'admin') throw new Error('Accès réservé à l’administrateur connecté.');
    return u;
  }

  async currentUserId() {
    await delay();
    const id = this.me();
    return id && load().users.some((u) => u.id === id) ? id : null;
  }
  onSignedOut(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  async signIn(username: string, password: string) {
    await delay();
    const u = load().users.find((x) => x.username === username.trim().toLowerCase());
    if (!u || u.password !== password) return { ok: false as const, error: 'Identifiant ou mot de passe incorrect.' };
    localStorage.setItem(SESSION_KEY, u.id);
    return { ok: true as const };
  }
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    this.listeners.forEach((l) => l());
  }
  async myAccount() {
    const u = load().users.find((x) => x.id === this.me());
    if (!u) return null;
    const { password: _pw, ...acc } = u;
    void _pw;
    return acc;
  }
  async touchLastSeen() {
    const db = load();
    const u = db.users.find((x) => x.id === this.me());
    if (u) u.lastSeenAt = new Date().toISOString();
    save(db);
  }
  async pull(userId: string) {
    await delay();
    if (userId !== this.me()) throw new Error('Accès refusé.');
    return load().data.filter((d) => d.userId === userId);
  }
  async upsert(userId: string, rows: Array<{ key: string; value: unknown }>) {
    await delay();
    if ((window as unknown as { __mockOffline?: boolean }).__mockOffline) throw new Error('Failed to fetch');
    const db = load();
    const now = new Date().toISOString();
    for (const r of rows) {
      const i = db.data.findIndex((d) => d.userId === userId && d.key === r.key);
      const row = { userId, key: r.key, value: r.value, updatedAt: now };
      if (i >= 0) db.data[i] = row;
      else db.data.push(row);
    }
    save(db);
  }
  async remove(userId: string, keys: string[]) {
    const db = load();
    db.data = db.data.filter((d) => !(d.userId === userId && keys.includes(d.key)));
    save(db);
  }
  async listAccounts() {
    await delay();
    const db = load();
    this.requireAdmin(db);
    return db.users.map(({ password: _p, ...a }) => (void _p, a));
  }
  async pullAll() {
    const db = load();
    this.requireAdmin(db);
    return db.data;
  }
  async createStudents(list: NewStudent[]): Promise<CreateResult[]> {
    await delay();
    const db = load();
    this.requireAdmin(db);
    const out: CreateResult[] = [];
    for (const s of list) {
      const username = s.username.trim().toLowerCase();
      if (!USERNAME_RE.test(username)) out.push({ username, ok: false, error: 'Identifiant invalide.' });
      else if (s.password.length < 6) out.push({ username, ok: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' });
      else if (db.users.some((u) => u.username === username)) out.push({ username, ok: false, error: 'Cet identifiant existe déjà.' });
      else {
        const id = uid();
        db.users.push({ id, username, displayName: s.displayName || username, classLabel: s.classLabel, role: 'student', createdAt: new Date().toISOString(), lastSeenAt: null, password: s.password });
        out.push({ username, ok: true, id });
      }
    }
    save(db);
    return out;
  }
  async setPassword(userId: string, password: string) {
    const db = load();
    this.requireAdmin(db);
    const u = db.users.find((x) => x.id === userId);
    if (!u) throw new Error('Compte introuvable.');
    u.password = password;
    save(db);
  }
  async updateAccount(userId: string, patch: { displayName?: string; classLabel?: string }) {
    const db = load();
    this.requireAdmin(db);
    const u = db.users.find((x) => x.id === userId);
    if (!u) throw new Error('Compte introuvable.');
    if (patch.displayName !== undefined) u.displayName = patch.displayName;
    if (patch.classLabel !== undefined) u.classLabel = patch.classLabel;
    save(db);
  }
  async deleteAccount(userId: string) {
    const db = load();
    const me = this.requireAdmin(db);
    if (me.id === userId) throw new Error('Tu ne peux pas supprimer ton propre compte.');
    db.users = db.users.filter((u) => u.id !== userId);
    db.data = db.data.filter((d) => d.userId !== userId);
    save(db);
  }
  async bootstrap() {
    const db = load();
    if (db.users.some((u) => u.role === 'admin')) return { created: false, message: 'Le compte administrateur existe déjà.' };
    db.users.push({ id: uid(), username: MOCK_ADMIN.username, displayName: 'M. Bournicon', classLabel: '', role: 'admin', createdAt: new Date().toISOString(), lastSeenAt: null, password: MOCK_ADMIN.password });
    save(db);
    return { created: true, message: 'Compte administrateur créé.' };
  }
}
