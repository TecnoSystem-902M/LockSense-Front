import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo.jpeg'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Cerrar el menú móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const closeMenu = () => setMobileOpen(false)

  // Funciones auxiliares para verificar qué enlace debe estar activo
  const isActivePath = (path) => location.pathname === path

  const isActiveHash = (hash) => {
    if (location.pathname !== '/') return false
    if (hash === '#top' && (location.hash === '' || location.hash === '#top')) return true
    return location.hash === hash
  }

  return (
    <>
      <header className="navbar">
        <div className="nav-inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="brand-icon">
              <img src={logo} alt="Logo LockSense" />
            </span>
            LockSense
          </Link>

          <nav className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
            <a 
              href="/#top" 
              className={`ripple-link dark-text ${isActiveHash('#top') ? 'active' : ''}`} 
              onClick={closeMenu}
            >
              <span className="divi-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M3 11.5 12 4l9 7.5" />
                  <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
                </svg>
              </span>
              Inicio
            </a>

            <a 
              href="/#que-es" 
              className={`ripple-link dark-text ${isActiveHash('#que-es') ? 'active' : ''}`} 
              onClick={closeMenu}
            >
              <span className="divi-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.3 9.2a2.7 2.7 0 1 1 3.9 2.4c-.9.5-1.5 1.1-1.5 2.2" />
                  <circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />
                </svg>
              </span>
              ¿Qué es LockSense?
            </a>

            <a 
              href="/#funcionalidades" 
              className={`ripple-link dark-text ${isActiveHash('#funcionalidades') ? 'active' : ''}`} 
              onClick={closeMenu}
            >
              <span className="divi-icon">
                <svg viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <circle cx="9" cy="6" r="2" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <circle cx="15" cy="12" r="2" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                  <circle cx="9" cy="18" r="2" />
                </svg>
              </span>
              Funcionalidades
            </a>

            <Link 
              to="/registro" 
              className={`ripple-link dark-text ${isActivePath('/registro') ? 'active' : ''}`} 
              onClick={closeMenu}
            >
              <span className="divi-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" />
                  <line x1="18" y1="8" x2="18" y2="14" />
                  <line x1="15" y1="11" x2="21" y2="11" />
                </svg>
              </span>
              Registro
            </Link>

            <Link 
              to="/login" 
              className={`ripple-link btn-login ${isActivePath('/login') ? 'active' : ''}`} 
              onClick={closeMenu}
            >
              <span className="divi-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="8" cy="15" r="4" />
                  <path d="M11 12 20 3" />
                  <path d="M17 6l3 3" />
                  <path d="M14 9l2.3 2.3" />
                </svg>
              </span>
              Iniciar Sesión
            </Link>
          </nav>

          <button
            className="nav-toggle"
            aria-label="Toggle Navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </header>

      {/* Backdrop oscuro para móvil al abrir el menú */}
      {mobileOpen && <div className="nav-backdrop" onClick={closeMenu}></div>}
    </>
  )
}