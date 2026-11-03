
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, UserRound, LogOut } from 'lucide-react'
import { logout } from '../../api/auth'
import {
  cerrarSesionLocal,
  obtenerUsuario,
} from '../../utils/session'

import UsuarioSidebar from './UsuarioSidebar'
import '../../styles/Usuarios/UsuarioLayout.css'

export default function UsuarioLayout() {
  const [menuAbierto, setMenuAbierto] = useState(
    () => window.innerWidth > 767.98
  )

  const navigate = useNavigate()
  const usuario = obtenerUsuario()

  const alternarMenu = () => {
    setMenuAbierto(actual => !actual)
  }

  const cerrarMenu = () => {
    if (window.innerWidth <= 767.98) {
      setMenuAbierto(false)
    }
  }

  const handleCerrarSesion = async () => {
    try {
      await logout()
    } catch {
      // La sesión local también debe cerrarse si falla la petición.
    } finally {
      cerrarSesionLocal()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div
      className={`ls-usuario-layout ${
        menuAbierto
          ? 'ls-usuario-menu-abierto'
          : 'ls-usuario-menu-cerrado'
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

      <div className="ls-usuario-contenido">
        <header className="ls-usuario-header">
          <div className="ls-usuario-header-titulo">
            <button
              type="button"
              className="ls-usuario-menu-btn"
              onClick={alternarMenu}
              aria-label={
                menuAbierto
                  ? 'Ocultar navegación'
                  : 'Mostrar navegación'
              }
              aria-expanded={menuAbierto}
            >
              <Menu size={23} />
            </button>

            <div>
              <h1>Panel de Usuario</h1>
              <p>Monitoreo del casillero y actividad</p>
            </div>
          </div>

          <div className="ls-usuario-header-derecha">
            <div className="ls-usuario-identidad">
              <UserRound size={19} />
              <span>Usuario</span>
            </div>

            <span className="ls-usuario-nombre">
              {usuario?.nombre || 'Mi cuenta'}
            </span>

            <button
              type="button"
              className="ls-usuario-logout"
              onClick={handleCerrarSesion}
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="ls-usuario-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
