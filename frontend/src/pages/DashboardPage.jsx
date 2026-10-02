import { Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import useAuth from '../hooks/useAuth'

// Segnaposto: band e calendario arrivano nella fase 6
export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <Stack spacing={2}>
      <Typography variant="h1">{user ? t('dashboard.welcome', { name: user.name }) : t('dashboard.title')}</Typography>
      <Typography color="text.secondary">{t('dashboard.placeholder')}</Typography>
    </Stack>
  )
}
