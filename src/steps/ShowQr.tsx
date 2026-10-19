import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { C } from '../theme';
import { CODE, SCREEN } from '../layout';
import { QrCode } from '../components/QrCode';
import { Icon } from '../components/Icons';
import { At, Btn, Mono, Tap, usePress, useSequenceFade, useSpringAt } from '../components/ui';
import { PEOPLE } from '../theme';
import type { Who } from '../layout';

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
      <At top={46}>
        <div style={{ fontSize: 21, fontWeight: 700 }}>Verify a person</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Show your code, or scan theirs.</div>
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
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${qrScale})`,
          opacity: pop,
        }}
      >
        <QrCode data={DATA[who]} size={190} />
      </div>
      <At top={CODE.cy + CODE.box / 2 + 14}>
        <Mono size={11}>{PEOPLE[who].name}'s code · challenge {who === 'A' ? '7f3a 91c2' : 'b41e 07d9'}</Mono>
      </At>
      <At top={450} style={{ flexDirection: 'row', gap: 10, padding: '0 28px' }}>
        <div style={{ flex: 1, height: 1, background: C.line }} />
        <span style={{ fontSize: 12, color: C.faint }}>or</span>
        <div style={{ flex: 1, height: 1, background: C.line }} />
      </At>
      <At top={480}>
        <Btn kind="primary" scale={press} style={{ flex: 'none', width: 170 }}>
          <Icon name="scan" size={18} color="#fff" />
          Scan code
        </Btn>
      </At>
      {tapScanAt !== undefined ? <Tap at={tapScanAt} x={SCREEN.w / 2 + 30} y={503} /> : null}
    </AbsoluteFill>
  );
};
