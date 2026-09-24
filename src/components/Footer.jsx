import logo from '../assets/logo.jpeg'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand-icon-lg">
              <img src={logo} alt="Logo LockSense" />
            </span>
          </div>
          <div>
            <h4>Redes sociales</h4>
            <div className="footer-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                    <path d="M14 9h-1.4A1.6 1.6 0 0 0 11 10.6V12h3M11 12v6" />
                  </svg>
                </span>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X">
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="16.3" cy="7.7" r=".9" fill="currentColor" stroke="none" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#" className="ripple-link" style={{ paddingLeft: 0 }}>
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="ripple-link" style={{ paddingLeft: 0 }}>
                  Política de privacidad
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul className="contact-list">
              <li>
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 6l9 7 9-7" />
                  </svg>
                </span>
                contacto@locksense.com
              </li>
              <li>
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9 9 0 0 0 2.8.45 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 6a1 1 0 0 1 1-1h3.3a1 1 0 0 1 1 1 9 9 0 0 0 .45 2.8 1 1 0 0 1-.25 1Z" />
                  </svg>
                </span>
                +52 55 1234 5678
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          Todos los servicios reservados <strong>@LockSense</strong>
        </div>
      </div>
    </footer>
  )
}
