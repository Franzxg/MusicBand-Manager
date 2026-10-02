import { Alert, MenuItem, TextField } from '@mui/material'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { copySetlist, getLives } from '../api/lives'
import { formatDateTime } from '../dates'
import useApiData from '../hooks/useApiData'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import FormDialog from './FormDialog'

// Tutti i live della band, anche passati
const ALL_LIVES_FROM = '2000-01-01T00:00:00Z'

// Copia la scaletta (e le sue note) da un altro live della band; avvisa se quella attuale verrà sostituita.
// Montato solo quando aperto; onSaved riceve il dettaglio del live
export default function CopySetlistDialog({ live, onClose, onSaved }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const { data: lives, loading, error } = useApiData(
    useCallback(() => getLives(live.band_id, { from: ALL_LIVES_FROM }), [live.band_id]),
    [],
  )
  const [sourceId, setSourceId] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const sources = lives.filter((item) => item.id !== live.id)

  const submit = async () => {
    if (!sourceId) {
      setErrors({ source_live_id: t('setlist.copy.chooseLive') })
      return
    }
    setSubmitting(true)
    setErrors({})
    try {
      onSaved(await copySetlist(live.id, sourceId))
    } catch (err) {
      handleError(err, setErrors)
      setSubmitting(false)
    }
  }

  return (
    <FormDialog
      open
      onClose={onClose}
      title={t('setlist.copy.title')}
      onSubmit={submit}
      submitLabel={t(live.songs_count > 0 ? 'setlist.copy.replace' : 'setlist.copy.submit')}
      submitting={submitting || loading}
    >
      {error && <Alert severity="error">{t('live.loadError')}</Alert>}
      {!loading && !error && sources.length === 0 && <Alert severity="info">{t('setlist.copy.noLives')}</Alert>}
      {live.songs_count > 0 && <Alert severity="warning">{t('setlist.copy.warning', { count: live.songs_count })}</Alert>}
      <TextField
        select
        label={t('setlist.copy.source')}
        value={sourceId}
        onChange={(event) => setSourceId(event.target.value)}
        error={Boolean(errors.source_live_id)}
        helperText={errors.source_live_id}
        disabled={loading || sources.length === 0}
        required
      >
        {sources.map((item) => (
          <MenuItem key={item.id} value={item.id} sx={{ whiteSpace: 'normal' }}>
            {t('setlist.copy.option', { date: formatDateTime(item.starts_at), place: item.place, count: item.songs_count })}
          </MenuItem>
        ))}
      </TextField>
    </FormDialog>
  )
}
