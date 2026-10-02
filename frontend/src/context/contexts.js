import { createContext } from 'react'

// Oggetti Context dell'app: i Provider sono nei file *Provider.jsx, gli hook in src/hooks
export const AuthContext = createContext(null)
export const ThemeModeContext = createContext(null)
export const LanguageContext = createContext(null)
export const NotificationContext = createContext(null)
