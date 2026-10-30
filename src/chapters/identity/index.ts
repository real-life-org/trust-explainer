import type { Chapter } from '../../kit/chapter';
import { PRINCIPLES } from '../principles';
import { SeedToDocument } from './SeedToDocument';
import { DURATION_S } from './timings';

const principle = PRINCIPLES['identity'];

/**
 * Chapter 01 "Identity": twelve magic words become one seed, the seed derives
 * one anchor per context, and every anchor gathers in Ana's document, which
 * chapter 02 starts from.
 */
export const identity: Chapter = {
  id: 'identity',
  composition: 'Identity',
  kicker: principle.title,
  principle,
  durationS: DURATION_S,
  Scene: SeedToDocument,
  beats: [
    { id: 'line', from: 0.3, hold: 1.7, caption: principle.line, emphasis: true, notes: principle.body },
    { id: 'seed', from: 2.0, hold: 3.3, caption: 'Twelve magic words become one seed' },
    { id: 'anchors', from: 3.6, hold: 6.5, caption: 'From it, one anchor for each relationship, group and appearance' },
    { id: 'document', from: 6.9, hold: 8.9, caption: 'Every anchor lands in one document: hers', notes: principle.notes },
  ],
};
