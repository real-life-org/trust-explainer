import React from 'react';
import { Timeline, useCurrentFrame, useVideoConfig } from '../../kit/timeline';
import { interpolate } from '../../kit/motion';
import { Background } from '../../kit/stage';
import { clamp, f } from '../../kit/time';
import { Encounter } from '../encounter/Encounter';
import { useLayout } from '../encounter/layout';
import { easeInOut, lerp, part, prog } from '../identity/shared';
import { ANA, ANA_OWN, BEN, BEN_OWN, EXTRA, GROUP_AREAS, GroupArea, Hub, ITEMS, Mark, Ray, SHARED, item, useGraphBox, type Item, type Pt } from '../relational-reading/graph';
import { ENCOUNTER_END_S, N } from './timings';

/*
 * The network chapter 07 later reads as two stars: every ray from Ana or
 * Ben, the relationships among the others, and two groups as soft areas.
 * It spreads outward from Ana and Ben; nobody moves once there.
 */
type RaySpec = { from: 'A' | 'B'; to: Item };
const centre = (who: 'A' | 'B'): Pt => (who === 'A' ? ANA : BEN);
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const RAY_DUR = 0.5;
const EXTRA_DUR = 0.4;

/** Ana's and Ben's rays, nearest first: the network grows outward from the two */
const RAYS: Array<RaySpec & { from_s: number }> = (() => {
  const all: RaySpec[] = [
    ...[...ANA_OWN, ...SHARED].map((to) => ({ from: 'A' as const, to })),
    ...[...BEN_OWN, ...SHARED].map((to) => ({ from: 'B' as const, to })),
  ];
  all.sort((p, q) => dist(centre(p.from), p.to.at) - dist(centre(q.from), q.to.at));
  return all.map((r, i) => ({ ...r, from_s: N.grow.from + i * 0.085 }));
})();

/** when each person or group appears: as the first ray reaches them */
const APPEAR: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  RAYS.forEach((r) => {
    const at = r.from_s + RAY_DUR * 0.7;
    out[r.to.id] = Math.min(out[r.to.id] ?? Infinity, at);
  });
  return out;
})();

/** relationships among the others, each once both of its people are there */
const EXTRAS: Array<{ a: string; b: string; from_s: number }> = EXTRA.map(([a, b]) => ({ a, b, from_s: Math.max(APPEAR[a], APPEAR[b]) + 0.15 }));

/** when the network stands complete (the last link drawn) */
export const NETWORK_GROWN_S = Math.max(...RAYS.map((r) => r.from_s + RAY_DUR), ...EXTRAS.map((e) => e.from_s + EXTRA_DUR));

/**
 * The finished network as chapter 07 opens on it: drawn with the same pieces,
 * so the hand-over is exact. `extras` fades the relationships among the
 * others, the groups and Ana and Ben's own link.
 */
export const NetworkStill: React.FC<{ extras: number }> = ({ extras }) => (
  <>
    {GROUP_AREAS.map((a) => (
      <GroupArea key={a.group} area={a} opacity={extras} />
    ))}
    {EXTRA.map(([a, b]) => (
      <Ray key={`${a}${b}`} a={item(a).at} b={item(b).at} opacity={extras} />
    ))}
    <Ray a={ANA} b={BEN} opacity={extras} />
  </>
);

/**
 * The close of chapter 03. It starts on the encounter's last frame: both
 * phones contract into Ana and Ben, the two are linked, and the network
 * spreads outward from them until its groups show.
 */
export const Network: React.FC = () => {
  const frame = useCurrentFrame();
  const cfg = useVideoConfig();
  const L = useLayout();
  const box = useGraphBox();

  const contract = prog(frame, N.contract, easeInOut);
  const dots = prog(frame, N.dots);
  const move = prog(frame, N.move, easeInOut);
  const link = prog(frame, N.link);
  const groups = prog(frame, N.groups);
  const t = (from_s: number, dur: number) => interpolate(frame, [f(from_s), f(from_s + dur)], [0, 1], clamp);

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

  // Ana and Ben: from the phones' places to the centres of the network, at the size of a star's centre
  const toBox = (p: { x: number; y: number }): Pt => [(p.x - box.x) / box.s, (p.y - box.y) / box.s];
  const hubAt = (who: 'A' | 'B'): Pt => {
    const home = toBox(L.home[who]);
    const c = centre(who);
    return [lerp(home[0], c[0], move), lerp(home[1], c[1], move)];
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Background />
      {half('A')}
      {half('B')}
      <svg viewBox="0 0 400 300" width={400 * box.s} height={300 * box.s} style={{ position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}>
        {/* groups, once the links grow dense */}
        {GROUP_AREAS.map((a) => (
          <GroupArea key={a.group} area={a} opacity={groups} />
        ))}
        {/* relationships among the others */}
        {EXTRAS.map((e) => (
          <Ray key={`${e.a}${e.b}`} a={item(e.a).at} b={item(e.b).at} t={t(e.from_s, EXTRA_DUR)} />
        ))}
        {/* Ana and Ben's own link, the first in the network */}
        <Ray a={ANA} b={BEN} t={move >= 1 ? link : 0} />
        {/* the rays of their two stars, nearest first */}
        {RAYS.map((r, i) => (
          <Ray key={i} a={centre(r.from)} b={r.to.at} t={t(r.from_s, RAY_DUR)} />
        ))}
        {ITEMS.map((it) => (
          <Mark key={it.id} at={it.at} kind={it.kind} idx={it.c} opacity={t(APPEAR[it.id] - 0.1, 0.2)} />
        ))}
        <Hub at={hubAt('A')} who="A" opacity={dots} scale={0.7 + 0.3 * dots} />
        <Hub at={hubAt('B')} who="B" opacity={dots} scale={0.7 + 0.3 * dots} />
      </svg>
    </div>
  );
};
