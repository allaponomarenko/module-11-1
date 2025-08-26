// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src', // ← корінь — папка src
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: { open: true },
});
