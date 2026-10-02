import client from './client'

const unwrap = (r) => r.data.data

// Senza from l'API restituisce solo le prove future
export const getRehearsals = (bandId, params) => client.get(`/bands/${bandId}/rehearsals`, { params }).then(unwrap)

export const createRehearsal = (bandId, data) => client.post(`/bands/${bandId}/rehearsals`, data).then(unwrap)

export const updateRehearsal = (rehearsalId, data) => client.patch(`/rehearsals/${rehearsalId}`, data).then(unwrap)

export const deleteRehearsal = (rehearsalId) => client.delete(`/rehearsals/${rehearsalId}`)
