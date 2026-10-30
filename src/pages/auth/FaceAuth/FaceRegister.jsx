import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../api/auth'
import { registrarRostro } from '../../../api/rostros'
import { cerrarSesionLocal, obtenerUsuario } from '../../../utils/session'
import './FaceRegister.css'

/**
 * Mensajes para los códigos de error que devuelve el backend (campo `code`).
 * Si llega un código desconocido, se usa un mensaje genérico.
 */
const MENSAJES_ERROR = {
  imagen_invalida:        'La imagen no es válida. Vuelve a intentarlo.',
  no_se_detecto_rostro:   'No detectamos tu rostro. Céntrate en el óvalo y repite.',
  mas_de_un_rostro:       'Debe aparecer solo una persona en la cámara.',
  calidad_insuficiente:   'La imagen no tiene calidad suficiente. Mejora la iluminación.',
  procesamiento_fallido:  'No se pudo procesar la imagen. Intenta de nuevo.',
  respuesta_invalida:     'No se pudo procesar la imagen. Intenta de nuevo.',
  servicio_no_configurado:'El servicio de reconocimiento facial no está disponible ahora.',
  servicio_no_disponible: 'El servicio de reconocimiento facial no responde. Intenta más tarde.',
  error_guardado:         'No se pudo guardar tu rostro. Intenta de nuevo.',
}

/**
 * HU10 - Registro de rostro (solo rol USUARIO).
 *
 * Este archivo es SOLO la interfaz. El envío real al backend lo hace el
 * compañero de la lógica dentro de `enviarRostro()` (ver TODO abajo).
 *
 * Estados de la pantalla:
 *   'iniciando' -> pidiendo permiso / encendiendo cámara
 *   'lista'     -> cámara encendida, esperando que el usuario registre
 *   'error'     -> no se pudo usar la cámara
 *   'enviando'  -> procesando el rostro
 *   'exito'     -> rostro registrado
 */

const RUTA_PANEL_USUARIO = '/usuario'

