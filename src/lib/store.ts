// =====================================================================
// Client-side persistence: favorites, viewing history, and watch progress.
// Everything lives in localStorage; no backend, no accounts.
// =====================================================================

export type Kind = 'movie' | 'video'

export interface Snapshot {
  identifier: string
  title: string
  year?: string | null
  creator?: string | null
  kind: Kind
}

export interface FavoriteEntry extends Snapshot {
  savedAt: number
}
export interface HistoryEntry extends Snapshot {
  viewedAt: number
}
export interface ProgressEntry extends Snapshot {
  seconds: number
  duration: number
  updatedAt: number
}

const FAV_KEY = 'reelvault.favorites'
const HIST_KEY = 'reelvault.history'
const PROG_KEY = 'reelvault.progress'
const HIST_LIMIT = 60

// Items at/above this fraction are treated as "finished" and dropped from
// the Continue Watching shelf.
export const FINISHED_THRESHOLD = 0.94

function read<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable / full — ignore */
  }
}

// Notify same-tab listeners (the native `storage` event only fires across
// tabs). Pages subscribe to keep stars and shelves in sync.
function emit(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('reelvault:change'))
  }
}

export function onChange(handler: () => void): () => void {
  const wrapped = () => handler()
  window.addEventListener('reelvault:change', wrapped)
  window.addEventListener('storage', wrapped)
  return () => {
    window.removeEventListener('reelvault:change', wrapped)
    window.removeEventListener('storage', wrapped)
  }
}

function snap(item: Partial<Snapshot> & { identifier: string; title?: string }): Snapshot {
  return {
    identifier: item.identifier,
    title: item.title || item.identifier,
    year: item.year ?? null,
    creator: item.creator ?? null,
    kind: (item.kind as Kind) || 'movie',
  }
}

// ---- Favorites --------------------------------------------------------

export function getFavorites(): FavoriteEntry[] {
  return read<FavoriteEntry[]>(FAV_KEY, [])
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.identifier === id)
}

/** Toggle and return the new state (true = now a favorite). */
export function toggleFavorite(item: Partial<Snapshot> & { identifier: string }): boolean {
  const s = snap(item)
  const list = getFavorites()
  const exists = list.some((f) => f.identifier === s.identifier)
  const next = exists
    ? list.filter((f) => f.identifier !== s.identifier)
    : [{ ...s, savedAt: Date.now() }, ...list]
  write(FAV_KEY, next)
  emit()
  return !exists
}

export function removeFavorite(id: string): void {
  write(
    FAV_KEY,
    getFavorites().filter((f) => f.identifier !== id),
  )
  emit()
}

// ---- History ----------------------------------------------------------

export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(HIST_KEY, [])
}

export function pushHistory(item: Partial<Snapshot> & { identifier: string }): void {
  const s = snap(item)
  const without = getHistory().filter((h) => h.identifier !== s.identifier)
  write(HIST_KEY, [{ ...s, viewedAt: Date.now() }, ...without].slice(0, HIST_LIMIT))
  emit()
}

export function clearHistory(): void {
  write(HIST_KEY, [])
  emit()
}

// ---- Watch progress ---------------------------------------------------

export function getAllProgress(): Record<string, ProgressEntry> {
  return read<Record<string, ProgressEntry>>(PROG_KEY, {})
}

export function getProgress(id: string): ProgressEntry | null {
  return getAllProgress()[id] || null
}

export function setProgress(
  item: Partial<Snapshot> & { identifier: string },
  seconds: number,
  duration: number,
): void {
  if (!duration || !isFinite(duration)) return
  const all = getAllProgress()
  const s = snap(item)
  // Once essentially complete, forget the position so it restarts cleanly.
  if (seconds / duration >= FINISHED_THRESHOLD) {
    delete all[s.identifier]
  } else if (seconds < 5) {
    // Too early to bother remembering.
    return
  } else {
    all[s.identifier] = { ...s, seconds, duration, updatedAt: Date.now() }
  }
  write(PROG_KEY, all)
  emit()
}

export function removeProgress(id: string): void {
  const all = getAllProgress()
  delete all[id]
  write(PROG_KEY, all)
  emit()
}

/** Continue Watching: in-progress items, newest first. */
export function getContinueWatching(): ProgressEntry[] {
  return Object.values(getAllProgress())
    .filter((p) => p.seconds > 0 && p.seconds / p.duration < FINISHED_THRESHOLD)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

/** 0–1 progress fraction for a given id, or 0. */
export function progressFraction(id: string): number {
  const p = getProgress(id)
  if (!p || !p.duration) return 0
  return Math.min(1, p.seconds / p.duration)
}
