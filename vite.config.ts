import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' : l'application fonctionne depuis n'importe quel dossier
// (serveur du lycée, ENT, hébergement statique gratuit).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    // Rendu complet des cahiers PDF (long) : npm run test:pdf
    exclude: [...configDefaults.exclude, '**/*.preview.test.tsx'],
  },
});
