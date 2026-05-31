import { Link } from 'react-router-dom'
import Row from '../components/Row.jsx'
import { MOVIE_GENRES, VIDEO_CATEGORIES } from '../data/catalog.js'
import { useLibrary } from '../context/LibraryContext.jsx'

export default function Home() {
  const { recent } = useLibrary()

  return (
    <div>
      <section className="hero">
        <span className="kicker">Reel by reel · since the silver age</span>
        <h1>A picture house for the films time forgot.</h1>
        <p>
          Wander the stacks of the public-domain vault — feature films, newsreels,
          cartoons and curiosities, all streaming free from the Internet Archive,
          with the stories behind them drawn from Wikipedia.
        </p>
        <div className="hero-actions">
          <Link className="btn" to="/movies">
            Browse Movies
          </Link>
          <Link className="btn ghost" to="/videos">
            Browse Videos
          </Link>
        </div>
      </section>

      {recent.length > 0 && (
        <section style={{ marginBottom: 38 }}>
          <div className="section-head">
            <div>
              <span className="kicker">Pick up where you left off</span>
              <h2>Recently Viewed</h2>
            </div>
            <Link className="more" to="/recent">
              See all →
            </Link>
          </div>
          <div className="row-scroll">
            {recent.slice(0, 12).map((item) => (
              <RecentMini key={item.identifier} item={item} />
            ))}
          </div>
        </section>
      )}

      <Row
        kicker="Now showing"
        title="Popular Feature Films"
        query={MOVIE_GENRES[0].query}
        kind="movie"
        moreTo="/movies"
      />

      <Row
        kicker="From the projection booth"
        title="Film Noir"
        query={MOVIE_GENRES.find((g) => g.id === 'noir').query}
        kind="movie"
        moreTo="/movies?genre=noir"
      />

      <Row
        kicker="Saturday matinee"
        title="Sci-Fi & Horror"
        query={MOVIE_GENRES.find((g) => g.id === 'scifi-horror').query}
        kind="movie"
        moreTo="/movies?genre=scifi-horror"
      />

      {/* Browse-by tiles */}
      <section style={{ margin: '46px 0 30px' }}>
        <div className="section-head">
          <div>
            <span className="kicker">By the reel</span>
            <h2>Movie Genres</h2>
          </div>
        </div>
        <div className="tile-grid">
          {MOVIE_GENRES.map((g) => (
            <Link key={g.id} to={`/movies?genre=${g.id}`} className="tile">
              <span className="tile-emoji">{g.emoji}</span>
              <h3>{g.label}</h3>
              <p>{g.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <Row
        kicker="From the vaults"
        title="Ephemeral & Home Movies"
        query={VIDEO_CATEGORIES.find((c) => c.id === 'ephemeral').query}
        kind="video"
        moreTo="/videos?category=ephemeral"
      />

      <section style={{ margin: '46px 0 30px' }}>
        <div className="section-head">
          <div>
            <span className="kicker">Beyond the feature</span>
            <h2>Video Categories</h2>
          </div>
        </div>
        <div className="tile-grid">
          {VIDEO_CATEGORIES.map((c) => (
            <Link key={c.id} to={`/videos?category=${c.id}`} className="tile">
              <span className="tile-emoji">{c.emoji}</span>
              <h3>{c.label}</h3>
              <p>{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// Compact card used in the "recently viewed" shelf (snapshot data only).
function RecentMini({ item }) {
  const kind = item.kind === 'video' ? 'videos' : 'movies'
  return (
    <Link to={`/${kind}/${encodeURIComponent(item.identifier)}`} className="card">
      <div className="card-poster">
        <img
          src={`https://archive.org/services/img/${item.identifier}`}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <div className="card-body">
        <div className="card-title">{item.title}</div>
        <div className="card-meta">{item.year || 'Archive film'}</div>
      </div>
    </Link>
  )
}
