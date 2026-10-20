import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CHAPTERS } from '../src/chapters';
import { beatSpans } from '../src/kit/chapter';
import { FORMATS } from '../src/kit/format';
import { Icon } from '../src/kit/Icons';
import { C, FONT } from '../src/kit/theme';
import { FPS } from '../src/kit/time';
import { ChapterView } from './ChapterView';
import { mount, Page } from './Page';
import { type Pos, stopsOf } from './stops';
import { Button } from './ui';

const SIZE = FORMATS[0];
const holdOf = (p: Pos) => stopsOf(CHAPTERS[p.c])[p.k];
const lastOf = (c: number): Pos => ({ c, k: stopsOf(CHAPTERS[c]).length - 1 });
const SLIDES: Pos[] = CHAPTERS.flatMap((ch, c) => stopsOf(ch).map((_, k) => ({ c, k })));
const indexOf = (p: Pos) => SLIDES.findIndex((s) => s.c === p.c && s.k === p.k);

/** `#encounter/2`: chapter id and beat index (0 = the chapter's first beat). */
function readHash(): Pos {
  const m = location.hash.match(/^#([\w-]+)\/(\d+)$/);
  const c = m ? CHAPTERS.findIndex((ch) => ch.id === m[1]) : -1;
  if (c < 0) return { c: 0, k: 0 };
  return { c, k: Math.min(Number(m![2]), lastOf(c).k) };
}

/**
 * The slides, as in a presentation program: every slide in a strip on the
 * left, the current one large on the right. One slide is one beat: next
 * plays the chapter up to the next beat's hold and stops there exactly;
 * next while a step still plays finishes it at once; back and a click in
 * the strip jump without playing. Present shows the same stage in
 * fullscreen; Esc returns to this view on the same slide. The clock runs at
 * display rate. The current slide is kept in the URL hash.
 */
const SlidesPage: React.FC = () => {
  const [pos, setPos] = useState<Pos>(readHash);
  const [frame, setFrame] = useState(() => holdOf(readHash()));
  const [fullscreen, setFullscreen] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  const frameRef = useRef(frame);
  /** the frame the clock runs toward while a step plays */
  const target = useRef<number | null>(null);
  const raf = useRef(0);

  // the controls are created once; they work on the refs
  const controls = useMemo(() => {
    const show = (p: Pos, fr: number) => {
      posRef.current = p;
      frameRef.current = fr;
      setPos(p);
      setFrame(fr);
      history.replaceState(null, '', `${location.pathname}${location.search}#${CHAPTERS[p.c].id}/${p.k}`);
    };
    const stop = () => {
      cancelAnimationFrame(raf.current);
      target.current = null;
    };
    const play = (to: number) => {
      stop();
      target.current = to;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(now - last, 100) / 1000;
        last = now;
        const next = Math.min(frameRef.current + dt * FPS, to);
        frameRef.current = next;
        setFrame(next);
        if (next < to) raf.current = requestAnimationFrame(tick);
        else target.current = null;
      };
      raf.current = requestAnimationFrame(tick);
    };
    const jump = (p: Pos) => {
      stop();
      show(p, holdOf(p));
    };
    const next = () => {
      if (target.current !== null) {
        const to = target.current;
        stop();
        show(posRef.current, to);
        return;
      }
      const { c, k } = posRef.current;
      if (k < lastOf(c).k) {
        show({ c, k: k + 1 }, frameRef.current);
        play(holdOf({ c, k: k + 1 }));
      } else if (c < CHAPTERS.length - 1) {
        show({ c: c + 1, k: 0 }, 0);
        play(holdOf({ c: c + 1, k: 0 }));
      }
    };
    const back = () => {
      const i = indexOf(posRef.current);
      jump(SLIDES[Math.max(0, i - 1)]);
    };
    const present = () => void stage.current?.requestFullscreen().catch(() => undefined);
    return { jump, next, back, present, stop };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          controls.next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          controls.back();
          break;
        case 'Home':
          controls.jump(SLIDES[0]);
          break;
        case 'End':
          controls.jump(SLIDES[SLIDES.length - 1]);
          break;
        case 'F5':
        case 'p':
        case 'f':
          if (document.fullscreenElement) void document.exitFullscreen();
          else controls.present();
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    const onHash = () => controls.jump(readHash());
    const onFullscreen = () => setFullscreen(document.fullscreenElement === stage.current);
    window.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      controls.stop();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [controls]);

  const chapter = CHAPTERS[pos.c];
  const index = indexOf(pos);
  return (
    <div className="slides" style={{ flex: 1, minHeight: 0, display: 'flex' }}>
      <Strip current={pos} onPick={controls.jump} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
        <div
          ref={stage}
          onClick={(e) => (e.shiftKey ? controls.back() : controls.next())}
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            borderRadius: fullscreen ? 0 : 12,
            overflow: 'hidden',
            background: C.bg,
            boxShadow: fullscreen ? 'none' : `0 0 0 1px ${C.gray5}`,
            cursor: 'pointer',
          }}
        >
          <ChapterView chapter={chapter} size={SIZE} frame={frame} fit />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 650, color: C.gray3 }}>
            {chapter.kicker}
          </span>
          <span style={{ fontSize: 14, color: C.gray4 }}>
            Slide {index + 1} of {SLIDES.length}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: C.gray4 }}>← → step · P present · Esc leave</span>
          <Button onClick={controls.back} title="previous slide">
            <Icon name="chevronLeft" size={16} color={C.gray2} />
          </Button>
          <Button onClick={controls.next} title="next step">
            <Icon name="chevronRight" size={16} color={C.gray2} />
          </Button>
          <Button primary onClick={controls.present}>
            <Icon name="play" size={16} color="#fff" fill="#fff" /> Present
          </Button>
        </div>
      </div>
    </div>
  );
};

/** The strip of slides on the left, grouped by chapter; the current one is marked and kept in view. */
const Strip: React.FC<{ current: Pos; onPick: (p: Pos) => void }> = ({ current, onPick }) => {
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    list.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [current.c, current.k]);
  let n = 0;
  return (
    <div
      ref={list}
      className="strip"
      style={{ width: 232, flexShrink: 0, overflowY: 'auto', padding: '16px 12px 16px 16px', borderRight: `1px solid ${C.gray5}` }}
    >
      {CHAPTERS.map((chapter, c) => (
        <div key={chapter.id} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 650, color: C.gray3, margin: '0 0 10px 22px' }}>
            {chapter.kicker}
          </div>
          {beatSpans(chapter).map((b, k) => {
            n += 1;
            const on = current.c === c && current.k === k;
            return (
              <button
                key={b.id}
                aria-current={on}
                title={b.caption}
                onClick={() => onPick({ c, k })}
                style={{
                  display: 'flex',
                  gap: 8,
                  width: '100%',
                  padding: 0,
                  margin: '0 0 12px',
                  border: 0,
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  textAlign: 'left',
                }}
              >
                <span style={{ width: 14, paddingTop: 2, fontSize: 12, fontWeight: 650, color: on ? C.white : C.gray4, textAlign: 'right' }}>{n}</span>
                <span
                  style={{
                    position: 'relative',
                    flex: 1,
                    aspectRatio: `${SIZE.width / SIZE.height}`,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: C.bg,
                    boxShadow: on ? `0 0 0 2px ${C.accent}` : `0 0 0 1px ${C.gray5}`,
                  }}
                >
                  <ChapterView chapter={chapter} size={SIZE} frame={b.hold * FPS} fit />
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

mount(
  <Page active="slides" fill>
    <SlidesPage />
  </Page>,
);
