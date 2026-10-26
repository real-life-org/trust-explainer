/**
 * Timings of the picture of chapter 04, in seconds on the picture part's own
 * timeline. Each build ends before its beat's hold (index.ts).
 */
export const PICTURE_S = 5.4;

/** how long the picture stays on into the encounter, fading out under the phones */
export const PICTURE_OVERLAP_S = 0.2;

export const P = {
  /** both panel frames appear with the principle's line */
  frames: { from: 0.3, to: 1.1 },

  /** left, issued: the issuer appears, the spokes reach out, the people hang on them, then the label */
  issuer: 1.9,
  spokes: { from: 2.05, to: 2.6 },
  enclosed: { from: 2.2, to: 2.75 },
  issuedLabel: { from: 2.45, to: 2.95 },

  /** right, made: people appear, the links between pairs draw, then the label */
  people: { from: 3.5, to: 4.0 },
  links: { from: 3.75, to: 4.4 },
  madeLabel: { from: 4.2, to: 4.75 },

  /** fades out after the last hold, while the next part starts */
  out: { from: PICTURE_S, to: PICTURE_S + PICTURE_OVERLAP_S },
} as const;
