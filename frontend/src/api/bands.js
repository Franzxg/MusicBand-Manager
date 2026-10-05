import client from './client'

// Le risorse arrivano avvolte in { data }
const unwrap = (r) => r.data.data

// Evento per la Navbar: l'elenco delle band o un nome è cambiato
export const BANDS_CHANGED_EVENT = 'bands:changed'

const changed = (result) => {
  window.dispatchEvent(new Event(BANDS_CHANGED_EVENT))
  return result
}

export const getBands = () => client.get('/bands').then(unwrap)

export const createBand = (data) => client.post('/bands', data).then(unwrap).then(changed)

export const joinBand = (data) => client.post('/bands/join', data).then(unwrap).then(changed)

export const getBand = (bandId) => client.get(`/bands/${bandId}`).then(unwrap)

export const updateBand = (bandId, data) => client.patch(`/bands/${bandId}`, data).then(unwrap).then(changed)

export const deleteBand = (bandId) => client.delete(`/bands/${bandId}`).then(changed)

export const regenerateInviteCode = (bandId) => client.post(`/bands/${bandId}/invite-code`).then(unwrap)

export const updateMyInstruments = (bandId, instruments) =>
  client.put(`/bands/${bandId}/me/instruments`, { instruments }).then(unwrap)

// Con il proprio id l'utente esce dalla band
export const removeMember = (bandId, userId) => client.delete(`/bands/${bandId}/members/${userId}`).then(changed)
