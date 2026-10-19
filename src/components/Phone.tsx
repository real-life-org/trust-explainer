import React from 'react';
import { C, FONT, PEOPLE } from '../theme';
import { CODE, Layout, PHONE, Pose, SCREEN, TRAY, Who } from '../layout';
import { Avatar } from './ui';

/**
 * A simplified phone in the simulator's look: dark shell, light screen, the
 * owner's avatar and name in the top right corner on every screen, and an
 * empty slot at the bottom where a received credential docks.
 * `hole` (0..1) cuts the viewfinder out of the whole phone, so the code on
 * the phone underneath shows through, as in the ceremony simulator.
 */
export const Phone: React.FC<{
  owner: Who;
  pose: Pose;
  L: Layout;
  opacity?: number;
  lift?: number;
  hole?: number;
  zIndex?: number;
  children: React.ReactNode;
}> = ({ owner, pose, L, opacity = 1, lift = 0, hole = 0, zIndex, children }) => {
  const size = CODE.hole * hole;
  const hx = PHONE.inset + SCREEN.w / 2 - size / 2;
  const hy = PHONE.inset + CODE.cy - size / 2;
  const mask: React.CSSProperties =
    hole > 0
      ? {
          maskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
          maskPosition: `0 0, ${hx}px ${hy}px`,
          maskSize: `100% 100%, ${size}px ${size}px`,
          maskRepeat: 'no-repeat',
          maskComposite: 'exclude',
          WebkitMaskImage: 'linear-gradient(#000 0 0), linear-gradient(#000 0 0)',
          WebkitMaskPosition: `0 0, ${hx}px ${hy}px`,
          WebkitMaskSize: `100% 100%, ${size}px ${size}px`,
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskComposite: 'xor',
        }
      : {};
  return (
    <div
      style={{
        position: 'absolute',
        left: pose.x - PHONE.w / 2,
        top: pose.y - PHONE.h / 2 + lift,
        width: PHONE.w,
        height: PHONE.h,
        transform: `rotate(${pose.rot}deg) scale(${L.s})`,
        transformOrigin: '50% 50%',
        opacity,
        zIndex,
        ...mask,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: PHONE.radius,
          background: C.shell,
          boxShadow: '0 30px 60px -24px oklch(0% 0 0 / 0.75), inset 0 0 0 1px oklch(30% 0.02 265)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: PHONE.inset,
          top: PHONE.inset,
          width: SCREEN.w,
          height: SCREEN.h,
          borderRadius: PHONE.radius - PHONE.inset + 2,
          overflow: 'hidden',
          background: C.screen,
          color: C.ink,
          fontFamily: FONT,
        }}
      >
        <Tray />
        {children}
        <OwnerChip who={owner} />
      </div>
    </div>
  );
};

/** The empty slot a received credential docks onto; the card covers it. */
const Tray: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: (SCREEN.w - TRAY.slotW) / 2,
      top: TRAY.slotCy - TRAY.slotH / 2,
      width: TRAY.slotW,
      height: TRAY.slotH,
      boxSizing: 'border-box',
      borderRadius: 14,
      border: `2px dashed oklch(86% 0.01 265)`,
    }}
  />
);

/** Whose phone this is: avatar and name, top right, always on top of the screen content. */
const OwnerChip: React.FC<{ who: Who }> = ({ who }) => {
  const p = PEOPLE[who];
  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        right: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '4px 14px 4px 4px',
        borderRadius: 999,
        background: 'oklch(100% 0 0)',
        boxShadow: `0 0 0 2px ${p.tone.bg}`,
        fontSize: 22,
        fontWeight: 700,
        color: p.tone.ink,
        zIndex: 5,
      }}
    >
      <Avatar initial={p.initial} size={40} tone={p.tone} />
      {p.name}
    </div>
  );
};
