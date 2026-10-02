import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/it'
import i18n from './i18n'

// dayjs segue la lingua scelta in i18next
dayjs.locale(i18n.language)
i18n.on('languageChanged', (lng) => dayjs.locale(lng))

// Valore del DateTimePicker (ora locale) -> ISO 8601 in UTC per l'API
export const toApiDate = (value) => (value ? value.toISOString() : null)
