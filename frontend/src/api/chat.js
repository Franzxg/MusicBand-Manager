import client from './client'

// Risposta: { reply, setlist_proposal } (proposta null se assente); 503 se l'AI non è disponibile
export const sendChat = (bandId, messages, liveId) =>
  client.post(`/bands/${bandId}/chat`, { messages, ...(liveId ? { live_id: liveId } : {}) }).then((r) => r.data)
