import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Chapter } from '../src/kit/chapter';
import { ChapterStage, type StageOptions } from '../src/kit/ChapterStage';
import { FPS, f } from '../src/kit/time';
import { Timeline } from '../src/kit/timeline';

export type StageSize = { width: number; height: number };

/**
 * One chapter at one frame, drawn on a stage of the format's size. With
 * `fit` the stage is scaled to fill its parent, letterboxed; without, it is
 * drawn at 1:1 (the video export).
 */
export const ChapterView: React.FC<
  { chapter: Chapter; size: StageSize; frame: number; fit?: boolean; opacity?: number } & StageOptions
> = ({ chapter, size, frame, fit, opacity = 1, captions }) => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (!fit || !box.current) return;
    const el = box.current;
    const measure = () => setScale(Math.min(el.clientWidth / size.width, el.clientHeight / size.height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit, size.width, size.height]);

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size.width,
          height: size.height,
          overflow: 'hidden',
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
        }}
      >
        <Timeline frame={frame} fps={FPS} width={size.width} height={size.height} durationInFrames={f(chapter.durationS)}>
          <ChapterStage chapter={chapter} captions={captions} />
        </Timeline>
      </div>
    </div>
  );
};
