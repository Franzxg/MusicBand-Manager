import { Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

// Segnaposto: dati personali, password ed eliminazione account arrivano nella fase 9
export default function ProfilePage() {
  const { t } = useTranslation()

  return (
    <Stack spacing={2}>
      <Typography variant="h1">{t('profile.title')}</Typography>
      <Typography color="text.secondary">{t('profile.placeholder')}</Typography>
    </Stack>
  )
}
