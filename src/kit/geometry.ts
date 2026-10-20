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

export type Pt = { x: number; y: number };
/** A phone's centre on the stage and its rotation in degrees. */
export type Pose = Pt & { rot: number };

const rad = (deg: number) => (deg * Math.PI) / 180;
export const rotate = (v: Pt, deg: number): Pt => ({
  x: v.x * Math.cos(rad(deg)) - v.y * Math.sin(rad(deg)),
  y: v.x * Math.sin(rad(deg)) + v.y * Math.cos(rad(deg)),
});

/** A screen-local point of a phone with scale `s`, in stage coordinates, for a given pose. */
export function screenPointToStage(pose: Pose, s: number, p: Pt): Pt {
  const local = {
    x: (p.x + ORIGIN.x - PHONE.w / 2) * s,
    y: (p.y + ORIGIN.y - PHONE.h / 2) * s,
  };
  const r = rotate(local, pose.rot);
  return { x: pose.x + r.x, y: pose.y + r.y };
}

/** A point on the quadratic Bézier curve a -> b with control point c. */
export const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
};
