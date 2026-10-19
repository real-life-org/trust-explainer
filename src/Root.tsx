import React from 'react';
import { Composition } from 'remotion';
import { Encounter } from './Encounter';
import { DURATION_FRAMES, FPS } from './timings';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Encounter"
      component={Encounter}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="EncounterSquare"
      component={Encounter}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={1080}
      height={1080}
    />
  </>
);
