import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LockKeyhole, LogOut } from 'lucide-react'
import logo from '../../assets/logo.jpeg'
import '../../styles/admin/Sidebar.css'

const opcionesPrincipales = [
  {
    nombre: 'Dashboard',
    ruta: '/admin',
    Icono: LayoutDashboard,
  },
]

const opcionesAdministracion = [
  {
    nombre: 'Usuarios',
    ruta: '/admin/usuarios',
    Icono: Users,
  },
  {
    nombre: 'Casilleros',
    ruta: '/admin/casilleros',
    Icono: LockKeyhole,
  },
]

export default function Sidebar({ abierto, onCerrar, onCerrarSesion }) {
  const navigate = useNavigate()

  const manejarCerrarSesion = () => {
    if (onCerrarSesion) {
      onCerrarSesion()
    } else {
      navigate('/login')
    }
    onCerrar?.()
  }

  const renderLink = ({ nombre, ruta, Icono }) => (
    <NavLink
      key={ruta}
      to={ruta}
      end={ruta === '/admin'}
      className={({ isActive }) =>
        `ls-sidebar-link ${isActive ? 'activo' : ''}`
      }
      onClick={onCerrar}
    >
      <Icono size={20} strokeWidth={1.6} />
      <span>{nombre}</span>
    </NavLink>
  )

  return (
    <>
      {abierto && (
        <div
          className="ls-sidebar-overlay"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <aside className={`ls-sidebar ${abierto ? 'ls-sidebar-abierto' : ''}`}>
        <div className="ls-sidebar-header">
          <div className="ls-sidebar-logo-icon">
            <img src={logo} alt="LockSense" className="ls-sidebar-logo-image" />
          </div>
          <h2 className="ls-sidebar-titulo">LockSense</h2>
          <span className="ls-sidebar-rol">Administrador</span>
        </div>

        <div className="ls-sidebar-scroll">
          <nav className="ls-sidebar-nav">
            {opcionesPrincipales.map(renderLink)}

            <p className="ls-sidebar-seccion">Administración</p>

            {opcionesAdministracion.map(renderLink)}
          </nav>

          <button
            type="button"
            className="ls-sidebar-logout"
            onClick={manejarCerrarSesion}
          >
            <LogOut size={20} strokeWidth={1.6} />
            <span>Cerrar sesión</span>
          </button>
        </div>

        <div className="ls-sidebar-footer">
          <p>© 2026 LockSense.</p>
          <p>Todos los derechos reservados.</p>
        </div>
      </aside>
    </>
  )
}