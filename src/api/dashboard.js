import api from './client'

// Obtiene las métricas dinámicas del Dashboard desde el backend
export const getMetrics = async () => {
  const { data } = await api.get('/dashboard/metrics')
  return data
}
