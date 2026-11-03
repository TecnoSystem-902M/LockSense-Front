import { useNavigate } from 'react-router-dom'
import { logout } from '../../api/auth'
import { cerrarSesionLocal, obtenerUsuario } from '../../utils/session'

/**
 * Panel del usuario (rol USUARIO) — versión provisional.
 *
 * Destino tras un registro facial exitoso o al iniciar sesión un usuario que
 * ya tiene rostro activo. De momento es una pantalla simple; el contenido
 * (casilleros del usuario, etc.) se añadirá en fases posteriores.
 */
export default function PanelUsuario() {
  const navigate = useNavigate()
  const usuario = obtenerUsuario()

  const handleCerrarSesion = async () => {
    try {
      await logout()
    } catch {
      // Si falla, igual cerramos la sesión local.
    } finally {
      cerrarSesionLocal()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="fr-page">
      <header className="fr-topbar">
        <div className="fr-brand">
          <i className="fa-solid fa-lock"></i>
          <span>LockSense</span>
        </div>
        <div className="fr-topbar-user">
          {usuario?.nombre && <span className="fr-user-name">{usuario.nombre}</span>}
          <button type="button" className="fr-logout" onClick={handleCerrarSesion}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main className="auth-page fr-main">
        <div className="auth-container">
          <section className="auth-info">
            <h1>
              Hola, <span>{usuario?.nombre || 'usuario'}</span>
            </h1>
            <p>
              Este es tu panel. Pronto podrás consultar y abrir tus casilleros desde aquí.
            </p>
          </section>

          <section className="auth-card">
            <div className="auth-card-header">
              <div className="auth-title-icon">
                <i className="fa-solid fa-box"></i>
              </div>
              <div>
                <h2>Tus casilleros</h2>
                <p>Aún no hay información para mostrar</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
