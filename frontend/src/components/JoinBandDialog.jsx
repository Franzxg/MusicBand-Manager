import { TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { joinBand } from '../api/bands'
import { arrayFieldError } from '../api/errors'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import FormDialog from './FormDialog'
import InstrumentsField from './InstrumentsField'

const empty = { invite_code: '', instruments: [] }

// Ingresso in una band con il codice di invito (8 caratteri)
export default function JoinBandDialog({ open, onClose, onJoined }) {
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
      const band = await joinBand({ ...values, invite_code: values.invite_code.trim().toUpperCase() })
      setValues(empty)
      onJoined(band)
    } catch (error) {
      if (error?.response?.status === 429) setErrors({ invite_code: t('bands.join.tooManyAttempts') })
      else handleError(error, setErrors)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={close}
      title={t('bands.join.title')}
      onSubmit={submit}
      submitLabel={t('bands.join.submit')}
      submitting={submitting}
    >
      <TextField
        name="invite_code"
        label={t('fields.inviteCode')}
        value={values.invite_code}
        onChange={(event) => setValues({ ...values, invite_code: event.target.value })}
        error={Boolean(errors.invite_code)}
        helperText={errors.invite_code ?? t('bands.join.codeHelp')}
        autoComplete="off"
        slotProps={{ htmlInput: { maxLength: 8, autoCapitalize: 'characters', spellCheck: false } }}
        autoFocus
        required
      />
      <InstrumentsField
        value={values.instruments}
        onChange={(instruments) => setValues({ ...values, instruments })}
        error={arrayFieldError(errors, 'instruments')}
      />
    </FormDialog>
  )
}
