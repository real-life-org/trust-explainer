import React from 'react';
import { useCurrentFrame } from '../../kit/timeline';
import { interpolate } from '../../kit/motion';
import { clamp, f } from '../../kit/time';
import { easeInOut, prog } from '../identity/shared';
import { NetworkStill } from '../relationship/Network';
import { ANA, ANA_OWN, APART, BEN, BEN_OWN, Hub, Mark, Ray, SHARED, useGraphBox, type Item, type Pt } from './graph';

/** Timings of the opening, on its own timeline. */
export const FROM_NETWORK_S = 2.4;
const FADE = { from: 0.3, to: 0.9 };
const SPLIT = { from: 1.0, to: 1.9 };

/** one star of the network, its centre, rays and the people and groups at their ends */
const Star: React.FC<{ c: Pt; own: Item[]; who: 'A' | 'B'; dx: number }> = ({ c, own, who, dx }) => (
  <g transform={`translate(${dx} 0)`}>
    {[...own, ...SHARED].map((it) => (
      <Ray key={it.id} a={c} b={it.at} />
    ))}
    {[...own, ...SHARED].map((it) => (
      <Mark key={`m${it.id}`} at={it.at} kind={it.kind} idx={it.c} opacity={1} />
    ))}
    <Hub at={c} who={who} opacity={1} />
  </g>
);

/**
 * The opening of chapter 07. It starts on chapter 03's network, exactly as
 * that chapter left it. The relationships among the others and the groups
 * fade; what stays are two stars, Ana's and Ben's, and they move apart: the
 * people both know now stand twice, once in each star.
 */
export const FromNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const box = useGraphBox();
  const extras = interpolate(frame, [f(FADE.from), f(FADE.to)], [1, 0], clamp);
  const split = prog(frame, SPLIT, easeInOut);

  return (
    <svg viewBox="0 0 400 300" width={400 * box.s} height={300 * box.s} style={{ position: 'absolute', left: box.x, top: box.y, overflow: 'visible' }}>
      <NetworkStill extras={extras} />
      <Star c={ANA} own={ANA_OWN} who="A" dx={-APART * split} />
      <Star c={BEN} own={BEN_OWN} who="B" dx={APART * split} />
    </svg>
  );
};
