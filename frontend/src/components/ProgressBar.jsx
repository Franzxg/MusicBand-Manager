import { Box, LinearProgress, Typography } from '@mui/material'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

// Percentuale di brani completati, così come arriva dall'API (progress_percent)
export default function ProgressBar({ percent }) {
  const { t } = useTranslation()
  const labelId = useId()

  return (
    <Box>
      <Typography id={labelId} variant="body2" sx={{ mb: 0.5 }}>
        {t('setlist.progress', { percent })}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percent}
        aria-labelledby={labelId}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  )
}
