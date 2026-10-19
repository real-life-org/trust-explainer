import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CredentialCard } from '../components/CredentialCard';
import { Layout, phonePose, screenPointToStage, SCREEN, TRAY, Who } from '../layout';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * Step 8: one signed credential leaves the issuer's screen, arcs over to the
 * holder's phone and docks in its tray, where it stays.
 * `start` is the absolute frame of this Sequence; `flight` its length in frames.
 */
export const CredentialFlight: React.FC<{ issuer: Who; holder: Who; start: number; flight: number; L: Layout }> = ({
  issuer,
  holder,
  start,
  flight,
  L,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const abs = start + frame;

  const fromPose = phonePose(issuer, abs, L);
  const toPose = phonePose(holder, abs, L);
  const p0 = screenPointToStage(fromPose, L, { x: SCREEN.w / 2, y: 520 });
  const p2 = screenPointToStage(toPose, L, { x: SCREEN.w / 2, y: TRAY.slotCy });

  const t = interpolate(frame, [0, flight], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const lift = 230 * L.s;
  const c = { x: (p0.x + p2.x) / 2, y: Math.min(p0.y, p2.y) - lift };
  const u = 1 - t;
  const x = u * u * p0.x + 2 * u * t * c.x + t * t * p2.x;
  const y = u * u * p0.y + 2 * u * t * c.y + t * t * p2.y;
  const rot = fromPose.rot * u + toPose.rot * t;

  const appear = interpolate(frame, [0, 8], [0, 1], clamp);
  const settle = spring({ frame: frame - flight, fps, config: { damping: 12, stiffness: 160 } });
  const scale = frame < flight ? interpolate(t, [0, 0.25, 0.8, 1], [0.6, 1.35, 1.3, 1]) : 1 + 0.05 * (1 - settle);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale * L.s})`,
        opacity: appear,
        zIndex: 200,
      }}
    >
      <CredentialCard from={issuer} to={holder} />
    </div>
  );
};
