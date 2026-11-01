import React from 'react';
import { AbsoluteFill } from './timeline';
import { C } from './theme';

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
