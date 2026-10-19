import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C } from '../theme';
import { PEOPLE } from '../theme';
import { Icon } from '../components/Icons';
import { At, Avatar, Btn, Mono, Tap, usePress, useSequenceFade } from '../components/ui';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * Step 3: the confirmation on Ben's phone. Ben confirms that Ana is the person
 * in front of him; the screen then says his credential goes to Ana.
 * `tapAt` is relative to this Sequence.
 */
export const ConfirmOnBen: React.FC<{ tapAt: number }> = ({ tapAt }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 8);
  const press = usePress(tapAt);
  const ask = interpolate(frame, [tapAt + 6, tapAt + 14], [1, 0], clamp);
  const done = interpolate(frame, [tapAt + 10, tapAt + 20], [0, 1], clamp);
  const a = PEOPLE.A;
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ opacity: ask }}>
        <At top={48} style={{ padding: '0 30px' }}>
          <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.25 }}>Is this the person in front of you?</div>
        </At>
        <At top={126}>
          <Avatar initial={a.initial} size={76} />
          <div style={{ fontSize: 21, fontWeight: 600, marginTop: 10 }}>{a.name}</div>
          <Mono size={11} style={{ marginTop: 6 }}>
            {a.key}
          </Mono>
        </At>
        <At top={290} style={{ padding: '0 34px' }}>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.45 }}>
            Confirm only if you are meeting them right now. No machine takes this step for you.
          </div>
        </At>
        <At top={372} style={{ flexDirection: 'row', gap: 12, padding: '0 24px' }}>
          <Btn kind="cancel">Cancel</Btn>
          <Btn kind="confirm" scale={press}>
            Confirm
          </Btn>
        </At>
        <Tap at={tapAt} x={235} y={395} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: done }}>
        <At top={120}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: C.successTint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${interpolate(done, [0, 1], [0.85, 1])})`,
            }}
          >
            <Icon name="shieldCheck" size={38} color={C.successInk} />
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, marginTop: 18 }}>You verified Ana</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8, padding: '0 40px', lineHeight: 1.45 }}>
            Your signed credential goes to her. Hers about you comes back.
          </div>
        </At>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
