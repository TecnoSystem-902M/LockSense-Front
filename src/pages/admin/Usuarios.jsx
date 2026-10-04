
import { useState } from 'react'
import { useLockSense } from '../../context/LockSenseContext'
import {
  UserPlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import '../../styles/admin/Usuarios.css'


const UUID_VALIDO =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function Usuarios() {
  const {
    usuarios,
    agregarUsuario,
    modificarUsuario,
    eliminarUsuario: eliminarUsuarioContexto,
  } = useLockSense()

  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [nombre, setNombre] = useState('')
  const [uuid, setUuid] = useState('')
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const registrosPorPagina = 5
  const [paginaActual, setPaginaActual] = useState(1)

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termino = busqueda.trim().toLowerCase()

    return (
      usuario.nombre.toLowerCase().includes(termino) ||
      usuario.uuid.toLowerCase().includes(termino)
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
    setNombre('')
    setUuid('')
    setError('')
    setModalAbierto(true)
  }

  const abrirModificar = (usuario) => {
    setUsuarioEditando(usuario)
    setNombre(usuario.nombre)
    setUuid(usuario.uuid)
    setError('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setUsuarioEditando(null)
    setError('')
  }

  const guardarUsuario = (e) => {
    e.preventDefault()

    const nombreLimpio = nombre.trim()
    const uuidLimpio = uuid.trim()

    if (!nombreLimpio || !uuidLimpio) {
      setError('Completa todos los campos.')
      return
    }

    if (!UUID_VALIDO.test(uuidLimpio)) {
      setError('Escribe un UUID válido. Ejemplo: 550e8400-e29b-41d4-a716-446655440000')
      return
    }

    const uuidDuplicado = usuarios.some(
      (usuario) =>
        usuario.uuid.toLowerCase() === uuidLimpio.toLowerCase() &&
        usuario.id !== usuarioEditando?.id
    )

    if (uuidDuplicado) {
      setError('Este UUID ya está registrado.')
      return
    }

    if (usuarioEditando) {
      modificarUsuario({
        ...usuarioEditando,
        nombre: nombreLimpio,
        uuid: uuidLimpio,
      })
    } else {
      const nuevoId =
        usuarios.length > 0
          ? Math.max(...usuarios.map((usuario) => usuario.id)) + 1
          : 1

      agregarUsuario({
        id: nuevoId,
        nombre: nombreLimpio,
        uuid: uuidLimpio,
      })
    }

    cerrarModal()
  }

  const eliminarUsuario = (usuario) => {
    const confirmar = window.confirm(
      `¿Deseas eliminar al usuario "${usuario.nombre}"?`
    )

    if (!confirmar) return

    eliminarUsuarioContexto(usuario.id)
  }

  return (
    <div className="ls-usuarios">
      <div className="ls-usuarios-heading">
        <div>
          <h1>Usuarios</h1>
          <p>Administración de usuarios registrados en LOCKSENSE</p>
        </div>

        <button
          type="button"
          className="ls-usuario-nuevo"
          onClick={abrirNuevo}
        >
          <UserPlus size={18} />
          <span>Nuevo usuario</span>
        </button>
      </div>

      <section className="ls-usuarios-panel">
        <div className="ls-usuarios-panel-heading">
          <h2>Listado de usuarios</h2>
        </div>

        <div className="ls-usuarios-controles">
          <div className="ls-usuarios-mostrar" aria-live="polite">
            Usuarios registrados: <strong>{usuarios.length}</strong>
          </div>

          <label className="ls-usuarios-busqueda">
            <span>Buscar:</span>
            <input
              type="search"
              placeholder="Buscar por nombre o UUID..."
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
                <th>UUID</th>
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
                        {usuario.nombre
                          .split(' ')
                          .slice(0, 2)
                          .map((parte) => parte[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <strong>{usuario.nombre}</strong>
                    </div>
                  </td>

                  <td>
                    <code className="ls-usuario-uuid">
                      {usuario.uuid}
                    </code>
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
                        title="Eliminar usuario"
                        aria-label={`Eliminar a ${usuario.nombre}`}
                        onClick={() => eliminarUsuario(usuario)}
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
                    {busqueda
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

            <form onSubmit={guardarUsuario}>
              <div className="ls-modal-body">
                {error && (
                  <div className="ls-form-error" role="alert">
                    {error}
                  </div>
                )}

                <div className="ls-form-group">
                  <label htmlFor="usuario-nombre">Nombre</label>
                  <input
                    id="usuario-nombre"
                    type="text"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={100}
                    autoFocus
                    required
                  />
                </div>

                <div className="ls-form-group">
                  <label htmlFor="usuario-uuid">
                    Identificador único (UUID)
                  </label>
                  <input
                    id="usuario-uuid"
                    type="text"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                    required
                  />
                  <small>
                    Debe ser un UUID válido y no estar registrado.
                  </small>
                </div>
              </div>

              <div className="ls-modal-footer">
                <button
                  type="button"
                  className="ls-modal-cancelar"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button type="submit" className="ls-modal-guardar">
                  {usuarioEditando ? 'Guardar cambios' : 'Registrar usuario'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}