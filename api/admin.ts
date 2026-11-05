/**
 * Fonction serveur Vercel : gestion des comptes Rayon.
 * Elle seule possède la clé de service Supabase (variable d'environnement),
 * qui n'est jamais envoyée au navigateur.
 *
 * Actions (POST /api/admin, corps JSON { action, ... }) :
 *  - bootstrap    : crée le compte administrateur s'il n'existe pas encore (sans connexion).
 *  - create       : crée un ou plusieurs comptes élèves (administrateur connecté).
 *  - setPassword  : définit un nouveau mot de passe (administrateur).
 *  - update       : modifie le nom affiché ou la classe (administrateur).
 *  - delete       : supprime un compte et ses données (administrateur).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Doit rester identique à src/lib/accounts.ts
const EMAIL_DOMAIN = 'rayon-mcv.example.com';
const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,39}$/;
const MAX_BATCH = 60;

type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type Res = { status: (code: number) => Res; json: (body: unknown) => void; setHeader: (k: string, v: string) => void };

interface StudentInput {
  username?: string;
  displayName?: string;
  classLabel?: string;
  password?: string;
}

const toEmail = (username: string) => `${username}@${EMAIL_DOMAIN}`;

function checkPassword(p: unknown): string | null {
  if (typeof p !== 'string' || p.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (p.length > 72) return 'Le mot de passe est trop long (72 caractères au plus).';
  return null;
}

function cleanText(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function adminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Vérifie que l'appel vient d'un administrateur connecté. Renvoie son identifiant. */
async function requireAdmin(sb: SupabaseClient, req: Req): Promise<string | null> {
  const h = req.headers.authorization ?? req.headers.Authorization;
  const header = Array.isArray(h) ? h[0] : h;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: prof } = await sb.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  return prof?.role === 'admin' ? data.user.id : null;
}

async function createAccount(sb: SupabaseClient, s: StudentInput, role: 'admin' | 'student') {
  const username = cleanText(s.username, 40).toLowerCase();
  const displayName = cleanText(s.displayName, 60) || username;
  const classLabel = cleanText(s.classLabel, 40);
  if (!USERNAME_RE.test(username)) {
    return { username, ok: false, error: 'Identifiant invalide : 3 à 40 caractères, lettres minuscules, chiffres, point, tiret.' };
  }
  const pwErr = checkPassword(s.password);
  if (pwErr) return { username, ok: false, error: pwErr };

  const { data: existing } = await sb.from('profiles').select('id').eq('username', username).maybeSingle();
  if (existing) return { username, ok: false, error: 'Cet identifiant existe déjà.' };

  const { data, error } = await sb.auth.admin.createUser({
    email: toEmail(username),
    password: s.password as string,
    email_confirm: true,
    user_metadata: { username },
  });
  if (error || !data.user) {
    const msg = /already/i.test(error?.message ?? '') ? 'Cet identifiant existe déjà.' : `Création impossible : ${error?.message ?? 'erreur inconnue'}`;
    return { username, ok: false, error: msg };
  }
  const { error: pErr } = await sb.from('profiles').insert({ id: data.user.id, username, display_name: displayName, class_label: classLabel, role });
  if (pErr) {
    await sb.auth.admin.deleteUser(data.user.id);
    return { username, ok: false, error: `Profil non enregistré : ${pErr.message}` };
  }
  return { username, ok: true, id: data.user.id };
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  const sb = adminClient();
  if (!sb) return res.status(500).json({ error: 'Serveur non configuré : variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes.' });

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as Record<string, unknown>;
  const action = body.action;

  try {
    if (action === 'bootstrap') {
      const { count } = await sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin');
      if ((count ?? 0) > 0) return res.status(200).json({ ok: true, created: false, message: 'Le compte administrateur existe déjà.' });
      const password = process.env.ADMIN_PASSWORD;
      if (!password) return res.status(500).json({ error: 'Variable ADMIN_PASSWORD manquante dans Vercel.' });
      const r = await createAccount(sb, { username: process.env.ADMIN_USERNAME || 'm.bournicon', displayName: process.env.ADMIN_DISPLAY_NAME || 'M. Bournicon', password }, 'admin');
      return res.status(r.ok ? 200 : 400).json(r.ok ? { ok: true, created: true, message: 'Compte administrateur créé.' } : { error: r.error });
    }

    const adminId = await requireAdmin(sb, req);
    if (!adminId) return res.status(403).json({ error: 'Accès réservé à l’administrateur connecté.' });

    if (action === 'create') {
      const list = Array.isArray(body.students) ? (body.students as StudentInput[]) : [];
      if (!list.length) return res.status(400).json({ error: 'Aucun élève à créer.' });
      if (list.length > MAX_BATCH) return res.status(400).json({ error: `${MAX_BATCH} comptes au maximum par envoi.` });
      const results = [];
      for (const s of list) results.push(await createAccount(sb, s, 'student'));
      return res.status(200).json({ results });
    }

    const userId = typeof body.userId === 'string' ? body.userId : '';
    if (!userId) return res.status(400).json({ error: 'Compte non précisé.' });

    if (action === 'setPassword') {
      const pwErr = checkPassword(body.password);
      if (pwErr) return res.status(400).json({ error: pwErr });
      const { error } = await sb.auth.admin.updateUserById(userId, { password: body.password as string });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (action === 'update') {
      const patch: Record<string, string> = {};
      if (typeof body.displayName === 'string') patch.display_name = cleanText(body.displayName, 60);
      if (typeof body.classLabel === 'string') patch.class_label = cleanText(body.classLabel, 40);
      const { error } = await sb.from('profiles').update(patch).eq('id', userId);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      if (userId === adminId) return res.status(400).json({ error: 'Tu ne peux pas supprimer ton propre compte.' });
      const { error } = await sb.auth.admin.deleteUser(userId);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Action inconnue.' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Erreur serveur.' });
  }
}
