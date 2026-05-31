import { useSearchParams } from 'react-router-dom'
import VideoGrid from '../components/VideoGrid.jsx'
import { useArchiveSearch } from '../hooks/useArchiveSearch.js'

const ROWS = 36

export default function Search() {
  const [params, setParams] = useSearchParams()
  const term = (params.get('q') || '').trim()
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))

  // Restrict to moving images so results are watchable.
  const query = term
    ? `(${escapeLucene(term)}) AND mediatype:(movies)`
    : ''

  const { docs, total, loading, error } = useArchiveSearch({
    query,
    page,
    rows: ROWS,
    enabled: !!term,
  })

  const totalPages = Math.min(Math.ceil(total / ROWS) || 1, 100)
  const go = (p) => {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="kicker">Search the vault</span>
          <h2>{term ? `Results for “${term}”` : 'Search'}</h2>
        </div>
      </div>

      {!term ? (
        <div className="center-state">
          <div className="big">⌕</div>
          <p>Type a title, year, person or subject in the search box above.</p>
        </div>
      ) : error ? (
        <div className="center-state">
          <div className="big">📽️</div>
          <p>The search reel snapped. Please try again.</p>
        </div>
      ) : (
        <>
          {!loading && (
            <p style={{ fontFamily: 'var(--type)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: -4 }}>
              {total.toLocaleString()} matching reels
            </p>
          )}
          <VideoGrid items={docs} kind="movie" loading={loading} emptyText="No reels match that search." />

          {!loading && docs.length > 0 && totalPages > 1 && (
            <div className="pager">
              <button className="btn ghost" disabled={page <= 1} onClick={() => go(page - 1)} style={{ opacity: page <= 1 ? 0.4 : 1 }}>
                ← Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button className="btn ghost" disabled={page >= totalPages} onClick={() => go(page + 1)} style={{ opacity: page >= totalPages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Escape Lucene special characters so user input can't break the query.
function escapeLucene(s) {
  return s.replace(/([+\-!(){}[\]^"~*?:\\/]|&&|\|\|)/g, ' ').replace(/\s+/g, ' ').trim()
}
