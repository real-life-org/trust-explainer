import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { C, NEUTRAL, type Tone } from '../theme';
import { Icon } from '../components/Icons';
import { Avatar, Tap, usePress, useSequenceFade, useSpringAt } from '../components/ui';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ROW_TOP = 132;
const ROW_H = 84;

type Person = { name: string; initial: string; tone?: Tone };

/**
 * Step 6 (new contact in the list) and, when `trust` is given, step 7: the
 * user marks the new contact as trusted with one deliberate tap.
 * All frame props are relative to this Sequence.
 */
export const Contacts: React.FC<{
  peer: Person;
  others: Array<Person & { trusted: boolean }>;
  newRowAt: number;
  trust?: { highlightAt: number; tapAt: number };
}> = ({ peer, others, newRowAt, trust }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 0);
  const inP = useSpringAt(newRowAt);
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
          transform: `translateY(${(1 - inP) * -20}px)`,
        }}
      >
        <Row person={peer}>{trust ? <TrustButton {...trust} /> : <TrustButtonIdle />}</Row>
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
          style={{ position: 'absolute', top: ROW_TOP + (i + inP) * ROW_H, left: 10, right: 10, height: ROW_H - 8 }}
        >
          <Row person={o} muted>
            {o.trusted ? <Icon name="shieldCheck" size={26} color={C.primary} /> : null}
          </Row>
        </div>
      ))}

      {trust ? <Tap at={trust.tapAt} x={258} y={ROW_TOP + (ROW_H - 8) / 2} /> : null}
    </AbsoluteFill>
  );
};

const Row: React.FC<{ person: Person; muted?: boolean; children?: React.ReactNode }> = ({ person, muted, children }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px' }}>
    <Avatar initial={person.initial} size={52} tone={person.tone ?? NEUTRAL} />
    <div style={{ flex: 1, minWidth: 0, fontSize: 21, fontWeight: 650, color: muted ? 'oklch(40% 0.008 265)' : C.ink }}>
      {person.name}
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

/** The trust act: highlighted, tapped once, then filled. */
const TrustButton: React.FC<{ highlightAt: number; tapAt: number }> = ({ highlightAt, tapAt }) => {
  const frame = useCurrentFrame();
  const press = usePress(tapAt);
  const ring = interpolate(frame, [highlightAt, highlightAt + 12, tapAt, tapAt + 10], [0, 1, 1, 0], clamp);
  const on = interpolate(frame, [tapAt, tapAt + 6], [0, 1], clamp);
  const bg = interpolateColors(on, [0, 1], ['oklch(98% 0.003 265)', C.primary]);
  const fg = interpolateColors(on, [0, 1], [C.primary, 'oklch(100% 0 0)']);
  return (
    <div
      style={{
        ...pill,
        border: `2px solid ${on > 0.5 ? C.primary : 'oklch(80% 0.06 264)'}`,
        background: bg,
        color: fg,
        transform: `scale(${press})`,
        boxShadow: `0 0 0 ${5 * ring}px oklch(65% 0.19 264 / ${0.35 * ring})`,
      }}
    >
      <Icon name={on > 0.5 ? 'shieldCheck' : 'shield'} size={19} color={fg} />
      {on > 0.5 ? 'Trusted' : 'Trust'}
    </div>
  );
};
