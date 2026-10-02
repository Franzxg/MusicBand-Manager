import client from './client'

// from e to in ISO 8601 (UTC), estremi inclusi
export const getCalendar = (from, to) => client.get('/calendar', { params: { from, to } }).then((r) => r.data.data)
