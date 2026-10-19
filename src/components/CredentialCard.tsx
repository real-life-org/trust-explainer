import React from 'react';
import { C, FONT, MONO, PEOPLE } from '../theme';
import { DOCK, type Who } from '../layout';
import { Icon } from './Icons';

/** The site's encounter credential row (.tp-cred), in the light phone palette. */
export const CredentialCard: React.FC<{ from: Who; to: Who }> = ({ from, to }) => (
  <div
    style={{
      width: DOCK.w,
      height: DOCK.h,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '0 14px',
      borderRadius: 12,
      border: `1.5px solid ${C.okBorder}`,
      background: C.okBg,
      fontFamily: FONT,
      boxShadow: '0 10px 24px -12px oklch(0% 0 0 / 0.45)',
    }}
  >
    <Icon name="shieldCheck" size={26} color={C.success} />
    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>
        <span style={{ color: PEOPLE[from].tone.ink }}>{PEOPLE[from].name}</span> →{' '}
        <span style={{ color: PEOPLE[to].tone.ink }}>{PEOPLE[to].name}</span>
      </div>
      <div style={{ fontSize: 14, color: C.muted }}>signed credential</div>
    </div>
    <div
      style={{
        fontFamily: MONO,
        fontSize: 14,
        color: C.successInk,
        padding: '3px 7px',
        borderRadius: 6,
        background: C.successTint,
      }}
    >
      ed25519
    </div>
  </div>
);
