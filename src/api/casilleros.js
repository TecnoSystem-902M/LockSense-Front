import api from './client'

// Consulta de casilleros (Etapa 1: monitoreo · Etapa 2: bloqueo · Etapa 3: asignación)
export const listarCasilleros = async () => {
  const { data } = await api.get('/casilleros')
  return data
}

// Etapa 2: bloquear un casillero.
// motivo debe ser 'ADMINISTRATIVO' o 'MANTENIMIENTO'.
export const bloquearCasillero = async (id, motivo) => {
  const { data } = await api.post(`/casilleros/${id}/bloquear`, {
    motivo_bloqueo: motivo,
  })
  return data
}

// Etapa 2: desbloquear un casillero.
export const desbloquearCasillero = async (id) => {
  const { data } = await api.post(`/casilleros/${id}/desbloquear`)
  return data
}

// Etapa 3: usuarios elegibles para asignar a un casillero concreto
// (rol USUARIO, activos, de la organización del casillero).
export const usuariosAsignables = async (id) => {
  const { data } = await api.get(`/casilleros/${id}/usuarios-asignables`)
  return data
}

// Etapa 3: asignar un casillero a un usuario.
export const asignarCasillero = async (id, usuariosId) => {
  const { data } = await api.post(`/casilleros/${id}/asignar`, {
    usuarios_id: usuariosId,
  })
  return data
}

// Etapa 3: consultar la asignación activa (datos del usuario, UID RFID, estados).
export const consultarAsignacion = async (id) => {
  const { data } = await api.get(`/casilleros/${id}/asignacion`)
  return data
}

// Etapa 3: liberar la asignación activa de un casillero.
export const liberarCasillero = async (id) => {
  const { data } = await api.post(`/casilleros/${id}/liberar`)
  return data
}
