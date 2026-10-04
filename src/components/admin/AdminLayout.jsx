
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'
import '../../styles/admin/AdminLayout.css'

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(
    () => window.innerWidth > 767.98
  )

  const alternarMenu = () => {
    setMenuAbierto((actual) => !actual)
  }

  const cerrarMenu = () => {
    setMenuAbierto(false)
  }

  return (
    <div className={`ls-admin ${menuAbierto ? 'ls-menu-abierto' : 'ls-menu-cerrado'}`}>
      <Sidebar
        abierto={menuAbierto}
        onCerrar={cerrarMenu}
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