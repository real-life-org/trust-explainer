import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { PEOPLE } from '../../../kit/cast';
import { At, Avatar, Btn, Tap, usePress, useSequenceFade } from '../../../kit/ui';
import { clamp } from '../../../kit/time';
import { CONFIRM_BTN } from './ConfirmOnBen';

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
  const { A: a, B: b } = PEOPLE;
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ opacity: ask }}>
        <At top={88} style={{ padding: '0 28px' }}>
          <div style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.2 }}>Verify {b.name} back?</div>
        </At>
        <At top={186}>
          <Avatar initial={b.initial} size={104} tone={b.tone} />
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 14, color: b.tone.ink }}>{b.name}</div>
        </At>
        <At top={CONFIRM_BTN.top} style={{ padding: '0 28px', alignItems: 'stretch' }}>
          <Btn kind="confirm" scale={press} style={{ flex: 'none' }}>
            Confirm
          </Btn>
        </At>
        <Tap at={tapAt} x={210} y={CONFIRM_BTN.top + CONFIRM_BTN.h / 2} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: done }}>
        <At top={170}>
          <div style={{ display: 'flex' }}>
            <Avatar initial={a.initial} size={96} tone={a.tone} ring />
            <div style={{ marginLeft: -20 }}>
              <Avatar initial={b.initial} size={96} tone={b.tone} ring />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 22 }}>Connected with {b.name}</div>
        </At>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
