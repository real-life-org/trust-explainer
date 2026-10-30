import React from 'react';
import { useFormat } from '../../kit/format';
import { PEOPLE } from '../../kit/cast';
import { C, FONT } from '../../kit/theme';

/*
 * One network, shared by chapter 03 (where it grows) and chapter 07 (where
 * it falls apart into Ana's star and Ben's star). Positions are in units of
 * a 400 × 300 box, scaled onto the stage, and are where things stand while
 * the two stars lie on top of each other.
 */

export type Pt = [number, number];
export type Item = { id: string; at: Pt; kind: 'person' | 'group'; name?: string; c: number };

export const ANA: Pt = [104, 152];
export const BEN: Pt = [296, 148];
/** how far each star moves to its own side when the network falls apart */
export const APART = 64;

/** the people and groups both Ana and Ben know */
export const SHARED: Item[] = [
  { id: 's0', at: [176, 46], kind: 'person', name: 'Lea', c: 0 },
  { id: 's1', at: [214, 100], kind: 'person', name: 'Tom', c: 1 },
  { id: 's2', at: [196, 160], kind: 'group', name: 'Garden group', c: 2 },
  { id: 's3', at: [224, 214], kind: 'person', name: 'Jon', c: 3 },
  { id: 's4', at: [158, 218], kind: 'group', name: 'Choir', c: 4 },
  { id: 's5', at: [180, 266], kind: 'person', name: 'Eva', c: 5 },
];
/** only Ana knows these */
export const ANA_OWN: Item[] = [
  { id: 'a0', at: [96, 26], kind: 'person', c: 0 },
  { id: 'a1', at: [44, 58], kind: 'group', c: 1 },
  { id: 'a2', at: [136, 92], kind: 'person', c: 2 },
  { id: 'a3', at: [22, 122], kind: 'person', c: 3 },
  { id: 'a4', at: [56, 156], kind: 'group', c: 4 },
  { id: 'a5', at: [30, 200], kind: 'person', c: 5 },
  { id: 'a6', at: [76, 262], kind: 'group', c: 6 },
  { id: 'a7', at: [124, 286], kind: 'person', c: 7 },
];
/** only Ben knows these */
export const BEN_OWN: Item[] = [
  { id: 'b0', at: [290, 24], kind: 'person', c: 3 },
  { id: 'b1', at: [352, 46], kind: 'group', c: 4 },
  { id: 'b2', at: [384, 112], kind: 'person', c: 5 },
  { id: 'b3', at: [344, 150], kind: 'person', c: 6 },
  { id: 'b4', at: [374, 192], kind: 'group', c: 7 },
  { id: 'b5', at: [338, 254], kind: 'person', c: 8 },
  { id: 'b6', at: [276, 280], kind: 'group', c: 9 },
];
export const ITEMS: Item[] = [...ANA_OWN, ...SHARED, ...BEN_OWN];
export const item = (id: string): Item => ITEMS.find((i) => i.id === id)!;

/**
 * Relationships among the others: people who know each other, and the
 * members of a group. They belong to the network, not to Ana's or Ben's
 * star, so they fade when the network falls apart into the two stars.
 */
export const EXTRA: Array<[string, string]> = [
  ['a0', 's0'], ['a2', 's1'], ['a3', 'a5'], ['a5', 'a7'], ['s0', 'b0'], ['b2', 'b3'], ['b3', 'b5'], ['s3', 's5'], ['s1', 's3'],
  ['s2', 's1'], ['s2', 's3'], ['s4', 's5'], ['s4', 'a7'], ['a1', 'a0'], ['a1', 'a3'], ['b1', 'b0'], ['b1', 'b2'], ['b4', 'b3'], ['b4', 'b5'], ['a4', 'a3'], ['a4', 'a5'], ['a6', 'a7'], ['b6', 'b5'],
];

/** two groups shown as the soft area around their members, with their names */
export const GROUP_AREAS: Array<{ group: string; members: string[]; label: { at: Pt; anchor: 'start' | 'end' } }> = [
  { group: 's2', members: ['s1', 's3'], label: { at: [262, 112], anchor: 'start' } },
  { group: 's4', members: ['s5', 'a7'], label: { at: [100, 222], anchor: 'end' } },
];

