# CLAUDE.md

**Navigation:** See `.claude/INDEX.md` for keywords and file routing.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recreation of sorolla.io using Next.js + Tailwind + Netlify. Original site was on Squarespace.

**Business:** Mobile game publishing company specializing in hybrid casual titles.
**Tagline:** "Just Play"
**Contact:** contact@sorolla.io
**Repo:** https://github.com/LaCreArthur/sorolla-web

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4 (CSS-based config via `@theme inline` in `globals.css`)
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
- `/` - Full-screen hero with "Sorolla | Just Play"
- `/about` - Company info + contact form
- `/privacy-policy` - Mobile game privacy policy

**Custom Colors** (defined in `src/app/globals.css`):
- `--coral: #e86a4a` - Contact section background
- `--brand: #00b4d8` - Logo cyan, links

Use as Tailwind classes: `bg-coral`, `text-brand`, etc.

## Netlify Forms

Contact form uses Netlify Forms with:
- Form name: `contact`
- Fields: email, message
- Honeypot spam protection (`bot-field`)
- Static form in `public/form.html` for Netlify build detection

The `ContactForm` component is a client component (`"use client"`) that handles form submission state.

## Deployment

Auto-deploys on push to main via `netlify.toml`. Uses `@netlify/plugin-nextjs`.

## Workflow

Solo dev, simple site. Prioritize velocity:
- Commit directly to main (skip PRs)
- Keep it simple, no over-engineering
