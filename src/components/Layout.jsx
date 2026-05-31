import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>
            Films & metadata courtesy of the{' '}
            <a href="https://archive.org" target="_blank" rel="noreferrer">
              Internet Archive
            </a>{' '}
            and{' '}
            <a href="https://wikipedia.org" target="_blank" rel="noreferrer">
              Wikipedia
            </a>
            .
          </span>
          <span className="type">The Reel Vault · Est. MMXXVI</span>
        </div>
      </footer>
    </div>
  )
}
