import { beatSpans, type Chapter } from '../src/kit/chapter';
import { CAPTION_FADE } from '../src/kit/Caption';
import { f } from '../src/kit/time';

/**
 * Where the deck holds in a chapter, one frame per beat: the last frame
 * before the beat's caption starts to fade out, so the caption is still
 * fully visible while the speaker talks.
 */
export function stopsOf(chapter: Chapter): number[] {
  return beatSpans(chapter).map((b) => Math.max(f(b.from), f(b.to) - CAPTION_FADE - 1));
}

/** A place in the deck: chapter index, and the last beat reached (-1 = chapter start). */
export type Pos = { c: number; k: number };
