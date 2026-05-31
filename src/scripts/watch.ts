// Watch page: loads Archive metadata, plays via a native <video> element
// (so we can persist watch progress), enriches the description from
// Wikipedia, records history, and wires the favorite toggle.

import {
  getMetadata,
  embedUrl,
  detailsUrl,
  thumbUrl,
  type ArchiveMeta,
} from '../lib/archive'
import { getWikipediaInfo } from '../lib/wikipedia'
import {
  pushHistory,
  isFavorite,
  toggleFavorite,
  getProgress,
  setProgress,
  type Kind,
} from '../lib/store'
import { escapeHtml, formatTime } from '../lib/ui'

const SAVE_INTERVAL_MS = 5000

export async function initWatch(): Promise<void> {
  const params = new URLSearchParams(location.search)
  const id = params.get('v')
  const kind = (params.get('kind') as Kind) || 'movie'
  const root = document.getElementById('watchRoot')!

  if (!id) {
    root.innerHTML = notFound(kind)
    return
  }

  let meta: ArchiveMeta
  try {
    meta = await getMetadata(id)
  } catch {
    root.innerHTML = notFound(kind)
    return
  }

  const snapshot = {
    identifier: id,
    title: meta.title,
    year: meta.year,
    creator: meta.creator,
    kind,
  }
  pushHistory(snapshot)

  root.innerHTML = layout(meta, kind)
  mountPlayer(meta, snapshot)
  wireFavorite(meta, kind)
  loadAbout(meta, kind)
  window.scrollTo(0, 0)
}

// ---- markup -----------------------------------------------------------

function layout(meta: ArchiveMeta, kind: Kind): string {
  const back = kind === 'video' ? '/videos' : '/movies'
  const backLabel = kind === 'video' ? 'Videos' : 'Movies'
  const sub =
    [meta.year, meta.creator || meta.director, meta.runtime].filter(Boolean).join('  ·  ') ||
    'From the Internet Archive'
  const poster = thumbUrl(meta.identifier)

  return `
    <a class="more" href="${back}" style="display:inline-block;margin-bottom:18px">← Back to ${backLabel}</a>

    <div class="detail-top">
      <div class="detail-poster">
        <img id="posterImg" src="${poster}" alt="${escapeHtml(meta.title)}" onerror="this.style.display='none'" />
      </div>
      <div>
        <span class="kicker">${kind === 'video' ? 'Archive Video' : 'Feature Film'}</span>
        <h1 class="detail-title">${escapeHtml(meta.title)}</h1>
        <div class="detail-sub">${escapeHtml(sub)}</div>
        <div class="detail-actions">
          <button class="btn" id="favBtn" type="button"></button>
          <a class="btn ghost" href="${detailsUrl(meta.identifier)}" target="_blank" rel="noreferrer">View on Archive.org ↗</a>
        </div>
        ${metaTable(meta)}
      </div>
    </div>

    <div class="player-frame" id="playerMount"></div>
    <div class="resume-bar" id="resumeBar" style="display:none"></div>

    <section class="panel">
      <div class="section-head">
        <div><span class="kicker">The story</span><h2 style="margin:0">About this film</h2></div>
      </div>
      <div id="aboutBody"><p style="color:var(--ink-faint)">Consulting the encyclopedia…</p></div>
    </section>`
}

