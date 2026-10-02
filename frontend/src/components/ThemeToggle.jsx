import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import useThemeMode from '../hooks/useThemeMode'

export default function ThemeToggle() {
  const { t } = useTranslation()
  const { mode, toggleMode } = useThemeMode()
  const label = mode === 'dark' ? t('theme.toLight') : t('theme.toDark')

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggleMode} aria-label={label}>
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  )
}
