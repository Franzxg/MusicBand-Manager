import { Alert, Button, Link, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import AuthCard from '../components/AuthCard'
import useApiErrorHandler from '../hooks/useApiErrorHandler'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await forgotPassword({ email })
      setSent(true)
    } catch (error) {
      handleError(error, setErrors)
    }
    setSubmitting(false)
  }

  return (
    <AuthCard title={t('auth.forgot.title')} intro={sent ? undefined : t('auth.forgot.intro')}>
      {sent ? (
        // Conferma generica: non rivela se l'email è registrata
        <Stack spacing={2}>
          <Alert severity="success">{t('auth.forgot.sent')}</Alert>
          <Link component={RouterLink} to="/login">
            {t('auth.links.backToLogin')}
          </Link>
        </Stack>
      ) : (
        <Stack component="form" onSubmit={submit} noValidate spacing={2}>
          <TextField
            name="email"
            type="email"
            label={t('fields.email')}
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {t('auth.forgot.submit')}
          </Button>
          <Link component={RouterLink} to="/login" sx={{ pt: 1 }}>
            {t('auth.links.backToLogin')}
          </Link>
        </Stack>
      )}
    </AuthCard>
  )
}
