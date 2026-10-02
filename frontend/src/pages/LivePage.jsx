import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useParams } from 'react-router-dom'

// Segnaposto: dettaglio del live e scaletta arrivano nella fase 7
export default function LivePage() {
  const { t } = useTranslation()
  const { bandId } = useParams()

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Button component={RouterLink} to={`/bands/${bandId}?tab=lives`} startIcon={<ArrowBackIcon />} sx={{ ml: -1 }}>
        {t('live.back')}
      </Button>
      <Typography variant="h1">{t('live.title')}</Typography>
      <Typography color="text.secondary">{t('band.comingSoon')}</Typography>
    </Stack>
  )
}
