import React from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CredentialCard } from '../components/CredentialCard';
import { DOCK, Layout, phonePose, ROWS, screenPointToStage, SCREEN, Who } from '../layout';
import { f, T } from '../timings';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const quad = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) => {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
};

/**
 * Step 8: one signed credential leaves the issuer's screen, arcs over to the
 * holder's phone and waits at the bottom of its screen. When the contact
 * list appears it jumps onto the new contact's row and becomes that row.
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
  const p0 = screenPointToStage(fromPose, L, { x: SCREEN.w / 2, y: 440 });
  const dock = screenPointToStage(toPose, L, { x: SCREEN.w / 2, y: DOCK.cy });
  const row = screenPointToStage(toPose, L, { x: SCREEN.w / 2, y: ROWS.top + (ROWS.h - 8) / 2 });

  // 1. flight from issuer to the holder's dock
  const t = interpolate(frame, [0, flight], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const lift = 230 * L.s;
  const fly = quad(p0, { x: (p0.x + dock.x) / 2, y: Math.min(p0.y, dock.y) - lift }, dock, t);
  const rot = fromPose.rot * (1 - t) + toPose.rot * t;

  // 2. the jump into the contact list, a short hop up the screen
  const j0 = f(T.credToRow.from) - start;
  const j1 = f(T.credToRow.to) - start;
  const j = interpolate(frame, [j0, j1], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.25, 1) });
  const hop = quad(dock, { x: dock.x + 70 * L.s, y: (dock.y + row.y) / 2 }, row, j);
  const pos = frame < j0 ? fly : hop;

  const appear = interpolate(frame, [0, 8], [0, 1], clamp);
  const settle = spring({ frame: frame - flight, fps, config: { damping: 12, stiffness: 160 } });
  const flyScale = frame < flight ? interpolate(t, [0, 0.25, 0.8, 1], [0.6, 1.35, 1.3, 1]) : 1 + 0.05 * (1 - settle);
  // grows to row width on the way up, then hands over to the row
  const scale = flyScale * interpolate(j, [0, 0.5, 1], [1, 1.12, 1.06]);
  const handOver = interpolate(frame, [j1, j1 + 5], [1, 0], clamp);
  if (handOver <= 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale * L.s})`,
        opacity: Math.min(appear, handOver),
        zIndex: 200,
      }}
    >
      <CredentialCard from={issuer} to={holder} />
    </div>
  );
};
