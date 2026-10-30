import { joinParts, type Chapter, type Part } from '../../kit/chapter';
import { PRINCIPLES } from '../principles';
import { FromNetwork, FROM_NETWORK_S } from './FromNetwork';
import { OverlaidStars } from './OverlaidStars';
import { DURATION_S } from './timings';

const principle = PRINCIPLES['relational-reading'];

/** From chapter 03's network: it falls apart into Ana's star and Ben's star. */
const fromNetwork: Part = {
  Scene: FromNetwork,
  durationS: FROM_NETWORK_S,
  beats: [{ id: 'line', from: 0.3, hold: 2.05, caption: principle.line, emphasis: true, notes: principle.body }],
};

/** The two stars, laid on top of each other, and what they share. */
const stars: Part = {
  Scene: OverlaidStars,
  durationS: DURATION_S,
  beats: [
    { id: 'join', from: 0.3, hold: 2.0, caption: 'Ben lays his star over Ana’s: the same people and groups meet' },
    { id: 'fade', from: 2.3, hold: 3.2, caption: 'Everything else stays in the dark' },
    { id: 'order', from: 3.5, hold: 5.6, caption: 'What Ben can read: the contacts and groups they share', notes: principle.notes },
  ],
};

/**
 * Chapter 07 "Relational reading": chapter 03's network falls apart into
 * Ana's star and Ben's star, which stand apart; then Ben lays his over
 * hers. What they share appears where both reach the same people and groups;
 * everything else fades, and only two lists stay.
 */
export const relationalReading: Chapter = {
  id: 'relational-reading',
  composition: 'RelationalReading',
  kicker: principle.title,
  principle,
  ...joinParts([fromNetwork, stars]),
};
