import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { formatDuration } from '../songs'
import StatusBadge from './StatusBadge'

function SetlistRow({ song, index, count, disabled, actions }) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
    disabled,
  })

  return (
    <Box
      component="li"
      ref={setNodeRef}
      sx={{
        // Solo spostamento verticale
        transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
        transition,
        position: 'relative',
        zIndex: isDragging ? 1 : 'auto',
        bgcolor: 'background.paper',
        boxShadow: isDragging ? 6 : 'none',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 1,
        rowGap: 0.5,
        px: 1,
        py: 1,
      }}
    >
      <IconButton
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label={t('setlist.dragHandle', { title: song.title })}
        sx={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <DragIndicatorIcon />
      </IconButton>
      <Typography component="span" sx={{ fontWeight: 700, minWidth: '1.5rem', textAlign: 'right' }} aria-hidden>
        {index + 1}.
      </Typography>
      <Box sx={{ flex: '1 1 160px', minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
          {song.title}
          {song.version && (
            <Typography component="span" color="text.secondary" sx={{ fontWeight: 400 }}>
              {` (${song.version})`}
            </Typography>
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {song.artist} · {formatDuration(song.duration_seconds)}
        </Typography>
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5, ml: 'auto' }}>
        <StatusBadge status={song.status} onChange={(status) => actions.status(song, status)} disabled={disabled} />
        <IconButton
          onClick={() => actions.move(index, index - 1)}
          disabled={disabled || index === 0}
          aria-label={t('setlist.moveUp', { title: song.title })}
        >
          <ArrowUpwardIcon />
        </IconButton>
        <IconButton
          onClick={() => actions.move(index, index + 1)}
          disabled={disabled || index === count - 1}
          aria-label={t('setlist.moveDown', { title: song.title })}
        >
          <ArrowDownwardIcon />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => actions.remove(song)}
          disabled={disabled}
          aria-label={t('setlist.remove', { title: song.title })}
        >
          <PlaylistRemoveIcon />
        </IconButton>
      </Stack>
    </Box>
  )
}

// Scaletta riordinabile: trascinamento con la maniglia (mouse, tocco con breve ritardo, tastiera)
// oppure con i pulsanti sposta su/giù. onReorder riceve i nuovi id in ordine
export default function SetlistEditor({ songs, disabled, onReorder, onStatus, onRemove }) {
  const { t } = useTranslation()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = songs.map((song) => song.id)

  const move = (from, to) => {
    if (to < 0 || to >= ids.length || from === to) return
    onReorder(arrayMove(ids, from, to))
  }

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) move(ids.indexOf(active.id), ids.indexOf(over.id))
  }

  // Annunci per i lettori di schermo durante il trascinamento
  const titleOf = (id) => songs.find((song) => song.id === id)?.title ?? ''
  const positionOf = (id) => ids.indexOf(id) + 1
  const announcements = {
    onDragStart: ({ active }) => t('setlist.a11y.start', { title: titleOf(active.id), position: positionOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over ? t('setlist.a11y.over', { title: titleOf(active.id), position: positionOf(over.id) }) : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t('setlist.a11y.end', { title: titleOf(active.id), position: positionOf(over.id) })
        : t('setlist.a11y.cancel', { title: titleOf(active.id) }),
    onDragCancel: ({ active }) => t('setlist.a11y.cancel', { title: titleOf(active.id) }),
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements, screenReaderInstructions: { draggable: t('setlist.a11y.instructions') } }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Paper
          variant="outlined"
          component="ol"
          aria-label={t('setlist.title')}
          sx={{ listStyle: 'none', m: 0, p: 0, overflow: 'hidden', '& > li + li': { borderTop: 1, borderColor: 'divider' } }}
        >
          {songs.map((song, index) => (
            <SetlistRow
              key={song.id}
              song={song}
              index={index}
              count={songs.length}
              disabled={disabled}
              actions={{ move, status: onStatus, remove: onRemove }}
            />
          ))}
        </Paper>
      </SortableContext>
    </DndContext>
  )
}
