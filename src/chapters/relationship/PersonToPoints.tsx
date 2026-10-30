import React from 'react';
import { Timeline, useCurrentFrame, useVideoConfig } from '../../kit/timeline';
import { interpolate } from '../../kit/motion';
import { PEOPLE } from '../../kit/cast';
import { FONT } from '../../kit/theme';
import { clamp, f } from '../../kit/time';
import { useLayout } from '../encounter/layout';
import { useBox, easeInOut, lerp, part, prog } from '../identity/shared';
import { DocumentToDevices } from '../person/DocumentToDevices';
import { DURATION_S as PERSON_S } from '../person/timings';
import { Encounter } from '../encounter/Encounter';

import { ENCOUNTER_REST_S, P } from './timings';

/** the centre of Ana's region in chapter 02, in that drawing's box units */
const REGION_C = { x: 202, y: 212 };

/**
 * The opening of chapter 03. It starts where chapter 02 ends: Ana's devices
 * inside her region, agent and relay outside. The person contracts to one
 * point, a second point appears for Ben, and both grow into the phones the
 * encounter starts from.
 */
export const PersonToPoints: React.FC = () => {
  const frame = useCurrentFrame();
  const cfg = useVideoConfig();
  const box = useBox();
  const L = useLayout();

  const contract = prog(frame, P.contract, easeInOut);
  const anaDot = prog(frame, P.anaDot);
  const benDot = prog(frame, P.benDot);
  const phones = prog(frame, P.phones, easeInOut);
  const out = interpolate(frame, [f(P.out.from), f(P.out.to)], [1, 0], clamp);

  // where the person's region sits on the stage, and where Ana's point goes
  const rc = { x: box.x + REGION_C.x * box.s, y: box.y + REGION_C.y * box.s };
  const scale = 1 - contract;

  /** the encounter at rest, both codes showing: what each point grows into */
  const restFrame = f(ENCOUNTER_REST_S);
  const half = (who: 'A' | 'B', t: number) => {
    const home = L.home[who];
    const g = phones;
    return t > 0 && g > 0 ? (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: who === 'A' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)',
          transformOrigin: `${home.x}px ${home.y}px`,
          transform: `scale(${lerp(0.06, 1, g)})`,
          opacity: part(g, 0, 0.35),
        }}
      >
        <Timeline {...cfg} frame={restFrame}>
          <Encounter />
        </Timeline>
      </div>
    ) : null;
  };
  const dot = (c: { x: number; y: number }, t: number, who: 'A' | 'B') =>
    t > 0 ? (
      <g opacity={t * (1 - part(phones, 0, 0.5))}>
        <circle cx={c.x} cy={c.y} r={24} fill={PEOPLE[who].tone.stage} />
        <text x={c.x} y={c.y + 70} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={600} fill={PEOPLE[who].tone.stage}>
          {PEOPLE[who].name}
        </text>
      </g>
    ) : null;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: out }}>
      {/* chapter 02's last picture, contracting toward the middle of the person */}
      {scale > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: `${rc.x}px ${rc.y}px`,
            // shrink and move at once, straight onto the place of Ana's point
            transform: `translate(${(L.home.A.x - rc.x) * contract}px, ${(L.home.A.y - rc.y) * contract}px) scale(${scale})`,
            opacity: 1 - part(contract, 0.6, 1),
          }}
        >
          <Timeline {...cfg} frame={f(PERSON_S)} durationInFrames={f(PERSON_S)}>
            <DocumentToDevices />
          </Timeline>
        </div>
      ) : null}
      <svg width={cfg.width} height={cfg.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {dot(L.home.A, anaDot, 'A')}
        {dot(L.home.B, benDot, 'B')}
      </svg>
      {half('A', anaDot)}
      {half('B', benDot)}
    </div>
  );
};
