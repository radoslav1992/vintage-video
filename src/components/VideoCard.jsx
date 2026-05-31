import { Link } from 'react-router-dom'
import { thumbUrl } from '../api/archive.js'
import { useLibrary } from '../context/LibraryContext.jsx'

// A single poster card. `kind` ('movie' | 'video') controls the detail link
// and the corner badge.
export default function VideoCard({ item, kind = 'movie', badge }) {
  const { isFavorite, toggleFavorite } = useLibrary()
  const fav = isFavorite(item.identifier)
  const to = `/${kind === 'video' ? 'videos' : 'movies'}/${encodeURIComponent(item.identifier)}`

  const onFav = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite({ ...item, kind })
  }

  return (
    <Link to={to} className="card">
      <div className="card-poster">
        {badge && <span className="card-badge">{badge}</span>}
        <button
          className={`card-fav${fav ? ' on' : ''}`}
          onClick={onFav}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          title={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {fav ? '★' : '☆'}
        </button>
        <img
          src={thumbUrl(item.identifier)}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <div className="card-body">
        <div className="card-title">{item.title}</div>
        <div className="card-meta">
          {[item.year, item.creator].filter(Boolean).join(' · ') || 'Archive film'}
        </div>
      </div>
    </Link>
  )
}
