import DeleteIcon from '@mui/icons-material/Delete'
import { Button, TextField } from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteRehearsal, updateRehearsal } from '../api/rehearsals'
import { toApiDate } from '../dates'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import ConfirmDialog from './ConfirmDialog'
import FormDialog from './FormDialog'

// Modifica ed eliminazione di una prova; montato solo quando aperto
export default function RehearsalDialog({ rehearsal, bandName, onClose, onSaved, onDeleted }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const [values, setValues] = useState({
    place: rehearsal.place,
    starts_at: dayjs(rehearsal.starts_at),
    notes: rehearsal.notes ?? '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    setErrors({})
    try {
      const saved = await updateRehearsal(rehearsal.id, {
        place: values.place,
        starts_at: values.starts_at?.isValid() ? toApiDate(values.starts_at) : null,
        notes: values.notes.trim() || null,
      })
      onSaved(saved)
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  const remove = async () => {
    setSubmitting(true)
    try {
      await deleteRehearsal(rehearsal.id)
      onDeleted(rehearsal)
    } catch (error) {
      handleError(error)
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <FormDialog
        open
        onClose={onClose}
        title={bandName ? t('rehearsal.editTitleBand', { band: bandName }) : t('rehearsal.editTitle')}
        onSubmit={submit}
        submitting={submitting}
        extraActions={
          <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmOpen(true)} disabled={submitting}>
            {t('common.delete')}
          </Button>
        }
      >
        <TextField
          name="place"
          label={t('fields.place')}
          value={values.place}
          onChange={(event) => setValues({ ...values, place: event.target.value })}
          error={Boolean(errors.place)}
          helperText={errors.place}
          slotProps={{ htmlInput: { maxLength: 150 } }}
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
        <TextField
          name="notes"
          label={t('fields.notes')}
          value={values.notes}
          onChange={(event) => setValues({ ...values, notes: event.target.value })}
          error={Boolean(errors.notes)}
          helperText={errors.notes}
          multiline
          minRows={3}
        />
      </FormDialog>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        title={t('rehearsal.delete.title')}
        text={t('rehearsal.delete.text')}
        confirmLabel={t('common.delete')}
        loading={submitting}
      />
    </>
  )
}
