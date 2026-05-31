import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Movies from './pages/Movies.jsx'
import Videos from './pages/Videos.jsx'
import Detail from './pages/Detail.jsx'
import Favorites from './pages/Favorites.jsx'
import Recent from './pages/Recent.jsx'
import Search from './pages/Search.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="movies" element={<Movies />} />
        <Route path="movies/:id" element={<Detail kind="movie" />} />
        <Route path="videos" element={<Videos />} />
        <Route path="videos/:id" element={<Detail kind="video" />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="recent" element={<Recent />} />
        <Route path="search" element={<Search />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
