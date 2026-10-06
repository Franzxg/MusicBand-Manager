import { Box, Container } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { fadeIn, pageFrame } from '../theme/theme'
import Footer from './Footer'
import Navbar from './Navbar'

// Layout delle pagine protette; la chiave sul percorso ripete la dissolvenza a ogni cambio di pagina
export default function AppLayout() {
  const { pathname } = useLocation()

  return (
    <Box sx={pageFrame}>
      <Navbar />
      <Container component="main" maxWidth="lg" sx={{ flex: 1, py: { xs: 3, md: 4 } }}>
        <Box key={pathname} sx={fadeIn}>
          <Outlet />
        </Box>
      </Container>
      <Footer />
    </Box>
  )
}
