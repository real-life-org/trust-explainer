import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadFonts } from '../src/kit/fonts';
import { CLIPS } from './clips';
import { ClipPlayer } from './ClipPlayer';

/**
 * One clip for embedding in other websites (`embed.html?clip=<id>`):
 * fills the frame, loops, no controls.
 */
const clip = CLIPS.find((c) => c.id === new URLSearchParams(location.search).get('clip')) ?? CLIPS[0];

const Embed: React.FC = () => {
  const [fonts, setFonts] = useState(false);
  useEffect(() => {
    void loadFonts().then(() => setFonts(true));
  }, []);
  return fonts ? <ClipPlayer clip={clip} /> : null;
};

createRoot(document.getElementById('root')!).render(<Embed />);
