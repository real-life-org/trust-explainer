/**
 * Timings of the opening picture of chapter 03, in seconds on that part's
 * own timeline. Each step ends before its beat's hold (index.ts).
 */
export const PICTURE_S = 3.2;

/**
 * The picture ends on the encounter's own opening frame and stays on until
 * the encounter has risen into that same frame, so the hand-over is invisible.
 */
export const PICTURE_OVERLAP_S = 1.1;

/** the moment of the encounter, on its own timeline, the phones grow into: at rest, both codes showing */
export const ENCOUNTER_REST_S = 1.2;

export const P = {
  /** the person (end of chapter 02) contracts to one point */
  outside: { from: 0.3, to: 0.7 },
  contract: { from: 0.5, to: 1.5 },
  /** the point appears where the person has shrunk to, as the person vanishes */
  anaDot: { from: 1.2, to: 1.55 },

  /** a second point: Ben */
  benDot: { from: 2.2, to: 2.7 },

  /** both points become phones, already inside the encounter's first step */
  phones: { from: 3.25, to: 4.1 },

  /** hands over to the encounter once it shows the same frame */
  out: { from: PICTURE_S + PICTURE_OVERLAP_S - 0.1, to: PICTURE_S + PICTURE_OVERLAP_S },
} as const;
