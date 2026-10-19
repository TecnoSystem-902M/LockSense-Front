/**
 * Manejo centralizado de la sesión en el navegador.
 *
 * "Recordar mi sesión":
 *   - Marcado    -> localStorage   (sigue activa aunque se cierre el navegador)
 *   - Sin marcar -> sessionStorage (se borra al cerrar el navegador)
 *
 * Todo el proyecto debe leer/escribir la sesión SOLO con estas funciones.
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const almacenes = () => [window.localStorage, window.sessionStorage]

export const guardarSesion = (token, user, recordar = false) => {
  // Limpiar cualquier sesión previa en ambos lugares
  cerrarSesionLocal()

  const almacen = recordar ? window.localStorage : window.sessionStorage
  almacen.setItem(TOKEN_KEY, token)
  almacen.setItem(USER_KEY, JSON.stringify(user))
}

export const obtenerToken = () => {
  for (const almacen of almacenes()) {
    const token = almacen.getItem(TOKEN_KEY)
    if (token) return token
  }
  return null
}

export const obtenerUsuario = () => {
  for (const almacen of almacenes()) {
    const raw = almacen.getItem(USER_KEY)
    if (!raw) continue
    try {
      const user = JSON.parse(raw)
      return user && typeof user === 'object' ? user : null
    } catch {
      return null
    }
  }
  return null
}

export const haySesion = () => Boolean(obtenerToken() && obtenerUsuario())

export const cerrarSesionLocal = () => {
  for (const almacen of almacenes()) {
    almacen.removeItem(TOKEN_KEY)
    almacen.removeItem(USER_KEY)
    almacen.removeItem('usuario') // clave antigua usada por error en el logout
  }
}