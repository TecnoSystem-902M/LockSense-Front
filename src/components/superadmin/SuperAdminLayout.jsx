import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './SidebarSuperAd'
import { logout } from '../../api/auth'
import { cerrarSesionLocal } from '../../utils/session'
import '../../styles/superadmin/SuperAdminLayout.css'

export default function SuperAdminLayout() {
  const navigate = useNavigate()

  const [menuAbierto, setMenuAbierto] = useState(
    () => window.innerWidth > 767.98
  )

  const alternarMenu = () => {
    setMenuAbierto((actual) => !actual)
  }

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  const manejarCerrarSesion = async () => {
    try {
      // Avisa al servidor para invalidar el token
      await logout()
    } catch {
      // Si falla (sin red, token ya vencido), igual cerramos localmente
    } finally {
      // Borra la sesión local (localStorage y sessionStorage) y manda al login
      cerrarSesionLocal()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className={`ls-superadmin-layout ${menuAbierto ? 'ls-superadmin-menu-abierto' : 'ls-superadmin-menu-cerrado'}`}>
      <Sidebar
        abierto={menuAbierto}
        onCerrar={cerrarMenu}
        onCerrarSesion={manejarCerrarSesion}
      />

      <main className="ls-superadmin-main">
        <header className="ls-superadmin-header">
          <button
            type="button"
            className="ls-superadmin-menu-btn"
            onClick={alternarMenu}
            aria-label={menuAbierto ? 'Ocultar menú' : 'Mostrar menú'}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? <X size={23} /> : <Menu size={23} />}
          </button>

          <span className="ls-superadmin-header-title">
            Panel de Superadministrador
          </span>

          <span className="ls-superadmin-status">
            <span className="ls-superadmin-status-dot"></span>
            Sistema de administración
          </span>
        </header>

        <section className="ls-superadmin-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}