import { CHAPTERS } from '../src/chapters';
import { FORMATS } from '../src/kit/format';

const query = new URLSearchParams(location.search);

/** `?format=square` picks the square format; default is 16:9. */
export const FORMAT =
  FORMATS.find((x) => x.suffix.toLowerCase() === (query.get('format') ?? '').toLowerCase()) ?? FORMATS[0];

/** `?chapter=<id>`, default the first chapter. */
export const CHAPTER = CHAPTERS.find((c) => c.id === query.get('chapter')) ?? CHAPTERS[0];

export const flag = (name: string): boolean => query.has(name);
