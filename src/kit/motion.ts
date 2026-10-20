/**
 * The motion math every scene uses: interpolation, easing curves, springs.
 * Pure functions of their inputs, so a frame always gives the same picture.
 */

type Extrapolate = 'extend' | 'clamp' | 'identity';
export type InterpolateOptions = {
  easing?: (t: number) => number;
  extrapolateLeft?: Extrapolate;
  extrapolateRight?: Extrapolate;
};

/**
 * Maps `input` from `inputRange` to `outputRange`, piecewise linear between
 * neighbouring points, with `easing` applied within each piece. Outside the
 * range the value extends the outer piece unless clamped.
 */
export function interpolate(
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  options: InterpolateOptions = {},
): number {
  if (inputRange.length !== outputRange.length || inputRange.length < 2) {
    throw new Error('interpolate: inputRange and outputRange need the same length, at least 2');
  }
  const { easing = (t: number) => t, extrapolateLeft = 'extend', extrapolateRight = 'extend' } = options;
  let i = 1;
  while (i < inputRange.length - 1 && input > inputRange[i]) i++;
  const x0 = inputRange[i - 1];
  const x1 = inputRange[i];
  const y0 = outputRange[i - 1];
  const y1 = outputRange[i];

  if (input < x0) {
    if (extrapolateLeft === 'clamp') return y0;
    if (extrapolateLeft === 'identity') return input;
  }
  if (input > x1) {
    if (extrapolateRight === 'clamp') return y1;
    if (extrapolateRight === 'identity') return input;
  }
  if (x1 === x0) return input <= x0 ? y0 : y1;
  const t = (input - x0) / (x1 - x0);
  const eased = t < 0 || t > 1 ? t : easing(t);
  return y0 + (y1 - y0) * eased;
}

/** A colour between the given colours, mixed in sRGB; clamped at both ends. */
export function interpolateColors(input: number, inputRange: readonly number[], colors: readonly string[]): string {
  let i = 1;
  while (i < inputRange.length - 1 && input > inputRange[i]) i++;
  const t = interpolate(input, [inputRange[i - 1], inputRange[i]], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (t <= 0) return colors[i - 1];
  if (t >= 1) return colors[i];
  return `color-mix(in srgb, ${colors[i - 1]} ${((1 - t) * 100).toFixed(3)}%, ${colors[i]})`;
}

/** Cubic Bézier timing curves, as in CSS `cubic-bezier()`. */
export const Easing = {
  bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const curveX = (s: number) => ((ax * s + bx) * s + cx) * s;
    const curveY = (s: number) => ((ay * s + by) * s + cy) * s;
    const slopeX = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
    // the curve parameter s whose x is t: Newton first, bisection if it stalls
    const solve = (t: number) => {
      let s = t;
      for (let k = 0; k < 8; k++) {
        const err = curveX(s) - t;
        if (Math.abs(err) < 1e-7) return s;
        const d = slopeX(s);
        if (Math.abs(d) < 1e-6) break;
        s -= err / d;
      }
      let lo = 0;
      let hi = 1;
      s = t;
      for (let k = 0; k < 60; k++) {
        const x = curveX(s);
        if (Math.abs(x - t) < 1e-7) break;
        if (x < t) lo = s;
        else hi = s;
        s = (lo + hi) / 2;
      }
      return s;
    };
    return (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : curveY(solve(t)));
  },
};

// ---------------------------------------------------------------------------
// spring

export type SpringConfig = { damping?: number; stiffness?: number; mass?: number };

/**
 * Position (0 -> 1) of a spring released at rest, `seconds` after release.
 * Under-damped springs overshoot and settle; springs at or above critical
 * damping move like a critically damped one, which keeps high damping
 * values quick and smooth instead of sluggish.
 */
function springAt(seconds: number, { damping = 10, stiffness = 100, mass = 1 }: SpringConfig): number {
  if (seconds <= 0) return 0;
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const w0 = Math.sqrt(stiffness / mass);
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * w0 * seconds);
    return 1 - decay * (Math.cos(wd * seconds) + ((zeta * w0) / wd) * Math.sin(wd * seconds));
  }
  return 1 - Math.exp(-w0 * seconds) * (1 + w0 * seconds);
}

const settleCache = new Map<string, number>();

/** First frame from which the spring stays within 0.005 of rest for 20 frames. */
function settleFrames(fps: number, config: SpringConfig): number {
  const key = `${fps}/${config.damping}/${config.stiffness}/${config.mass}`;
  const cached = settleCache.get(key);
  if (cached !== undefined) return cached;
  let start = 0;
  let calm = 0;
  for (let frame = 0; calm < 20 && frame < 100000; frame++) {
    if (Math.abs(1 - springAt(frame / fps, config)) < 0.005) {
      if (calm === 0) start = frame;
      calm++;
    } else {
      calm = 0;
    }
  }
  settleCache.set(key, start);
  return start;
}

/**
 * A spring from 0 to 1 that starts at frame 0. With `durationInFrames` its
 * time is stretched so that it settles exactly then.
 */
export function spring({
  frame,
  fps,
  config = {},
  durationInFrames,
}: {
  frame: number;
  fps: number;
  config?: SpringConfig;
  durationInFrames?: number;
}): number {
  if (durationInFrames === undefined) return springAt(frame / fps, config);
  if (frame > durationInFrames) return 1;
  return springAt((frame * settleFrames(fps, config)) / durationInFrames / fps, config);
}
