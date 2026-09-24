import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
    if (serverError) setServerError('')
  }

  const validate = () => {
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setServerError('')

    try {
      await forgotPassword(email.trim())
      setIsSubmitted(true)
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || {}
        setError(errors.email?.[0] || 'Revisa el correo ingresado.')
      } else {
        setServerError(
          err.response?.data?.message ||
          'Ocurrió un error. Intenta de nuevo.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsSubmitting(true)
    setServerError('')
    try {
      await forgotPassword(email.trim())
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Error al reenviar. Intenta de nuevo.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="ls-forgot-page-container">
      <div className="ls-forgot-card">
        <Link to="/login" className="ls-forgot-top-back">
          <i className="fa-solid fa-arrow-left"></i>
          Volver al inicio de sesión
        </Link>

        {!isSubmitted ? (
          <>
            <div className="ls-forgot-icon-badge">
              <i className="fa-solid fa-key"></i>
            </div>

            <h2 className="ls-forgot-title">¿Olvidaste tu contraseña?</h2>
            <p className="ls-forgot-subtitle">
              No te preocupes. Introduce tu correo electrónico y te enviaremos las instrucciones para restablecerla.
            </p>

            <form className="ls-forgot-form" onSubmit={handleSubmit} noValidate>
              <div className="ls-forgot-group">
                <label htmlFor="email" className="ls-forgot-label">
                  Correo electrónico
                </label>
                <div className={`ls-forgot-input-wrapper ${error ? 'ls-forgot-field-error' : ''}`}>
                  <i className="fa-regular fa-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="ls-forgot-input"
                    placeholder="ejemplo@locksense.com"
                    value={email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
                {error && <span className="ls-forgot-error-msg">{error}</span>}
              </div>

              {serverError && (
                <p className="ls-forgot-error-msg" style={{ textAlign: 'center', marginBottom: 12 }}>
                  {serverError}
                </p>
              )}

              <button type="submit" className="ls-forgot-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar código de recuperación'}
              </button>
            </form>
          </>
        ) : (
          <div className="ls-forgot-success-box">
            <div className="ls-forgot-icon-badge">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <h2 className="ls-forgot-title">¡Correo enviado!</h2>
            <p className="ls-forgot-subtitle">
              Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
              <span className="ls-forgot-email-highlight">{email}</span>.
            </p>

            {serverError && (
              <p className="ls-forgot-error-msg" style={{ textAlign: 'center', marginBottom: 12 }}>
                {serverError}
              </p>
            )}

            <button
              type="button"
              className="ls-forgot-resend-btn"
              onClick={handleResend}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : '¿No recibiste el correo? Clic aquí para reenviar'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}