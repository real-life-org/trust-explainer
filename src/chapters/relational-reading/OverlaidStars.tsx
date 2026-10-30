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
const stagger = (frame: number, s: Span, i: number, n: number, share = 0.4) => {
  const len = (s.to - s.from) * share;
  const start = s.from + ((s.to - s.from - len) * i) / Math.max(1, n - 1);
  return prog(frame, { from: start, to: start + len });
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/*
 * The drawing, in units of a 400 × 300 box (the deck sketch), scaled onto
 * the stage. Both stars are irregular on purpose; the people both know sit
 * between the two centres.
 */
const ANA: Pt = [104, 152];
const BEN: Pt = [296, 148];
const SHARED: Pt[] = [[176, 46], [214, 98], [190, 158], [222, 214], [174, 258]];
const NAMES = ['Lea', 'Tom', 'Mia', 'Jon', 'Eva'];
const ANA_OWN: Pt[] = [[136, 92], [96, 26], [44, 58], [22, 122], [60, 150], [30, 196], [70, 262], [128, 284]];
const BEN_OWN: Pt[] = [[290, 24], [350, 44], [384, 110], [338, 146], [372, 186], [340, 252], [282, 276]];
/** where the shared people line up at the end: one column between the two */
const ROW: Pt[] = NAMES.map((_, k) => [200, 46 + k * 52]);

/** rays reach out in turn, around the centre */
const byAngle = (c: Pt) => (a: Pt, b: Pt) => Math.atan2(a[1] - c[1], a[0] - c[0]) - Math.atan2(b[1] - c[1], b[0] - c[0]);

/** Where the 400 × 300 drawing stands on the stage. */
function useBox(): { x: number; y: number; s: number } {
  const F = useFormat();
  return F.square ? { x: 40, y: 260, s: 2.5 } : { x: 420, y: 236, s: 2.7 };
}

type Ray = { to: Pt; shared: number };

const Star: React.FC<{ c: Pt; rays: Ray[]; span: Span; frame: number; others: number; lit: number[]; gather: number }> = ({
  c,
  rays,
  span,
  frame,
  others,
  lit,
  gather,
}) => (
  <g>
    {rays.map((r, i) => {
      const t = stagger(frame, span, i, rays.length);
      if (t <= 0) return null;
      const shared = r.shared >= 0;
      const h = shared ? lit[r.shared] : 0;
      const end = shared ? [lerp(r.to[0], ROW[r.shared][0], gather), lerp(r.to[1], ROW[r.shared][1], gather)] : r.to;
      const x2 = lerp(c[0], end[0], t);
      const y2 = lerp(c[1], end[1], t);
      return (
        <g key={i} opacity={shared ? 1 : others}>
          <line x1={c[0]} y1={c[1]} x2={x2} y2={y2} stroke={C.gray4} strokeWidth={1.4} strokeLinecap="round" opacity={1 - h} />
          {shared && h > 0 ? <line x1={c[0]} y1={c[1]} x2={x2} y2={y2} stroke={C.accent} strokeWidth={1.4 + 0.8 * h} strokeLinecap="round" opacity={h} /> : null}
        </g>
      );
    })}
  </g>
);

/**
 * Chapter 07's scene: Ana's star, Ben's star beside it, the people both
 * reach lighting up, everyone else fading, and the shared people stepping
 * into a row between the two, with their names.
 */
export const OverlaidStars: React.FC = () => {
  const frame = useCurrentFrame();
  const box = useBox();

  const fade = prog(frame, T.fade);
  const gather = prog(frame, T.gather, easeInOut);
  const names = prog(frame, T.names);
  const others = (1 - 0.85 * fade) * (1 - gather);
  const lit = SHARED.map((_, i) => stagger(frame, T.shared, i, SHARED.length, 0.45));

  const anaRays: Ray[] = [...ANA_OWN.map((to) => ({ to, shared: -1 })), ...SHARED.map((to, i) => ({ to, shared: i }))].sort((a, b) => byAngle(ANA)(a.to, b.to));
  const benRays: Ray[] = [...BEN_OWN.map((to) => ({ to, shared: -1 })), ...SHARED.map((to, i) => ({ to, shared: i }))].sort((a, b) => byAngle(BEN)(a.to, b.to));

  // a contact appears once the ray that reaches it is mostly drawn
  const reached = (c: Pt, span: Span, rays: Ray[], to: Pt) => {
    const i = rays.findIndex((r) => r.to === to);
    return interpolate(stagger(frame, span, i, rays.length), [0.7, 1], [0, 1], clamp);
  };

  const anaHub = prog(frame, T.anaHub);
  const benHub = prog(frame, T.benHub);

  const hub = (c: Pt, t: number, who: 'A' | 'B') =>
    t > 0 ? (
      <g transform={`translate(${c[0]} ${c[1]}) scale(${0.6 + 0.4 * t})`} opacity={t}>
        <circle r={22} fill={PEOPLE[who].tone.stage} />
        <text y={5} textAnchor="middle" fontFamily={FONT} fontSize={12.5} fontWeight={700} fill={C.bg}>
          {PEOPLE[who].name}
        </text>
      </g>
    ) : null;

  return (
    <svg
      viewBox="0 0 400 300"
      width={400 * box.s}
      height={300 * box.s}
      style={{ position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}
    >
      <Star c={ANA} rays={anaRays} span={T.anaRays} frame={frame} others={others} lit={lit} gather={gather} />
      <Star c={BEN} rays={benRays} span={T.benRays} frame={frame} others={others} lit={lit} gather={gather} />

      {/* contacts only one of them knows */}
      {ANA_OWN.map((p, i) => {
        const t = reached(ANA, T.anaRays, anaRays, p);
        return t > 0 ? <circle key={`a${i}`} cx={p[0]} cy={p[1]} r={7} fill={C.bg} stroke={C.gray3} strokeWidth={1.8} opacity={t * others} /> : null;
      })}
      {BEN_OWN.map((p, i) => {
        const t = reached(BEN, T.benRays, benRays, p);
        return t > 0 ? <circle key={`b${i}`} cx={p[0]} cy={p[1]} r={7} fill={C.bg} stroke={C.gray3} strokeWidth={1.8} opacity={t * others} /> : null;
      })}

      {/* the people both know: light up, then step into the row and become name tags */}
      {SHARED.map((p, i) => {
        const seen = reached(ANA, T.anaRays, anaRays, p);
        if (seen <= 0) return null;
        const h = lit[i];
        const x = lerp(p[0], ROW[i][0], gather);
        const y = lerp(p[1], ROW[i][1], gather);
        const w = lerp(14, 70, gather);
        const ht = lerp(14, 28, gather);
        return (
          <g key={`s${i}`} opacity={seen}>
            <circle cx={x} cy={y} r={13 * h * (1 - gather)} fill={C.accent} opacity={0.28} />
            <rect
              x={x - w / 2}
              y={y - ht / 2}
              width={w}
              height={ht}
              rx={ht / 2}
              fill={h > 0 ? C.tint : C.bg}
              stroke={h > 0 ? C.accent : C.gray3}
              strokeWidth={1.8}
            />
            <circle cx={x} cy={y} r={4.5 * h * (1 - gather)} fill={C.accentHigh} />
            <text x={x} y={y + 4.6} textAnchor="middle" fontFamily={FONT} fontSize={13} fontWeight={600} fill={C.white} opacity={names}>
              {NAMES[i]}
            </text>
          </g>
        );
      })}

      {hub(ANA, anaHub, 'A')}
      {hub(BEN, benHub, 'B')}
    </svg>
  );
};
