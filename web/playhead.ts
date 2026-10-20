import { useCallback, useEffect, useRef, useState } from 'react';
import { FPS } from '../src/kit/time';

/**
 * A playhead between frames `start` and `end`, advanced by
 * requestAnimationFrame at display rate while playing. At `end` it loops
 * back to `start`, or stops. Before it first plays it rests on `initial`
 * (default `start`), e.g. a poster frame.
 */
export function usePlayhead({
  start,
  end,
  loop = false,
  autoplay = false,
  initial = start,
}: {
  start: number;
  end: number;
  loop?: boolean;
  autoplay?: boolean;
  initial?: number;
}) {
  const [frame, setFrame] = useState(initial);
  const [playing, setPlaying] = useState(autoplay);
  const frameRef = useRef(initial);

  const seek = useCallback((n: number) => {
    frameRef.current = n;
    setFrame(n);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (!loop && frameRef.current >= end) seek(start);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      let next = frameRef.current + dt * FPS;
      if (next >= end) {
        if (loop) next = start + ((next - start) % (end - start));
        else {
          seek(end);
          setPlaying(false);
          return;
        }
      }
      seek(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, start, end, loop, seek]);

  return { frame, playing, setPlaying, seek };
}
