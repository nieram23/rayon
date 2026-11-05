import { MockBackend } from './mockBackend';
import { SupabaseBackend } from './supabaseBackend';
import type { CloudBackend } from './types';

export type { Account, CloudBackend, CreateResult, DataRow, NewStudent, Role } from './types';

/**
 * Choix du serveur :
 * - Supabase si VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont renseignées (site en ligne) ;
 * - simulateur si VITE_CLOUD=mock (tests) ;
 * - sinon aucun : l'application fonctionne comme avant, sans comptes (aperçu, clé USB…).
 */
let backend: CloudBackend | null | undefined;

export function getBackend(): CloudBackend | null {
  if (backend !== undefined) return backend;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (url && key) backend = new SupabaseBackend(url, key);
  else if (import.meta.env.VITE_CLOUD === 'mock') backend = new MockBackend();
  else backend = null;
  return backend;
}
