import { joinParts, type Chapter, type Part } from '../../kit/chapter';
import { PRINCIPLES } from '../principles';
import { FromNetwork, FROM_NETWORK_S } from './FromNetwork';
import { OverlaidStars } from './OverlaidStars';
import { DURATION_S } from './timings';

const principle = PRINCIPLES['relational-reading'];

/** From chapter 03's network: only Ana and Ben stay and become the centres of two stars. */
const fromNetwork: Part = {
  Scene: FromNetwork,
  durationS: FROM_NETWORK_S,
  beats: [{ id: 'line', from: 0.3, hold: 1.9, caption: principle.line, emphasis: true, notes: principle.body }],
};

/** The two stars, laid on top of each other, and what they share. */
const stars: Part = {
  Scene: OverlaidStars,
  durationS: DURATION_S,
  beats: [
    { id: 'ana', from: 0.3, hold: 1.9, caption: 'Ana’s star: the people and groups she knows' },
    { id: 'ben', from: 2.3, hold: 3.9, caption: 'Ben has a star of his own' },
    { id: 'join', from: 4.2, hold: 5.9, caption: 'Laid on top, the same people and groups meet' },
    { id: 'fade', from: 6.2, hold: 7.1, caption: 'Everything else stays in the dark' },
    { id: 'order', from: 7.4, hold: 9.5, caption: 'What Ben can read: the contacts and groups they share', notes: principle.notes },
  ],
};

/**
 * Chapter 07 "Relational reading": out of chapter 03's network Ana and Ben
 * become the centres of two stars that stand apart; then Ben lays his over
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
