/**
 * Timings of chapter 02, in seconds on the chapter's timeline. Each step
 * ends before its beat's hold (index.ts), so the slides stop on a still.
 */
export const DURATION_S = 6.9;

/** how far (box units) the devices move up to stand in the middle of the stage once the copies have landed */
export const CENTER_SHIFT = 100;

export const T = {
  /** Ana's devices appear under her document, each with its own key */
  devices: { from: 0.4, to: 1.1 },
  keys: { from: 0.9, to: 1.4 },

  /** the document becomes two; one copy lands on each device */
  split: { from: 2.1, to: 3.3 },

  /** at the same time, the devices move to the middle */
  center: { from: 2.1, to: 3.3 },

  /** around them the person takes shape */
  person: { from: 4.1, to: 4.7 },

  /** agent and relay, outside */
  outside: { from: 5.4, to: 6.0 },
} as const;
