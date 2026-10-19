import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, FONT, MONO } from '../theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Opacity of a Sequence's content: fades in at its start and out at its end. */
export function useSequenceFade(fadeIn = 8, fadeOut = 8): number {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], clamp) : 1;
  const b = fadeOut > 0 ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], clamp) : 1;
  return Math.min(a, b);
}

/** 0 before `at`, 1 shortly after, eased by a calm spring. */
export function useSpringAt(at: number, damping = 200, durationInFrames?: number): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping }, durationInFrames });
}

/** Scale of a button pressed at frame `at`: a short dip and back. */
export function usePress(at: number): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [at - 3, at, at + 6], [1, 0.94, 1], clamp);
}

/** A fingertip: a soft circle that comes in, presses at `at`, and leaves. */
export const Tap: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at - 14, at - 6, at + 6, at + 16], [0, 1, 1, 0], clamp);
  const scale = interpolate(frame, [at - 14, at - 2, at, at + 6], [1.35, 1, 0.82, 0.95], clamp);
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 22,
        top: y - 22,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'oklch(30% 0.02 265 / 0.22)',
        border: '2px solid oklch(100% 0 0 / 0.85)',
        boxShadow: '0 2px 8px oklch(0% 0 0 / 0.18)',
        opacity,
        transform: `scale(${scale})`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Avatar: React.FC<{ initial: string; size: number; tone?: 'blue' | 'green'; ring?: boolean }> = ({
  initial,
  size,
  tone = 'blue',
  ring,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: tone === 'blue' ? C.primaryTint : C.successTint,
      color: tone === 'blue' ? C.primaryInk : C.successInk,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.38,
      fontWeight: 700,
      fontFamily: FONT,
      border: ring ? `2px solid ${C.screen}` : undefined,
      flexShrink: 0,
    }}
  >
    {initial}
  </div>
);

export const Btn: React.FC<{
  kind: 'primary' | 'confirm' | 'cancel' | 'ghost';
  children: React.ReactNode;
  scale?: number;
  style?: React.CSSProperties;
}> = ({ kind, children, scale = 1, style }) => {
  const base: React.CSSProperties = {
    flex: 1,
    height: 46,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: FONT,
    fontSize: 15,
    fontWeight: 600,
    transform: `scale(${scale})`,
  };
  const kinds: Record<string, React.CSSProperties> = {
    primary: { background: C.primary, color: '#fff' },
    confirm: { background: C.success, color: '#fff' },
    cancel: { border: `2px solid ${C.dangerLine}`, color: C.danger },
    ghost: { border: `1px solid oklch(88% 0.008 265)`, color: 'oklch(40% 0.008 265)' },
  };
  return <div style={{ ...base, ...kinds[kind], ...style }}>{children}</div>;
};

export const Mono: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  size,
  color = C.muted,
  children,
  style,
}) => <span style={{ fontFamily: MONO, fontSize: size, color, ...style }}>{children}</span>;

/** A block placed at an absolute top inside a screen, centred horizontally. */
export const At: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  top,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);
