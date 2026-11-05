import { configDefaults, defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Adresse et clé publique de Supabase, injectées dans le site au moment de la construction.
 * Noms acceptés : les nôtres (VITE_…) ou ceux que crée l'intégration Supabase de Vercel.
 * Seules ces deux valeurs publiques sont injectées : la clé secrète reste côté serveur.
 */
function supabaseConfig(env: Record<string, string | undefined>) {
  const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
const supabaseAnon =
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_ANON_KEY ||
  '';
  return { supabaseUrl, supabaseAnon };
}

// base './' : l'application fonctionne depuis n'importe quel dossier
// (serveur du lycée, ENT, hébergement statique gratuit).
export default defineConfig(({ mode }) => {
  const { supabaseUrl, supabaseAnon } = supabaseConfig({ ...loadEnv(mode, process.cwd(), ''), ...process.env });
  return {
  base: './',
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnon),
  },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    // Rendu complet des cahiers PDF (long) : npm run test:pdf
    exclude: [...configDefaults.exclude, '**/*.preview.test.tsx'],
  },
};
});
