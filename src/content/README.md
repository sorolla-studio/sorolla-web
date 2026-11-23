# Site content

Editable site copy, links, metadata, and form labels live here.

- `site.ts` - company info, nav, footer, default metadata.
- `home.ts` - home page sections and the contact form (used on /about too).
- `games.ts` - games shown on the home page. Art: `public/games/<slug>.webp`.
- `about.ts` - about page copy.
- `privacyPolicy.ts` - privacy policy metadata, date, sections, lists, and links.

After editing content, run `npm run lint` and `npm run build`.

Pictures in `public/paint` and `src/app/opengraph-image.jpg` are saved from the live sea by `scripts/paint.mjs`; run it after changing anything in `src/sea`.
