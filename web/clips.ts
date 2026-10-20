import { CHAPTERS } from '../src/chapters';
import type { Chapter } from '../src/kit/chapter';
import { FORMATS } from '../src/kit/format';
import { f } from '../src/kit/time';

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
    chapter: 'encounter',
    format: 'landscape',
    from: 0,
    to: 18.7,
    captions: true,
  },
  {
    id: 'encounter-square',
    title: 'One encounter, square',
    description: 'The whole encounter without text, for cards and social posts.',
    chapter: 'encounter',
    format: 'square',
    from: 0,
    to: 18.7,
    captions: false,
  },
  {
    id: 'scan',
    title: 'Phone over phone',
    description: "Ben scans Ana's code; the phones return and Ben is asked to confirm.",
    chapter: 'encounter',
    format: 'square',
    from: 1.6,
    to: 8.0,
    captions: false,
  },
  {
    id: 'credentials-to-contacts',
    title: 'Credentials become contacts',
    description: 'Both signed credentials jump into the contact list, first on Ana’s phone, then on Ben’s.',
    chapter: 'encounter',
    format: 'landscape',
    from: 14.8,
    to: 18.7,
    captions: false,
  },
];

export function clipChapter(clip: Clip): Chapter {
  const chapter = CHAPTERS.find((c) => c.id === clip.chapter);
  if (!chapter) throw new Error(`clip ${clip.id}: unknown chapter ${clip.chapter}`);
  return chapter;
}

export const clipSize = (clip: Clip) => (clip.format === 'square' ? FORMATS[1] : FORMATS[0]);
export const clipFrames = (clip: Clip) => ({ start: f(clip.from), end: f(clip.to) });
