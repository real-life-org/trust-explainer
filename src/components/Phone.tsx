import React from 'react';
import { C, FONT, PEOPLE } from '../theme';
import { CODE, Layout, ORIGIN, PHONE, Pose, SCREEN, Who } from '../layout';
import { Avatar } from './ui';

/**
 * A phone in the simulator's look, drawn as a modern handset: graphite metal
 * rim, black bezel, dynamic island and status bar, side buttons, a faint
 * glass sheen. The owner's avatar and name sit in the top right corner of
 * the app content on every screen.
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
  const hx = ORIGIN.x + SCREEN.w / 2 - size / 2;
  const hy = ORIGIN.y + CODE.cy - size / 2;
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
  const screenRadius = PHONE.radius - PHONE.inset;
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
      }}
    >
      {/* side buttons sit outside the body and stay out of the viewfinder mask */}
      <SideButton side="left" top={128} h={34} />
      <SideButton side="left" top={186} h={58} />
      <SideButton side="left" top={256} h={58} />
      <SideButton side="right" top={206} h={92} />

      <div style={{ position: 'absolute', inset: 0, ...mask }}>
        {/* rim: brushed graphite, lit from the top left */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: PHONE.radius,
            background: `linear-gradient(140deg, ${C.rimHigh} 0%, ${C.rim} 22%, ${C.rimLow} 55%, ${C.rim} 85%, ${C.rimHigh} 100%)`,
            boxShadow: [
              '0 2px 4px oklch(0% 0 0 / 0.4)',
              '0 24px 40px -12px oklch(0% 0 0 / 0.55)',
              '0 60px 90px -30px oklch(0% 0 0 / 0.7)',
            ].join(', '),
          }}
        />
        {/* bezel */}
        <div
          style={{
            position: 'absolute',
            inset: 3,
            borderRadius: PHONE.radius - 3,
            background: C.shell,
            boxShadow: 'inset 0 0 0 1px oklch(100% 0 0 / 0.06)',
          }}
        />
        {/* display */}
        <div
          style={{
            position: 'absolute',
            left: PHONE.inset,
            top: PHONE.inset,
            right: PHONE.inset,
            bottom: PHONE.inset,
            borderRadius: screenRadius,
            overflow: 'hidden',
            background: C.screen,
            color: C.ink,
            fontFamily: FONT,
          }}
        >
          <StatusBar />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: PHONE.status,
              width: SCREEN.w,
              height: SCREEN.h,
            }}
          >
            {children}
            <OwnerChip who={owner} />
          </div>
          <HomeIndicator />
          {/* glass sheen */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(115deg, oklch(100% 0 0 / 0.22) 0%, oklch(100% 0 0 / 0) 34%, oklch(100% 0 0 / 0) 70%, oklch(100% 0 0 / 0.06) 100%)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const SideButton: React.FC<{ side: 'left' | 'right'; top: number; h: number }> = ({ side, top, h }) => (
  <div
    style={{
      position: 'absolute',
      top,
      [side]: -3,
      width: 6,
      height: h,
      borderRadius: 3,
      background: `linear-gradient(90deg, ${C.rimLow}, ${C.rimHigh} 50%, ${C.rimLow})`,
    }}
  />
);

/** Time, dynamic island, signal and battery. */
const StatusBar: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: PHONE.status,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 30px 0 34px',
      boxSizing: 'border-box',
      fontSize: 16,
      fontWeight: 700,
      color: C.ink,
      zIndex: 10,
    }}
  >
    <span style={{ letterSpacing: '-0.01em' }}>9:41</span>
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 9,
        width: 104,
        height: 30,
        marginLeft: -52,
        borderRadius: 15,
        background: 'oklch(8% 0 0)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 11,
          top: 9,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, oklch(40% 0.06 264), oklch(14% 0.02 264) 60%)',
        }}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={18} height={12} viewBox="0 0 18 12">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 4.7} y={9 - i * 3} width={3.2} height={3 + i * 3} rx={1} fill={C.ink} />
        ))}
      </svg>
      <svg width={26} height={13} viewBox="0 0 26 13">
        <rect x={0.75} y={0.75} width={21.5} height={11.5} rx={3.5} fill="none" stroke={C.ink} strokeOpacity={0.4} strokeWidth={1.5} />
        <rect x={2.75} y={2.75} width={15} height={7.5} rx={2} fill={C.ink} />
        <rect x={23.5} y={4.25} width={2} height={4.5} rx={1} fill={C.ink} fillOpacity={0.4} />
      </svg>
    </div>
  </div>
);

const HomeIndicator: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: '50%',
      bottom: 8,
      width: 120,
      height: 5,
      marginLeft: -60,
      borderRadius: 3,
      background: C.ink,
      opacity: 0.85,
      zIndex: 10,
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
