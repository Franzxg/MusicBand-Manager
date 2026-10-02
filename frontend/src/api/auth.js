import client from './client'

// Le risposte di register e login sono { token, user }
export const register = (data) => client.post('/register', data).then((r) => r.data)

export const login = (data) => client.post('/login', data).then((r) => r.data)

export const logout = () => client.post('/logout')

export const forgotPassword = (data) => client.post('/forgot-password', data).then((r) => r.data)

export const resetPassword = (data) => client.post('/reset-password', data).then((r) => r.data)

export const getMe = () => client.get('/me').then((r) => r.data.data)
