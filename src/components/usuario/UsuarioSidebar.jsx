import { NavLink } from 'react-router-dom'
import {
  BarChart3, // 1. Líneas verticales de estadísticas con grosor estilizado
  History,   // 3. Formato de bitácora o reporte temporal enmarcado
} from 'lucide-react'

// Mantén tu logo importado normalmente
import logoLockSense from '../../assets/logo.jpeg'

/* 
  2. ICONO DE CASILLERO PERSONALIZADO (Estilo Locker Room Vector isolated EPS10)
  Rediseñado con esquinas exteriores suaves, rejillas horizontales simétricas 
  y manijas circulares limpias.
*/
function IconoCasilleroCustom({ size = 20, strokeWidth = 2, ...props }) {
  return (
    <svg
      xmlns="http://w3.org"
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

export default function UsuarioSidebar({ abierto, onCerrar }) {
  const opciones = [
    {
      nombre: 'Dashboard',
      ruta: '/usuario',
      icono: BarChart3,
      exacta: true,
    },
    {
      nombre: 'Casillero',
      ruta: '/usuario/casillero',
      icono: IconoCasilleroCustom, // Renderiza el diseño vectorial limpio
    },
    {
      nombre: 'Actividad',
      ruta: '/usuario/actividad',
      icono: History,
    },
  ]

  return (
    <aside className={`ls-usuario-sidebar ${abierto ? 'ls-usuario-sidebar-abierto' : ''}`}>
      <div className="ls-usuario-brand">
        <div className="ls-usuario-logo">
          <img src={logoLockSense} alt="Logo de LockSense" />
        </div>
        <span>LockSense</span>
      </div>

      <nav className="ls-usuario-nav" aria-label="Menú de usuario">
        {opciones.map(({ nombre, ruta, icono: Icono, exacta }) => (
          <NavLink
            key={ruta}
            to={ruta}
            end={exacta}
            onClick={onCerrar}
            className={({ isActive }) =>
              `ls-usuario-nav-link${isActive ? ' activo' : ''}`
            }
          >
            {/* Los tres iconos adoptan de forma unificada el grosor de trazo de tu primer diseño */}
            <Icono size={20} strokeWidth={2} />
            <span>{nombre}</span>
          </NavLink>
        ))}
      </nav>

      <div className="ls-usuario-sidebar-footer">
        <div className="ls-usuario-avatar">U</div>
        <div className="ls-usuario-footer-text">
          <strong>Usuario</strong>
          <span>LockSense</span>
        </div>
      </div>
    </aside>
  )
}
