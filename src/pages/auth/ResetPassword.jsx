import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './ResetPassword.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState(null)

  // 📊 Cálculo de Fortaleza
  const calcularFortaleza = (pass) => {
    let nivel = 0
    if (pass.length >= 8) nivel++
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) nivel++
    if (/\d/.test(pass) && /[!@#$%^&*(),.?":{}|<>]/.test(pass)) nivel++
    return nivel // 0, 1, 2, 3
  }

  const fortaleza = calcularFortaleza(password)
  const mostrarFortaleza = password.length > 0

  const getFortalezaTexto = () => {
    if (fortaleza === 0) return 'Muy débil'
    if (fortaleza === 1) return 'Débil'
    if (fortaleza === 2) return 'Media'
    return 'Fuerte'
  }

  // 📦 Obtener Token y Email de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenParam = params.get('token')
    const emailParam = params.get('email')

    if (tokenParam) setToken(tokenParam)
    if (emailParam) setEmail(emailParam)

    if (!tokenParam || !emailParam) {
      setError('Enlace inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.')
    }
  }, [location])

  // 📝 Enviar Formulario con Validaciones del Único Campo
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email || !token) {
      setError('Enlace inválido o expirado.')
      return
    }

    // Validaciones de la contraseña única
    if (!password.trim()) {
      setError('La contraseña no puede estar vacía.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      setError('La contraseña debe incluir al menos una letra mayúscula y una minúscula.')
      return
    }

    if (!/\d/.test(password)) {
      setError('La contraseña debe contener al menos un número.')
      return
    }

    setIsLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          password_confirmation: password, // Se envía la misma variable requerida por Laravel/API
          token,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña.')
      }

      setIsSubmitted(true)
      setError(null)

      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="ls-reset-page-container">
      <div className="ls-reset-card">
        <Link to="/login" className="ls-reset-top-back">
          <i className="fa-solid fa-arrow-left"></i>
          Volver al inicio de sesión
        </Link>

        {!token || !email ? (
          /* Estado de Enlace Inválido */
          <div className="ls-reset-box-state">
            <div className="ls-reset-icon-badge error-badge">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <h2 className="ls-reset-title">Enlace inválido</h2>
            <p className="ls-reset-subtitle">
              El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
            </p>
            <Link to="/olvidar" className="ls-reset-btn">
              Solicitar nuevo enlace
            </Link>
          </div>
        ) : !isSubmitted ? (
          <>
            {/* Icono central */}
            <div className="ls-reset-icon-badge">
              <i className="fa-solid fa-lock"></i>
            </div>

            <h2 className="ls-reset-title">Restablecer contraseña</h2>
            <p className="ls-reset-subtitle">
              Ingresa tu nueva contraseña para tu cuenta de <span>LockSense</span>.
            </p>

            <form className="ls-reset-form" onSubmit={handleSubmit} noValidate>
              <input type="hidden" value={email} />

              {/* CAMPO ÚNICO DE CONTRASEÑA */}
              <div className="ls-reset-group">
                <label htmlFor="password" className="ls-reset-label">
                  Nueva contraseña
                </label>
                <div className="ls-reset-input-wrapper">
                  <i className="fa-solid fa-key input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="ls-reset-input"
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="ls-reset-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>

                {/* 📊 Barra de Fortaleza */}
                {mostrarFortaleza && (
                  <div className="ls-reset-strength-container">
                    <div className="ls-reset-strength-bar">
                      <div className={`ls-reset-segment ${fortaleza >= 1 ? 'active red' : ''}`} />
                      <div className={`ls-reset-segment ${fortaleza >= 2 ? 'active orange' : ''}`} />
                      <div className={`ls-reset-segment ${fortaleza >= 3 ? 'active green' : ''}`} />
                    </div>
                    <span className={`ls-reset-strength-text strength-${fortaleza}`}>
                      {getFortalezaTexto()}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="ls-reset-error-banner">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="ls-reset-btn" disabled={isLoading}>
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        ) : (
          /* Confirmación de Éxito */
          <div className="ls-reset-box-state">
            <div className="ls-reset-icon-badge">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2 className="ls-reset-title">¡Contraseña restablecida!</h2>
            <p className="ls-reset-subtitle">
              Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <Link to="/login" className="ls-reset-btn">
              Ir al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}