import React from 'react';
import { useCurrentFrame } from '../../kit/timeline';
import { Easing, interpolate } from '../../kit/motion';
import { C, FONT } from '../../kit/theme';
import { clamp, f } from '../../kit/time';
import { T } from './timings';

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

import { ANA, ANA_OWN, APART, BEN, BEN_OWN, Hub, Mark, Ray, SHARED, useGraphBox, type Item, type Pt } from './graph';

/** Where the shared items stand at the end: contacts on the left, groups on the right. */
const LIST_X = { person: 112, group: 288 };
const LIST_TOP = 92;
const LIST_STEP = 44;
const listSlot = (() => {
  const n = { person: 0, group: 0 };
  return SHARED.map((s) => [LIST_X[s.kind], LIST_TOP + n[s.kind]++ * LIST_STEP] as Pt);
})();

/**
 * Chapter 07's stars. They start apart, as the network fell apart into them; Ben lays his over Ana's, and
 * the people and groups both know meet in the same places and light up.
 * Everything else fades, then the stars dissolve and only two lists stay:
 * the contacts and the groups they share.
 */
export const OverlaidStars: React.FC = () => {
  const frame = useCurrentFrame();
  const box = useGraphBox();

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

  /** one star, complete: its rays and the people and groups at their ends */
  const star = (c: Pt, off: Pt, own: Item[], side: 'a' | 'b') => [
    ...own.map((it) => (
      <g key={`${side}${it.id}`} opacity={others}>
        <Ray a={c} b={add(it.at, off)} />
        <Mark at={add(it.at, off)} kind={it.kind} idx={it.c} opacity={1} />
      </g>
    )),
    ...SHARED.map((it, i) => {
      const h = lit[i];
      const at = add(it.at, off);
      return (
        <g key={`${side}${it.id}`}>
          <g opacity={1 - dissolve}>
            <Ray a={c} b={at} opacity={1 - 0.7 * h} />
            {h > 0 ? <line x1={c[0]} y1={c[1]} x2={at[0]} y2={at[1]} stroke={C.accent} strokeWidth={1.5} strokeLinecap="round" opacity={0.6 * h} /> : null}
          </g>
          {/* shared ones are drawn once more below, merged, so they can leave for the lists */}
          {merged < 1 ? <Mark at={at} kind={it.kind} idx={it.c} opacity={1 - merged} /> : null}
        </g>
      );
    }),
  ];

  return (
    <svg viewBox="0 0 400 300" width={400 * box.s} height={300 * box.s} style={{ position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}>
      {star(anaC, anaOff, ANA_OWN, 'a')}
      {star(benC, benOff, BEN_OWN, 'b')}

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
            <Mark at={[x, y]} kind={it.kind} idx={it.c} opacity={1 - tag} />
            {/* in the list: a name tag with the mark in front */}
            <g opacity={tag}>
              <rect x={x - w / 2} y={y - 15} width={w} height={30} rx={15} fill={C.tint} fillOpacity={0.45} stroke={C.accent} strokeOpacity={0.4} strokeWidth={1.4} />
              <Mark at={[x - w / 2 + 16, y]} kind={it.kind} idx={it.c} opacity={1} scale={0.8} />
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

      <Hub at={anaC} who="A" opacity={1 - dissolve} />
      <Hub at={benC} who="B" opacity={1 - dissolve} />
    </svg>
  );
};
