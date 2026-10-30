import React from 'react';
import { Timeline, useCurrentFrame, useVideoConfig } from '../../kit/timeline';
import { interpolate } from '../../kit/motion';
import { PEOPLE } from '../../kit/cast';
import { PHONE } from '../../kit/geometry';
import { C } from '../../kit/theme';
import { clamp, f } from '../../kit/time';
import { useLayout } from '../encounter/layout';
import { useBox, easeInOut, lerp, part, prog } from '../identity/shared';
import { DocumentToDevices } from '../person/DocumentToDevices';
import { DURATION_S as PERSON_S } from '../person/timings';

import { P } from './timings';

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
  const dotA = { x: lerp(rc.x, L.home.A.x, part(anaDot, 0, 1)), y: lerp(rc.y, L.home.A.y, part(anaDot, 0, 1)) };

  const pw = PHONE.w * L.s;
  const ph = PHONE.h * L.s;
  const shape = (c: { x: number; y: number }, t: number, fill: string) => {
    const r = 22;
    const w = lerp(2 * r, pw, phones);
    const h = lerp(2 * r, ph, phones);
    const rx = lerp(r, PHONE.radius * L.s, phones);
    return t > 0 ? (
      <g opacity={t}>
        <rect x={c.x - w / 2} y={c.y - h / 2} width={w} height={h} rx={rx} fill={phones > 0 ? C.shell : fill} stroke={C.rim} strokeWidth={phones * 4} />
        {/* the person's colour stays as the dot shrinks into the phone */}
        <circle cx={c.x} cy={c.y} r={r * (1 - phones)} fill={fill} />
      </g>
    ) : null;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: out }}>
      {/* chapter 02's last picture, contracting toward the middle of the person */}
      {scale > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: `${rc.x}px ${rc.y}px`,
            transform: `scale(${scale})`,
            opacity: 1 - part(contract, 0.6, 1),
          }}
        >
          <Timeline {...cfg} frame={f(PERSON_S)} durationInFrames={f(PERSON_S)}>
            <DocumentToDevices />
          </Timeline>
        </div>
      ) : null}
      <svg width={cfg.width} height={cfg.height} style={{ position: 'absolute', left: 0, top: 0 }}>
        {shape(contract >= 1 ? L.home.A : dotA, anaDot, PEOPLE.A.tone.stage)}
        {shape(L.home.B, benDot, PEOPLE.B.tone.stage)}
      </svg>
    </div>
  );
};
