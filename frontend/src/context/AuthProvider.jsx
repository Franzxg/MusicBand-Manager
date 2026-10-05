import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as authApi from '../api/auth'
import { getToken, setToken, UNAUTHORIZED_EVENT } from '../api/client'
import { isNetworkError } from '../api/errors'
import useNotification from '../hooks/useNotification'
import { AuthContext } from './contexts'

export default function AuthProvider({ children }) {
  const { t } = useTranslation()
  const { notify } = useNotification()
  const [token, setTokenState] = useState(getToken)
  const [user, setUser] = useState(null)

  const saveSession = useCallback(({ token: newToken, user: newUser }) => {
    setToken(newToken)
    setTokenState(newToken)
    setUser(newUser)
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  // Con un token salvato ma senza utente in memoria (es. dopo un refresh) si legge /me
  useEffect(() => {
    if (!token || user) return
    let active = true
    authApi
      .getMe()
      .then((me) => active && setUser(me))
      .catch((error) => {
        if (active && isNetworkError(error)) notify(t('errors.network'), 'error')
      })
    return () => {
      active = false
    }
  }, [token, user, notify, t])

  // 401 dall'API: il client ha già cancellato il token, qui si azzera lo stato
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession()
      notify(t('errors.sessionExpired'), 'warning')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [clearSession, notify, t])

  const login = useCallback(async (credentials) => saveSession(await authApi.login(credentials)), [saveSession])

  const register = useCallback(async (data) => saveSession(await authApi.register(data)), [saveSession])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // anche se la revoca fallisce, la sessione locale si chiude
    }
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, register, logout, clearSession, setUser }),
    [token, user, login, register, logout, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
