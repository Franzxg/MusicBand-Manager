import { useCallback, useEffect, useState } from 'react'

// Dati letti dall'API con caricamento, errore e ricarica; fetcher deve essere stabile (useCallback)
export default function useApiData(fetcher, initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetcher())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- caricamento iniziale
    reload()
  }, [reload])

  return { data, setData, loading, error, reload }
}
