import client from './client'

const unwrap = (r) => r.data.data

// Senza from l'API restituisce solo i live futuri
export const getLives = (bandId, params) => client.get(`/bands/${bandId}/lives`, { params }).then(unwrap)

export const createLive = (bandId, data) => client.post(`/bands/${bandId}/lives`, data).then(unwrap)

// Le funzioni seguenti rispondono con il dettaglio del live (scaletta compresa)
export const getLive = (liveId) => client.get(`/lives/${liveId}`).then(unwrap)

export const updateLive = (liveId, data) => client.patch(`/lives/${liveId}`, data).then(unwrap)

export const deleteLive = (liveId) => client.delete(`/lives/${liveId}`)

// { song_id } per un brano del repertorio, altrimenti i campi di un brano nuovo
export const addLiveSong = (liveId, data) => client.post(`/lives/${liveId}/songs`, data).then(unwrap)

export const reorderLiveSongs = (liveId, songIds) =>
  client.put(`/lives/${liveId}/songs/order`, { song_ids: songIds }).then(unwrap)

export const removeLiveSong = (liveId, songId) => client.delete(`/lives/${liveId}/songs/${songId}`)

export const copySetlist = (liveId, sourceLiveId) =>
  client.post(`/lives/${liveId}/copy-setlist`, { source_live_id: sourceLiveId }).then(unwrap)
