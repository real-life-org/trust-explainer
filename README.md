# Trust protocol explainer

The shared base for explaining the Real Life Trust Protocol: one set of
building blocks and one chapter model, drawn as interactive slides in the
browser, rendered as video, and later as animated graphics for the website.
Every output draws the same React components from the same timeline, so
they cannot drift apart.

The first chapter animates the in-person encounter: Ana and Ben each show
a code, Ben scans Ana's phone over phone, both confirm, each signs an
ed25519 encounter credential for the other, and each credential jumps into
the contact list and becomes the new contact.

The look follows the ceremony simulator (`trust-protocol/simulator/`: dark
handset with status bar and dynamic island, light screen, the viewfinder cut
through the scanning phone) and the site's encounter card
(`trust-protocol/apps/site`: navy, blue accent, green signed credentials,
fingerprint and shield icons).

## Use

```sh
npm install
npm run dev             # slides at /, video.html, animations.html, frame.html?scrub
npm run build           # static site in out/web/, works from any subpath
npm run render          # out/encounter.mp4 (1920x1080)
npm run render:square   # out/encounter-square.mp4 (1080x1080)
npm run stills          # PNG of every beat's hold, both formats, in out/
```

Video and stills need ffmpeg and a Chromium: `--browser=/path`, or
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
| Esc | leave the presentation |

The current slide is kept in the URL (`#encounter/2`: chapter and beat, 0
is the start state), so a reload or a shared link opens the same slide.

## Animations for websites

A clip (`web/clips.ts`) is a stretch of one chapter in one format, with or
without header and captions. `embed.html?clip=<id>` plays it in a loop,
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
    chapter.ts         the chapter model: beats with captions and holds
    ChapterStage.tsx   the frame around every chapter: stage, header, captions
    stage.tsx          background, header, name tag
    fonts.ts           loads the bundled fonts
    Phone.tsx, CredentialCard.tsx, QrCode.tsx, Icons.tsx, ui.tsx
  chapters/
    index.ts           all chapters in telling order
    encounter/         chapter "One encounter"
web/
  Page.tsx, ui.tsx           page frame with the top bar, small UI pieces
  index.html, SlidesPage.tsx the slides: strip, stage, presenting
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

A chapter (`src/kit/chapter.ts`) is a scene plus a list of beats. Each beat
has a caption, a start time and a hold: the moment the step's result is
complete and the scene is at rest. The caption runs until the next beat
starts. The slides stop at each hold; `beatSpans` throws if a hold lies
outside its beat or where its caption is already fading. Beats are numbered
in order; a `quiet` beat (opening or closing line) is unnumbered.

To add a chapter: create `src/chapters/<id>/` with its scene and an
`index.ts` exporting a `Chapter`, and add it to `src/chapters/index.ts`.

## Chapter: One encounter

Beats are in `src/chapters/encounter/index.ts`, animation timings in
`timings.ts` (seconds on the chapter's timeline). Each step is its own
component in `steps/` and runs in its own `<Sequence>` in `Encounter.tsx`.
Phone motion (the scan arc and the return) is computed from the same
constants in `layout.ts`, which also holds the code position, the
credential dock, the contact rows and where the phones stand in each
format.

| Beat | Runs | Hold | Ends with |
|---|---|---|---|
| Start | 0.3 to 1.6 | 1.2 | both phones show their code |
| 1 Scan | 1.6 to 8.0 | 7.7 | code recognized, phones home, confirmation on Ben's phone |
| 2 First confirmation | 8.0 to 11.8 | 11.4 | Ben's credential docked on Ana's phone, confirmation on Ana's phone |
| 3 Second confirmation | 11.8 to 15.7 | 15.3 | Ana's credential docked on Ben's phone, both phones show "Connected" |
| 4 Contacts | 15.7 to 18.7 | 17.7 | both credentials became the new contact, Ana's first, then Ben's |

Names and keys are illustration, as on the site.
