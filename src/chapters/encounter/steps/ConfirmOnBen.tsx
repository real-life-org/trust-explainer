import React from 'react';
import { AbsoluteFill, useCurrentFrame } from '../../../kit/timeline';
import { interpolate } from '../../../kit/motion';
import { C } from '../../../kit/theme';
import { PEOPLE } from '../../../kit/cast';
import { Icon } from '../../../kit/Icons';
import { At, Avatar, Btn, Tap, usePress, useSequenceFade } from '../../../kit/ui';
import { clamp } from '../../../kit/time';
import { Connected } from './Connected';

/** Where the Confirm button sits (screen-local), shared by the confirm screens and their taps. */
export const CONFIRM_BTN = { top: 380, h: 58 } as const;

/**
 * Step 2: the confirmation on Ben's phone. Ben confirms that Ana is the person
 * in front of him; the result line follows. At `connectedAt`, once Ana has
 * confirmed back and her credential has landed, it turns into "connected".
 * Frames are relative to this Sequence.
 */
export const ConfirmOnBen: React.FC<{ tapAt: number; connectedAt: number }> = ({ tapAt, connectedAt }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 8);
  const press = usePress(tapAt);
  const ask = interpolate(frame, [tapAt + 6, tapAt + 14], [1, 0], clamp);
  const done =
    interpolate(frame, [tapAt + 10, tapAt + 20], [0, 1], clamp) *
    interpolate(frame, [connectedAt, connectedAt + 8], [1, 0], clamp);
  const connected = interpolate(frame, [connectedAt + 4, connectedAt + 14], [0, 1], clamp);
  const a = PEOPLE.A;
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ opacity: ask }}>
        <At top={88} style={{ padding: '0 28px' }}>
          <div style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.2 }}>Is this the person in front of you?</div>
        </At>
        <At top={186}>
          <Avatar initial={a.initial} size={104} tone={a.tone} />
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 14, color: a.tone.ink }}>{a.name}</div>
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
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: '50%',
              background: C.successTint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${interpolate(done, [0, 1], [0.85, 1])})`,
            }}
          >
            <Icon name="shieldCheck" size={52} color={C.successInk} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 22 }}>You verified {a.name}</div>
        </At>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: connected }}>
        <Connected self="B" peer="A" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
