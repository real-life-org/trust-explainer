import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { C, MONO } from '../theme';
import { CODE, SCREEN } from '../layout';
import { Icon } from '../components/Icons';
import { At, useSequenceFade, useSpringAt } from '../components/ui';

/**
 * Step 2: Ben's scanner. The viewfinder is a hole cut through Ben's phone
 * (see Phone `hole`), so Ana's real code shows through it during the scan.
 * `recognizedAt` is relative to this Sequence.
 */
export const ScanCode: React.FC<{ recognizedAt: number }> = ({ recognizedAt }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 6);
  const ok = interpolate(frame, [recognizedAt, recognizedAt + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pill = useSpringAt(recognizedAt);
  const frameColor = interpolateColors(ok, [0, 1], [C.viewfinder, C.success]);
  const outer = CODE.hole + 14;
  return (
    <AbsoluteFill style={{ opacity }}>
      <At top={50}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Point at Ana's code</div>
      </At>
      <div
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: CODE.cy - 180,
          height: 360,
          borderRadius: 16,
          background: C.camera,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: (SCREEN.w - outer) / 2,
          top: CODE.cy - outer / 2,
          width: outer,
          height: outer,
          boxSizing: 'border-box',
          borderRadius: 14,
          border: `2.5px ${ok > 0.5 ? 'solid' : 'dashed'} ${frameColor}`,
        }}
      />
      <At top={CODE.cy - 168} style={{ opacity: pill, transform: `translateY(${(1 - pill) * -6}px)` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: C.success,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Icon name="check" size={14} color="#fff" strokeWidth={3} />
          Code recognized
        </div>
      </At>
      <At top={CODE.cy + 152}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: 'oklch(82% 0.01 247)' }}>
          camera · captures automatically
        </span>
      </At>
      <At top={500}>
        <span style={{ fontSize: 14, color: C.muted }}>Cancel</span>
      </At>
    </AbsoluteFill>
  );
};
