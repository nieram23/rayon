/**
 * Synchronisation des données de travail avec le serveur.
 *
 * Principe : l'application continue de lire et d'écrire dans le stockage du navigateur
 * (rapide, fonctionne hors ligne). Chaque écriture est aussi mise en file d'attente
 * puis envoyée au serveur. À la connexion, les données du serveur remplacent celles du poste.
 * Les modifications non encore envoyées sont gardées sur le poste et renvoyées plus tard.
 */
import { KEYS, clearWorkData, setWriteListener, writeRaw } from '../storage';
import type { CloudBackend } from './types';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Clés locales qui ne sont pas envoyées (préférences d'affichage, profil reconstruit à la connexion). */
const LOCAL_ONLY = new Set<string>([KEYS.profile, KEYS.mode, KEYS.teacherOverrides]);
export const isSynced = (key: string) => !LOCAL_ONLY.has(key) && !key.startsWith('__') && !key.startsWith('demo.');

const DELETE = Symbol('delete');
type Pending = Map<string, unknown>;

const pendingKey = (userId: string) => `rayon-pending.${userId}`;
const DEBOUNCE_MS = 800;
const RETRY_MS = [3000, 8000, 20000, 60000];

export class SyncEngine {
  private pending: Pending = new Map();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private flushing: Promise<void> | null = null;
  private failures = 0;
  private statusListeners = new Set<(s: SyncStatus) => void>();
  status: SyncStatus = 'idle';
  lastSavedAt: Date | null = null;

  constructor(
    private backend: CloudBackend,
    readonly userId: string,
  ) {}

  onStatus(cb: (s: SyncStatus) => void) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private setStatus(s: SyncStatus) {
    this.status = s;
    this.statusListeners.forEach((l) => l(s));
  }

  /** Charge les données du compte sur ce poste et active l'envoi automatique. */
  async start() {
    const rows = await this.backend.pull(this.userId);
    clearWorkData();
    for (const r of rows) writeRaw(r.key, r.value);
    // Modifications faites hors ligne lors d'une séance précédente : elles sont plus récentes.
    const saved = this.readPersisted();
    for (const [k, v] of saved) {
      if (v === DELETE) continue;
      writeRaw(k, v);
    }
    this.pending = saved;
    setWriteListener((key, value) => this.enqueue(key, value));
    this.attachPageEvents();
    if (this.pending.size) void this.flush();
    else this.setStatus('saved');
  }

  /** Arrête la synchronisation après un dernier envoi. Renvoie false si des données n'ont pas pu partir. */
  async stop(): Promise<boolean> {
    setWriteListener(null);
    this.detachPageEvents();
    if (this.timer) clearTimeout(this.timer);
    try {
      await this.flush();
    } catch {
      /* gardé dans pending */
    }
    return this.pending.size === 0;
  }

  /** Reprend l'envoi automatique après un stop() refusé (déconnexion annulée). */
  resume() {
    setWriteListener((key, value) => this.enqueue(key, value));
    this.attachPageEvents();
    if (this.pending.size) this.schedule(RETRY_MS[0]);
  }

  hasPending() {
    return this.pending.size > 0;
  }

  private enqueue(key: string, value: unknown) {
    if (!isSynced(key)) return;
    this.pending.set(key, value === undefined ? DELETE : value);
    this.persist();
    this.setStatus('saving');
    this.schedule(DEBOUNCE_MS);
  }

  private schedule(ms: number) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), ms);
  }

  async flush(): Promise<void> {
    if (this.flushing) {
      await this.flushing;
      if (!this.pending.size) return;
    }
    if (!this.pending.size) return;
    const batch = new Map(this.pending);
    this.flushing = (async () => {
      this.setStatus('saving');
      const upserts: Array<{ key: string; value: unknown }> = [];
      const deletes: string[] = [];
      for (const [key, v] of batch) (v === DELETE ? deletes.push(key) : upserts.push({ key, value: v }));
      try {
        await this.backend.upsert(this.userId, upserts);
        await this.backend.remove(this.userId, deletes);
        // Ne retirer que les valeurs inchangées depuis le début de l'envoi.
        for (const [k, v] of batch) if (this.pending.get(k) === v) this.pending.delete(k);
        this.persist();
        this.failures = 0;
        this.lastSavedAt = new Date();
        this.setStatus(this.pending.size ? 'saving' : 'saved');
        if (this.pending.size) this.schedule(DEBOUNCE_MS);
      } catch {
        this.failures++;
        this.setStatus('error');
        this.schedule(RETRY_MS[Math.min(this.failures - 1, RETRY_MS.length - 1)]);
      }
    })();
    try {
      await this.flushing;
    } finally {
      this.flushing = null;
    }
  }

  private persist() {
    try {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of this.pending) obj[k] = v === DELETE ? { __deleted: true } : v;
      if (this.pending.size) localStorage.setItem(pendingKey(this.userId), JSON.stringify(obj));
      else localStorage.removeItem(pendingKey(this.userId));
    } catch {
      /* stockage indisponible : la file reste en mémoire */
    }
  }

  private readPersisted(): Pending {
    const out: Pending = new Map();
    try {
      const raw = localStorage.getItem(pendingKey(this.userId));
      if (!raw) return out;
      const obj = JSON.parse(raw) as Record<string, unknown>;
      for (const [k, v] of Object.entries(obj)) {
        out.set(k, v && typeof v === 'object' && (v as { __deleted?: boolean }).__deleted ? DELETE : v);
      }
    } catch {
      /* ignoré */
    }
    return out;
  }

  private onHide = () => {
    if (document.visibilityState === 'hidden') void this.flush();
  };
  private onOnline = () => void this.flush();

  private attachPageEvents() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', this.onHide);
    window.addEventListener('online', this.onOnline);
  }
  private detachPageEvents() {
    if (typeof document === 'undefined') return;
    document.removeEventListener('visibilitychange', this.onHide);
    window.removeEventListener('online', this.onOnline);
  }
}
