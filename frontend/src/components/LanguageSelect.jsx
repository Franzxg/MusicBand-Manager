import TranslateIcon from '@mui/icons-material/Translate'
import { Button, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useLanguage from '../hooks/useLanguage'

// Pulsante con menu per scegliere la lingua (navbar e intestazione pubblica)
export default function LanguageSelect() {
  const { t } = useTranslation()
  const { language, setLanguage, languages } = useLanguage()
  const [anchor, setAnchor] = useState(null)

  const choose = (lng) => {
    setLanguage(lng)
    setAnchor(null)
  }

  return (
    <>
      <Button
        color="inherit"
        startIcon={<TranslateIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={`${t('language.label')}: ${t(`language.${language}`)}`}
        aria-haspopup="menu"
        sx={{ color: 'inherit' }}
      >
        {language.toUpperCase()}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {languages.map((lng) => (
          <MenuItem key={lng} selected={lng === language} onClick={() => choose(lng)} lang={lng}>
            {t(`language.${lng}`)}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
