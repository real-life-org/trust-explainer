// PNG stills of every built chapter at each beat's hold, in both formats,
// into out/. File names start with the principle's number, so they sort in
// deck order: out/still-04-no-issuer-0-line.png, out/square-04-no-issuer-0-line.png.
// With --pdf the stills are also bound into out/slides.pdf (16:9) and
// out/slides-square.pdf, one still per page.
// Usage: node scripts/stills.mjs [--pdf] [--browser=/path/to/chrome]
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { browserPath, openChapter, render } from './render.mjs';

const browser = process.argv.find((a) => a.startsWith('--browser='))?.split('=')[1];
const pdf = process.argv.includes('--pdf');

// the chapter list comes from the frame page, so it follows the outline
const probe = await openChapter({ chapter: '', browser });
const { chapters } = probe.info;
await probe.close();

const FORMATS = [
  { format: '', prefix: 'still', size: { width: 1920, height: 1080 }, pdf: 'out/slides.pdf' },
  { format: 'square', prefix: 'square', size: { width: 1080, height: 1080 }, pdf: 'out/slides-square.pdf' },
];
const written = new Map(FORMATS.map((f) => [f.prefix, []]));

for (const { id, number } of chapters) {
  const name = number ? `${number}-${id}` : id;
  for (const { format, prefix } of FORMATS) {
    const files = await render({ chapter: id, format, browser, stills: `out/${prefix}-${name}` });
    written.get(prefix).push(...files);
  }
}

if (pdf) {
  const b = await chromium.launch({ executablePath: browserPath(browser) });
  try {
    for (const { prefix, size, pdf: out } of FORMATS) {
      const imgs = await Promise.all(
        written.get(prefix).map(async (file) => `<img src="data:image/png;base64,${(await readFile(file)).toString('base64')}">`),
      );
      const page = await b.newPage();
      await page.setContent(
        `<style>@page{size:${size.width}px ${size.height}px;margin:0}html,body{margin:0}` +
          `img{display:block;width:${size.width}px;height:${size.height}px;break-after:page}img:last-child{break-after:auto}</style>` +
          imgs.join(''),
      );
      await page.pdf({ path: out, width: `${size.width}px`, height: `${size.height}px`, printBackground: true });
      await page.close();
      console.log(out);
    }
  } finally {
    await b.close();
  }
}
