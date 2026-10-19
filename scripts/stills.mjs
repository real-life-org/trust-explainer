// Renders PNG stills at key moments into out/.
// Usage: node scripts/stills.mjs [--browser-executable=/path/to/chrome]
import { execFileSync } from 'node:child_process';

const extra = process.argv.slice(2);
const FPS = 30;
const moments = [
  ['01-qr', 0.9],
  ['02-scan-flight', 3.0],
  ['03-recognized', 4.6],
  ['04-confirm-on-ben', 5.75],
  ['05-move-away-credential', 7.3],
  ['06-confirm-back-on-ana', 9.3],
  ['07-connected-credential', 10.4],
  ['08-credential-to-row', 11.6],
  ['08b-contacts', 12.4],
  ['09-trusted', 14.6],
  ['10-outro', 17.0],
];

for (const [comp, prefix] of [['Encounter', 'still'], ['EncounterSquare', 'square']]) {
  for (const [name, sec] of moments) {
    const out = `out/${prefix}-${name}.png`;
    execFileSync(
      'npx',
      ['remotion', 'still', 'src/index.ts', comp, out, `--frame=${Math.round(sec * FPS)}`, ...extra],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
    console.log(out);
  }
}
