import React from 'react';
import { Easing, interpolate } from '../../kit/motion';
import { useFormat } from '../../kit/format';
import { C, FONT, MONO } from '../../kit/theme';
import { clamp, f } from '../../kit/time';

/*
 * What chapters 01 (Identity) and 02 (Person) share: the drawing box and
 * Ana's document. Chapter 01 ends with the document at DOC; chapter 02
 * starts with it in exactly the same place, so the two read as one movement.
 */

export type Pt = [number, number];
export type Span = { from: number; to: number };

export const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 -> 1 over a span of seconds, eased. */
export const prog = (frame: number, s: Span, e = ease) => interpolate(frame, [f(s.from), f(s.to)], [0, 1], { ...clamp, easing: e });

/** The i-th of n items in a span, each taking `share` of it, staggered. */
export const stagger = (frame: number, s: Span, i: number, n: number, share = 0.4, e = ease) => {
  const len = (s.to - s.from) * share;
  const start = s.from + ((s.to - s.from - len) * i) / Math.max(1, n - 1);
  return prog(frame, { from: start, to: start + len }, e);
};

/** a 0..1 value remapped to a sub-range of it */
export const part = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where the 400 × 300 drawing stands on the stage. */
export function useBox(): { x: number; y: number; s: number } {
  const F = useFormat();
  return F.square ? { x: 40, y: 270, s: 2.5 } : { x: 420, y: 236, s: 2.7 };
}

export const Box: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const box = useBox();
  return (
    <svg viewBox="0 0 400 300" width={400 * box.s} height={300 * box.s} style={{ position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}>
      {children}
    </svg>
  );
};

/** Ana's anchors, one per context, as on the deck slide (illustration, not real keys). */
export const ROWS: Array<{ anchor: string; name: string }> = [
  { anchor: 'pair/7f3a…', name: 'Ben' },
  { anchor: 'group/c41e…', name: 'choir group' },
  { anchor: 'service/9d2b…', name: 'a service' },
  { anchor: 'persona/…', name: 'the public' },
  { anchor: 'pair/2b6c…', name: 'Sam' },
  { anchor: 'group/e83f…', name: 'garden group' },
];

/** Ana's document: where it stands, and where each row's anchor sits in it. */
export const DOC = { x: 125, y: 12, w: 150, h: 114 };
export const rowAt = (i: number): Pt => [DOC.x + 10, DOC.y + 37 + i * 13.5];
export const ANCHOR_SIZE = 7.2;

/** The document's card and title; rows are drawn by the chapter (they arrive differently in each). */
export const DocCard: React.FC<{ opacity: number }> = ({ opacity }) => (
  <g opacity={opacity}>
    <rect x={DOC.x} y={DOC.y} width={DOC.w} height={DOC.h} rx={8} fill={C.bg} stroke={C.accent} strokeWidth={1.4} />
    <text x={DOC.x + 10} y={DOC.y + 18} fontFamily={FONT} fontSize={9.5} fontWeight={700} fill={C.white}>
      Ana’s document
    </text>
  </g>
);

/** One row's name, to the right of its anchor. */
export const RowName: React.FC<{ i: number; opacity: number }> = ({ i, opacity }) => {
  const [x, y] = rowAt(i);
  return (
    <text x={x + 76} y={y} fontFamily={FONT} fontSize={7.5} fill={C.gray2} opacity={opacity}>
      {ROWS[i].name}
    </text>
  );
};

/** One row's anchor, at a position (it flies in during chapter 01, stands still in chapter 02). */
export const AnchorText: React.FC<{ at: Pt; i: number; size?: number; opacity?: number; anchor?: 'start' | 'middle' }> = ({ at, i, size = ANCHOR_SIZE, opacity = 1, anchor = 'start' }) => (
  <text x={at[0]} y={at[1]} fontFamily={MONO} fontSize={size} fill={C.accentHigh} textAnchor={anchor} opacity={opacity}>
    {ROWS[i].anchor}
  </text>
);

/** People as filled circles, groups as dashed circles with three coloured dots (the deck's marks). */
const DOT = [C.accent, 'oklch(68% 0.15 145)', 'oklch(76% 0.14 60)'];
export const GroupMark: React.FC<{ at: Pt; r: number; opacity: number; shift?: number }> = ({ at, r, opacity, shift = 0 }) => (
  <g opacity={opacity} transform={`translate(${at[0]} ${at[1]})`}>
    <circle r={r} fill={C.bg} stroke={C.gray3} strokeWidth={1.3} strokeDasharray="2.6 2.4" />
    {([[-0.36, -0.24], [0.36, -0.24], [0, 0.38]] as Pt[]).map((d, k) => (
      <circle key={k} cx={d[0] * r} cy={d[1] * r} r={r * 0.22} fill={DOT[(k + shift) % 3]} />
    ))}
  </g>
);
