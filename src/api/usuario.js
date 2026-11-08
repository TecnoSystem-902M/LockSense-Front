import api from './client'

// Dashboard del usuario: nombre, estado del casillero, accesos del mes y alertas.
export const obtenerDashboard = async () => {
  const { data } = await api.get('/usuario/dashboard')
  return data
}

// Mi casillero: estado de la puerta, últimos 10 accesos y últimos 10 estados.
export const obtenerMiCasillero = async () => {
  const { data } = await api.get('/usuario/casillero')
  return data
}

// Mi actividad: todos los accesos, eventos de su casillero y anomalías de la IA.
export const obtenerMiActividad = async () => {
  const { data } = await api.get('/usuario/actividad')
  return data
}

// Mi comportamiento: horario habitual, días, accesos por día y por hora.
export const obtenerComportamiento = async () => {
  const { data } = await api.get('/usuario/comportamiento')
  return data
}