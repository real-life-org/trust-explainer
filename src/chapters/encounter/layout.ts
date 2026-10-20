import { Easing, interpolate } from '../../kit/motion';
import { useFormat, type Format } from '../../kit/format';
import { ORIGIN, PHONE, type Pose, type Pt, rotate } from '../../kit/geometry';
import type { Who } from '../../kit/cast';
import { f } from '../../kit/time';
import { T } from './timings';

/** Ana's QR box and Ben's viewfinder share this centre (screen-local). */
export const CODE = { cy: 270, box: 220, hole: 214 } as const;
/** Where a received credential waits at the bottom of the screen until the contact list takes it in. */
export const DOCK = { cy: 524 } as const;
/** The contact list rows (screen-local); the first row is the new contact. */
export const ROWS = { top: 132, h: 84 } as const;

/** The stage format plus where the two phones stand in it. */
export type Layout = Format & {
  s: number; // phone scale
  home: Record<Who, Pt>;
  meet: Pt; // where the code sits during the scan
};

export function useLayout(): Layout {
  const F = useFormat();
  if (F.square) {
    return {
      ...F,
      s: 0.84,
      home: { A: { x: 282, y: 562 }, B: { x: 798, y: 562 } },
      meet: { x: 540, y: 566 },
    };
  }
  return {
    ...F,
    s: 0.88,
    home: { A: { x: 700, y: 548 }, B: { x: 1220, y: 548 } },
    meet: { x: 960, y: 552 },
  };
}

const TILT: Record<Who, number> = { A: 45, B: -45 };
const travel = Easing.bezier(0.35, 0, 0.25, 1);
const glide = Easing.bezier(0.4, 0, 0.2, 1);

const progress = (frame: number, from: number, to: number, easing: (t: number) => number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/**
 * Pose during the scan, as in the ceremony simulator: both phones lean 45°
 * toward the middle, so the square viewfinder and the square code meet at a
 * 90° relative turn and the code fits the camera exactly.
 */
export function meetPose(who: Who, L: Layout): Pose {
  const codeOff = { x: 0, y: (CODE.cy + ORIGIN.y - PHONE.h / 2) * L.s };
  const r = rotate(codeOff, TILT[who]);
  return { x: L.meet.x - r.x, y: L.meet.y - r.y, rot: TILT[who] };
}

/** Where a phone is at a given absolute frame. */
export function phonePose(who: Who, frame: number, L: Layout): Pose {
  const home = L.home[who];
  const meet = meetPose(who, L);
  const s0 = f(T.scanMove.from);
  const s1 = who === 'B' ? f(T.scanMove.to) : f(T.scanMove.from + (T.scanMove.to - T.scanMove.from) * T.scanMove.anaShare);
  const r0 = f(T.moveAway.from);
  const r1 = f(T.moveAway.to);

  if (frame < r0) {
    // out: one quadratic arc, lifted above the direct line
    const t = progress(frame, s0, s1, travel);
    const lift = (who === 'B' ? 140 : 70) * L.s;
    const c = { x: (home.x + meet.x) / 2, y: (home.y + meet.y) / 2 - lift };
    const u = 1 - t;
    return {
      x: u * u * home.x + 2 * u * t * c.x + t * t * meet.x,
      y: u * u * home.y + 2 * u * t * c.y + t * t * meet.y,
      rot: t * meet.rot,
    };
  }
  // back: straight glide home
  const t = progress(frame, r0, r1, glide);
  return {
    x: meet.x + (home.x - meet.x) * t,
    y: meet.y + (home.y - meet.y) * t,
    rot: meet.rot * (1 - t),
  };
}
