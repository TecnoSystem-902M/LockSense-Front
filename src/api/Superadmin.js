import api from './client'

// Dashboard del superadmin: tarjetas y datos de las dos gráficas.
export const obtenerDashboardSuperAdmin = async () => {
  const { data } = await api.get('/superadmin/dashboard')
  return data
}

// ---------- Organizaciones (CRUD) ----------

export const listarOrganizaciones = async () => {
  const { data } = await api.get('/superadmin/organizaciones')
  return data
}

export const crearOrganizacion = async (payload) => {
  const { data } = await api.post('/superadmin/organizaciones', payload)
  return data
}

export const actualizarOrganizacion = async (id, payload) => {
  const { data } = await api.put(`/superadmin/organizaciones/${id}`, payload)
  return data
}

// estado: 'A' (activa) | 'I' (dada de baja)
export const cambiarEstadoOrganizacion = async (id, estado) => {
  const { data } = await api.patch(`/superadmin/organizaciones/${id}/estado`, { estado })
  return data
}

// ---------- Administradores (CRUD) ----------

export const listarAdministradores = async () => {
  const { data } = await api.get('/superadmin/administradores')
  return data
}

export const crearAdministrador = async (payload) => {
  const { data } = await api.post('/superadmin/administradores', payload)
  return data
}

export const actualizarAdministrador = async (id, payload) => {
  const { data } = await api.put(`/superadmin/administradores/${id}`, payload)
  return data
}

// estado: 'A' (activo) | 'I' (dado de baja)
export const cambiarEstadoAdministrador = async (id, estado) => {
  const { data } = await api.patch(`/superadmin/administradores/${id}/estado`, { estado })
  return data
}

// ---------- Dispositivos (CRUD) ----------

export const listarDispositivos = async () => {
  const { data } = await api.get('/superadmin/dispositivos')
  return data
}

// Organizaciones activas con sus casilleros (para el formulario)
export const opcionesDispositivo = async () => {
  const { data } = await api.get('/superadmin/dispositivos/opciones')
  return data
}

// Devuelve { token, dispositivo }: el token solo se recibe aquí
export const crearDispositivo = async (payload) => {
  const { data } = await api.post('/superadmin/dispositivos', payload)
  return data
}

export const actualizarDispositivo = async (id, payload) => {
  const { data } = await api.put(`/superadmin/dispositivos/${id}`, payload)
  return data
}

// Devuelve { token }: el token nuevo solo se recibe aquí
export const regenerarTokenDispositivo = async (id) => {
  const { data } = await api.post(`/superadmin/dispositivos/${id}/token`)
  return data
}

// estado: 'A' (activo) | 'I' (dado de baja)
export const cambiarEstadoDispositivo = async (id, estado) => {
  const { data } = await api.patch(`/superadmin/dispositivos/${id}/estado`, { estado })
  return data
}