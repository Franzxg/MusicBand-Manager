// Stati di studio delle canzoni (valori dell'API)
export const SONG_STATUSES = ['to_study', 'studying', 'completed']

// Secondi -> "m:ss" (anche oltre l'ora, es. "75:30")
export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds ?? 0))
  const minutes = Math.floor(total / 60)
  const rest = String(total % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}

// "m:ss" o "mm:ss" -> secondi; null se il formato non è valido
export function parseDuration(text) {
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(text.trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export const emptySongForm = {
  title: '',
  artist: '',
  version: '',
  duration: '',
  musical_key: '',
  energy: null,
  bpm: '',
  link: '',
  status: 'to_study',
  notes: '',
}

// Canzone dell'API -> valori del form
export function songToForm(song) {
  return {
    title: song.title,
    artist: song.artist,
    version: song.version ?? '',
    duration: formatDuration(song.duration_seconds),
    musical_key: song.musical_key ?? '',
    energy: song.energy,
    bpm: song.bpm ? String(song.bpm) : '',
    link: song.link ?? '',
    status: song.status,
    notes: song.notes ?? '',
  }
}

// Valori del form -> body per l'API (campi vuoti come null)
export function formToPayload(values) {
  const orNull = (text) => text.trim() || null
  return {
    title: values.title,
    artist: values.artist,
    version: values.version.trim(),
    duration_seconds: parseDuration(values.duration),
    musical_key: orNull(values.musical_key),
    energy: values.energy || null,
    bpm: values.bpm.trim() ? Number(values.bpm) : null,
    link: orNull(values.link),
    status: values.status,
    notes: orNull(values.notes),
  }
}

// Durata scritta male: errore sotto il campo senza chiamare l'API (vuota: ci pensa l'API)
export function durationError(values, t) {
  return values.duration.trim() && parseDuration(values.duration) === null
    ? { duration_seconds: t('songs.fields.durationInvalid') }
    : null
}
