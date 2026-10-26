import type { Chapter, Principle } from '../kit/chapter';
import { PRINCIPLES, type PrincipleId } from './principles';
import { noIssuer } from './no-issuer';

/** One principle of the deck and, once it is built, its chapter. */
export type OutlineEntry = { id: PrincipleId; principle: Principle; chapter?: Chapter };

const BUILT: Partial<Record<PrincipleId, Chapter>> = { 'no-issuer': noIssuer };

/**
 * Every principle in deck order. Entries without a chapter are placeholders:
 * no scene, no beats, and they never reach the slides or the film.
 */
export const OUTLINE: OutlineEntry[] = (Object.keys(PRINCIPLES) as PrincipleId[]).map((id) => ({
  id,
  principle: PRINCIPLES[id],
  chapter: BUILT[id],
}));

/** A principle's number from its place in the outline, two digits: "04". */
export function principleNumber(id: string): string | undefined {
  const i = OUTLINE.findIndex((e) => e.id === id);
  return i < 0 ? undefined : String(i + 1).padStart(2, '0');
}

/** How a chapter is labelled with its slides and in the player: "04 · No issuer", or its kicker alone. */
export function chapterLabel(chapter: Chapter): string {
  const n = chapter.principle ? principleNumber(chapter.id) : undefined;
  return n ? `${n} · ${chapter.kicker}` : chapter.kicker;
}
