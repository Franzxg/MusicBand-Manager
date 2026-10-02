import { Box, FormControl, FormHelperText, FormLabel, MenuItem, Rating, Stack, TextField } from '@mui/material'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { SONG_STATUSES } from '../songs'

// Campi del modello Canzone, usati nel repertorio e per il brano nuovo in scaletta
export default function SongFields({ values, setValues, errors, autoFocus }) {
  const { t } = useTranslation()
  const energyId = useId()
  const set = (field) => (event) => setValues({ ...values, [field]: event.target.value })

  return (
    <>
      <TextField
        name="title"
        label={t('songs.fields.title')}
        value={values.title}
        onChange={set('title')}
        error={Boolean(errors.title)}
        helperText={errors.title}
        slotProps={{ htmlInput: { maxLength: 150 } }}
        autoFocus={autoFocus}
        required
      />
      <TextField
        name="artist"
        label={t('songs.fields.artist')}
        value={values.artist}
        onChange={set('artist')}
        error={Boolean(errors.artist)}
        helperText={errors.artist}
        slotProps={{ htmlInput: { maxLength: 150 } }}
        required
      />
      <TextField
        name="version"
        label={t('songs.fields.version')}
        value={values.version}
        onChange={set('version')}
        error={Boolean(errors.version)}
        helperText={errors.version ?? t('songs.fields.versionHelp')}
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          name="duration"
          label={t('songs.fields.duration')}
          value={values.duration}
          onChange={set('duration')}
          error={Boolean(errors.duration_seconds)}
          helperText={errors.duration_seconds ?? t('songs.fields.durationHelp')}
          placeholder="3:45"
          slotProps={{ htmlInput: { maxLength: 6 } }}
          required
        />
        <TextField
          name="musical_key"
          label={t('songs.fields.key')}
          value={values.musical_key}
          onChange={set('musical_key')}
          error={Boolean(errors.musical_key)}
          helperText={errors.musical_key ?? t('songs.fields.keyHelp')}
          slotProps={{ htmlInput: { maxLength: 10 } }}
        />
        <TextField
          name="bpm"
          type="number"
          label={t('songs.fields.bpm')}
          value={values.bpm}
          onChange={set('bpm')}
          error={Boolean(errors.bpm)}
          helperText={errors.bpm ?? t('songs.fields.bpmHelp')}
          slotProps={{ htmlInput: { min: 30, max: 300, inputMode: 'numeric' } }}
        />
      </Stack>
      <FormControl error={Boolean(errors.energy)}>
        <FormLabel id={energyId}>{t('songs.fields.energy')}</FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
          <Rating
            name="energy"
            value={values.energy}
            onChange={(_event, value) => setValues({ ...values, energy: value })}
            max={5}
            size="large"
            aria-labelledby={energyId}
            getLabelText={(value) => t('songs.energyLabel', { count: value })}
          />
        </Box>
        <FormHelperText>{errors.energy ?? t('songs.fields.energyHelp')}</FormHelperText>
      </FormControl>
      <TextField
        name="link"
        type="url"
        label={t('songs.fields.link')}
        value={values.link}
        onChange={set('link')}
        error={Boolean(errors.link)}
        helperText={errors.link ?? t('songs.fields.linkHelp')}
        placeholder="https://"
        slotProps={{ htmlInput: { maxLength: 500, inputMode: 'url' } }}
      />
      <TextField
        select
        name="status"
        label={t('songs.fields.status')}
        value={values.status}
        onChange={set('status')}
        error={Boolean(errors.status)}
        helperText={errors.status}
      >
        {SONG_STATUSES.map((value) => (
          <MenuItem key={value} value={value}>
            {t(`songs.status.${value}`)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        name="notes"
        label={t('fields.notes')}
        value={values.notes}
        onChange={set('notes')}
        error={Boolean(errors.notes)}
        helperText={errors.notes}
        multiline
        minRows={2}
      />
    </>
  )
}
