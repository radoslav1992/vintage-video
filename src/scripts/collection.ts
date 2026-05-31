// Populates a collection page's film gallery from its Archive query.

import { search } from '../lib/archive'
import { renderCards, skeletons, emptyState, wireFavorites } from '../lib/ui'
import type { Kind } from '../lib/store'

export function initCollection(): void {
  const el = document.getElementById('collectionFilms')
  if (!el) return
  const query = el.dataset.query
  const kind = (el.dataset.kind as Kind) || 'movie'
  if (!query) return

  el.innerHTML = `<div class="grid">${skeletons()}</div>`
  wireFavorites(el)

  search({ query, rows: 24 })
    .then(({ docs }) => {
      if (docs.length === 0) {
        el.innerHTML = emptyState('🎞️', 'No reels available in this collection right now.')
        return
      }
      const grid = document.createElement('div')
      grid.className = 'grid'
      el.replaceChildren(grid)
      renderCards(grid, docs, kind)
    })
    .catch(() => {
      el.innerHTML = emptyState('📽️', 'Couldn’t reach the Internet Archive. Please try again.')
    })
}
