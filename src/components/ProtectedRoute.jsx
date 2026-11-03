import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getRouteByRole } from '../utils/roleRoutes'
import { obtenerToken, obtenerUsuario } from '../utils/session'

/**
 * Protege rutas en el frontend según la sesión local (token + user).
 *
 * Reglas:
 * - Sin token o sin user válido -> redirige a /login.
 * - Con `rolPermitido`: si el rol del usuario no coincide (sin distinguir
 *   mayúsculas/minúsculas), se redirige a la ruta de su rol.
 *
 * NOTA: Esta protección es solo del lado del cliente (UX). No sustituye la
 * autorización del backend.
 */
export default function ProtectedRoute({ rolPermitido }) {
  const location = useLocation()

  const token = obtenerToken()
  const user = obtenerUsuario()

  // 1. Debe existir token y user válido
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 2. Comprobación de rol (opcional por ruta)
  if (rolPermitido) {
    const rolUsuario = (user.rol || '').toString().trim().toUpperCase()
    const rolEsperado = rolPermitido.toString().trim().toUpperCase()

    if (rolUsuario !== rolEsperado) {
      const rutaDeSuRol = getRouteByRole(user.rol)

      if (rutaDeSuRol && rutaDeSuRol !== '/' && rutaDeSuRol !== location.pathname) {
        return <Navigate to={rutaDeSuRol} replace />
      }

      return <Navigate to="/login" replace />
    }
  }

  return <Outlet />
}