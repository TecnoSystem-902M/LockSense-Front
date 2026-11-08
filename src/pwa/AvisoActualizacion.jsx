import { useEffect, useState } from 'react'
import { EVENTO_ACTUALIZACION } from './pwa'
import './pwa.css'

// Aviso flotante: "Hay una nueva versión de LockSense" + botón Actualizar.
export default function AvisoActualizacion() {
  const [trabajador, setTrabajador] = useState(null)

  useEffect(() => {
    const alRecibir = (event) => setTrabajador(event.detail)
    window.addEventListener(EVENTO_ACTUALIZACION, alRecibir)
    return () => window.removeEventListener(EVENTO_ACTUALIZACION, alRecibir)
  }, [])

  if (!trabajador) return null

  const actualizar = () => {
    // El SW nuevo toma el control y la página se recarga sola (pwa.js).
    trabajador.postMessage('SKIP_WAITING')
  }

  return (
    <div className="ls-pwa-aviso" role="status">
      <span className="ls-pwa-aviso-texto">Hay una nueva versión de LockSense.</span>
      <div className="ls-pwa-aviso-acciones">
        <button type="button" className="ls-pwa-aviso-despues" onClick={() => setTrabajador(null)}>
          Después
        </button>
        <button type="button" className="ls-pwa-aviso-actualizar" onClick={actualizar}>
          Actualizar
        </button>
      </div>
    </div>
  )
}
