/**
 * Timings of the opening picture of chapter 03, in seconds on that part's
 * own timeline. Each step ends before its beat's hold (index.ts).
 */
export const PICTURE_S = 4.8;

/** how long the picture stays on into the encounter, under the phones */
export const PICTURE_OVERLAP_S = 0.25;

export const P = {
  /** the person (end of chapter 02) contracts to one point */
  outside: { from: 0.3, to: 0.7 },
  contract: { from: 0.5, to: 1.5 },
  /** the point appears where the person has shrunk to, as the person vanishes */
  anaDot: { from: 1.2, to: 1.55 },

  /** a second point: Ben */
  benDot: { from: 2.2, to: 2.7 },

  /** both points become phones */
  phones: { from: 3.3, to: 4.3 },

  /** fades under the encounter's phones */
  out: { from: PICTURE_S, to: PICTURE_S + PICTURE_OVERLAP_S },
} as const;
