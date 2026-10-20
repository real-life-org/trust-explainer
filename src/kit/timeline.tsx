import React, { createContext, useContext } from 'react';

/**
 * The time core every scene is drawn with. A scene is a pure function of
 * the current frame: the same frame always gives the same picture. The
 * frame may be fractional; the browser drives it at display rate, the video
 * export steps it frame by frame.
 *
 * The vocabulary (useCurrentFrame, Sequence, AbsoluteFill, and in
 * motion.ts interpolate, spring, Easing) follows the common one for
 * programmatic animation, so scenes read familiar; the implementation is
 * our own.
 */

type Clock = {
  /** frames since the start of the innermost Sequence */
  frame: number;
  fps: number;
  width: number;
  height: number;
  /** length of the innermost Sequence, or of the whole timeline */
  durationInFrames: number;
};

const ClockContext = createContext<Clock | null>(null);

function useClock(): Clock {
  const clock = useContext(ClockContext);
  if (!clock) throw new Error('a scene must be rendered inside <Timeline>');
  return clock;
}

/** The root of a scene: provides the current frame and the stage size. */
export const Timeline: React.FC<Clock & { children: React.ReactNode }> = ({ children, ...clock }) => (
  <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>
);

export const useCurrentFrame = (): number => useClock().frame;

export const useVideoConfig = (): Omit<Clock, 'frame'> => {
  const { frame: _frame, ...config } = useClock();
  return config;
};

const fill: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

/** A layer covering the whole stage (or its parent). */
export const AbsoluteFill: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({
  style,
  children,
}) => <div style={{ ...fill, ...style }}>{children}</div>;

/**
 * Shows its children from frame `from` for `durationInFrames` frames, as a
 * full layer. Inside, frames count from the Sequence's start and the
 * duration is the Sequence's. `name` labels the span for readers.
 */
export const Sequence: React.FC<{
  from?: number;
  durationInFrames?: number;
  name?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ from = 0, durationInFrames = Infinity, style, children }) => {
  const clock = useClock();
  const frame = clock.frame - from;
  if (frame < 0 || frame >= durationInFrames) return null;
  return (
    <ClockContext.Provider value={{ ...clock, frame, durationInFrames }}>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </ClockContext.Provider>
  );
};
