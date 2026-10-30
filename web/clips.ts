import { CHAPTERS } from '../src/chapters';
import type { Chapter } from '../src/kit/chapter';
import { FORMATS } from '../src/kit/format';
import { f } from '../src/kit/time';
import { ENCOUNTER_AT, ENCOUNTER_CLEAR_AT } from '../src/chapters/relationship';
import { DURATION_S as IDENTITY_S } from '../src/chapters/identity/timings';
import { DURATION_S as PERSON_S } from '../src/chapters/person/timings';
import { DURATION_S as STARS_S } from '../src/chapters/relational-reading/timings';
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
    chapter: 'relationship',
    format: 'landscape',
    from: ENCOUNTER_CLEAR_AT,
    to: ENCOUNTER_AT + ENCOUNTER_S,
    captions: true,
  },
  {
    id: 'encounter-square',
    title: 'One encounter, square',
    description: 'The whole encounter without text, for cards and social posts.',
    chapter: 'relationship',
    format: 'square',
    from: ENCOUNTER_CLEAR_AT,
    to: ENCOUNTER_AT + ENCOUNTER_S,
    captions: false,
  },
  {
    id: 'scan',
    title: 'Phone over phone',
    description: "Ben scans Ana's code; the phones return and Ben is asked to confirm.",
    chapter: 'relationship',
    format: 'square',
    from: ENCOUNTER_AT + 1.6,
    to: ENCOUNTER_AT + 6.4,
    captions: false,
  },
  {
    id: 'credentials-to-contacts',
    title: 'Credentials become contacts',
    description: 'Both signed credentials jump into the contact list, first on Ana’s phone, then on Ben’s.',
    chapter: 'relationship',
    format: 'landscape',
    from: ENCOUNTER_AT + 13.2,
    to: ENCOUNTER_AT + ENCOUNTER_S,
    captions: false,
  },
  {
    id: 'seed-to-document',
    title: 'From magic words to her document',
    description: 'Twelve magic words become one seed, one anchor is derived for each context, and every anchor lands in one document.',
    chapter: 'identity',
    format: 'landscape',
    from: 0,
    to: IDENTITY_S,
    captions: true,
  },
  {
    id: 'document-to-devices',
    title: 'The person is the node',
    description: 'Her document becomes two copies, one on each of her devices; together they are the person.',
    chapter: 'person',
    format: 'landscape',
    from: 0,
    to: PERSON_S,
    captions: true,
  },
  {
    id: 'person-to-encounter',
    title: 'From a person to a meeting',
    description: 'The person contracts to a point, a second one appears, both take up a phone and the encounter begins.',
    chapter: 'relationship',
    format: 'landscape',
    from: 0,
    to: ENCOUNTER_AT + 1.5,
    captions: true,
  },
  {
    id: 'overlaid-stars',
    title: 'Trust is read from where you stand',
    description: 'Two stars laid on top of each other; what they share becomes two lists, contacts and groups in common.',
    chapter: 'relational-reading',
    format: 'landscape',
    from: 0,
    to: STARS_S,
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
