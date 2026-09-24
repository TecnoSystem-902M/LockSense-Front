/**
 * Devuelve la ruta del panel según el rol del usuario
 */
export const getRouteByRole = (rolNombre) => {
  const routes = {
    'Superadmin':    '/superadmin',
    'Administrador': '/admin',
    'Usuario':       '/usuario',
  }
  return routes[rolNombre] || '/'
}

/**
 * Devuelve el nombre legible del rol
 */
export const getRoleDisplayName = (rolNombre) => {
  const names = {
    'Superadmin':    'Superadministrador',
    'Administrador': 'Administrador',
    'Usuario':       'Usuario',
  }
  return names[rolNombre] || rolNombre
}