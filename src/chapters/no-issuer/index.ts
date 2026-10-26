import { joinParts, type Chapter, type Part } from '../../kit/chapter';
import { encounterPart } from '../encounter';
import { PRINCIPLES } from '../principles';
import { NoIssuerPicture } from './NoIssuerPicture';
import { PICTURE_OVERLAP_S, PICTURE_S } from './timings';

const principle = PRINCIPLES['no-issuer'];

/** The deck's picture, built in three steps: the line, issued, made. */
const picturePart: Part = {
  Scene: NoIssuerPicture,
  durationS: PICTURE_S,
  overlapS: PICTURE_OVERLAP_S,
  beats: [
    { id: 'line', from: 0.3, hold: 1.4, caption: principle.line, emphasis: true, notes: principle.body },
    { id: 'issued', from: 1.8, hold: 3.0, caption: 'Where trust is issued, everyone hangs on one party' },
    { id: 'made', from: 3.4, hold: 4.8, caption: 'Where trust is made, people link up pair by pair', notes: principle.notes },
  ],
};

const PARTS: Part[] = [picturePart, encounterPart];

/** Seconds on the chapter's timeline where the encounter starts (clips are cut from here on). */
export const ENCOUNTER_AT = PARTS.slice(0, PARTS.indexOf(encounterPart)).reduce((s, p) => s + p.durationS, 0);
/** Index of the encounter's first beat in the chapter (old `#encounter/k` links land on k + this). */
export const ENCOUNTER_BEAT = PARTS.slice(0, PARTS.indexOf(encounterPart)).reduce((n, p) => n + p.beats.length, 0);

/**
 * Chapter 04 "No issuer": the deck's picture, then one encounter in which
 * two people make the proof of their meeting themselves.
 */
export const noIssuer: Chapter = {
  id: 'no-issuer',
  composition: 'NoIssuer',
  kicker: principle.title,
  principle,
  ...joinParts(PARTS),
};
