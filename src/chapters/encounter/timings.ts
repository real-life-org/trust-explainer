/**
 * All animation timings of the encounter chapter, in seconds on the
 * chapter's timeline. Retime a step here; every component reads from this
 * file. The captions and the holds are the chapter's beats (index.ts).
 *
 * Each step ends at rest before the next one starts, so the deck can stop
 * on its result: start (both codes), 1 scan (ends with the phones home and
 * the confirmation on Ben's phone), 2 Ben confirms (ends with the
 * confirmation on Ana's phone), 3 Ana confirms back,
 * 4 the credentials become contacts.
 */
export const DURATION_S = 18.7;

export const T = {
  /** phones fade and rise into place */
  intro: { from: 0.0, to: 1.0 },

  /** Ana's phone shows her code until she is asked to confirm back (stays visible under Ben's phone) */
  qrOnAna: { from: 0.3, to: 11.1 },

  /** Ben's phone first shows his own code; he taps "Scan code" at `tap` */
  codeOnBen: { from: 0.3, to: 2.5, tap: 2.1 },

  /** 1. Ben's phone opens the scanner */
  scannerOnBen: { from: 2.3, to: 7.4 },

  /** 1. Ben's phone travels over Ana's; Ana's phone takes `anaShare` of it */
  scanMove: { from: 2.8, to: 5.0, anaShare: 0.45 },

  /** 1. the scanner recognises the code (frame turns green) */
  recognized: 5.3,

  /** 1. Ben's phone moves away, both phones glide home; the viewfinder closes as it sets off */
  moveAway: { from: 5.9, to: 7.1 },

  /** 1./2. confirmation on Ben, once his phone is home: "Is this the person in front of you?", tap = Confirm */
  confirmOnBen: { from: 7.2, to: 15.8, tap: 8.8 },

  /** 2. credential "Ben -> Ana" flies from Ben to Ana and waits at the bottom of her screen */
  credBenToAna: { from: 9.3, to: 10.7 },

  /** 2./3. counter-confirmation on Ana, once Ben's credential has landed; tap = Confirm */
  confirmBackOnAna: { from: 11.0, to: 15.8, tap: 13.0 },

  /** 3. credential "Ana -> Ben" flies from Ana to Ben and waits at the bottom of his screen */
  credAnaToBen: { from: 13.2, to: 14.6 },

  /** 4. contact list on both phones */
  contacts: { from: 15.7, to: DURATION_S },

  /**
   * 4. each waiting credential jumps onto the new row's place and becomes
   * that row: first on Ana's phone, then on Ben's
   */
  credToRow: { A: { from: 16.0, to: 16.5 }, B: { from: 16.4, to: 16.9 } },
} as const;
