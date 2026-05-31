# 🎞️ The Reel Vault

A vintage picture house for browsing and streaming classic, public-domain
**movies** and **old videos** straight from the [Internet Archive](https://archive.org),
with each title's story enriched from **Wikipedia** (falling back to the
Archive's own description when no article exists).

The interface marries a vintage-cinema look — sepia tones, film grain,
typewriter type and marquee serifs — with the warm, paper-cream calm of
claude.ai.

## Features

- **Separate Movies & Videos screens** — features in one wing, newsreels,
  commercials, educational shorts and ephemera in the other.
- **Genres & categories** — Film Noir, Sci-Fi & Horror, Westerns, Silent Era,
  Animation… plus Newsreels, Documentaries, Travelogues and more, each backed
  by a curated Internet Archive query.
- **Per-title pages** with an embedded player, full metadata, and an *About*
  section sourced from Wikipedia (or the Internet Archive as fallback).
- **Favorites** — star any reel; kept in `localStorage`.
- **Recently Viewed** — your projection log, remembered across visits.
- **Search** across the whole moving-image vault.
- **Sorting & pagination** on every browse screen.

## Tech

- React 18 + Vite
- React Router 6
- Internet Archive [advanced search](https://archive.org/advancedsearch.php)
  & [metadata](https://archive.org/developers/md-read.html) APIs
- Wikipedia MediaWiki search + REST summary APIs
- No API keys, no backend — favorites/history live in the browser.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Project layout

```
src/
  api/         archive.js, wikipedia.js      — external API clients
  components/  Navbar, Layout, VideoCard, VideoGrid, Row, Spinner
  context/     LibraryContext.jsx            — favorites + recently viewed
  data/        catalog.js                    — genre/category → query map
  hooks/       useArchiveSearch.js
  pages/       Home, Movies, Videos, BrowsePage, Detail,
               Favorites, Recent, Search, NotFound
```

All media and metadata are courtesy of the Internet Archive and Wikipedia.
