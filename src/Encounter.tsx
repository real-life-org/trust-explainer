import React from 'react';
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFonts } from './fonts';
import { f, T } from './timings';
import { phonePose, useLayout } from './layout';
import { Phone } from './components/Phone';
import { ShowQr } from './steps/ShowQr';
import { ScanCode } from './steps/ScanCode';
import { ConfirmOnBen } from './steps/ConfirmOnBen';
import { ConfirmBackOnAna } from './steps/ConfirmBackOnAna';
import { Contacts } from './steps/Contacts';
import { CredentialFlight } from './steps/CredentialFlight';
import { Caption } from './steps/Caption';
import { Background, Header, NameTag } from './steps/Stage';

loadFonts();

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Sequence props for a span of absolute seconds. */
const span = (s: { from: number; to: number }) => ({ from: f(s.from), durationInFrames: f(s.to) - f(s.from) });
/** A moment inside a span, relative to the span's start. */
const rel = (at: number, s: { from: number }) => f(at) - f(s.from);

export const Encounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const L = useLayout();

  const intro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: f(T.intro.to - T.intro.from) });
  const introB = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: f(T.intro.to - T.intro.from) });

  // the viewfinder hole opens when Ben's phone sets off and closes when the confirmation takes over
  const hole =
    interpolate(frame, [f(T.scanMove.from), f(T.scanMove.from) + 10], [0, 1], clamp) *
    interpolate(frame, [f(T.confirmOnBen.from), f(T.confirmOnBen.from) + 8], [1, 0], clamp);

  const toEnd = (from: number) => ({ from: f(from), durationInFrames: durationInFrames - f(from) });

  return (
    <AbsoluteFill>
      <Background />
      <Header L={L} />
      <NameTag who="A" L={L} />
      <NameTag who="B" L={L} />

      {/* Ana */}
      <Phone pose={phonePose('A', frame, L)} L={L} opacity={intro} lift={(1 - intro) * 40} zIndex={10}>
        <Sequence name="1 Ana shows her code" {...span(T.qrOnAna)}>
          <ShowQr who="A" />
        </Sequence>
        <Sequence name="5 Ana confirms back" {...span(T.confirmBackOnAna)}>
          <ConfirmBackOnAna tapAt={rel(T.confirmBackOnAna.tap, T.confirmBackOnAna)} />
        </Sequence>
        <Sequence name="6+7 Ana contacts, trust act" {...span(T.contacts)}>
          <Contacts
            peer={{ name: 'Ben', initial: 'B' }}
            others={[
              { name: 'Clara', initial: 'C', trusted: true, sub: 'met in person · March' },
              { name: 'Dev', initial: 'D', trusted: false, sub: 'met in person · July' },
            ]}
            newRowAt={rel(T.contacts.newRow, T.contacts)}
            trust={{ highlightAt: rel(T.trust.from, T.contacts), tapAt: rel(T.trust.tap, T.contacts) }}
          />
        </Sequence>
      </Phone>

      {/* Ben */}
      <Phone pose={phonePose('B', frame, L)} L={L} opacity={introB} lift={(1 - introB) * 40} hole={hole} zIndex={20}>
        <Sequence name="Ben shows his code" {...span(T.codeOnBen)}>
          <ShowQr who="B" tapScanAt={rel(T.codeOnBen.tap, T.codeOnBen)} />
        </Sequence>
        <Sequence name="2 Ben scans" {...span(T.scannerOnBen)}>
          <ScanCode recognizedAt={rel(T.recognized, T.scannerOnBen)} />
        </Sequence>
        <Sequence name="3 Ben confirms" {...span(T.confirmOnBen)}>
          <ConfirmOnBen tapAt={rel(T.confirmOnBen.tap, T.confirmOnBen)} />
        </Sequence>
        <Sequence name="6 Ben contacts" {...span(T.contacts)}>
          <Contacts
            peer={{ name: 'Ana', initial: 'A' }}
            others={[
              { name: 'Eli', initial: 'E', trusted: true, sub: 'met in person · May' },
              { name: 'Kai', initial: 'K', trusted: false, sub: 'met in person · June' },
            ]}
            newRowAt={rel(T.contacts.newRow, T.contacts)}
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

      {/* captions */}
      <Sequence name="caption 1" {...span(T.captions.qr)} style={{ zIndex: 300 }}>
        <Caption step={1} text="Ana shows her code" L={L} />
      </Sequence>
      <Sequence name="caption 2" {...span(T.captions.scan)} style={{ zIndex: 300 }}>
        <Caption step={2} text="Ben scans it, phone over phone" L={L} />
      </Sequence>
      <Sequence name="caption 3" {...span(T.captions.confirm)} style={{ zIndex: 300 }}>
        <Caption step={3} text="Ben confirms it is Ana and signs a credential for her" L={L} />
      </Sequence>
      <Sequence name="caption 4" {...span(T.captions.confirmBack)} style={{ zIndex: 300 }}>
        <Caption step={4} text="Ana confirms Ben back and signs one for him" L={L} />
      </Sequence>
      <Sequence name="caption 5" {...span(T.captions.contacts)} style={{ zIndex: 300 }}>
        <Caption step={5} text="A new contact on both phones" L={L} />
      </Sequence>
      <Sequence name="caption 6" {...span(T.captions.trust)} style={{ zIndex: 300 }}>
        <Caption step={6} text="Trust is a separate act: Ana marks Ben as trusted" L={L} />
      </Sequence>
      <Sequence name="outro" {...span(T.captions.outro)} style={{ zIndex: 300 }}>
        <Caption text="Key control, freshness and deliberate recognition." L={L} quiet />
      </Sequence>
    </AbsoluteFill>
  );
};
