import React from 'react';
import { useCurrentFrame } from '../../kit/timeline';
import { Easing, interpolate } from '../../kit/motion';
import { useFormat } from '../../kit/format';
import { C, FONT } from '../../kit/theme';
import { clamp, f } from '../../kit/time';
import { P } from './timings';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
const easeOut = Easing.bezier(0.33, 0, 0.67, 1);

/** 0 -> 1 over a span of seconds, eased. */
const prog = (frame: number, s: { from: number; to: number }) =>
  interpolate(frame, [f(s.from), f(s.to)], [0, 1], { ...clamp, easing: ease });

/** The i-th of n items in a span, each taking `share` of it, staggered. */
const stagger = (frame: number, s: { from: number; to: number }, i: number, n: number, share = 0.45) => {
  const len = (s.to - s.from) * share;
  const start = s.from + ((s.to - s.from - len) * i) / Math.max(1, n - 1);
  return prog(frame, { from: start, to: start + len });
};

/** Six places on a hexagon around the centre, in units of its radius (as on the deck slide). */
const HEX = [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (Math.PI / 3) * i;
  return { x: Math.cos(a), y: Math.sin(a) };
});
/** made: the ring of neighbours plus two links across */
const LINKS: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4], [2, 5]];

type Box = { x: number; y: number; w: number; h: number };
type Panel = { box: Box; cx: number; cy: number; r: number; label: { x: number; y: number; align: 'center' | 'left'; w: number } };

/** Where the two panels and their labels stand: side by side in 16:9, one above the other in square. */
function usePanels(): { left: Panel; right: Panel; title: number; sub: number } {
  const F = useFormat();
  if (F.square) {
    const panel = (y: number): Panel => {
      const box = { x: 70, y, w: 940, h: 350 };
      return { box, cx: box.x + 210, cy: y + box.h / 2, r: 118, label: { x: box.x + 420, y: y + box.h / 2 - 46, align: 'left', w: 480 } };
    };
    return { left: panel(236), right: panel(636), title: 40, sub: 27 };
  }
  const panel = (x: number): Panel => {
    const box = { x, y: 250, w: 700, h: 560 };
    return { box, cx: x + box.w / 2, cy: box.y + box.h / 2, r: 190, label: { x, y: box.y + box.h + 30, align: 'center', w: box.w } };
  };
  return { left: panel(228), right: panel(992), title: 40, sub: 28 };
}

const Label: React.FC<{ panel: Panel; t: number; title: string; sub: string; titleColor: string; subColor: string; size: { title: number; sub: number } }> = ({
  panel,
  t,
  title,
  sub,
  titleColor,
  subColor,
  size,
}) => (
  <div
    style={{
      position: 'absolute',
      left: panel.label.x,
      top: panel.label.y,
      width: panel.label.w,
      textAlign: panel.label.align,
      fontFamily: FONT,
      opacity: t,
      transform: `translateY(${(1 - t) * 14}px)`,
    }}
  >
    <div style={{ fontSize: size.title, fontWeight: 700, color: titleColor, letterSpacing: '-0.01em' }}>{title}</div>
    <div style={{ fontSize: size.sub, color: subColor, marginTop: 6 }}>{sub}</div>
  </div>
);

/**
 * The picture of principle 04, after the deck slide: on the left trust
 * enclosed around one issuer, on the right people linked directly, pair by
 * pair. Built in three steps: the frames, the left panel, the right panel.
 */
export const NoIssuerPicture: React.FC = () => {
  const frame = useCurrentFrame();
  const F = useFormat();
  const { left, right, title, sub } = usePanels();
  const size = { title, sub };
  const k = left.r / 110; // the deck's drawing is 110 units to a radius

  const frames = prog(frame, P.frames);
  const out = interpolate(frame, [f(P.out.from), f(P.out.to)], [1, 0], { ...clamp, easing: easeOut });
  const issuer = prog(frame, { from: P.issuer, to: P.issuer + 0.35 });
  const issuedLabel = prog(frame, P.issuedLabel);
  const madeLabel = prog(frame, P.madeLabel);

  const at = (p: Panel, i: number) => ({ x: p.cx + HEX[i].x * p.r, y: p.cy + HEX[i].y * p.r });
  const sq = 56 * k;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: out, transform: `scale(${0.97 + 0.03 * out})` }}>
      <svg width={F.square ? 1080 : 1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <g opacity={frames}>
          <rect
            x={left.box.x}
            y={left.box.y}
            width={left.box.w}
            height={left.box.h}
            rx={28}
            fill={C.band}
            stroke={C.gray4}
            strokeWidth={2.5}
            strokeDasharray="14 11"
          />
          <rect x={right.box.x} y={right.box.y} width={right.box.w} height={right.box.h} rx={28} fill={C.tint} fillOpacity={0.55} stroke={C.accent} strokeOpacity={0.35} strokeWidth={2} />
        </g>
        {/* issued: everyone tied to one issuer */}
        <g stroke={C.gray4} strokeWidth={3.5 * Math.min(k, 1.3)} strokeLinecap="round">
          {HEX.map((_, i) => {
            const t = stagger(frame, P.spokes, i, 6);
            const p = at(left, i);
            return t > 0 ? <line key={i} x1={left.cx} y1={left.cy} x2={left.cx + (p.x - left.cx) * t} y2={left.cy + (p.y - left.cy) * t} /> : null;
          })}
        </g>
        {HEX.map((_, i) => {
          const t = stagger(frame, P.enclosed, i, 6);
          const p = at(left, i);
          return (
            <circle key={i} cx={p.x} cy={p.y} r={17 * k * (0.6 + 0.4 * t)} opacity={t} fill={C.gray5} stroke={C.gray3} strokeWidth={2.5} />
          );
        })}
        <rect
          x={left.cx - (sq / 2) * issuer}
          y={left.cy - (sq / 2) * issuer}
          width={sq * issuer}
          height={sq * issuer}
          rx={12 * k * issuer}
          opacity={issuer}
          fill={C.gray3}
        />

        {/* made: people linked directly, pair by pair */}
        <g stroke={C.accent} strokeWidth={4 * Math.min(k, 1.3)} strokeLinecap="round">
          {LINKS.map(([a, b], i) => {
            const t = stagger(frame, P.links, i, LINKS.length, 0.35);
            const pa = at(right, a);
            const pb = at(right, b);
            return t > 0 ? <line key={i} x1={pa.x} y1={pa.y} x2={pa.x + (pb.x - pa.x) * t} y2={pa.y + (pb.y - pa.y) * t} /> : null;
          })}
        </g>
        {HEX.map((_, i) => {
          const t = stagger(frame, P.people, i, 6);
          const p = at(right, i);
          return (
            <circle key={i} cx={p.x} cy={p.y} r={18 * k * (0.6 + 0.4 * t)} opacity={t} fill={C.bg} stroke={C.accentHigh} strokeWidth={4.5} />
          );
        })}
      </svg>

      <Label panel={left} t={issuedLabel} title="issued" sub="one party in the middle can revoke" titleColor={C.gray2} subColor={C.gray3} size={size} />
      <Label panel={right} t={madeLabel} title="made" sub="each pair holds its own proof" titleColor={C.accentHigh} subColor={C.gray2} size={size} />
    </div>
  );
};
