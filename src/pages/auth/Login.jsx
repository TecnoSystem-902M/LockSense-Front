import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import AuthFooter from '../../components/AuthFooter'
import { login } from '../../api/auth'
import { getRouteByRole } from '../../utils/roleRoutes'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ identidad: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (serverError) setServerError('')
  }

  const validateForm = () => {
    const newErrors = {}

    // El campo de identidad acepta correo electrónico o identificador.
    // Solo se exige que no esté vacío; si contiene "@" se valida como correo.
    const identidad = form.identidad.trim()
    if (!identidad) {
      newErrors.identidad = 'Ingresa tu correo electrónico o identificador.'
    } else if (
      identidad.includes('@') &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identidad)
    ) {
      newErrors.identidad = 'Ingresa un correo electrónico válido.'
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const data = await login(form.identidad, form.password)

      // Guardar token y usuario
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirigir según rol
      const route = getRouteByRole(data.user.rol)
      navigate(route, { state: { loginExitoso: true } })

    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message

      // Cuenta no verificada
      if (status === 403 && err.response?.data?.code === 'NOT_VERIFIED') {
        // Reutilizar el correo que devuelve el backend y abrir el modal OTP en
        // /registro. Si el acceso fue por correo, se usa como respaldo.
        const emailIngresado = form.identidad.includes('@') ? form.identidad : ''
        const emailNoVerificado = err.response?.data?.email || emailIngresado
        navigate('/registro', { state: { email: emailNoVerificado } })
        return
      }

      // Credenciales incorrectas u otros
      setServerError(message || 'Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputClass = (fieldName) => {
    const hasError = !!errors[fieldName]
    return `input-wrapper ls-login-input-wrapper ${hasError ? 'ls-login-field-error' : ''}`
  }

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null
    return <span className="ls-login-error-msg">{errors[fieldName]}</span>
  }

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <div className="auth-container">
          {/* LADO IZQUIERDO */}
          <section className="auth-info">
            <h1>
              Bienvenido a <span>LockSense</span>
            </h1>
            <p>
              Accede a tu cuenta para administrar tus casilleros inteligentes y consultar su
              estado de forma segura.
            </p>
            <div className="auth-benefits">
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h3>Acceso seguro</h3>
                  <p>Protegemos el acceso a tu cuenta.</p>
                </div>
              </div>
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <div>
                  <h3>Control de tus casilleros</h3>
                  <p>Consulta y administra tus casilleros.</p>
                </div>
              </div>
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div>
                  <h3>Monitoreo</h3>
                  <p>Visualiza información y actividad.</p>
                </div>
              </div>
            </div>
          </section>

          {/* LADO DERECHO */}
          <section className="auth-card">
            <div className="auth-card-header">
              <div className="auth-title-icon">
                <i className="fa-solid fa-right-to-bracket"></i>
              </div>
              <div>
                <h2>Iniciar sesión</h2>
                <p>Ingresa tus datos para continuar</p>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* CORREO O IDENTIFICADOR */}
              <div className="form-group">
                <label htmlFor="identidad">Correo electrónico o identificador</label>
                <div className={getInputClass('identidad')}>
                  <i className="fa-regular fa-envelope"></i>
                  <input
                    type="text"
                    id="identidad"
                    name="identidad"
                    placeholder="correo@ejemplo.com o tu identificador"
                    value={form.identidad}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </div>
                {renderError('identidad')}
              </div>

              {/* CONTRASEÑA */}
              <div className="form-group">
                <div className="password-label">
                  <label htmlFor="password">Contraseña</label>
                  <Link to="/olvidar">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className={getInputClass('password')}>
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Mostrar contraseña"
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {renderError('password')}
              </div>

              {/* RECORDAR */}
              <label className="remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <span>Recordar mi sesión</span>
              </label>

              {/* ERROR DEL SERVIDOR */}
              {serverError && (
                <p className="ls-login-error-msg" style={{ textAlign: 'center', marginBottom: 12 }}>
                  {serverError}
                </p>
              )}

              {/* BOTÓN */}
              <button type="submit" className="auth-button" disabled={isSubmitting}>
                {isSubmitting ? 'Iniciando...' : 'Iniciar sesión'}
                {!isSubmitting && <i className="fa-solid fa-arrow-right"></i>}
              </button>

              {/* REGISTRO */}
              <div className="auth-divider">
                <span>¿Aún no tienes una cuenta?</span>
              </div>
              <Link to="/registro" className="register-link">
                Crear una cuenta
              </Link>
            </form>
          </section>
        </div>
      </main>

      <AuthFooter />
    </>
  )
}