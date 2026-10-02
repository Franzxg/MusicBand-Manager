import { useCallback, useEffect, useState } from 'react'
import { getBand } from '../api/bands'

// Dettaglio di una band con i membri; setBand aggiorna i dati dopo una scrittura
export default function useBand(bandId) {
  const [band, setBand] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setBand(await getBand(bandId))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [bandId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- caricamento iniziale
    reload()
  }, [reload])

  return { band, setBand, loading, error, reload }
}
