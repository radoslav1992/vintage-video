// Home page: featured rows fetched from the Archive, plus "Continue
// Watching" and "Recently Viewed" shelves built from localStorage.

import { search } from '../lib/archive'
import { cardHtml, renderCards, skeletons, wireFavorites, type CardItem } from '../lib/ui'
import { getContinueWatching, getHistory, type Kind } from '../lib/store'

async function fillRow(id: string, query: string, kind: Kind): Promise<void> {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = skeletons(8)
  wireFavorites(el)
  try {
    const { docs } = await search({ query, rows: 12 })
    if (docs.length === 0) {
      el.innerHTML = '<p style="color:var(--ink-faint)">No reels available right now.</p>'
      return
    }
    renderCards(el, docs, kind)
  } catch {
    el.innerHTML = '<p style="color:var(--ink-faint)">Couldn’t reach the Archive.</p>'
  }
}

function fillShelf(sectionId: string, rowId: string, items: CardItem[], kinds: Kind[]): void {
  const section = document.getElementById(sectionId)
  const row = document.getElementById(rowId)
  if (!section || !row) return
  if (items.length === 0) {
    section.style.display = 'none'
    return
  }
  section.style.display = ''
  // Render each card with its own kind (items may mix movies/videos).
  row.innerHTML = items.map((it, i) => cardHtml(it, kinds[i])).join('')
  wireFavorites(row)
}

export function initHome(): void {
  const cont = getContinueWatching()
  fillShelf(
    'continueSection',
    'continueRow',
    cont.map((p) => ({ identifier: p.identifier, title: p.title, year: p.year, creator: p.creator })),
    cont.map((p) => p.kind),
  )

  const hist = getHistory().slice(0, 12)
  fillShelf(
    'recentSection',
    'recentRow',
    hist.map((h) => ({ identifier: h.identifier, title: h.title, year: h.year, creator: h.creator })),
    hist.map((h) => h.kind),
  )

  fillRow('rowPopular', 'collection:(feature_films) AND mediatype:(movies)', 'movie')
  fillRow('rowNoir', 'collection:(film_noir) OR (mediatype:(movies) AND subject:(film noir))', 'movie')
  fillRow(
    'rowScifi',
    'collection:(SciFi_Horror) OR (mediatype:(movies) AND subject:(horror OR science fiction))',
    'movie',
  )
  fillRow('rowEphemeral', 'collection:(prelinger)', 'video')
}
