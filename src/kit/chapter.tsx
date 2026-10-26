import React from 'react';
import { Sequence } from './timeline';
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
 * unnumbered and its caption quieter; an `emphasis` beat (a principle's
 * line) is unnumbered and its caption larger.
 */
export type Beat = {
  id: string;
  from: number;
  hold: number;
  caption: string;
  quiet?: boolean;
  emphasis?: boolean;
  /** what to say while this beat is on screen (deck speaker notes) */
  notes?: string;
};

/**
 * A principle of the Real Life Trust Protocol, as on its slide in the deck
 * "RLTP Core Principles": `title` is the kicker, `line` the leading
 * sentence, `body` the few sentences under it, `notes` what to say.
 */
export type Principle = { title: string; line: string; body: string; notes?: string };

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
  /** the principle this chapter tells, if any; its number comes from the outline */
  principle?: Principle;
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
    return { ...b, to, step: b.quiet || b.emphasis ? undefined : ++step };
  });
}

/**
 * A run of slides of one kind inside a chapter: its own scene and beats, in
 * seconds on its own timeline. `joinParts` lays parts end to end.
 * `overlapS` lets the scene run on that long into the next part, after its
 * last hold, so it can fade out under the next scene.
 */
export type Part = { Scene: React.FC; beats: Beat[]; durationS: number; overlapS?: number };

/**
 * Parts one after another as one chapter's scene, beats and length. Each
 * part starts where the one before ends; its beats are shifted by that
 * offset, and the first beat of every following part starts exactly at the
 * offset, so the last beat of the part before runs until then. Each part's
 * scene runs in its own Sequence with its own local time.
 */
export function joinParts(parts: Part[]): Pick<Chapter, 'Scene' | 'beats' | 'durationS'> {
  const offsets = parts.map((_, i) => parts.slice(0, i).reduce((s, p) => s + p.durationS, 0));
  const durationS = parts.reduce((s, p) => s + p.durationS, 0);
  const beats = parts.flatMap((part, i) =>
    part.beats.map((b, j) => ({
      ...b,
      from: i > 0 && j === 0 ? offsets[i] : offsets[i] + b.from,
      hold: offsets[i] + b.hold,
    })),
  );
  const Scene: React.FC = () => (
    <>
      {parts.map((part, i) => (
        <Sequence
          key={i}
          name={`part ${i + 1}`}
          from={f(offsets[i])}
          durationInFrames={Math.min(f(part.durationS + (part.overlapS ?? 0)), f(durationS) - f(offsets[i]))}
        >
          <part.Scene />
        </Sequence>
      ))}
    </>
  );
  return { Scene, beats, durationS };
}
