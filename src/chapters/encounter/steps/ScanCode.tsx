import React from 'react';
import { AbsoluteFill, useCurrentFrame } from '../../../kit/timeline';
import { interpolate, interpolateColors } from '../../../kit/motion';
import { C } from '../../../kit/theme';
import { SCREEN } from '../../../kit/geometry';
import { CODE } from '../layout';
import { At, useSequenceFade } from '../../../kit/ui';

/**
 * Step 2: Ben's scanner. The viewfinder is a hole cut through Ben's phone
 * (see Phone `hole`), so Ana's real code shows through it during the scan.
 * At `recognizedAt` (relative to this Sequence) the frame turns green.
 */
export const ScanCode: React.FC<{ recognizedAt: number }> = ({ recognizedAt }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 6);
  const ok = interpolate(frame, [recognizedAt, recognizedAt + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const frameColor = interpolateColors(ok, [0, 1], [C.viewfinder, C.success]);
  const outer = CODE.hole + 16;
  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: CODE.cy - 190,
          height: 400,
          borderRadius: 18,
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
          border: `${ok > 0.5 ? 6 : 3}px ${ok > 0.5 ? 'solid' : 'dashed'} ${frameColor}`,
        }}
      />
      <At top={CODE.cy + 210}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Scan the code</div>
      </At>
    </AbsoluteFill>
  );
};
