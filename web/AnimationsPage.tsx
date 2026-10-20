import React, { useState } from 'react';
import { Icon } from '../src/kit/Icons';
import { C, MONO } from '../src/kit/theme';
import { CLIPS, type Clip, clipSize } from './clips';
import { ClipPlayer } from './ClipPlayer';
import { mount, Page } from './Page';
import { Button, Frame, Section } from './ui';

const grid = (min: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`,
  gap: 18,
});

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

mount(
  <Page active="animations">
    <main style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '0 16px 80px', boxSizing: 'border-box' }}>
      <Animations />
    </main>
  </Page>,
);
