import type { Chapter } from '../../kit/chapter';
import { PRINCIPLES } from '../principles';
import { OverlaidStars } from './OverlaidStars';
import { DURATION_S } from './timings';

const principle = PRINCIPLES['relational-reading'];

/**
 * Chapter 07 "Relational reading": Ana's star and Ben's star stand apart,
 * then Ben lays his over hers. What they share appears where both reach the
 * same people and groups; everything else fades, and only two lists stay.
 */
export const relationalReading: Chapter = {
  id: 'relational-reading',
  composition: 'RelationalReading',
  kicker: principle.title,
  principle,
  durationS: DURATION_S,
  Scene: OverlaidStars,
  beats: [
    { id: 'line', from: 0.3, hold: 1.9, caption: principle.line, emphasis: true, notes: principle.body },
    { id: 'ben', from: 2.3, hold: 3.9, caption: 'Ben has a star of his own' },
    { id: 'join', from: 4.2, hold: 5.9, caption: 'Laid on top, the same people and groups meet' },
    { id: 'fade', from: 6.2, hold: 7.1, caption: 'Everything else stays in the dark' },
    { id: 'order', from: 7.4, hold: 9.5, caption: 'What Ben can read: the contacts and groups they share', notes: principle.notes },
  ],
};
