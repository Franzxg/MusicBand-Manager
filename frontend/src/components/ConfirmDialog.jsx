import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

// Conferma di un'azione; danger usa il rosso di errore (eliminazioni)
export default function ConfirmDialog({ open, onClose, onConfirm, title, text, confirmLabel, danger = true, loading }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const titleId = useId()
  const textId = useId()

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={textId}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id={textId}>{text}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={danger ? 'error' : 'primary'} disabled={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
