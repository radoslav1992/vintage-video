// =====================================================================
// Shared client-side rendering helpers: poster cards, grids and rows.
// Cards reflect favorite state and watch progress, and are wired with a
// single delegated click handler per container.
// =====================================================================

import { thumbUrl, type ArchiveDoc } from './archive'
import {
  isFavorite,
  toggleFavorite,
  progressFraction,
  type Kind,
  type Snapshot,
} from './store'

export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatTime(total: number): string {
  if (!isFinite(total) || total < 0) total = 0
  const s = Math.floor(total % 60)
  const m = Math.floor((total / 60) % 60)
  const h = Math.floor(total / 3600)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export interface CardItem {
  identifier: string
  title: string
  year?: string | null
  creator?: string | null
}

export function watchHref(id: string, kind: Kind): string {
  return `/watch?v=${encodeURIComponent(id)}&kind=${kind}`
}

/** Build the HTML for a single poster card. */
export function cardHtml(item: CardItem, kind: Kind, badge?: string): string {
  const fav = isFavorite(item.identifier)
  const frac = progressFraction(item.identifier)
  const meta = [item.year, item.creator].filter(Boolean).join(' · ') || 'Archive film'
  const dataAttrs =
    `data-id="${escapeHtml(item.identifier)}" ` +
    `data-title="${escapeHtml(item.title)}" ` +
    `data-year="${escapeHtml(item.year ?? '')}" ` +
    `data-creator="${escapeHtml(item.creator ?? '')}" ` +
    `data-kind="${kind}"`

  return `
    <a class="card" href="${watchHref(item.identifier, kind)}">
      <div class="card-poster">
        ${badge ? `<span class="card-badge">${escapeHtml(badge)}</span>` : ''}
        <button class="card-fav${fav ? ' on' : ''}" type="button"
          aria-label="Toggle favorite" ${dataAttrs}>${fav ? '★' : '☆'}</button>
        <img src="${thumbUrl(item.identifier)}" alt="${escapeHtml(item.title)}"
          loading="lazy" onerror="this.style.display='none'" />
        ${
          frac > 0
            ? `<div class="card-progress"><span style="width:${Math.round(frac * 100)}%"></span></div>`
            : ''
        }
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(item.title)}</div>
        <div class="card-meta">${escapeHtml(meta)}</div>
      </div>
    </a>`
}

/** Render an array of items into a container as a grid (or row markup). */
export function renderCards(
  container: HTMLElement,
  items: CardItem[],
  kind: Kind,
): void {
  container.innerHTML = items.map((it) => cardHtml(it, kind)).join('')
}

export function skeletons(count = 12): string {
  return Array.from({ length: count })
    .map(() => '<div class="skeleton sk-card"></div>')
    .join('')
}

export function emptyState(emoji: string, text: string): string {
  return `<div class="center-state"><div class="big">${emoji}</div><p>${escapeHtml(text)}</p></div>`
}

/**
 * Wire favorite buttons within a container using event delegation.
 * Safe to call once per container.
 */
export function wireFavorites(container: HTMLElement): void {
  if ((container as any).__favWired) return
  ;(container as any).__favWired = true
  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.card-fav') as HTMLElement | null
    if (!btn) return
    e.preventDefault()
    e.stopPropagation()
    const snapshot: Snapshot = {
      identifier: btn.dataset.id!,
      title: btn.dataset.title || btn.dataset.id!,
      year: btn.dataset.year || null,
      creator: btn.dataset.creator || null,
      kind: (btn.dataset.kind as Kind) || 'movie',
    }
    const now = toggleFavorite(snapshot)
    btn.classList.toggle('on', now)
    btn.textContent = now ? '★' : '☆'
  })
}
