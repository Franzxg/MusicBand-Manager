import { useCallback, useMemo, useState } from 'react'
import i18n, { LANGUAGE_KEY, LANGUAGES } from '../i18n'
import { LanguageContext } from './contexts'

export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(i18n.language)

  const setLanguage = useCallback((lng) => {
    if (!LANGUAGES.includes(lng)) return
    i18n.changeLanguage(lng)
    document.documentElement.lang = lng
    try {
      localStorage.setItem(LANGUAGE_KEY, lng)
    } catch {
      // scelta non salvata
    }
    setLanguageState(lng)
  }, [])

  const value = useMemo(() => ({ language, setLanguage, languages: LANGUAGES }), [language, setLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
