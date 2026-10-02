import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

// Pagine protette: senza token si va al login, ricordando la pagina richiesta
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Login e registrazione: con il token già presente si va alla dashboard
export function GuestRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
