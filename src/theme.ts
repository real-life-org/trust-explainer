/**
 * Colours from the trust-protocol site (apps/site/src/styles/site.css,
 * tokens.css) and the ceremony simulator's phone screens.
 */
export const C = {
  // stage (dark site theme)
  bg: 'oklch(18% 0.03 265)',
  band: 'oklch(13% 0.02 265)',
  dot: 'oklch(30% 0.02 265)',
  accent: 'oklch(65% 0.19 264)',
  accentHigh: 'oklch(82% 0.10 264)',
  tint: 'oklch(28% 0.08 264)',
  white: 'oklch(97% 0.005 265)',
  gray2: 'oklch(80% 0.01 265)',
  gray3: 'oklch(66% 0.012 265)',
  gray4: 'oklch(46% 0.015 265)',
  gray5: 'oklch(32% 0.02 265)',

  // phone (simulator: dark shell, light screen)
  shell: 'oklch(12% 0.01 265)',
  screen: 'oklch(98% 0.003 265)',
  ink: 'oklch(22% 0.004 265)',
  muted: 'oklch(44% 0.008 265)',
  faint: 'oklch(55% 0.008 265)',
  line: 'oklch(90% 0.008 265)',
  surface: 'oklch(95% 0.005 265)',
  primary: 'oklch(55% 0.21 264)',
  primaryTint: 'oklch(93% 0.05 264)',
  primaryInk: 'oklch(48% 0.18 264)',
  camera: 'oklch(28% 0.01 265)',
  viewfinder: 'oklch(78% 0.12 264)',
  success: 'oklch(55% 0.17 142)',
  successInk: 'oklch(48% 0.16 142)',
  successTint: 'oklch(94% 0.06 142)',
  okBg: 'oklch(96% 0.03 142)',
  okBorder: 'oklch(80% 0.09 142)',
  danger: 'oklch(54% 0.19 27)',
  dangerLine: 'oklch(88% 0.06 27)',
} as const;

export const FONT = '"Ubuntu Sans", Ubuntu, Inter, system-ui, sans-serif';
export const MONO = '"Ubuntu Sans Mono", "Ubuntu Mono", ui-monospace, monospace';

export const PEOPLE = {
  A: { name: 'Ana', initial: 'A', key: 'did:key:z6MkhaXg…9vQ2' },
  B: { name: 'Ben', initial: 'B', key: 'did:key:z6MkrJVn…3kLp' },
} as const;
