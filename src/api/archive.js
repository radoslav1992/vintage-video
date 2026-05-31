// =====================================================================
// Internet Archive API client
// Docs: https://archive.org/developers/
// All endpoints are public, key-less, and CORS-enabled.
// =====================================================================

const SEARCH_URL = 'https://archive.org/advancedsearch.php'
const META_URL = 'https://archive.org/metadata'

// Fields we ask the search index to return.
const FIELDS = [
  'identifier',
  'title',
  'description',
  'year',
  'date',
  'creator',
  'downloads',
  'mediatype',
  'subject',
  'collection',
  'runtime',
]

/** Thumbnail image served by the Archive for any item. */
export function thumbUrl(identifier) {
  return `https://archive.org/services/img/${identifier}`
}

/** Embeddable player URL — handles video formats + subtitles for us. */
export function embedUrl(identifier) {
  return `https://archive.org/embed/${identifier}`
}

/** Public details page on archive.org. */
export function detailsUrl(identifier) {
  return `https://archive.org/details/${identifier}`
}

/**
 * Run an advanced search.
 * @returns {{ docs: Array, total: number }}
 */
export async function search({
  query,
  rows = 24,
  page = 1,
  sort = 'downloads desc',
} = {}) {
  const params = new URLSearchParams()
  params.set('q', query)
  FIELDS.forEach((f) => params.append('fl[]', f))
  if (sort) params.append('sort[]', sort)
  params.set('rows', String(rows))
  params.set('page', String(page))
  params.set('output', 'json')

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`Archive search failed (${res.status})`)
  const data = await res.json()
  const response = data.response || {}
  return {
    docs: (response.docs || []).map(normalizeDoc),
    total: response.numFound || 0,
  }
}

/** Fetch the full metadata record for a single item. */
export async function getMetadata(identifier) {
  const res = await fetch(`${META_URL}/${identifier}`)
  if (!res.ok) throw new Error(`Archive metadata failed (${res.status})`)
  const data = await res.json()
  const meta = data.metadata || {}

  // Find a sensible playable video file (mp4 preferred).
  const files = Array.isArray(data.files) ? data.files : []
  const videoFile =
    files.find((f) => /\.mp4$/i.test(f.name) && f.source !== 'original') ||
    files.find((f) => /\.mp4$/i.test(f.name)) ||
    files.find((f) => /\.(ogv|webm)$/i.test(f.name))

  return {
    identifier,
    title: pickOne(meta.title) || identifier,
    description: cleanDescription(pickOne(meta.description)),
    creator: pickOne(meta.creator),
    year: meta.year || extractYear(meta.date),
    date: pickOne(meta.date),
    runtime: pickOne(meta.runtime),
    director: pickOne(meta.director),
    language: pickOne(meta.language),
    subject: toArray(meta.subject),
    collection: toArray(meta.collection),
    licenseUrl: pickOne(meta.licenseurl),
    videoFile: videoFile
      ? `https://archive.org/download/${identifier}/${encodeURIComponent(videoFile.name)}`
      : null,
    raw: meta,
  }
}

// ---- helpers ----------------------------------------------------------

function normalizeDoc(doc) {
  return {
    identifier: doc.identifier,
    title: pickOne(doc.title) || doc.identifier,
    description: cleanDescription(pickOne(doc.description)),
    year: doc.year || extractYear(doc.date),
    creator: pickOne(doc.creator),
    downloads: doc.downloads || 0,
    mediatype: doc.mediatype,
    subject: toArray(doc.subject),
    collection: toArray(doc.collection),
  }
}

function pickOne(v) {
  if (Array.isArray(v)) return v[0]
  return v
}

function toArray(v) {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function extractYear(date) {
  if (!date) return undefined
  const m = String(date).match(/\d{4}/)
  return m ? m[0] : undefined
}

// Archive descriptions sometimes contain raw HTML — strip tags for safe
// rendering as plain text.
function cleanDescription(desc) {
  if (!desc) return ''
  return String(desc)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
