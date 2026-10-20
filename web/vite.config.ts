import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const page = (name: string) => fileURLToPath(new URL(name, import.meta.url));

// Pages: index.html the slides with presentation mode, video.html the
// film player, animations.html the graphics for websites, embed.html one
// looping clip for an iframe, frame.html one chapter at one frame (video
// export, and with ?scrub a preview). `npm run dev` serves them, `npm run build` writes them
// to out/web/. Fonts come from public/.
export default defineConfig({
  root: 'web',
  publicDir: '../public',
  base: './',
  build: {
    outDir: '../out/web',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        index: page('index.html'),
        video: page('video.html'),
        animations: page('animations.html'),
        embed: page('embed.html'),
        frame: page('frame.html'),
      },
    },
  },
  oxc: { jsx: { runtime: 'automatic' } },
});
