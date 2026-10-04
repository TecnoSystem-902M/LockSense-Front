
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, LockKeyhole } from 'lucide-react'
import logo from '../../assets/logo.jpeg'
import '../../styles/admin/Sidebar.css'

const opciones = [
  {
    nombre: 'Dashboard',
    ruta: '/admin',
    Icono: LayoutDashboard,
  },
  {
    nombre: 'Gestión de Usuarios',
    ruta: '/admin/usuarios',
    Icono: Users,
  },
  {
    nombre: 'Administrar Casilleros',
    ruta: '/admin/casilleros',
    Icono: LockKeyhole,
  },
]

export default function Sidebar({ abierto, onCerrar }) {
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
        <div className="ls-sidebar-logo">
          <div className="ls-sidebar-logo-icon">
            <img src={logo} alt="LockSense" className="ls-sidebar-logo-image" />
          </div>
          <span>LOCKSENSE</span>
        </div>

        <nav className="ls-sidebar-nav">
          {opciones.map(({ nombre, ruta, Icono }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={ruta === '/admin'}
              className={({ isActive }) =>
                `ls-sidebar-link ${isActive ? 'activo' : ''}`
              }
              onClick={onCerrar}
            >
              <Icono size={18} />
              <span>{nombre}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ls-sidebar-usuario">
          <div className="ls-sidebar-avatar">A</div>
          <div className="ls-sidebar-datos">
            <strong>Administrador</strong>
            <small>admin@locksense.com</small>
          </div>
        </div>
      </aside>
    </>
  )
}