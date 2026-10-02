import { TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateBand } from '../api/bands'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import FormDialog from './FormDialog'

// Modifica di nome e genere; il componente si monta solo quando la finestra è aperta
export default function EditBandDialog({ band, onClose, onSaved }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const [values, setValues] = useState({ name: band.name, genre: band.genre ?? '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    setErrors({})
    try {
      onSaved(await updateBand(band.id, { name: values.name, genre: values.genre.trim() || null }))
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  return (
    <FormDialog open onClose={onClose} title={t('band.edit.title')} onSubmit={submit} submitting={submitting}>
      <TextField
        name="name"
        label={t('fields.bandName')}
        value={values.name}
        onChange={(event) => setValues({ ...values, name: event.target.value })}
        error={Boolean(errors.name)}
        helperText={errors.name}
        slotProps={{ htmlInput: { maxLength: 100 } }}
        autoFocus
        required
      />
      <TextField
        name="genre"
        label={t('fields.genre')}
        value={values.genre}
        onChange={(event) => setValues({ ...values, genre: event.target.value })}
        error={Boolean(errors.genre)}
        helperText={errors.genre}
        slotProps={{ htmlInput: { maxLength: 50 } }}
      />
    </FormDialog>
  )
}
