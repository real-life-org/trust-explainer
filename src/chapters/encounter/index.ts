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
    { id: 'scan', from: 1.6, hold: 7.7, caption: "Ben scans Ana's code, phone over phone" },
    { id: 'confirm', from: 8.0, hold: 11.4, caption: 'Ben confirms it is Ana and signs a credential for her' },
    { id: 'confirm-back', from: 11.8, hold: 15.3, caption: 'Ana confirms Ben back and signs one for him' },
    { id: 'contacts', from: 15.7, hold: 17.7, caption: 'The credentials become contacts on both phones' },
  ],
};
