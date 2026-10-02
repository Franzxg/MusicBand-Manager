import { Alert, Snackbar } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { NotificationContext } from './contexts'

// Notifiche globali (Snackbar): errori di rete e conferme
export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null)

  const notify = useCallback((message, severity = 'info') => {
    setNotification({ message, severity, key: Date.now() })
  }, [])

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') return
    setNotification(null)
  }

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={notification?.key}
        open={Boolean(notification)}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification ? (
          <Alert onClose={handleClose} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  )
}
