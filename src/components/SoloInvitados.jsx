import { Navigate, Outlet } from 'react-router-dom'
import { getRouteByRole } from '../utils/roleRoutes'
import { haySesion, obtenerUsuario } from '../utils/session'

/**
 * Para páginas públicas (inicio, login, registro).
 * Si ya hay una sesión activa, manda directo al panel de su rol.
 * La verificación es síncrona, así que la página pública no llega a mostrarse.
 */
export default function SoloInvitados() {
  if (haySesion()) {
    const ruta = getRouteByRole(obtenerUsuario()?.rol)
    if (ruta && ruta !== '/') {
      return <Navigate to={ruta} replace />
    }
  }

  return <Outlet />
}