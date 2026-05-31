// Drives the Movies / Videos browse screens entirely on the client:
// reads the active group / sort / page from the URL, fetches from the
// Internet Archive, and renders cards + pagination.

import { MOVIE_GENRES, VIDEO_CATEGORIES, findGroup, type Group } from '../lib/catalog'
import { search } from '../lib/archive'
import { renderCards, skeletons, emptyState, wireFavorites } from '../lib/ui'
import type { Kind } from '../lib/store'

const ROWS = 24
const SORTS = [
  { id: 'downloads desc', label: 'Most Popular' },
  { id: 'addeddate desc', label: 'Recently Added' },
  { id: 'date asc', label: 'Oldest First' },
  { id: 'titleSorter asc', label: 'A → Z' },
]

export function initBrowse(kind: Kind, paramKey: 'genre' | 'category'): void {
  const groups = kind === 'movie' ? MOVIE_GENRES : VIDEO_CATEGORIES
  const params = new URLSearchParams(location.search)
  const active = findGroup(groups, params.get(paramKey))
  const sort = params.get('sort') || SORTS[0].id
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))

  const chipRow = document.getElementById('chips')!
  const sortSel = document.getElementById('sortSelect') as HTMLSelectElement
  const countEl = document.getElementById('count')!
  const results = document.getElementById('results')!
  const pager = document.getElementById('pager')!

  // Build chips as links that reset to page 1.
  chipRow.innerHTML = groups
    .map((g: Group) => {
      const on = g.id === active.id ? ' active' : ''
      const qs = new URLSearchParams({ [paramKey]: g.id })
      if (sort !== SORTS[0].id) qs.set('sort', sort)
      return `<a class="chip${on}" href="?${qs.toString()}">${g.emoji} ${g.label}</a>`
    })
    .join('')

  // Sort dropdown.
  sortSel.innerHTML = SORTS.map(
    (s) => `<option value="${s.id}"${s.id === sort ? ' selected' : ''}>${s.label}</option>`,
  ).join('')
  sortSel.addEventListener('change', () => {
    const qs = new URLSearchParams({ [paramKey]: active.id, sort: sortSel.value })
    location.search = qs.toString()
  })

  countEl.textContent = 'Searching the vault…'
  results.innerHTML = `<div class="grid">${skeletons()}</div>`
  wireFavorites(results)

  search({ query: active.query, page, rows: ROWS, sort })
    .then(({ docs, total }) => {
      countEl.textContent = `${total.toLocaleString()} reels · ${active.blurb}`
      if (docs.length === 0) {
        results.innerHTML = emptyState('🎞️', 'No reels found in this part of the vault.')
        pager.innerHTML = ''
        return
      }
      const grid = document.createElement('div')
      grid.className = 'grid'
      results.replaceChildren(grid)
      renderCards(grid, docs, kind)

      const totalPages = Math.min(Math.ceil(total / ROWS) || 1, 200)
      pager.innerHTML = buildPager(paramKey, active.id, sort, page, totalPages)
    })
    .catch(() => {
      countEl.textContent = ''
      results.innerHTML = emptyState(
        '📽️',
        'The projector jammed — couldn’t reach the Internet Archive. Please try again.',
      )
    })
}

function buildPager(
  paramKey: string,
  groupId: string,
  sort: string,
  page: number,
  totalPages: number,
): string {
  if (totalPages <= 1) return ''
  const link = (p: number, label: string, cls: string, disabled = false) => {
    const qs = new URLSearchParams({ [paramKey]: groupId, sort, page: String(p) })
    return disabled
      ? `<span class="${cls}" style="opacity:.4">${label}</span>`
      : `<a class="${cls}" href="?${qs.toString()}">${label}</a>`
  }
  const start = Math.max(1, page - 1)
  const end = Math.min(totalPages, start + 2)
  let nums = ''
  for (let p = start; p <= end; p++) {
    nums += link(p, String(p), `chip${p === page ? ' active' : ''}`)
  }
  return (
    link(page - 1, '← Prev', 'btn ghost', page <= 1) +
    nums +
    `<span>of ${totalPages}</span>` +
    link(page + 1, 'Next →', 'btn ghost', page >= totalPages)
  )
}
