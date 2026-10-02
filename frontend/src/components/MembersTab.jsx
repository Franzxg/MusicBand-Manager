import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Box, Button, Chip, Divider, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { regenerateInviteCode, removeMember } from '../api/bands'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useAuth from '../hooks/useAuth'
import useNotification from '../hooks/useNotification'
import ConfirmDialog from './ConfirmDialog'
import InstrumentsDialog from './InstrumentsDialog'

// Tab Membri: codice di invito, elenco dei membri, strumenti propri, rimozione e uscita
export default function MembersTab({ band, setBand }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { notify } = useNotification()
  const handleError = useApiErrorHandler()
  const navigate = useNavigate()
  const [editingInstruments, setEditingInstruments] = useState(false)
  // Azione da confermare: { type: 'regenerate' | 'remove' | 'leave', member? }
  const [confirm, setConfirm] = useState(null)
  const [working, setWorking] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(band.invite_code)
      notify(t('members.invite.copied'), 'success')
    } catch {
      notify(t('members.invite.copyError'), 'error')
    }
  }

  const runConfirmed = async () => {
    setWorking(true)
    try {
      if (confirm.type === 'regenerate') {
        setBand(await regenerateInviteCode(band.id))
        notify(t('members.invite.regenerated'), 'success')
      } else if (confirm.type === 'remove') {
        await removeMember(band.id, confirm.member.id)
        setBand({
          ...band,
          members: band.members.filter((member) => member.id !== confirm.member.id),
          members_count: band.members_count - 1,
        })
        notify(t('members.remove.success', { name: confirm.member.name }), 'success')
      } else {
        await removeMember(band.id, user.id)
        notify(t('members.leave.success', { name: band.name }), 'success')
        navigate('/', { replace: true })
        return
      }
      setConfirm(null)
    } catch (error) {
      handleError(error)
      setConfirm(null)
    } finally {
      setWorking(false)
    }
  }

  const confirmTexts = {
    regenerate: {
      title: t('members.invite.regenerateTitle'),
      text: t('members.invite.regenerateText'),
      label: t('members.invite.regenerate'),
      danger: false,
    },
    remove: {
      title: t('members.remove.title'),
      text: t('members.remove.text', { name: confirm?.member?.name ?? '' }),
      label: t('members.remove.confirm'),
      danger: true,
    },
    leave: {
      title: t('members.leave.title'),
      text: band.members_count <= 1 ? t('members.leave.lastText') : t('members.leave.text'),
      label: t('members.leave.confirm'),
      danger: true,
    },
  }
  const current = confirm ? confirmTexts[confirm.type] : null

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" component="section" aria-labelledby="invite-title" sx={{ p: 2 }}>
        <Typography variant="h3" component="h2" id="invite-title">
          {t('members.invite.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('members.invite.help')}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Typography
            component="p"
            sx={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.15em' }}
          >
            {band.invite_code}
          </Typography>
          <IconButton onClick={copyCode} aria-label={t('members.invite.copy')}>
            <ContentCopyIcon />
          </IconButton>
          <Button startIcon={<RefreshIcon />} onClick={() => setConfirm({ type: 'regenerate' })}>
            {t('members.invite.regenerate')}
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" component="section" aria-labelledby="members-title">
        <Typography variant="h3" component="h2" id="members-title" sx={{ p: 2, pb: 1 }}>
          {t('members.title', { count: band.members_count })}
        </Typography>
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {band.members.map((member, index) => {
            const isMe = member.id === user?.id
            return (
              <Fragment key={member.id}>
                {index > 0 && <Divider component="li" aria-hidden />}
                <Box
                  component="li"
                  sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, px: 2, py: 1.5 }}
                >
                  <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                      {isMe ? t('members.me', { name: member.name }) : member.name}
                    </Typography>
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {member.instruments.map((instrument) => (
                        <Chip key={instrument} label={instrument} size="small" />
                      ))}
                    </Stack>
                  </Box>
                  {isMe ? (
                    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Button startIcon={<EditIcon />} onClick={() => setEditingInstruments(true)}>
                        {t('members.instruments.edit')}
                      </Button>
                      <Button color="error" startIcon={<LogoutIcon />} onClick={() => setConfirm({ type: 'leave' })}>
                        {t('members.leave.button')}
                      </Button>
                    </Stack>
                  ) : (
                    <IconButton
                      color="error"
                      onClick={() => setConfirm({ type: 'remove', member })}
                      aria-label={t('members.remove.button', { name: member.name })}
                    >
                      <PersonRemoveIcon />
                    </IconButton>
                  )}
                </Box>
              </Fragment>
            )
          })}
        </Box>
      </Paper>

      {editingInstruments && (
        <InstrumentsDialog
          band={band}
          onClose={() => setEditingInstruments(false)}
          onSaved={(updated) => {
            setBand(updated)
            setEditingInstruments(false)
            notify(t('members.instruments.saved'), 'success')
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirmed}
        title={current?.title}
        text={current?.text}
        confirmLabel={current?.label}
        danger={current?.danger}
        loading={working}
      />
    </Stack>
  )
}
