import { defineConfig } from 'vite';

// The deck is a static page: `npm run deck` serves it, `npm run deck:build`
// writes it to out/deck/. Fonts come from the shared public/ folder.
export default defineConfig({
  root: 'deck',
  publicDir: '../public',
  base: './',
  build: { outDir: '../out/deck', emptyOutDir: true },
  oxc: { jsx: { runtime: 'automatic' } },
});
