import { CHAPTERS } from '../src/chapters';
import type { Chapter } from '../src/kit/chapter';
import { beatSpans } from '../src/kit/chapter';
import { f } from '../src/kit/time';

/** The whole film: every chapter in telling order, back to back. */
export type FilmPart = { chapter: Chapter; start: number; frames: number };

export const FILM: FilmPart[] = CHAPTERS.reduce<FilmPart[]>((parts, chapter) => {
  const prev = parts[parts.length - 1];
  parts.push({ chapter, start: prev ? prev.start + prev.frames : 0, frames: f(chapter.durationS) });
  return parts;
}, []);

export const FILM_FRAMES = FILM.reduce((n, p) => n + p.frames, 0);

/** The chapter and its local frame at a frame of the film. */
export function partAt(frame: number): { part: FilmPart; local: number } {
  const part = FILM.find((p) => frame < p.start + p.frames) ?? FILM[FILM.length - 1];
  return { part, local: Math.min(frame - part.start, part.frames - 1) };
}

/** Where each beat's hold lies in the film, for marks on the timeline. */
export const FILM_HOLDS = FILM.flatMap((p) => beatSpans(p.chapter).map((b) => p.start + f(b.hold)));
