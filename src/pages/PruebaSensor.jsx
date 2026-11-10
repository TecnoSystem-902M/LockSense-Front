import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Vibrate, Camera, BellRing, CheckCircle2, AlertTriangle } from 'lucide-react'
import api from '../api/client'
import '../styles/PruebaSensor.css'

/**
 * SOLO PARA PRUEBAS / DEMOSTRACION.
 * Pagina oculta (no aparece en ningun menu): /prueba-sensor/:clave
 * El boton simula el sensor de vibracion del casillero de prueba.
 * No pide sesion; la clave del enlace la valida el backend.
 */
export default function PruebaSensor() {
  const { clave } = useParams()
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)   // { tipo: 'ok' | 'error', texto }

  const simular = async () => {
    setEnviando(true)
    setResultado(null)

    try {
      const { data } = await api.post('/pruebas/simular-vibracion', { clave })
      setResultado({
        tipo: 'ok',
        texto: `${data.message} (casillero ${data.casillero})`,
      })
    } catch (err) {
      const status = err?.response?.status
      const mensaje =
        status === 404
          ? 'Este enlace no es válido o las pruebas están desactivadas.'
          : err?.response?.data?.message || 'No se pudo conectar con el servidor.'
      setResultado({ tipo: 'error', texto: mensaje })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="ls-prueba-pagina">
      <section className="ls-prueba-tarjeta">
        <span className="ls-prueba-etiqueta">Modo prueba</span>

        <h1 className="ls-prueba-titulo">Simular golpe en el casillero</h1>
        <p className="ls-prueba-texto">
          Este botón hace lo mismo que el sensor de vibración: registra un golpe en el
          casillero de prueba y la cámara toma una foto para analizarla con YOLO.
        </p>

        <button
          type="button"
          className="ls-prueba-boton"
          onClick={simular}
          disabled={enviando}
        >
          <Vibrate size={22} />
          {enviando ? 'Enviando...' : 'Simular golpe'}
        </button>

        {resultado && (
          <div className={`ls-prueba-resultado ls-prueba-resultado--${resultado.tipo}`} role="status">
            {resultado.tipo === 'ok' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span>{resultado.texto}</span>
          </div>
        )}

        <ol className="ls-prueba-pasos">
          <li>
            <Vibrate size={18} />
            <span>Se registra la anomalía "Golpe o vibración".</span>
          </li>
          <li>
            <Camera size={18} />
            <span>La cámara toma la foto y YOLO busca personas u objetos sospechosos.</span>
          </li>
          <li>
            <BellRing size={18} />
            <span>El dueño del casillero recibe la notificación.</span>
          </li>
        </ol>
      </section>
    </main>
  )
}