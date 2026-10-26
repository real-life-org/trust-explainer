import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { beatSpans } from '../src/kit/chapter';
import { loadFonts } from '../src/kit/fonts';
import { C, FONT, MONO } from '../src/kit/theme';
import { f, FPS } from '../src/kit/time';
import { ChapterView } from './ChapterView';
import { CHAPTER, flag, FORMAT } from './params';
import { CHAPTERS } from '../src/chapters';
import { principleNumber } from '../src/chapters/outline';
import { usePlayhead } from './playhead';

/**
 * One chapter at one frame (`?chapter=<id>&format=square`).
 *
 * Without `scrub` the page draws the stage at 1:1 and exposes
 * `window.__frame` for the video export: `ready` resolves once the fonts
 * are in, `set(n)` draws frame n and resolves after it is painted.
 * With `scrub` it is a preview with a timeline to tune timings by hand.
 */

declare global {
  interface Window {
    __frame?: {
      ready: Promise<void>;
      info: {
        fps: number;
        durationInFrames: number;
        width: number;
        height: number;
        holds: Array<{ id: string; frame: number }>;
        /** every built chapter in telling order, with its principle's number ("04") */
        chapters: Array<{ id: string; number?: string }>;
      };
      set: (n: number) => Promise<void>;
    };
  }
}

const durationInFrames = f(CHAPTER.durationS);
const holds = beatSpans(CHAPTER).map((b) => ({ id: b.id, frame: f(b.hold) }));
const painted = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

let setFrameOutside: (n: number) => void = () => undefined;
window.__frame = {
  ready: loadFonts().then(painted),
  info: {
    fps: FPS,
    durationInFrames,
    width: FORMAT.width,
    height: FORMAT.height,
    holds,
    chapters: CHAPTERS.map((c) => ({ id: c.id, number: principleNumber(c.id) })),
  },
  set: (n) => {
    flushSync(() => setFrameOutside(n));
    return painted();
  },
};

const Frame: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const [fonts, setFonts] = useState(false);
  setFrameOutside = setFrame;
  useEffect(() => {
    void loadFonts().then(() => setFonts(true));
  }, []);
  if (!fonts) return null;
  return flag('scrub') ? (
    <Scrub />
  ) : (
    <ChapterView chapter={CHAPTER} size={FORMAT} frame={frame} />
  );
};

/** Preview: the stage scaled to fit, a play button, a timeline with the beats' holds marked. */
const Scrub: React.FC = () => {
  const { frame, playing, setPlaying, seek } = usePlayhead({ start: 0, end: durationInFrames - 1, loop: true });
  const setFrame = seek;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: FONT, color: C.gray2 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <ChapterView chapter={CHAPTER} size={FORMAT} frame={frame} fit />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', background: C.band }}>
        <button onClick={() => setPlaying((p) => !p)} style={{ width: 70 }}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="range"
            min={0}
            max={durationInFrames - 1}
            step={1}
            value={Math.floor(frame)}
            onChange={(e) => {
              setPlaying(false);
              setFrame(Number(e.target.value));
            }}
            style={{ width: '100%' }}
          />
          {holds.map((h) => (
            <button
              key={h.id}
              title={`hold: ${h.id}`}
              onClick={() => {
                setPlaying(false);
                setFrame(h.frame);
              }}
              style={{
                position: 'absolute',
                top: -10,
                left: `${(h.frame / (durationInFrames - 1)) * 100}%`,
                width: 8,
                height: 8,
                padding: 0,
                border: 0,
                borderRadius: '50%',
                background: C.accent,
                transform: 'translateX(-50%)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 13, width: 150, textAlign: 'right' }}>
          {(frame / FPS).toFixed(2)} s · {Math.floor(frame)}
        </span>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<Frame />);
