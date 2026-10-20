import { useVideoConfig } from './timeline';

/**
 * The output formats every chapter is rendered in. A chapter's composition
 * id is its `composition` name plus the format's suffix.
 */
export const FORMATS = [
  { suffix: '', width: 1920, height: 1080 },
  { suffix: 'Square', width: 1080, height: 1080 },
] as const;

/** Stage metrics shared by all chapters: the caption line. */
export type Format = {
  square: boolean;
  captionY: number;
  captionSize: number;
};

export function useFormat(): Format {
  const { width, height } = useVideoConfig();
  const square = width === height;
  return square
    ? { square, captionY: 132, captionSize: 30 }
    : { square, captionY: 112, captionSize: 34 };
}
