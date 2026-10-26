// PNG stills of every chapter at each beat's hold, in both formats, into out/.
// Usage: node scripts/stills.mjs [--browser=/path/to/chrome]
import { render } from './render.mjs';

const browser = process.argv.find((a) => a.startsWith('--browser='))?.split('=')[1];
for (const chapter of ['no-issuer']) {
  for (const [format, prefix] of [['', 'still'], ['square', 'square']]) {
    await render({ chapter, format, browser, stills: `out/${prefix}-${chapter}` });
  }
}
