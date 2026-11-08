import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { EVENTO_INSTALACION, esAppInstalada, esIOS, instalarApp, puedeInstalar } from './pwa'
import './pwa.css'

// Páginas donde aparece la bolita de descargar.
const RUTAS_CON_BOTON = ['/']

/**
 * Botón flotante "Descargar app" (esquina inferior derecha de la página principal).
 * Se queda fijo al bajar la página.
 * - Android / computadora: abre la ventana nativa de instalación.
 * - iPhone: muestra cómo agregarla a inicio (iOS no tiene botón de instalar).
 * - Si ya está instalada o el navegador no lo permite, no se muestra.
 */
export default function BotonInstalarApp() {
  const location = useLocation()
  const [disponible, setDisponible] = useState(puedeInstalar())
  const [mostrarAyudaIOS, setMostrarAyudaIOS] = useState(false)

  useEffect(() => {
    const actualizar = () => setDisponible(puedeInstalar())
    window.addEventListener(EVENTO_INSTALACION, actualizar)
    return () => window.removeEventListener(EVENTO_INSTALACION, actualizar)
  }, [])

  const ios = esIOS()

  if (!RUTAS_CON_BOTON.includes(location.pathname)) return null
  if (esAppInstalada()) return null
  if (!disponible && !ios) return null

  const alPresionar = async () => {
    if (ios) {
      setMostrarAyudaIOS(true)
      return
    }
    await instalarApp()
  }

  return (
    <>
      <button
        type="button"
        className="ls-pwa-flotante"
        onClick={alPresionar}
        aria-label="Descargar la app de LockSense"
        title="Descargar app"
      >
        <svg className="ls-pwa-flotante-icono" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v11" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 19h14" />
        </svg>
        <span className="ls-pwa-flotante-texto">Descargar app</span>
      </button>

      {mostrarAyudaIOS && (
        <div className="ls-pwa-ios-fondo" onClick={() => setMostrarAyudaIOS(false)}>
          <div className="ls-pwa-ios-ventana" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <img className="ls-pwa-ios-logo" src="/icons/icon-192.png" alt="LockSense" />
            <h3 className="ls-pwa-ios-titulo">Instala LockSense</h3>
            <ol className="ls-pwa-ios-pasos">
              <li>Abre esta página en <strong>Safari</strong>.</li>
              <li>Toca el botón <strong>Compartir</strong> (el cuadro con la flecha hacia arriba).</li>
              <li>Elige <strong>Agregar a inicio</strong>.</li>
            </ol>
            <button type="button" className="ls-pwa-ios-cerrar" onClick={() => setMostrarAyudaIOS(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}