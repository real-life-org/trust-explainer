import type { Tone } from './theme';

/** The two people every chapter follows. */
export type Who = 'A' | 'B';

/**
 * Ana and Ben each have one colour, used on their avatar, the label under
 * their phone and their name on the credential cards. Warm orange and violet
 * stay clear of the blue accent and the green of signed credentials.
 * Names and keys are illustration, as on the site.
 */
export const PEOPLE = {
  A: {
    name: 'Ana',
    initial: 'A',
    key: 'did:key:z6MkhaXg…9vQ2',
    tone: { bg: 'oklch(91% 0.07 55)', ink: 'oklch(52% 0.15 50)', stage: 'oklch(79% 0.13 60)' } as Tone,
  },
  B: {
    name: 'Ben',
    initial: 'B',
    key: 'did:key:z6MkrJVn…3kLp',
    tone: { bg: 'oklch(91% 0.06 300)', ink: 'oklch(50% 0.18 300)', stage: 'oklch(76% 0.13 300)' } as Tone,
  },
} as const;
