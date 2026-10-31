import React from 'react';
import { useFormat } from '../../kit/format';
import { PEOPLE } from '../../kit/cast';
import { C, FONT } from '../../kit/theme';
import { LAYOUT } from './graph-layout';

/*
 * One network, shared by chapter 03 (where it grows) and chapter 07 (where
 * it falls apart into Ana's star and Ben's star). Positions are in units of
 * a 400 × 300 box, scaled onto the stage, and are where things stand while
 * the two stars lie on top of each other.
 */

export type Pt = [number, number];
export type Item = { id: string; at: Pt; kind: 'person' | 'group'; name?: string; c: number };

/** the names the network's people and groups carry where the story names them */
const NAMES: Record<string, string> = { s1: 'Lea', s2: 'Jon' };

/* ---- read the layout: positions fitted into the 400 × 300 box ---- */
const RAW = LAYOUT.positions as Record<string, readonly [number, number]>;
const fitBox = (() => {
  const ps = Object.values(RAW);
  const xs = ps.map((p) => p[0]);
  const ys = ps.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(352 / (x1 - x0), 252 / (y1 - y0));
  return (p: readonly [number, number]): Pt => [200 + (p[0] - (x0 + x1) / 2) * k, 150 + (p[1] - (y0 + y1) / 2) * k];
})();
const LINKS = LAYOUT.links as ReadonlyArray<readonly [string, string]>;
const linked = (id: string) => LINKS.filter((l) => l[0] === id || l[1] === id).map((l) => (l[0] === id ? l[1] : l[0]));
const toneIndex = (t: string | undefined) => Number(/--p(\d)/.exec(t ?? '')?.[1] ?? 0);
const desc = Object.fromEntries((LAYOUT.nodes as ReadonlyArray<{ id: string; tone?: string; group?: string }>).map((n) => [n.id, n]));
const toItem = (id: string): Item => {
  const d = desc[id];
  return d.group ? { id, at: fitBox(RAW[id]), kind: 'group', name: d.group, c: 0 } : { id, at: fitBox(RAW[id]), kind: 'person', name: NAMES[id], c: toneIndex(d.tone) };
};

export const ANA: Pt = fitBox(RAW.A);
export const BEN: Pt = fitBox(RAW.B);
/** how far each star moves to its own side when the network falls apart */
export const APART = 56;

const anaKnows = linked('A').filter((x) => x !== 'B');
const benKnows = linked('B').filter((x) => x !== 'A');
/** the people and groups both Ana and Ben know */
export const SHARED: Item[] = anaKnows.filter((x) => benKnows.includes(x)).map(toItem);
/** only Ana knows these */
export const ANA_OWN: Item[] = anaKnows.filter((x) => !benKnows.includes(x)).map(toItem);
/** only Ben knows these */
export const BEN_OWN: Item[] = benKnows.filter((x) => !anaKnows.includes(x)).map(toItem);
export const ITEMS: Item[] = [...ANA_OWN, ...SHARED, ...BEN_OWN];
export const item = (id: string): Item => ITEMS.find((i) => i.id === id)!;

/** relationships among the others, and memberships: everything not drawn from Ana or Ben */
export const EXTRA: Array<[string, string]> = LINKS.filter((l) => !['A', 'B'].includes(l[0]) && !['A', 'B'].includes(l[1])).map((l) => [l[0], l[1]]);

/** a group's members, Ana and Ben first */
export const membersOf = (gid: string): string[] => {
  const m = linked(gid).filter((x) => desc[x] && !desc[x].group);
  return m.sort((x, y) => Number(!['A', 'B'].includes(x)) - Number(!['A', 'B'].includes(y)));
};

/** groups are nodes now; the areas of the earlier drawing are gone */
export const GROUP_AREAS: Array<{ group: string; members: string[]; label: { at: Pt; anchor: 'start' | 'end' } }> = [];

/** Where the 400 × 300 drawing stands on the stage. */
export function useGraphBox(): { x: number; y: number; s: number; at: (p: Pt) => Pt } {
  const F = useFormat();
  const b = F.square ? { x: 40, y: 270, s: 2.5 } : { x: 420, y: 236, s: 2.7 };
  return { ...b, at: (p: Pt) => [b.x + p[0] * b.s, b.y + p[1] * b.s] };
}

/** Soft fills for people, so each one reads as someone, and the three dot colours of a group. */
export const PERSON_FILL = ['oklch(82% 0.07 300)', 'oklch(84% 0.07 60)', 'oklch(80% 0.015 265)', 'oklch(82% 0.07 155)', 'oklch(80% 0.06 230)', 'oklch(84% 0.06 20)'];

/** A person (a filled circle) or a group (a dashed circle with three members), in box units. */
const memberTone = (id: string) => (id === 'A' ? PEOPLE.A.tone.stage : id === 'B' ? PEOPLE.B.tone.stage : PERSON_FILL[toneIndex(desc[id]?.tone) % PERSON_FILL.length]);

/** A person (a filled circle) or a group (a dashed circle with one dot per member, in their colours), in box units. */
export const Mark: React.FC<{ id?: string; at: Pt; kind: Item['kind']; idx: number; opacity: number; scale?: number }> = ({ id, at, kind, idx, opacity, scale = 1 }) => {
  if (kind === 'person') return <circle cx={at[0]} cy={at[1]} r={8 * scale} fill={PERSON_FILL[idx % PERSON_FILL.length]} opacity={opacity} />;
  const mem = id ? membersOf(id) : [];
  const k = mem.length;
  const R = 11.5 + 1.6 * Math.max(1, k);
  const rr = k <= 1 ? 0 : Math.min(R - 5.5, 3 + 1.5 * k);
  return (
    <g opacity={opacity} transform={`translate(${at[0]} ${at[1]}) scale(${scale})`}>
      <circle r={R} fill={C.bg} stroke={C.gray3} strokeWidth={1.4} strokeDasharray="2.6 2.4" />
      {mem.map((m, i) => {
        const t = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(k, 1);
        return <circle key={m} cx={rr * Math.cos(t)} cy={rr * Math.sin(t)} r={k === 1 ? 3.8 : 3.2} fill={memberTone(m)} />;
      })}
    </g>
  );
};

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
