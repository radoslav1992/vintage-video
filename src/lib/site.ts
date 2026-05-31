// Central site configuration — edit these before deploying.
// Keep `url` in sync with `site` in astro.config.mjs.

export const SITE = {
  name: 'The Reel Vault',
  tagline: 'Vintage Cinema Archive',
  // ⚠️ Your real domain (no trailing slash). Used for canonical URLs,
  // Open Graph tags, the sitemap and structured data.
  url: 'https://thereelvault.example',
  description:
    'A curated picture house for classic public-domain movies and vintage films — hand-picked collections, full streaming, and the story behind every reel.',
  // ⚠️ A real, monitored address. Required for AdSense and for DMCA /
  // takedown notices.
  contactEmail: 'hello@thereelvault.example',
  // Set this once you have an AdSense publisher ID, e.g. 'ca-pub-1234567890'.
  // While empty, no ad code is emitted.
  adsensePublisherId: '',
  founded: 'MMXXVI',
} as const
