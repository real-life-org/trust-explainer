import React, { useEffect, useState } from 'react';
import { CHAPTERS } from '../src/chapters';
import { beatSpans } from '../src/kit/chapter';
import { loadFonts } from '../src/kit/fonts';
import { FORMATS } from '../src/kit/format';
import { Icon } from '../src/kit/Icons';
import { C, FONT, MONO } from '../src/kit/theme';
import { f, FPS } from '../src/kit/time';
import { ChapterView } from './ChapterView';
import { CLIPS, type Clip, clipSize } from './clips';
import { ClipPlayer } from './ClipPlayer';
import { presentHash } from './Deck';
import { FILM, FILM_FRAMES, FILM_HOLDS, partAt } from './film';
import { usePlayhead } from './playhead';
import { Button, Frame, Section } from './ui';

/** Starts the presentation at a slide, in fullscreen when the browser allows it. */
function present(c: number, k: number) {
  void document.documentElement.requestFullscreen?.().catch(() => undefined);
  location.hash = presentHash({ c, k });
}

/**
 * The overview: the slides with a presentation mode, the film with a
 * player, and the animated graphics for websites.
 */
export const Overview: React.FC = () => {
  const [fonts, setFonts] = useState(false);
  useEffect(() => {
    void loadFonts().then(() => setFonts(true));
  }, []);
  return (
    <div style={{ minHeight: '100%', background: C.band, color: C.gray2, fontFamily: FONT }}>
      <TopBar />
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px 80px' }}>
        {fonts ? (
          <>
            <Slides />
            <Video />
            <Animations />
          </>
        ) : null}
      </main>
    </div>
  );
};

const TopBar: React.FC = () => (
  <header
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: `color-mix(in oklch, ${C.band} 88%, transparent)`,
      backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${C.gray5}`,
    }}
  >
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: C.tint, display: 'grid', placeItems: 'center' }}>
        <Icon name="fingerprint" size={18} color={C.accent} />
      </div>
      <strong style={{ color: C.white, fontSize: 16 }}>Real Life Trust Protocol</strong>
      <span style={{ color: C.gray4, fontSize: 15 }}>explained</span>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 18, fontSize: 15 }}>
        {[
          ['#slides', 'Slides'],
          ['#video', 'Video'],
          ['#animations', 'Animations'],
        ].map(([href, label]) => (
          <a key={href} href={href} style={{ color: C.gray2, textDecoration: 'none' }}>
            {label}
          </a>
        ))}
      </nav>
    </div>
  </header>
);

// ---------------------------------------------------------------------------

const grid = (min: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`,
  gap: 18,
});

const Slides: React.FC = () => (
  <Section
    id="slides"
    title="Slides"
    lead="Each slide plays its step and holds on the result. Click a slide to present from there. Arrow keys or click go on, Esc returns here."
    action={
      <Button primary onClick={() => present(0, 0)}>
        <Icon name="play" size={16} color="#fff" /> Present
      </Button>
    }
  >
    {CHAPTERS.map((chapter, c) => (
      <div key={chapter.id} style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gray3 }}>
          {chapter.kicker}
        </h3>
        <div style={grid(250)}>
          {beatSpans(chapter).map((b, k) => (
            <figure key={b.id} style={{ margin: 0 }}>
              <Frame ratio={16 / 9} onClick={() => present(c, k)}>
                <ChapterView chapter={chapter} size={FORMATS[0]} frame={f(b.hold)} fit />
              </Frame>
              <figcaption style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 14, lineHeight: 1.35 }}>
                <span style={{ color: C.accentHigh, fontWeight: 700, minWidth: 14 }}>{b.step ?? '·'}</span>
                <span>{b.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    ))}
  </Section>
);

// ---------------------------------------------------------------------------

const clock = (frames: number) => {
  const s = Math.floor(frames / FPS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const Video: React.FC = () => {
  const [square, setSquare] = useState(false);
  const { frame, playing, setPlaying, seek } = usePlayhead({ start: 0, end: FILM_FRAMES - 1, initial: FILM_HOLDS[0] });
  const { part, local } = partAt(frame);
  const box = React.useRef<HTMLDivElement>(null);
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
  const bar = React.useRef<HTMLDivElement>(null);
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
          title={p.chapter.kicker}
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

// ---------------------------------------------------------------------------

const Animations: React.FC = () => (
  <Section
    id="animations"
    title="Animations"
    lead="Looping graphics for the landing page and other websites. They pause when scrolled out of view and stand still for visitors who prefer reduced motion."
  >
    <div style={grid(340)}>
      {CLIPS.map((clip) => (
        <ClipCard key={clip.id} clip={clip} />
      ))}
    </div>
  </Section>
);

function embedUrl(clip: Clip): string {
  return new URL(`embed.html?clip=${clip.id}`, location.href).href;
}

function embedCode(clip: Clip): string {
  const { width, height } = clipSize(clip);
  return `<iframe src="${embedUrl(clip)}" title="${clip.title}" loading="lazy" style="width:100%;aspect-ratio:${width}/${height};border:0"></iframe>`;
}

const ClipCard: React.FC<{ clip: Clip }> = ({ clip }) => {
  const [copied, setCopied] = useState(false);
  const { width, height } = clipSize(clip);
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
      <Frame ratio={16 / 9}>
        <ClipPlayer clip={clip} />
      </Frame>
      <figcaption style={{ marginTop: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <strong style={{ color: C.white, fontSize: 16 }}>{clip.title}</strong>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.gray4 }}>
            {width}×{height} · {(clip.to - clip.from).toFixed(1)} s
          </span>
        </div>
        <p style={{ margin: '4px 0 12px', fontSize: 14, color: C.gray3, lineHeight: 1.4, flex: 1 }}>{clip.description}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            onClick={() => {
              void navigator.clipboard.writeText(embedCode(clip)).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              });
            }}
          >
            <Icon name={copied ? 'check' : 'code'} size={16} color={C.gray2} /> {copied ? 'Copied' : 'Copy embed code'}
          </Button>
          <Button onClick={() => window.open(embedUrl(clip), '_blank')}>Open</Button>
        </div>
      </figcaption>
    </figure>
  );
};
