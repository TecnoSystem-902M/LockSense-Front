import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getRouteByRole } from '../utils/roleRoutes'

/**
 * Protege rutas en el frontend según la sesión local (token + user).
 *
 * Reglas:
 * - Sin token o sin user válido en localStorage -> redirige a /login.
 * - Con `rolPermitido`: si el rol del usuario no coincide (sin distinguir
 *   mayúsculas/minúsculas), se redirige a la ruta que le corresponde a su
 *   rol mediante getRouteByRole, evitando bucles de redirección.
 *
 * NOTA: Esta protección es solo del lado del cliente (UX). No sustituye la
 * autorización del backend.
 */
export default function ProtectedRoute({ rolPermitido }) {
  const location = useLocation()

  const token = localStorage.getItem('token')
  const rawUser = localStorage.getItem('user')

  // 1. Debe existir token y user
  if (!token || !rawUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 2. El user debe ser un JSON válido
  let user
  try {
    user = JSON.parse(rawUser)
  } catch {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!user || typeof user !== 'object') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 3. Comprobación de rol (opcional por ruta)
  if (rolPermitido) {
    const rolUsuario = (user.rol || '').toString().trim().toUpperCase()
    const rolEsperado = rolPermitido.toString().trim().toUpperCase()

    if (rolUsuario !== rolEsperado) {
      const rutaDeSuRol = getRouteByRole(user.rol)

      // Evitar bucle: si su ruta es la actual (o no resuelve a otra), no redirigir en bucle
      if (rutaDeSuRol && rutaDeSuRol !== location.pathname) {
        return <Navigate to={rutaDeSuRol} replace />
      }

      // Si no hay una ruta válida distinta para su rol, enviar a login
      if (!rutaDeSuRol || rutaDeSuRol === '/') {
        return <Navigate to="/login" replace />
      }
    }
  }

  return <Outlet />
}
