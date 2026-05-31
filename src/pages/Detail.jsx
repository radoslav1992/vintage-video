import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { embedUrl, detailsUrl, getMetadata, thumbUrl } from '../api/archive.js'
import { getWikipediaInfo } from '../api/wikipedia.js'
import { useLibrary } from '../context/LibraryContext.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Detail({ kind = 'movie' }) {
  const { id } = useParams()
  const identifier = decodeURIComponent(id)
  const { isFavorite, toggleFavorite, pushRecent } = useLibrary()

  const [meta, setMeta] = useState(null)
  const [wiki, setWiki] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wikiLoading, setWikiLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch Archive metadata, then enrich with Wikipedia.
  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    setWiki(null)
    setMeta(null)

    getMetadata(identifier)
      .then((m) => {
        if (!alive) return
        setMeta(m)
        setLoading(false)
        pushRecent({
          identifier,
          title: m.title,
          year: m.year,
          creator: m.creator,
          mediatype: m.mediatype,
          kind,
        })

        // Wikipedia lookup (best-effort, non-blocking).
        setWikiLoading(true)
        getWikipediaInfo(m.title, { year: m.year, type: kind })
          .then((w) => alive && setWiki(w))
          .catch(() => alive && setWiki(null))
          .finally(() => alive && setWikiLoading(false))
      })
      .catch((err) => {
        if (!alive) return
        setError(err)
        setLoading(false)
      })

    window.scrollTo(0, 0)
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier, kind])

  if (loading) return <Spinner />

  if (error || !meta) {
    return (
      <div className="center-state">
        <div className="big">🎬</div>
        <h2>Reel not found</h2>
        <p>We couldn’t pull this title from the Internet Archive.</p>
        <Link className="btn" to={kind === 'video' ? '/videos' : '/movies'}>
          ← Back to browsing
        </Link>
      </div>
    )
  }

  const fav = isFavorite(identifier)
  const poster = wiki?.thumbnail || thumbUrl(identifier)

  // Prefer Wikipedia prose; fall back to the Archive's own description.
  const hasWiki = wiki && wiki.extract
  const summaryText = hasWiki ? wiki.extract : meta.description

  return (
    <article>
      <Link
        to={kind === 'video' ? '/videos' : '/movies'}
        className="more"
        style={{ display: 'inline-block', marginBottom: 18 }}
      >
        ← Back to {kind === 'video' ? 'Videos' : 'Movies'}
      </Link>

      <div className="detail-top">
        <div className="detail-poster">
          <img
            src={poster}
            alt={meta.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>

        <div>
          <span className="kicker" style={{ fontFamily: 'var(--type)', fontSize: '0.66rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--coral-deep)' }}>
            {kind === 'video' ? 'Archive Video' : 'Feature Film'}
          </span>
          <h1 className="detail-title">{meta.title}</h1>
          <div className="detail-sub">
            {[meta.year, meta.creator || meta.director, meta.runtime]
              .filter(Boolean)
              .join('  ·  ') || 'From the Internet Archive'}
          </div>

          <div className="detail-actions">
            <button className="btn" onClick={() => toggleFavorite({ ...meta, kind })}>
              {fav ? '★ In Favorites' : '☆ Add to Favorites'}
            </button>
            <a className="btn ghost" href={detailsUrl(identifier)} target="_blank" rel="noreferrer">
              View on Archive.org ↗
            </a>
          </div>

          <table className="meta-table">
            <tbody>
              {meta.year && (
                <tr>
                  <td>Year</td>
                  <td>{meta.year}</td>
                </tr>
              )}
              {meta.creator && (
                <tr>
                  <td>Creator</td>
                  <td>{meta.creator}</td>
                </tr>
              )}
              {meta.director && (
                <tr>
                  <td>Director</td>
                  <td>{meta.director}</td>
                </tr>
              )}
              {meta.language && (
                <tr>
                  <td>Language</td>
                  <td>{meta.language}</td>
                </tr>
              )}
              {meta.subject.length > 0 && (
                <tr>
                  <td>Subjects</td>
                  <td>{meta.subject.slice(0, 6).join(', ')}</td>
                </tr>
              )}
              {meta.collection.length > 0 && (
                <tr>
                  <td>Collection</td>
                  <td>{meta.collection.slice(0, 4).join(', ')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player */}
      <div className="player-frame">
        <iframe
          src={embedUrl(identifier)}
          title={meta.title}
          allow="fullscreen"
          allowFullScreen
        />
      </div>

      {/* About — Wikipedia first, Archive fallback */}
      <section className="panel">
        <div className="section-head">
          <div>
            <span className="kicker" style={{ fontFamily: 'var(--type)', fontSize: '0.66rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--coral-deep)' }}>
              The story
            </span>
            <h2 style={{ margin: 0 }}>About this film</h2>
          </div>
        </div>

        {wikiLoading && !hasWiki ? (
          <p style={{ color: 'var(--ink-faint)' }}>Consulting the encyclopedia…</p>
        ) : (
          <>
            <span className="source-tag">
              {hasWiki ? '📖 Source: Wikipedia' : '🗄️ Source: Internet Archive'}
            </span>
            <div className="prose">
              {summaryText ? (
                summaryText.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p style={{ color: 'var(--ink-faint)' }}>
                  No description is available for this title from either Wikipedia or the
                  Internet Archive.
                </p>
              )}
            </div>
            {hasWiki && (
              <p style={{ marginTop: 16 }}>
                <a href={wiki.url} target="_blank" rel="noreferrer">
                  Read the full article on Wikipedia ↗
                </a>
              </p>
            )}
            {/* If Wikipedia supplied the story, still surface the Archive's own note. */}
            {hasWiki && meta.description && (
              <details style={{ marginTop: 18 }}>
                <summary style={{ cursor: 'pointer', fontFamily: 'var(--type)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                  Also: the Internet Archive’s description
                </summary>
                <div className="prose" style={{ marginTop: 12 }}>
                  {meta.description.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </section>
    </article>
  )
}
