import api from './client'

// Notificaciones push de anomalías (ver PushController en Laravel).

export const obtenerClavePublica = async () => {
  const { data } = await api.get('/push/clave-publica')
  return data.clave_publica
}

// suscripcion = lo que da el navegador con subscription.toJSON()
export const guardarSuscripcion = async (suscripcion) => {
  const { data } = await api.post('/push/suscripcion', suscripcion)
  return data
}