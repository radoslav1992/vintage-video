// =====================================================================
// Internet Archive API client (browser-side)
// Docs: https://archive.org/developers/ — public, key-less, CORS-enabled.
// =====================================================================

export interface ArchiveDoc {
  identifier: string
  title: string
  description: string
  year?: string
  creator?: string
  downloads: number
  mediatype?: string
  subject: string[]
  collection: string[]
}

export interface ArchiveMeta {
  identifier: string
  title: string
  description: string
  creator?: string
  year?: string
  date?: string
  runtime?: string
  director?: string
  language?: string
  subject: string[]
  collection: string[]
  licenseUrl?: string
  /** Best direct-streaming video file (mp4 preferred) for native playback. */
  videoFile: string | null
}

const SEARCH_URL = 'https://archive.org/advancedsearch.php'
const META_URL = 'https://archive.org/metadata'

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

export function thumbUrl(identifier: string): string {
  return `https://archive.org/services/img/${identifier}`
}

export function embedUrl(identifier: string): string {
  return `https://archive.org/embed/${identifier}`
}

export function detailsUrl(identifier: string): string {
  return `https://archive.org/details/${identifier}`
}

export async function search(opts: {
  query: string
  rows?: number
  page?: number
  sort?: string
}): Promise<{ docs: ArchiveDoc[]; total: number }> {
  const { query, rows = 24, page = 1, sort = 'downloads desc' } = opts
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

export async function getMetadata(identifier: string): Promise<ArchiveMeta> {
  const res = await fetch(`${META_URL}/${identifier}`)
  if (!res.ok) throw new Error(`Archive metadata failed (${res.status})`)
  const data = await res.json()
  const meta = data.metadata || {}

  const files: any[] = Array.isArray(data.files) ? data.files : []
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
  }
}

// ---- helpers ----------------------------------------------------------

function normalizeDoc(doc: any): ArchiveDoc {
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

function pickOne(v: any): any {
  return Array.isArray(v) ? v[0] : v
}

function toArray(v: any): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function extractYear(date: any): string | undefined {
  if (!date) return undefined
  const m = String(date).match(/\d{4}/)
  return m ? m[0] : undefined
}

// Archive descriptions sometimes contain HTML — strip to plain text.
function cleanDescription(desc: any): string {
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
