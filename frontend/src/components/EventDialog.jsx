import DeleteIcon from '@mui/icons-material/Delete'
import { Button, TextField } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createLive, deleteLive, updateLive } from '../api/lives'
import { createRehearsal, deleteRehearsal, updateRehearsal } from '../api/rehearsals'
import { toApiDate } from '../dates'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import ConfirmDialog from './ConfirmDialog'
import FormDialog from './FormDialog'

const api = {
  live: { create: createLive, update: updateLive, remove: deleteLive },
  rehearsal: { create: createRehearsal, update: updateRehearsal, remove: deleteRehearsal },
}

// Live o prova: creazione (event assente) o modifica; "Elimina" solo se c'è onDeleted.
// Montato solo quando aperto. withNotes=false nasconde le note (es. pagina del live, dove sono a parte)
export default function EventDialog({ kind, event, bandId, bandName, withNotes = true, onClose, onSaved, onDeleted }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const [values, setValues] = useState({
    place: event?.place ?? '',
    starts_at: event ? dayjs(event.starts_at) : null,
    notes: event?.notes ?? '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    setErrors({})
    const data = {
      place: values.place,
      starts_at: values.starts_at?.isValid() ? toApiDate(values.starts_at) : null,
    }
    if (withNotes) data.notes = values.notes.trim() || null
    try {
      onSaved(event ? await api[kind].update(event.id, data) : await api[kind].create(bandId, data))
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  const remove = async () => {
    setSubmitting(true)
    try {
      await api[kind].remove(event.id)
      onDeleted(event)
    } catch (error) {
      handleError(error)
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }

  const titleKey = event ? 'editTitle' : 'createTitle'

  return (
    <>
      <FormDialog
        open
        onClose={onClose}
        title={bandName ? t(`${kind}.${titleKey}Band`, { band: bandName }) : t(`${kind}.${titleKey}`)}
        onSubmit={submit}
        submitting={submitting}
        extraActions={
          event && onDeleted ? (
            <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmOpen(true)} disabled={submitting}>
              {t('common.delete')}
            </Button>
          ) : undefined
        }
      >
        <TextField
          name="place"
          label={t('fields.place')}
          value={values.place}
          onChange={(e) => setValues({ ...values, place: e.target.value })}
          error={Boolean(errors.place)}
          helperText={errors.place}
          slotProps={{ htmlInput: { maxLength: 150 } }}
          autoFocus={!event}
          required
        />
        <DateTimePicker
          label={t('fields.startsAt')}
          value={values.starts_at}
          onChange={(value) => setValues({ ...values, starts_at: value })}
          slotProps={{
            textField: { fullWidth: true, required: true, error: Boolean(errors.starts_at), helperText: errors.starts_at },
          }}
        />
        {withNotes && (
          <TextField
            name="notes"
            label={t('fields.notes')}
            value={values.notes}
            onChange={(e) => setValues({ ...values, notes: e.target.value })}
            error={Boolean(errors.notes)}
            helperText={errors.notes}
            multiline
            minRows={3}
          />
        )}
      </FormDialog>
      {onDeleted && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={remove}
          title={t(`${kind}.delete.title`)}
          text={t(`${kind}.delete.text`)}
          confirmLabel={t('common.delete')}
          loading={submitting}
        />
      )}
    </>
  )
}
