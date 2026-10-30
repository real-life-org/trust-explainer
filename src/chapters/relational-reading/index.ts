import type { Chapter } from '../../kit/chapter';
import { PRINCIPLES } from '../principles';
import { OverlaidStars } from './OverlaidStars';
import { DURATION_S } from './timings';

const principle = PRINCIPLES['relational-reading'];

/**
 * Chapter 07 "Relational reading": Ana's star and Ben's star side by side.
 * What they have in common appears only where both reach the same people;
 * everyone else fades, and the people both know step forward by name.
 */
export const relationalReading: Chapter = {
  id: 'relational-reading',
  composition: 'RelationalReading',
  kicker: principle.title,
  principle,
  durationS: DURATION_S,
  Scene: OverlaidStars,
  beats: [
    { id: 'line', from: 0.3, hold: 1.8, caption: principle.line, emphasis: true, notes: principle.body },
    { id: 'ben', from: 2.2, hold: 3.6, caption: 'Ben’s star stands beside Ana’s' },
    { id: 'shared', from: 4.0, hold: 5.1, caption: 'Where both reach the same people, those light up' },
    { id: 'fade', from: 5.5, hold: 6.4, caption: 'Everyone else stays in the dark' },
    { id: 'names', from: 6.8, hold: 8.3, caption: 'What Ben reads: the people he knows himself', notes: principle.notes },
  ],
};
