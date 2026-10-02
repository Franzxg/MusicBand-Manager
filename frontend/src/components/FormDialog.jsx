import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

// Finestra con form: a schermo intero su xs. extraActions va a sinistra (es. "Elimina")
export default function FormDialog({ open, onClose, title, onSubmit, submitLabel, submitting, extraActions, children }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const titleId = useId()

  const submit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby={titleId}
    >
      <form onSubmit={submit} noValidate>
        <DialogTitle id={titleId}>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {children}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          {extraActions}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Button onClick={onClose} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitLabel ?? t('common.save')}
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  )
}
