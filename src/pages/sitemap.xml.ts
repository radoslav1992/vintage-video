import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { SITE } from '../lib/site'

// Static sitemap of the indexable, content-bearing routes (the app/utility
// routes — search, watch, favorites… — are intentionally excluded).
export const GET: APIRoute = async () => {
  const collections = await getCollection('collections')
  const routes = [
    '/',
    '/movies',
    '/videos',
    '/collections',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
    ...collections.map((c) => `/collections/${c.slug}`),
  ]

  const urls = routes
    .map(
      (path) =>
        `  <url><loc>${new URL(path, SITE.url).href}</loc></url>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
