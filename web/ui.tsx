import React from 'react';
import { C, FONT } from '../src/kit/theme';

/** Small building blocks of the overview page, in the stage's colours. */

export const Section: React.FC<{ id: string; title: string; lead: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  id,
  title,
  lead,
  action,
  children,
}) => (
  <section id={id} style={{ padding: '48px 0 8px', scrollMarginTop: 64 }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.white, letterSpacing: '-0.01em' }}>{title}</h2>
        <p style={{ margin: '6px 0 0', fontSize: 16, color: C.gray3, maxWidth: 640 }}>{lead}</p>
      </div>
      {action}
    </div>
    <div style={{ marginTop: 22 }}>{children}</div>
  </section>
);

export const Button: React.FC<{
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
  title?: string;
}> = ({ onClick, primary, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: 38,
      padding: '0 16px',
      borderRadius: 10,
      border: primary ? 'none' : `1px solid ${C.gray5}`,
      background: primary ? C.primary : 'transparent',
      color: primary ? '#fff' : C.gray2,
      fontFamily: FONT,
      fontSize: 15,
      fontWeight: 650,
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);

/** A box with a fixed aspect ratio; children are laid over it. */
export const Frame: React.FC<{ ratio: number; children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }> = ({
  ratio,
  children,
  onClick,
  style,
}) => (
  <div
    onClick={onClick}
    style={{
      position: 'relative',
      width: '100%',
      aspectRatio: `${ratio}`,
      borderRadius: 12,
      overflow: 'hidden',
      background: C.bg,
      boxShadow: `0 0 0 1px ${C.gray5}`,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);
