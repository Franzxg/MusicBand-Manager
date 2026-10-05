import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteSong, updateSong } from '../api/songs'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useNotification from '../hooks/useNotification'
import useSongs from '../hooks/useSongs'
import { formatDuration, SONG_STATUSES } from '../songs'
import ConfirmDialog from './ConfirmDialog'
import SongDialog from './SongDialog'
import StatusBadge from './StatusBadge'

// Durata complessiva dei brani (il repertorio è già tutto nel browser, come conteggio e filtri)
const sumDuration = (list) => list.reduce((total, song) => total + song.duration_seconds, 0)

// Link del brano: icona che apre una nuova scheda
function SongLink({ song }) {
  const { t } = useTranslation()
  if (!song.link) return null
  return (
    <IconButton
      component="a"
      href={song.link}
      target="_blank"
      rel="noopener noreferrer"
      size="small"
      aria-label={t('songs.openLink', { title: song.title })}
    >
      <OpenInNewIcon fontSize="small" />
    </IconButton>
  )
}

function SongTitle({ song }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <Typography component="span" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
        {song.title}
        {song.version && (
          <Typography component="span" color="text.secondary" sx={{ fontWeight: 400 }}>
            {` (${song.version})`}
          </Typography>
        )}
      </Typography>
      <SongLink song={song} />
    </Box>
  )
}

function Energy({ value }) {
  const { t } = useTranslation()
  if (!value) return <span>{t('songs.empty')}</span>
  return <Rating value={value} readOnly size="small" aria-label={t('songs.energyLabel', { count: value })} />
}

