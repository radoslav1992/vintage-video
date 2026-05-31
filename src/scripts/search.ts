// Client-side search across the moving-image vault.

import { search } from '../lib/archive'
import { renderCards, skeletons, emptyState, wireFavorites } from '../lib/ui'

const ROWS = 36

export function initSearch(): void {
  const params = new URLSearchParams(location.search)
  const term = (params.get('q') || '').trim()
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))

  const titleEl = document.getElementById('searchTitle')!
  const countEl = document.getElementById('searchCount')!
  const results = document.getElementById('searchResults')!
  const pager = document.getElementById('searchPager')!

  if (!term) {
    titleEl.textContent = 'Search'
    results.innerHTML = emptyState('⌕', 'Type a title, year, person or subject in the search box above.')
    return
  }

  titleEl.textContent = `Results for “${term}”`
  results.innerHTML = `<div class="grid">${skeletons()}</div>`
  wireFavorites(results)

  const query = `(${escapeLucene(term)}) AND mediatype:(movies)`

  search({ query, page, rows: ROWS })
    .then(({ docs, total }) => {
      countEl.textContent = `${total.toLocaleString()} matching reels`
      if (docs.length === 0) {
        results.innerHTML = emptyState('🎞️', 'No reels match that search.')
        return
      }
      const grid = document.createElement('div')
      grid.className = 'grid'
      results.replaceChildren(grid)
      renderCards(grid, docs, 'movie')

      const totalPages = Math.min(Math.ceil(total / ROWS) || 1, 100)
      if (totalPages > 1) {
        const prev =
          page > 1
            ? `<a class="btn ghost" href="?q=${encodeURIComponent(term)}&page=${page - 1}">← Prev</a>`
            : `<span class="btn ghost" style="opacity:.4">← Prev</span>`
        const next =
          page < totalPages
            ? `<a class="btn ghost" href="?q=${encodeURIComponent(term)}&page=${page + 1}">Next →</a>`
            : `<span class="btn ghost" style="opacity:.4">Next →</span>`
        pager.innerHTML = `${prev}<span>Page ${page} of ${totalPages}</span>${next}`
      }
    })
    .catch(() => {
      results.innerHTML = emptyState('📽️', 'The search reel snapped. Please try again.')
    })
}

// Strip Lucene special characters so user input can't break the query.
function escapeLucene(s: string): string {
  return s
    .replace(/([+\-!(){}\[\]^"~*?:\\/]|&&|\|\|)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
