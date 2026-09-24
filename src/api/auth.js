import api from './client'

export const register = async (payload) => {
  const { data } = await api.post('/register', payload)
  return data
}

export const verifyEmail = async (email, codigo) => {
  const { data } = await api.post('/verify-email', { email, codigo })
  return data
}

export const resendCode = async (email) => {
  const { data } = await api.post('/resend-code', { email })
  return data
}

// NUEVOS
export const login = async (email, password) => {
  const { data } = await api.post('/login', { email, password })
  return data
}

export const logout = async () => {
  const { data } = await api.post('/logout')
  return data
}

export const me = async () => {
  const { data } = await api.get('/me')
  return data
}

export const forgotPassword = async (email) => {
  const { data } = await api.post('/forgot-password', { email })
  return data
}

export const resetPassword = async ({ email, token, password, password_confirmation }) => {
  const { data } = await api.post('/reset-password', {
    email,
    token,
    password,
    password_confirmation,
  })
  return data
}