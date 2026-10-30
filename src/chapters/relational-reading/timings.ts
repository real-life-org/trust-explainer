/**
 * Timings of chapter 07's stars, in seconds on that part's own timeline.
 * The stars start complete and apart (the opening part has split the
 * network into them). Each step ends before its beat's hold (index.ts).
 */
export const DURATION_S = 6.4;

export const T = {
  /** Ben lays his star over Ana's; the shared people and groups meet and light up */
  join: { from: 0.4, to: 1.4 },
  light: { from: 1.35, to: 1.9 },

  /** everything else fades */
  fade: { from: 2.4, to: 3.0 },

  /** the stars dissolve; the shared items move into two lists and take their names */
  dissolve: { from: 3.6, to: 4.2 },
  order: { from: 3.7, to: 4.9 },
  heads: { from: 4.5, to: 5.0 },
  names: { from: 4.6, to: 5.3 },
} as const;
