// Renders the personal-library screens (Favorites, Recently Viewed,
// Continue Watching) from localStorage, and live-updates on change.

import { cardHtml, emptyState, wireFavorites } from '../lib/ui'
import {
  getFavorites,
  getHistory,
  getContinueWatching,
  clearHistory,
  onChange,
  type Snapshot,
} from '../lib/store'

type LibType = 'favorites' | 'recent' | 'continue'

export function initLibrary(type: LibType): void {
  const grid = document.getElementById('libGrid')!
  wireFavorites(grid)

  const render = () => {
    const { items, emoji, text } = source(type)
    if (items.length === 0) {
      grid.className = ''
      grid.innerHTML = emptyState(emoji, text)
      return
    }
    grid.className = 'grid'
    grid.innerHTML = items
      .map((it) =>
        cardHtml(
          { identifier: it.identifier, title: it.title, year: it.year, creator: it.creator },
          it.kind,
        ),
      )
      .join('')
  }

  render()
  // Keep the grid in sync when items are starred/unstarred or progress changes.
  onChange(render)

  const clearBtn = document.getElementById('clearBtn')
  clearBtn?.addEventListener('click', () => {
    if (type === 'recent') clearHistory()
  })
}

function source(type: LibType): { items: Snapshot[]; emoji: string; text: string } {
  if (type === 'favorites') {
    return {
      items: getFavorites(),
      emoji: '★',
      text: 'Tap the star on any reel to keep it here for the next double feature.',
    }
  }
  if (type === 'continue') {
    return {
      items: getContinueWatching(),
      emoji: '⏯️',
      text: 'Films you start but don’t finish will wait for you here.',
    }
  }
  return {
    items: getHistory(),
    emoji: '🕰️',
    text: 'Films you open will be remembered here so you can find your way back.',
  }
}
