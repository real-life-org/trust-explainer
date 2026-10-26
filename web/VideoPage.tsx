import React, { useRef, useState } from 'react';
import { FORMATS } from '../src/kit/format';
import { Icon } from '../src/kit/Icons';
import { C, MONO } from '../src/kit/theme';
import { FPS } from '../src/kit/time';
import { ChapterView } from './ChapterView';
import { chapterLabel } from '../src/chapters/outline';
import { FILM, FILM_FRAMES, FILM_HOLDS, partAt } from './film';
import { mount, Page } from './Page';
import { usePlayhead } from './playhead';
import { Button, Frame, Section } from './ui';

const clock = (frames: number) => {
  const s = Math.floor(frames / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const Video: React.FC = () => {
  const [square, setSquare] = useState(false);
  const { frame, playing, setPlaying, seek } = usePlayhead({ start: 0, end: FILM_FRAMES - 1, initial: FILM_HOLDS[0] });
  const { part, local } = partAt(frame);
  const box = useRef<HTMLDivElement>(null);
  const size = square ? FORMATS[1] : FORMATS[0];
  return (
    <Section
      id="video"
      title="Video"
      lead="The whole film, every chapter in a row, drawn live from the same scenes. Rendered MP4 files come from npm run render."
      action={
        <Button onClick={() => setSquare((v) => !v)} title="switch format">
          {square ? '16:9' : 'Square'}
        </Button>
      }
    >
      <div ref={box} style={{ maxWidth: square ? 640 : undefined, margin: '0 auto', background: C.bg, borderRadius: 12, overflow: 'hidden' }}>
        <Frame ratio={size.width / size.height} onClick={() => setPlaying(!playing)} style={{ borderRadius: 0, boxShadow: 'none' }}>
          <ChapterView chapter={part.chapter} size={size} frame={local} fit />
          {!playing ? (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'oklch(0% 0 0 / 0.45)', display: 'grid', placeItems: 'center' }}>
                <Icon name="play" size={30} color="#fff" fill="#fff" />
              </div>
            </div>
          ) : null}
        </Frame>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px' }}>
          <button onClick={() => setPlaying(!playing)} style={iconButton} title={playing ? 'pause' : 'play'}>
            <Icon name={playing ? 'pause' : 'play'} size={18} color={C.white} />
          </button>
          <Timeline frame={frame} onSeek={(n) => seek(n)} />
          <span style={{ fontFamily: MONO, fontSize: 13, color: C.gray3, whiteSpace: 'nowrap' }}>
            {clock(frame)} / {clock(FILM_FRAMES)}
          </span>
          <button
            onClick={() => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen())}
            style={iconButton}
            title="fullscreen"
          >
            <Icon name="maximize" size={18} color={C.white} />
          </button>
        </div>
      </div>
    </Section>
  );
};

const iconButton: React.CSSProperties = {
  width: 36,
  height: 36,
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
};

/** The film's timeline: chapters as segments, a tick at every hold, click or drag to seek. */
const Timeline: React.FC<{ frame: number; onSeek: (n: number) => void }> = ({ frame, onSeek }) => {
  const bar = useRef<HTMLDivElement>(null);
  const seekAt = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * (FILM_FRAMES - 1));
  };
  return (
    <div
      ref={bar}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seekAt(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons) seekAt(e.clientX);
      }}
      style={{ position: 'relative', flex: 1, height: 24, cursor: 'pointer', touchAction: 'none' }}
    >
      {FILM.map((p) => (
        <div
          key={p.chapter.id}
          title={chapterLabel(p.chapter)}
          style={{
            position: 'absolute',
            top: 10,
            height: 4,
            left: `${(p.start / FILM_FRAMES) * 100}%`,
            width: `calc(${(p.frames / FILM_FRAMES) * 100}% - 3px)`,
            borderRadius: 2,
            background: C.gray5,
          }}
        />
      ))}
      <div style={{ position: 'absolute', top: 10, height: 4, left: 0, width: `${(frame / FILM_FRAMES) * 100}%`, borderRadius: 2, background: C.accent }} />
      {FILM_HOLDS.map((h) => (
        <div key={h} style={{ position: 'absolute', top: 7, left: `${(h / FILM_FRAMES) * 100}%`, width: 2, height: 10, background: C.gray3, borderRadius: 1 }} />
      ))}
      <div
        style={{
          position: 'absolute',
          top: 5,
          left: `calc(${(frame / FILM_FRAMES) * 100}% - 7px)`,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: C.white,
        }}
      />
    </div>
  );
};


mount(
  <Page active="video">
    <main style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '0 16px 80px', boxSizing: 'border-box' }}>
      <Video />
    </main>
  </Page>,
);
