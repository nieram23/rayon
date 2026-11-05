import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Génère les 28 cahiers PDF (élève et corrigé) dans /tmp/pdf pour les relire.
export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['src/pdf/*.preview.test.tsx'], testTimeout: 600000 },
});
