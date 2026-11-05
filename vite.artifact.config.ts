import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Aperçu autonome en un seul fichier HTML (polices et scripts intégrés).
export default defineConfig({
  base: './',
  define: { 'import.meta.env.VITE_ARTIFACT': JSON.stringify('1') },
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'dist-artifact', assetsInlineLimit: 100_000_000 },
});
