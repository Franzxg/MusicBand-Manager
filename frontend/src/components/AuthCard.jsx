import { Box, Container, Paper, Typography } from '@mui/material'
import PublicHeader from './PublicHeader'

// Contenitore delle pagine di autenticazione: titolo, testo introduttivo e form
export default function AuthCard({ title, intro, children }) {
  return (
    <>
      <PublicHeader />
      <Container component="main" maxWidth="xs" sx={{ py: { xs: 3, sm: 6 }, px: { xs: 2 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="h1" sx={{ mb: intro ? 1 : 3 }}>
            {title}
          </Typography>
          {intro && (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {intro}
            </Typography>
          )}
          <Box>{children}</Box>
        </Paper>
      </Container>
    </>
  )
}
