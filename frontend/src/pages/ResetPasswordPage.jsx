import { Alert, Button, Link, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'
import AuthCard from '../components/AuthCard'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useNotification from '../hooks/useNotification'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''
  const [values, setValues] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await resetPassword({ token, email, ...values })
      notify(t('auth.reset.success'), 'success')
      navigate('/login', { replace: true })
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  // Link senza token o email: non si può procedere
  if (!token || !email) {
    return (
      <AuthCard title={t('auth.reset.title')}>
        <Stack spacing={2}>
          <Alert severity="warning">{t('auth.reset.invalidLink')}</Alert>
          <Link component={RouterLink} to="/forgot-password">
            {t('auth.links.newLink')}
          </Link>
        </Stack>
      </AuthCard>
    )
  }

  return (
    <AuthCard title={t('auth.reset.title')} intro={t('auth.reset.intro', { email })}>
      <Stack component="form" onSubmit={submit} noValidate spacing={2}>
        {/* token scaduto o non valido: l'API restituisce l'errore sul campo email */}
        {(errors.email || errors.token) && (
          <Alert
            severity="error"
            action={
              <Button component={RouterLink} to="/forgot-password" color="inherit" size="small">
                {t('auth.links.newLink')}
              </Button>
            }
          >
            {errors.email ?? errors.token}
          </Alert>
        )}
        <TextField
          name="password"
          type="password"
          label={t('fields.newPassword')}
          autoComplete="new-password"
          value={values.password}
          onChange={change}
          error={Boolean(errors.password)}
          helperText={errors.password ?? t('auth.register.passwordHelp')}
          required
        />
        <TextField
          name="password_confirmation"
          type="password"
          label={t('fields.newPasswordConfirmation')}
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={change}
          error={Boolean(errors.password_confirmation)}
          helperText={errors.password_confirmation}
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {t('auth.reset.submit')}
        </Button>
        <Link component={RouterLink} to="/login" sx={{ pt: 1 }}>
          {t('auth.links.backToLogin')}
        </Link>
      </Stack>
    </AuthCard>
  )
}
