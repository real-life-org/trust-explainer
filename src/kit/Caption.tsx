import React from 'react';
import { AbsoluteFill, useCurrentFrame } from './timeline';
import { interpolate } from './motion';
import { C, FONT } from './theme';
import type { Format } from './format';
import { useSequenceFade } from './ui';
import { CAPTION_FADE } from './chapter';

/**
 * One caption line at the top of the stage, for the length of its Sequence.
 * Three levels: `quiet` (an opening or closing line), plain (a numbered
 * step), `emphasis` (a principle's line: larger, unnumbered).
 */
export const Caption: React.FC<{ step?: number; text: string; F: Format; quiet?: boolean; emphasis?: boolean }> = ({
  step,
  text,
  F,
  quiet,
  emphasis,
}) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(CAPTION_FADE, CAPTION_FADE);
  const rise = interpolate(frame, [0, 10], [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: F.captionY,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          opacity,
          transform: `translateY(${rise}px)`,
          fontFamily: FONT,
          fontSize: emphasis ? F.captionSize * 1.5 : F.captionSize,
          fontWeight: quiet ? 500 : emphasis ? 700 : 650,
          letterSpacing: emphasis ? '-0.02em' : '-0.01em',
          color: quiet ? C.gray2 : C.white,
          padding: '0 48px',
          textAlign: 'center',
        }}
      >
        {step !== undefined ? (
          <span
            style={{
              width: F.captionSize * 1.3,
              height: F.captionSize * 1.3,
              borderRadius: '50%',
              background: C.tint,
              color: C.accentHigh,
              fontSize: F.captionSize * 0.62,
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
