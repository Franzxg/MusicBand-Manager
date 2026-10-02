import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getLives } from '../api/lives'
import { getRehearsals } from '../api/rehearsals'
import { formatDateTime } from '../dates'
import useApiData from '../hooks/useApiData'
import useNotification from '../hooks/useNotification'
import { formatDuration } from '../songs'
import EventDialog from './EventDialog'

const loaders = { live: getLives, rehearsal: getRehearsals }

// Tab Live (kind="live") o Prove (kind="rehearsal"): eventi futuri e pulsante "Aggiungi".
// Un live si apre nella sua pagina, una prova in una finestra di modifica
export default function EventsTab({ kind, bandId }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { data: events, loading, error, reload } = useApiData(
    useCallback(() => loaders[kind](bandId), [kind, bandId]),
    [],
  )
  // null, { event: null } per l'aggiunta, { event } per la modifica di una prova
  const [dialog, setDialog] = useState(null)

  const open = (event) => {
    if (kind === 'live') navigate(`/bands/${bandId}/lives/${event.id}`)
    else setDialog({ event })
  }

  const saved = (event) => {
    setDialog(null)
    if (kind === 'live' && !dialog.event) {
      // Nuovo live: si apre la sua pagina per costruire la scaletta
      notify(t('live.created'), 'success')
      navigate(`/bands/${bandId}/lives/${event.id}`)
      return
    }
    notify(t(dialog.event ? `${kind}.saved` : `${kind}.created`), 'success')
    reload()
  }

  const secondary = (event) => {
    const lines = [event.place]
    if (kind === 'live') {
      lines.push(
        t('live.summary', {
          count: event.songs_count,
          duration: formatDuration(event.total_duration_seconds),
          progress: event.progress_percent,
        }),
      )
    } else if (event.notes) {
      lines.push(event.notes)
    }
    return lines.map((line) => (
      <Typography key={line} component="span" variant="body2" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
        {line}
      </Typography>
    ))
  }

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
        {t(`${kind}.loadError`)}
      </Alert>
    )
  } else if (events.length === 0) {
    content = (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ mb: 2 }}>{t(`${kind}.emptyList`)}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ event: null })}>
          {t(`${kind}.addFirst`)}
        </Button>
      </Paper>
    )
  } else {
    content = (
      <Paper variant="outlined">
        <List disablePadding>
          {events.map((event, index) => (
            <ListItemButton key={event.id} divider={index < events.length - 1} onClick={() => open(event)}>
              <ListItemText
                primary={formatDateTime(event.starts_at)}
                secondary={secondary(event)}
                slotProps={{ primary: { sx: { fontWeight: 700 } }, secondary: { component: 'span' } }}
              />
              {kind === 'live' ? <ChevronRightIcon aria-hidden /> : <EditIcon aria-hidden />}
            </ListItemButton>
          ))}
        </List>
      </Paper>
    )
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h3" component="h2">
          {t(`${kind}.upcoming`)}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ event: null })}>
          {t(`${kind}.add`)}
        </Button>
      </Stack>
      {content}

      {dialog && (
        <EventDialog
          kind={kind}
          event={dialog.event}
          bandId={bandId}
          onClose={() => setDialog(null)}
          onSaved={saved}
          onDeleted={
            kind === 'rehearsal'
              ? () => {
                  setDialog(null)
                  notify(t('rehearsal.deleted'), 'success')
                  reload()
                }
              : undefined
          }
        />
      )}
    </Stack>
  )
}
