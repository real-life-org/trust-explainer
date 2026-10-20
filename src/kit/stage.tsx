import React from 'react';
import { AbsoluteFill, useCurrentFrame } from './timeline';
import { interpolate } from './motion';
import { C, FONT, MONO } from './theme';
import { PEOPLE, type Who } from './cast';
import type { Format } from './format';
import { PHONE, type Pt } from './geometry';
import { Icon } from './Icons';
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

/** Kicker in the top-left corner, "local first" in the top-right, like the site's encounter card. */
export const Header: React.FC<{ kicker: string; F: Format }> = ({ kicker, F }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 15], [0, 1], clamp);
  const k = F.square ? 0.85 : 1;
  return (
    <AbsoluteFill style={{ opacity: o, fontFamily: FONT }}>
      <div style={{ position: 'absolute', top: F.headerPad - 8, left: F.headerPad, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44 * k,
            height: 44 * k,
            borderRadius: 10,
            background: C.tint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="fingerprint" size={24 * k} color={C.accent} />
        </div>
        <div>
          <div style={{ fontSize: 15 * k, fontWeight: 650, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gray3 }}>
            {kicker}
          </div>
          <div style={{ fontSize: 15 * k, color: C.gray4, marginTop: 2 }}>Real Life Trust Protocol</div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: F.headerPad + 4,
          right: F.headerPad,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          fontSize: 16 * k,
          fontWeight: 600,
          color: C.accent,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.accent }} />
        local first
      </div>
    </AbsoluteFill>
  );
};

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
