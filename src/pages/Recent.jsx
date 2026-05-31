import { Link } from 'react-router-dom'
import VideoCard from '../components/VideoCard.jsx'
import { useLibrary } from '../context/LibraryContext.jsx'

export default function Recent() {
  const { recent, clearRecent } = useLibrary()

  return (
    <div>
      <div className="section-head">
        <div>
          <span className="kicker">The projection log</span>
          <h2>Recently Viewed</h2>
        </div>
        {recent.length > 0 && (
          <button className="more" onClick={clearRecent} style={{ background: 'none', border: 'none', color: 'var(--coral-deep)' }}>
            Clear history
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="center-state">
          <div className="big">🕰️</div>
          <h2>Nothing watched yet</h2>
          <p>Films you open will be remembered here so you can find your way back.</p>
          <Link className="btn" to="/">
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="grid">
          {recent.map((item) => (
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
