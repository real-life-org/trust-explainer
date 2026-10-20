import React, { useEffect, useRef } from 'react';
import { C } from '../src/kit/theme';
import { ChapterView } from './ChapterView';
import { type Clip, clipChapter, clipFrames, clipSize } from './clips';
import { usePlayhead } from './playhead';

const SEAM = 12; // frames faded out and in where the loop starts over

/**
 * A clip playing in a loop, scaled to fill its parent. It pauses while out
 * of view and, for viewers who prefer reduced motion, shows the clip's last
 * frame instead of moving.
 */
export const ClipPlayer: React.FC<{ clip: Clip }> = ({ clip }) => {
  const { start, end } = clipFrames(clip);
  const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { frame, setPlaying, seek } = usePlayhead({ start, end, loop: true });
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (still) {
      seek(end - 1);
      return;
    }
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [still, end, seek, setPlaying]);

  const opacity = still ? 1 : Math.min(1, (frame - start) / SEAM, (end - frame) / SEAM);
  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <ChapterView
        chapter={clipChapter(clip)}
        size={clipSize(clip)}
        frame={frame}
        fit
        opacity={Math.max(0, opacity)}
        captions={clip.captions}
      />
    </div>
  );
};
