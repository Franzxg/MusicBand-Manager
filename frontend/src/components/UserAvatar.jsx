import PersonIcon from '@mui/icons-material/Person'
import { Avatar } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { avatarColors, avatarTextColor } from '../theme/theme'

// Prima lettera della prima e dell'ultima parola, in maiuscolo ("Giulia Demo" -> "GD", "Giulia" -> "G")
function getInitials(name) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  // Array.from per non spezzare a metà i caratteri fuori dal piano base Unicode
  const first = Array.from(words[0])[0]
  const last = words.length > 1 ? Array.from(words.at(-1))[0] : ''
  return (first + last).toLocaleUpperCase()
}

// Colore deterministico: lo stesso nome dà sempre lo stesso colore
function colorFor(name) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)) >>> 0
  return avatarColors[hash % avatarColors.length]
}

// Avatar con le iniziali dell'utente; decorative quando il nome è già scritto accanto
export default function UserAvatar({ name, size = 40, decorative = false }) {
  const { t } = useTranslation()
  const cleanName = (name ?? '').trim()
  const initials = getInitials(cleanName)
  const a11y = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': initials ? t('avatar.label', { name: cleanName }) : t('avatar.anonymous') }

  return (
    <Avatar
      {...a11y}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        fontWeight: 700,
        bgcolor: initials ? colorFor(cleanName) : avatarColors[0],
        color: avatarTextColor,
      }}
    >
      {initials || <PersonIcon sx={{ fontSize: size * 0.6 }} />}
    </Avatar>
  )
}
