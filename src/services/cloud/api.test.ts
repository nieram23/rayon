import { beforeEach, describe, expect, it, vi } from 'vitest';

/* Faux client Supabase « administrateur » utilisé par api/admin.ts. */
interface User { id: string; email: string; password: string }
interface Profile { id: string; username: string; display_name: string; class_label: string; role: string }
const db = { users: [] as User[], profiles: [] as Profile[], tokens: new Map<string, string>() };

function table(name: string) {
  const rows = () => (name === 'profiles' ? db.profiles : []) as unknown as Array<Record<string, unknown>>;
  let filters: Array<[string, unknown]> = [];
  let head = false;
  let patch: Record<string, unknown> | null = null;
  const q = {
    select(_c: string, opts?: { count?: string; head?: boolean }) {
      head = !!opts?.head;
      return q;
    },
    eq(k: string, v: unknown) {
      filters.push([k, v]);
      if (patch) {
        rows().filter((r) => filters.every(([fk, fv]) => r[fk] === fv)).forEach((r) => Object.assign(r, patch));
        return Promise.resolve({ error: null });
      }
      return q;
    },
    update(p: Record<string, unknown>) {
      patch = p;
      return q;
    },
    insert(row: Profile) {
      db.profiles.push(row);
      return Promise.resolve({ error: null });
    },
    maybeSingle() {
      const r = rows().find((x) => filters.every(([k, v]) => x[k] === v));
      filters = [];
      return Promise.resolve({ data: r ?? null });
    },
    then(res: (v: unknown) => void) {
      const list = rows().filter((x) => filters.every(([k, v]) => x[k] === v));
      res(head ? { count: list.length } : { data: list });
    },
  };
  return q;
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: table,
    auth: {
      getUser: async (token: string) => {
        const id = db.tokens.get(token);
        return id ? { data: { user: { id } }, error: null } : { data: { user: null }, error: { message: 'bad' } };
      },
      admin: {
        createUser: async ({ email, password }: { email: string; password: string }) => {
          if (db.users.some((u) => u.email === email)) return { data: { user: null }, error: { message: 'User already registered' } };
          const user = { id: 'id-' + (db.users.length + 1), email, password };
          db.users.push(user);
          return { data: { user }, error: null };
        },
        deleteUser: async (id: string) => {
          db.users = db.users.filter((u) => u.id !== id);
          db.profiles = db.profiles.filter((p) => p.id !== id);
          return { error: null };
        },
        updateUserById: async (id: string, { password }: { password: string }) => {
          const u = db.users.find((x) => x.id === id);
          if (u) u.password = password;
          return { error: u ? null : { message: 'not found' } };
        },
      },
    },
  }),
}));

const { default: handler } = await import('../../../api/admin');

async function call(body: unknown, token?: string) {
  let status = 0;
  let json: Record<string, unknown> = {};
  const res = {
    status(c: number) {
      status = c;
      return res;
    },
    json(b: unknown) {
      json = b as Record<string, unknown>;
    },
    setHeader() {},
  };
  await handler({ method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {}, body }, res);
  return { status, json };
}

describe('API comptes', () => {
  beforeEach(() => {
    db.users = [];
    db.profiles = [];
    db.tokens.clear();
    process.env.SUPABASE_URL = 'http://x';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'k';
    process.env.ADMIN_USERNAME = 'm.bournicon';
    process.env.ADMIN_PASSWORD = 'secret-test';
  });

  it('crée le compte administrateur une seule fois', async () => {
    const r1 = await call({ action: 'bootstrap' });
    expect(r1.json.created).toBe(true);
    expect(db.profiles[0]).toMatchObject({ username: 'm.bournicon', role: 'admin' });
    expect(db.users[0].email).toBe('m.bournicon@rayon-mcv.example.com');
    const r2 = await call({ action: 'bootstrap' });
    expect(r2.json.created).toBe(false);
    expect(db.users).toHaveLength(1);
  });

  it('refuse les actions sans être administrateur', async () => {
    expect((await call({ action: 'create', students: [] })).status).toBe(403);
    await call({ action: 'bootstrap' });
    db.profiles.push({ id: 'eleve', username: 'lea', display_name: 'Léa', class_label: '', role: 'student' });
    db.tokens.set('tok-eleve', 'eleve');
    expect((await call({ action: 'create', students: [{ username: 'x.y', password: 'abcdef' }] }, 'tok-eleve')).status).toBe(403);
  });

  it('crée des élèves, signale les doublons et les erreurs', async () => {
    await call({ action: 'bootstrap' });
    db.tokens.set('tok', db.profiles[0].id);
    const r = await call(
      {
        action: 'create',
        students: [
          { username: 'lea.martin', displayName: 'Léa Martin', classLabel: '1re MCV A', password: 'vitrine-12-quai' },
          { username: 'lea.martin', displayName: 'Léa Martin', classLabel: '1re MCV A', password: 'vitrine-12-quai' },
          { username: 'A', password: 'abcdef' },
          { username: 'noah.petit', password: '123' },
        ],
      },
      'tok',
    );
    const results = r.json.results as Array<{ ok: boolean; error?: string }>;
    expect(results.map((x) => x.ok)).toEqual([true, false, false, false]);
    expect(results[1].error).toMatch(/existe déjà/);
    expect(db.profiles.find((p) => p.username === 'lea.martin')).toMatchObject({ role: 'student', class_label: '1re MCV A' });
  });

  it('change un mot de passe et empêche de supprimer son propre compte', async () => {
    await call({ action: 'bootstrap' });
    const adminId = db.profiles[0].id;
    db.tokens.set('tok', adminId);
    await call({ action: 'create', students: [{ username: 'ines.d', displayName: 'Inès', password: 'abcdef' }] }, 'tok');
    const eleve = db.profiles.find((p) => p.username === 'ines.d')!;
    expect((await call({ action: 'setPassword', userId: eleve.id, password: 'nouveau-1' }, 'tok')).status).toBe(200);
    expect(db.users.find((u) => u.id === eleve.id)?.password).toBe('nouveau-1');
    expect((await call({ action: 'setPassword', userId: eleve.id, password: '12' }, 'tok')).status).toBe(400);
    expect((await call({ action: 'delete', userId: adminId }, 'tok')).status).toBe(400);
    expect((await call({ action: 'delete', userId: eleve.id }, 'tok')).status).toBe(200);
    expect(db.profiles.some((p) => p.id === eleve.id)).toBe(false);
  });
});
