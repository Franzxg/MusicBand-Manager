import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { Chip, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SONG_STATUSES } from '../songs'

// Stato distinto da icona ed etichetta, non solo dal colore
const looks = {
  to_study: { icon: <RadioButtonUncheckedIcon />, variant: 'outlined', color: 'default' },
  studying: { icon: <AutorenewIcon />, variant: 'filled', color: 'secondary' },
  completed: { icon: <CheckCircleIcon />, variant: 'filled', color: 'primary' },
}

// Badge dello stato; con onChange diventa un menu per il cambio rapido
export default function StatusBadge({ status, onChange, disabled }) {
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState(null)
  const look = looks[status]
  const label = t(`songs.status.${status}`)

  if (!onChange) {
    return <Chip icon={look.icon} label={label} variant={look.variant} color={look.color} size="small" />
  }

  const choose = (value) => {
    setAnchor(null)
    if (value !== status) onChange(value)
  }

  return (
    <>
      <Chip
        icon={look.icon}
        label={label}
        variant={look.variant}
        color={look.color}
        onClick={(event) => setAnchor(event.currentTarget)}
        disabled={disabled}
        aria-label={t('songs.status.change', { status: label })}
        aria-haspopup="menu"
        sx={{ minHeight: 44, borderRadius: 22 }}
      />
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {SONG_STATUSES.map((value) => (
          <MenuItem key={value} selected={value === status} onClick={() => choose(value)}>
            <ListItemIcon>{looks[value].icon}</ListItemIcon>
            {t(`songs.status.${value}`)}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
