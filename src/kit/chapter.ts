import type React from 'react';
import { f } from './time';

/** Frames a caption takes to fade in, and to fade out at the end of its beat. */
export const CAPTION_FADE = 8;

/**
 * One step of a chapter. Its caption is on the stage from `from` (seconds)
 * until the next beat starts, or the chapter ends. `hold` is the moment the
 * step's result is complete and the scene is at rest: the deck stops there
 * and waits for the next click, so nothing may move between `hold` and the
 * next beat's `from`.
 * Beats are numbered in order; a `quiet` beat (opening or closing line) is
 * unnumbered and its caption quieter.
 */
export type Beat = {
  id: string;
  from: number;
  hold: number;
  caption: string;
  quiet?: boolean;
  /** what to say while this beat is on screen (deck speaker notes) */
  notes?: string;
};

/**
 * A chapter of the explainer: one scene, its beats, and the line in the top
 * left corner. Video, deck and website graphics all render chapters.
 */
export type Chapter = {
  id: string;
  /** composition name, e.g. "Encounter" -> "Encounter", "EncounterSquare" */
  composition: string;
  /** the chapter's short name, e.g. "One encounter", shown with its slides and in the player */
  kicker: string;
  durationS: number;
  beats: Beat[];
  /** the scene; rendered on the shared stage, below the captions */
  Scene: React.FC;
};

export type BeatSpan = Beat & { to: number; step?: number };

/**
 * Beats with their end time and step number. Throws if a hold lies outside
 * its beat or where the caption is already fading out.
 */
export function beatSpans(chapter: Chapter): BeatSpan[] {
  let step = 0;
  return chapter.beats.map((b, i) => {
    const to = chapter.beats[i + 1]?.from ?? chapter.durationS;
    if (f(b.hold) < f(b.from) || f(b.hold) >= f(to) - CAPTION_FADE) {
      throw new Error(`${chapter.id}/${b.id}: hold ${b.hold}s must lie in [${b.from}s, ${to}s) before the caption fades`);
    }
    return { ...b, to, step: b.quiet ? undefined : ++step };
  });
}
