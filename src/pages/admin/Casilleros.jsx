import { useLockSense } from '../../context/LockSenseContext'
import { useState } from 'react'
import {
  LockKeyhole,
  UserRound,
  Ban,
  UnlockKeyhole,
  Trash2,
  Search,
} from 'lucide-react'
import '../../styles/admin/Casilleros.css'

const casillerosIniciales = [
  {
    id: 1,
    numero: 'Casillero #1',
    estado: 'Asignado',
    usuarioId: null,
    usuario: 'Carlos Hernández',
    uid: 'RFID-001',
  },
  {
    id: 2,
    numero: 'Casillero #2',
    estado: 'Sin asignar',
    usuarioId: null,
    usuario: null,
    uid: '',
  },
  {
    id: 3,
    numero: 'Casillero #3',
    estado: 'Bloqueado',
    usuarioId: null,
    usuario: 'María González',
    uid: 'RFID-003',
  },
  {
    id: 4,
    numero: 'Casillero #4',
    estado: 'Asignado',
    usuarioId: null,
    usuario: 'Luis Martínez',
    uid: 'RFID-004',
  },
  {
    id: 5,
    numero: 'Casillero #5',
    estado: 'Bloqueado',
    usuarioId: null,
    usuario: 'Ana López',
    uid: 'RFID-005',
  },
  {
    id: 6,
    numero: 'Casillero #6',
    estado: 'Sin asignar',
    usuarioId: null,
    usuario: null,
    uid: '',
  },
]

