// @ts-check
import { defineConfig } from 'astro/config'

import cloudflare from "@astrojs/cloudflare";

// A fully static, client-rendered site. No SSR adapter: every page is a
// static HTML shell, and all dynamic data (Archive search, metadata,
// Wikipedia, favorites, history, watch progress) is handled in the browser.
export default defineConfig({
  // ⚠️ Change this to your real domain before deploying / applying to
  // AdSense. It drives canonical URLs, Open Graph tags and the sitemap.
  // Keep it in sync with SITE.url in src/lib/site.ts.
  site: 'https://thereelvault.example',

  output: "hybrid",

  server: {
    host: true,
    port: 4321,
  },

  adapter: cloudflare()
})