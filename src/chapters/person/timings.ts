/**
 * Timings of chapter 02, in seconds on the chapter's timeline. Each step
 * ends before its beat's hold (index.ts), so the slides stop on a still.
 */
export const DURATION_S = 7.4;

export const T = {
  /** Ana's devices appear under her document, each with its own key */
  devices: { from: 0.4, to: 1.1 },
  keys: { from: 0.9, to: 1.4 },

  /** the document becomes two; one copy lands on each device */
  split: { from: 2.1, to: 3.5 },

  /** around the two devices the person takes shape */
  person: { from: 4.2, to: 4.9 },

  /** agent and relay, outside */
  outside: { from: 5.8, to: 6.4 },
} as const;
