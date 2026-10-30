/**
 * Timings of chapter 07, in seconds on the chapter's timeline. Each step
 * ends before its beat's hold (index.ts), so the slides stop on a still.
 */
export const DURATION_S = 10.2;

export const T = {
  /** Ana's star, standing apart on the left */
  anaHub: { from: 0.3, to: 0.7 },
  anaRays: { from: 0.5, to: 1.6 },

  /** Ben's star, standing apart on the right */
  benHub: { from: 2.4, to: 2.8 },
  benRays: { from: 2.6, to: 3.6 },

  /** Ben lays his star over Ana's; the shared people and groups meet and light up */
  join: { from: 4.3, to: 5.3 },
  light: { from: 5.25, to: 5.8 },

  /** everything else fades */
  fade: { from: 6.3, to: 6.9 },

  /** the stars dissolve; the shared items move into two lists and take their names */
  dissolve: { from: 7.5, to: 8.1 },
  order: { from: 7.6, to: 8.8 },
  heads: { from: 8.4, to: 8.9 },
  names: { from: 8.5, to: 9.2 },
} as const;
