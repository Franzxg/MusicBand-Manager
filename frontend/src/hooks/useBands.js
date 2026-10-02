import { getBands } from '../api/bands'
import useApiData from './useApiData'

// Band dell'utente
export default function useBands() {
  const { data, ...rest } = useApiData(getBands, [])
  return { bands: data, ...rest }
}
