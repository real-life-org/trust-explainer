import React from 'react';
import { useCurrentFrame } from '../../kit/timeline';
import { PEOPLE } from '../../kit/cast';
import { C, FONT, MONO } from '../../kit/theme';
import { AnchorText, Box, DocCard, GroupMark, ROWS, RowName, easeInOut, lerp, part, prog, rowAt, stagger, type Pt } from './shared';
import { T } from './timings';

/** Twelve magic words (illustration, English BIP-39 words). */
const WORDS = ['river', 'candle', 'orbit', 'maple', 'silent', 'harbor', 'velvet', 'prism', 'lantern', 'meadow', 'cobalt', 'ember'];
const wordAt = (i: number): Pt => [130 + (i % 3) * 70, 104 + Math.floor(i / 3) * 26];

const SEED: Pt = [200, 152];

/** The six contexts around the seed, in the order of ROWS. */
type Kind = 'person' | 'group' | 'public';
const CONTEXTS: Array<{ deg: number; kind: Kind; fill?: string; shift?: number }> = [
  { deg: -90, kind: 'person', fill: PEOPLE.B.tone.stage },
  { deg: -30, kind: 'group', shift: 0 },
  { deg: 30, kind: 'person', fill: 'oklch(84% 0.06 20)' },
  { deg: 90, kind: 'public' },
  { deg: 150, kind: 'person', fill: 'oklch(80% 0.015 265)' },
  { deg: 210, kind: 'group', shift: 1 },
];
const node = (i: number): Pt => {
  const a = (CONTEXTS[i].deg * Math.PI) / 180;
  return [SEED[0] + 160 * Math.cos(a), SEED[1] + 122 * Math.sin(a)];
};
/** each anchor sits on the line from the seed to its context */
const chip = (i: number): Pt => {
  const n = node(i);
  return [lerp(SEED[0], n[0], 0.58), lerp(SEED[1], n[1], 0.58)];
};
const NODE_R = 13;
const CHIP = { w: 60, h: 15 };

/** where a context's name stands: beside the top and bottom ones, above the upper and below the lower side ones */
function labelAt(i: number): { at: Pt; anchor: 'start' | 'middle' } {
  const n = node(i);
  const deg = CONTEXTS[i].deg;
  if (deg === -90 || deg === 90) return { at: [n[0] + NODE_R + 6, n[1] + 3.5], anchor: 'start' };
  const upper = Math.sin((deg * Math.PI) / 180) < 0;
  return { at: [n[0], upper ? n[1] - NODE_R - 6 : n[1] + NODE_R + 12], anchor: 'middle' };
}

/**
 * Chapter 01's scene: twelve magic words become one seed; from it one anchor
 * is derived toward each context; then the star dissolves and every anchor
 * gathers in Ana's document, which chapter 02 starts from.
 */
