import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const LINKS = [
  { to: '/movies', label: 'Movies' },
  { to: '/videos', label: 'Videos' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/recent', label: 'Recently Viewed' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <img className="brand-mark" src="/reel.svg" alt="" />
          <span>
            <span className="brand-name">The Reel Vault</span>
            <br />
            <span className="brand-sub">Vintage Cinema Archive</span>
          </span>
        </NavLink>

        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`nav${open ? ' open' : ''}`}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <form className="searchbar" onSubmit={submit}>
            <input
              type="search"
              placeholder="Search the vault…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search films"
            />
            <button type="submit" aria-label="Search">
              ⌕
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
