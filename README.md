# Encounter animation

A Remotion experiment that animates the in-person encounter of the Real Life
Trust Protocol: Ana shows a code, Ben scans it phone over phone, both confirm,
each signs an ed25519 encounter credential for the other, a new contact
appears on both phones, and Ana marks Ben as trusted in a separate step.

The look follows the ceremony simulator (`trust-protocol/simulator/`: dark
phone shell, light screen, the viewfinder cut through the scanning phone) and
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

## Timings

All timings live in `src/timings.ts`, in seconds on the absolute timeline.
Each step is its own component in `src/steps/` and runs in its own
`<Sequence>` in `src/Encounter.tsx`, so a step can be retimed by changing one
entry. Phone motion (the scan arc and the return) is computed from the same
constants in `src/layout.ts`.

| Step | Seconds |
|---|---|
| 1 Ana shows her code | 0.3 to 2.0 |
| Ben taps "Scan code" | 1.2 |
| 2 Ben's phone travels over Ana's | 2.0 to 4.2 |
| Code recognized | 4.5 |
| 3 Confirmation on Ben, tap | 4.8 to 6.4, tap 5.8 |
| 4 Ben's phone moves away | 6.4 to 7.6 |
| 8a Credential Ben → Ana flies and docks | 6.9 to 8.3 |
| 5 Counter-confirmation on Ana, tap | 7.8 to 11.0, tap 9.4 |
| 8b Credential Ana → Ben flies and docks | 9.6 to 11.0 |
| 6 New contact on both phones | 11.0, row slides in at 11.5 |
| 7 Trust act on Ana | highlight 12.9, tap 13.9 |
| Closing line | 15.6 to 18.0 |

## Layout

- `src/layout.ts`: phone geometry, stage positions for both formats, the scan pose
- `src/theme.ts`: colours (from the site tokens and the simulator), names, keys
- `src/components/`: phone, QR code (real, scannable), credential card, icons
- `public/fonts/`: Ubuntu Sans and Ubuntu Sans Mono, bundled so renders match

Names and keys are illustration, as on the site.
