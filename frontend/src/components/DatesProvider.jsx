import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { enUS, itIT } from '@mui/x-date-pickers/locales'
import useLanguage from '../hooks/useLanguage'

const localeTexts = {
  it: itIT.components.MuiLocalizationProvider.defaultProps.localeText,
  en: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
}

// Localizzazione dei date picker di MUI X nella lingua scelta
export default function DatesProvider({ children }) {
  const { language } = useLanguage()

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language} localeText={localeTexts[language]}>
      {children}
    </LocalizationProvider>
  )
}
