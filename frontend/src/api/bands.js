import client from './client'

// Le risorse arrivano avvolte in { data }
const unwrap = (r) => r.data.data

export const getBands = () => client.get('/bands').then(unwrap)

export const createBand = (data) => client.post('/bands', data).then(unwrap)

export const joinBand = (data) => client.post('/bands/join', data).then(unwrap)

export const getBand = (bandId) => client.get(`/bands/${bandId}`).then(unwrap)

export const updateBand = (bandId, data) => client.patch(`/bands/${bandId}`, data).then(unwrap)

export const deleteBand = (bandId) => client.delete(`/bands/${bandId}`)

export const regenerateInviteCode = (bandId) => client.post(`/bands/${bandId}/invite-code`).then(unwrap)

export const updateMyInstruments = (bandId, instruments) =>
  client.put(`/bands/${bandId}/me/instruments`, { instruments }).then(unwrap)

// Con il proprio id l'utente esce dalla band
export const removeMember = (bandId, userId) => client.delete(`/bands/${bandId}/members/${userId}`)
