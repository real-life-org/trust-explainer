import React from 'react';
import { AbsoluteFill, Sequence } from './timeline';
import { loadFonts } from './fonts';
import { useFormat } from './format';
import { beatSpans, type Chapter } from './chapter';
import { f } from './time';
import { Background, Header } from './stage';
import { Caption } from './Caption';

loadFonts();

/** What the stage shows around the scene; graphics for websites can leave out header and captions. */
export type StageOptions = { header?: boolean; captions?: boolean };

/**
 * The frame every chapter is shown in: navy stage, header with the
 * chapter's kicker, the scene, and one caption per beat on top.
 */
export const ChapterStage: React.FC<{ chapter: Chapter } & StageOptions> = ({
  chapter,
  header = true,
  captions = true,
}) => {
  const F = useFormat();
  const { Scene } = chapter;
  return (
    <AbsoluteFill>
      <Background />
      {header ? <Header kicker={chapter.kicker} F={F} /> : null}
      <Scene />
      {(captions ? beatSpans(chapter) : []).map((b) => (
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
