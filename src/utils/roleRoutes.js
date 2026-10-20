/**
 * Normaliza el nombre del rol a mayúsculas sin espacios,
 * para comparar sin importar mayúsculas/minúsculas ni formato.
 */
const normalizarRol = (rolNombre) =>
  typeof rolNombre === 'string' ? rolNombre.trim().toUpperCase() : ''

/**
 * Devuelve la ruta del panel según el rol del usuario.
 * Acepta el rol en mayúsculas, minúsculas o capitalizado.
 */
export const getRouteByRole = (rolNombre, requiereRostro = false) => {
  // Si el usuario aún no registra su rostro, lo mandamos al flujo de captura facial
  if (requiereRostro) {
    return '/registro-rostro';
  }

  const routes = {
    SUPERADMIN:    '/superadmin',
    ADMINISTRADOR: '/admin',
    USUARIO:       '/usuario',
  }
  return routes[normalizarRol(rolNombre)] || '/'
}

/**
 * Devuelve el nombre legible del rol.
 * Acepta el rol en mayúsculas, minúsculas o capitalizado.
 */
export const getRoleDisplayName = (rolNombre) => {
  const names = {
    SUPERADMIN:    'Superadministrador',
    ADMINISTRADOR: 'Administrador',
    USUARIO:       'Usuario',
  }
  return names[normalizarRol(rolNombre)] || rolNombre
}