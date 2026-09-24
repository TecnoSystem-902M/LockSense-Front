import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import banerImg from '../assets/baner.jpeg'

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ============ BANNER ============ */}
      <section className="hero" id="top">
        <span className="hero-corner tr"></span>
        <span className="hero-corner bl"></span>
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-logo">
              <svg viewBox="0 0 24 24" className="hero-logo-icon">
                <path d="M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6l7-3Z" />
                <circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none" />
                <path d="M12 12.6V15" />
              </svg>
              <span>LockSense</span>
            </div>
            <h1>
              Tu casillero, <span>más inteligente</span>
            </h1>
            <p>
              Identifícate mediante RFID/NFC o reconocimiento facial. LockSense verifica tu
              identidad, permite el acceso y vuelve a bloquear el casillero automáticamente
              cuando cierras la puerta.
            </p>
            <a href="#como-funciona" className="btn-primary">
              Cómo funciona <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div className="locker-art">
            <img className="banner-img" src={banerImg} alt="LockSense - casillero inteligente" />
          </div>
        </div>
      </section>

      {/* ============ ¿QUÉ ES LOCKSENSE? ============ */}
      <section className="about" id="que-es">
        <div className="wrap">
          <div className="section-head">
            <h2>¿Qué es LockSense?</h2>
            <p>
              LockSense es un sistema de casilleros inteligentes que combina conectividad,
              identificación segura e inteligencia artificial para proteger tus pertenencias
              sin llaves ni preocupaciones.
            </p>
          </div>
          <div className="card-grid">
            <div className="feature-card">
              <div className="card-icon">
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
                    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-60 12 12)" />
                    <ellipse cx="12" cy="12" rx="9" ry="4" />
                    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
                  </svg>
                </span>
              </div>
              <h3>IoT</h3>
              <p>Casilleros conectados y monitoreados en tiempo real desde cualquier lugar.</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
              </div>
              <h3>Acceso seguro</h3>
              <p>Identificación mediante RFID/NFC y reconocimiento facial para un acceso confiable.</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">
                <span className="divi-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 18h6" />
                    <path d="M10 21h4" />
                    <path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" />
                  </svg>
                </span>
              </div>
              <h3>IA</h3>
              <p>Detección de anomalías y comportamientos inusuales para prevenir accesos indebidos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="how" id="como-funciona">
        <div className="wrap">
          <div className="how-card">
            <div className="how-head">
              <div>
                <h2>¿Cómo funciona LockSense?</h2>
                <p>Accede a tu casillero de forma rápida y segura</p>
              </div>
              <span className="how-copy-icon divi-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <rect x="4" y="4" width="11" height="11" rx="2" />
                </svg>
              </span>
            </div>
            <div className="how-steps">
              {[
                { num: '01', title: 'Identifícate', desc: 'RFID/NFC o reconocimiento facial' },
                { num: '02', title: 'Verificación', desc: 'El sistema valida tu identidad' },
                { num: '03', title: 'Acceso', desc: 'Casillero desbloqueado' },
                { num: '04', title: 'Protección', desc: 'Se bloquea automáticamente' },
              ].map((step) => (
                <div className="how-step" key={step.num}>
                  <div className="step-num">{step.num}</div>
                  <div className="step-title">{step.title}</div>
                  <span className="step-icon divi-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                  <p className="step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FUNCIONALIDADES ============ */}
      <section className="functionalities" id="funcionalidades">
        <div className="wrap">
          <div className="section-head">
            <h2>Funcionalidades</h2>
            <p>Todo lo que necesitas para gestionar el acceso, la seguridad y el monitoreo de tus casilleros.</p>
          </div>
          <div className="func-grid">
            <div className="func-card">
              <div className="func-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="6" y="3" width="10" height="18" rx="1" />
                  <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h3>Acceso inteligente</h3>
              <ul>
                {['RFID/NFC', 'Reconocimiento facial', 'Bloqueo automático'].map((item) => (
                  <li key={item}>
                    <span className="divi-icon">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
                      </svg>
                    </span>{' '}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="func-card">
              <div className="func-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6l7-3Z" />
                </svg>
              </div>
              <h3>Seguridad inteligente</h3>
              <ul>
                {['Detección de anomalías', 'Accesos no autorizados', 'Alarma', 'Bloqueo temporal'].map((item) => (
                  <li key={item}>
                    <span className="divi-icon">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
                      </svg>
                    </span>{' '}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="func-card">
              <div className="func-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                </svg>
              </div>
              <h3>Monitoreo</h3>
              <ul>
                {['Registro de accesos', 'Registro de eventos', 'Estado del casillero', 'Tiempo de apertura'].map(
                  (item) => (
                    <li key={item}>
                      <span className="divi-icon">
                        <svg viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
                        </svg>
                      </span>{' '}
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
