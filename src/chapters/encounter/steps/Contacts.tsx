import React from 'react';
import { AbsoluteFill, useCurrentFrame } from '../../../kit/timeline';
import { interpolate } from '../../../kit/motion';
import { C, NEUTRAL, type Tone } from '../../../kit/theme';
import { ROWS } from '../layout';
import { Icon } from '../../../kit/Icons';
import { Avatar, useSequenceFade, useSpringAt } from '../../../kit/ui';
import { clamp } from '../../../kit/time';
const ROW_TOP = ROWS.top;
const ROW_H = ROWS.h;

type Person = { name: string; initial: string; tone?: Tone };

/**
 * Step 4: the new contact in the list. The new row takes over from the received credential, which jumps onto its
 * place (see CredentialFlight); the row keeps a green "signed" line.
 * All frame props are relative to this Sequence.
 */
export const Contacts: React.FC<{
  peer: Person;
  others: Array<Person & { trusted: boolean }>;
  roomAt: number;
  newRowAt: number;
}> = ({ peer, others, roomAt, newRowAt }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 0);
  const room = useSpringAt(roomAt, 200, 14);
  const inP = interpolate(frame, [newRowAt, newRowAt + 5], [0, 1], clamp);
  const fresh = interpolate(frame, [newRowAt, newRowAt + 10, newRowAt + 70], [0, 1, 0.4], clamp);

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: 'absolute', top: 76, left: 24, fontSize: 28, fontWeight: 700 }}>Contacts</div>

      {/* the new contact */}
      <div
        style={{
          position: 'absolute',
          top: ROW_TOP,
          left: 10,
          right: 10,
          height: ROW_H - 8,
          borderRadius: 16,
          background: `oklch(93% 0.05 264 / ${fresh})`,
          opacity: inP,
        }}
      >
        <Row person={peer} signed>
          <TrustButtonIdle />
        </Row>
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 10,
            padding: '1px 7px',
            borderRadius: 999,
            background: C.primary,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            opacity: interpolate(fresh, [0.4, 1], [0, 1], clamp),
          }}
        >
          NEW
        </div>
      </div>

      {/* existing contacts move down to make room */}
      {others.map((o, i) => (
        <div
          key={o.name}
          style={{ position: 'absolute', top: ROW_TOP + (i + room) * ROW_H, left: 10, right: 10, height: ROW_H - 8 }}
        >
          <Row person={o} muted>
            {o.trusted ? <Icon name="shieldCheck" size={26} color={C.primary} /> : null}
          </Row>
        </div>
      ))}

    </AbsoluteFill>
  );
};

const Row: React.FC<{ person: Person; muted?: boolean; signed?: boolean; children?: React.ReactNode }> = ({
  person,
  muted,
  signed,
  children,
}) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px' }}>
    <Avatar initial={person.initial} size={52} tone={person.tone ?? NEUTRAL} />
    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
      <div style={{ fontSize: 21, fontWeight: 650, color: muted ? 'oklch(40% 0.008 265)' : C.ink }}>{person.name}</div>
      {signed ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            marginTop: 3,
            fontSize: 12.5,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: C.successInk,
          }}
        >
          <Icon name="shieldCheck" size={13} color={C.success} />
          signed
        </div>
      ) : null}
    </div>
    {children}
  </div>
);

const pill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: 42,
  padding: '0 15px',
  borderRadius: 999,
  boxSizing: 'border-box',
  fontSize: 17,
  fontWeight: 650,
};

/** Untouched: the contact exists, trust is not given yet. */
const TrustButtonIdle: React.FC = () => (
  <div style={{ ...pill, border: `2px solid oklch(80% 0.06 264)`, color: C.primary }}>
    <Icon name="shield" size={19} color={C.primary} />
    Trust
  </div>
);
