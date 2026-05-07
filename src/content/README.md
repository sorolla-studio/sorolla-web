# Site content

Editable site copy, links, metadata, image paths, and form labels live here.

- `site.ts` - global company info, nav, footer, default metadata, logo.
- `home.ts` - homepage sections, process steps, team cards, contact form labels/options.
- `about.ts` - about page copy and about-page contact form labels.
- `privacyPolicy.ts` - privacy policy metadata, date, sections, lists, and links.

After editing content, run:

```bash
npm run lint
npm run build
```

Keep image files in `public/images` and reference them with paths like `/images/example.png`.
