import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { register, verifyEmail, resendCode } from '../../api/auth'

const STEP_LABELS = ['Datos', 'Seguridad']

export default function Registro() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estado para errores de validación
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado para el modal de verificación
  const [showModal, setShowModal] = useState(false)
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [verifyStatus, setVerifyStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [resendStatus, setResendStatus] = useState('idle') // 'idle' | 'loading' | 'sent' | 'error'
  const inputRefs = useRef([])

  const [form, setForm] = useState({
    // Paso 1: Organización
    nombreOrganizacion: '',
    telefonoOrganizacion: '',
    direccion: '',
    colonia: '',
    ciudad: '',
    codigoPostal: '',
    tipoOrganizacion: '',

    // Paso 2: Seguridad / Datos de usuario
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })

  const getPasswordStrength = (pass) => {
    if (!pass) return { text: '', percentage: 0, statusClass: '' }

    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    switch (score) {
      case 0:
      case 1:
        return { text: 'Débil', percentage: 25, statusClass: 'auth-strength-weak' }
      case 2:
        return { text: 'Media', percentage: 50, statusClass: 'auth-strength-medium' }
      case 3:
        return { text: 'Buena', percentage: 75, statusClass: 'auth-strength-good' }
      case 4:
        return { text: 'Fuerte', percentage: 100, statusClass: 'auth-strength-strong' }
      default:
        return { text: '', percentage: 0, statusClass: '' }
    }
  }

  const pwdStrength = getPasswordStrength(form.password)

  const validateStep = (stepToValidate) => {
    const newErrors = {}

    if (stepToValidate === 0) {
      if (!form.nombreOrganizacion.trim()) {
        newErrors.nombreOrganizacion = 'El nombre de la organización es obligatorio.'
      }
      if (!form.direccion.trim()) {
        newErrors.direccion = 'La dirección es obligatoria.'
      }
      if (!form.tipoOrganizacion) {
        newErrors.tipoOrganizacion = 'Selecciona un tipo de organización.'
      }
      if (!form.colonia.trim()) {
        newErrors.colonia = 'La colonia es obligatoria.'
      }
      if (!form.ciudad) {
        newErrors.ciudad = 'Selecciona una ciudad.'
      }
      if (!form.codigoPostal.trim()) {
        newErrors.codigoPostal = 'El código postal es obligatorio.'
      } else if (!/^\d{5}$/.test(form.codigoPostal.trim())) {
        newErrors.codigoPostal = 'Debe ser un código postal válido (5 dígitos).'
      }
    }

    if (stepToValidate === 1) {
      if (!form.nombre.trim()) {
        newErrors.nombre = 'El nombre es obligatorio.'
      }
      if (!form.apellidoPaterno.trim()) {
        newErrors.apellidoPaterno = 'El apellido paterno es obligatorio.'
      }
      if (!form.apellidoMaterno.trim()) {
        newErrors.apellidoMaterno = 'El apellido materno es obligatorio.'
      }
      if (!form.email.trim()) {
        newErrors.email = 'El correo electrónico es obligatorio.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        newErrors.email = 'Ingresa un correo electrónico válido.'
      }
      if (!form.password) {
        newErrors.password = 'La contraseña es obligatoria.'
      } else if (form.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
      }
      if (!form.confirmPassword) {
        newErrors.confirmPassword = 'Debes confirmar tu contraseña.'
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden.'
      }
      if (!form.acceptedTerms) {
        newErrors.acceptedTerms = 'Debes aceptar los Términos y Políticas para continuar.'
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const goToStep = (step) => {
    if (step > currentStep) {
      const isValid = validateStep(currentStep)
      if (!isValid) return
    }
    setCurrentStep(step)
  }

  const handleField = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (serverError) setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    const step0Valid = validateStep(0)
    const step1Valid = validateStep(1)

    if (!step0Valid) {
      setCurrentStep(0)
      return
    }

    if (!step1Valid) {
      setCurrentStep(1)
      return
    }

    setIsSubmitting(true)

    const payload = {
      // Organización
      organizacion_nombre: form.nombreOrganizacion,
      organizacion_tipo: form.tipoOrganizacion,
      organizacion_direccion: form.direccion,
      organizacion_colonia: form.colonia,
      organizacion_ciudad: form.ciudad,
      organizacion_codigo_postal: form.codigoPostal,
      organizacion_telefono: form.telefonoOrganizacion,

      // Usuario
      nombre: form.nombre,
      apellido_pa: form.apellidoPaterno,
      apellido_ma: form.apellidoMaterno,
      email: form.email,
      password: form.password,
      password_confirmation: form.confirmPassword,
    }

    try {
      await register(payload)
      setOtp(Array(6).fill(''))
      setVerifyStatus('idle')
      setErrorMessage('')
      setResendStatus('idle')
      setShowModal(true)
    } catch (err) {
      if (err.response?.status === 422) {
        const laravelErrors = err.response.data.errors || {}
        const fieldMap = {
          organizacion_nombre: 'nombreOrganizacion',
          organizacion_tipo: 'tipoOrganizacion',
          organizacion_direccion: 'direccion',
          organizacion_colonia: 'colonia',
          organizacion_ciudad: 'ciudad',
          organizacion_codigo_postal: 'codigoPostal',
          organizacion_telefono: 'telefonoOrganizacion',
          nombre: 'nombre',
          apellido_pa: 'apellidoPaterno',
          apellido_ma: 'apellidoMaterno',
          email: 'email',
          password: 'password',
        }

        const mappedErrors = {}
        Object.keys(laravelErrors).forEach((key) => {
          const frontField = fieldMap[key] || key
          mappedErrors[frontField] = laravelErrors[key][0]
        })

        setErrors((prev) => ({ ...prev, ...mappedErrors }))

        if (
          laravelErrors.organizacion_nombre ||
          laravelErrors.organizacion_tipo ||
          laravelErrors.organizacion_direccion ||
          laravelErrors.organizacion_colonia ||
          laravelErrors.organizacion_ciudad ||
          laravelErrors.organizacion_codigo_postal
        ) {
          setCurrentStep(0)
        } else {
          setCurrentStep(1)
        }
      } else {
        setServerError(
          err.response?.data?.message || 'Error al registrar. Intenta de nuevo.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, '')
    if (!value && element.value !== '') return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '')
    if (pastedData) {
      const pasteValues = pastedData.slice(0, 6).split('')
      const newOtp = [...otp]
      pasteValues.forEach((char, i) => {
        newOtp[i] = char
      })
      setOtp(newOtp)
      const nextFocusIndex = Math.min(pasteValues.length, 5)
      inputRefs.current[nextFocusIndex]?.focus()
    }
  }

  const isOtpComplete = otp.every((digit) => digit !== '')

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!isOtpComplete) return

    setVerifyStatus('loading')
    setErrorMessage('')

    const code = otp.join('')

    try {
      await verifyEmail(form.email, code)
      setVerifyStatus('success')
      setTimeout(() => {
        setShowModal(false)
        navigate('/login')
      }, 1500)
    } catch (err) {
      setVerifyStatus('error')
      setErrorMessage(
        err.response?.data?.message ||
        'El código ingresado es incorrecto. Inténtalo de nuevo.'
      )
    }
  }

  const handleResendCode = async () => {
    setResendStatus('loading')
    try {
      await resendCode(form.email)
      setResendStatus('sent')
      setTimeout(() => setResendStatus('idle'), 4000)
    } catch {
      setResendStatus('error')
      setTimeout(() => setResendStatus('idle'), 4000)
    }
  }

  const CIUDADES_MEXICO = [
    'Aguascalientes', 'Cancún', 'Chihuahua', 'Ciudad de México', 'Culiacán',
    'Guadalajara', 'Hermosillo', 'Juárez', 'León', 'Mérida',
    'Mexicali', 'Monterrey', 'Morelia', 'Oaxaca', 'Puebla',
    'Querétaro', 'Saltillo', 'San Luis Potosí', 'Tijuana', 'Toluca',
    'Torreón', 'Veracruz', 'Zapopan'
  ]

  const getInputClass = (fieldName) => {
    const hasError = !!errors[fieldName]
    return `input-wrapper ls-reg-input-wrapper ${hasError ? 'ls-reg-field-error' : ''}`
  }

  const renderError = (fieldName) => {
    if (!errors[fieldName]) return null
    return <span className="ls-reg-error-msg">{errors[fieldName]}</span>
  }

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <div className="auth-container">
          {/* LADO IZQUIERDO */}
          <section className="auth-info" style={{ paddingTop: '10px' }}>
            <div className="auth-info-header" style={{ marginBottom: '20px' }}>
              <h1 style={{ marginTop: 0 }}>
                Gestiona tus casilleros con <span>LockSense</span>
              </h1>
              <p>
                Registra tu organización para gestionar de manera inteligente
                y centralizada el uso de tus casilleros.
              </p>
            </div>

            <div className="auth-benefits">
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-building"></i>
                </div>
                <div>
                  <h3>Gestión Organizacional</h3>
                  <p>Administra las sedes y áreas de tu organización.</p>
                </div>
              </div>
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-key"></i>
                </div>
                <div>
                  <h3>Control de Casilleros</h3>
                  <p>Asignación y monitoreo para tus usuarios y personal.</p>
                </div>
              </div>
              <div className="auth-benefit">
                <div className="benefit-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h3>Acceso Seguro</h3>
                  <p>Protección cifrada de datos y credenciales.</p>
                </div>
              </div>
            </div>
          </section>

          {/* LADO DERECHO: FORMULARIO */}
          <section className="auth-card">
            <div className="auth-card-header">
              <div className="auth-title-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <div>
                <h2>Registro de Organización</h2>
                <p>Completa la información requerida para registrar tu organización</p>
              </div>
            </div>

            {/* Indicador de Pasos */}
            <div className="signup-steps">
              {STEP_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`step-dot${i === currentStep ? ' active' : ''}`}
                  onClick={() => goToStep(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <span>{i + 1}</span> {label}
                </div>
              ))}
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* PASO 1 */}
              <div className={`signup-step${currentStep === 0 ? ' active' : ''}`}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre de la organización *</label>
                    <div className={getInputClass('nombreOrganizacion')}>
                      <i className="fa-solid fa-building"></i>
                      <input
                        type="text"
                        name="nombreOrganizacion"
                        placeholder="Ej. Corporativo / Empresa / Institución"
                        value={form.nombreOrganizacion}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('nombreOrganizacion')}
                  </div>
                  <div className="form-group">
                    <label>Teléfono de la organización</label>
                    <div className={getInputClass('telefonoOrganizacion')}>
                      <i className="fa-solid fa-phone"></i>
                      <input
                        type="text"
                        name="telefonoOrganizacion"
                        placeholder="+52 33 8765 4321"
                        value={form.telefonoOrganizacion}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('telefonoOrganizacion')}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dirección de la organización *</label>
                    <div className={getInputClass('direccion')}>
                      <i className="fa-solid fa-location-dot"></i>
                      <input
                        type="text"
                        name="direccion"
                        placeholder="Av. Industrial #123"
                        value={form.direccion}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('direccion')}
                  </div>
                  <div className="form-group">
                    <label>Tipo de organización *</label>
                    <div className={getInputClass('tipoOrganizacion')}>
                      <i className="fa-solid fa-list"></i>
                      <select
                        name="tipoOrganizacion"
                        value={form.tipoOrganizacion}
                        onChange={handleField}
                      >
                        <option value="">Selecciona el tipo</option>
                        <option value="Empresa">Empresa / Corporativo</option>
                        <option value="Fabrica">Fábrica / Planta Industrial</option>
                        <option value="Escuela Publica">Escuela Pública</option>
                        <option value="Escuela Privada">Escuela Privada / Universidad</option>
                        <option value="Gym">Gimnasio</option>
                        <option value="Centro Deportivo">Centro Deportivo</option>
                        <option value="Hospital">Hospital / Clínica</option>
                        <option value="Hotel">Hotel / Hospedaje</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    {renderError('tipoOrganizacion')}
                  </div>
                </div>

                <div className="form-row form-row-3">
                  <div className="form-group">
                    <label>Colonia *</label>
                    <div className={getInputClass('colonia')}>
                      <i className="fa-solid fa-map-pin"></i>
                      <input
                        type="text"
                        name="colonia"
                        placeholder="Centro"
                        value={form.colonia}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('colonia')}
                  </div>
                  <div className="form-group">
                    <label>Ciudad *</label>
                    <div className={getInputClass('ciudad')}>
                      <i className="fa-solid fa-city"></i>
                      <select
                        name="ciudad"
                        value={form.ciudad}
                        onChange={handleField}
                      >
                        <option value="">Selección</option>
                        {CIUDADES_MEXICO.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    {renderError('ciudad')}
                  </div>
                  <div className="form-group">
                    <label>Código Postal *</label>
                    <div className={getInputClass('codigoPostal')}>
                      <i className="fa-solid fa-mail-bulk"></i>
                      <input
                        type="text"
                        name="codigoPostal"
                        placeholder="44100"
                        value={form.codigoPostal}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('codigoPostal')}
                  </div>
                </div>

                <button className="auth-button" type="button" onClick={() => goToStep(1)}>
                  Continuar <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              {/* PASO 2 */}
              <div className={`signup-step${currentStep === 1 ? ' active' : ''}`}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre(s) *</label>
                    <div className={getInputClass('nombre')}>
                      <i className="fa-solid fa-user"></i>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ej. Juan"
                        value={form.nombre}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('nombre')}
                  </div>
                  <div className="form-group">
                    <label>Apellido Paterno *</label>
                    <div className={getInputClass('apellidoPaterno')}>
                      <i className="fa-solid fa-user"></i>
                      <input
                        type="text"
                        name="apellidoPaterno"
                        placeholder="Ej. Pérez"
                        value={form.apellidoPaterno}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('apellidoPaterno')}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Apellido Materno *</label>
                    <div className={getInputClass('apellidoMaterno')}>
                      <i className="fa-solid fa-user"></i>
                      <input
                        type="text"
                        name="apellidoMaterno"
                        placeholder="Ej. López"
                        value={form.apellidoMaterno}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('apellidoMaterno')}
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico *</label>
                    <div className={getInputClass('email')}>
                      <i className="fa-solid fa-envelope"></i>
                      <input
                        type="email"
                        name="email"
                        placeholder="correo@ejemplo.com"
                        value={form.email}
                        onChange={handleField}
                      />
                    </div>
                    {renderError('email')}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <div className={getInputClass('password')}>
                      <i className="fa-solid fa-lock"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleField}
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
                    {form.password && (
                      <div className={`auth-strength-container ${pwdStrength.statusClass}`}>
                        <div className="auth-strength-track">
                          <div
                            className="auth-strength-fill"
                            style={{ width: `${pwdStrength.percentage}%` }}
                          />
                        </div>
                        <span className="auth-strength-label">{pwdStrength.text}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Confirmar Contraseña *</label>
                    <div className={getInputClass('confirmPassword')}>
                      <i className="fa-solid fa-lock"></i>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={handleField}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label="Mostrar contraseña de confirmación"
                      >
                        <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {renderError('confirmPassword')}
                  </div>
                </div>

                <span className="strength-label" style={{ display: 'block', marginTop: '4px', marginBottom: '12px' }}>
                  Usa al menos 8 caracteres con números y símbolos
                </span>

                <div className="form-group">
                  <label className="terms-check">
                    <input
                      type="checkbox"
                      checked={form.acceptedTerms}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, acceptedTerms: e.target.checked }))
                        if (errors.acceptedTerms) {
                          setErrors((prev) => ({ ...prev, acceptedTerms: null }))
                        }
                      }}
                    />
                    <span>
                      Acepto los{' '}
                      <Link to="/terminos" target="_blank" className="terms-link">
                        Términos de servicio
                      </Link>{' '}
                      y las{' '}
                      <Link to="/privacidad" target="_blank" className="terms-link">
                        Políticas de privacidad
                      </Link>.
                    </span>
                  </label>
                  {renderError('acceptedTerms')}
                </div>

                {serverError && (
                  <p className="ls-reg-error-msg" style={{ marginBottom: '12px', textAlign: 'center' }}>
                    {serverError}
                  </p>
                )}

                <div className="step-actions">
                  <button className="btn-secondary-outline" type="button" onClick={() => goToStep(0)} disabled={isSubmitting}>
                    Atrás
                  </button>
                  <button className="auth-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Finalizar Registro'}
                  </button>
                </div>
              </div>
            </form>

            <div className="auth-divider">
              <span>¿Ya tienes cuenta?</span>
            </div>

            <Link to="/login" className="register-link">
              Iniciar Sesión
            </Link>
          </section>
        </div>
      </main>

      {/* MODAL VERIFICACIÓN CÓDIGO OTP */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header">
              <div className="modal-icon">
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h2>Verifica tu correo</h2>
              <p>
                Hemos enviado un código de 6 dígitos a <strong>{form.email || 'tu correo'}</strong>.
                Ingrésalo para completar el registro.
              </p>
            </div>

            <form onSubmit={handleVerifyCode}>
              <div className="otp-container" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="otp-input"
                    disabled={verifyStatus === 'loading' || verifyStatus === 'success'}
                  />
                ))}
              </div>

              {errorMessage && <p className="verify-error-msg">{errorMessage}</p>}

              <button
                type="submit"
                className={`verify-button status-${verifyStatus}`}
                disabled={!isOtpComplete || verifyStatus === 'loading'}
              >
                {verifyStatus === 'idle' && 'Verificar Código'}
                {verifyStatus === 'loading' && <span className="btn-spinner"></span>}
                {verifyStatus === 'success' && <i className="fa-solid fa-check text-xl"></i>}
                {verifyStatus === 'error' && <i className="fa-solid fa-xmark text-xl"></i>}
              </button>

              <button
                type="button"
                className={`resend-text resend-status-${resendStatus}`}
                onClick={handleResendCode}
                disabled={resendStatus === 'loading' || verifyStatus === 'success'}
              >
                {resendStatus === 'idle' && '¿No recibiste el código? Reenviar'}
                {resendStatus === 'loading' && 'Enviando...'}
                {resendStatus === 'sent' && '✓ Código reenviado'}
                {resendStatus === 'error' && 'Error al reenviar. Intenta de nuevo.'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}