export default function Casilleros() {
  const [casilleros, setCasilleros] = useState(casillerosIniciales)

  const [busqueda, setBusqueda] = useState('')

  const { usuarios } = useLockSense()

  const [casilleroSeleccionado, setCasilleroSeleccionado] = useState(null)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [uidRfid, setUidRfid] = useState('')
  const [errorAsignacion, setErrorAsignacion] = useState('')

  const [usuarioInfo, setUsuarioInfo] = useState(null)

  const asignados = casilleros.filter(
    c => c.estado === 'Asignado'
  ).length

  const bloqueados = casilleros.filter(
    c => c.estado === 'Bloqueado'
  ).length

  const casillerosFiltrados = casilleros.filter(casillero => {
    const texto = busqueda.toLowerCase().trim()

    if (!texto) return true

    return (
      casillero.numero.toLowerCase().includes(texto) ||
      (casillero.usuario &&
        casillero.usuario.toLowerCase().includes(texto)) ||
      (casillero.uid &&
        casillero.uid.toLowerCase().includes(texto))
    )
  })

  const cambiarEstado = (id, nuevoEstado) => {
    setCasilleros(actuales =>
      actuales.map(c =>
        c.id === id
          ? {
              ...c,
              estado: nuevoEstado,
              usuarioId:
                nuevoEstado === 'Sin asignar'
                  ? null
                  : c.usuarioId,
              usuario:
                nuevoEstado === 'Sin asignar'
                  ? null
                  : c.usuario,
              uid:
                nuevoEstado === 'Sin asignar'
                  ? ''
                  : c.uid,
            }
          : c
      )
    )
  }

  const abrirAsignacion = casillero => {
    setCasilleroSeleccionado(casillero)
    setUsuarioSeleccionado('')
    setUidRfid('')
    setErrorAsignacion('')
  }

  const asignarCasillero = e => {
    e.preventDefault()

    const uid = uidRfid.trim()

    if (!usuarioSeleccionado || !uid) {
      setErrorAsignacion(
        'Selecciona un usuario y escribe el UID RFID.'
      )
      return
    }

    const uidExiste = casilleros.some(
      c =>
        c.id !== casilleroSeleccionado.id &&
        c.uid.toLowerCase() === uid.toLowerCase()
    )

    if (uidExiste) {
      setErrorAsignacion(
        'Ese UID RFID ya está registrado en otro casillero.'
      )
      return
    }

    const usuario = usuarios.find(
      u => String(u.id) === String(usuarioSeleccionado)
    )

    if (!usuario) {
      setErrorAsignacion(
        'El usuario seleccionado no existe.'
      )
      return
    }

    setCasilleros(actuales =>
      actuales.map(c =>
        c.id === casilleroSeleccionado.id
          ? {
              ...c,
              estado: 'Asignado',
              usuarioId: usuario.id,
              usuario: usuario.nombre,
              uid,
            }
          : c
      )
    )

    setCasilleroSeleccionado(null)
    setUsuarioSeleccionado('')
    setUidRfid('')
    setErrorAsignacion('')
  }

  const eliminarCasillero = id => {
    if (!window.confirm('¿Deseas eliminar este casillero?')) {
      return
    }

    setCasilleros(actuales =>
      actuales.filter(c => c.id !== id)
    )
  }

  const verUsuario = casillero => {
    if (!casillero.usuario) return

    setUsuarioInfo(casillero)
  }

  return (
    <div className="ls-casilleros">

      {/* ENCABEZADO PRINCIPAL */}
      <div className="ls-casilleros-heading">
        <div>
          <h1>Administrar Casilleros</h1>
          <p>
            Administra y monitorea los casilleros registrados.
          </p>
        </div>
      </div>

      {/* PANEL DE MONITOREO */}
      <section className="ls-casilleros-panel">

        <div className="ls-casilleros-panel-heading">
          <div>
            <h2>Monitoreo de Casilleros</h2>
            <p>
              {casilleros.length} casilleros · {asignados} asignados ·{' '}
              {bloqueados} bloqueados
            </p>
          </div>

          {/* BUSCADOR */}
          <div className="ls-casilleros-busqueda">
            <Search size={17} />

            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar casillero, usuario o UID..."
              aria-label="Buscar casillero"
            />
          </div>
        </div>

        {/* TARJETAS */}
        <div className="ls-casilleros-grid-scroll">
          <div className="ls-casilleros-grid">

            {casillerosFiltrados.length > 0 ? (
              casillerosFiltrados.map(casillero => (
                <article
                  className={`ls-casillero-card ${casillero.estado
                    .toLowerCase()
                    .replaceAll(' ', '-')}`}
                  key={casillero.id}
                >

                  {/* TÍTULO */}
                  <div className="ls-casillero-card-titulo">
                    <LockKeyhole
                      size={34}
                      strokeWidth={3}
                    />

                    <h3>{casillero.numero}</h3>
                  </div>

                  {/* ESTADO */}
                  <span
                    className={`ls-casillero-card-estado ${casillero.estado
                      .toLowerCase()
                      .replaceAll(' ', '-')}`}
                  >
                    {casillero.estado}
                  </span>

                  {/* ACCIONES */}
                  {casillero.estado === 'Sin asignar' ? (
                    <button
                      type="button"
                      className="ls-casillero-asignar"
                      onClick={() =>
                        abrirAsignacion(casillero)
                      }
                    >
                      Asignar Casillero
                    </button>
                  ) : (
                    <div className="ls-casillero-card-acciones">

                      {/* VER USUARIO */}
                      <button
                        type="button"
                        className="ls-casillero-boton usuario"
                        title="Ver usuario asignado"
                        aria-label="Ver usuario asignado"
                        onClick={() =>
                          verUsuario(casillero)
                        }
                      >
                        <UserRound
                          size={28}
                          fill="currentColor"
                        />
                      </button>

                      {/* BLOQUEAR / DESBLOQUEAR */}
                      <button
                        type="button"
                        className="ls-casillero-boton bloqueo"
                        title={
                          casillero.estado === 'Bloqueado'
                            ? 'Desbloquear'
                            : 'Bloquear'
                        }
                        aria-label={
                          casillero.estado === 'Bloqueado'
                            ? 'Desbloquear casillero'
                            : 'Bloquear casillero'
                        }
                        onClick={() =>
                          cambiarEstado(
                            casillero.id,
                            casillero.estado ===
                              'Bloqueado'
                              ? 'Asignado'
                              : 'Bloqueado'
                          )
                        }
                      >
                        <Ban size={27} />
                      </button>

                      {/* LIBERAR */}
                      <button
                        type="button"
                        className="ls-casillero-boton liberar"
                        title="Liberar casillero"
                        aria-label="Liberar casillero"
                        onClick={() =>
                          cambiarEstado(
                            casillero.id,
                            'Sin asignar'
                          )
                        }
                      >
                        <UnlockKeyhole
                          size={27}
                          fill="currentColor"
                        />
                      </button>

                    </div>
                  )}

                  {/* ELIMINAR */}
                  <div className="ls-casillero-card-edicion">
                    <button
                      type="button"
                      title="Eliminar casillero"
                      aria-label="Eliminar casillero"
                      onClick={() =>
                        eliminarCasillero(casillero.id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </article>
              ))
            ) : (
              <div className="ls-casilleros-sin-resultados">
                <Search size={30} />
                <p>
                  No se encontraron casilleros.
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* MODAL PARA ASIGNAR CASILLERO */}
      {casilleroSeleccionado && (
        <div
          className="ls-casillero-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setCasilleroSeleccionado(null)
            }
          }}
        >
          <section
            className="ls-casillero-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-asignacion"
          >

            <div className="ls-casillero-modal-header">
              <div>
                <h2 id="titulo-asignacion">
                  Asignar casillero
                </h2>

                <p>
                  {casilleroSeleccionado.numero}
                </p>
              </div>

              <button
                type="button"
                className="ls-casillero-modal-cerrar"
                onClick={() =>
                  setCasilleroSeleccionado(null)
                }
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={asignarCasillero}>
              <div className="ls-casillero-modal-body">

                {errorAsignacion && (
                  <div className="ls-casillero-error">
                    {errorAsignacion}
                  </div>
                )}

                <div className="ls-casillero-form-group">
                  <label htmlFor="usuario-casillero">
                    Seleccionar usuario
                  </label>

                  <select
                    id="usuario-casillero"
                    value={usuarioSeleccionado}
                    onChange={e =>
                      setUsuarioSeleccionado(
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Selecciona un usuario
                    </option>

                    {usuarios.map(usuario => (
                      <option
                        key={usuario.id}
                        value={usuario.id}
                      >
                        {usuario.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ls-casillero-form-group">
                  <label htmlFor="uid-rfid">
                    UID de la tarjeta RFID
                  </label>

                  <input
                    id="uid-rfid"
                    value={uidRfid}
                    onChange={e =>
                      setUidRfid(e.target.value)
                    }
                    placeholder="Ej. RFID-006"
                    required
                  />
                </div>

              </div>

              <div className="ls-casillero-modal-footer">
                <button
                  type="button"
                  className="ls-casillero-cancelar"
                  onClick={() =>
                    setCasilleroSeleccionado(null)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="ls-casillero-guardar"
                >
                  Guardar asignación
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL INFORMACIÓN DEL USUARIO */}
      {usuarioInfo && (
        <div
          className="ls-casillero-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setUsuarioInfo(null)
            }
          }}
        >
          <section
            className="ls-casillero-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-usuario"
          >

            <div className="ls-casillero-modal-header">
              <div>
                <h2 id="titulo-usuario">
                  Usuario asignado
                </h2>

                <p>
                  Información del casillero
                </p>
              </div>

              <button
                type="button"
                className="ls-casillero-modal-cerrar"
                onClick={() => setUsuarioInfo(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="ls-casillero-modal-body">

              <div className="ls-casillero-info-usuario">

                <div className="ls-casillero-info-icon">
                  <UserRound
                    size={30}
                    fill="currentColor"
                  />
                </div>

                <div>
                  <span>Usuario</span>
                  <strong>
                    {usuarioInfo.usuario}
                  </strong>
                </div>

              </div>

              <div className="ls-casillero-info-dato">
                <span>Casillero</span>
                <strong>
                  {usuarioInfo.numero}
                </strong>
              </div>

              <div className="ls-casillero-info-dato">
                <span>UID de tarjeta RFID</span>
                <strong>
                  {usuarioInfo.uid || 'Sin UID'}
                </strong>
              </div>

            </div>

            <div className="ls-casillero-modal-footer">
              <button
                type="button"
                className="ls-casillero-guardar"
                onClick={() => setUsuarioInfo(null)}
              >
                Cerrar
              </button>
            </div>

          </section>
        </div>
      )}

    </div>
  )
}