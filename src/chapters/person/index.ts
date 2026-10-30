import type { Chapter } from '../../kit/chapter';
import { PRINCIPLES } from '../principles';
import { DocumentToDevices } from './DocumentToDevices';
import { DURATION_S } from './timings';

const principle = PRINCIPLES['person'];

/**
 * Chapter 02 "Person": Ana's document, where chapter 01 left it, becomes two
 * copies that land on her phone and her laptop; together they are the person.
 * Agent and relay may help, outside.
 */
export const person: Chapter = {
  id: 'person',
  composition: 'Person',
  kicker: principle.title,
  principle,
  durationS: DURATION_S,
  Scene: DocumentToDevices,
  beats: [
    { id: 'line', from: 0.3, hold: 1.6, caption: principle.line, emphasis: true, notes: principle.body },
    { id: 'copies', from: 2.0, hold: 3.7, caption: 'Her document becomes two, one on each of her devices' },
    { id: 'person', from: 4.1, hold: 5.4, caption: 'Together they are the person' },
    { id: 'outside', from: 5.9, hold: 7.0, caption: 'Agent and relay may help. They stay outside', notes: principle.notes },
  ],
};
