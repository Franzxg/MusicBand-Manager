import { Button, Link, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useAuth from '../hooks/useAuth'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const handleError = useApiErrorHandler()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await register(values)
      navigate('/', { replace: true })
    } catch (error) {
      handleError(error, setErrors)
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title={t('auth.register.title')}>
      <Stack component="form" onSubmit={submit} noValidate spacing={2}>
        <TextField
          name="name"
          label={t('fields.name')}
          autoComplete="name"
          value={values.name}
          onChange={change}
          error={Boolean(errors.name)}
          helperText={errors.name}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          required
        />
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
          label={t('fields.passwordConfirmation')}
          autoComplete="new-password"
          value={values.password_confirmation}
          onChange={change}
          error={Boolean(errors.password_confirmation)}
          helperText={errors.password_confirmation}
          required
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {t('auth.register.submit')}
        </Button>
        <Link component={RouterLink} to="/login" sx={{ pt: 1 }}>
          {t('auth.links.login')}
        </Link>
      </Stack>
    </AuthCard>
  )
}
