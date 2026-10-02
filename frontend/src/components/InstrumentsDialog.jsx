import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateMyInstruments } from '../api/bands'
import { arrayFieldError } from '../api/errors'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import FormDialog from './FormDialog'
import InstrumentsField from './InstrumentsField'

// Modifica dei propri strumenti in una band; montato solo quando aperto
export default function InstrumentsDialog({ band, onClose, onSaved }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const [instruments, setInstruments] = useState(band.my_instruments)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    setErrors({})
    try {
      onSaved(await updateMyInstruments(band.id, instruments))
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  return (
    <FormDialog open onClose={onClose} title={t('members.instruments.title')} onSubmit={submit} submitting={submitting}>
      <InstrumentsField value={instruments} onChange={setInstruments} error={arrayFieldError(errors, 'instruments')} autoFocus />
    </FormDialog>
  )
}
