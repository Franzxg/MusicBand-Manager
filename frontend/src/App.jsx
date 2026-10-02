import { Box, CssBaseline, Typography } from '@mui/material'

// Pagina segnaposto (fase 0): tema, i18n e route arrivano nella fase 5
function App() {
  return (
    <>
      <CssBaseline />
      <Box
        component="main"
        sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}
      >
        <Typography variant="h4" component="h1" align="center">
          Music Band Manager
        </Typography>
      </Box>
    </>
  )
}

export default App
