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
import pg from 'pg';

// Doit rester identique à src/lib/accounts.ts
const EMAIL_DOMAIN = 'rayon-mcv.example.com';
const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,39}$/;
const MAX_BATCH = 60;

/** Schéma de la base (copie de supabase/schema.sql, vérifiée par un test). */
export const SCHEMA_SQL = "-- ============================================================================\n-- Rayon · schéma de la base Supabase\n-- Installé automatiquement par la page #/installation (fonction api/admin.ts),\n-- ou à coller dans Supabase > SQL Editor > New query > Run.\n-- Le script peut être relancé sans danger (il ne supprime aucune donnée).\n-- ============================================================================\n\n-- 1. Profils : un par compte (élève ou administrateur).\ncreate table if not exists public.profiles (\n  id           uuid primary key references auth.users (id) on delete cascade,\n  username     text not null unique,\n  display_name text not null,\n  class_label  text not null default '',\n  role         text not null default 'student' check (role in ('admin', 'student')),\n  created_at   timestamptz not null default now(),\n  last_seen_at timestamptz\n);\n\n-- 2. Données de travail : une ligne par clé (réponses d'un dossier, autoévaluation…).\ncreate table if not exists public.user_data (\n  user_id    uuid not null references auth.users (id) on delete cascade,\n  key        text not null,\n  value      jsonb not null,\n  updated_at timestamptz not null default now(),\n  primary key (user_id, key)\n);\n\ncreate index if not exists user_data_user_idx on public.user_data (user_id);\n\n-- 3. Fonction utilitaire : l'utilisateur connecté est-il administrateur ?\n--    « security definer » évite une boucle avec les règles de la table profiles.\ncreate or replace function public.is_admin()\nreturns boolean\nlanguage sql\nstable\nsecurity definer\nset search_path = public\nas $$\n  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');\n$$;\n\n-- 4. Mise à jour de la dernière connexion, appelée par l'application.\ncreate or replace function public.touch_last_seen()\nreturns void\nlanguage sql\nsecurity definer\nset search_path = public\nas $$\n  update public.profiles set last_seen_at = now() where id = auth.uid();\n$$;\n\ngrant execute on function public.is_admin() to authenticated;\ngrant execute on function public.touch_last_seen() to authenticated;\n\n-- 5. Règles d'accès (Row Level Security).\nalter table public.profiles  enable row level security;\nalter table public.user_data enable row level security;\n\n-- Profils : chacun lit le sien, l'administrateur lit tout.\n-- Création, modification et suppression : uniquement par le serveur (clé de service).\ndrop policy if exists \"profil lisible par soi ou admin\" on public.profiles;\ncreate policy \"profil lisible par soi ou admin\" on public.profiles\n  for select to authenticated\n  using (id = auth.uid() or public.is_admin());\n\n-- Données : chaque élève lit et écrit uniquement les siennes.\ndrop policy if exists \"donnees lecture\" on public.user_data;\ncreate policy \"donnees lecture\" on public.user_data\n  for select to authenticated\n  using (user_id = auth.uid() or public.is_admin());\n\n-- Seuls les comptes créés par l'administrateur (qui ont un profil) peuvent enregistrer des données.\ndrop policy if exists \"donnees ajout\" on public.user_data;\ncreate policy \"donnees ajout\" on public.user_data\n  for insert to authenticated\n  with check ((user_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid())) or public.is_admin());\n\ndrop policy if exists \"donnees modification\" on public.user_data;\ncreate policy \"donnees modification\" on public.user_data\n  for update to authenticated\n  using (user_id = auth.uid() or public.is_admin())\n  with check (user_id = auth.uid() or public.is_admin());\n\ndrop policy if exists \"donnees suppression\" on public.user_data;\ncreate policy \"donnees suppression\" on public.user_data\n  for delete to authenticated\n  using (user_id = auth.uid() or public.is_admin());\n\n-- Aucun accès pour les visiteurs non connectés.\nrevoke all on public.profiles  from anon;\nrevoke all on public.user_data from anon;\ngrant select on public.profiles to authenticated;\ngrant select, insert, update, delete on public.user_data to authenticated;\n";

/**
 * Installe ou met à jour les tables et les règles d'accès, si la connexion directe
 * à la base est disponible (variables POSTGRES_… créées par l'intégration Vercel).
 * Renvoie false si aucune connexion n'est configurée (schéma installé à la main).
 */
async function installSchema(): Promise<boolean> {
  const e = process.env;
  const raw = e.POSTGRES_URL_NON_POOLING || e.POSTGRES_URL || e.DATABASE_URL;
  if (!raw) return false;
  // Le paramètre sslmode de l'adresse impose une vérification que le certificat de Supabase ne passe pas ici.
  const connectionString = raw.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '');
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(SCHEMA_SQL);
  } finally {
    await client.end();
  }
  return true;
}

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
  // Même base que le site : nos noms de variables, ou ceux de l'intégration Supabase de Vercel.
  const e = process.env;
  const url = e.VITE_SUPABASE_URL || e.NEXT_PUBLIC_SUPABASE_URL || e.SUPABASE_URL;
  const key = e.SUPABASE_SERVICE_ROLE_KEY || e.SUPABASE_SECRET_KEY;
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
  if (!sb) return res.status(500).json({ error: 'Serveur non configuré : relie une base Supabase au projet Vercel (ou ajoute SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY), puis redéploie.' });

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}) as Record<string, unknown>;
  const action = body.action;

  try {
    if (action === 'bootstrap') {
      const countAdmins = () => sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin');
      let { count, error: countErr } = await countAdmins();
      // Première mise en service : tables absentes ou aucun administrateur → installation du schéma.
      if (countErr || (count ?? 0) === 0) {
        try {
          await installSchema();
        } catch (err) {
          return res.status(500).json({ error: `Installation de la base impossible : ${err instanceof Error ? err.message : 'erreur inconnue'}` });
        }
        ({ count, error: countErr } = await countAdmins());
      }
      if (countErr) return res.status(500).json({ error: `Base non prête : ${countErr.message}. Lance supabase/schema.sql dans l’éditeur SQL de Supabase.` });
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
