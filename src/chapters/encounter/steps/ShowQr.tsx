import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { C } from '../../../kit/theme';
import { SCREEN } from '../../../kit/geometry';
import type { Who } from '../../../kit/cast';
import { CODE } from '../layout';
import { QrCode } from '../../../kit/QrCode';
import { Icon } from '../../../kit/Icons';
import { At, Btn, Tap, usePress, useSequenceFade, useSpringAt } from '../../../kit/ui';

const DATA: Record<Who, string> = {
  A: 'rltp:encounter-scan@0.25;did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK;c=7f3a91c2',
  B: 'rltp:encounter-scan@0.25;did:key:z6MkrJVnaZkeFzdQyMZu1cgjg7k1pZZ6pvBQ7XJPt4swbTQ2;c=b41e07d9',
};

/**
 * Step 1: a phone shows its owner's code. With `tapScanAt` (relative to this
 * Sequence) the owner taps "Scan code" to open the scanner.
 */
export const ShowQr: React.FC<{ who: Who; tapScanAt?: number }> = ({ who, tapScanAt }) => {
  const opacity = useSequenceFade(8, 8);
  const press = usePress(tapScanAt ?? -100);
  const pop = useSpringAt(4);
  const qrScale = interpolate(pop, [0, 1], [0.9, 1]);
  return (
    <AbsoluteFill style={{ opacity }}>
      <At top={82}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>My code</div>
      </At>
      <div
        style={{
          position: 'absolute',
          left: (SCREEN.w - CODE.box) / 2,
          top: CODE.cy - CODE.box / 2,
          width: CODE.box,
          height: CODE.box,
          boxSizing: 'border-box',
          background: '#fff',
          border: `2px solid ${C.line}`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${qrScale})`,
          opacity: pop,
        }}
      >
        <QrCode data={DATA[who]} size={190} />
      </div>
      <At top={420}>
        <Btn kind="primary" scale={press} style={{ flex: 'none', width: 220 }}>
          <Icon name="scan" size={22} color="#fff" />
          Scan code
        </Btn>
      </At>
      {tapScanAt !== undefined ? <Tap at={tapScanAt} x={SCREEN.w / 2 + 40} y={449} /> : null}
    </AbsoluteFill>
  );
};
