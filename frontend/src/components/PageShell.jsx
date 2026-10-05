import { Container } from '@mui/material'
import { fadeIn } from '../theme/theme'
import useAuth from '../hooks/useAuth'
import Navbar from './Navbar'
import PublicHeader from './PublicHeader'

// Pagine visibili sia da loggati sia da ospiti (Guida, 404): Navbar oppure intestazione pubblica
export default function PageShell({ children, maxWidth = 'md' }) {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {isAuthenticated ? <Navbar /> : <PublicHeader showLogin />}
      <Container component="main" maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 }, ...fadeIn }}>
        {children}
      </Container>
    </>
  )
}
