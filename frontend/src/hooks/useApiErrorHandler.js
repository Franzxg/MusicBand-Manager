import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getFieldErrors, isNetworkError, isValidationError } from '../api/errors'
import useNotification from './useNotification'

// 422 -> errori sotto i campi (setFieldErrors); rete e altri errori -> Snackbar
export default function useApiErrorHandler() {
  const { t } = useTranslation()
  const { notify } = useNotification()

  return useCallback(
    (error, setFieldErrors) => {
      if (isValidationError(error) && setFieldErrors) {
        setFieldErrors(getFieldErrors(error))
        return
      }
      if (error?.response?.status === 401) return // gestito dal client axios
      notify(isNetworkError(error) ? t('errors.network') : t('errors.generic'), 'error')
    },
    [notify, t],
  )
}
