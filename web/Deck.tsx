import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CHAPTERS } from '../src/chapters';
import { beatSpans } from '../src/kit/chapter';
import { loadFonts } from '../src/kit/fonts';
import { C, FONT } from '../src/kit/theme';
import { FPS } from '../src/kit/time';
import { ChapterView } from './ChapterView';
import { FORMAT } from './params';
import { type Pos, stopsOf } from './stops';

const holdOf = (p: Pos) => stopsOf(CHAPTERS[p.c])[p.k];
const lastOf = (c: number): Pos => ({ c, k: stopsOf(CHAPTERS[c]).length - 1 });

/** `#encounter/2`: chapter id and beat index (0 = the chapter's first beat). */
function readHash(): Pos {
  const m = location.hash.match(/^#([\w-]+)\/(\d+)$/);
  const c = m ? CHAPTERS.findIndex((ch) => ch.id === m[1]) : -1;
  if (c < 0) return { c: 0, k: 0 };
  return { c, k: Math.min(Number(m![2]), lastOf(c).k) };
}

/**
 * The deck: one chapter at a time, driven by its own clock at display
 * rate. Next plays the chapter up to the next beat's hold and stops there
 * exactly; next while a step still plays finishes it at once. Back jumps
 * to the previous hold. A chapter opens at its first beat's hold; at the
 * end of a chapter, next plays the following chapter in. The position
 * lives in the URL hash, so a reload stays on the same step.
 */
export const Deck: React.FC = () => {
  const [pos, setPos] = useState<Pos>(readHash);
  const [frame, setFrame] = useState(() => holdOf(readHash()));
  const [fonts, setFonts] = useState(false);
  const [hud, setHud] = useState(true);
  const posRef = useRef(pos);
  const frameRef = useRef(frame);
  /** the frame the clock runs toward while a step plays */
  const target = useRef<number | null>(null);
  const raf = useRef(0);

  const chapter = CHAPTERS[pos.c];
  const steps = useMemo(() => beatSpans(chapter).map((b, i) => ({ i, step: b.step })).filter((b) => b.step), [chapter]);

  useEffect(() => {
    void loadFonts().then(() => setFonts(true));
  }, []);

  useEffect(() => {
    const show = (p: Pos, fr: number) => {
      posRef.current = p;
      frameRef.current = fr;
      setPos(p);
      setFrame(fr);
      history.replaceState(null, '', `${location.search}#${CHAPTERS[p.c].id}/${p.k}`);
    };
    const stop = () => {
      cancelAnimationFrame(raf.current);
      target.current = null;
    };
    /** run the clock from the current frame to `to` */
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
      const { c, k } = posRef.current;
      if (k > 0) jump({ c, k: k - 1 });
      else if (c > 0) jump(lastOf(c - 1));
      else jump({ c: 0, k: 0 });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          back();
          break;
        case 'Home':
          jump({ c: 0, k: 0 });
          break;
        case 'End':
          jump(lastOf(CHAPTERS.length - 1));
          break;
        case 'f':
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen();
          break;
        case 'h':
          setHud((v) => !v);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    const onClick = (e: MouseEvent) => (e.shiftKey ? back() : next());
    const onHash = () => jump(readHash());
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    return () => {
      stop();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, cursor: 'pointer', background: C.bg }}>
      {fonts ? <ChapterView chapter={chapter} size={FORMAT} frame={frame} fit /> : null}
      {hud ? (
        <Progress
          kicker={chapter.kicker}
          steps={steps.map((s) => s.i <= pos.k)}
          start={pos.c === 0 && pos.k === 0}
        />
      ) : null}
    </div>
  );
};

/** Chapter name and one dot per numbered step at the bottom edge; a key hint at the very start. */
const Progress: React.FC<{ kicker: string; steps: boolean[]; start: boolean }> = ({ kicker, steps, start }) => (
  <div
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 18,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 14,
      fontFamily: FONT,
      fontSize: 13,
      color: C.gray4,
      pointerEvents: 'none',
    }}
  >
    <span style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 650 }}>{kicker}</span>
    <span style={{ display: 'flex', gap: 7 }}>
      {steps.map((done, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: done ? C.accent : 'transparent',
            boxShadow: `inset 0 0 0 1.5px ${done ? C.accent : C.gray5}`,
          }}
        />
      ))}
    </span>
    {start ? <span>→ next · ← back · F fullscreen · H hide</span> : null}
  </div>
);
