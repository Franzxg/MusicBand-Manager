import { Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import PageShell from '../components/PageShell'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <PageShell maxWidth="sm">
      <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Typography variant="h1">{t('notFound.title')}</Typography>
        <Typography>{t('notFound.text')}</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          {t('notFound.toDashboard')}
        </Button>
      </Stack>
    </PageShell>
  )
}
