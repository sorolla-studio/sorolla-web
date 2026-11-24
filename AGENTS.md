# sorolla.io

Sorolla publishes mobile games; this repo is its site (Next.js 16 on Netlify, public on GitHub). The first screen is a painted sea with a one-tap stone-skipping game; everything below it is painted with the same brush.
## Branches

- `dev` is where work happens: commit and push it freely. Netlify builds each push as a branch preview, hidden from search engines (`src/app/layout.tsx` reads Netlify's `CONTEXT`).
- `main` is production at sorolla.io. Arthur merges `dev` into `main`.

## Iterating

The judge is a visitor: someone who runs a game studio opens sorolla.io on a phone. A change is done when the site plays and looks better than before, next to the sites that visitor also opens (homagames.com, supercell.com, voodoo.io). Code that compiles proves nothing here; pictures do.

1. Once: `npm install` (Node 22 or newer). Keep `npm run dev` running (http://localhost:3000), and run `npm run look` once so the first change has a `before`.
2. Make one change.
3. In a second terminal: `npm run look`. It plays the sea in a headless browser at phone and desktop size, saves what a visitor sees in `shots/now/` (the previous run moves to `shots/before/`), and prints the console's errors.
4. Open every picture the change touches at full size, beside its `before` twin. The step is done when nothing overlaps or is cut off at any size, the console is clean, and the change is clearly better than `before`; otherwise fix it or revert it.
5. Changed how the sea looks? `npm run paint` repaints the still pictures (`public/paint/`, the link preview) from the live painter; commit them with the change.
6. `npm run lint` and `npm run build` pass. Commit on `dev` with a message that says what changed and why, then `git push origin dev`.

## Where things live

- `src/sea/`: `rules.ts` is the game with no drawing; the 500 simulated players in `crowd.ts` play the same rules, so a rules change also moves the chart. `world.ts` runs it, and its `FEEL` object holds every feel value (timings, camera, the ring, the title's room). `painter.ts` and `shaders.ts` draw brush strokes, `light.ts` turns metres into the time of day, `lettering.ts` holds the brush skeletons of "Just Play". Raw WebGL2, no 3D library.
- `src/content/`: every word on the site, the game's labels included. Components only lay words out.
- `src/app/globals.css`: all styles, plain CSS; colours and type are the variables at the top.
- Games: `src/content/games.ts`, art in `public/games/<slug>.webp`.
- `/privacy-policy` is also served at `/sorolla-privacy-policy`, and ad networks read `public/app-ads.txt`: live games link to these paths, so they stay.
- `/paint` (dev only) is the page `npm run paint` photographs.

## What the site keeps

- One bold thing: the sea. Around it the page stays quiet: one typeface (Gabarito), dark ink on a pale ground, coral only for the one action that matters on screen, sections as plain text on the ground.
- Words say what happens. Buttons name their action in sentence case; headings are one weight and one colour; numbering appears only where the content is a real sequence. Sentences are short and plain, with commas and full stops where a dash would go.
- Facts on the page are public: store listings and what the site already says. Every number shown is real or labelled as simulated.
- Nothing about a visit leaves the page, and the page says so. Keep it true: no analytics, trackers or outside requests at runtime (`next/font` self-hosts the font at build).
- Joaquín Sorolla's beach paintings guide palette and brush only: the site shows none of them and does not say the company is named after him.

## Contact form

Netlify Forms finds the form through its static copy in `public/form.html`, so a field added to `src/components/Contact.tsx` is added there too. A local server answers the form's POST with 405; only a Netlify deploy accepts it.

## On Windows

- `npm run look` and `npm run paint` find Chrome or Edge in their usual install folders. Anywhere else, point `CHROME` at the executable (PowerShell: `$env:CHROME = "C:\path\to\chrome.exe"`). `BASE` points them at an address other than http://localhost:3000.
- Text files check out with LF line endings (`.gitattributes`).
