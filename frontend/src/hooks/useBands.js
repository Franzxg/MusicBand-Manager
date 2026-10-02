import { useCallback, useEffect, useState } from 'react'
import { getBands } from '../api/bands'

// Band dell'utente: dati, caricamento, errore e ricarica
export default function useBands() {
  const [bands, setBands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setBands(await getBands())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- caricamento iniziale
    reload()
  }, [reload])

  return { bands, loading, error, reload }
}
