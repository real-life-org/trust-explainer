/**
 * Timings of chapter 01, in seconds on the chapter's timeline. Each step
 * ends before its beat's hold (index.ts), so the slides stop on a still.
 */
export const DURATION_S = 9.4;

export const T = {
  /** twelve magic words appear */
  words: { from: 0.3, to: 1.5 },

  /** they fly into one seed */
  gather: { from: 2.1, to: 2.9 },
  seed: { from: 2.6, to: 3.1 },

  /** one anchor toward each context: derivation, the anchor, the context */
  anchors: { from: 3.7, to: 6.3 },

  /** the star dissolves; every anchor gathers in Ana's document */
  dissolve: { from: 7.0, to: 7.6 },
  docCard: { from: 7.0, to: 7.5 },
  fly: { from: 7.2, to: 8.3 },
  names: { from: 7.9, to: 8.6 },
} as const;
