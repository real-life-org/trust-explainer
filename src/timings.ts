/**
 * All timings of the Encounter composition, in seconds on the absolute
 * timeline. Retime a step here; every component reads from this file.
 *
 * Steps 3 to 7 overlap with the credential exchange (step 8) on purpose.
 */
export const FPS = 30;
export const DURATION_S = 18;
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);

/** seconds -> frames */
export const f = (seconds: number): number => Math.round(seconds * FPS);

export const T = {
  /** phones fade and rise into place */
  intro: { from: 0.0, to: 1.0 },

  /** 1. Ana's phone shows her code (stays visible under Ben's phone) */
  qrOnAna: { from: 0.3, to: 7.9 },

  /** Ben's phone first shows his own code; he taps "Scan code" at `tap` */
  codeOnBen: { from: 0.3, to: 1.6, tap: 1.2 },

  /** Ben's phone opens the scanner */
  scannerOnBen: { from: 1.4, to: 5.0 },

  /** 2. Ben's phone travels over Ana's; Ana's phone takes `anaShare` of it */
  scanMove: { from: 2.0, to: 4.2, anaShare: 0.45 },

  /** the scanner recognises the code (frame turns green) */
  recognized: 4.5,

  /** 3. confirmation on Ben: "Is this the person in front of you?", tap = Confirm */
  confirmOnBen: { from: 4.8, to: 11.1, tap: 5.8 },

  /** 4. Ben's phone moves away, both phones glide home */
  moveAway: { from: 6.4, to: 7.6 },

  /** 8a. credential "Ben -> Ana" flies from Ben to Ana */
  credBenToAna: { from: 6.9, to: 8.3 },

  /** 5. counter-confirmation on Ana, tap = Confirm */
  confirmBackOnAna: { from: 7.8, to: 11.1, tap: 9.4 },

  /** 8b. credential "Ana -> Ben" flies from Ana to Ben */
  credAnaToBen: { from: 9.6, to: 11.0 },

  /** 6. contact list on both phones, the new row slides in at `newRow` */
  contacts: { from: 11.0, to: DURATION_S, newRow: 11.5 },

  /** 7. trust act on Ana: the button is highlighted from `from`, tapped at `tap` */
  trust: { from: 12.9, tap: 13.9 },

  /** closing line */
  outro: { from: 15.6, to: DURATION_S },

  /** caption line at the top, one per step */
  captions: {
    qr: { from: 0.4, to: 2.0 },
    scan: { from: 2.0, to: 4.8 },
    confirm: { from: 4.8, to: 7.8 },
    confirmBack: { from: 7.8, to: 11.0 },
    contacts: { from: 11.0, to: 12.9 },
    trust: { from: 12.9, to: 15.6 },
    outro: { from: 15.6, to: DURATION_S },
  },
} as const;
