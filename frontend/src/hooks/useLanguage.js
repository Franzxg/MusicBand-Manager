import { useContext } from 'react'
import { LanguageContext } from '../context/contexts'

export default function useLanguage() {
  return useContext(LanguageContext)
}
