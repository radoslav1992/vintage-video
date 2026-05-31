import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// Persisted personal library: favorites + recently viewed.
// Everything lives in localStorage so it survives reloads with no backend.

const LibraryContext = createContext(null)

const FAV_KEY = 'reelvault.favorites'
const RECENT_KEY = 'reelvault.recent'
const RECENT_LIMIT = 40

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / unavailable — fail silently */
  }
}

// We store a slim "item" snapshot so list pages can render without re-fetching.
function toSnapshot(item) {
  return {
    identifier: item.identifier,
    title: item.title,
    year: item.year || null,
    creator: item.creator || null,
    mediatype: item.mediatype || null,
    kind: item.kind || null, // 'movie' | 'video'
  }
}

export function LibraryProvider({ children }) {
  const [favorites, setFavorites] = useState(() => load(FAV_KEY, []))
  const [recent, setRecent] = useState(() => load(RECENT_KEY, []))

  useEffect(() => save(FAV_KEY, favorites), [favorites])
  useEffect(() => save(RECENT_KEY, recent), [recent])

  const isFavorite = useCallback(
    (id) => favorites.some((f) => f.identifier === id),
    [favorites],
  )

  const toggleFavorite = useCallback((item) => {
    const snap = toSnapshot(item)
    setFavorites((prev) => {
      const exists = prev.some((f) => f.identifier === snap.identifier)
      if (exists) return prev.filter((f) => f.identifier !== snap.identifier)
      return [{ ...snap, savedAt: Date.now() }, ...prev]
    })
  }, [])

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((f) => f.identifier !== id))
  }, [])

  const pushRecent = useCallback((item) => {
    const snap = toSnapshot(item)
    setRecent((prev) => {
      const without = prev.filter((r) => r.identifier !== snap.identifier)
      return [{ ...snap, viewedAt: Date.now() }, ...without].slice(0, RECENT_LIMIT)
    })
  }, [])

  const clearRecent = useCallback(() => setRecent([]), [])

  const value = useMemo(
    () => ({
      favorites,
      recent,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      pushRecent,
      clearRecent,
    }),
    [favorites, recent, isFavorite, toggleFavorite, removeFavorite, pushRecent, clearRecent],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within a LibraryProvider')
  return ctx
}
