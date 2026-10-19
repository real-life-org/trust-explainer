import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, PEOPLE } from '../theme';
import { At, Avatar, Btn, Mono, Tap, usePress, useSequenceFade } from '../components/ui';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * Step 5: the counter-confirmation on Ana's phone, then "connected".
 * `tapAt` is relative to this Sequence.
 */
export const ConfirmBackOnAna: React.FC<{ tapAt: number }> = ({ tapAt }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 8);
  const press = usePress(tapAt);
  const ask = interpolate(frame, [tapAt + 6, tapAt + 14], [1, 0], clamp);
  const done = interpolate(frame, [tapAt + 10, tapAt + 20], [0, 1], clamp);
  const b = PEOPLE.B;
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ opacity: ask }}>
        <At top={46}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.successInk }}>Ben verified you</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>Verify Ben back?</div>
        </At>
        <At top={126}>
          <Avatar initial={b.initial} size={76} />
          <div style={{ fontSize: 21, fontWeight: 600, marginTop: 10 }}>{b.name}</div>
          <Mono size={11} style={{ marginTop: 6 }}>
            {b.key}
          </Mono>
        </At>
        <At top={290} style={{ padding: '0 34px' }}>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.45 }}>
            Confirm if Ben is the person you just met.
          </div>
        </At>
        <At top={372} style={{ flexDirection: 'row', gap: 12, padding: '0 24px' }}>
          <Btn kind="ghost">Not now</Btn>
          <Btn kind="confirm" scale={press}>
            Confirm
          </Btn>
        </At>
        <Tap at={tapAt} x={235} y={395} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: done }}>
        <At top={120}>
          <div style={{ display: 'flex' }}>
            <Avatar initial="A" size={66} ring />
            <div style={{ marginLeft: -14 }}>
              <Avatar initial="B" size={66} tone="green" ring />
            </div>
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, marginTop: 18 }}>You and Ben are connected</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8, padding: '0 40px', lineHeight: 1.45 }}>
            Each of you now holds a signed credential from the other.
          </div>
        </At>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
