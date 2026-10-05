import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Alert, Box, Button, CircularProgress, Link, Stack, Tab, Tabs, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { deleteBand } from '../api/bands'
import ChatWindow from '../components/ChatWindow'
import ConfirmDialog from '../components/ConfirmDialog'
import EditBandDialog from '../components/EditBandDialog'
import EventsTab from '../components/EventsTab'
import MembersTab from '../components/MembersTab'
import SongsTab from '../components/SongsTab'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useBand from '../hooks/useBand'
import useNotification from '../hooks/useNotification'
import { fadeIn } from '../theme/theme'

const TABS = ['members', 'songs', 'lives', 'rehearsals', 'chat']

// Dettaglio band: intestazione con modifica ed eliminazione, tab scelto da ?tab=
export default function BandPage() {
  const { t } = useTranslation()
  const { bandId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const handleError = useApiErrorHandler()
  const { band, setBand, loading, error, reload } = useBand(bandId)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'members'

  const remove = async () => {
    setDeleting(true)
    try {
      await deleteBand(band.id)
      notify(t('band.delete.success', { name: band.name }), 'success')
      navigate('/', { replace: true })
    } catch (err) {
      handleError(err)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading && !band) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label={t('common.loading')} />
      </Box>
    )
  }

  if (error) {
    // 403 e 404: band inesistente o di cui l'utente non è membro
    const notFound = [403, 404].includes(error.response?.status)
    return (
      <Alert
        severity="error"
        action={
          notFound ? undefined : (
            <Button color="inherit" onClick={reload}>
              {t('common.retry')}
            </Button>
          )
        }
      >
        {notFound ? t('band.notFound') : t('band.loadError')}{' '}
        <Link component={RouterLink} to="/">
          {t('notFound.toDashboard')}
        </Link>
      </Alert>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 1, ml: -1 }}>
          {t('band.back')}
        </Button>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1" sx={{ wordBreak: 'break-word' }}>
              {band.name}
            </Typography>
            {band.genre && <Typography color="text.secondary">{band.genre}</Typography>}
          </Box>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
              {t('band.edit.button')}
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmDelete(true)}>
              {t('band.delete.button')}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Tabs
        value={tab}
        onChange={(_event, value) => setSearchParams({ tab: value }, { replace: true })}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={t('band.tabsLabel')}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((value) => (
          <Tab key={value} value={value} label={t(`band.tabs.${value}`)} id={`tab-${value}`} aria-controls={`panel-${value}`} />
        ))}
      </Tabs>

      <Box key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} sx={fadeIn}>
        {tab === 'members' && <MembersTab band={band} setBand={setBand} />}
        {tab === 'songs' && <SongsTab bandId={band.id} />}
        {tab === 'lives' && <EventsTab key="live" kind="live" bandId={band.id} />}
        {tab === 'rehearsals' && <EventsTab key="rehearsal" kind="rehearsal" bandId={band.id} />}
        {tab === 'chat' && <ChatWindow bandId={band.id} />}
      </Box>

      {editing && (
        <EditBandDialog
          band={band}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setBand(updated)
            setEditing(false)
            notify(t('band.edit.success'), 'success')
          }}
        />
      )}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title={t('band.delete.title')}
        text={t('band.delete.text', { name: band.name })}
        confirmLabel={t('band.delete.confirm')}
        loading={deleting}
      />
    </Stack>
  )
}
