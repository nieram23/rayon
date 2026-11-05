-- ============================================================================
-- Rayon · schéma de la base Supabase
-- Installé automatiquement par la page #/installation (fonction api/admin.ts),
-- ou à coller dans Supabase > SQL Editor > New query > Run.
-- Le script peut être relancé sans danger (il ne supprime aucune donnée).
-- ============================================================================

-- 1. Profils : un par compte (élève ou administrateur).
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique,
  display_name text not null,
  class_label  text not null default '',
  role         text not null default 'student' check (role in ('admin', 'student')),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz
);

-- 2. Données de travail : une ligne par clé (réponses d'un dossier, autoévaluation…).
create table if not exists public.user_data (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create index if not exists user_data_user_idx on public.user_data (user_id);

-- 3. Fonction utilitaire : l'utilisateur connecté est-il administrateur ?
--    « security definer » évite une boucle avec les règles de la table profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 4. Mise à jour de la dernière connexion, appelée par l'application.
create or replace function public.touch_last_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set last_seen_at = now() where id = auth.uid();
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.touch_last_seen() to authenticated;

-- 5. Règles d'accès (Row Level Security).
alter table public.profiles  enable row level security;
alter table public.user_data enable row level security;

-- Profils : chacun lit le sien, l'administrateur lit tout.
-- Création, modification et suppression : uniquement par le serveur (clé de service).
drop policy if exists "profil lisible par soi ou admin" on public.profiles;
create policy "profil lisible par soi ou admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- Données : chaque élève lit et écrit uniquement les siennes.
drop policy if exists "donnees lecture" on public.user_data;
create policy "donnees lecture" on public.user_data
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Seuls les comptes créés par l'administrateur (qui ont un profil) peuvent enregistrer des données.
drop policy if exists "donnees ajout" on public.user_data;
create policy "donnees ajout" on public.user_data
  for insert to authenticated
  with check ((user_id = auth.uid() and exists (select 1 from public.profiles where id = auth.uid())) or public.is_admin());

drop policy if exists "donnees modification" on public.user_data;
create policy "donnees modification" on public.user_data
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "donnees suppression" on public.user_data;
create policy "donnees suppression" on public.user_data
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Aucun accès pour les visiteurs non connectés.
revoke all on public.profiles  from anon;
revoke all on public.user_data from anon;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.user_data to authenticated;
