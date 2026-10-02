import { TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createBand } from '../api/bands'
import { arrayFieldError } from '../api/errors'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import FormDialog from './FormDialog'
import InstrumentsField from './InstrumentsField'

const empty = { name: '', genre: '', instruments: [] }

// Nuova band: nome, genere e strumenti di chi la crea
export default function CreateBandDialog({ open, onClose, onCreated }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    setValues(empty)
    setErrors({})
    onClose()
  }

  const submit = async () => {
    setSubmitting(true)
    setErrors({})
    try {
      const band = await createBand({ ...values, genre: values.genre.trim() || null })
      setValues(empty)
      onCreated(band)
    } catch (error) {
      handleError(error, setErrors)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={close}
      title={t('bands.create.title')}
      onSubmit={submit}
      submitLabel={t('bands.create.submit')}
      submitting={submitting}
    >
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
      <InstrumentsField
        value={values.instruments}
        onChange={(instruments) => setValues({ ...values, instruments })}
        error={arrayFieldError(errors, 'instruments')}
      />
    </FormDialog>
  )
}
