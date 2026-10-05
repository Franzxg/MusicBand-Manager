import AddCommentIcon from '@mui/icons-material/AddComment'
import SendIcon from '@mui/icons-material/Send'
import { Alert, Box, Button, CircularProgress, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendChat } from '../api/chat'
import { isNetworkError } from '../api/errors'
import { getLives } from '../api/lives'
import { CHAT_STORAGE_PREFIX } from '../chatStorage'
import useApiData from '../hooks/useApiData'
import SetlistProposalCard from './SetlistProposalCard'

// Limiti dell'API: ultimi 10 messaggi, ognuno fino a 2000 caratteri
const MAX_MESSAGES = 10
const MAX_LENGTH = 2000
const SUGGESTIONS = ['setlist', 'toStudy', 'sameKey']

function errorText(error, t) {
  const status = error.response?.status
  if (status === 503) return t('chat.unavailable')
  if (status === 429) return t('chat.tooMany')
  if (isNetworkError(error)) return t('errors.network')
  return t('errors.generic')
}

function loadMessages(key) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// Chat AI della band: la cronologia resta nel sessionStorage della scheda (cambio di tab o di pagina, refresh)
// e si cancella con "Nuova conversazione", con il logout o chiudendo la scheda. active: tab della chat visibile
export default function ChatWindow({ bandId, active = true }) {
  const { t } = useTranslation()
  const storageKey = CHAT_STORAGE_PREFIX + bandId
  // Live futuri: destinazione delle proposte di scaletta
  const {
    data: lives,
    setData: setLives,
    reload: reloadLives,
  } = useApiData(
    useCallback(() => getLives(bandId), [bandId]),
    [],
  )
  // { role, content, proposal?, proposalState?, savedLiveId? }
  const [messages, setMessages] = useState(() => loadMessages(storageKey))
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const listRef = useRef(null)
  const wasActive = useRef(active)

  useEffect(() => {
    try {
      if (messages.length > 0) sessionStorage.setItem(storageKey, JSON.stringify(messages))
      else sessionStorage.removeItem(storageKey)
    } catch {
      // sessionStorage non disponibile: la cronologia resta solo in memoria
    }
  }, [messages, storageKey])

  // Tornando sulla chat si rileggono i live (potrebbero essere stati creati nel tab Live)
  useEffect(() => {
    if (active && !wasActive.current) reloadLives()
    wasActive.current = active
  }, [active, reloadLives])

  // Ultimo messaggio dell'utente senza risposta: la pagina è stata lasciata durante l'attesa
  const interrupted = !pending && !error && messages.at(-1)?.role === 'user'

  // Mostra sempre l'ultimo messaggio
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages, pending, error, active])

  const request = async (history) => {
    setPending(true)
    setError(null)
    try {
      const payload = history
        .slice(-MAX_MESSAGES)
        .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_LENGTH) }))
      const { reply, setlist_proposal: proposal } = await sendChat(bandId, payload)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: reply || t(proposal ? 'chat.proposal.intro' : 'chat.emptyReply'),
          proposal,
          proposalState: 'open',
        },
      ])
    } catch (err) {
      // Il messaggio dell'utente resta nella chat; si può riprovare
      setError(err)
    } finally {
      setPending(false)
    }
  }

  const send = (text) => {
    const content = text.trim()
    if (!content || pending) return
    const history = [...messages, { role: 'user', content }]
    setMessages(history)
    setInput('')
    request(history)
  }

  const updateMessage = (index, changes) =>
    setMessages((current) => current.map((message, i) => (i === index ? { ...message, ...changes } : message)))

  // Dopo il salvataggio aggiorna il numero di brani del live (per la conferma di sostituzione)
  const onLiveSaved = (saved) =>
    setLives((current) => current.map((live) => (live.id === saved.id ? { ...live, songs_count: saved.songs_count } : live)))

  const reset = () => {
    setMessages([])
    setError(null)
    setInput('')
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // A tutta altezza meno navbar e margini; il campo di scrittura resta in basso
        height: { xs: 'calc(100dvh - 88px)', md: 'calc(100dvh - 128px)' },
        minHeight: 360,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('chat.hint')}
        </Typography>
        <Button startIcon={<AddCommentIcon />} onClick={reset} disabled={pending || messages.length === 0} sx={{ flexShrink: 0 }}>
          {t('chat.newConversation')}
        </Button>
      </Stack>

      <Box ref={listRef} role="log" aria-live="polite" aria-label={t('chat.logLabel')} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.length === 0 && !pending && (
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 2 }}>
            <Typography variant="h3" component="h2">
              {t('chat.emptyTitle')}
            </Typography>
            <Typography color="text.secondary">{t('chat.emptyText')}</Typography>
            <Stack spacing={1} sx={{ width: '100%', maxWidth: 480 }}>
              {SUGGESTIONS.map((key) => (
                <Button key={key} variant="outlined" onClick={() => send(t(`chat.suggestions.${key}`))}>
                  {t(`chat.suggestions.${key}`)}
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        <Stack spacing={1.5}>
          {messages.map((message, index) => {
            const mine = message.role === 'user'
            return (
              <Box key={index} sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: { xs: '92%', sm: '80%' } }}>
                <Typography variant="caption" color="text.secondary" component="p" sx={{ textAlign: mine ? 'right' : 'left' }}>
                  {mine ? t('chat.you') : t('chat.ai')}
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    ...(mine
                      ? { bgcolor: 'primary.main', color: 'primary.contrastText' }
                      : { bgcolor: 'action.hover', color: 'text.primary' }),
                  }}
                >
                  {message.content}
                </Box>
                {message.proposal && (
                  <SetlistProposalCard
                    bandId={bandId}
                    proposal={message.proposal}
                    state={message.proposalState}
                    savedLiveId={message.savedLiveId}
                    lives={lives}
                    onLiveSaved={onLiveSaved}
                    onChange={(changes) =>
                      updateMessage(index, { proposalState: changes.state, savedLiveId: changes.savedLiveId })
                    }
                  />
                )}
              </Box>
            )
          })}
        </Stack>

        {pending && (
          <Stack direction="row" spacing={1} role="status" sx={{ alignItems: 'center', mt: 2 }}>
            <CircularProgress size={20} />
            <Typography color="text.secondary">{t('chat.typing')}</Typography>
          </Stack>
        )}

        {interrupted && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" onClick={() => request(messages)}>
                {t('common.retry')}
              </Button>
            }
          >
            {t('chat.interrupted')}
          </Alert>
        )}

        {error && !pending && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={
              <Button color="inherit" onClick={() => request(messages)}>
                {t('common.retry')}
              </Button>
            }
          >
            {errorText(error, t)}
          </Alert>
        )}
      </Box>

      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault()
          send(input)
        }}
        sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', p: 1.5, borderTop: 1, borderColor: 'divider' }}
      >
        <TextField
          multiline
          maxRows={4}
          size="small"
          label={t('chat.inputLabel')}
          placeholder={t('chat.placeholder')}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            // Invio invia, Maiusc+Invio va a capo
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              send(input)
            }
          }}
          slotProps={{ htmlInput: { maxLength: MAX_LENGTH } }}
        />
        <IconButton type="submit" color="primary" aria-label={t('chat.send')} disabled={pending || !input.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  )
}
