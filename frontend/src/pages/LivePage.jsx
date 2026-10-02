import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Alert, Box, Button, CircularProgress, Link, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { deleteLive, getLive, removeLiveSong, reorderLiveSongs } from '../api/lives'
import { updateSong } from '../api/songs'
import AddSongDialog from '../components/AddSongDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import CopySetlistDialog from '../components/CopySetlistDialog'
import EventDialog from '../components/EventDialog'
import LiveNotes from '../components/LiveNotes'
import ProgressBar from '../components/ProgressBar'
import SetlistEditor from '../components/SetlistEditor'
import { formatDateTime } from '../dates'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useLive from '../hooks/useLive'
import useNotification from '../hooks/useNotification'
import { formatDuration } from '../songs'

// Dettaglio del live: dati, progresso e durata dall'API, scaletta riordinabile e note
export default function LivePage() {
  const { t } = useTranslation()
  const { bandId, liveId } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const handleError = useApiErrorHandler()
  const { live, setLive, loading, error, reload } = useLive(liveId)
  // 'edit' | 'delete' | 'add' | 'copy'
  const [dialog, setDialog] = useState(null)
  const [busy, setBusy] = useState(false)

  const backUrl = `/bands/${bandId}?tab=lives`

  // Esegue una scrittura sulla scaletta; update restituisce il nuovo dettaglio del live
  const run = async (update) => {
    setBusy(true)
    try {
      setLive(await update())
    } catch (err) {
      handleError(err)
      reload()
    } finally {
      setBusy(false)
    }
  }

  const reorder = (songIds) => {
    // Ordine aggiornato subito, poi confermato dall'API
    const byId = new Map(live.songs.map((song) => [song.id, song]))
    setLive({ ...live, songs: songIds.map((id) => byId.get(id)) })
    run(() => reorderLiveSongs(live.id, songIds))
  }

  // Il progresso lo ricalcola l'API: dopo il cambio di stato si rilegge il live
  const changeStatus = (song, status) =>
    run(async () => {
      await updateSong(song.id, { status })
      return getLive(live.id)
    })

  const removeSong = (song) =>
    run(async () => {
      await removeLiveSong(live.id, song.id)
      notify(t('setlist.removed', { title: song.title }), 'success')
      return getLive(live.id)
    })

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await deleteLive(live.id)
      notify(t('live.deleted'), 'success')
      navigate(backUrl, { replace: true })
    } catch (err) {
      handleError(err)
      setBusy(false)
      setDialog(null)
    }
  }

  const closeWith = (message) => (updated) => {
    setLive(updated)
    setDialog(null)
    notify(message, 'success')
  }

  if (loading && !live) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label={t('common.loading')} />
      </Box>
    )
  }

  if (error && !live) {
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
        {notFound ? t('live.notFound') : t('live.loadError')}{' '}
        <Link component={RouterLink} to="/">
          {t('notFound.toDashboard')}
        </Link>
      </Alert>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button component={RouterLink} to={backUrl} startIcon={<ArrowBackIcon />} sx={{ mb: 1, ml: -1 }}>
          {t('live.back', { band: live.band.name })}
        </Button>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1" sx={{ overflowWrap: 'anywhere' }}>
              {live.place}
            </Typography>
            <Typography color="text.secondary">{formatDateTime(live.starts_at)}</Typography>
          </Box>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, flexShrink: 0 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setDialog('edit')}>
              {t('common.edit')}
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDialog('delete')}>
              {t('live.delete.button')}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Paper variant="outlined" component="section" aria-label={t('setlist.summary')} sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} sx={{ alignItems: { sm: 'center' } }}>
          <Box sx={{ flex: 1 }}>
            <ProgressBar percent={live.progress_percent} />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('setlist.totalDuration')}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.4rem' }}>{formatDuration(live.total_duration_seconds)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('setlist.songsCount')}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.4rem' }}>{live.songs_count}</Typography>
          </Box>
        </Stack>
      </Paper>

      <Box component="section" aria-labelledby="setlist-title">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
        >
          <Typography variant="h2" id="setlist-title">
            {t('setlist.title')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog('add')}>
              {t('setlist.add.button')}
            </Button>
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => setDialog('copy')}>
              {t('setlist.copy.button')}
            </Button>
          </Stack>
        </Stack>
        {live.songs.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ mb: 2 }}>{t('setlist.empty')}</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog('add')}>
              {t('setlist.addFirst')}
            </Button>
          </Paper>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('setlist.reorderHelp')}
            </Typography>
            <SetlistEditor
              songs={live.songs}
              disabled={busy}
              onReorder={reorder}
              onStatus={changeStatus}
              onRemove={removeSong}
            />
          </>
        )}
      </Box>

      <LiveNotes key={`${live.notes}|${live.setlist_notes}`} live={live} onSaved={setLive} />

      {dialog === 'edit' && (
        <EventDialog
          kind="live"
          event={live}
          withNotes={false}
          onClose={() => setDialog(null)}
          onSaved={closeWith(t('live.saved'))}
        />
      )}
      {dialog === 'add' && <AddSongDialog live={live} onClose={() => setDialog(null)} onSaved={closeWith(t('setlist.added'))} />}
      {dialog === 'copy' && (
        <CopySetlistDialog live={live} onClose={() => setDialog(null)} onSaved={closeWith(t('setlist.copy.success'))} />
      )}
      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        onConfirm={confirmDelete}
        title={t('live.delete.title')}
        text={t('live.delete.text')}
        confirmLabel={t('common.delete')}
        loading={busy}
      />
    </Stack>
  )
}
