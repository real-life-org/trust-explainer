import { CHAPTERS } from '../src/chapters';
import type { Chapter } from '../src/kit/chapter';
import { FORMATS } from '../src/kit/format';
import { f } from '../src/kit/time';
import { ENCOUNTER_AT, ENCOUNTER_CLEAR_AT } from '../src/chapters/no-issuer';
import { DURATION_S as ENCOUNTER_S } from '../src/chapters/encounter/timings';

/**
 * An animated graphic for websites: a stretch of one chapter, looped, in
 * one format, with or without captions. Clips are cut from
 * the chapters, so they always match the deck and the video.
 */
export type Clip = {
  id: string;
  title: string;
  description: string;
  chapter: string;
  format: 'landscape' | 'square';
  /** seconds on the chapter's timeline */
  from: number;
  to: number;
  captions: boolean;
};

export const CLIPS: Clip[] = [
  {
    id: 'encounter',
    title: 'One encounter',
    description: 'The whole encounter with captions: scan, both confirmations, the new contact.',
    chapter: 'no-issuer',
    format: 'landscape',
    from: ENCOUNTER_CLEAR_AT,
    to: ENCOUNTER_AT + ENCOUNTER_S,
    captions: true,
  },
  {
    id: 'encounter-square',
    title: 'One encounter, square',
    description: 'The whole encounter without text, for cards and social posts.',
    chapter: 'no-issuer',
    format: 'square',
    from: ENCOUNTER_CLEAR_AT,
    to: ENCOUNTER_AT + ENCOUNTER_S,
    captions: false,
  },
  {
    id: 'scan',
    title: 'Phone over phone',
    description: "Ben scans Ana's code; the phones return and Ben is asked to confirm.",
    chapter: 'no-issuer',
    format: 'square',
    from: ENCOUNTER_AT + 1.6,
    to: ENCOUNTER_AT + 8.0,
    captions: false,
  },
  {
    id: 'credentials-to-contacts',
    title: 'Credentials become contacts',
    description: 'Both signed credentials jump into the contact list, first on Ana’s phone, then on Ben’s.',
    chapter: 'no-issuer',
    format: 'landscape',
    from: ENCOUNTER_AT + 14.8,
    to: ENCOUNTER_AT + ENCOUNTER_S,
    captions: false,
  },
  {
    id: 'no-issuer-picture',
    title: 'Issued or made',
    description: 'The picture of principle 04: trust tied to one issuer, and trust made pair by pair.',
    chapter: 'no-issuer',
    format: 'landscape',
    from: 0,
    to: ENCOUNTER_AT,
    captions: true,
  },
];

export function clipChapter(clip: Clip): Chapter {
  const chapter = CHAPTERS.find((c) => c.id === clip.chapter);
  if (!chapter) throw new Error(`clip ${clip.id}: unknown chapter ${clip.chapter}`);
  return chapter;
}

export const clipSize = (clip: Clip) => (clip.format === 'square' ? FORMATS[1] : FORMATS[0]);
export const clipFrames = (clip: Clip) => ({ start: f(clip.from), end: f(clip.to) });
