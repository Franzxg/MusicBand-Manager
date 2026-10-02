import { Button, Link, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useAuth from '../hooks/useAuth'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const handleError = useApiErrorHandler()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await login(values)
      // torna alla pagina protetta richiesta prima del login
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title={t('auth.login.title')} intro={t('auth.login.intro')}>
      <Stack component="form" onSubmit={submit} noValidate spacing={2}>
        <TextField
          name="email"
          type="email"
          label={t('fields.email')}
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={change}
          error={Boolean(errors.email)}
          helperText={errors.email}
          required
        />
        <TextField
          name="password"
          type="password"
          label={t('fields.password')}
          autoComplete="current-password"
          value={values.password}
          onChange={change}
          error={Boolean(errors.password)}
          helperText={errors.password}
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {t('auth.login.submit')}
        </Button>
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Link component={RouterLink} to="/forgot-password">
            {t('auth.links.forgot')}
          </Link>
          <Link component={RouterLink} to="/register">
            {t('auth.links.register')}
          </Link>
          <Link component={RouterLink} to="/guide">
            {t('auth.links.guide')}
          </Link>
        </Stack>
      </Stack>
    </AuthCard>
  )
}
