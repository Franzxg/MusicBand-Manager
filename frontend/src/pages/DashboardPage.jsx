import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import { Alert, Box, Button, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import BandCard from '../components/BandCard'
import CreateBandDialog from '../components/CreateBandDialog'
import EventCalendar from '../components/EventCalendar'
import JoinBandDialog from '../components/JoinBandDialog'
import useAuth from '../hooks/useAuth'
import useBands from '../hooks/useBands'
import useNotification from '../hooks/useNotification'

// Band dell'utente e calendario aggregato: una colonna su smartphone, due da md
export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const { bands, loading, error, reload } = useBands()
  const [dialog, setDialog] = useState(null)

  // Dopo creazione o ingresso si apre la pagina della band
  const openBand = (band, message) => {
    setDialog(null)
    notify(message, 'success')
    navigate(`/bands/${band.id}`)
  }

  const actions = (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog('create')}>
        {t('bands.create.button')}
      </Button>
      <Button variant="outlined" startIcon={<LoginIcon />} onClick={() => setDialog('join')}>
        {t('bands.join.button')}
      </Button>
    </Stack>
  )

  let content
  if (loading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress aria-label={t('common.loading')} />
      </Box>
    )
  } else if (error) {
    content = (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={reload}>
            {t('common.retry')}
          </Button>
        }
      >
        {t('bands.loadError')}
      </Alert>
    )
  } else if (bands.length === 0) {
    content = (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography>{t('bands.empty')}</Typography>
      </Paper>
    )
  } else {
    content = (
      <Stack spacing={2}>
        {bands.map((band) => (
          <BandCard key={band.id} band={band} />
        ))}
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h1">{user ? t('dashboard.welcome', { name: user.name }) : t('dashboard.title')}</Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }} component="section" aria-labelledby="bands-title">
          <Stack spacing={2}>
            <Typography variant="h2" id="bands-title">
              {t('bands.title')}
            </Typography>
            {actions}
            {content}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }} component="section" aria-labelledby="calendar-title">
          <Typography variant="h2" id="calendar-title" sx={{ mb: 2 }}>
            {t('calendar.title')}
          </Typography>
          <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 } }}>
            <EventCalendar />
          </Paper>
        </Grid>
      </Grid>

      <CreateBandDialog
        open={dialog === 'create'}
        onClose={() => setDialog(null)}
        onCreated={(band) => openBand(band, t('bands.create.success', { name: band.name }))}
      />
      <JoinBandDialog
        open={dialog === 'join'}
        onClose={() => setDialog(null)}
        onJoined={(band) => openBand(band, t('bands.join.success', { name: band.name }))}
      />
    </Stack>
  )
}
