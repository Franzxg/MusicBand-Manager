import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import it from './locales/it.json'

export const LANGUAGES = ['it', 'en']
export const LANGUAGE_KEY = 'language'

// Lingua iniziale: scelta salvata, altrimenti quella del browser se è it o en, altrimenti italiano
function initialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (LANGUAGES.includes(saved)) return saved
  } catch {
    // localStorage non disponibile
  }
  const browser = (navigator.language || '').slice(0, 2).toLowerCase()
  return LANGUAGES.includes(browser) ? browser : 'it'
}

i18n.use(initReactI18next).init({
  resources: { it: { translation: it }, en: { translation: en } },
  lng: initialLanguage(),
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.language

export default i18n
