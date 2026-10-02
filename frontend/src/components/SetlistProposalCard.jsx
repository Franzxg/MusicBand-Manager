import { Alert, Box, Button, Link, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { replaceSetlist } from '../api/lives'
import { formatDateTime } from '../dates'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useNotification from '../hooks/useNotification'
import { formatDuration } from '../songs'
import ConfirmDialog from './ConfirmDialog'

// Proposta di scaletta della chat: brani, durata reale (dall'API), live di destinazione, salva o scarta.
// state: 'open' | 'saved' | 'discarded'; onChange aggiorna lo stato nel messaggio
export default function SetlistProposalCard({ bandId, proposal, state, savedLiveId, lives, onLiveSaved, onChange }) {
  const { t } = useTranslation()
  const { notify } = useNotification()
  const handleError = useApiErrorHandler()
  // Default: il prossimo live (i live arrivano ordinati dal più vicino)
  const [liveId, setLiveId] = useState(lives[0]?.id ?? '')
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)

  if (state === 'discarded') {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        {t('chat.proposal.discarded')}
      </Typography>
    )
  }

  const selectedLive = lives.find((live) => live.id === liveId)

  const save = async () => {
    setSaving(true)
    try {
      const live = await replaceSetlist(liveId, proposal.song_ids, proposal.notes)
      onLiveSaved(live)
      onChange({ state: 'saved', savedLiveId: live.id })
      notify(t('chat.proposal.saved'), 'success')
    } catch (err) {
      handleError(err)
    } finally {
      setSaving(false)
      setConfirming(false)
    }
  }

  const requestSave = () => (selectedLive?.songs_count > 0 ? setConfirming(true) : save())

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
      <Typography variant="h3" component="p" sx={{ fontSize: '1.1rem', mb: 1 }}>
        {t('chat.proposal.title')}
      </Typography>
      <Box component="ol" sx={{ m: 0, pl: 3 }}>
        {proposal.songs.map((song) => (
          <Box component="li" key={song.id} sx={{ mb: 0.5 }}>
            <Typography component="span" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
              {song.title}
            </Typography>
            <Typography component="span" color="text.secondary" variant="body2" sx={{ wordBreak: 'break-word' }}>
              {' – '}
              {song.artist}
              {song.version ? ` (${song.version})` : ''}
              {' · '}
              {song.musical_key || t('chat.proposal.noKey')}
              {' · '}
              {song.duration_seconds ? formatDuration(song.duration_seconds) : '–'}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ mt: 1, fontWeight: 700 }}>
        {t('chat.proposal.total', { duration: formatDuration(proposal.total_duration_seconds) })}
      </Typography>
      {proposal.notes && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
          {t('chat.proposal.notes', { notes: proposal.notes })}
        </Typography>
      )}

      {state === 'saved' ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          {t('chat.proposal.savedIn')}{' '}
          <Link component={RouterLink} to={`/bands/${bandId}/lives/${savedLiveId}`}>
            {t('chat.proposal.openLive')}
          </Link>
        </Alert>
      ) : lives.length === 0 ? (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Alert severity="info">{t('chat.proposal.noLives')}</Alert>
          <Button onClick={() => onChange({ state: 'discarded' })} sx={{ alignSelf: 'flex-start' }}>
            {t('chat.proposal.discard')}
          </Button>
        </Stack>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, alignItems: { sm: 'center' } }}>
          <TextField
            select
            size="small"
            label={t('chat.proposal.targetLive')}
            value={liveId}
            onChange={(event) => setLiveId(event.target.value)}
            sx={{ flex: 1, minWidth: 0 }}
          >
            {lives.map((live) => (
              <MenuItem key={live.id} value={live.id}>
                {formatDateTime(live.starts_at)} – {live.place}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={requestSave} disabled={saving || !liveId}>
            {t('chat.proposal.save')}
          </Button>
          <Button onClick={() => onChange({ state: 'discarded' })} disabled={saving}>
            {t('chat.proposal.discard')}
          </Button>
        </Stack>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={save}
        title={t('chat.proposal.replaceTitle')}
        text={t('chat.proposal.replaceText', { count: selectedLive?.songs_count ?? 0 })}
        confirmLabel={t('chat.proposal.replaceConfirm')}
        danger={false}
        loading={saving}
      />
    </Paper>
  )
}
