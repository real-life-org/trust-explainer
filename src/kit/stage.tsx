import React from 'react';
import { AbsoluteFill, useCurrentFrame } from './timeline';
import { interpolate } from './motion';
import { C, FONT, MONO } from './theme';
import { PEOPLE, type Who } from './cast';
import type { Format } from './format';
import { PHONE, type Pt } from './geometry';
import { Avatar } from './ui';
import { clamp } from './time';

/** Navy background with a soft light behind the phones and the hero's fading dot grid. */
export const Background: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 60% at 50% 52%, oklch(26% 0.06 264 / 0.9), transparent 70%)`,
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${C.dot} 1.4px, transparent 1.4px)`,
        backgroundSize: '32px 32px',
        opacity: 0.5,
        maskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 20%, transparent 75%)',
      }}
    />
  </AbsoluteFill>
);

/**
 * Name and key under a phone whose home centre is `at` and scale `s`.
 * Fades in with the stage; `dim` (0..1) lets a chapter fade it while the
 * phone is away.
 */
export const NameTag: React.FC<{ who: Who; at: Pt; s: number; F: Format; dim?: number }> = ({
  who,
  at,
  s,
  F,
  dim = 1,
}) => {
  const frame = useCurrentFrame();
  const p = PEOPLE[who];
  const intro = interpolate(frame, [6, 24], [0, 1], clamp);
  const k = F.square ? 0.85 : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: at.x - 200,
        width: 400,
        top: at.y + (PHONE.h / 2) * s + 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: FONT,
        opacity: Math.min(dim, intro),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initial={p.initial} size={36 * k} tone={p.tone} />
        <span style={{ fontSize: 28 * k, fontWeight: 700, color: p.tone.stage }}>{p.name}</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 14 * k, color: C.gray3, marginTop: 6 }}>{p.key}</div>
    </div>
  );
};
