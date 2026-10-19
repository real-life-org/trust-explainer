import { Easing, interpolate, useVideoConfig } from 'remotion';
import { f, T } from './timings';

/**
 * Phone geometry in phone-local pixels (before scaling): a thin metal rim,
 * a black bezel `inset` wide, and a status bar `status` high above the app
 * content.
 */
export const PHONE = { w: 364, h: 648, inset: 12, status: 44, radius: 58 } as const;
/**
 * The app content area below the status bar. Screen-local coords, used by
 * the screens, start at its top-left corner.
 */
export const SCREEN = { w: PHONE.w - 2 * PHONE.inset, h: PHONE.h - 2 * PHONE.inset - PHONE.status } as const;
/** Where screen-local (0, 0) sits in phone-local pixels. */
export const ORIGIN = { x: PHONE.inset, y: PHONE.inset + PHONE.status } as const;
/** Ana's QR box and Ben's viewfinder share this centre (screen-local). */
export const CODE = { cy: 270, box: 220, hole: 214 } as const;
/** Where a received credential waits at the bottom of the screen until the contact list takes it in. */
export const DOCK = { cy: 524, w: 300, h: 64 } as const;
/** The contact list rows (screen-local); the first row is the new contact. */
export const ROWS = { top: 132, h: 84 } as const;

export type Who = 'A' | 'B';
export type Pt = { x: number; y: number };
export type Pose = Pt & { rot: number };

export type Layout = {
  square: boolean;
  s: number; // phone scale
  home: Record<Who, Pt>;
  meet: Pt; // where the code sits during the scan
  captionY: number;
  captionSize: number;
  headerPad: number;
};

export function useLayout(): Layout {
  const { width, height } = useVideoConfig();
  const square = width === height;
  if (square) {
    return {
      square,
      s: 0.84,
      home: { A: { x: 282, y: 562 }, B: { x: 798, y: 562 } },
      meet: { x: 540, y: 566 },
      captionY: 132,
      captionSize: 30,
      headerPad: 48,
    };
  }
  return {
    square,
    s: 0.88,
    home: { A: { x: 700, y: 548 }, B: { x: 1220, y: 548 } },
    meet: { x: 960, y: 552 },
    captionY: 112,
    captionSize: 34,
    headerPad: 64,
  };
}

const rad = (deg: number) => (deg * Math.PI) / 180;
export const rotate = (v: Pt, deg: number): Pt => ({
  x: v.x * Math.cos(rad(deg)) - v.y * Math.sin(rad(deg)),
  y: v.x * Math.sin(rad(deg)) + v.y * Math.cos(rad(deg)),
});

/** A screen-local point of a phone, in stage coordinates, for a given pose. */
export function screenPointToStage(pose: Pose, L: Layout, p: Pt): Pt {
  const local = {
    x: (p.x + ORIGIN.x - PHONE.w / 2) * L.s,
    y: (p.y + ORIGIN.y - PHONE.h / 2) * L.s,
  };
  const r = rotate(local, pose.rot);
  return { x: pose.x + r.x, y: pose.y + r.y };
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
