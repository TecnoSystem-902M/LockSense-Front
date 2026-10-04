import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import { logout } from '../../api/auth'
import '../../styles/admin/AdminLayout.css'

export default function AdminLayout() {
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
      // Borra la sesión local y manda al login
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className={`ls-admin ${menuAbierto ? 'ls-menu-abierto' : 'ls-menu-cerrado'}`}>
      <Sidebar
        abierto={menuAbierto}
        onCerrar={cerrarMenu}
        onCerrarSesion={manejarCerrarSesion}
      />

      <main className="ls-admin-main">
        <header className="ls-admin-header">
          <button
            type="button"
            className="ls-admin-menu-btn"
            onClick={alternarMenu}
            aria-label={menuAbierto ? 'Ocultar menú' : 'Mostrar menú'}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? <X size={23} /> : <Menu size={23} />}
          </button>

          <span className="ls-admin-header-title">
            Panel de administración
          </span>

          <span className="ls-dashboard-status">
            <span className="ls-status-dot"></span>
            Sistema de administración
          </span>
        </header>

        <section className="ls-admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}