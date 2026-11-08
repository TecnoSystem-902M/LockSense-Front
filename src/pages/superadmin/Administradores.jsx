import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Pencil,
  Ban,
  RotateCcw,
  X,
  AlertTriangle,
  Plus
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import {
  listarAdministradores,
  crearAdministrador,
  actualizarAdministrador,
  cambiarEstadoAdministrador,
} from '../../api/Superadmin'
import '../../styles/superadmin/Administradores.css'

const formVacio = {
  nombre: '',
  apellido_pa: '',
  apellido_ma: '',
  email: '',
  password: '',
  password_confirmation: '',
  organizaciones_id: '',
}

const SOLO_LETRAS = /^[\p{L}\s'.-]+$/u
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ---------- VALIDACIÓN (la misma que hace el back) ----------
function validarFormulario(form, esNuevo) {
  const errores = {}
  const nombre = form.nombre.trim()
  const apPa = form.apellido_pa.trim()
  const apMa = form.apellido_ma.trim()
  const email = form.email.trim()

  if (!nombre) errores.nombre = 'El nombre es obligatorio.'
  else if (nombre.length < 2) errores.nombre = 'El nombre debe tener al menos 2 letras.'
  else if (nombre.length > 100) errores.nombre = 'El nombre no puede pasar de 100 caracteres.'
  else if (!SOLO_LETRAS.test(nombre)) errores.nombre = 'El nombre solo puede tener letras.'

  if (!apPa) errores.apellido_pa = 'El apellido paterno es obligatorio.'
  else if (apPa.length < 2) errores.apellido_pa = 'El apellido paterno debe tener al menos 2 letras.'
  else if (apPa.length > 100) errores.apellido_pa = 'El apellido paterno no puede pasar de 100 caracteres.'
  else if (!SOLO_LETRAS.test(apPa)) errores.apellido_pa = 'El apellido paterno solo puede tener letras.'

  if (apMa && apMa.length > 100) errores.apellido_ma = 'El apellido materno no puede pasar de 100 caracteres.'
  else if (apMa && !SOLO_LETRAS.test(apMa)) errores.apellido_ma = 'El apellido materno solo puede tener letras.'

  if (!email) errores.email = 'El correo es obligatorio.'
  else if (!CORREO.test(email)) errores.email = 'Escribe un correo válido.'
  else if (email.length > 150) errores.email = 'El correo no puede pasar de 150 caracteres.'

  // Al modificar, la contraseña es opcional (vacía = no se cambia)
  if (esNuevo || form.password) {
    if (!form.password) errores.password = 'La contraseña es obligatoria.'
    else if (form.password.length < 8) errores.password = 'La contraseña debe tener al menos 8 caracteres.'
    else if (form.password.length > 72) errores.password = 'La contraseña no puede pasar de 72 caracteres.'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      errores.password = 'La contraseña debe tener al menos una letra y un número.'
    }

    if (!errores.password && form.password !== form.password_confirmation) {
      errores.password_confirmation = 'Las contraseñas no coinciden.'
    }
  }

  if (!form.organizaciones_id) errores.organizaciones_id = 'Selecciona la organización.'

  return errores
}

// Convierte los errores 422 de Laravel ({campo: ['msg']}) a {campo: 'msg'}
function erroresDelBack(err) {
  const errors = err?.response?.data?.errors
  if (!errors) return null
  return Object.fromEntries(Object.entries(errors).map(([campo, msgs]) => [campo, msgs[0]]))
}

function obtenerIniciales(admin) {
  return `${admin.nombre?.[0] ?? ''}${admin.apellido_pa?.[0] ?? ''}`.toUpperCase()
}

