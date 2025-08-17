// vite.config.js (або vite.config.mjs)
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '', // відносні шляхи для GitHub Pages
  server: { port: 5174, open: true },
  build: { outDir: '../dist', emptyOutDir: true },
});
