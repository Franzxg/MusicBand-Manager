import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createSong, updateSong } from '../api/songs'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import { durationError, emptySongForm, formToPayload, songToForm } from '../songs'
import FormDialog from './FormDialog'
import SongFields from './SongFields'

// Aggiunta (song assente) o modifica di una canzone del repertorio; montato solo quando aperto
export default function SongDialog({ song, bandId, onClose, onSaved }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const [values, setValues] = useState(song ? songToForm(song) : emptySongForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    const invalid = durationError(values, t)
    if (invalid) {
      setErrors(invalid)
      return
    }
    setSubmitting(true)
    setErrors({})
    try {
      const payload = formToPayload(values)
      onSaved(song ? await updateSong(song.id, payload) : await createSong(bandId, payload))
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  return (
    <FormDialog
      open
      onClose={onClose}
      title={song ? t('songs.editTitle') : t('songs.createTitle')}
      onSubmit={submit}
      submitting={submitting}
    >
      <SongFields values={values} setValues={setValues} errors={errors} autoFocus={!song} />
    </FormDialog>
  )
}
