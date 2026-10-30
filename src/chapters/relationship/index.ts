import { joinParts, type Chapter, type Part } from '../../kit/chapter';
import { encounterPart } from '../encounter';
import { PRINCIPLES } from '../principles';
import { PersonToPoints } from './PersonToPoints';
import { PICTURE_OVERLAP_S, PICTURE_S } from './timings';

const principle = PRINCIPLES['relationship'];

/** From chapter 02's person to two points; the points grow into the encounter's phones as it starts. */
const picturePart: Part = {
  Scene: PersonToPoints,
  durationS: PICTURE_S,
  overlapS: PICTURE_OVERLAP_S,
  beats: [
    { id: 'line', from: 0.3, hold: 1.75, caption: principle.line, emphasis: true, notes: principle.body },
    { id: 'ben', from: 2.1, hold: 2.85, caption: 'Ana meets Ben' },
  ],
};

const PARTS: Part[] = [picturePart, encounterPart];

/** Seconds on the chapter's timeline where the encounter starts (clips are cut from here on). */
export const ENCOUNTER_AT = PARTS.slice(0, PARTS.indexOf(encounterPart)).reduce((s, p) => s + p.durationS, 0);
/** Where the encounter is clear of the picture fading out (looping clips start here). */
export const ENCOUNTER_CLEAR_AT = ENCOUNTER_AT + (PARTS[PARTS.indexOf(encounterPart) - 1]?.overlapS ?? 0);
/** Index of the encounter's first beat in the chapter (old `#encounter/k` links land on k + this). */
export const ENCOUNTER_BEAT = PARTS.slice(0, PARTS.indexOf(encounterPart)).reduce((n, p) => n + p.beats.length, 0);

/**
 * Chapter 03 "Relationship": the person of chapter 02 contracts to a point,
 * a second person appears, both take up a phone, and the two meet: one
 * encounter, phone over phone.
 */
export const relationship: Chapter = {
  id: 'relationship',
  composition: 'Relationship',
  kicker: principle.title,
  principle,
  ...joinParts(PARTS),
};
