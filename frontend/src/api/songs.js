import client from './client'

const unwrap = (r) => r.data.data

export const getSongs = (bandId) => client.get(`/bands/${bandId}/songs`).then(unwrap)

export const createSong = (bandId, data) => client.post(`/bands/${bandId}/songs`, data).then(unwrap)

export const updateSong = (songId, data) => client.patch(`/songs/${songId}`, data).then(unwrap)

// Elimina il brano anche da tutte le scalette
export const deleteSong = (songId) => client.delete(`/songs/${songId}`)
