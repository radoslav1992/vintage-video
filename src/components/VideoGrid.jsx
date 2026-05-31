import VideoCard from './VideoCard.jsx'

// Renders a responsive grid of cards, a loading skeleton, or an empty state.
export default function VideoGrid({ items, kind = 'movie', loading, emptyText }) {
  if (loading) {
    return (
      <div className="grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton sk-card" />
        ))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="center-state">
        <div className="big">🎞️</div>
        <p>{emptyText || 'No reels found in this part of the vault.'}</p>
      </div>
    )
  }

  return (
    <div className="grid">
      {items.map((item) => (
        <VideoCard key={item.identifier} item={item} kind={kind} />
      ))}
    </div>
  )
}
