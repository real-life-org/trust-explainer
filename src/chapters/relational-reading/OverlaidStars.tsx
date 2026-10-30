import React from 'react';
import { useCurrentFrame } from '../../kit/timeline';
import { Easing, interpolate } from '../../kit/motion';
import { useFormat } from '../../kit/format';
import { PEOPLE } from '../../kit/cast';
import { C, FONT } from '../../kit/theme';
import { clamp, f } from '../../kit/time';
import { T } from './timings';

type Pt = [number, number];
type Span = { from: number; to: number };

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 -> 1 over a span of seconds, eased. */
const prog = (frame: number, s: Span, e = ease) => interpolate(frame, [f(s.from), f(s.to)], [0, 1], { ...clamp, easing: e });

/** The i-th of n items in a span, each taking `share` of it, staggered. */
const stagger = (frame: number, s: Span, i: number, n: number, share = 0.4, e = ease) => {
  const len = (s.to - s.from) * share;
  const start = s.from + ((s.to - s.from - len) * i) / Math.max(1, n - 1);
  return prog(frame, { from: start, to: start + len }, e);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/*
 * The drawing, in units of a 400 × 300 box, scaled onto the stage. Each star
 * holds people (circles) and groups (rounded squares). Positions are where
 * things stand once Ben has laid his star over Ana's; before that, Ana's
 * star stands further left and Ben's further right.
 */
type Item = { at: Pt; kind: 'person' | 'group'; name?: string };

const ANA: Pt = [104, 152];
const BEN: Pt = [296, 148];
/** how far apart the two stars start, each to its own side */
const APART = 64;

const SHARED: Item[] = [
  { at: [176, 46], kind: 'person', name: 'Lea' },
  { at: [214, 100], kind: 'person', name: 'Tom' },
  { at: [196, 160], kind: 'group', name: 'Garden group' },
  { at: [224, 214], kind: 'person', name: 'Jon' },
  { at: [158, 218], kind: 'group', name: 'Choir' },
  { at: [180, 266], kind: 'person', name: 'Eva' },
];
const ANA_OWN: Item[] = [
  { at: [96, 26], kind: 'person' },
  { at: [44, 58], kind: 'group' },
  { at: [136, 92], kind: 'person' },
  { at: [22, 122], kind: 'person' },
  { at: [56, 156], kind: 'group' },
  { at: [30, 200], kind: 'person' },
  { at: [76, 262], kind: 'group' },
  { at: [124, 286], kind: 'person' },
];
const BEN_OWN: Item[] = [
  { at: [290, 24], kind: 'person' },
  { at: [352, 46], kind: 'group' },
  { at: [384, 112], kind: 'person' },
  { at: [344, 150], kind: 'person' },
  { at: [374, 192], kind: 'group' },
  { at: [338, 254], kind: 'person' },
  { at: [276, 280], kind: 'group' },
];

/** Where the shared items stand at the end: contacts on the left, groups on the right. */
const LIST_X = { person: 112, group: 288 };
const LIST_TOP = 92;
const LIST_STEP = 44;
const listSlot = (() => {
  const n = { person: 0, group: 0 };
  return SHARED.map((s) => [LIST_X[s.kind], LIST_TOP + n[s.kind]++ * LIST_STEP] as Pt);
})();

/** rays reach out in turn, around the centre */
const angle = (c: Pt, p: Pt) => Math.atan2(p[1] - c[1], p[0] - c[0]);

/** Where Ana's and Ben's star centres stand on the stage when the chapter's stars begin, and their radius. */
export function useStarCentres(): { A: Pt; B: Pt; r: number } {
  const box = useBox();
  const at = (p: Pt): Pt => [box.x + p[0] * box.s, box.y + p[1] * box.s];
  return { A: at([ANA[0] - APART, ANA[1]]), B: at([BEN[0] + APART, BEN[1]]), r: 21 * box.s };
}

/** Where the 400 × 300 drawing stands on the stage. */
function useBox(): { x: number; y: number; s: number } {
  const F = useFormat();
  return F.square ? { x: 40, y: 270, s: 2.5 } : { x: 420, y: 236, s: 2.7 };
}

/** Soft fills for people, so each one reads as someone, and the three dot colours of a group. */
const PERSON_FILL = ['oklch(82% 0.07 300)', 'oklch(84% 0.07 60)', 'oklch(80% 0.015 265)', 'oklch(82% 0.07 155)', 'oklch(80% 0.06 230)', 'oklch(84% 0.06 20)'];
const DOT = [C.accent, 'oklch(68% 0.15 145)', 'oklch(76% 0.14 60)'];
const DOT_AT: Pt[] = [[-3.7, -2.4], [3.7, -2.4], [0, 3.9]];

/** A person (a filled circle) or a group (a dashed circle with three members), as on the deck. */
const Mark: React.FC<{ at: Pt; kind: Item['kind']; idx: number; opacity: number; scale?: number }> = ({ at, kind, idx, opacity, scale = 1 }) =>
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

/**
 * Chapter 07's scene. Two stars stand apart; Ben lays his over Ana's, and
 * the people and groups both know meet in the same places and light up.
 * Everything else fades, then the stars dissolve and only two lists stay:
 * the contacts and the groups they share.
 */
export const OverlaidStars: React.FC = () => {
  const frame = useCurrentFrame();
  const box = useBox();

  const join = prog(frame, T.join, easeInOut);
  /** the two copies of a shared item meet, then one merged mark takes over */
  const merged = interpolate(join, [0.92, 1], [0, 1], clamp);
  const lit = SHARED.map((_, i) => stagger(frame, T.light, i, SHARED.length, 0.5));
  const fade = prog(frame, T.fade);
  const dissolve = prog(frame, T.dissolve);
  const order = SHARED.map((_, i) => stagger(frame, T.order, i, SHARED.length, 0.55, easeInOut));
  const heads = prog(frame, T.heads);
  const names = SHARED.map((_, i) => stagger(frame, T.names, i, SHARED.length, 0.5));

  const others = (1 - 0.88 * fade) * (1 - dissolve);
  const anaOff: Pt = [-APART * (1 - join), 0];
  const benOff: Pt = [APART * (1 - join), 0];
  const add = (p: Pt, o: Pt): Pt => [p[0] + o[0], p[1] + o[1]];

  const anaC = add(ANA, anaOff);
  const benC = add(BEN, benOff);

  /** one star: its rays grow in turn, each item appears as its ray arrives */
  const star = (c: Pt, off: Pt, own: Item[], span: Span, side: 'a' | 'b') => {
    const items = [...own.map((it) => ({ it, shared: -1 })), ...SHARED.map((it, i) => ({ it, shared: i }))].sort(
      (p, q) => angle(c, add(p.it.at, off)) - angle(c, add(q.it.at, off)),
    );
    return items.map(({ it, shared }, k) => {
      const t = stagger(frame, span, k, items.length);
      if (t <= 0) return null;
      const isShared = shared >= 0;
      const h = isShared ? lit[shared] : 0;
      const at = add(it.at, off);
      const seen = interpolate(t, [0.7, 1], [0, 1], clamp);
      const rayOp = isShared ? 1 - dissolve : others;
      const x2 = lerp(c[0], at[0], t);
      const y2 = lerp(c[1], at[1], t);
      return (
        <g key={`${side}${k}`}>
          <g opacity={rayOp}>
            <line x1={c[0]} y1={c[1]} x2={x2} y2={y2} stroke={C.gray4} strokeWidth={1.3} strokeLinecap="round" opacity={1 - 0.7 * h} />
            {h > 0 ? <line x1={c[0]} y1={c[1]} x2={x2} y2={y2} stroke={C.accent} strokeWidth={1.5} strokeLinecap="round" opacity={0.6 * h} /> : null}
          </g>
          {/* own items are drawn here; shared ones once, below, so they can leave for the lists */}
          {!isShared ? <Mark at={at} kind={it.kind} idx={k + (side === 'a' ? 0 : 3)} opacity={seen * others} /> : null}
          {isShared && merged < 1 ? <Mark at={at} kind={it.kind} idx={shared} opacity={seen * (1 - merged)} /> : null}
        </g>
      );
    });
  };

  // both centres stand from the first frame: they arrive from chapter 03's network
  const anaHub = 1 - dissolve;
  const benHub = 1 - dissolve;
  const hub = (c: Pt, t: number, who: 'A' | 'B') =>
    t > 0 ? (
      <g transform={`translate(${c[0]} ${c[1]}) scale(${0.7 + 0.3 * t})`} opacity={t}>
        <circle r={21} fill={PEOPLE[who].tone.stage} />
        <text y={5} textAnchor="middle" fontFamily={FONT} fontSize={12.5} fontWeight={700} fill={C.bg}>
          {PEOPLE[who].name}
        </text>
      </g>
    ) : null;

  return (
    <svg viewBox="0 0 400 300" width={400 * box.s} height={300 * box.s} style={{ position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}>
      {star(anaC, anaOff, ANA_OWN, T.anaRays, 'a')}
      {star(benC, benOff, BEN_OWN, T.benRays, 'b')}

      {/* the shared items, once both stars lie on top of each other: they light up, then move into the lists */}
      {SHARED.map((it, i) => {
        if (merged <= 0) return null;
        const h = lit[i];
        const o = order[i];
        const slot = listSlot[i];
        const x = lerp(it.at[0], slot[0], o);
        const y = lerp(it.at[1], slot[1], o);
        const w = lerp(20, 128, o);
        const tag = interpolate(o, [0.35, 1], [0, 1], clamp);
        return (
          <g key={`s${i}`} opacity={merged}>
            {/* in the star: the mark itself, with a quiet ring once both reach it */}
            <circle cx={x} cy={y} r={13} fill="none" stroke={C.accent} strokeWidth={1.4} opacity={0.65 * h * (1 - tag)} />
            <Mark at={[x, y]} kind={it.kind} idx={i} opacity={1 - tag} />
            {/* in the list: a name tag with the mark in front */}
            <g opacity={tag}>
              <rect x={x - w / 2} y={y - 15} width={w} height={30} rx={15} fill={C.tint} fillOpacity={0.45} stroke={C.accent} strokeOpacity={0.4} strokeWidth={1.4} />
              <Mark at={[x - w / 2 + 16, y]} kind={it.kind} idx={i} opacity={1} scale={0.8} />
              <text x={x - w / 2 + 32} y={y + 4.5} fontFamily={FONT} fontSize={12.5} fontWeight={600} fill={C.white} opacity={names[i]}>
                {it.name}
              </text>
            </g>
          </g>
        );
      })}

      {/* the two lists' headings */}
      <g opacity={heads} fontFamily={FONT} fontSize={11} fontWeight={600} letterSpacing={1.2} fill={C.gray3} textAnchor="middle">
        <text x={LIST_X.person} y={LIST_TOP - 34}>CONTACTS IN COMMON</text>
        <text x={LIST_X.group} y={LIST_TOP - 34}>GROUPS IN COMMON</text>
      </g>

      {hub(anaC, anaHub, 'A')}
      {hub(benC, benHub, 'B')}
    </svg>
  );
};
