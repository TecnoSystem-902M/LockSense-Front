import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, History, LogOut } from 'lucide-react'
import logoLockSense from '../../assets/logo.jpeg'
import { cerrarSesion } from '../../api/auth'
import '../../styles/admin/Sidebar.css' // O puedes crear un archivo específico si lo prefieres

/* 
  ÍCONO DE CASILLERO PERSONALIZADO (Estilo Locker Room Vector)
*/
function IconoCasilleroCustom({ size = 20, strokeWidth = 2, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Casillero Izquierdo */}
      <rect x="3" y="2" width="8" height="18" rx="2" />
      <line x1="5.5" y1="5.5" x2="8.5" y2="5.5" />
      <line x1="5.5" y1="7.5" x2="8.5" y2="7.5" />
      <circle cx="9" cy="11" r="0.5" fill="currentColor" />
      <line x1="5" y1="20" x2="5" y2="22" />
      <line x1="9" y1="20" x2="9" y2="22" />

      {/* Casillero Derecho */}
      <rect x="13" y="2" width="8" height="18" rx="2" />
      <line x1="15.5" y1="5.5" x2="18.5" y2="5.5" />
      <line x1="15.5" y1="7.5" x2="18.5" y2="7.5" />
      <circle cx="15" cy="11" r="0.5" fill="currentColor" />
      <line x1="15" y1="20" x2="15" y2="22" />
      <line x1="19" y1="20" x2="19" y2="22" />
    </svg>
  )
}

const opcionesUsuario = [
  {
    nombre: 'Dashboard',
    ruta: '/usuario',
    Icono: BarChart3,
    exacta: true,
  },
  {
    nombre: 'Casillero',
    ruta: '/usuario/casillero',
    Icono: IconoCasilleroCustom,
  },
  {
    nombre: 'Actividad',
    ruta: '/usuario/actividad',
    Icono: History,
  },
]

export default function UsuarioSidebar({ abierto, onCerrar, onCerrarSesion }) {
  const navigate = useNavigate()
  const [saliendo, setSaliendo] = useState(false)

  const manejarCerrarSesion = async () => {
    if (saliendo) return // evita doble clic
    setSaliendo(true)

    await cerrarSesion()  // borra el token en el back y en el navegador
    onCerrarSesion?.()    // por si el componente padre necesita hacer algo más
    onCerrar?.()          // cierra el menú en celular

    // replace: el botón "Atrás" ya no regresa al dashboard
    navigate('/login', { replace: true })
  }

  return (
    <>
      {abierto && (
        <div
          className="ls-usuario-sidebar-overlay"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <aside className={`ls-usuario-sidebar-container ${abierto ? 'ls-usuario-sidebar-abierto' : ''}`}>
        {/* Header con Logo circular, Título y Badge de Usuario */}
        <div className="ls-usuario-sidebar-header">
          <div className="ls-usuario-sidebar-logo-icon">
            <img src={logoLockSense} alt="LockSense" className="ls-usuario-sidebar-logo-image" />
          </div>
          <h2 className="ls-usuario-sidebar-titulo">LockSense</h2>
          <span className="ls-usuario-sidebar-rol">Usuario</span>
        </div>

        {/* Zona con scroll para navegación y botón salir */}
        <div className="ls-usuario-sidebar-scroll">
          <nav className="ls-usuario-sidebar-nav" aria-label="Menú de usuario">
            {opcionesUsuario.map(({ nombre, ruta, Icono, exacta }) => (
              <NavLink
                key={ruta}
                to={ruta}
                end={exacta}
                onClick={onCerrar}
                className={({ isActive }) =>
                  `ls-usuario-sidebar-link ${isActive ? 'activo' : ''}`
                }
              >
                <Icono size={20} strokeWidth={1.6} />
                <span>{nombre}</span>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="ls-usuario-sidebar-logout"
            onClick={manejarCerrarSesion}
            disabled={saliendo}
          >
            <LogOut size={20} strokeWidth={1.6} />
            <span>{saliendo ? 'Cerrando…' : 'Cerrar sesión'}</span>
          </button>
        </div>

        {/* Footer con Copyright */}
        <div className="ls-usuario-sidebar-footer">
          <p>© 2026 LockSense.</p>
          <p>Todos los derechos reservados.</p>
        </div>
      </aside>
    </>
  )
}