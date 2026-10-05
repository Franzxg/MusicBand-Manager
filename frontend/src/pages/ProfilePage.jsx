import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import SaveIcon from '@mui/icons-material/Save'
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { deleteMe, updateMe, updatePassword } from '../api/auth'
import FormDialog from '../components/FormDialog'
import UserAvatar from '../components/UserAvatar'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useAuth from '../hooks/useAuth'
import useNotification from '../hooks/useNotification'

function Section({ id, title, children }) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h3" component="h2" id={id} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  )
}

// Nome ed email (PATCH /me)
function PersonalDataForm({ user, onSaved }) {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const { notify } = useNotification()
  const [values, setValues] = useState({ name: user.name, email: user.email })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const changed = values.name !== user.name || values.email !== user.email
  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      onSaved(await updateMe({ name: values.name.trim(), email: values.email.trim() }))
      notify(t('profile.data.success'), 'success')
    } catch (error) {
      handleError(error, setErrors)
    } finally {
      setSaving(false)
    }
  }

  return (
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
      <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving || !changed} sx={{ alignSelf: 'flex-start' }}>
        {t('common.save')}
      </Button>
    </Stack>
  )
}

const emptyPassword = { current_password: '', password: '', password_confirmation: '' }

// Cambio password (PUT /me/password): il token in uso resta valido
function PasswordForm() {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const { notify } = useNotification()
  const [values, setValues] = useState(emptyPassword)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await updatePassword(values)
      setValues(emptyPassword)
      notify(t('profile.password.success'), 'success')
    } catch (error) {
      handleError(error, setErrors)
    } finally {
      setSaving(false)
    }
  }

  const field = (name, label, autoComplete, help) => (
    <TextField
      name={name}
      type="password"
      label={label}
      autoComplete={autoComplete}
      value={values[name]}
      onChange={change}
      error={Boolean(errors[name])}
      helperText={errors[name] ?? help}
      required
    />
  )

  return (
    <Stack component="form" onSubmit={submit} noValidate spacing={2}>
      {field('current_password', t('profile.password.current'), 'current-password')}
      {field('password', t('profile.password.new'), 'new-password', t('auth.register.passwordHelp'))}
      {field('password_confirmation', t('fields.passwordConfirmation'), 'new-password')}
      <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} sx={{ alignSelf: 'flex-start' }}>
        {t('profile.password.submit')}
      </Button>
    </Stack>
  )
}

// Eliminazione account (DELETE /me) con password in una finestra di conferma
function DeleteAccount() {
  const { t } = useTranslation()
  const handleError = useApiErrorHandler()
  const { notify } = useNotification()
  const { clearSession } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [deleting, setDeleting] = useState(false)

  const close = () => {
    setOpen(false)
    setPassword('')
    setErrors({})
  }

  const submit = async () => {
    setDeleting(true)
    setErrors({})
    try {
      await deleteMe({ password })
      // I token sono già revocati: si chiude solo la sessione locale
      clearSession()
      notify(t('profile.delete.success'), 'success')
      navigate('/login', { replace: true })
    } catch (error) {
      handleError(error, setErrors)
      setDeleting(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary">{t('profile.delete.text')}</Typography>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteForeverIcon />}
        onClick={() => setOpen(true)}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('profile.delete.button')}
      </Button>
      <FormDialog
        open={open}
        onClose={close}
        title={t('profile.delete.confirmTitle')}
        onSubmit={submit}
        submitLabel={t('profile.delete.confirm')}
        submitting={deleting}
        danger
      >
        <Alert severity="warning">{t('profile.delete.warning')}</Alert>
        <TextField
          name="password"
          type="password"
          label={t('fields.password')}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(errors.password)}
          helperText={errors.password}
          required
          autoFocus
        />
      </FormDialog>
    </Stack>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, setUser } = useAuth()

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label={t('common.loading')} />
      </Box>
    )
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Typography variant="h1">{t('profile.title')}</Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
        <UserAvatar name={user.name} size={72} decorative />
        <Typography variant="h2" component="p" sx={{ wordBreak: 'break-word', minWidth: 0 }}>
          {user.name}
        </Typography>
      </Stack>
      <Section id="profile-data" title={t('profile.data.title')}>
        <PersonalDataForm key={user.id} user={user} onSaved={setUser} />
      </Section>
      <Section id="profile-password" title={t('profile.password.title')}>
        <PasswordForm />
      </Section>
      <Section id="profile-delete" title={t('profile.delete.title')}>
        <DeleteAccount />
      </Section>
    </Stack>
  )
}
