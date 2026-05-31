// @ts-check
import { defineConfig } from 'astro/config'

// A fully static, client-rendered site. No SSR adapter: every page is a
// static HTML shell, and all dynamic data (Archive search, metadata,
// Wikipedia, favorites, history, watch progress) is handled in the browser.
export default defineConfig({
  output: 'static',
  server: {
    host: true,
    port: 4321,
  },
})
