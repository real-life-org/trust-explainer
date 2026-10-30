import React from 'react';
import { Timeline, useCurrentFrame, useVideoConfig } from '../../kit/timeline';
import { PEOPLE } from '../../kit/cast';
import { useFormat } from '../../kit/format';
import { Background } from '../../kit/stage';
import { C, FONT } from '../../kit/theme';
import { clamp, f } from '../../kit/time';
import { interpolate } from '../../kit/motion';
import { Encounter } from '../encounter/Encounter';
import { useLayout } from '../encounter/layout';
import { easeInOut, lerp, part, prog } from '../identity/shared';
import { ENCOUNTER_END_S, N } from './timings';

type Pt = [number, number];

/*
 * The network of the deck slide 03, in its own units (752 × 460). Ana and
 * Ben are the pair that just met: Ben is the one who ends up in both groups.
 */
const ANA = 2;
const BEN = 11;
const NODES: Pt[] = [
  [180, 160], [300, 120], [360, 220], [290, 320], [180, 280],
  [530, 160], [630, 210], [600, 330], [700, 420], [60, 400], [150, 430], [440, 250],
];
const LINKS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3], [1, 4], [0, 3],
  [3, 11], [11, 5], [5, 6], [6, 7], [7, 11], [11, 6], [5, 7], [7, 8], [9, 10],
];
/** the encounters after Ana and Ben's, outward from the two of them; the pair at the edge meets last */
const GROW: Array<[number, number]> = (() => {
  const rest = LINKS.filter(([a, b]) => !((a === ANA && b === BEN) || (a === BEN && b === ANA)));
  const seen = new Set([ANA, BEN]);
  const out: Array<[number, number]> = [];
  while (rest.length) {
    const i = rest.findIndex(([a, b]) => seen.has(a) || seen.has(b));
    const [l] = rest.splice(i < 0 ? 0 : i, 1);
    out.push(l);
    seen.add(l[0]);
    seen.add(l[1]);
  }
  return out;
})();

/**
 * When each encounter runs, in seconds on this part's timeline: the first
 * three one at a time, so the pattern can be read; then closer together.
 */
const SCHEDULE: Array<{ from: number; to: number }> = (() => {
  const out: Array<{ from: number; to: number }> = [];
  let t = N.grow.from;
  GROW.forEach((_, i) => {
    const slow = i < 3;
    const dur = slow ? 0.9 : 0.62;
    out.push({ from: t, to: t + dur });
    t += slow ? 0.95 : 0.27;
  });
  return out;
})();

/** who is new in each encounter: the one not yet in the network (both, for the pair at the edge) */
const NEWCOMERS: number[][] = (() => {
  const seen = new Set([ANA, BEN]);
  return GROW.map(([a, b]) => {
    const fresh = [a, b].filter((n) => !seen.has(n));
    seen.add(a);
    seen.add(b);
    return fresh;
  });
})();

const GROUPS = [
  { cx: 290, cy: 225, rx: 175, ry: 150 },
  { cx: 535, cy: 250, rx: 135, ry: 125 },
];

function useMap() {
  const F = useFormat();
  const m = F.square ? { x: 51, y: 330, s: 1.3 } : { x: 377, y: 262, s: 1.55 };
  return { ...m, at: (p: Pt): Pt => [m.x + p[0] * m.s, m.y + p[1] * m.s] };
}

/**
 * The close of chapter 03. It starts on the encounter's last frame: both
 * phones contract into Ana and Ben, the two become a linked pair, and pair by
 * pair others meet until the network stands and its groups show.
 */
