import { Easing, interpolate, useVideoConfig } from 'remotion';
import { f, T } from './timings';

/** Phone geometry in phone-local pixels (before scaling). */
export const PHONE = { w: 360, h: 740, inset: 10, radius: 46 } as const;
/** Screen = phone minus the shell inset. Screen-local coords are used by the screens. */
export const SCREEN = { w: PHONE.w - 2 * PHONE.inset, h: PHONE.h - 2 * PHONE.inset } as const;
/** Ana's QR box and Ben's viewfinder share this centre (screen-local). */
export const CODE = { cy: 290, box: 220, hole: 214 } as const;
/** The tray at the bottom of each screen where a received credential docks. */
export const TRAY = { labelTop: 590, slotCy: 656, slotW: 300, slotH: 60 } as const;

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
      s: 0.8,
      home: { A: { x: 285, y: 590 }, B: { x: 795, y: 590 } },
      meet: { x: 540, y: 545 },
      captionY: 150,
      captionSize: 30,
      headerPad: 48,
    };
  }
  return {
    square,
    s: 1,
    home: { A: { x: 600, y: 575 }, B: { x: 1320, y: 575 } },
    meet: { x: 960, y: 525 },
    captionY: 118,
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
    x: (p.x + PHONE.inset - PHONE.w / 2) * L.s,
    y: (p.y + PHONE.inset - PHONE.h / 2) * L.s,
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
  const codeOff = { x: 0, y: (CODE.cy + PHONE.inset - PHONE.h / 2) * L.s };
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
