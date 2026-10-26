import { joinParts, type Chapter, type Part } from '../../kit/chapter';
import { encounterPart } from '../encounter';

const PARTS: Part[] = [encounterPart];

/** Seconds on the chapter's timeline where the encounter starts (clips are cut from here on). */
export const ENCOUNTER_AT = PARTS.slice(0, PARTS.indexOf(encounterPart)).reduce((s, p) => s + p.durationS, 0);
/** Index of the encounter's first beat in the chapter (old `#encounter/k` links land on k + this). */
export const ENCOUNTER_BEAT = PARTS.slice(0, PARTS.indexOf(encounterPart)).reduce((n, p) => n + p.beats.length, 0);

/** Chapter 04 "No issuer": two people make the proof of their meeting themselves. */
export const noIssuer: Chapter = {
  id: 'no-issuer',
  composition: 'NoIssuer',
  kicker: 'No issuer',
  ...joinParts(PARTS),
};