export const Network: React.FC = () => {
  const frame = useCurrentFrame();
  const cfg = useVideoConfig();
  const L = useLayout();
  const M = useMap();

  const contract = prog(frame, N.contract, easeInOut);
  const dots = prog(frame, N.dots);
  const move = prog(frame, N.move, easeInOut);
  const link = prog(frame, N.link);
  const groups = prog(frame, N.groups);

  /** the encounter's last frame, one phone per half, shrinking into its point */
  const half = (who: 'A' | 'B') => {
    const home = L.home[who];
    if (contract >= 1) return null;
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: who === 'A' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
          transformOrigin: `${home.x}px ${home.y}px`,
          transform: `scale(${lerp(1, 0.06, contract)})`,
          opacity: 1 - part(contract, 0.7, 1),
        }}
      >
        <Timeline {...cfg} frame={f(ENCOUNTER_END_S)}>
          <Encounter />
        </Timeline>
      </div>
    );
  };

  // Ana and Ben: from star centres at the phones' places to two nodes of the network
  const person = (who: 'A' | 'B', idx: number) => {
    const home: Pt = [L.home[who].x, L.home[who].y];
    const to = at(idx);
    const x = lerp(home[0], to[0], move);
    const y = lerp(home[1], to[1], move);
    const r = lerp(57, 17 * M.s, move);
    const tone = PEOPLE[who].tone.stage;
    return dots > 0 ? (
      <g key={who} opacity={dots}>
        <circle cx={x} cy={y} r={r * (0.7 + 0.3 * dots)} fill={tone} />
        <text x={x} y={y + lerp(12, 17 * M.s + 34, move)} textAnchor="middle" fontFamily={FONT} fontSize={lerp(34, 26, move)} fontWeight={700} fill={move > 0.5 ? tone : C.bg}>
          {PEOPLE[who].name}
        </text>
      </g>
    ) : null;
  };

  const R = 14 * M.s; // a person's radius in the network
  const centre = M.at([400, 270]);
  const unit = (from: Pt, to: Pt): Pt => {
    const d = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
    return [(to[0] - from[0]) / d, (to[1] - from[1]) / d];
  };

  /*
   * Each encounter: a newcomer appears a little outside, walks to the one it
   * meets and back to its place; two who are already there both step toward
   * each other. Where they touch, a soft ring; from there the link grows to
   * both of them. Everyone's offset from their place is summed per frame.
   */
  const offset = new Map<number, Pt>();
  const shown = new Map<number, number>();
  const rings: Array<{ at: Pt; t: number }> = [];
  const lines: Array<{ from: Pt; a: number; b: number; t: number }> = [];
  GROW.forEach(([na, nb], i) => {
    const t = interpolate(frame, [f(SCHEDULE[i].from), f(SCHEDULE[i].to)], [0, 1], clamp);
    if (t <= 0) return;
    const pa = M.at(NODES[na]);
    const pb = M.at(NODES[nb]);
    const fresh = NEWCOMERS[i];
    const go = part(t, 0.12, 0.45);
    const back = part(t, 0.55, 0.88);
    const step = easeInOut(go) * (1 - easeInOut(back)); // out and home again
    let touch: Pt;
    if (fresh.length === 1) {
      const n = fresh[0];
      const other = n === na ? nb : na;
      const pn = M.at(NODES[n]);
      const po = M.at(NODES[other]);
      const out = unit(centre, pn);
      const spawn: Pt = [pn[0] + out[0] * 90, pn[1] + out[1] * 90];
      const u = unit(po, pn);
      const meet: Pt = [po[0] + u[0] * 2.1 * R, po[1] + u[1] * 2.1 * R];
      // the newcomer: from where it appears to the meeting and on to its own place
      const pos: Pt = back > 0 ? [lerp(meet[0], pn[0], easeInOut(back)), lerp(meet[1], pn[1], easeInOut(back))] : [lerp(spawn[0], meet[0], easeInOut(go)), lerp(spawn[1], meet[1], easeInOut(go))];
      offset.set(n, [pos[0] - pn[0], pos[1] - pn[1]]);
      shown.set(n, part(t, 0, 0.12));
      touch = [lerp(po[0], meet[0], 0.5), lerp(po[1], meet[1], 0.5)];
    } else {
      // both step toward each other until they touch, then home
      const mid: Pt = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      const half = Math.max(0, Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) / 2 - 1.05 * R);
      const ua = unit(pa, pb);
      [na, nb].forEach((n, k) => {
        const sgn = k === 0 ? 1 : -1;
        const prev = offset.get(n) ?? [0, 0];
        offset.set(n, [prev[0] + sgn * ua[0] * half * step, prev[1] + sgn * ua[1] * half * step]);
        if (fresh.includes(n)) shown.set(n, part(t, 0, 0.12));
      });
      touch = mid;
    }
    const ring = part(t, 0.4, 0.7);
    if (ring > 0 && ring < 1) rings.push({ at: touch, t: ring });
    lines.push({ from: touch, a: na, b: nb, t: part(t, 0.5, 0.9) });
  });
  function at(n: number): Pt {
    const p = M.at(NODES[n]);
    const o = offset.get(n) ?? [0, 0];
    return [p[0] + o[0], p[1] + o[1]];
  }
  const others = NODES.map((_, i) => i).filter((i) => i !== ANA && i !== BEN);
  const everShown = (n: number) => shown.get(n) ?? (GROW.some(([a, b], i) => (a === n || b === n) && frame >= f(SCHEDULE[i].to)) ? 1 : 0);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Background />
      {half('A')}
      {half('B')}
      <svg width={cfg.width} height={cfg.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* groups, once the links grow dense */}
        <g opacity={groups}>
          {GROUPS.map((g, i) => {
            const [cx, cy] = M.at([g.cx, g.cy]);
            return <ellipse key={i} cx={cx} cy={cy} rx={g.rx * M.s} ry={g.ry * M.s} fill={C.accent} fillOpacity={0.07} stroke={C.accent} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="8 8" />;
          })}
          <text x={M.at([110, 0])[0]} y={M.at([0, 62])[1]} fontFamily={FONT} fontSize={26} fontWeight={600} fill={C.accentHigh}>a group</text>
          <text x={M.at([670, 0])[0]} y={M.at([0, 112])[1]} textAnchor="end" fontFamily={FONT} fontSize={26} fontWeight={600} fill={C.accentHigh}>another group</text>
          <text x={M.at([40, 0])[0]} y={M.at([0, 480])[1]} fontFamily={FONT} fontSize={24} fill={C.gray3}>just two people</text>
        </g>

        {/* links, each grown out of the place where two people met */}
        {lines.map((l, i) => {
          if (l.t <= 0) return null;
          // once grown, a link follows its two people wherever they step
          const a = at(l.a);
          const b = at(l.b);
          if (l.t >= 1) return <line key={`l${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.accent} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />;
          return (
            <g key={`l${i}`} stroke={C.accent} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round">
              <line x1={l.from[0]} y1={l.from[1]} x2={lerp(l.from[0], a[0], l.t)} y2={lerp(l.from[1], a[1], l.t)} />
              <line x1={l.from[0]} y1={l.from[1]} x2={lerp(l.from[0], b[0], l.t)} y2={lerp(l.from[1], b[1], l.t)} />
            </g>
          );
        })}
        {/* the moment of meeting */}
        {rings.map((r, i) => (
          <circle key={`r${i}`} cx={r.at[0]} cy={r.at[1]} r={R * (1 + 1.6 * r.t)} fill="none" stroke={C.accentHigh} strokeWidth={2.5} opacity={0.7 * (1 - r.t)} />
        ))}
        {others.map((n) => {
          const t = everShown(n);
          if (t <= 0) return null;
          const [x, y] = at(n);
          return <circle key={n} cx={x} cy={y} r={R * (0.6 + 0.4 * t)} opacity={t} fill={C.bg} stroke={C.accent} strokeWidth={4} />;
        })}
        {/* Ana and Ben's own link, the first in the network */}
        {link > 0 ? (() => {
          const pa = at(ANA);
          const pb = at(BEN);
          return <line x1={pa[0]} y1={pa[1]} x2={lerp(pa[0], pb[0], link)} y2={lerp(pa[1], pb[1], link)} stroke={C.accent} strokeWidth={4} strokeLinecap="round" />;
        })() : null}
        {person('A', ANA)}
        {person('B', BEN)}
      </svg>
    </div>
  );
};
