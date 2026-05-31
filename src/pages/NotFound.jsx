import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="center-state">
      <div className="big">🎟️</div>
      <h2>Reel 404 — wrong theatre</h2>
      <p>The page you’re looking for isn’t showing tonight.</p>
      <Link className="btn" to="/">
        Return to the lobby
      </Link>
    </div>
  )
}
