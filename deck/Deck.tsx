import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { CHAPTERS } from '../src/chapters';
import { beatSpans } from '../src/kit/chapter';
import { ChapterStage } from '../src/kit/ChapterStage';
import { FORMATS } from '../src/kit/format';
import { C, FONT } from '../src/kit/theme';
import { f, FPS } from '../src/kit/time';
import { type Pos, stopsOf } from './stops';

/** `?format=square` shows the square format; default is 16:9. */
const FORMAT =
  FORMATS.find((x) => x.suffix.toLowerCase() === (new URLSearchParams(location.search).get('format') ?? '').toLowerCase()) ??
  FORMATS[0];

/** `#encounter/3`: chapter id and the number of beats reached (0 = chapter start). */
function readHash(): Pos {
  const m = location.hash.match(/^#([\w-]+)\/(\d+)$/);
  const c = m ? CHAPTERS.findIndex((ch) => ch.id === m[1]) : -1;
  if (c < 0) return { c: 0, k: -1 };
  const n = stopsOf(CHAPTERS[c]).length;
  return { c, k: Math.min(Number(m![2]), n) - 1 };
}

const frameOf = (p: Pos) => (p.k < 0 ? 0 : stopsOf(CHAPTERS[p.c])[p.k]);
const lastOf = (c: number): Pos => ({ c, k: stopsOf(CHAPTERS[c]).length - 1 });

/**
 * The deck: one chapter at a time on a bare player. Next plays the
 * chapter up to the end of the next beat and holds there; next while a
 * step is still playing finishes it at once. Back jumps to the previous
 * hold. At the end of a chapter, next continues with the following one.
 * The position lives in the URL hash, so a reload stays on the same step.
 */
export const Deck: React.FC = () => {
  const [pos, setPos] = useState<Pos>(readHash);
  const [hud, setHud] = useState(true);
  const player = useRef<PlayerRef>(null);
  /** the latest position, for handlers that run between renders */
  const posRef = useRef(pos);
  /** the frame the player is playing toward, while a step animates */
  const target = useRef<number | null>(null);
  /** set when a navigation switches chapters: carried out once the new player is mounted */
  const pending = useRef<boolean | null>(null);

  const chapter = CHAPTERS[pos.c];
  const beats = useMemo(() => beatSpans(chapter), [chapter]);

  /** play to the hold of `p`, or jump there */
  const apply = (p: Pos, animate: boolean) => {
    const pl = player.current;
    if (!pl) return;
    const frame = frameOf(p);
    if (animate && pl.getCurrentFrame() < frame) {
      target.current = frame;
      pl.play();
    } else {
      target.current = null;
      pl.pause();
      pl.seekTo(frame);
    }
    history.replaceState(null, '', `${location.search}#${CHAPTERS[p.c].id}/${p.k + 1}`);
  };

  const go = (p: Pos, animate: boolean) => {
    const sameChapter = p.c === posRef.current.c;
    posRef.current = p;
    setPos(p);
    if (sameChapter) apply(p, animate);
    else pending.current = animate;
  };

  // a new player (first load or chapter switch): hold at the target, then carry out the navigation
  useEffect(() => {
    const pl = player.current;
    if (!pl) return;
    const onFrame = (e: { detail: { frame: number } }) => {
      const t = target.current;
      if (t !== null && e.detail.frame >= t) {
        target.current = null;
        pl.pause();
        pl.seekTo(t);
      }
    };
    pl.addEventListener('frameupdate', onFrame);
    apply(posRef.current, pending.current ?? false);
    pending.current = null;
    return () => pl.removeEventListener('frameupdate', onFrame);
  }, [chapter.id]);

  useEffect(() => {
    const next = () => {
      const pl = player.current;
      if (pl && target.current !== null) {
        const t = target.current;
        target.current = null;
        pl.pause();
        pl.seekTo(t);
        return;
      }
      const { c, k } = posRef.current;
      if (k < lastOf(c).k) go({ c, k: k + 1 }, true);
      else if (c < CHAPTERS.length - 1) go({ c: c + 1, k: 0 }, true);
    };
    const back = () => {
      const { c, k } = posRef.current;
      if (k >= 0) go({ c, k: k - 1 }, false);
      else if (c > 0) go(lastOf(c - 1), false);
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
          go({ c: 0, k: -1 }, false);
          break;
        case 'End':
          go(lastOf(CHAPTERS.length - 1), false);
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
    const onHash = () => go(readHash(), false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  const ratio = FORMAT.width / FORMAT.height;
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
      <div style={{ width: `min(100vw, calc(100vh * ${ratio}))`, aspectRatio: `${ratio}` }}>
        <Player
          key={chapter.id}
          ref={player}
          component={ChapterStage}
          inputProps={{ chapter }}
          durationInFrames={f(chapter.durationS)}
          fps={FPS}
          compositionWidth={FORMAT.width}
          compositionHeight={FORMAT.height}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
        />
      </div>
      {hud ? <Progress beats={beats.length} reached={pos.k} kicker={chapter.kicker} start={pos.c === 0 && pos.k < 0} /> : null}
    </div>
  );
};

/** Chapter name and one dot per beat at the bottom edge; a key hint before the first step. */
const Progress: React.FC<{ beats: number; reached: number; kicker: string; start: boolean }> = ({
  beats,
  reached,
  kicker,
  start,
}) => (
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
      {Array.from({ length: beats }, (_, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: i <= reached ? C.accent : 'transparent',
            boxShadow: `inset 0 0 0 1.5px ${i <= reached ? C.accent : C.gray5}`,
          }}
        />
      ))}
    </span>
    {start ? <span>→ next · ← back · F fullscreen · H hide</span> : null}
  </div>
);
