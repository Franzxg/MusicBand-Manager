import SaveIcon from '@mui/icons-material/Save'
import { Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateLive } from '../api/lives'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useNotification from '../hooks/useNotification'

// Note del live e note della scaletta (notes e setlist_notes), salvate insieme
export default function LiveNotes({ live, onSaved }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const { notify } = useNotification()
  const [values, setValues] = useState({ notes: live.notes ?? '', setlist_notes: live.setlist_notes ?? '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const changed = values.notes !== (live.notes ?? '') || values.setlist_notes !== (live.setlist_notes ?? '')

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const saved = await updateLive(live.id, {
        notes: values.notes.trim() || null,
        setlist_notes: values.setlist_notes.trim() || null,
      })
      notify(t('live.notesSaved'), 'success')
      onSaved(saved)
    } catch (error) {
      handleError(error, setErrors)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Paper variant="outlined" component="section" aria-labelledby="notes-title" sx={{ p: 2 }}>
      <Typography variant="h3" component="h2" id="notes-title" sx={{ mb: 2 }}>
        {t('live.notesTitle')}
      </Typography>
      <Stack component="form" onSubmit={save} noValidate spacing={2}>
        <TextField
          name="notes"
          label={t('live.notes')}
          value={values.notes}
          onChange={(event) => setValues({ ...values, notes: event.target.value })}
          error={Boolean(errors.notes)}
          helperText={errors.notes ?? t('live.notesHelp')}
          multiline
          minRows={2}
        />
        <TextField
          name="setlist_notes"
          label={t('live.setlistNotes')}
          value={values.setlist_notes}
          onChange={(event) => setValues({ ...values, setlist_notes: event.target.value })}
          error={Boolean(errors.setlist_notes)}
          helperText={errors.setlist_notes ?? t('live.setlistNotesHelp')}
          multiline
          minRows={2}
        />
        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving || !changed} sx={{ alignSelf: 'flex-start' }}>
          {t('live.saveNotes')}
        </Button>
      </Stack>
    </Paper>
  )
}
