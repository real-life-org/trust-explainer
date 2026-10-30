import React from 'react';
import { Timeline, useCurrentFrame, useVideoConfig } from '../../kit/timeline';
import { interpolate } from '../../kit/motion';
import { PEOPLE } from '../../kit/cast';
import { C, FONT } from '../../kit/theme';
import { clamp, f } from '../../kit/time';
import { easeInOut, lerp, part, prog } from '../identity/shared';
import { Network, useNetworkPeople } from '../relationship/Network';
import { NETWORK_S } from '../relationship/timings';
import { useStarCentres } from './OverlaidStars';

/** Timings of the opening, on its own timeline. */
export const FROM_NETWORK_S = 2.3;
const FADE = { from: 0.3, to: 0.9 };
const MOVE = { from: 0.6, to: 1.6 };

/**
 * The opening of chapter 07. It starts on chapter 03's last frame, the
 * network with its groups. Everything but Ana and Ben fades; the two move
 * apart and grow into the centres their stars will grow from.
 */
export const FromNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const cfg = useVideoConfig();
  const from = useNetworkPeople();
  const to = useStarCentres();
  const fade = interpolate(frame, [f(FADE.from), f(FADE.to)], [1, 0], clamp);
  const move = prog(frame, MOVE, easeInOut);

  const person = (who: 'A' | 'B') => {
    const tone = PEOPLE[who].tone.stage;
    const x = lerp(from[who][0], to[who][0], move);
    const y = lerp(from[who][1], to[who][1], move);
    const r = lerp(from.r, to.r, move);
    return (
      <g key={who}>
        <circle cx={x} cy={y} r={r} fill={tone} />
        {/* the name under the node gives way to the name inside the centre, as on the stars */}
        <text x={x} y={y + r + 34} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={700} fill={tone} opacity={1 - part(move, 0, 0.4)}>
          {PEOPLE[who].name}
        </text>
        <text x={x} y={y + 12} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={700} fill={C.bg} opacity={part(move, 0.6, 1)}>
          {PEOPLE[who].name}
        </text>
      </g>
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
        <Timeline {...cfg} frame={f(NETWORK_S)} durationInFrames={f(NETWORK_S)}>
          <Network />
        </Timeline>
      </div>
      <svg width={cfg.width} height={cfg.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {person('A')}
        {person('B')}
      </svg>
    </div>
  );
};
