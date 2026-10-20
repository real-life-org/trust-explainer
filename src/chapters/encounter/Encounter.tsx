import React from 'react';
import { interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PEOPLE } from '../../kit/cast';
import { SCREEN } from '../../kit/geometry';
import { Phone } from '../../kit/Phone';
import { NameTag } from '../../kit/stage';
import { clamp, f } from '../../kit/time';
import { T } from './timings';
import { CODE, phonePose, useLayout } from './layout';
import { ShowQr } from './steps/ShowQr';
import { ScanCode } from './steps/ScanCode';
import { ConfirmOnBen } from './steps/ConfirmOnBen';
import { ConfirmBackOnAna } from './steps/ConfirmBackOnAna';
import { Contacts } from './steps/Contacts';
import { CredentialFlight } from './steps/CredentialFlight';

/** Sequence props for a span of absolute seconds. */
const span = (s: { from: number; to: number }) => ({ from: f(s.from), durationInFrames: f(s.to) - f(s.from) });
/** A moment inside a span, relative to the span's start. */
const rel = (at: number, s: { from: number }) => f(at) - f(s.from);

/** The encounter scene: two phones, the scan, both confirmations, the credentials becoming contacts. */
export const Encounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const L = useLayout();

  const intro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: f(T.intro.to - T.intro.from) });
  const introB = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: f(T.intro.to - T.intro.from) });

  // the viewfinder hole opens when Ben's phone sets off and closes when it leaves Ana's code
  const hole =
    interpolate(frame, [f(T.scanMove.from), f(T.scanMove.from) + 10], [0, 1], clamp) *
    interpolate(frame, [f(T.moveAway.from), f(T.moveAway.from) + 8], [1, 0], clamp);

  // the name tags dim while the phones are away from home
  const away = interpolate(
    frame,
    [f(T.scanMove.from), f(T.scanMove.from) + 10, f(T.moveAway.to) - 6, f(T.moveAway.to) + 6],
    [1, 0.25, 0.25, 1],
    clamp,
  );

  const toEnd = (from: number) => ({ from: f(from), durationInFrames: durationInFrames - f(from) });

  return (
    <>
      <NameTag who="A" at={L.home.A} s={L.s} F={L} dim={away} />
      <NameTag who="B" at={L.home.B} s={L.s} F={L} dim={away} />

      {/* Ana */}
      <Phone owner="A" pose={phonePose('A', frame, L)} s={L.s} opacity={intro} lift={(1 - intro) * 40} zIndex={10}>
        <Sequence name="Ana shows her code" {...span(T.qrOnAna)}>
          <ShowQr who="A" />
        </Sequence>
        <Sequence name="3 Ana confirms back" {...span(T.confirmBackOnAna)}>
          <ConfirmBackOnAna tapAt={rel(T.confirmBackOnAna.tap, T.confirmBackOnAna)} />
        </Sequence>
        <Sequence name="4 Ana contacts" {...span(T.contacts)}>
          <Contacts
            peer={PEOPLE.B}
            others={[
              { name: 'Clara', initial: 'C', trusted: true },
              { name: 'Dev', initial: 'D', trusted: false },
            ]}
            roomAt={rel(T.credToRow.A.from, T.contacts)}
            newRowAt={rel(T.credToRow.A.to, T.contacts)}
          />
        </Sequence>
      </Phone>

      {/* Ben */}
      <Phone
        owner="B"
        pose={phonePose('B', frame, L)}
        s={L.s}
        opacity={introB}
        lift={(1 - introB) * 40}
        hole={{ cx: SCREEN.w / 2, cy: CODE.cy, size: CODE.hole * hole }}
        zIndex={20}
      >
        <Sequence name="Ben shows his code" {...span(T.codeOnBen)}>
          <ShowQr who="B" tapScanAt={rel(T.codeOnBen.tap, T.codeOnBen)} />
        </Sequence>
        <Sequence name="1 Ben scans" {...span(T.scannerOnBen)}>
          <ScanCode recognizedAt={rel(T.recognized, T.scannerOnBen)} />
        </Sequence>
        <Sequence name="2 Ben confirms" {...span(T.confirmOnBen)}>
          <ConfirmOnBen tapAt={rel(T.confirmOnBen.tap, T.confirmOnBen)} />
        </Sequence>
        <Sequence name="4 Ben contacts" {...span(T.contacts)}>
          <Contacts
            peer={PEOPLE.A}
            others={[
              { name: 'Eli', initial: 'E', trusted: true },
              { name: 'Kai', initial: 'K', trusted: false },
            ]}
            roomAt={rel(T.credToRow.B.from, T.contacts)}
            newRowAt={rel(T.credToRow.B.to, T.contacts)}
          />
        </Sequence>
      </Phone>

      {/* 8: the credential exchange, in parallel with steps 3 to 7 */}
      <Sequence name="8a credential Ben → Ana" {...toEnd(T.credBenToAna.from)} style={{ zIndex: 200 }}>
        <CredentialFlight
          issuer="B"
          holder="A"
          start={f(T.credBenToAna.from)}
          flight={f(T.credBenToAna.to) - f(T.credBenToAna.from)}
          L={L}
        />
      </Sequence>
      <Sequence name="8b credential Ana → Ben" {...toEnd(T.credAnaToBen.from)} style={{ zIndex: 200 }}>
        <CredentialFlight
          issuer="A"
          holder="B"
          start={f(T.credAnaToBen.from)}
          flight={f(T.credAnaToBen.to) - f(T.credAnaToBen.from)}
          L={L}
        />
      </Sequence>
    </>
  );
};
