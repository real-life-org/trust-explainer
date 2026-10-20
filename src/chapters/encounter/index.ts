import type { Chapter } from '../../kit/chapter';
import { Encounter } from './Encounter';
import { DURATION_S } from './timings';

/** Chapter: two people meet, verify each other phone over phone, and become contacts. */
export const encounter: Chapter = {
  id: 'encounter',
  composition: 'Encounter',
  kicker: 'One encounter',
  durationS: DURATION_S,
  Scene: Encounter,
  beats: [
    { id: 'qr', from: 0.4, caption: 'Ana shows her code' },
    { id: 'scan', from: 2.0, caption: 'Ben scans it, phone over phone' },
    { id: 'confirm', from: 4.8, caption: 'Ben confirms it is Ana and signs a credential for her' },
    { id: 'confirm-back', from: 7.8, caption: 'Ana confirms Ben back and signs one for him' },
    { id: 'contacts', from: 11.0, caption: 'A new contact on both phones' },
    { id: 'trust', from: 12.9, caption: 'Trust is a separate act: Ana marks Ben as trusted' },
    { id: 'outro', from: 15.6, caption: 'Key control, freshness and deliberate recognition.', closing: true },
  ],
};
