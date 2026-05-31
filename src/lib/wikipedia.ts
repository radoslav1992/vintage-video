// =====================================================================
// Wikipedia API client (browser-side)
// MediaWiki search + REST summary endpoints (CORS via origin=*). No key.
// =====================================================================

export interface WikiInfo {
  title: string
  extract: string
  thumbnail?: string
  description?: string
  url: string
  isDisambiguation?: boolean
}

const API = 'https://en.wikipedia.org/w/api.php'
const REST = 'https://en.wikipedia.org/api/rest_v1/page/summary'

/**
 * Find a Wikipedia article for a title (optionally a film of a given year)
 * and return its summary, or null when nothing suitable is found.
 */
export async function getWikipediaInfo(
  title: string,
  opts: { year?: string | number; type?: 'movie' | 'video' } = {},
): Promise<WikiInfo | null> {
  if (!title) return null
  const clean = normalizeTitle(title)
  const { year, type = 'movie' } = opts

  const candidates: string[] = []
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

async function searchTopTitle(phrase: string): Promise<string | null> {
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

async function fetchSummary(pageTitle: string): Promise<WikiInfo | null> {
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

function normalizeTitle(title: string): string {
  return String(title)
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\b(19|20)\d{2}\b/g, '')
    .replace(/\b(full movie|feature film|color|b&w|hd|restored)\b/gi, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
