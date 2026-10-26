// PNG stills of every built chapter at each beat's hold, in both formats,
// into out/. File names start with the principle's number, so they sort in
// deck order: out/still-04-no-issuer-0-line.png, out/square-04-no-issuer-0-line.png.
// Usage: node scripts/stills.mjs [--browser=/path/to/chrome]
import { openChapter, render } from './render.mjs';

const browser = process.argv.find((a) => a.startsWith('--browser='))?.split('=')[1];

// the chapter list comes from the frame page, so it follows the outline
const probe = await openChapter({ chapter: '', browser });
const { chapters } = probe.info;
await probe.close();

for (const { id, number } of chapters) {
  const name = number ? `${number}-${id}` : id;
  for (const [format, prefix] of [['', 'still'], ['square', 'square']]) {
    await render({ chapter: id, format, browser, stills: `out/${prefix}-${name}` });
  }
}
