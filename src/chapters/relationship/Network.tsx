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

/** how many steps each person is from Ana or Ben; the pair at the edge is never reached */
const DEPTH: number[] = (() => {
  const d = NODES.map(() => Infinity);
  d[ANA] = 0;
  d[BEN] = 0;
  for (let changed = true; changed; ) {
    changed = false;
    LINKS.forEach(([a, b]) => {
      if (d[a] + 1 < d[b]) { d[b] = d[a] + 1; changed = true; }
      if (d[b] + 1 < d[a]) { d[a] = d[b] + 1; changed = true; }
    });
  }
  return d;
})();
const LAST_WAVE = Math.max(...DEPTH.filter(Number.isFinite)) + 1;
const wave = (n: number) => (Number.isFinite(DEPTH[n]) ? DEPTH[n] : LAST_WAVE);

/**
 * The network spreads outward from Ana and Ben in waves: each link starts
 * with the wave of its farther person, a little after its neighbours.
 */
const WAVE_GAP = 0.8;
const SCHEDULE: Array<{ from: number; to: number }> = (() => {
  const count = new Map<number, number>();
  return GROW.map(([a, b]) => {
    const w = Math.max(wave(a), wave(b));
    const k = count.get(w) ?? 0;
    count.set(w, k + 1);
    const from = N.grow.from + (w - 1) * WAVE_GAP + k * 0.1;
    return { from, to: from + 0.6 };
  });
})();

const GROUPS = [
  { cx: 290, cy: 225, rx: 175, ry: 150 },
  { cx: 535, cy: 250, rx: 135, ry: 125 },
];

/** Where Ana and Ben stand in the finished network, on the stage (chapter 07 starts from here). */
export function useNetworkPeople(): { A: Pt; B: Pt; r: number } {
  const M = useMap();
  return { A: M.at(NODES[ANA]), B: M.at(NODES[BEN]), r: 17 * M.s };
}

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
    const to = M.at(NODES[idx]);
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
  const at = (n: number): Pt => M.at(NODES[n]);
  /** a link grows from the person already there toward the one who joins */
  const lines = GROW.map(([a, b], i) => {
    const t = interpolate(frame, [f(SCHEDULE[i].from), f(SCHEDULE[i].to)], [0, 1], clamp);
    const [from, to] = wave(a) <= wave(b) ? [a, b] : [b, a];
    return { from, to, t: part(t, 0.2, 1), i };
  });
  /** a person appears with the first link that reaches them */
  const appear = (n: number) => {
    let best = 0;
    GROW.forEach(([a, b], i) => {
      if (a !== n && b !== n) return;
      best = Math.max(best, interpolate(frame, [f(SCHEDULE[i].from), f(SCHEDULE[i].from + 0.25)], [0, 1], clamp));
    });
    return best;
  };
  const others = NODES.map((_, i) => i).filter((i) => i !== ANA && i !== BEN);

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

        {/* links spreading outward from Ana and Ben */}
        {lines.map((l) => {
          if (l.t <= 0) return null;
          const p = at(l.from);
          const q = at(l.to);
          return <line key={`l${l.i}`} x1={p[0]} y1={p[1]} x2={lerp(p[0], q[0], l.t)} y2={lerp(p[1], q[1], l.t)} stroke={C.accent} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />;
        })}
        {others.map((n) => {
          const t = appear(n);
          if (t <= 0) return null;
          const [x, y] = at(n);
          return <circle key={n} cx={x} cy={y} r={R * (0.6 + 0.4 * t)} opacity={t} fill={C.bg} stroke={C.accent} strokeWidth={4} />;
        })}
        {/* Ana and Ben's own link, the first in the network */}
        {link > 0 ? (() => {
          const pa = M.at(NODES[ANA]);
          const pb = M.at(NODES[BEN]);
          return <line x1={pa[0]} y1={pa[1]} x2={lerp(pa[0], pb[0], link)} y2={lerp(pa[1], pb[1], link)} stroke={C.accent} strokeWidth={4} strokeLinecap="round" />;
        })() : null}
        {person('A', ANA)}
        {person('B', BEN)}
      </svg>
    </div>
  );
};
