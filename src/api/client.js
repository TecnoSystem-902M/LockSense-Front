import axios from 'axios'
import { obtenerToken, cerrarSesionLocal } from '../utils/session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Sanctum con tokens, no cookies
})

// Incluir el token (de localStorage o sessionStorage) en cada petición
api.interceptors.request.use((config) => {
  const token = obtenerToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el token venció o fue revocado, el backend responde 401:
// se limpia la sesión local y se manda al login.
// (No aplica al propio /login, donde 401 = credenciales incorrectas.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const teniaToken = Boolean(error?.config?.headers?.Authorization)

    if (status === 401 && teniaToken && !url.includes('/login')) {
      cerrarSesionLocal()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api