export const SeedToDocument: React.FC = () => {
  const frame = useCurrentFrame();

  const words = WORDS.map((_, i) => stagger(frame, T.words, i, WORDS.length, 0.35));
  const gather = prog(frame, T.gather, easeInOut);
  const seed = prog(frame, T.seed);
  const spokes = ROWS.map((_, i) => stagger(frame, T.anchors, i, ROWS.length, 0.42));
  const dissolve = prog(frame, T.dissolve);
  const docCard = prog(frame, T.docCard);
  const fly = ROWS.map((_, i) => stagger(frame, T.fly, i, ROWS.length, 0.5, easeInOut));
  const names = ROWS.map((_, i) => stagger(frame, T.names, i, ROWS.length, 0.5));

  const star = 1 - dissolve;

  return (
    <Box>
      {/* the magic words, flying into the seed */}
      <g opacity={1 - part(gather, 0.75, 1)}>
        <rect x={98} y={84} width={204} height={110} rx={10} fill={C.tint} opacity={0.5 * Math.max(...words) * (1 - gather)} />
        <text x={200} y={76} textAnchor="middle" fontFamily={FONT} fontSize={9.5} fontWeight={600} fill={C.accentHigh} opacity={words[0] * (1 - gather)}>
          twelve magic words
        </text>
        {WORDS.map((w, i) => {
          const p = wordAt(i);
          const x = lerp(p[0], SEED[0], gather);
          const y = lerp(p[1] + 3.5, SEED[1] + 3, gather);
          return (
            <text key={w} x={x} y={y} textAnchor="middle" fontFamily={MONO} fontSize={10.5 * (1 - 0.6 * gather)} fill={C.white} opacity={words[i]}>
              {w}
            </text>
          );
        })}
      </g>

      {/* the star: derivation (dashed) to each anchor, the anchor's context (solid) */}
      {ROWS.map((_, i) => {
        const t = spokes[i];
        if (t <= 0) return null;
        const n = node(i);
        const c = chip(i);
        const derive = part(t, 0, 0.35);
        const face = part(t, 0.45, 0.8);
        const ctx = part(t, 0.7, 1);
        const lab = labelAt(i);
        const kind = CONTEXTS[i].kind;
        return (
          <g key={i} opacity={star}>
            <line x1={SEED[0]} y1={SEED[1]} x2={lerp(SEED[0], c[0], derive)} y2={lerp(SEED[1], c[1], derive)} stroke={C.gray3} strokeWidth={1.2} strokeDasharray="3 3" />
            <line x1={c[0]} y1={c[1]} x2={lerp(c[0], n[0], face)} y2={lerp(c[1], n[1], face)} stroke={C.accent} strokeWidth={1.4} />
            {kind === 'person' ? <circle cx={n[0]} cy={n[1]} r={NODE_R} fill={CONTEXTS[i].fill} opacity={ctx} /> : null}
            {kind === 'public' ? <circle cx={n[0]} cy={n[1]} r={NODE_R} fill={C.bg} stroke={C.gray3} strokeWidth={1.4} opacity={ctx} /> : null}
            {kind === 'group' ? <GroupMark at={n} r={NODE_R} opacity={ctx} shift={CONTEXTS[i].shift} /> : null}
            <text x={lab.at[0]} y={lab.at[1]} textAnchor={lab.anchor} fontFamily={FONT} fontSize={9.5} fontWeight={600} fill={C.gray2} opacity={ctx}>
              {ROWS[i].name}
            </text>
          </g>
        );
      })}

      {/* the seed */}
      {seed > 0 ? (
        <g transform={`translate(${SEED[0]} ${SEED[1]}) scale(${0.6 + 0.4 * seed})`} opacity={seed * star}>
          <circle r={34} fill={C.tint} />
          <circle r={25} fill={PEOPLE.A.tone.stage} />
          <text y={-1} textAnchor="middle" fontFamily={FONT} fontSize={11} fontWeight={700} fill={C.bg}>
            Ana
          </text>
          <text y={10} textAnchor="middle" fontFamily={FONT} fontSize={7.5} fill={C.bg}>
            one seed
          </text>
        </g>
      ) : null}

      {/* the document gathers every anchor */}
      <DocCard opacity={docCard} />
      {ROWS.map((_, i) => {
        const t = spokes[i];
        if (t <= 0) return null;
        const c = chip(i);
        const pop = part(t, 0.3, 0.5);
        const fl = fly[i];
        const row = rowAt(i);
        // the chip's text flies to its row; its pill fades as it leaves the star
        const x = lerp(c[0] - CHIP.w / 2 + 6, row[0], fl);
        const y = lerp(c[1] + 2.6, row[1], fl);
        return (
          <g key={`c${i}`}>
            <rect x={c[0] - CHIP.w / 2} y={c[1] - CHIP.h / 2} width={CHIP.w} height={CHIP.h} rx={CHIP.h / 2} fill={C.bg} stroke={C.accent} strokeOpacity={0.7} strokeWidth={1} opacity={pop * (1 - part(fl, 0, 0.3))} />
            <AnchorText at={[x, y]} i={i} size={lerp(7, 7.2, fl)} opacity={pop} />
            <RowName i={i} opacity={names[i]} />
          </g>
        );
      })}
    </Box>
  );
};