/** Where the 400 × 300 drawing stands on the stage. */
export function useGraphBox(): { x: number; y: number; s: number; at: (p: Pt) => Pt } {
  const F = useFormat();
  const b = F.square ? { x: 40, y: 270, s: 2.5 } : { x: 420, y: 236, s: 2.7 };
  return { ...b, at: (p: Pt) => [b.x + p[0] * b.s, b.y + p[1] * b.s] };
}

/** Soft fills for people, so each one reads as someone, and the three dot colours of a group. */
export const PERSON_FILL = ['oklch(82% 0.07 300)', 'oklch(84% 0.07 60)', 'oklch(80% 0.015 265)', 'oklch(82% 0.07 155)', 'oklch(80% 0.06 230)', 'oklch(84% 0.06 20)'];
const DOT = [C.accent, 'oklch(68% 0.15 145)', 'oklch(76% 0.14 60)'];
const DOT_AT: Pt[] = [[-3.7, -2.4], [3.7, -2.4], [0, 3.9]];

/** A person (a filled circle) or a group (a dashed circle with three members), in box units. */
export const Mark: React.FC<{ at: Pt; kind: Item['kind']; idx: number; opacity: number; scale?: number }> = ({ at, kind, idx, opacity, scale = 1 }) =>
  kind === 'person' ? (
    <circle cx={at[0]} cy={at[1]} r={8 * scale} fill={PERSON_FILL[idx % PERSON_FILL.length]} opacity={opacity} />
  ) : (
    <g opacity={opacity} transform={`translate(${at[0]} ${at[1]}) scale(${scale})`}>
      <circle r={10} fill={C.bg} stroke={C.gray3} strokeWidth={1.4} strokeDasharray="2.6 2.4" />
      {DOT_AT.map((d, k) => (
        <circle key={k} cx={d[0]} cy={d[1]} r={2.3} fill={DOT[(k + idx) % 3]} />
      ))}
    </g>
  );

/** A star's centre: the person's colour, their name inside (box units). */
export const Hub: React.FC<{ at: Pt; who: 'A' | 'B'; opacity: number; scale?: number }> = ({ at, who, opacity, scale = 1 }) =>
  opacity > 0 ? (
    <g transform={`translate(${at[0]} ${at[1]}) scale(${scale})`} opacity={opacity}>
      <circle r={21} fill={PEOPLE[who].tone.stage} />
      <text y={5} textAnchor="middle" fontFamily={FONT} fontSize={12.5} fontWeight={700} fill={C.bg}>
        {PEOPLE[who].name}
      </text>
    </g>
  ) : null;

/** A ray or a link, in box units, drawn from `a` toward `b` up to `t`. */
export const Ray: React.FC<{ a: Pt; b: Pt; t?: number; opacity?: number }> = ({ a, b, t = 1, opacity = 1 }) =>
  t > 0 ? (
    <line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * t} y2={a[1] + (b[1] - a[1]) * t} stroke={C.gray4} strokeWidth={1.3} strokeLinecap="round" opacity={opacity} />
  ) : null;

/** The soft area around a group and its members, with the group's name. */
export const GroupArea: React.FC<{ area: (typeof GROUP_AREAS)[number]; opacity: number }> = ({ area, opacity }) => {
  if (opacity <= 0) return null;
  const pts = [area.group, ...area.members].map((id) => item(id).at);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + 20;
  const ry = (Math.max(...ys) - Math.min(...ys)) / 2 + 18;
  const g = item(area.group);
  return (
    <g opacity={opacity}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.accent} fillOpacity={0.08} stroke={C.accent} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 3" />
      <text x={area.label.at[0]} y={area.label.at[1]} textAnchor={area.label.anchor} fontFamily={FONT} fontSize={9.5} fontWeight={600} fill={C.accentHigh}>
        {g.name}
      </text>
    </g>
  );
};
