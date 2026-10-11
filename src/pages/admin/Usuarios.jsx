import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus,
  Pencil,
  Trash2,
  X,
  UserX,
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario as eliminarUsuarioApi,
} from '../../api/usuarios'
import '../../styles/admin/Usuarios.css'

const formVacio = {
  nombre: '',
  apellido_pa: '',
  apellido_ma: '',
  identificador: '',
  email: '',
  password: '',
  telefono: '',
  estado: 'A',
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(false)
  const [cargaError, setCargaError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [confirmarBaja, setConfirmarBaja] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const [mostrarToast, setMostrarToast] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const registrosPorPagina = 5
  const [paginaActual, setPaginaActual] = useState(1)

  const cargarUsuarios = useCallback(async () => {
    setCargando(true)
    setCargaError('')
    try {
      const data = await listarUsuarios()
      setUsuarios(Array.isArray(data) ? data : [])
    } catch {
      setUsuarios([])
      setCargaError('No se pudieron cargar los usuarios.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return true
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido_pa || ''} ${usuario.apellido_ma || ''}`
    return (
      nombreCompleto.toLowerCase().includes(termino) ||
      (usuario.identificador || '').toLowerCase().includes(termino) ||
      (usuario.email || '').toLowerCase().includes(termino)
    )
  })

  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosFiltrados.length / registrosPorPagina)
  )
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const indiceInicial = (paginaSegura - 1) * registrosPorPagina
  const usuariosVisibles = usuariosFiltrados.slice(
    indiceInicial,
    indiceInicial + registrosPorPagina
  )

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor)
    setPaginaActual(1)
  }

  const abrirNuevo = () => {
    setUsuarioEditando(null)
    setForm(formVacio)
    setErrores({})
    setErrorGeneral('')
    setModalAbierto(true)
  }

  const abrirModificar = (usuario) => {
    setUsuarioEditando(usuario)
    setForm({
      nombre: usuario.nombre || '',
      apellido_pa: usuario.apellido_pa || '',
      apellido_ma: usuario.apellido_ma || '',
      identificador: usuario.identificador || '',
      email: usuario.email || '',
      password: '',
      telefono: usuario.telefono || '',
      estado: usuario.estado ?? 'A',
    })
    setErrores({})
    setErrorGeneral('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    if (guardando) return
    setModalAbierto(false)
    setUsuarioEditando(null)
    setErrores({})
    setErrorGeneral('')
  }

  const handleCampo = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }))
    }
    if (errorGeneral) setErrorGeneral('')
  }

  const validarForm = () => {
    const nuevos = {}

    if (!form.nombre.trim()) {
      nuevos.nombre = 'El nombre es obligatorio.'
    } else if (form.nombre.trim().length > 100) {
      nuevos.nombre = 'Máximo 100 caracteres.'
    }

    if (!form.apellido_pa.trim()) {
      nuevos.apellido_pa = 'El apellido paterno es obligatorio.'
    } else if (form.apellido_pa.trim().length > 100) {
      nuevos.apellido_pa = 'Máximo 100 caracteres.'
    }

    if (!form.apellido_ma.trim()) {
      nuevos.apellido_ma = 'El apellido materno es obligatorio.'
    } else if (form.apellido_ma.trim().length > 100) {
      nuevos.apellido_ma = 'Máximo 100 caracteres.'
    }

    if (!form.identificador.trim()) {
      nuevos.identificador = 'El identificador es obligatorio.'
    } else if (form.identificador.trim().length > 100) {
      nuevos.identificador = 'Máximo 100 caracteres.'
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nuevos.email = 'Ingresa un correo válido.'
    }

    if (!usuarioEditando) {
      if (!form.password) {
        nuevos.password = 'La contraseña es obligatoria.'
      } else if (form.password.length < 8) {
        nuevos.password = 'Mínimo 8 caracteres.'
      }
    } else if (form.password && form.password.length < 8) {
      nuevos.password = 'Mínimo 8 caracteres.'
    }

    if (!form.telefono.trim()) {
      nuevos.telefono = 'El número es obligatorio.'
    } else if (form.telefono.trim().length > 20) {
      nuevos.telefono = 'Máximo 20 caracteres.'
    }

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const construirPayload = () => {
    const payload = {
      nombre: form.nombre.trim(),
      apellido_pa: form.apellido_pa.trim(),
      apellido_ma: form.apellido_ma.trim(),
      identificador: form.identificador.trim(),
      telefono: form.telefono.trim(),
      estado: form.estado,
    }
    if (form.email.trim()) {
      payload.email = form.email.trim()
    }
    if (form.password) {
      payload.password = form.password
    }
    return payload
  }

  const mapearErrores422 = (err) => {
    const resp = err?.response
    if (resp?.status === 422 && resp.data?.errors) {
      const mapeados = {}
      Object.keys(resp.data.errors).forEach((campo) => {
        mapeados[campo] = resp.data.errors[campo][0]
      })
      setErrores(mapeados)
      return true
    }
    return false
  }

  const guardar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')

    if (!validarForm()) return

    setGuardando(true)
    try {
      if (usuarioEditando) {
        await actualizarUsuario(usuarioEditando.id, construirPayload())
      } else {
        await crearUsuario(construirPayload())
      }
      await cargarUsuarios()
      setModalAbierto(false)
      setUsuarioEditando(null)
    } catch (err) {
      if (!mapearErrores422(err)) {
        setErrorGeneral(
          err?.response?.data?.message ||
            'No se pudo guardar el usuario. Intenta de nuevo.'
        )
      }
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminar = async () => {
    if (!confirmarBaja) return
    setEliminando(true)
    try {
      await eliminarUsuarioApi(confirmarBaja.id)
      setConfirmarBaja(null)
      await cargarUsuarios()
      setMostrarToast(true)
    } catch {
      setErrorGeneral('No se pudo dar de baja al usuario.')
      setConfirmarBaja(null)
    } finally {
      setEliminando(false)
    }
  }

  const iniciales = (usuario) => {
    const partes = [usuario.nombre, usuario.apellido_pa].filter(Boolean)
    return partes
      .map((p) => p[0])
      .join('')
      .toUpperCase() || '?'
  }

  return (
    <div className="ls-usuarios">
      {mostrarToast && (
        <ToastNotification
          mensaje="Usuario eliminado correctamente"
          onClose={() => setMostrarToast(false)}
        />
      )}

      <div className="ls-usuarios-heading">
        <div>
          <h1>Usuarios</h1>
          <p>Administración de usuarios registrados en LOCKSENSE</p>
        </div>

        <button
          type="button"
          className="ls-usuario-nuevo"
          onClick={abrirNuevo}
          title="Registrar nuevo usuario"
        >
          <UserPlus size={18} />
          <span>Nuevo usuario</span>
        </button>
      </div>

      <section className="ls-usuarios-panel">
        <div className="ls-usuarios-panel-heading">
          <h2>Listado de usuarios</h2>
        </div>

        {cargaError && (
          <div className="ls-form-error" role="alert" style={{ marginBottom: 16 }}>
            {cargaError}
          </div>
        )}

        <div className="ls-usuarios-controles">
          <div className="ls-usuarios-mostrar" aria-live="polite">
            Usuarios registrados: <strong>{usuarios.length}</strong>
          </div>

          <label className="ls-usuarios-busqueda">
            <span>Buscar:</span>
            <input
              type="search"
              placeholder="Buscar por nombre, identificador o correo..."
              value={busqueda}
              onChange={(e) => cambiarBusqueda(e.target.value)}
            />
          </label>
        </div>

        <div className="ls-usuarios-tabla-contenedor">
          <table className="ls-usuarios-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Identificador</th>
                <th className="ls-col-acciones">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosVisibles.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>

                  <td>
                    <div className="ls-usuario-nombre">
                      <div className="ls-usuario-avatar">
                        {iniciales(usuario)}
                      </div>
                      <strong>
                        {[usuario.nombre, usuario.apellido_pa, usuario.apellido_ma]
                          .filter(Boolean)
                          .join(' ')}
                      </strong>
                    </div>
                  </td>

                  <td>
                    <code className="ls-usuario-uuid">{usuario.identificador}</code>
                  </td>

                  <td className="ls-col-acciones">
                    <div className="ls-usuario-acciones">
                      <button
                        type="button"
                        className="ls-accion-btn modificar"
                        title="Modificar usuario"
                        aria-label={`Modificar a ${usuario.nombre}`}
                        onClick={() => abrirModificar(usuario)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="ls-accion-btn eliminar"
                        title="Dar de baja usuario"
                        aria-label={`Dar de baja a ${usuario.nombre}`}
                        onClick={() => setConfirmarBaja(usuario)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {usuariosVisibles.length === 0 && (
                <tr>
                  <td colSpan="4" className="ls-usuarios-vacio">
                    {cargando
                      ? 'Cargando usuarios...'
                      : busqueda
                      ? 'No se encontraron usuarios.'
                      : 'No hay usuarios registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ls-usuarios-paginacion">
          <span>
            {usuariosFiltrados.length === 0
              ? 'Mostrando 0 registros'
              : `Mostrando ${indiceInicial + 1} a ${Math.min(
                  indiceInicial + registrosPorPagina,
                  usuariosFiltrados.length
                )} de ${usuariosFiltrados.length} registros`}
          </span>

          <div className="ls-usuarios-paginacion-botones">
            <button
              type="button"
              disabled={paginaSegura === 1}
              onClick={() => setPaginaActual(paginaSegura - 1)}
            >
              Anterior
            </button>

            <span>
              {paginaSegura} / {totalPaginas}
            </span>

            <button
              type="button"
              disabled={paginaSegura === totalPaginas}
              onClick={() => setPaginaActual(paginaSegura + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div
          className="ls-modal-fondo"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cerrarModal()
          }}
        >
          <section
            className="ls-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ls-modal-titulo"
          >
            <div className="ls-modal-header">
              <div>
                <h2 id="ls-modal-titulo">
                  {usuarioEditando ? 'Modificar usuario' : 'Nuevo usuario'}
                </h2>
                <p>
                  {usuarioEditando
                    ? 'Actualiza los datos del usuario.'
                    : 'Completa los datos para registrar un usuario.'}
                </p>
              </div>

              <button
                type="button"
                className="ls-modal-cerrar"
                onClick={cerrarModal}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar}>
              <div className="ls-modal-body">
                {errorGeneral && (
                  <div className="ls-form-error" role="alert">
                    {errorGeneral}
                  </div>
                )}

                {/* Fila 1: Nombre | Apellido paterno */}
                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label htmlFor="u-nombre">Nombre</label>
                    <input
                      id="u-nombre"
                      name="nombre"
                      type="text"
                      placeholder="Nombre(s)"
                      value={form.nombre}
                      onChange={handleCampo}
                      maxLength={100}
                      autoFocus
                    />
                    {errores.nombre && <small style={{ color: '#a83232' }}>{errores.nombre}</small>}
                  </div>

                  <div className="ls-form-group">
                    <label htmlFor="u-apellido-pa">Apellido paterno</label>
                    <input
                      id="u-apellido-pa"
                      name="apellido_pa"
                      type="text"
                      placeholder="Apellido paterno"
                      value={form.apellido_pa}
                      onChange={handleCampo}
                      maxLength={100}
                    />
                    {errores.apellido_pa && (
                      <small style={{ color: '#a83232' }}>{errores.apellido_pa}</small>
                    )}
                  </div>
                </div>

                {/* Fila 2: Apellido materno | Teléfono */}
                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label htmlFor="u-apellido-ma">Apellido materno</label>
                    <input
                      id="u-apellido-ma"
                      name="apellido_ma"
                      type="text"
                      placeholder="Apellido materno"
                      value={form.apellido_ma}
                      onChange={handleCampo}
                      maxLength={100}
                    />
                    {errores.apellido_ma && (
                      <small style={{ color: '#a83232' }}>{errores.apellido_ma}</small>
                    )}
                  </div>

                  <div className="ls-form-group">
                    <label htmlFor="u-telefono">Número</label>
                    <input
                      id="u-telefono"
                      name="telefono"
                      type="text"
                      placeholder="+52 ..."
                      value={form.telefono}
                      onChange={handleCampo}
                      maxLength={20}
                    />
                    {errores.telefono && (
                      <small style={{ color: '#a83232' }}>{errores.telefono}</small>
                    )}
                  </div>
                </div>

                {/* Fila 3: Identificador | Contraseña */}
                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label htmlFor="u-identificador">Identificador único</label>
                    <input
                      id="u-identificador"
                      name="identificador"
                      type="text"
                      placeholder="Ej: A2023-0456, EMP-001, matrícula..."
                      value={form.identificador}
                      onChange={handleCampo}
                      maxLength={100}
                    />
                    {errores.identificador && (
                      <small style={{ color: '#a83232' }}>{errores.identificador}</small>
                    )}
                  </div>

                  <div className="ls-form-group">
                    <label htmlFor="u-password">
                      {usuarioEditando ? 'Contraseña' : 'Contraseña'}
                    </label>
                    <input
                      id="u-password"
                      name="password"
                      type="password"
                      placeholder={usuarioEditando ? 'Dejar en blanco para conservar' : '••••••••'}
                      value={form.password}
                      onChange={handleCampo}
                      autoComplete="new-password"
                    />
                    {errores.password && (
                      <small style={{ color: '#a83232' }}>{errores.password}</small>
                    )}
                  </div>
                </div>
              </div>

              <div className="ls-modal-footer">
                <button
                  type="button"
                  className="ls-modal-cancelar"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button type="submit" className="ls-modal-guardar" disabled={guardando}>
                  {guardando
                    ? 'Guardando...'
                    : usuarioEditando
                      ? 'Guardar cambios'
                      : 'Registrar usuario'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL CONFIRMAR BAJA (ESTILO NUEVO ACORDE A LA IMAGEN) */}
      {confirmarBaja && (
        <div
          className="ls-modal-fondo"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !eliminando) setConfirmarBaja(null)
          }}
        >
          <section
            className="ls-modal ls-modal-confirmacion"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ls-baja-titulo"
          >
            {/* Botón X de cierre en la esquina superior derecha */}
            <button
              type="button"
              className="ls-modal-cerrar-esquina"
              onClick={() => !eliminando && setConfirmarBaja(null)}
              aria-label="Cerrar modal"
            >
              <X size={16} />
            </button>

            {/* Círculo superior con icono */}
            <div className="ls-modal-icono-badge">
              <UserX size={26} />
            </div>

            {/* Título */}
            <h2 id="ls-baja-titulo" className="ls-modal-titulo-centro">
              ¿Dar de baja usuario?
            </h2>

            {/* Descripción central */}
            <div className="ls-modal-cuerpo-centro">
              <p className="ls-modal-texto-principal">
                ¿Estás seguro de que quieres dar de baja a{' '}
                <strong>
                  {[confirmarBaja.nombre, confirmarBaja.apellido_pa]
                    .filter(Boolean)
                    .join(' ')}
                </strong>
                ?
              </p>
              <p className="ls-modal-texto-secundario">
                El usuario dejará de aparecer en el listado de usuarios activos. El historial de accesos se conservará.
              </p>
            </div>

            {/* Botones inferiores */}
            <div className="ls-modal-footer-botones">
              <button
                type="button"
                className="ls-btn-secundario"
                onClick={() => setConfirmarBaja(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="ls-btn-primario"
                onClick={confirmarEliminar}
                disabled={eliminando}
              >
                {eliminando ? 'Dando de baja...' : 'Sí, dar de baja'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}