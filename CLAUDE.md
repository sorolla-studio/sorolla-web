# CLAUDE.md

**Navigation:** See `.claude/INDEX.md` for keywords and file routing.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sorolla.io on Next.js + Netlify. The first screen is a painted sea and a one-tap stone-skipping game; everything below it is painted in the same brush.

**Business:** Mobile game publishing company specializing in hybrid casual titles.
**Tagline:** "Just Play"
**Contact:** contact@sorolla.io
**Repo:** https://github.com/LaCreArthur/sorolla-web

## Stack

- Next.js 16 (App Router)
- Plain CSS in `globals.css` (Tailwind v4 is loaded for its reset and `sr-only` only)
- Raw WebGL2 for the sea (`src/sea/`), no 3D library
- Netlify (hosting + forms)
- TypeScript
- React 19

## Commands

```bash
npm run dev      # Development server at localhost:3000
npm run build    # Production build
npm run start    # Run production build locally
npm run lint     # ESLint
```

## Architecture

**Pages (App Router):**
- `/` - the sea and its game, the reading of your throw, games, how we work, contact
- `/about` - who we are + contact form
- `/privacy-policy` - mobile game privacy policy (also at `/sorolla-privacy-policy`, which live games link to)
- `/paint` - dev only: what `scripts/paint.mjs` photographs

**The sea (`src/sea/`):** `rules.ts` is the game with no drawing, so the visitor and the 500 simulated players in `crowd.ts` play the same one. `world.ts` runs it (`FEEL` holds every feel value); `painter.ts` and `shaders.ts` draw brush strokes; `light.ts` is the day from noon to night.

**Painted pictures (`public/paint/`)** come from the live sea. After changing how it looks, with the dev server on 4961: `CHROME=<headless chrome> node scripts/paint.mjs`.

**Copy** lives in `src/content/`, never in components. Nothing about a visit is sent anywhere, and the page says so: keep it true.

## Netlify Forms

Contact form uses Netlify Forms with:
- Form name: `contact`
- Fields: reason, name, email, company, message
- Honeypot spam protection (`bot-field`)
- Static form in `public/form.html` for Netlify build detection

The `ContactForm` component is a client component (`"use client"`) that handles form submission state.

## Deployment

Auto-deploys on push to main via `netlify.toml`. Uses `@netlify/plugin-nextjs`.

## Workflow

Solo dev, simple site. Prioritize velocity:
- Commit directly to main (skip PRs)
- Keep it simple, no over-engineering
