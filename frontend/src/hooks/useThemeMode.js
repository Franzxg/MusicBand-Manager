import { useContext } from 'react'
import { ThemeModeContext } from '../context/contexts'

export default function useThemeMode() {
  return useContext(ThemeModeContext)
}
