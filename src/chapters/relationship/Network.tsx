import React from 'react';
import { Timeline, useCurrentFrame, useVideoConfig } from '../../kit/timeline';
import { PEOPLE } from '../../kit/cast';
import { useFormat } from '../../kit/format';
import { Background } from '../../kit/stage';
import { C, FONT } from '../../kit/theme';
import { f } from '../../kit/time';
import { Encounter } from '../encounter/Encounter';
import { useLayout } from '../encounter/layout';
import { easeInOut, lerp, part, prog, stagger } from '../identity/shared';
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

  const others = NODES.map((_, i) => i).filter((i) => i !== ANA && i !== BEN);
  const order = new Map<number, number>();
  // links and people appear in the order of the links list, skipping the pair that already met
  let k = 0;
  LINKS.forEach(([a, b]) => {
    [a, b].forEach((n) => {
      if (n !== ANA && n !== BEN && !order.has(n)) order.set(n, k++);
    });
  });
  const growLinks = LINKS.filter(([a, b]) => !((a === ANA && b === BEN) || (a === BEN && b === ANA)));

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

        {/* the network growing, link by link */}
        {growLinks.map(([a, b], i) => {
          const t = stagger(frame, N.grow, i, growLinks.length, 0.25);
          if (t <= 0) return null;
          const pa = M.at(NODES[a]);
          const pb = M.at(NODES[b]);
          return <line key={i} x1={pa[0]} y1={pa[1]} x2={lerp(pa[0], pb[0], t)} y2={lerp(pa[1], pb[1], t)} stroke={C.accent} strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />;
        })}
        {/* Ana and Ben's own link, the first in the network */}
        {link > 0 ? (() => {
          const pa = M.at(NODES[ANA]);
          const pb = M.at(NODES[BEN]);
          return <line x1={pa[0]} y1={pa[1]} x2={lerp(pa[0], pb[0], link)} y2={lerp(pa[1], pb[1], link)} stroke={C.accent} strokeWidth={4} strokeLinecap="round" />;
        })() : null}
        {others.map((n) => {
          const t = stagger(frame, N.grow, order.get(n) ?? 0, others.length, 0.3);
          if (t <= 0) return null;
          const [x, y] = M.at(NODES[n]);
          return <circle key={n} cx={x} cy={y} r={14 * M.s * (0.6 + 0.4 * t)} opacity={t} fill={C.bg} stroke={C.accent} strokeWidth={4} />;
        })}
        {person('A', ANA)}
        {person('B', BEN)}
      </svg>
    </div>
  );
};
