import itLocale from '@fullcalendar/core/locales/it'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import { Alert, Box, Button, LinearProgress, useMediaQuery } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { palette as colors } from '../theme/theme'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getCalendar } from '../api/calendar'
import { getRehearsals } from '../api/rehearsals'
import useApiErrorHandler from '../hooks/useApiErrorHandler'
import useLanguage from '../hooks/useLanguage'
import useNotification from '../hooks/useNotification'
import EventDialog from './EventDialog'

// Calendario aggregato di live (pieni) e prove (contorno) di tutte le band dell'utente
export default function EventCalendar() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const theme = useTheme()
  const navigate = useNavigate()
  const handleError = useApiErrorHandler()
  const { notify } = useNotification()
  const calendarRef = useRef(null)
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'))
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [rehearsal, setRehearsal] = useState(null)

  const { palette } = theme
  const dark = palette.mode === 'dark'

  // Sorgente degli eventi: FullCalendar passa l'intervallo visibile
  const fetchEvents = useCallback(
    (info, success, failure) => {
      setFailed(false)
      getCalendar(info.start.toISOString(), info.end.toISOString())
        .then((events) =>
          success(
            events.map((event) => ({
              id: `${event.type}-${event.id}`,
              title: `${t(`calendar.${event.type}`)}: ${event.band.name}`,
              start: event.starts_at,
              classNames: [`event-${event.type}`],
              extendedProps: event,
            })),
          ),
        )
        .catch((error) => {
          setFailed(true)
          failure(error)
        })
    },
    [t],
  )

  // Griglia: ora su una riga e tipo con band sotto; elenco: anche il luogo
  const renderEvent = (arg) =>
    arg.view.type === 'listMonth' ? (
      `${arg.event.title} · ${arg.event.extendedProps.place}`
    ) : (
      <Box component="span" sx={{ display: 'block', px: 0.5, overflowWrap: 'anywhere' }}>
        <Box component="span" sx={{ display: 'block', fontWeight: 700 }}>
          {arg.timeText}
        </Box>
        {arg.event.title}
      </Box>
    )

  const refetch = () => calendarRef.current?.getApi().refetchEvents()

  const openEvent = async ({ event }) => {
    const data = event.extendedProps
    if (data.type === 'live') {
      navigate(`/bands/${data.band.id}/lives/${data.id}`)
      return
    }
    // L'evento del calendario non ha le note: si legge la prova dall'elenco della band
    try {
      const list = await getRehearsals(data.band.id, { from: data.starts_at })
      const found = list.find((item) => item.id === data.id)
      if (found) setRehearsal({ ...found, bandName: data.band.name })
      else {
        notify(t('errors.generic'), 'error')
        refetch()
      }
    } catch (error) {
      handleError(error)
    }
  }

  const closeRehearsal = (message) => {
    setRehearsal(null)
    if (message) {
      notify(message, 'success')
      refetch()
    }
  }

  return (
    <Box>
      {failed && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" onClick={refetch}>
              {t('common.retry')}
            </Button>
          }
        >
          {t('calendar.error')}
        </Alert>
      )}
      <Box sx={{ height: 4, mb: 1 }}>{loading && <LinearProgress aria-label={t('common.loading')} />}</Box>
      <Box
        sx={{
          // Variabili di FullCalendar con i colori del tema
          '--fc-border-color': palette.divider,
          '--fc-page-bg-color': palette.background.paper,
          '--fc-neutral-bg-color': alpha(palette.secondary.main, 0.15),
          '--fc-list-event-hover-bg-color': alpha(palette.secondary.main, 0.25),
          '--fc-today-bg-color': alpha(palette.secondary.main, 0.25),
          '--fc-button-bg-color': colors.steel,
          '--fc-button-border-color': colors.steel,
          '--fc-button-text-color': colors.white,
          '--fc-button-hover-bg-color': dark ? colors.night : colors.ink,
          '--fc-button-hover-border-color': colors.steel,
          '--fc-button-active-bg-color': dark ? colors.night : colors.ink,
          '--fc-button-active-border-color': colors.steel,
          '& .fc': { color: palette.text.primary },
          '& .fc a': { color: 'inherit' },
          '& .fc .fc-toolbar': { flexWrap: 'wrap', gap: 1 },
          '& .fc .fc-toolbar-title': { fontSize: { xs: '1.1rem', sm: '1.4rem' } },
          '& .fc .fc-button': { minHeight: 44, minWidth: 44, fontFamily: 'inherit' },
          '& .fc .fc-event': { cursor: 'pointer' },
          // Live pieni, prove solo con il contorno
          '& .fc .event-live': {
            '--fc-event-bg-color': palette.primary.main,
            '--fc-event-border-color': palette.primary.main,
            '--fc-event-text-color': palette.primary.contrastText,
            fontWeight: 700,
          },
          '& .fc .event-rehearsal': {
            '--fc-event-bg-color': 'transparent',
            '--fc-event-border-color': palette.primary.main,
            '--fc-event-text-color': palette.text.primary,
          },
          '& .fc .fc-daygrid-event': { whiteSpace: 'normal', borderWidth: 2 },
          '& .fc .fc-list-day-cushion': { backgroundColor: alpha(palette.secondary.main, 0.2) },
          '& .fc .event-rehearsal .fc-list-event-dot': { borderWidth: 2, width: 10, height: 10 },
        }}
      >
        <FullCalendar
          key={isPhone ? 'list' : 'grid'}
          ref={calendarRef}
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView={isPhone ? 'listMonth' : 'dayGridMonth'}
          headerToolbar={
            isPhone
              ? { left: 'prev,next', center: 'title', right: 'today' }
              : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' }
          }
          locales={[itLocale]}
          locale={language}
          height="auto"
          events={fetchEvents}
          eventDisplay="block"
          eventInteractive
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventContent={renderEvent}
          eventClick={openEvent}
          loading={setLoading}
          noEventsContent={t('calendar.empty')}
          buttonText={{ today: t('calendar.todayButton'), month: t('calendar.month'), list: t('calendar.list') }}
          buttonHints={{ prev: t('calendar.prev'), next: t('calendar.next'), today: t('calendar.today') }}
        />
      </Box>
      {rehearsal && (
        <EventDialog
          kind="rehearsal"
          event={rehearsal}
          bandName={rehearsal.bandName}
          onClose={() => closeRehearsal()}
          onSaved={() => closeRehearsal(t('rehearsal.saved'))}
          onDeleted={() => closeRehearsal(t('rehearsal.deleted'))}
        />
      )}
    </Box>
  )
}
