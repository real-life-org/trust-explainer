import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { loadFonts } from './fonts';
import { useFormat } from './format';
import { beatSpans, type Chapter } from './chapter';
import { f } from './time';
import { Background, Header } from './stage';
import { Caption } from './Caption';

loadFonts();

/**
 * The frame every chapter is shown in: navy stage, header with the
 * chapter's kicker, the scene, and one caption per beat on top.
 */
export const ChapterStage: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const F = useFormat();
  const { Scene } = chapter;
  return (
    <AbsoluteFill>
      <Background />
      <Header kicker={chapter.kicker} F={F} />
      <Scene />
      {beatSpans(chapter).map((b) => (
        <Sequence
          key={b.id}
          name={`caption ${b.step ?? b.id}`}
          from={f(b.from)}
          durationInFrames={f(b.to) - f(b.from)}
          style={{ zIndex: 300 }}
        >
          <Caption step={b.step} text={b.caption} F={F} quiet={b.quiet} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
