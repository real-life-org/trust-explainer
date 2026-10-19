import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, FONT } from '../theme';
import { Layout } from '../layout';
import { useSequenceFade } from '../components/ui';

/** One caption line at the top of the stage, for the length of its Sequence. */
export const Caption: React.FC<{ step?: number; text: string; L: Layout; quiet?: boolean }> = ({ step, text, L, quiet }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 8);
  const rise = interpolate(frame, [0, 10], [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: L.captionY,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          opacity,
          transform: `translateY(${rise}px)`,
          fontFamily: FONT,
          fontSize: L.captionSize,
          fontWeight: quiet ? 500 : 650,
          letterSpacing: '-0.01em',
          color: quiet ? C.gray2 : C.white,
          padding: '0 48px',
          textAlign: 'center',
        }}
      >
        {step !== undefined ? (
          <span
            style={{
              width: L.captionSize * 1.3,
              height: L.captionSize * 1.3,
              borderRadius: '50%',
              background: C.tint,
              color: C.accentHigh,
              fontSize: L.captionSize * 0.62,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {step}
          </span>
        ) : null}
        <span>{text}</span>
      </div>
    </AbsoluteFill>
  );
};
