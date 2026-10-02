import { Alert, Autocomplete, Tab, Tabs, TextField } from '@mui/material'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addLiveSong } from '../api/lives'
import { getSongs } from '../api/songs'
import useApiData from '../hooks/useApiData'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import { durationError, emptySongForm, formatDuration, formToPayload } from '../songs'
import FormDialog from './FormDialog'
import SongFields from './SongFields'

// Aggiunta in fondo alla scaletta: brano del repertorio oppure brano nuovo (creato anche nel repertorio).
// Montato solo quando aperto; onSaved riceve il dettaglio del live
export default function AddSongDialog({ live, onClose, onSaved }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const { data: songs, loading, error } = useApiData(
    useCallback(() => getSongs(live.band_id), [live.band_id]),
    [],
  )
  const [mode, setMode] = useState('repertoire')
  const [selected, setSelected] = useState(null)
  const [values, setValues] = useState(emptySongForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const inSetlist = new Set(live.songs.map((song) => song.id))
  const available = songs.filter((song) => !inSetlist.has(song.id))

  const submit = async () => {
    let data
    if (mode === 'repertoire') {
      if (!selected) {
        setErrors({ song_id: t('setlist.add.chooseSong') })
        return
      }
      data = { song_id: selected.id }
    } else {
      const invalid = durationError(values, t)
      if (invalid) {
        setErrors(invalid)
        return
      }
      data = formToPayload(values)
    }
    setSubmitting(true)
    setErrors({})
    try {
      onSaved(await addLiveSong(live.id, data))
    } catch (err) {
      handleError(err, setErrors)
      setSubmitting(false)
    }
  }

  const label = (song) =>
    `${song.title}${song.version ? ` (${song.version})` : ''} · ${song.artist} · ${formatDuration(song.duration_seconds)}`

  return (
    <FormDialog
      open
      onClose={onClose}
      title={t('setlist.add.title')}
      onSubmit={submit}
      submitLabel={t('setlist.add.submit')}
      submitting={submitting}
    >
      <Tabs
        value={mode}
        onChange={(_event, value) => {
          setMode(value)
          setErrors({})
        }}
        variant="fullWidth"
        aria-label={t('setlist.add.modeLabel')}
      >
        <Tab value="repertoire" label={t('setlist.add.fromRepertoire')} />
        <Tab value="new" label={t('setlist.add.newSong')} />
      </Tabs>
      {mode === 'repertoire' ? (
        <>
          {error && <Alert severity="error">{t('songs.loadError')}</Alert>}
          {!loading && !error && available.length === 0 && (
            <Alert severity="info">{t(songs.length ? 'setlist.add.allAdded' : 'setlist.add.emptyRepertoire')}</Alert>
          )}
          <Autocomplete
            options={available}
            value={selected}
            onChange={(_event, value) => setSelected(value)}
            getOptionLabel={label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loading}
            loadingText={t('common.loading')}
            noOptionsText={t('setlist.add.noOptions')}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('setlist.add.song')}
                error={Boolean(errors.song_id)}
                helperText={errors.song_id ?? t('setlist.add.songHelp')}
                autoFocus
              />
            )}
          />
        </>
      ) : (
        <SongFields values={values} setValues={setValues} errors={errors} autoFocus />
      )}
    </FormDialog>
  )
}
