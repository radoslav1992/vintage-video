// =====================================================================
// Wikipedia API client
// Uses the public MediaWiki search + REST summary endpoints (CORS enabled
// via origin=*). No key required.
// =====================================================================

const API = 'https://en.wikipedia.org/w/api.php'
const REST = 'https://en.wikipedia.org/api/rest_v1/page/summary'

/**
 * Try to find a Wikipedia article matching a title (optionally a film of a
 * given year) and return its summary.
 *
 * @param {string} title
 * @param {{ year?: string|number, type?: 'movie'|'video' }} opts
 * @returns {Promise<null | {
 *   title: string, extract: string, thumbnail?: string,
 *   url: string, description?: string
 * }>}
 */
export async function getWikipediaInfo(title, opts = {}) {
  if (!title) return null
  const clean = normalizeTitle(title)
  const { year, type = 'movie' } = opts

  // Build a few candidate search phrases, most specific first.
  const candidates = []
  if (type === 'movie') {
    if (year) candidates.push(`${clean} ${year} film`)
    candidates.push(`${clean} film`)
  }
  candidates.push(clean)

  for (const phrase of candidates) {
    const pageTitle = await searchTopTitle(phrase)
    if (!pageTitle) continue
    const summary = await fetchSummary(pageTitle)
    if (summary && summary.extract && !summary.isDisambiguation) {
      return summary
    }
  }
  return null
}

async function searchTopTitle(phrase) {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: phrase,
    srlimit: '1',
    format: 'json',
    origin: '*',
  })
  try {
    const res = await fetch(`${API}?${params.toString()}`)
    if (!res.ok) return null
    const data = await res.json()
    const hit = data?.query?.search?.[0]
    return hit ? hit.title : null
  } catch {
    return null
  }
}

async function fetchSummary(pageTitle) {
  try {
    const res = await fetch(`${REST}/${encodeURIComponent(pageTitle)}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const d = await res.json()
    return {
      title: d.title,
      extract: d.extract || '',
      thumbnail: d.thumbnail?.source,
      description: d.description,
      url:
        d.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
      isDisambiguation: d.type === 'disambiguation',
    }
  } catch {
    return null
  }
}

// Strip common Archive title noise so the Wikipedia search lands cleaner.
function normalizeTitle(title) {
  return String(title)
    .replace(/\([^)]*\)/g, '') // (1952), (Color), etc.
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\b(19|20)\d{2}\b/g, '')
    .replace(/\b(full movie|feature film|color|b&w|hd|restored)\b/gi, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
