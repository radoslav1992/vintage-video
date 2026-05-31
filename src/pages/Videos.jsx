import BrowsePage from './BrowsePage.jsx'
import { VIDEO_CATEGORIES } from '../data/catalog.js'

export default function Videos() {
  return (
    <BrowsePage
      kind="video"
      kicker="Beyond the feature"
      title="Videos"
      intro="Newsreels, commercials, educational shorts and ephemera — the everyday film of the last century, by category."
      groups={VIDEO_CATEGORIES}
      paramKey="category"
    />
  )
}
