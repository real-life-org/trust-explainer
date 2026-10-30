import React from 'react';
import { useCurrentFrame } from '../../kit/timeline';
import { PEOPLE } from '../../kit/cast';
import { C, FONT } from '../../kit/theme';
import { AnchorText, Box, DOC, DocCard, ROWS, RowName, easeInOut, lerp, part, prog, rowAt, type Pt } from '../identity/shared';
import { T } from './timings';

/** A key, its ring centred left of (cx, cy), in box units scaled by k. */
const Key: React.FC<{ cx: number; cy: number; k: number; opacity: number }> = ({ cx, cy, k, opacity }) => {
  const bx = cx - 13.5 * k;
  return (
    <g opacity={opacity} fill={C.accentHigh}>
      <circle cx={bx} cy={cy} r={11 * k} />
      <circle cx={bx} cy={cy} r={4.5 * k} fill={C.bg} />
      <rect x={bx + 8 * k} y={cy - 3.5 * k} width={32 * k} height={7 * k} rx={2 * k} />
      <rect x={bx + 32 * k} y={cy + 2 * k} width={6 * k} height={9 * k} rx={1.5 * k} />
      <rect x={bx + 22 * k} y={cy + 2 * k} width={5 * k} height={6 * k} rx={1.5 * k} />
    </g>
  );
};

/** The whole document: card, anchors and names. */
const FullDoc: React.FC = () => (
  <g>
    <DocCard opacity={1} />
    {ROWS.map((_, i) => (
      <g key={i}>
        <AnchorText at={rowAt(i)} i={i} />
        <RowName i={i} opacity={1} />
      </g>
    ))}
  </g>
);

const DOC_C: Pt = [DOC.x + DOC.w / 2, DOC.y + DOC.h / 2];

/** The two devices, and where a copy of the document lands on each. */
const PHONE = { x: 106, y: 160, w: 56, h: 102, doc: [134, 194] as Pt, docScale: 0.2, key: [136, 240] as Pt };
const LAPTOP = { x: 194, y: 168, w: 104, h: 64, doc: [222, 200] as Pt, docScale: 0.22, key: [268, 202] as Pt };

/**
 * Chapter 02's scene. It opens on Ana's document, where chapter 01 left it.
 * Her devices appear; the document becomes two, and one copy lands on each
 * device. Around the two the person takes shape. Agent and relay stay outside.
 */
export const DocumentToDevices: React.FC = () => {
  const frame = useCurrentFrame();

  const devices = prog(frame, T.devices);
  const keys = prog(frame, T.keys);
  const split = prog(frame, T.split, easeInOut);
  const person = prog(frame, T.person);
  const outside = prog(frame, T.outside);

  /** a copy on its way: out of the document, sideways, then down onto its device */
  const copy = (to: Pt, scale: number, side: -1 | 1) => {
    if (split <= 0) return null;
    const x = lerp(DOC_C[0], to[0], split) + side * 46 * Math.sin(Math.PI * part(split, 0, 1));
    const y = lerp(DOC_C[1], to[1], split);
    const s = lerp(1, scale, part(split, 0.15, 1));
    return (
      <g transform={`translate(${x} ${y}) scale(${s}) translate(${-DOC_C[0]} ${-DOC_C[1]})`}>
        <FullDoc />
      </g>
    );
  };

  return (
    <Box>
      {/* the person: a soft region forming around both devices */}
      <g opacity={person}>
        <rect x={86} y={128} width={232} height={168} rx={64} fill={C.tint} fillOpacity={0.55} stroke={PEOPLE.A.tone.stage} strokeOpacity={0.55} strokeWidth={1.4} />
        <text x={202} y={146} textAnchor="middle" fontFamily={FONT} fontSize={11} fontWeight={700} fill={PEOPLE.A.tone.stage}>
          Ana
        </text>
      </g>

      {/* her devices, each with its own key */}
      <g opacity={devices}>
        <rect x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx={10} fill={C.bg} stroke={C.accent} strokeWidth={2} />
        <rect x={PHONE.x + PHONE.w / 2 - 9} y={PHONE.y + 5} width={18} height={3.5} rx={1.75} fill={C.gray4} />
        <rect x={LAPTOP.x} y={LAPTOP.y} width={LAPTOP.w} height={LAPTOP.h} rx={7} fill={C.bg} stroke={C.accent} strokeWidth={2} />
        <rect x={LAPTOP.x - 10} y={LAPTOP.y + LAPTOP.h + 3} width={LAPTOP.w + 20} height={5.5} rx={2.75} fill={C.accent} />
        <text x={PHONE.x + PHONE.w / 2} y={PHONE.y + PHONE.h + 14} textAnchor="middle" fontFamily={FONT} fontSize={9} fontWeight={600} fill={C.gray2}>
          phone
        </text>
        <text x={LAPTOP.x + LAPTOP.w / 2} y={LAPTOP.y + LAPTOP.h + 22} textAnchor="middle" fontFamily={FONT} fontSize={9} fontWeight={600} fill={C.gray2}>
          laptop
        </text>
      </g>
      <Key cx={PHONE.key[0]} cy={PHONE.key[1]} k={0.55} opacity={keys} />
      <Key cx={LAPTOP.key[0]} cy={LAPTOP.key[1]} k={0.55} opacity={keys} />

      {/* the document, as chapter 01 left it; it becomes two */}
      <g opacity={1 - part(split, 0, 0.08)}>
        <FullDoc />
      </g>
      {copy(PHONE.doc, PHONE.docScale, -1)}
      {copy(LAPTOP.doc, LAPTOP.docScale, 1)}

      {/* outside the person: they may help, they never stand inside */}
      <g opacity={outside} fontFamily={FONT} textAnchor="middle">
        <rect x={338} y={136} width={56} height={40} rx={8} fill="none" stroke={C.gray4} strokeWidth={1.3} strokeDasharray="4 3.5" />
        <text x={366} y={160} fontSize={9.5} fontWeight={600} fill={C.gray3}>
          agent
        </text>
        <text x={366} y={198} fontSize={8} fill={C.gray3}>
          may help,
        </text>
        <text x={366} y={209} fontSize={8} fill={C.gray3}>
          never inside
        </text>
        <rect x={338} y={226} width={56} height={40} rx={8} fill="none" stroke={C.gray4} strokeWidth={1.3} strokeDasharray="4 3.5" />
        <text x={366} y={250} fontSize={9.5} fontWeight={600} fill={C.gray3}>
          relay
        </text>
        <text x={366} y={280} fontSize={7.5} fill={C.gray3}>
          carries it, sealed
        </text>
      </g>
    </Box>
  );
};
