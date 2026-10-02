import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

// Logo e nome dell'app nella barra in alto
export default function BrandLink({ to }) {
  const { t } = useTranslation()

  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit', textDecoration: 'none', minHeight: 44, minWidth: 0 }}
    >
      <LibraryMusicIcon aria-hidden="true" />
      <Typography component="span" variant="h6" noWrap sx={{ fontWeight: 700 }}>
        {t('app.name')}
      </Typography>
    </Box>
  )
}
