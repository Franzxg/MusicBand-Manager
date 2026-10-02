import axios from 'axios'
import i18n from '../i18n'

export const TOKEN_KEY = 'token'

// Evento usato per avvisare l'AuthContext che il token non è più valido
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage non disponibile: il token resta solo in memoria
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['Accept-Language'] = i18n.language
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 con un token attivo: sessione scaduta, si esce
    if (error.response?.status === 401 && getToken()) {
      setToken(null)
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

export default client
