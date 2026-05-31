import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import VideoGrid from '../components/VideoGrid.jsx'
import { useArchiveSearch } from '../hooks/useArchiveSearch.js'

const SORTS = [
  { id: 'downloads desc', label: 'Most Popular' },
  { id: 'addeddate desc', label: 'Recently Added' },
  { id: 'date asc', label: 'Oldest First' },
  { id: 'titleSorter asc', label: 'A → Z' },
]

const ROWS = 24

// Shared browsing screen for Movies and Videos.
// `groups` is the list of genres/categories; `paramKey` is the URL param
// that selects one ('genre' or 'category').
export default function BrowsePage({ kind, kicker, title, intro, groups, paramKey }) {
  const [params, setParams] = useSearchParams()

  const activeId = params.get(paramKey) || groups[0].id
  const sort = params.get('sort') || SORTS[0].id
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))
  const active = groups.find((g) => g.id === activeId) || groups[0]

  const { docs, total, loading, error } = useArchiveSearch({
    query: active.query,
    page,
    rows: ROWS,
    sort,
  })

  const totalPages = Math.min(Math.ceil(total / ROWS) || 1, 200)

  const setParam = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === undefined) next.delete(k)
      else next.set(k, String(v))
    })
    setParams(next)
  }

  const selectGroup = (id) => setParam({ [paramKey]: id, page: 1 })

  const pageWindow = useMemo(() => {
    const start = Math.max(1, page - 1)
    const end = Math.min(totalPages, start + 2)
    const out = []
    for (let i = start; i <= end; i++) out.push(i)
    return out
  }, [page, totalPages])

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="kicker">{kicker}</span>
          <h2>{title}</h2>
        </div>
      </div>
      {intro && <p style={{ color: 'var(--ink-soft)', maxWidth: '64ch', marginTop: -6 }}>{intro}</p>}

      <div className="chip-row">
        {groups.map((g) => (
          <button
            key={g.id}
            className={`chip${g.id === active.id ? ' active' : ''}`}
            onClick={() => selectGroup(g.id)}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--type)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
          {loading ? 'Searching the vault…' : `${total.toLocaleString()} reels · ${active.blurb}`}
        </p>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--type)', fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
            Sort
          </span>
          <select
            value={sort}
            onChange={(e) => setParam({ sort: e.target.value, page: 1 })}
            style={{
              fontFamily: 'var(--serif)',
              fontSize: '0.95rem',
              padding: '7px 12px',
              borderRadius: 999,
              border: '1px solid var(--line-strong)',
              background: 'var(--paper)',
              color: 'var(--ink)',
            }}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="center-state">
          <div className="big">📽️</div>
          <p>The projector jammed — couldn’t reach the Internet Archive. Please try again.</p>
        </div>
      ) : (
        <VideoGrid items={docs} kind={kind} loading={loading} />
      )}

      {!loading && !error && docs.length > 0 && totalPages > 1 && (
        <div className="pager">
          <button
            className="btn ghost"
            disabled={page <= 1}
            onClick={() => setParam({ page: page - 1 })}
            style={{ opacity: page <= 1 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          {pageWindow.map((p) => (
            <button
              key={p}
              className={`chip${p === page ? ' active' : ''}`}
              onClick={() => setParam({ page: p })}
            >
              {p}
            </button>
          ))}
          <span>of {totalPages}</span>
          <button
            className="btn ghost"
            disabled={page >= totalPages}
            onClick={() => setParam({ page: page + 1 })}
            style={{ opacity: page >= totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
