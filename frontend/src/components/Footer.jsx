import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

// Anno e autore sono costanti (non si traducono); il nome dell'app viene da app.name
const YEAR = 2026
const AUTHOR = 'Franzxg'

// Piè di pagina di tutti i layout: landmark contentinfo, senza elementi interattivi
export default function Footer() {
  const { t } = useTranslation()

  return (
    <Box component="footer" sx={{ py: 2, px: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        © {YEAR} {t('app.name')} · {AUTHOR}
      </Typography>
    </Box>
  )
}
