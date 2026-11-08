import { useEffect, useState } from 'react'
import { BellRing } from 'lucide-react'
import ToastNotification from '../components/ToastNotification'
import { activarAlertas, estadoPermiso, pushSoportado, sincronizarAlertas } from './alertasPush'
import './ModalAlertas.css'

// Si presiona "Ahora no", no se vuelve a mostrar hasta que inicie sesión otra vez.
const CLAVE_POSPUESTO = 'ls-alertas-pospuesto'

/**
 * Modal "Activa las alertas de tu casillero" (dashboard del usuario).
 * Solo aparece si el navegador soporta push y el usuario todavía no
 * ha aceptado ni bloqueado las notificaciones en este dispositivo.
 */
export default function ModalAlertas() {
  const [visible, setVisible] = useState(false)
  const [activando, setActivando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarToast, setMostrarToast] = useState(false)

  useEffect(() => {
    if (!pushSoportado()) return

    // Ya las había aceptado: se vuelve a guardar el dispositivo en silencio.
    if (estadoPermiso() === 'granted') {
      sincronizarAlertas()
      return
    }

    if (estadoPermiso() !== 'default') return    // las bloqueó: no se insiste

    let pospuesto = false
    try {
      pospuesto = sessionStorage.getItem(CLAVE_POSPUESTO) === '1'
    } catch {
      // sin sessionStorage, se muestra igual
    }
    if (pospuesto) return

    // Un segundo después, para no encimarse con el toast de inicio de sesión.
    const temporizador = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(temporizador)
  }, [])

  const ahoraNo = () => {
    try {
      sessionStorage.setItem(CLAVE_POSPUESTO, '1')
    } catch {
      // nada
    }
    setVisible(false)
  }

  const activar = async () => {
    setActivando(true)
    setError('')

    try {
      const aceptadas = await activarAlertas()
      setVisible(false)
      if (aceptadas) setMostrarToast(true)
    } catch (err) {
      setError(err?.message || 'No se pudieron activar las alertas. Intenta de nuevo.')
    } finally {
      setActivando(false)
    }
  }

  return (
    <>
      {mostrarToast && (
        <ToastNotification mensaje="Alertas activadas" onClose={() => setMostrarToast(false)} />
      )}

      {visible && (
        <div className="ls-alertas-fondo" role="presentation">
          <div className="ls-alertas-modal" role="dialog" aria-modal="true" aria-labelledby="ls-alertas-titulo">
            <div className="ls-alertas-icono">
              <BellRing size={30} />
            </div>

            <h2 id="ls-alertas-titulo" className="ls-alertas-titulo">
              Activa las alertas de tu casillero
            </h2>
            <p className="ls-alertas-texto">
              Te avisaremos al instante en este dispositivo si detectamos algo sospechoso
              en tu casillero, como un acceso inusual o un intento de apertura.
            </p>

            {error && <p className="ls-alertas-error" role="alert">{error}</p>}

            <div className="ls-alertas-acciones">
              <button type="button" className="ls-alertas-boton-secundario" onClick={ahoraNo} disabled={activando}>
                Ahora no
              </button>
              <button type="button" className="ls-alertas-boton" onClick={activar} disabled={activando}>
                {activando ? 'Activando...' : 'Activar alertas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}