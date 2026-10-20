import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadFonts } from '../src/kit/fonts';
import { Icon } from '../src/kit/Icons';
import { C, FONT } from '../src/kit/theme';

export type PageId = 'slides' | 'video' | 'animations';

const PAGES: Array<[PageId, string, string]> = [
  ['slides', 'Slides', 'index.html'],
  ['video', 'Video', 'video.html'],
  ['animations', 'Animations', 'animations.html'],
];

export const TOP_BAR = 56;

/** The bar across the top of every page: name and the three pages. */
const TopBar: React.FC<{ active: PageId }> = ({ active }) => (
  <header style={{ height: TOP_BAR, borderBottom: `1px solid ${C.gray5}`, background: C.band, flexShrink: 0 }}>
    <div style={{ height: '100%', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: C.tint, display: 'grid', placeItems: 'center' }}>
        <Icon name="fingerprint" size={18} color={C.accent} />
      </div>
      <strong style={{ color: C.white, fontSize: 16, whiteSpace: 'nowrap' }}>Real Life Trust Protocol</strong>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        {PAGES.map(([id, label, href]) => (
          <a
            key={id}
            href={href}
            aria-current={id === active ? 'page' : undefined}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              color: id === active ? C.white : C.gray3,
              background: id === active ? C.tint : 'transparent',
            }}
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  </header>
);

/** A page: top bar, then the content once the fonts are in. `fill` makes the content fill the window below the bar. */
export const Page: React.FC<{ active: PageId; fill?: boolean; children: React.ReactNode }> = ({ active, fill, children }) => {
  const [fonts, setFonts] = useState(false);
  useEffect(() => {
    void loadFonts().then(() => setFonts(true));
  }, []);
  return (
    <div
      style={{
        minHeight: '100%',
        height: fill ? '100%' : undefined,
        display: 'flex',
        flexDirection: 'column',
        background: C.band,
        color: C.gray2,
        fontFamily: FONT,
      }}
    >
      <TopBar active={active} />
      {fonts ? children : null}
    </div>
  );
};

export function mount(node: React.ReactNode) {
  createRoot(document.getElementById('root')!).render(node);
}
