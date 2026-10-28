import React from 'react';
import { Icon } from '../src/kit/Icons';
import { C, FONT } from '../src/kit/theme';

const TAB = 30;

/**
 * Page UI on the slides stage, never part of a scene: a slim tab at the
 * bottom centre, "Elsewhere in the ecosystem", and a panel that slides up
 * from the bottom edge over at most 40 % of the stage with how OpenVTC
 * answers the chapter's question. The stage must be a size container
 * (`containerType: 'size'`). Clicks here never reach the stage.
 */
export const ContrastPanel: React.FC<{ text: string; open: boolean; onToggle: () => void }> = ({ text, open, onToggle }) => (
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transform: open ? 'translateY(0)' : `translateY(calc(100% - ${TAB}px))`,
      transition: 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      pointerEvents: 'none',
      fontFamily: FONT,
      cursor: 'default',
    }}
  >
    <button
      onClick={onToggle}
      // keep focus off the tab, so Space keeps stepping the slides
      onMouseDown={(e) => e.preventDefault()}
      aria-expanded={open}
      aria-controls="contrast-panel"
      title={open ? 'close (C, Esc)' : 'compare with OpenVTC (C)'}
      style={{
        pointerEvents: 'auto',
        height: TAB,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 16px',
        border: `1px solid ${C.gray5}`,
        borderBottom: 0,
        borderRadius: '10px 10px 0 0',
        background: C.band,
        color: open ? C.gray2 : C.gray3,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 650,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      Elsewhere in the ecosystem
      <span style={{ display: 'inline-flex', transform: `rotate(${open ? 90 : -90}deg)`, transition: 'transform 320ms' }}>
        <Icon name="chevronRight" size={14} color={C.gray3} />
      </span>
    </button>
    <div
      id="contrast-panel"
      role="region"
      aria-label="Compared with OpenVTC"
      aria-hidden={!open}
      style={{
        pointerEvents: open ? 'auto' : 'none',
        alignSelf: 'stretch',
        maxHeight: '40cqh',
        overflowY: 'auto',
        background: C.band,
        borderTop: `1px solid ${C.gray5}`,
        boxShadow: '0 -12px 32px oklch(0% 0 0 / 0.35)',
      }}
    >
      <div style={{ maxWidth: 'min(92cqw, 66em)', margin: '0 auto', padding: 'clamp(14px, 3.2cqh, 36px) clamp(16px, 4cqw, 48px)' }}>
        <div style={{ fontSize: 'clamp(11px, 1.9cqh, 18px)', fontWeight: 650, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accentHigh }}>
          Compared with OpenVTC
        </div>
        <p style={{ margin: '0.6em 0 0', fontSize: 'clamp(13px, 2.9cqh, 30px)', lineHeight: 1.45, color: C.gray2 }}>{text}</p>
      </div>
    </div>
  </div>
);
