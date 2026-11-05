import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import UsuarioSidebar from './UsuarioSidebar'
import '../../styles/Usuarios/UsuarioLayout.css'

export default function UsuarioLayout() {
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
    <div
      className={`ls-usuario-layout ${
        menuAbierto ? 'ls-usuario-menu-abierto' : 'ls-usuario-menu-cerrado'
      }`}
    >
      <UsuarioSidebar
        abierto={menuAbierto}
        onCerrar={cerrarMenu}
      />

      {menuAbierto && window.innerWidth <= 767.98 && (
        <button
          type="button"
          className="ls-usuario-overlay"
          onClick={() => setMenuAbierto(false)}
          aria-label="Cerrar navegación"
        />
      )}

      <main className="ls-usuario-main">
        <header className="ls-usuario-header">
          <button
            type="button"
            className="ls-usuario-menu-btn"
            onClick={alternarMenu}
            aria-label={menuAbierto ? 'Ocultar menú' : 'Mostrar menú'}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? <X size={23} /> : <Menu size={23} />}
          </button>

          <span className="ls-usuario-header-title">
            Panel de usuario
          </span>

          <span className="ls-usuario-status">
            <span className="ls-usuario-status-dot"></span>
            Usuario
          </span>
        </header>

        <section className="ls-usuario-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}