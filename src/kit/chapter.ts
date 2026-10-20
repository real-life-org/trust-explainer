import type React from 'react';

/**
 * One step of a chapter: a caption on the stage from `from` (seconds) until
 * the next beat starts, or the chapter ends. In the deck, the end of a beat
 * is where playback stops and waits for the next click.
 * Beats are numbered in order; a `closing` beat is unnumbered and quieter.
 */
export type Beat = {
  id: string;
  from: number;
  caption: string;
  closing?: boolean;
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
  /** the small line in the header, e.g. "One encounter" */
  kicker: string;
  durationS: number;
  beats: Beat[];
  /** the scene; rendered on the shared stage, below the captions */
  Scene: React.FC;
};

export type BeatSpan = Beat & { to: number; step?: number };

/** Beats with their end time and step number. */
export function beatSpans(chapter: Chapter): BeatSpan[] {
  let step = 0;
  return chapter.beats.map((b, i) => ({
    ...b,
    to: chapter.beats[i + 1]?.from ?? chapter.durationS,
    step: b.closing ? undefined : ++step,
  }));
}
