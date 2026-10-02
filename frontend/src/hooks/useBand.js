import { useCallback } from 'react'
import { getBand } from '../api/bands'
import useApiData from './useApiData'

// Dettaglio di una band con i membri; setBand aggiorna i dati dopo una scrittura
export default function useBand(bandId) {
  const { data, setData, ...rest } = useApiData(useCallback(() => getBand(bandId), [bandId]))
  return { band: data, setBand: setData, ...rest }
}
