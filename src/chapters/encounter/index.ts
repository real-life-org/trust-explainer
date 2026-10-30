import type { Part } from '../../kit/chapter';
import { Encounter } from './Encounter';
import { DURATION_S } from './timings';

/**
 * Two people meet, verify each other phone over phone, and become
 * contacts. A part of chapter 03 "Relationship"; beats in seconds on the
 * part's own timeline.
 */
export const encounterPart: Part = {
  Scene: Encounter,
  durationS: DURATION_S,
  beats: [
    { id: 'start', from: 0.3, hold: 1.2, caption: 'Ana and Ben meet. Each phone shows its code.', quiet: true },
    { id: 'scan', from: 1.6, hold: 6.1, caption: "Ben scans Ana's code, phone over phone" },
    { id: 'confirm', from: 6.4, hold: 9.8, caption: 'Ben confirms it is Ana and signs a credential for her' },
    { id: 'confirm-back', from: 10.2, hold: 13.7, caption: 'Ana confirms Ben back and signs one for him' },
    { id: 'contacts', from: 14.1, hold: 16.1, caption: 'The credentials become contacts on both phones' },
  ],
};
