import { useEffect, useRef, useState } from 'react'
import { search } from '../api/archive.js'

// Fetches Archive search results for the given query, with loading/error
// state. Re-runs whenever query/page/sort change.
export function useArchiveSearch({ query, page = 1, rows = 24, sort = 'downloads desc', enabled = true }) {
  const [docs, setDocs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const reqId = useRef(0)

  useEffect(() => {
    if (!enabled || !query) {
      setLoading(false)
      return
    }
    const id = ++reqId.current
    setLoading(true)
    setError(null)

    search({ query, page, rows, sort })
      .then((res) => {
        if (id !== reqId.current) return // stale response, ignore
        setDocs(res.docs)
        setTotal(res.total)
      })
      .catch((err) => {
        if (id !== reqId.current) return
        setError(err)
        setDocs([])
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false)
      })
  }, [query, page, rows, sort, enabled])

  return { docs, total, loading, error }
}