function metaTable(meta: ArchiveMeta): string {
  const rows: Array<[string, string | undefined]> = [
    ['Year', meta.year],
    ['Creator', meta.creator],
    ['Director', meta.director],
    ['Language', meta.language],
    ['Subjects', meta.subject.slice(0, 6).join(', ') || undefined],
    ['Collection', meta.collection.slice(0, 4).join(', ') || undefined],
  ]
  const body = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td>${k}</td><td>${escapeHtml(v)}</td></tr>`)
    .join('')
  return body ? `<table class="meta-table"><tbody>${body}</tbody></table>` : ''
}

function notFound(kind: Kind): string {
  const back = kind === 'video' ? '/videos' : '/movies'
  return `<div class="center-state"><div class="big">🎬</div>
    <h2>Reel not found</h2>
    <p>We couldn’t pull this title from the Internet Archive.</p>
    <a class="btn" href="${back}">← Back to browsing</a></div>`
}

// ---- player + watch progress -----------------------------------------

function mountPlayer(meta: ArchiveMeta, snapshot: any): void {
  const mount = document.getElementById('playerMount')!
  const resumeBar = document.getElementById('resumeBar')!

  // No direct file → fall back to the Archive embed (no progress tracking).
  if (!meta.videoFile) {
    mount.innerHTML = `<iframe src="${embedUrl(meta.identifier)}" title="${escapeHtml(meta.title)}" allow="fullscreen" allowfullscreen></iframe>`
    return
  }

  const video = document.createElement('video')
  video.controls = true
  video.preload = 'metadata'
  video.playsInline = true
  video.src = meta.videoFile
  video.poster = thumbUrl(meta.identifier)
  mount.replaceChildren(video)

  const saved = getProgress(meta.identifier)

  video.addEventListener('loadedmetadata', () => {
    if (saved && saved.seconds > 5 && saved.seconds < video.duration - 5) {
      resumeBar.style.display = ''
      resumeBar.innerHTML = `
        <span class="type">Resuming where you left off — ${formatTime(saved.seconds)}</span>
        <button class="btn ghost" id="restartBtn" type="button">Start over</button>`
      video.currentTime = saved.seconds
      document.getElementById('restartBtn')?.addEventListener('click', () => {
        video.currentTime = 0
        resumeBar.style.display = 'none'
        video.play().catch(() => {})
      })
    }
  })

  // Throttled progress persistence.
  let last = 0
  const persist = () => {
    if (!video.duration) return
    setProgress(snapshot, video.currentTime, video.duration)
  }
  video.addEventListener('timeupdate', () => {
    const now = Date.now()
    if (now - last >= SAVE_INTERVAL_MS) {
      last = now
      persist()
    }
  })
  video.addEventListener('pause', persist)
  video.addEventListener('ended', persist)
  window.addEventListener('beforeunload', persist)
  window.addEventListener('pagehide', persist)
}

// ---- favorite toggle --------------------------------------------------

function wireFavorite(meta: ArchiveMeta, kind: Kind): void {
  const btn = document.getElementById('favBtn') as HTMLButtonElement
  const render = () => {
    const on = isFavorite(meta.identifier)
    btn.textContent = on ? '★ In Favorites' : '☆ Add to Favorites'
  }
  render()
  btn.addEventListener('click', () => {
    toggleFavorite({
      identifier: meta.identifier,
      title: meta.title,
      year: meta.year,
      creator: meta.creator,
      kind,
    })
    render()
  })
}

// ---- about (Wikipedia → Archive fallback) ----------------------------

async function loadAbout(meta: ArchiveMeta, kind: Kind): Promise<void> {
  const body = document.getElementById('aboutBody')!
  let wiki = null
  try {
    wiki = await getWikipediaInfo(meta.title, { year: meta.year, type: kind })
  } catch {
    wiki = null
  }

  const hasWiki = !!(wiki && wiki.extract)
  const summary = hasWiki ? wiki!.extract : meta.description

  // Prefer the Wikipedia poster if we have one.
  if (hasWiki && wiki!.thumbnail) {
    const img = document.getElementById('posterImg') as HTMLImageElement | null
    if (img) {
      img.src = wiki!.thumbnail
      img.style.display = ''
    }
  }

  const paras = (text: string) =>
    text
      .split('\n\n')
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join('')

  let html = `<span class="source-tag">${hasWiki ? '📖 Source: Wikipedia' : '🗄️ Source: Internet Archive'}</span>`
  if (summary) {
    html += `<div class="prose">${paras(summary)}</div>`
  } else {
    html +=
      '<p style="color:var(--ink-faint)">No description is available for this title from either Wikipedia or the Internet Archive.</p>'
  }
  if (hasWiki) {
    html += `<p style="margin-top:16px"><a href="${wiki!.url}" target="_blank" rel="noreferrer">Read the full article on Wikipedia ↗</a></p>`
    if (meta.description) {
      html += `<details style="margin-top:18px"><summary style="cursor:pointer" class="type">Also: the Internet Archive’s description</summary><div class="prose" style="margin-top:12px">${paras(meta.description)}</div></details>`
    }
  }
  body.innerHTML = html
}
