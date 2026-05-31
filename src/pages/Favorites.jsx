import { Link } from 'react-router-dom'
import VideoCard from '../components/VideoCard.jsx'
import { useLibrary } from '../context/LibraryContext.jsx'

export default function Favorites() {
  const { favorites } = useLibrary()

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="kicker">Your private collection</span>
          <h2>Favorites</h2>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="center-state">
          <div className="big">★</div>
          <h2>No favorites yet</h2>
          <p>Tap the star on any reel to keep it here for the next double feature.</p>
          <Link className="btn" to="/movies">
            Find something to watch
          </Link>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((item) => (
            <VideoCard
              key={item.identifier}
              item={item}
              kind={item.kind === 'video' ? 'video' : 'movie'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
