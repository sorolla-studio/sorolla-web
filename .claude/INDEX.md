# Index: Sorolla Web

type: website
path: ~/web/sorolla-web
github: https://github.com/LaCreArthur/sorolla-web.git
keywords: [Next.js, React, TypeScript, Tailwind, website, corporate, mobile games, publishing, Netlify, forms, contact, privacy policy, landing page]

## Key Documents

- `src/app/page.tsx` - Homepage [home, hero, landing]
- `src/components/Sea.tsx` - First screen: the sea and its game [hero, game, WebGL, sound]
- `src/sea/` - Rules, world, painter, light of the sea [game, shader, brush, feel]
- `src/components/Read.tsx` - Reading of the visitor's throw + chart [chart, crowd]
- `src/components/Games.tsx`, `Playable.tsx` - Games wall and the embedded playable [games, playable]
- `src/content/` - All copy [copy, text, games, home, about, privacy]
- `scripts/look.mjs` - Plays the site at phone and desktop size, saves what a visitor sees in `shots/` [screenshots, review, verify]
- `scripts/paint.mjs` - Repaints `public/paint/` and the link preview [poster, masks, og image]
- `scripts/chrome.mjs` - Headless Chrome or Edge for both scripts [browser, DevTools]
- `src/app/about/page.tsx` - Company info + contact form [about, contact, form]
- `src/app/privacy-policy/page.tsx` - Mobile game privacy policy [privacy, policy, legal]
- `src/app/globals.css` - All styles [styles, colors, type]
- `src/app/layout.tsx` - Root layout [layout, metadata]
- `src/components/ContactForm.tsx` - Netlify form component [form, contact, Netlify]
- `public/form.html` - Static form for Netlify detection [form, Netlify]
- `netlify.toml` - Netlify deployment config [deploy, Netlify, config]
- `AGENTS.md` - How to iterate, what the site keeps (`CLAUDE.md` imports it) [conventions, workflow, Windows]

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Plain CSS (Tailwind v4 reset only), raw WebGL2
- Netlify (hosting + forms)
