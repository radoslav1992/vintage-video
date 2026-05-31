import { Link } from 'react-router-dom'
import { useArchiveSearch } from '../hooks/useArchiveSearch.js'
import VideoCard from './VideoCard.jsx'

// A horizontally-scrolling shelf of films for a single query.
export default function Row({ kicker, title, query, kind = 'movie', moreTo, sort }) {
  const { docs, loading } = useArchiveSearch({ query, rows: 12, sort })

  return (
    <section style={{ marginBottom: 38 }}>
      <div className="section-head">
        <div>
          {kicker && <span className="kicker">{kicker}</span>}
          <h2>{title}</h2>
        </div>
        {moreTo && (
          <Link className="more" to={moreTo}>
            See all →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="row-scroll">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton sk-card" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)' }}>No reels available right now.</p>
      ) : (
        <div className="row-scroll">
          {docs.map((item) => (
            <VideoCard key={item.identifier} item={item} kind={kind} />
          ))}
        </div>
      )}
    </section>
  )
}
