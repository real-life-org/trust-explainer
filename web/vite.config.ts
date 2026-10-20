import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const page = (name: string) => fileURLToPath(new URL(name, import.meta.url));

// Three pages: index.html is the overview (slides with presentation mode,
// video player, animations), embed.html one looping clip for other
// websites, frame.html one chapter at one frame (video export, and with
// ?scrub a preview). `npm run dev` serves them, `npm run build` writes them
// to out/web/. Fonts come from public/.
export default defineConfig({
  root: 'web',
  publicDir: '../public',
  base: './',
  build: {
    outDir: '../out/web',
    emptyOutDir: true,
    rolldownOptions: { input: { index: page('index.html'), frame: page('frame.html'), embed: page('embed.html') } },
  },
  oxc: { jsx: { runtime: 'automatic' } },
});
