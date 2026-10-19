import { continueRender, delayRender, staticFile } from 'remotion';

/**
 * Ubuntu Sans (and its mono), bundled under public/fonts so renders do not
 * depend on fonts installed on the machine.
 */
const faces: Array<[string, string]> = [
  ['Ubuntu Sans', 'fonts/UbuntuSans.ttf'],
  ['Ubuntu Sans Mono', 'fonts/UbuntuSansMono.ttf'],
];

let started = false;

export function loadFonts(): void {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading Ubuntu Sans');
  Promise.all(
    faces.map(([family, file]) => {
      const face = new FontFace(family, `url(${staticFile(file)})`, { weight: '100 800' });
      return face.load().then((loaded) => document.fonts.add(loaded));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('font load failed', err);
      continueRender(handle);
    });
}
