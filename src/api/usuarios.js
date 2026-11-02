import api from './client'

// CRUD de usuarios (reutiliza el cliente Axios existente con Bearer token)

export const listarUsuarios = async () => {
  const { data } = await api.get('/usuarios')
  return data
}

export const crearUsuario = async (payload) => {
  const { data } = await api.post('/usuarios', payload)
  return data
}

export const actualizarUsuario = async (id, payload) => {
  const { data } = await api.put(`/usuarios/${id}`, payload)
  return data
}

export const eliminarUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`)
  return data
}

// Catálogos para el formulario
export const listarRoles = async () => {
  const { data } = await api.get('/roles')
  return data
}

export const listarOrganizaciones = async () => {
  const { data } = await api.get('/organizaciones')
  return data
}
