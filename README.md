# trust-explainer

The shared base for explaining the Real Life Trust Protocol: one set of
building blocks and one chapter model, drawn as interactive slides in the
browser, rendered as video, and later as animated graphics for the website.
Every output draws the same React components from the same timeline, so
they cannot drift apart.

The chapters follow the deck "RLTP Core Principles", one chapter per
principle, in the deck's order (01 to 11). Each chapter first draws the
principle's picture from the deck, step by step, and then the scenes that
explain it. Built so far, and told as one movement from 01 to 03:

- 01 "Identity": twelve magic words become one seed, the seed derives one
  anchor per context, and every anchor gathers in Ana's document.
- 02 "Person": the document becomes two copies, one on each of her devices;
  together they are the person. Agent and relay stay outside.
- 03 "Relationship": the person contracts to a point, a second one appears,
  both take up a phone, and they meet: Ana and Ben each show a code, Ben
  scans Ana's phone over phone, both confirm, each signs an ed25519
  encounter credential for the other, and each credential becomes the new
  contact.
- 07 "Relational reading": Ana's and Ben's stars stand apart, then Ben lays
  his over hers; what they share becomes two lists, contacts and groups.
The other principles are in the outline, without scenes yet.

The look follows the ceremony simulator in
[trust-protocol](https://github.com/real-life-org/trust-protocol)
(`simulator/`: dark handset with status bar and dynamic island, light
screen, the viewfinder cut through the scanning phone) and the site's
encounter card (`apps/site`: navy, blue accent, green signed credentials,
fingerprint and shield icons).

Live: <https://real-life.org/trust-explainer/>

## Use

```sh
npm install
npm run dev             # slides at /, video.html, animations.html, frame.html?scrub
npm run build           # static site in out/web/, works from any subpath
npm run render          # out/relationship.mp4 (1920x1080)
npm run render:square   # out/relationship-square.mp4 (1080x1080)
npm run stills          # PNG of every beat's hold, both formats, in out/
                        # (out/still-03-relationship-0-line.png, out/square-03-...)
npm run stills -- --pdf # also out/slides.pdf and out/slides-square.pdf, one still per page
```

Video needs ffmpeg (with libx264); video and stills need a Chromium: `--browser=/path`, or
`$CHROME_PATH`, or `/usr/bin/chromium`. No browser download is needed.

The site is published with GitHub Pages from `main`
(`.github/workflows/pages.yml`).

## Pages

Three pages share one top bar:

- **Slides** (`index.html`): every slide in a strip on the left, the
  current one large on the right, as in a presentation program. One slide
  is one beat.
- **Video** (`video.html`): the whole film, every chapter back to back,
  drawn live, with a timeline (chapters as segments, a tick at every hold),
  fullscreen and a 16:9/square switch.
- **Animations** (`animations.html`): looping clips for websites, each
  with its embed code.

## Slides and presenting

Next plays the chapter up to the next beat's hold and stops there exactly;
next while a step still plays finishes it at once. Back, and a click in
the strip, jump to a slide without playing. At the end of a chapter, next
plays the following chapter in. Present shows the same stage in
fullscreen, starting at the current slide; Esc returns to the strip on the
same slide. The clock runs at display rate.

| Key | Action |
|---|---|
| → ↓ Space PageDown, click on the slide | next step |
| ← ↑ Backspace PageUp, shift-click | previous slide |
| Home / End | first / last slide |
| P, F5, F | present (again: leave) |
| C, click on the tab | open or close the OpenVTC comparison |
| Esc | close the comparison, else leave the presentation |

The current slide is kept in the URL (`#relationship/2`: chapter and beat, 0
is the first beat), so a reload or a shared link opens the same slide.
Older links to the encounter (`#encounter/2`) open the same slide inside
chapter 03; links to the former chapter 04 (`#no-issuer/…`) open chapter 03.

## Elsewhere in the ecosystem

A principle can carry `contrast` (`src/chapters/principles.ts`): a few
sentences on how OpenVTC answers the same question. On the slides page,
and only there, such a chapter shows a tab at the bottom of the stage,
"Elsewhere in the ecosystem". The tab or C slides a panel up over the
lower part of the stage, "Compared with OpenVTC"; the tab, C or Esc close
it, and every change of slide does too. It is page UI, not part of a
scene: the video, clips, stills and the frame export never show it, and
the timeline is unchanged. While presenting, Esc first closes the panel
and leaves the presentation on the next press; this needs the Keyboard
Lock API (Chromium), elsewhere Esc leaves fullscreen at once.

## Animations for websites

A clip (`web/clips.ts`) is a stretch of one chapter in one format, with or
without captions. `embed.html?clip=<id>` plays it in a loop,
filling its frame, with a short fade where the loop starts over. It pauses
while out of view and shows its last frame to visitors who prefer reduced
motion. Embed it with an iframe; the Animations page copies the code:

```html
<iframe src="https://<site>/embed.html?clip=scan" title="Phone over phone"
  loading="lazy" style="width:100%;aspect-ratio:1080/1080;border:0"></iframe>
```

To add a clip, add an entry to `CLIPS`.

## Preview

`/frame.html?scrub` (optionally `&chapter=<id>&format=square`) shows one
chapter with a play button and a timeline; the dots mark each beat's hold.
Use it to tune timings.

## How it renders

A scene is a pure function of the current frame: the same frame always
gives the same picture, and frames may be fractional.

- `src/kit/timeline.tsx`: `Timeline` (provides frame and stage size),
  `useCurrentFrame`, `useVideoConfig`, `Sequence` (a span of frames with its
  own local time), `AbsoluteFill`
- `src/kit/motion.ts`: `interpolate`, `interpolateColors`, `Easing.bezier`,
  `spring`

The slides, the video page and the clips drive the frame from their own clock. The video export
(`scripts/render.mjs`) opens `web/frame.html` in headless Chromium through
playwright-core, sets each frame through `window.__frame.set(n)`, takes a
screenshot and pipes it into ffmpeg.

## Structure

```text
src/
  kit/                 shared by every chapter, so everything looks alike
    timeline.tsx       the time core: frame, spans, layers
    motion.ts          interpolation, easing, springs
    theme.ts           colours (site tokens, simulator screens), fonts
    cast.ts            Ana and Ben: names, keys, each person's colour
    geometry.ts        phone geometry, screen-to-stage mapping
    format.ts          output formats (16:9, square) and stage metrics
    time.ts            fps, seconds -> frames
    chapter.tsx        the chapter model: beats, principles, parts
    ChapterStage.tsx   the frame around every chapter: stage, scene, captions
    stage.tsx          background, name tag
    fonts.ts           loads the bundled fonts
    Phone.tsx, CredentialCard.tsx, QrCode.tsx, Icons.tsx, ui.tsx
  chapters/
    principles.ts      the eleven principles of the deck: title, line, body, notes, contrast
    outline.ts         the principles in deck order, with their chapters once built
    index.ts           all built chapters in telling order
    identity/          chapter 01: magic words, seed, anchors, Ana's document; shared box and document
    person/            chapter 02: the document becomes two copies on her devices
    relationship/      chapter 03: the person contracts to a point, then the encounter
    encounter/         the encounter, a part of chapter 03
    relational-reading/ chapter 07: two stars laid on top, two lists
web/
  Page.tsx, ui.tsx           page frame with the top bar, small UI pieces
  index.html, SlidesPage.tsx the slides: strip, stage, presenting
  ContrastPanel.tsx          the OpenVTC comparison on the slides stage
  stops.ts                   where each slide holds
  video.html, VideoPage.tsx  the film player
  film.ts                    all chapters as one film
  animations.html, AnimationsPage.tsx  the graphics for websites
  clips.ts, ClipPlayer.tsx   looping clips for websites
  embed.html, embed.tsx      one clip, for an iframe
  frame.html, frame.tsx      one chapter at one frame: export and preview
  ChapterView.tsx            a chapter on a stage scaled to fit
  playhead.ts                a display-rate playhead (video, clips, preview)
scripts/
  render.mjs           video and stills through headless Chromium and ffmpeg
  stills.mjs           stills of every hold
public/fonts/          Ubuntu Sans and Ubuntu Sans Mono, bundled so renders match
```

### Chapters and beats

A chapter (`src/kit/chapter.tsx`) is a scene plus a list of beats. Each beat
has a caption, a start time and a hold: the moment the step's result is
complete and the scene is at rest. The caption runs until the next beat
starts. The slides stop at each hold; `beatSpans` throws if a hold lies
outside its beat or where its caption is already fading. Beats are numbered
in order; a `quiet` beat (opening or closing line) is unnumbered, and so is
an `emphasis` beat (a principle's line), whose caption is larger.

A chapter that tells a principle carries it as `principle` (title, line,
body, notes; `src/chapters/principles.ts`). Its kicker is the principle's
title, and its number comes from its place in `OUTLINE`
(`src/chapters/outline.ts`): slides and player label it "03 · Relationship".
`CHAPTERS` is every outline entry that has a chapter; entries without one
are placeholders and never reach the slides or the film.

A chapter can be made of parts: a `Part` is a scene with its own beats and
length, on its own timeline. `joinParts` lays parts end to end, shifts their
beats, starts the first beat of each following part exactly where the part
before ends, and runs each part's scene in its own `Sequence`. `overlapS`
lets a scene stay on into the next part to fade out there.

To add a chapter: create `src/chapters/<id>/` with its scenes and an
`index.ts` exporting a `Chapter` (with `principle` and the picture as the
first part), and set it on its entry in `src/chapters/outline.ts`.

## Chapter 03: Relationship

Three parts. The picture (`src/chapters/relationship/`) starts on chapter
02's last frame, drawn by chapter 02's own scene held at its end: the person
contracts to a point, Ben's point appears, and both grow into the phones the
encounter starts from. Its timings are in `relationship/timings.ts`. Then
the encounter, on its own timeline. Last the network (`Network.tsx`): it
starts on the encounter's last frame, the phones contract into Ana and Ben,
and pair by pair the network of the deck slide grows around them.

The encounter's beats are in `src/chapters/encounter/index.ts`, animation
timings in `timings.ts` (seconds on the encounter's own timeline; the
chapter starts it after the picture, `PICTURE_S` in `relationship/timings.ts`). Each step is its own
component in `steps/` and runs in its own `<Sequence>` in `Encounter.tsx`.
Phone motion (the scan arc and the return) is computed from the same
constants in `layout.ts`, which also holds the code position, the
credential dock, the contact rows and where the phones stand in each
format.

Times in seconds on the chapter's timeline:

| Beat | Runs | Hold | Ends with |
|---|---|---|---|
| Line | 0.3 to 2.1 | 1.75 | the person of chapter 02 shrunk onto Ana's point |
| 1 Ana meets Ben | 2.1 to 3.2 | 2.85 | Ana and Ben as two points |
| Start | 3.2 to 4.8 | 4.4 | the points grown into the app, both phones show their code |
| 2 Scan | 4.8 to 9.6 | 9.3 | code recognized, phones home, confirmation on Ben's phone |
| 3 First confirmation | 9.6 to 13.4 | 13.0 | Ben's credential docked on Ana's phone, confirmation on Ana's phone |
| 4 Second confirmation | 13.4 to 17.3 | 16.9 | Ana's credential docked on Ben's phone, both phones show "Connected" |
| 5 Contacts | 17.3 to 20.3 | 19.3 | both credentials became the new contact, Ana's first, then Ben's |
| 6 Connected | 20.3 to 23.5 | 23.2 | the phones contracted into Ana and Ben, linked inside the network |
| 7 Network | 23.5 to 26.6 | 26.3 | the network spreads outward from Ana and Ben in waves; nobody moves once there |
| 8 Groups | 26.6 to 28.2 | 27.7 | the two groups where links are dense, a pair at the edge |

Names and keys are illustration, as on the site.

## Licence

Code: [MIT](LICENSE). The bundled fonts Ubuntu Sans and Ubuntu Sans Mono
are © Canonical Ltd. under the Ubuntu Font Licence 1.0
([public/fonts/LICENCE.txt](public/fonts/LICENCE.txt)).
