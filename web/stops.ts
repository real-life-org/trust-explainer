import type { Chapter } from '../src/kit/chapter';
import { beatSpans } from '../src/kit/chapter';
import { FPS } from '../src/kit/time';

/** Where the deck holds in a chapter: each beat's `hold`, in (fractional) frames. */
export function stopsOf(chapter: Chapter): number[] {
  return beatSpans(chapter).map((b) => b.hold * FPS);
}

/** A place in the deck: chapter index and beat index (0 = the chapter's first beat). */
export type Pos = { c: number; k: number };
