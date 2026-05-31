import BrowsePage from './BrowsePage.jsx'
import { MOVIE_GENRES } from '../data/catalog.js'

export default function Movies() {
  return (
    <BrowsePage
      kind="movie"
      kicker="The feature presentation"
      title="Movies"
      intro="Full-length motion pictures from the public domain, sorted by genre. Pick a marquee below."
      groups={MOVIE_GENRES}
      paramKey="genre"
    />
  )
}
