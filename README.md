# 🎞️ The Reel Vault

A vintage picture house for browsing and streaming classic, public-domain
**movies** and **old videos** straight from the [Internet Archive](https://archive.org),
with each title's story enriched from **Wikipedia** (falling back to the
Archive's own description when no article exists).

Built with **[Astro](https://astro.build)** as a **fully client-side static
site** — there is no server. Every page is a static HTML shell; all dynamic
data (search, metadata, Wikipedia) is fetched in the browser, and your
**favorites, viewing history and watch progress** live in `localStorage`.

The interface marries a vintage-cinema look — sepia tones, film grain,
typewriter type and marquee serifs — with the warm, paper-cream calm of
claude.ai.

## Features

- **Separate Movies & Videos screens** — features in one wing; newsreels,
  commercials, educational shorts, ephemera and more in the other.
- **Genres & categories** — Film Noir, Sci-Fi & Horror, Westerns, Silent Era,
  Animation… plus Newsreels, Documentaries, Travelogues, and more, each backed
  by a curated Internet Archive query.
- **Per-title pages** with a native `<video>` player, full metadata, and an
  *About* section sourced from Wikipedia (or the Internet Archive as fallback).
- **Favorites** ★ — star any reel; saved in `localStorage`.
- **Recently Viewed** — your projection log, remembered across visits.
- **Continue Watching** — playback position is saved as you watch, the card
  shows a progress bar, and the watch page offers to resume where you left off.
- **Search** across the whole moving-image vault, with sorting & pagination.
- **Curated Collections** — original, editorially-written essays (`src/content/collections/*.md`)
  that frame a themed set of films. This original writing is what lifts the site
  above a bare aggregator (and is key to ad-network approval).
- **SEO & trust pages** — per-page canonical + Open Graph + Twitter tags and
  JSON-LD, a generated `sitemap.xml`, `robots.txt`, and About / Privacy / Terms /
  Contact pages. Utility routes (watch, search, favorites…) are `noindex`.

## Before deploying / applying to AdSense

1. Set your real domain in **`astro.config.mjs`** (`site`) and **`src/lib/site.ts`**
   (`SITE.url`), plus a monitored `SITE.contactEmail`, and update the `Sitemap:`
   line in `public/robots.txt`.
2. Verify the copyright status of anything you feature — see the rights note in
   `src/pages/about.astro` / `terms.astro`. The `query`-based collections pull live
   from the Archive, so curate accordingly.
3. Add more original collections under `src/content/collections/` — depth of
   original content is the single biggest factor in AdSense approval.
4. Set `SITE.adsensePublisherId` once approved (ad slots are not emitted while
   it's empty).

## How watch progress works

The detail page streams the Archive's MP4 directly through a native HTML
`<video>` element (rather than the Archive's `<iframe>` embed). That lets the
app listen to `timeupdate` and persist `{ seconds, duration }` per title to
`localStorage`. On return, it seeks back to your position and shows a "Resuming
…" bar; once a film is ~94% watched it's considered finished and cleared from
Continue Watching. Titles without a direct MP4 fall back to the embed player
(without progress tracking).

## Tech

- [Astro](https://astro.build) 4 — static output, zero SSR
- TypeScript islands (no UI framework runtime)
- Internet Archive [advanced search](https://archive.org/advancedsearch.php)
  & [metadata](https://archive.org/developers/md-read.html) APIs
- Wikipedia MediaWiki search + REST summary APIs
- No API keys, no backend, no tracking.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
```

Build / preview the static site:

```bash
npm run build     # outputs to dist/
npm run preview
```

The `dist/` folder is plain static files — deploy it to any static host
(GitHub Pages, Netlify, Cloudflare Pages, S3…).

## Project layout

```
src/
  lib/        archive.ts, wikipedia.ts   — external API clients
              catalog.ts                 — genre/category → query map
              store.ts                   — favorites, history, watch progress
              ui.ts                      — card rendering helpers
              site.ts                    — domain / contact / AdSense config
  content/    collections/*.md           — original editorial collections
  scripts/    home, browse, watch, library, search, collection
  components/ Navbar.astro, Footer.astro
  layouts/    BaseLayout.astro           — SEO meta, OG, JSON-LD
  pages/      index, movies, videos, watch, favorites, recent,
              continue, search, 404,
              collections/[index,slug], about, privacy, terms, contact,
              sitemap.xml.ts
```

All media and metadata are courtesy of the Internet Archive and Wikipedia.