export default function Administradores() {
  const [administradores, setAdministradores] = useState([])
  const [organizaciones, setOrganizaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')

  // Modal crear / editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [adminEditando, setAdminEditando] = useState(null)
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Modal baja / reactivar
  const [confirmarEstado, setConfirmarEstado] = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  const [toast, setToast] = useState('')

  // Búsqueda y paginación
  const [busqueda, setBusqueda] = useState('')
  const registrosPorPagina = 5
  const [paginaActual, setPaginaActual] = useState(1)

  const cargarAdministradores = useCallback(async () => {
    setCargando(true)
    setErrorCarga('')
    try {
      const data = await listarAdministradores()
      setAdministradores(data.administradores ?? [])
      setOrganizaciones(data.organizaciones ?? [])
    } catch {
      setAdministradores([])
      setErrorCarga('No se pudieron cargar los administradores.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarAdministradores()
  }, [cargarAdministradores])

  // Organizaciones del select: solo las que NO tienen admin activo.
  // Al modificar, también aparece la organización actual de ese admin.
  const organizacionesDisponibles = useMemo(() => {
    return organizaciones.filter((org) =>
      org.admin_id === null || (adminEditando && org.admin_id === adminEditando.id)
    )
  }, [organizaciones, adminEditando])

  // Filtrado
  const adminsFiltrados = administradores.filter((admin) => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return true
    return [admin.nombre_completo, admin.email, admin.organizacion?.nombre]
      .filter(Boolean)
      .some((valor) => valor.toLowerCase().includes(termino))
  })

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(adminsFiltrados.length / registrosPorPagina))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const indiceInicial = (paginaSegura - 1) * registrosPorPagina
  const adminsVisibles = adminsFiltrados.slice(indiceInicial, indiceInicial + registrosPorPagina)

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor)
    setPaginaActual(1)
  }

  // ---------- MODAL CREAR / EDITAR ----------
  const abrirNuevo = () => {
    setAdminEditando(null)
    setForm(formVacio)
    setErrores({})
    setErrorGeneral('')
    setModalAbierto(true)
  }

  const abrirModificar = (admin) => {
    setAdminEditando(admin)
    setForm({
      nombre: admin.nombre ?? '',
      apellido_pa: admin.apellido_pa ?? '',
      apellido_ma: admin.apellido_ma ?? '',
      email: admin.email ?? '',
      password: '',
      password_confirmation: '',
      organizaciones_id: admin.organizacion?.id ? String(admin.organizacion.id) : '',
    })
    setErrores({})
    setErrorGeneral('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    if (guardando) return
    setModalAbierto(false)
    setAdminEditando(null)
  }

  const handleCampo = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: undefined }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')

    const esNuevo = !adminEditando
    const erroresForm = validarFormulario(form, esNuevo)
    if (Object.keys(erroresForm).length > 0) {
      setErrores(erroresForm)
      return
    }

    const payload = {
      nombre: form.nombre.trim(),
      apellido_pa: form.apellido_pa.trim(),
      apellido_ma: form.apellido_ma.trim() || null,
      email: form.email.trim().toLowerCase(),
      organizaciones_id: Number(form.organizaciones_id),
    }

    // La contraseña solo se manda si se escribió
    if (form.password) {
      payload.password = form.password
      payload.password_confirmation = form.password_confirmation
    }

    setGuardando(true)
    try {
      if (adminEditando) {
        await actualizarAdministrador(adminEditando.id, payload)
        setToast('Administrador actualizado correctamente')
      } else {
        await crearAdministrador(payload)
        setToast('Administrador registrado correctamente')
      }
      setModalAbierto(false)
      setAdminEditando(null)
      await cargarAdministradores()
    } catch (err) {
      const delBack = erroresDelBack(err)
      if (delBack) {
        setErrores(delBack)
      } else {
        setErrorGeneral(err?.response?.data?.message || 'No se pudo guardar. Intenta de nuevo.')
      }
    } finally {
      setGuardando(false)
    }
  }

  // ---------- BAJA / REACTIVAR ----------
  const aplicarCambioEstado = async () => {
    if (!confirmarEstado) return
    const nuevoEstado = confirmarEstado.estado === 'A' ? 'I' : 'A'

    setCambiandoEstado(true)
    try {
      await cambiarEstadoAdministrador(confirmarEstado.id, nuevoEstado)
      setToast(nuevoEstado === 'I'
        ? `${confirmarEstado.nombre_completo} fue dado de baja`
        : `${confirmarEstado.nombre_completo} fue reactivado`)
      setConfirmarEstado(null)
      await cargarAdministradores()
    } catch (err) {
      setToast(err?.response?.data?.message || 'No se pudo cambiar el estado.')
      setConfirmarEstado(null)
    } finally {
      setCambiandoEstado(false)
    }
  }

  const darDeBaja = confirmarEstado?.estado === 'A'
  const claseInput = (campo) => (errores[campo] ? 'ls-input-error' : '')

  return (
    <div className="ls-admins">
      {toast && <ToastNotification mensaje={toast} onClose={() => setToast('')} />}

      {/* HEADER */}
      <div className="ls-admins-heading">
        <div>
          <h1>Administradores</h1>
          <p>Gestión de usuarios administradores de las organizaciones</p>
        </div>
        <button type="button" className="ls-admins-btn-nuevo" onClick={abrirNuevo}>
          <Plus size={18} />
          <span>Nuevo administrador</span>
        </button>
      </div>

      {/* PANEL DE TABLA */}
      <section className="ls-admins-panel">

        <div className="ls-admins-panel-heading">
          <h2>Listado de administradores</h2>
        </div>

        <div className="ls-admins-controles">
          <div className="ls-admins-mostrar">
            Administradores: <strong>{administradores.length}</strong>
          </div>
          <label className="ls-admins-busqueda">
            <span>Buscar:</span>
            <input
              type="search"
              placeholder="Buscar por nombre, correo u organización..."
              value={busqueda}
              onChange={(e) => cambiarBusqueda(e.target.value)}
            />
          </label>
        </div>

        <div className="ls-admins-tabla-contenedor">
          <table className="ls-admins-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Organización</th>
                <th>Estado</th>
                <th className="ls-col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adminsVisibles.map((admin) => (
                <tr key={admin.id} className={admin.estado !== 'A' ? 'ls-admin-fila-inactiva' : ''}>
                  <td>{admin.id}</td>
                  <td>
                    <div className="ls-admin-nombre">
                      <div className="ls-admin-avatar">
                        {obtenerIniciales(admin)}
                      </div>
                      <strong>{admin.nombre_completo}</strong>
                    </div>
                  </td>
                  <td>{admin.email}</td>
                  <td>{admin.organizacion?.nombre ?? '—'}</td>
                  <td>
                    <span className={`ls-admin-estado ${admin.estado === 'A' ? 'activo' : 'inactivo'}`}>
                      {admin.estado === 'A' ? 'Activo' : 'Dado de baja'}
                    </span>
                  </td>
                  <td className="ls-col-acciones">
                    <div className="ls-admin-acciones">
                      <button
                        type="button"
                        className="ls-accion-btn modificar"
                        onClick={() => abrirModificar(admin)}
                        title="Modificar"
                      >
                        <Pencil size={17} />
                      </button>
                      {admin.estado === 'A' ? (
                        <button
                          type="button"
                          className="ls-accion-btn eliminar"
                          onClick={() => setConfirmarEstado(admin)}
                          title="Dar de baja"
                        >
                          <Ban size={17} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ls-accion-btn reactivar"
                          onClick={() => setConfirmarEstado(admin)}
                          title="Reactivar"
                        >
                          <RotateCcw size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {adminsVisibles.length === 0 && (
                <tr>
                  <td colSpan="6" className="ls-admins-vacio">
                    {cargando
                      ? 'Cargando administradores...'
                      : errorCarga || 'No se encontraron administradores.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="ls-admins-paginacion">
          <span>
            Mostrando {adminsVisibles.length} de {adminsFiltrados.length} registros
          </span>
          <div className="ls-admins-paginacion-botones">
            <button disabled={paginaSegura === 1} onClick={() => setPaginaActual(paginaSegura - 1)}>Anterior</button>
            <span>{paginaSegura} / {totalPaginas}</span>
            <button disabled={paginaSegura === totalPaginas} onClick={() => setPaginaActual(paginaSegura + 1)}>Siguiente</button>
          </div>
        </div>
      </section>

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div className="ls-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) cerrarModal() }}>
          <section className="ls-modal">
            <div className="ls-modal-header">
              <div>
                <h2>{adminEditando ? 'Modificar administrador' : 'Nuevo administrador'}</h2>
                <p>Ingresa los datos del administrador.</p>
              </div>
              <button type="button" className="ls-modal-cerrar" onClick={cerrarModal}><X size={20} /></button>
            </div>

            <form onSubmit={guardar} noValidate>
              <div className="ls-modal-body">
                {errorGeneral && <p className="ls-form-error-general">{errorGeneral}</p>}

                <div className="ls-form-group">
                  <label>Nombre(s) *</label>
                  <input
                    name="nombre"
                    type="text"
                    maxLength={100}
                    placeholder="Ej: Juan Carlos"
                    value={form.nombre}
                    onChange={handleCampo}
                    className={claseInput('nombre')}
                  />
                  {errores.nombre && <span className="ls-form-error">{errores.nombre}</span>}
                </div>

                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label>Apellido paterno *</label>
                    <input
                      name="apellido_pa"
                      type="text"
                      maxLength={100}
                      placeholder="Ej: Pérez"
                      value={form.apellido_pa}
                      onChange={handleCampo}
                      className={claseInput('apellido_pa')}
                    />
                    {errores.apellido_pa && <span className="ls-form-error">{errores.apellido_pa}</span>}
                  </div>
                  <div className="ls-form-group">
                    <label>Apellido materno</label>
                    <input
                      name="apellido_ma"
                      type="text"
                      maxLength={100}
                      placeholder="Ej: López"
                      value={form.apellido_ma}
                      onChange={handleCampo}
                      className={claseInput('apellido_ma')}
                    />
                    {errores.apellido_ma && <span className="ls-form-error">{errores.apellido_ma}</span>}
                  </div>
                </div>

                <div className="ls-form-group">
                  <label>Correo electrónico *</label>
                  <input
                    name="email"
                    type="email"
                    maxLength={150}
                    placeholder="Ej: juan@empresa.com"
                    value={form.email}
                    onChange={handleCampo}
                    className={claseInput('email')}
                  />
                  {errores.email && <span className="ls-form-error">{errores.email}</span>}
                </div>

                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label>{adminEditando ? 'Nueva contraseña' : 'Contraseña *'}</label>
                    <input
                      name="password"
                      type="password"
                      maxLength={72}
                      autoComplete="new-password"
                      placeholder={adminEditando ? 'Déjala vacía para no cambiarla' : 'Mínimo 8, con letra y número'}
                      value={form.password}
                      onChange={handleCampo}
                      className={claseInput('password')}
                    />
                    {errores.password && <span className="ls-form-error">{errores.password}</span>}
                  </div>
                  <div className="ls-form-group">
                    <label>{adminEditando ? 'Confirmar nueva contraseña' : 'Confirmar contraseña *'}</label>
                    <input
                      name="password_confirmation"
                      type="password"
                      maxLength={72}
                      autoComplete="new-password"
                      placeholder="Repite la contraseña"
                      value={form.password_confirmation}
                      onChange={handleCampo}
                      className={claseInput('password_confirmation')}
                    />
                    {errores.password_confirmation && (
                      <span className="ls-form-error">{errores.password_confirmation}</span>
                    )}
                  </div>
                </div>

                <div className="ls-form-group">
                  <label>Organización *</label>
                  <select
                    name="organizaciones_id"
                    value={form.organizaciones_id}
                    onChange={handleCampo}
                    className={claseInput('organizaciones_id')}
                  >
                    <option value="" disabled>
                      {organizacionesDisponibles.length === 0
                        ? 'No hay organizaciones sin administrador'
                        : 'Selecciona la organización'}
                    </option>
                    {organizacionesDisponibles.map((org) => (
                      <option key={org.id} value={org.id}>{org.nombre}</option>
                    ))}
                  </select>
                  {errores.organizaciones_id && (
                    <span className="ls-form-error">{errores.organizaciones_id}</span>
                  )}
                </div>
              </div>

              <div className="ls-modal-footer">
                <button type="button" className="ls-modal-cancelar" onClick={cerrarModal} disabled={guardando}>Cancelar</button>
                <button type="submit" className="ls-modal-guardar" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL CONFIRMAR BAJA / REACTIVAR */}
      {confirmarEstado && (
        <div className="ls-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !cambiandoEstado) setConfirmarEstado(null) }}>
          <section className="ls-modal ls-modal-confirmacion">
            <button type="button" className="ls-modal-cerrar-esquina" onClick={() => !cambiandoEstado && setConfirmarEstado(null)}>
              <X size={16} />
            </button>
            <div className="ls-modal-icono-badge">
              {darDeBaja ? <AlertTriangle size={26} /> : <RotateCcw size={26} />}
            </div>
            <h2 className="ls-modal-titulo-centro">
              {darDeBaja ? '¿Dar de baja al administrador?' : '¿Reactivar al administrador?'}
            </h2>
            <div className="ls-modal-cuerpo-centro">
              <p className="ls-modal-texto-principal">
                {darDeBaja ? 'Vas a dar de baja a ' : 'Vas a reactivar a '}
                <strong>{confirmarEstado.nombre_completo}</strong>.
              </p>
              <p className="ls-modal-texto-secundario">
                {darDeBaja
                  ? 'Se cerrarán sus sesiones y ya no podrá iniciar sesión. Su organización quedará disponible para otro administrador.'
                  : 'Podrá volver a iniciar sesión, siempre que su organización no tenga otro administrador activo.'}
              </p>
            </div>
            <div className="ls-modal-footer-botones">
              <button type="button" className="ls-btn-secundario" onClick={() => setConfirmarEstado(null)} disabled={cambiandoEstado}>Cancelar</button>
              <button type="button" className="ls-btn-primario" onClick={aplicarCambioEstado} disabled={cambiandoEstado}>
                {cambiandoEstado
                  ? 'Guardando...'
                  : darDeBaja ? 'Sí, dar de baja' : 'Sí, reactivar'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}