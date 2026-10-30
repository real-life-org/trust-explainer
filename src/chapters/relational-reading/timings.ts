/**
 * Timings of chapter 07, in seconds on the chapter's timeline. Each step
 * ends before its beat's hold (index.ts), so the slides stop on a still.
 */
export const DURATION_S = 8.9;

export const T = {
  /** Ana's star: her centre, then her rays and contacts */
  anaHub: { from: 0.3, to: 0.7 },
  anaRays: { from: 0.55, to: 1.7 },

  /** Ben's star beside hers */
  benHub: { from: 2.3, to: 2.7 },
  benRays: { from: 2.5, to: 3.5 },

  /** the people both reach light up */
  shared: { from: 4.1, to: 5.0 },

  /** everyone else fades */
  fade: { from: 5.6, to: 6.3 },

  /** the shared people step into a row between the two and take their names */
  gather: { from: 6.9, to: 7.9 },
  names: { from: 7.65, to: 8.2 },
} as const;
