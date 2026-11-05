import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { toEmail } from '../../lib/accounts';
import type { Account, CloudBackend, CreateResult, DataRow, NewStudent } from './types';

interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  class_label: string;
  role: 'admin' | 'student';
  created_at: string;
  last_seen_at: string | null;
}

const toAccount = (p: ProfileRow): Account => ({
  id: p.id,
  username: p.username,
  displayName: p.display_name,
  classLabel: p.class_label,
  role: p.role,
  createdAt: p.created_at,
  lastSeenAt: p.last_seen_at,
});

/** Les tables sont paginées par Supabase (1 000 lignes) : on lit page par page. */
const PAGE = 1000;

export class SupabaseBackend implements CloudBackend {
  readonly kind = 'supabase' as const;
  private sb: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.sb = createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'rayon.auth' } });
  }

  async currentUserId() {
    const { data } = await this.sb.auth.getSession();
    return data.session?.user.id ?? null;
  }

  onSignedOut(cb: () => void) {
    const { data } = this.sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') cb();
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn(username: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email: toEmail(username), password });
    if (!error) return { ok: true as const };
    if (/invalid login/i.test(error.message)) return { ok: false as const, error: 'Identifiant ou mot de passe incorrect.' };
    if (/fetch|network/i.test(error.message)) return { ok: false as const, error: 'Connexion au serveur impossible. Vérifie ta connexion internet.' };
    return { ok: false as const, error: error.message };
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async myAccount() {
    const id = await this.currentUserId();
    if (!id) return null;
    const { data, error } = await this.sb.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toAccount(data as ProfileRow) : null;
  }

  async touchLastSeen() {
    await this.sb.rpc('touch_last_seen');
  }

  private async pages(query: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) {
    const out: Array<{ user_id: string; key: string; value: unknown; updated_at: string }> = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await query(from, from + PAGE - 1);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as typeof out;
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
    return out.map<DataRow>((r) => ({ userId: r.user_id, key: r.key, value: r.value, updatedAt: r.updated_at }));
  }

  pull(userId: string) {
    return this.pages((a, b) => this.sb.from('user_data').select('user_id,key,value,updated_at').eq('user_id', userId).order('key').range(a, b));
  }

  async upsert(userId: string, rows: Array<{ key: string; value: unknown }>) {
    if (!rows.length) return;
    const now = new Date().toISOString();
    const { error } = await this.sb
      .from('user_data')
      .upsert(rows.map((r) => ({ user_id: userId, key: r.key, value: r.value, updated_at: now })), { onConflict: 'user_id,key' });
    if (error) throw new Error(error.message);
  }

  async remove(userId: string, keys: string[]) {
    if (!keys.length) return;
    const { error } = await this.sb.from('user_data').delete().eq('user_id', userId).in('key', keys);
    if (error) throw new Error(error.message);
  }

  async listAccounts() {
    const { data, error } = await this.sb.from('profiles').select('*').order('class_label').order('display_name');
    if (error) throw new Error(error.message);
    return (data as ProfileRow[]).map(toAccount);
  }

  pullAll() {
    return this.pages((a, b) => this.sb.from('user_data').select('user_id,key,value,updated_at').order('user_id').order('key').range(a, b));
  }

  private async call<T>(action: string, payload: Record<string, unknown> = {}, auth = true): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const { data } = await this.sb.auth.getSession();
      if (data.session) headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    let res: Response;
    try {
      res = await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ action, ...payload }) });
    } catch {
      throw new Error('Serveur injoignable. Vérifie ta connexion internet.');
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string } & T;
    if (!res.ok) throw new Error(body.error || `Erreur ${res.status}`);
    return body;
  }

  async createStudents(list: NewStudent[]) {
    const r = await this.call<{ results: CreateResult[] }>('create', { students: list });
    return r.results;
  }

  async setPassword(userId: string, password: string) {
    await this.call('setPassword', { userId, password });
  }

  async updateAccount(userId: string, patch: { displayName?: string; classLabel?: string }) {
    await this.call('update', { userId, ...patch });
  }

  async deleteAccount(userId: string) {
    await this.call('delete', { userId });
  }

  async bootstrap() {
    return this.call<{ created: boolean; message: string }>('bootstrap', {}, false);
  }
}
