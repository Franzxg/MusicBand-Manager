import { useCallback } from 'react'
import { getSongs } from '../api/songs'
import useApiData from './useApiData'

// Repertorio della band
export default function useSongs(bandId) {
  const { data, setData, ...rest } = useApiData(useCallback(() => getSongs(bandId), [bandId]), [])
  return { songs: data, setSongs: setData, ...rest }
}
