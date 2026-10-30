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

/** Timings of the closing part of chapter 03, on that part's own timeline. */
export const NETWORK_S = 7.9;

export const N = {
  /** the phones, as the encounter left them, contract into two points */
  contract: { from: 0.2, to: 1.1 },
  dots: { from: 0.8, to: 1.2 },

  /** the two become a linked pair inside the network */
  move: { from: 1.4, to: 2.3 },
  link: { from: 2.1, to: 2.6 },

  /** the network spreads outward from the two */
  /** waves outward from Ana and Ben; only the start counts here, Network.tsx schedules each link from it */
  grow: { from: 3.3, to: 5.6 },

  /** where links grow dense, groups appear */
  groups: { from: 6.4, to: 7.1 },
} as const;

/** the moment of the encounter, on its own timeline, the closing part starts from: both contacts made */
export const ENCOUNTER_END_S = 16.1;
