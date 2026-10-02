import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

// Strumenti: più valori, suggerimenti e testo libero (Invio o uscita dal campo per aggiungere)
export default function InstrumentsField({ value, onChange, error, autoFocus }) {
  const { t } = useTranslation()
  const suggestions = t('instruments.suggestions', { returnObjects: true })

  const change = (_event, newValue) => {
    // Niente valori vuoti né doppioni (senza distinguere maiuscole)
    const cleaned = []
    newValue
      .map((item) => item.trim().slice(0, 50))
      .forEach((item) => {
        if (item && !cleaned.some((other) => other.toLowerCase() === item.toLowerCase())) cleaned.push(item)
      })
    onChange(cleaned.slice(0, 10))
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      autoSelect
      options={Array.isArray(suggestions) ? suggestions : []}
      value={value}
      onChange={change}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('fields.instruments')}
          error={Boolean(error)}
          helperText={error ?? t('instruments.help')}
          autoFocus={autoFocus}
          required
        />
      )}
    />
  )
}
