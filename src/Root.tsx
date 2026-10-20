import React from 'react';
import { Composition } from 'remotion';
import { CHAPTERS } from './chapters';
import { ChapterStage } from './kit/ChapterStage';
import { FORMATS } from './kit/format';
import { f, FPS } from './kit/time';

const ChapterById: React.FC<{ chapterId: string }> = ({ chapterId }) => {
  const chapter = CHAPTERS.find((c) => c.id === chapterId);
  if (!chapter) throw new Error(`unknown chapter ${chapterId}`);
  return <ChapterStage chapter={chapter} />;
};

/** One composition per chapter and format, e.g. "Encounter" and "EncounterSquare". */
export const RemotionRoot: React.FC = () => (
  <>
    {CHAPTERS.flatMap((chapter) =>
      FORMATS.map((format) => (
        <Composition
          key={chapter.composition + format.suffix}
          id={chapter.composition + format.suffix}
          component={ChapterById}
          defaultProps={{ chapterId: chapter.id }}
          durationInFrames={f(chapter.durationS)}
          fps={FPS}
          width={format.width}
          height={format.height}
        />
      )),
    )}
  </>
);
