/**
 * Ubuntu Sans (and its mono), bundled under public/fonts so every page and
 * every rendered frame uses the same fonts, whatever is installed. The URLs
 * are relative to the page, so pages work from any path.
 */
const faces: Array<[string, string]> = [
  ['Ubuntu Sans', 'fonts/UbuntuSans.ttf'],
  ['Ubuntu Sans Mono', 'fonts/UbuntuSansMono.ttf'],
];

let ready: Promise<void> | null = null;

/** Loads the fonts once; resolves when they can be used. */
export function loadFonts(): Promise<void> {
  if (ready) return ready;
  if (typeof document === 'undefined') return (ready = Promise.resolve());
  ready = Promise.all(
    faces.map(async ([family, file]) => {
      const face = new FontFace(family, `url(${new URL(file, document.baseURI).href})`, { weight: '100 800' });
      document.fonts.add(await face.load());
    }),
  )
    .then(() => undefined)
    .catch((err) => console.error('font load failed', err));
  return ready;
}
