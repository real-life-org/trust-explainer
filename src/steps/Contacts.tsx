import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { C } from '../theme';
import { Icon } from '../components/Icons';
import { Avatar, Tap, usePress, useSequenceFade, useSpringAt } from '../components/ui';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ROW_TOP = 96;
const ROW_H = 70;

type Person = { name: string; initial: string };

/**
 * Step 6 (new contact in the list) and, when `trust` is given, step 7: the
 * user marks the new contact as trusted with one deliberate tap.
 * All frame props are relative to this Sequence.
 */
export const Contacts: React.FC<{
  peer: Person;
  others: Array<Person & { trusted: boolean; sub: string }>;
  newRowAt: number;
  trust?: { highlightAt: number; tapAt: number };
}> = ({ peer, others, newRowAt, trust }) => {
  const frame = useCurrentFrame();
  const opacity = useSequenceFade(8, 0);
  const inP = useSpringAt(newRowAt);
  const fresh = interpolate(frame, [newRowAt, newRowAt + 10, newRowAt + 70], [0, 1, 0.35], clamp);
  const count = others.length + (inP > 0.5 ? 1 : 0);

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: 'absolute',
          top: 44,
          left: 24,
          right: 24,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 23, fontWeight: 700 }}>Contacts</span>
        <span style={{ fontSize: 13, color: C.muted }}>{count} people</span>
      </div>

      {/* the new contact */}
      <div
        style={{
          position: 'absolute',
          top: ROW_TOP,
          left: 12,
          right: 12,
          height: ROW_H - 6,
          borderRadius: 14,
          background: `oklch(93% 0.05 264 / ${fresh})`,
          opacity: inP,
          transform: `translateY(${(1 - inP) * -18}px)`,
        }}
      >
        <Row person={peer} sub={trust && frame > trust.tapAt + 6 ? 'met in person · trusted' : 'met in person · just now'}>
          {trust ? <TrustButton {...trust} /> : <TrustButtonIdle />}
        </Row>
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 58,
            padding: '1px 6px',
            borderRadius: 999,
            background: C.primary,
            color: '#fff',
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            opacity: interpolate(fresh, [0.35, 1], [0, 1], clamp),
          }}
        >
          NEW
        </div>
      </div>

      {/* existing contacts move down to make room */}
      {others.map((o, i) => (
        <div
          key={o.name}
          style={{
            position: 'absolute',
            top: ROW_TOP + (i + inP) * ROW_H,
            left: 12,
            right: 12,
            height: ROW_H - 6,
          }}
        >
          <Row person={o} sub={o.sub} tone="muted">
            {o.trusted ? <Icon name="shieldCheck" size={20} color={C.primary} /> : null}
          </Row>
        </div>
      ))}

      {trust ? <Tap at={trust.tapAt} x={274} y={ROW_TOP + 32} /> : null}
    </AbsoluteFill>
  );
};

const Row: React.FC<{ person: Person; sub: string; tone?: 'muted'; children?: React.ReactNode }> = ({
  person,
  sub,
  tone,
  children,
}) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px' }}>
    <Avatar initial={person.initial} size={42} tone={tone ? 'blue' : 'green'} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: tone ? 'oklch(35% 0.008 265)' : C.ink, marginTop: 6 }}>
        {person.name}
      </div>
      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{sub}</div>
    </div>
    {children}
  </div>
);

const pill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  height: 32,
  padding: '0 11px',
  borderRadius: 999,
  boxSizing: 'border-box',
  fontSize: 13,
  fontWeight: 600,
};

/** Untouched: the contact exists, trust is not given yet. */
const TrustButtonIdle: React.FC = () => (
  <div style={{ ...pill, border: `1.5px solid oklch(80% 0.06 264)`, color: C.primary }}>
    <Icon name="shield" size={15} color={C.primary} />
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
        border: `1.5px solid ${on > 0.5 ? C.primary : 'oklch(80% 0.06 264)'}`,
        background: bg,
        color: fg,
        transform: `scale(${press})`,
        boxShadow: `0 0 0 ${4 * ring}px oklch(65% 0.19 264 / ${0.35 * ring})`,
      }}
    >
      <Icon name={on > 0.5 ? 'shieldCheck' : 'shield'} size={15} color={fg} />
      {on > 0.5 ? 'Trusted' : 'Trust'}
    </div>
  );
};
