import { Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Layout delle pagine protette
export default function AppLayout() {
  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Outlet />
      </Container>
    </>
  )
}
