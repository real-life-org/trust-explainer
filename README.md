# Encounter animation

A Remotion experiment that animates the in-person encounter of the Real Life
Trust Protocol: Ana shows a code, Ben scans it phone over phone, both confirm,
each signs an ed25519 encounter credential for the other, each credential
jumps into the contact list and becomes the new contact on both phones, and
Ana marks Ben as trusted in a separate step.

The look follows the ceremony simulator (`trust-protocol/simulator/`: dark
handset with status bar and dynamic island, light screen, the viewfinder cut through the scanning phone) and
the site's encounter card (`trust-protocol/apps/site`: navy, blue accent,
green signed credentials, fingerprint and shield icons).

Two compositions, 30 fps, 18 s:

- `Encounter`: 1920x1080
- `EncounterSquare`: 1080x1080

## Preview

```sh
npm install
npm run studio
```

Remotion Studio opens in the browser. It does not need a separate headless
browser.

## Render

```sh
npm run render          # out/encounter.mp4
npm run render:square   # out/encounter-square.mp4
npm run stills          # PNG stills of key moments in out/
```

Remotion downloads its own Chrome Headless Shell on the first render. If that
download is blocked, point it at any local Chrome or Chromium:

```sh
npm run render -- --browser-executable=/path/to/chrome
node scripts/stills.mjs --browser-executable=/path/to/chrome
```

## Deck

The same chapters as a click-through presentation in the browser:

```sh
npm run deck          # dev server, prints the local URL
npm run deck:build    # static site in out/deck/, works from any subpath
```

Each step plays the chapter up to the end of the next beat and holds there,
with the caption fully visible. Pressing next while a step still plays
finishes it at once. At the end of a chapter, next continues with the
following chapter.

| Key | Action |
|---|---|
| → ↓ Space Enter PageDown, click | next step |
| ← ↑ Backspace PageUp, shift-click | previous step |
| Home / End | start / end of the deck |
| F | fullscreen |
| H | hide the progress line |

The position is kept in the URL (`#encounter/3`: chapter and steps
reached), so a reload or a shared link opens the same step.
`?format=square` shows the square format.

Code: `deck/` (`Deck.tsx` drives a bare `@remotion/player`, `stops.ts`
computes where each chapter holds).

## Structure

The project is the shared base for an explainer of the trust protocol: one
set of building blocks and one chapter model, rendered as video and as an
interactive deck, and later as animated graphics for the website.

```text
src/
  kit/                 shared by every chapter, so everything looks alike
    theme.ts           colours (site tokens, simulator screens), fonts
    cast.ts            Ana and Ben: names, keys, each person's colour
    geometry.ts        phone geometry, screen-to-stage mapping
    format.ts          output formats (16:9, square) and stage metrics
    time.ts            fps, seconds -> frames
    chapter.ts         the chapter model: beats with captions
    ChapterStage.tsx   the frame around every chapter: stage, header, captions
    stage.tsx          background, header, name tag
    Phone.tsx, CredentialCard.tsx, QrCode.tsx, Icons.tsx, ui.tsx
  chapters/
    index.ts           all chapters in telling order
    encounter/         chapter "One encounter"
  Root.tsx             one composition per chapter and format (video)
deck/                  the chapters as a click-through deck in the browser
public/fonts/          Ubuntu Sans and Ubuntu Sans Mono, bundled so renders match
```

### Chapters and beats

A chapter (`src/kit/chapter.ts`) is a scene plus a list of beats. Each beat
has a start time and a caption and runs until the next beat starts. Beats
are numbered in order; a `closing` beat is unnumbered. The shared
`ChapterStage` draws the captions, so a chapter's scene only animates its
content. In the deck, the end of each beat is where playback stops.

Every chapter is rendered in every format in `src/kit/format.ts`; its
compositions are named after the chapter, e.g. `Encounter` and
`EncounterSquare`.

To add a chapter: create `src/chapters/<id>/` with its scene and an
`index.ts` exporting a `Chapter`, and add it to `src/chapters/index.ts`.

## Chapter: One encounter

Beats (captions) are in `src/chapters/encounter/index.ts`. Animation
timings are in `src/chapters/encounter/timings.ts`, in seconds on the
chapter's timeline. Each step is its own component in `steps/` and runs in
its own `<Sequence>` in `Encounter.tsx`, so a step can be retimed by
changing one entry. Phone motion (the scan arc and the return) is computed
from the same constants in `layout.ts`, which also holds the code position,
the credential dock, the contact rows and where the phones stand in each
format.

| Step | Seconds |
|---|---|
| 1 Ana shows her code | 0.3 to 2.0 |
| Ben taps "Scan code" | 1.2 |
| 2 Ben's phone travels over Ana's | 2.0 to 4.2 |
| Code recognized | 4.5 |
| 3 Confirmation on Ben, tap | 4.8 to 6.4, tap 5.8 |
| 4 Ben's phone moves away | 6.4 to 7.6 |
| 8a Credential Ben → Ana flies and waits at the bottom | 6.9 to 8.3 |
| 5 Counter-confirmation on Ana, tap | 7.8 to 11.0, tap 9.4 |
| 8b Credential Ana → Ben flies and waits at the bottom | 9.6 to 11.0 |
| 6 Contact list on both phones | from 11.0 |
| Both credentials jump into the list and become the new row | 11.3 to 11.8 |
| 7 Trust act on Ana | highlight 12.9, tap 13.9 |
| Closing line | 15.6 to 18.0 |

Names and keys are illustration, as on the site.