// Da md: tabella
function SongTable({ songs, actions }) {
  const { t } = useTranslation()
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('songs.fields.title')}</TableCell>
            <TableCell>{t('songs.fields.artist')}</TableCell>
            <TableCell>{t('songs.fields.duration')}</TableCell>
            <TableCell>{t('songs.fields.key')}</TableCell>
            <TableCell>{t('songs.fields.energy')}</TableCell>
            <TableCell>{t('songs.fields.bpm')}</TableCell>
            <TableCell>{t('songs.fields.status')}</TableCell>
            <TableCell align="right">{t('common.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id}>
              <TableCell sx={{ maxWidth: 280 }}>
                <SongTitle song={song} />
                {song.notes && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {song.notes}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{song.artist}</TableCell>
              <TableCell>{formatDuration(song.duration_seconds)}</TableCell>
              <TableCell>{song.musical_key ?? t('songs.empty')}</TableCell>
              <TableCell>
                <Energy value={song.energy} />
              </TableCell>
              <TableCell>{song.bpm ?? t('songs.empty')}</TableCell>
              <TableCell>
                <StatusBadge status={song.status} onChange={(status) => actions.status(song, status)} />
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <IconButton onClick={() => actions.edit(song)} aria-label={t('songs.edit', { title: song.title })}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => actions.remove(song)} aria-label={t('songs.delete.button', { title: song.title })}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// Su smartphone e tablet verticale: righe impilate con dettaglio espandibile
function SongStackItem({ song, actions }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const detailId = `song-detail-${song.id}`

  const detail = [
    [t('songs.fields.key'), song.musical_key],
    [t('songs.fields.bpm'), song.bpm],
  ]

  return (
    <Box component="li" sx={{ px: 2, py: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SongTitle song={song} />
          <Typography variant="body2" color="text.secondary">
            {song.artist} · {formatDuration(song.duration_seconds)}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={detailId}
          aria-label={t(open ? 'songs.hideDetails' : 'songs.showDetails', { title: song.title })}
        >
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Box sx={{ mt: 1 }}>
        <StatusBadge status={song.status} onChange={(status) => actions.status(song, status)} />
      </Box>
      <Collapse in={open} id={detailId}>
        <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.5, mt: 1.5, mb: 1 }}>
          {detail.map(([label, value]) => (
            <Box key={label} sx={{ display: 'contents' }}>
              <Typography component="dt" variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                {value ?? t('songs.empty')}
              </Typography>
            </Box>
          ))}
          <Typography component="dt" variant="body2" color="text.secondary">
            {t('songs.fields.energy')}
          </Typography>
          <Box component="dd" sx={{ m: 0 }}>
            <Energy value={song.energy} />
          </Box>
          {song.notes && (
            <>
              <Typography component="dt" variant="body2" color="text.secondary">
                {t('fields.notes')}
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
                {song.notes}
              </Typography>
            </>
          )}
        </Box>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button startIcon={<EditIcon />} onClick={() => actions.edit(song)}>
            {t('common.edit')}
          </Button>
          <Button color="error" startIcon={<DeleteIcon />} onClick={() => actions.remove(song)}>
            {t('common.delete')}
          </Button>
        </Stack>
      </Collapse>
    </Box>
  )
}

// Tab Repertorio: ricerca per titolo, filtro per stato, aggiunta, modifica, eliminazione e cambio rapido dello stato
export default function SongsTab({ bandId }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const { notify } = useNotification()
  const handleError = useApiErrorHandler()
  const { songs, setSongs, loading, error, reload } = useSongs(bandId)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // null, { song: null } per l'aggiunta, { song } per la modifica
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [working, setWorking] = useState(false)

  const replaceSong = (updated) => setSongs(songs.map((song) => (song.id === updated.id ? updated : song)))

  const actions = {
    edit: (song) => setEditing({ song }),
    remove: (song) => setDeleting(song),
    status: async (song, status) => {
      try {
        replaceSong(await updateSong(song.id, { status }))
      } catch (err) {
        handleError(err)
      }
    },
  }

  const confirmDelete = async () => {
    setWorking(true)
    try {
      await deleteSong(deleting.id)
      setSongs(songs.filter((song) => song.id !== deleting.id))
      notify(t('songs.delete.success', { title: deleting.title }), 'success')
      setDeleting(null)
    } catch (err) {
      handleError(err)
      setDeleting(null)
    } finally {
      setWorking(false)
    }
  }

  const query = search.trim().toLowerCase()
  const visible = songs.filter(
    (song) =>
      (statusFilter === 'all' || song.status === statusFilter) && (!query || song.title.toLowerCase().includes(query)),
  )

  let content
  if (loading) {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress aria-label={t('common.loading')} />
      </Box>
    )
  } else if (error) {
    content = (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={reload}>
            {t('common.retry')}
          </Button>
        }
      >
        {t('songs.loadError')}
      </Alert>
    )
  } else if (songs.length === 0) {
    content = (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography sx={{ mb: 2 }}>{t('songs.emptyList')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing({ song: null })}>
          {t('songs.addFirst')}
        </Button>
      </Paper>
    )
  } else if (visible.length === 0) {
    content = <Typography color="text.secondary">{t('songs.noResults')}</Typography>
  } else if (isDesktop) {
    content = <SongTable songs={visible} actions={actions} />
  } else {
    content = (
      <Paper variant="outlined" component="ul" sx={{ listStyle: 'none', m: 0, p: 0, '& > li + li': { borderTop: 1, borderColor: 'divider' } }}>
        {visible.map((song) => (
          <SongStackItem key={song.id} song={song} actions={actions} />
        ))}
      </Paper>
    )
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'flex-start' } }}>
        <TextField
          type="search"
          label={t('songs.search')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label={t('songs.filter')}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          sx={{ minWidth: { sm: 200 } }}
        >
          <MenuItem value="all">{t('songs.status.all')}</MenuItem>
          {SONG_STATUSES.map((value) => (
            <MenuItem key={value} value={value}>
              {t(`songs.status.${value}`)}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditing({ song: null })}
          sx={{ flexShrink: 0, minHeight: 56 }}
        >
          {t('songs.add')}
        </Button>
      </Stack>
      {!loading && !error && songs.length > 0 && (
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {t('songs.count', { count: visible.length, total: songs.length })}
          {' · '}
          {visible.length === songs.length
            ? t('songs.totalDuration', { duration: formatDuration(sumDuration(songs)) })
            : t('songs.filteredDuration', {
                duration: formatDuration(sumDuration(visible)),
                total: formatDuration(sumDuration(songs)),
              })}
        </Typography>
      )}
      {content}

      {editing && (
        <SongDialog
          song={editing.song}
          bandId={bandId}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            if (editing.song) replaceSong(saved)
            else reload()
            notify(t(editing.song ? 'songs.saved' : 'songs.created', { title: saved.title }), 'success')
            setEditing(null)
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={t('songs.delete.title')}
        text={t('songs.delete.text', { title: deleting?.title ?? '' })}
        confirmLabel={t('common.delete')}
        loading={working}
      />
    </Stack>
  )
}
