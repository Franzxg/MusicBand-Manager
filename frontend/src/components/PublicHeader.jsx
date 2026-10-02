import { AppBar, Box, Button, Toolbar } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import BrandLink from './BrandLink'
import LanguageSelect from './LanguageSelect'
import ThemeToggle from './ThemeToggle'

// Intestazione delle pagine pubbliche: lingua, tema e (se richiesto) link al login
export default function PublicHeader({ showLogin = false }) {
  const { t } = useTranslation()

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <BrandLink to="/login" />
        </Box>
        <LanguageSelect />
        <ThemeToggle />
        {showLogin && (
          <Button color="inherit" component={RouterLink} to="/login" sx={{ color: 'inherit' }}>
            {t('nav.login')}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
