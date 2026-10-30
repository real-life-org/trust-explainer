// Renders a chapter to video or to PNG stills, from the same page the deck
// uses: a headless Chromium draws web/frame.html frame by frame, ffmpeg
// encodes the screenshots.
//
//   node scripts/render.mjs --chapter relationship [--format square] --out out/relationship.mp4
//   node scripts/render.mjs --chapter relationship --stills out/still   (one PNG per beat hold)
//   node scripts/render.mjs ... --frames 0,90,180 --stills out/x       (chosen frames)
//   node scripts/render.mjs ... --every 6 --stills out/seq/f          (every nth frame)
//
// Chromium: --browser=/path, or $CHROME_PATH, or /usr/bin/chromium.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const [k, v] = a.slice(2).split('=');
    out[k] = v ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
  }
  return out;
}

export function browserPath(opt) {
  const candidates = [opt, process.env.CHROME_PATH, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error('no Chromium found: pass --browser=/path/to/chrome or set CHROME_PATH');
  return found;
}

/** Opens the frame page for a chapter and format; returns the page, its info, and a close function. */
export async function openChapter({ chapter, format = '', browser: browserOpt }) {
  const server = await createServer({ configFile: 'web/vite.config.ts', logLevel: 'error', server: { port: 0 } });
  await server.listen();
  const base = server.resolvedUrls.local[0];
  const browser = await chromium.launch({ executablePath: browserPath(browserOpt) });
  const probe = await browser.newPage();
  const url = `${base}frame.html?chapter=${encodeURIComponent(chapter)}&format=${encodeURIComponent(format)}`;
  await probe.goto(url);
  const info = await probe.evaluate(() => window.__frame.info);
  await probe.close();
  if (chapter && !info.chapters.some((c) => c.id === chapter)) {
    await browser.close();
    await server.close();
    throw new Error(`unknown chapter "${chapter}"; chapters: ${info.chapters.map((c) => c.id).join(', ')}`);
  }
  const page = await browser.newPage({ viewport: { width: info.width, height: info.height }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(url);
  await page.evaluate(() => window.__frame.ready);
  const shot = async (n) => {
    await page.evaluate((x) => window.__frame.set(x), n);
    return page.screenshot({ type: 'png' });
  };
  const close = async () => {
    await browser.close();
    await server.close();
  };
  return { info, shot, close };
}

async function toVideo({ info, shot }, out) {
  mkdirSync(dirname(out), { recursive: true });
  const ff = spawn(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(info.fps), '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const done = new Promise((resolve, reject) => ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))));
  for (let n = 0; n < info.durationInFrames; n++) {
    const png = await shot(n);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    if (n % 30 === 0) process.stdout.write(`\r${n}/${info.durationInFrames}`);
  }
  ff.stdin.end();
  await done;
  process.stdout.write(`\r${info.durationInFrames}/${info.durationInFrames}\n${out}\n`);
}

async function toStills({ info, shot }, prefix, frames) {
  mkdirSync(dirname(prefix), { recursive: true });
  const { writeFile } = await import('node:fs/promises');
  const files = [];
  for (const [name, n] of frames) {
    const file = `${prefix}-${name}.png`;
    await writeFile(file, await shot(n));
    console.log(file);
    files.push(file);
  }
  return files;
}

/** Which frames to write as stills: chosen ones, every nth, or each beat's hold. */
function stillFrames(info, opt) {
  const pad = (n) => String(n).padStart(4, '0');
  if (opt.frames) return String(opt.frames).split(',').map((n) => [pad(Number(n)), Number(n)]);
  if (opt.every) {
    const step = Number(opt.every);
    return Array.from({ length: Math.ceil(info.durationInFrames / step) }, (_, i) => [pad(i * step), i * step]);
  }
  return info.holds.map((h, i) => [`${i}-${h.id}`, h.frame]);
}

/** Renders a video, or stills; for stills, returns the files written. */
export async function render(opt) {
  if (!opt.chapter) throw new Error('--chapter is required');
  const session = await openChapter(opt);
  try {
    if (opt.stills) return await toStills(session, opt.stills, stillFrames(session.info, opt));
    else await toVideo(session, opt.out ?? `out/${opt.chapter}${opt.format ? `-${opt.format}` : ''}.mp4`);
  } finally {
    await session.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  render(args(process.argv.slice(2))).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
