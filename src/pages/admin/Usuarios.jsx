import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario as eliminarUsuarioApi,
} from '../../api/usuarios'
import '../../styles/admin/Usuarios.css'

const UUID_VALIDO =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const formVacio = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  identificador: '',
  contrasena: '',
  telefono: '',
  estado: true,
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
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido_paterno || ''} ${usuario.apellido_materno || ''}`
    return (
      nombreCompleto.toLowerCase().includes(termino) ||
      (usuario.identificador || '').toLowerCase().includes(termino) ||
      (usuario.correo || '').toLowerCase().includes(termino)
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
      apellido_paterno: usuario.apellido_paterno || '',
      apellido_materno: usuario.apellido_materno || '',
      identificador: usuario.identificador || '',
      contrasena: '',
      telefono: usuario.telefono || '',
      estado: usuario.estado ?? true,
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

    if (!form.apellido_paterno.trim()) {
      nuevos.apellido_paterno = 'El apellido paterno es obligatorio.'
    } else if (form.apellido_paterno.trim().length > 100) {
      nuevos.apellido_paterno = 'Máximo 100 caracteres.'
    }

    if (!form.apellido_materno.trim()) {
      nuevos.apellido_materno = 'El apellido materno es obligatorio.'
    } else if (form.apellido_materno.trim().length > 100) {
      nuevos.apellido_materno = 'Máximo 100 caracteres.'
    }

    if (!form.identificador.trim()) {
      nuevos.identificador = 'El identificador es obligatorio.'
    } else if (!UUID_VALIDO.test(form.identificador.trim())) {
      nuevos.identificador =
        'Debe ser un UUID válido. Ejemplo: 550e8400-e29b-41d4-a716-446655440000'
    }

    if (!usuarioEditando) {
      if (!form.contrasena) {
        nuevos.contrasena = 'La contraseña es obligatoria.'
      } else if (form.contrasena.length < 8) {
        nuevos.contrasena = 'Mínimo 8 caracteres.'
      }
    } else if (form.contrasena && form.contrasena.length < 8) {
      nuevos.contrasena = 'Mínimo 8 caracteres.'
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
    // El correo, la organización y el rol NO se envían desde aquí: el backend
    // determina la organización desde el administrador autenticado y asigna el
    // rol USUARIO automáticamente. El correo queda NULL para estos usuarios.
    const payload = {
      nombre: form.nombre.trim(),
      apellido_paterno: form.apellido_paterno.trim(),
      apellido_materno: form.apellido_materno.trim(),
      identificador: form.identificador.trim(),
      telefono: form.telefono.trim(),
      estado: !!form.estado,
    }
    // La contraseña solo se envía si se escribió (obligatoria al crear).
    if (form.contrasena) {
      payload.contrasena = form.contrasena
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
    const partes = [usuario.nombre, usuario.apellido_paterno].filter(Boolean)
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
                        {[usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno]
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
                      name="apellido_paterno"
                      type="text"
                      placeholder="Apellido paterno"
                      value={form.apellido_paterno}
                      onChange={handleCampo}
                      maxLength={100}
                    />
                    {errores.apellido_paterno && (
                      <small style={{ color: '#a83232' }}>{errores.apellido_paterno}</small>
                    )}
                  </div>
                </div>

                {/* Fila 2: Apellido materno | Teléfono */}
                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label htmlFor="u-apellido-ma">Apellido materno</label>
                    <input
                      id="u-apellido-ma"
                      name="apellido_materno"
                      type="text"
                      placeholder="Apellido materno"
                      value={form.apellido_materno}
                      onChange={handleCampo}
                      maxLength={100}
                    />
                    {errores.apellido_materno && (
                      <small style={{ color: '#a83232' }}>{errores.apellido_materno}</small>
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
                    <label htmlFor="u-identificador">Identificador único (UUID)</label>
                    <input
                      id="u-identificador"
                      name="identificador"
                      type="text"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={form.identificador}
                      onChange={handleCampo}
                      maxLength={100}
                    />
                    {errores.identificador && (
                      <small style={{ color: '#a83232' }}>{errores.identificador}</small>
                    )}
                  </div>

                  <div className="ls-form-group">
                    <label htmlFor="u-contrasena">
                      {usuarioEditando ? 'Contraseña' : 'Contraseña'}
                    </label>
                    <input
                      id="u-contrasena"
                      name="contrasena"
                      type="password"
                      placeholder={usuarioEditando ? 'Dejar en blanco para conservar' : '••••••••'}
                      value={form.contrasena}
                      onChange={handleCampo}
                      autoComplete="new-password"
                    />
                    {errores.contrasena && (
                      <small style={{ color: '#a83232' }}>{errores.contrasena}</small>
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

      {/* MODAL CONFIRMAR BAJA */}
      {confirmarBaja && (
        <div
          className="ls-modal-fondo"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !eliminando) setConfirmarBaja(null)
          }}
        >
          <section
            className="ls-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ls-baja-titulo"
            style={{ maxWidth: 440 }}
          >
            <div className="ls-modal-header">
              <div>
                <h2 id="ls-baja-titulo">Dar de baja usuario</h2>
                <p>Esta acción marcará al usuario como inactivo.</p>
              </div>

              <button
                type="button"
                className="ls-modal-cerrar"
                onClick={() => !eliminando && setConfirmarBaja(null)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ls-modal-body">
              <p style={{ color: '#52675d', fontSize: 14 }}>
                ¿Deseas dar de baja a{' '}
                <strong>
                  {[confirmarBaja.nombre, confirmarBaja.apellido_paterno]
                    .filter(Boolean)
                    .join(' ')}
                </strong>
                ? El usuario dejará de aparecer en el listado de usuarios activos.
              </p>
            </div>

            <div className="ls-modal-footer">
              <button
                type="button"
                className="ls-modal-cancelar"
                onClick={() => setConfirmarBaja(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="ls-modal-guardar"
                onClick={confirmarEliminar}
                disabled={eliminando}
              >
                {eliminando ? 'Dando de baja...' : 'Dar de baja'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
