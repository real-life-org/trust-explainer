import React from 'react';
import { C, FONT, MONO } from '../theme';
import { CODE, Layout, PHONE, Pose, SCREEN, TRAY } from '../layout';

/**
 * A phone in the simulator's look: dark shell, light screen, a small status
 * line, and a tray at the bottom where a received credential docks.
 * `hole` (0..1) cuts the viewfinder out of the whole phone, so the code on
 * the phone underneath shows through, as in the ceremony simulator.
 */
export const Phone: React.FC<{
  pose: Pose;
  L: Layout;
  opacity?: number;
  lift?: number;
  hole?: number;
  zIndex?: number;
  children: React.ReactNode;
}> = ({ pose, L, opacity = 1, lift = 0, hole = 0, zIndex, children }) => {
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
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 22,
            right: 22,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: MONO,
            fontSize: 11,
            color: C.muted,
          }}
        >
          <span>9:41</span>
          <span>Web of Trust</span>
          <span>offline ok</span>
        </div>
        {children}
        <Tray />
      </div>
    </div>
  );
};

/** "Held on this device" with an empty slot; the docked card covers the slot. */
const Tray: React.FC = () => (
  <>
    <div
      style={{
        position: 'absolute',
        top: TRAY.labelTop,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: C.faint,
      }}
    >
      Held on this device
    </div>
    <div
      style={{
        position: 'absolute',
        left: (SCREEN.w - TRAY.slotW) / 2,
        top: TRAY.slotCy - TRAY.slotH / 2,
        width: TRAY.slotW,
        height: TRAY.slotH,
        boxSizing: 'border-box',
        borderRadius: 12,
        border: `1.5px dashed oklch(84% 0.01 265)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        color: 'oklch(68% 0.008 265)',
      }}
    >
      no credential yet
    </div>
  </>
);
