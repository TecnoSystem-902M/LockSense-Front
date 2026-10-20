import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import './FaceRegister.css'

export default function FaceRegister() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  
  const [stream, setStream] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Iniciar la cámara web al cargar el componente
  useEffect(() => {
    startCamera()
    
    // Función de limpieza: Se ejecuta automáticamente cuando sales de esta página
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setErrorMsg('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCameraActive(true)
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      setErrorMsg('No se pudo acceder a la cámara web. Verifica los permisos de tu navegador.')
      setCameraActive(false)
    }
  }

  // Función robusta para apagar todos los tracks de video
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop() // Detiene físicamente el uso del hardware de la cámara
      })
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const handleCaptureAndVerify = () => {
    setIsVerifying(true)
    setErrorMsg('')

    // Simulación de procesamiento de IA / Biometría Facial
    setTimeout(() => {
      setIsVerifying(false)
      
      // Apagar la cámara explícitamente antes de redirigir
      stopCamera()

      // Redirigir al panel tras una verificación exitosa
      navigate('/admin', { replace: true })
    }, 2200)
  }

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <div className="auth-container">
          <section className="auth-info">
            <h1>
              Validación <span>Biométrica</span>
            </h1>
            <p>
              Para garantizar la máxima seguridad en LockSense, requerimos verificar tu identidad a través de reconocimiento facial antes de acceder al panel.
            </p>
            <div className="auth-benefits">
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-face-smile"></i>
                </div>
                <div>
                  <h3>Posición frontal</h3>
                  <p>Mantén tu rostro centrado dentro del óvalo guía.</p>
                </div>
              </div>
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-sun"></i>
                </div>
                <div>
                  <h3>Buena iluminación</h3>
                  <p>Asegúrate de estar en un lugar con suficiente luz.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-card-header">
              <div className="auth-title-icon">
                <i className="fa-solid fa-camera"></i>
              </div>
              <div>
                <h2>Captura de Rostro</h2>
                <p>Alinea tu rostro con el recuadro de seguridad</p>
              </div>
            </div>

            <div className="face-capture-wrapper">
              <div className="camera-viewport">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`camera-video ${cameraActive ? '' : 'hidden'}`}
                />

                {!cameraActive && !errorMsg && (
                  <div className="camera-placeholder">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Iniciando cámara...</span>
                  </div>
                )}

                <div className="scanner-oval">
                  <div className="scan-line"></div>
                </div>

                <div className="camera-badge">
                  <span className="badge-dot"></span>
                  <span>{cameraActive ? 'Cámara activa' : 'Cámara apagada'}</span>
                </div>
              </div>

              {errorMsg && (
                <p className="ls-login-error-msg" style={{ textAlign: 'center', marginTop: 12 }}>
                  {errorMsg}
                </p>
              )}

              <button 
                type="button" 
                className="auth-button" 
                onClick={handleCaptureAndVerify} 
                disabled={isVerifying || !cameraActive}
                style={{ marginTop: '20px' }}
              >
                {isVerifying ? 'Verificando identidad...' : 'Capturar y Verificar'}
                {!isVerifying && <i className="fa-solid fa-check"></i>}
              </button>

              <div className="auth-divider" style={{ marginTop: '16px' }}>
                <span>¿Problemas con la cámara?</span>
              </div>
              
              <button 
                type="button" 
                className="register-link" 
                onClick={startCamera}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center', display: 'block' }}
              >
                Reiniciar dispositivo de video
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}