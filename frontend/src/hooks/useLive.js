import { useCallback } from 'react'
import { getLive } from '../api/lives'
import useApiData from './useApiData'

// Dettaglio del live con la scaletta; setLive accetta la risposta delle scritture
export default function useLive(liveId) {
  const { data, setData, ...rest } = useApiData(useCallback(() => getLive(liveId), [liveId]))
  return { live: data, setLive: setData, ...rest }
}
