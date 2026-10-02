import { CssBaseline, ThemeProvider } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { createAppTheme } from '../theme/theme'
import { ThemeModeContext } from './contexts'

const THEME_KEY = 'themeMode'

// Tema scuro di default, senza seguire il sistema
function initialMode() {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export default function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(initialMode)

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        // scelta non salvata
      }
      return next
    })
  }, [])

  const theme = useMemo(() => createAppTheme(mode), [mode])
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