export default function FaceRegister() {
  const navigate = useNavigate()
  const usuario = obtenerUsuario()

  const videoRef = useRef(null)
  // Canvas oculto para capturar el fotograma actual del vídeo.
  const canvasRef = useRef(null)
  // El stream va en un ref (no en useState) para que la limpieza al salir
  // de la página siempre vea el stream actual y apague la cámara.
  const streamRef = useRef(null)

  const [estado, setEstado] = useState('iniciando')
  const [errorMsg, setErrorMsg] = useState('')
  const [consentimiento, setConsentimiento] = useState(false)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    // Cerrar cualquier cámara abierta antes de abrir otra
    stopCamera()
    setErrorMsg('')
    setEstado('iniciando')

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Tu navegador no permite usar la cámara. Abre la página con HTTPS o desde localhost.')
      setEstado('error')
      return
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setEstado('lista')
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      setErrorMsg(
        err?.name === 'NotAllowedError'
          ? 'Bloqueaste el permiso de la cámara. Actívalo en la configuración del navegador.'
          : err?.name === 'NotFoundError'
            ? 'No encontramos ninguna cámara conectada.'
            : 'No se pudo acceder a la cámara. Verifica que ninguna otra app la esté usando.'
      )
      setEstado('error')
    }
  }, [stopCamera])

  useEffect(() => {
    startCamera()
    return () => stopCamera() // apaga la cámara al salir de la página
  }, [startCamera, stopCamera])

  /**
   * Captura el fotograma actual del <video> en un canvas y lo convierte en
   * un Blob JPG. Devuelve el Blob o null si no se pudo capturar.
   */
  const capturarBlob = useCallback(() => {
    return new Promise((resolve) => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
        resolve(null)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }
      // Dibuja el fotograma tal cual (sin espejar: el espejo es solo visual).
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    })
  }, [])

  /**
   * Toma la foto y la envía al backend (POST /api/rostro, campo `imagen`).
   * Solo se considera éxito si el backend responde 201 con ok === true.
   * Traduce los códigos de error conocidos a mensajes legibles.
   */
  const enviarRostro = useCallback(async () => {
    const blob = await capturarBlob()
    if (!blob) {
      throw new Error('No se pudo capturar la imagen de la cámara. Intenta de nuevo.')
    }

    try {
      const data = await registrarRostro(blob)
      if (!data || data.ok !== true) {
        // El backend no confirmó el guardado.
        const code = data?.code
        throw new Error(MENSAJES_ERROR[code] || 'No se pudo registrar tu rostro. Intenta de nuevo.')
      }
      return data
    } catch (err) {
      // Si es un Error que ya lanzamos arriba, se propaga su mensaje.
      if (!err?.response) {
        throw err
      }
      // Error HTTP del backend: usar el `code` del cuerpo para el mensaje.
      const code = err.response?.data?.code
      const mensaje = MENSAJES_ERROR[code]
        || err.response?.data?.message
        || 'No se pudo registrar tu rostro. Intenta de nuevo.'
      const nuevoError = new Error(mensaje)
      nuevoError.code = code
      throw nuevoError
    }
  }, [capturarBlob])

  const handleRegistrar = async () => {
    if (!consentimiento || estado !== 'lista') return

    setEstado('enviando')
    setErrorMsg('')

    try {
      await enviarRostro()
      stopCamera()
      setEstado('exito')
    } catch (err) {
      // Si el usuario ya tenía un rostro activo, el registro no es necesario:
      // se le lleva a su panel en lugar de mostrar un error.
      if (err?.code === 'rostro_ya_registrado') {
        stopCamera()
        navigate(RUTA_PANEL_USUARIO, { replace: true })
        return
      }
      setErrorMsg(err?.message || 'No se pudo registrar tu rostro. Intenta de nuevo.')
      setEstado('lista')
    }
  }

  const irAlPanel = () => {
    stopCamera()
    navigate(RUTA_PANEL_USUARIO, { replace: true })
  }

  const handleCerrarSesion = async () => {
    stopCamera()
    try {
      await logout()
    } catch {
      // Si falla, igual cerramos la sesión local
    } finally {
      cerrarSesionLocal()
      navigate('/login', { replace: true })
    }
  }

  const camaraEncendida = estado === 'lista' || estado === 'enviando'

  const textoBadge = {
    iniciando: 'Iniciando cámara',
    lista: 'Cámara activa',
    enviando: 'Procesando',
    error: 'Cámara apagada',
    exito: 'Registro completo',
  }[estado]

  return (
    <div className="fr-page">
      {/* Encabezado simple: el usuario ya inició sesión, no va el navbar público */}
      <header className="fr-topbar">
        <div className="fr-brand">
          <i className="fa-solid fa-lock"></i>
          <span>LockSense</span>
        </div>
        <div className="fr-topbar-user">
          {usuario?.nombre && <span className="fr-user-name">{usuario.nombre}</span>}
          <button type="button" className="fr-logout" onClick={handleCerrarSesion}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main className="auth-page fr-main">
        <div className="auth-container">
          <section className="auth-info">
            <span className="fr-step">Paso opcional · Acceso facial</span>
            <h1>
              Registra tu <span>rostro</span>
            </h1>
            <p>
              Registra tu rostro para poder abrir tu casillero con reconocimiento facial, sin
              necesidad de tu tarjeta. Solo lo haces una vez.
            </p>
            <div className="auth-benefits">
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-face-smile"></i>
                </div>
                <div>
                  <h3>Posición frontal</h3>
                  <p>Mira de frente a la cámara y centra tu rostro en el óvalo.</p>
                </div>
              </div>
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-sun"></i>
                </div>
                <div>
                  <h3>Buena iluminación</h3>
                  <p>Evita tener una ventana o luz fuerte detrás de ti.</p>
                </div>
              </div>
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-glasses"></i>
                </div>
                <div>
                  <h3>Rostro descubierto</h3>
                  <p>Quítate gorra, cubrebocas o lentes oscuros.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-card-header">
              <div className="auth-title-icon">
                <i className={`fa-solid ${estado === 'exito' ? 'fa-circle-check' : 'fa-camera'}`}></i>
              </div>
              <div>
                <h2>{estado === 'exito' ? 'Rostro registrado' : 'Captura de rostro'}</h2>
                <p>
                  {estado === 'exito'
                    ? 'Ya puedes usar el acceso facial en tu casillero'
                    : 'Alinea tu rostro con el óvalo guía'}
                </p>
              </div>
            </div>

            <div className="face-capture-wrapper">
              <div className={`camera-viewport is-${estado}`}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`camera-video ${camaraEncendida ? '' : 'hidden'}`}
                />

                {/* Canvas oculto: se usa solo para capturar el fotograma. */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {estado === 'iniciando' && (
                  <div className="camera-placeholder">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Iniciando cámara...</span>
                  </div>
                )}

                {estado === 'error' && (
                  <div className="camera-placeholder is-error" role="alert">
                    <i className="fa-solid fa-video-slash"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {estado === 'exito' && (
                  <div className="camera-placeholder is-success">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>¡Listo! Tu rostro quedó registrado.</span>
                  </div>
                )}

                {camaraEncendida && (
                  <div className="scanner-oval">
                    {estado === 'enviando' && <div className="scan-line"></div>}
                  </div>
                )}

                <div className="camera-badge">
                  <span className="badge-dot"></span>
                  <span>{textoBadge}</span>
                </div>
              </div>

              {/* Error al registrar (la cámara sigue encendida) */}
              {errorMsg && estado === 'lista' && (
                <p className="ls-login-error-msg fr-error" role="alert">
                  {errorMsg}
                </p>
              )}

              {estado === 'exito' ? (
                <button type="button" className="auth-button fr-button" onClick={irAlPanel}>
                  Ir a mi panel
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              ) : (
                <>
                  <label className="remember fr-consent">
                    <input
                      type="checkbox"
                      checked={consentimiento}
                      onChange={(e) => setConsentimiento(e.target.checked)}
                      disabled={estado === 'enviando'}
                    />
                    <span>
                      Acepto que LockSense procese mi rostro para el acceso a mi casillero.
                    </span>
                  </label>

                  <button
                    type="button"
                    className="auth-button fr-button"
                    onClick={handleRegistrar}
                    disabled={!consentimiento || estado !== 'lista'}
                  >
                    {estado === 'enviando' ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Procesando rostro...
                      </>
                    ) : (
                      <>
                        Registrar rostro
                        <i className="fa-solid fa-check"></i>
                      </>
                    )}
                  </button>

                  <p className="fr-privacy">
                    <i className="fa-solid fa-shield-halved"></i>
                    No guardamos tu foto, solo una representación numérica de tu rostro.
                  </p>

                  <div className="fr-actions">
                    <button
                      type="button"
                      className="fr-link"
                      onClick={startCamera}
                      disabled={estado === 'enviando' || estado === 'iniciando'}
                    >
                      <i className="fa-solid fa-rotate-right"></i>
                      Reiniciar cámara
                    </button>
                    <button
                      type="button"
                      className="fr-link fr-link-muted"
                      onClick={irAlPanel}
                      disabled={estado === 'enviando'}
                    >
                      Hacerlo más tarde
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}