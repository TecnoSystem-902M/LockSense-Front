import { useState, useEffect, useCallback } from 'react'
import {
  LockKeyhole,
  UserRound,
  Ban,
  ShieldCheck,
  LogOut,
  Search,
  UnlockKeyhole,
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import {
  listarCasilleros,
  bloquearCasillero,
  desbloquearCasillero,
  usuariosAsignables,
  asignarCasillero,
  consultarAsignacion,
  liberarCasillero,
} from '../../api/casilleros'
import '../../styles/admin/Casilleros.css'

/**
 * Normaliza un casillero de la API al formato que usan las tarjetas.
 */
const mapCasillero = (c) => ({
  id: c.id,
  numero: c.numero,
  ocupado: Boolean(c.ocupado),
  bloqueado: Boolean(c.bloqueado),
  motivoBloqueo: c.motivo_bloqueo || null,
  usuario: c.usuario ? c.usuario.nombre_completo : null,
  uid: c.uid_rfid || '',
})

const etiquetaEstado = (c) => {
  if (c.bloqueado) return 'Bloqueado'
  return c.ocupado ? 'Asignado' : 'Sin asignar'
}

const claseEstado = (c) =>
  etiquetaEstado(c).toLowerCase().replaceAll(' ', '-')

const textoMotivo = (motivo) => {
  if (motivo === 'ADMINISTRATIVO') return 'Administrativo'
  if (motivo === 'MANTENIMIENTO') return 'Mantenimiento'
  return ''
}

const nombreUsuario = (u) =>
  [u.nombre, u.apellido_pa, u.apellido_ma].filter(Boolean).join(' ')

export default function Casilleros() {
  const [casilleros, setCasilleros] = useState([])
  const [cargando, setCargando] = useState(false)
  const [cargaError, setCargaError] = useState('')

  const [busqueda, setBusqueda] = useState('')

  const [toast, setToast] = useState('')

  const [usuarios, setUsuarios] = useState([])
  const [usuariosCargando, setUsuariosCargando] = useState(false)
  const [usuariosError, setUsuariosError] = useState('')

  const [casilleroSeleccionado, setCasilleroSeleccionado] = useState(null)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [uidRfid, setUidRfid] = useState('')
  const [errorAsignacion, setErrorAsignacion] = useState('')
  const [guardandoAsignacion, setGuardandoAsignacion] = useState(false)

  const [usuarioInfo, setUsuarioInfo] = useState(null)
  const [usuarioInfoCargando, setUsuarioInfoCargando] = useState(false)
  const [usuarioInfoError, setUsuarioInfoError] = useState('')

  const [casilleroBloqueo, setCasilleroBloqueo] = useState(null)
  const [motivoBloqueo, setMotivoBloqueo] = useState('MANTENIMIENTO')
  const [errorBloqueo, setErrorBloqueo] = useState('')
  const [procesandoBloqueo, setProcesandoBloqueo] = useState(false)

  const [confirmacion, setConfirmacion] = useState(null)
  const [errorConfirmacion, setErrorConfirmacion] = useState('')
  const [procesandoConfirmacion, setProcesandoConfirmacion] = useState(false)

  const cargarCasilleros = useCallback(async () => {
    setCargando(true)
    setCargaError('')
    try {
      const data = await listarCasilleros()
      setCasilleros(Array.isArray(data) ? data.map(mapCasillero) : [])
    } catch {
      setCasilleros([])
      setCargaError('No se pudieron cargar los casilleros.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarCasilleros()
  }, [cargarCasilleros])

  const asignados = casilleros.filter(c => c.ocupado && !c.bloqueado).length
  const bloqueados = casilleros.filter(c => c.bloqueado).length

  const casillerosFiltrados = casilleros.filter(casillero => {
    const texto = busqueda.toLowerCase().trim()
    if (!texto) return true
    return (
      (casillero.numero && casillero.numero.toLowerCase().includes(texto)) ||
      (casillero.usuario && casillero.usuario.toLowerCase().includes(texto)) ||
      (casillero.uid && casillero.uid.toLowerCase().includes(texto))
    )
  })

  const TOTAL_VISUAL = 6
  const placeholdersVisuales =
    !busqueda.trim() && !cargando
      ? Math.max(0, TOTAL_VISUAL - casillerosFiltrados.length)
      : 0

  const abrirAsignacion = casillero => {
    setCasilleroSeleccionado(casillero)
    setUsuarioSeleccionado('')
    setUidRfid('')
    setErrorAsignacion('')

    setUsuariosCargando(true)
    setUsuariosError('')
    usuariosAsignables(casillero.id)
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => {
        setUsuarios([])
        setUsuariosError('No se pudieron cargar los usuarios.')
      })
      .finally(() => setUsuariosCargando(false))
  }

  const guardarAsignacion = async e => {
    e.preventDefault()
    setErrorAsignacion('')

    if (!usuarioSeleccionado) {
      setErrorAsignacion('Selecciona un usuario para asignar el casillero.')
      return
    }

    setGuardandoAsignacion(true)
    try {
      await asignarCasillero(
        casilleroSeleccionado.id,
        Number(usuarioSeleccionado),
        uidRfid.trim() || null
      )
      const numero = casilleroSeleccionado.numero
      setCasilleroSeleccionado(null)
      await cargarCasilleros()
      setToast(`Casillero ${numero} asignado correctamente`)
    } catch (err) {
      const data = err?.response?.data
      const msg =
        data?.message ||
        (data?.errors && Object.values(data.errors)[0]?.[0]) ||
        'No se pudo asignar el casillero.'
      setErrorAsignacion(msg)
    } finally {
      setGuardandoAsignacion(false)
    }
  }

  const verUsuario = casillero => {
    setUsuarioInfo({ numero: casillero.numero })
    setUsuarioInfoCargando(true)
    setUsuarioInfoError('')
    consultarAsignacion(casillero.id)
      .then(data => {
        setUsuarioInfo({
          numero: data.numero,
          usuario: data.usuario ? data.usuario.nombre_completo : null,
          correo: data.usuario ? data.usuario.email : null,
          uid: data.uid_rfid || '',
          ocupado: Boolean(data.ocupado),
          bloqueado: Boolean(data.bloqueado),
          motivoBloqueo: data.motivo_bloqueo || null,
        })
      })
      .catch(err => {
        const msg =
          err?.response?.data?.message ||
          'No se pudo obtener la información del usuario.'
        setUsuarioInfoError(msg)
      })
      .finally(() => setUsuarioInfoCargando(false))
  }

  const abrirBloqueo = casillero => {
    setCasilleroBloqueo(casillero)
    setErrorBloqueo('')
    setMotivoBloqueo(casillero.ocupado ? 'ADMINISTRATIVO' : 'MANTENIMIENTO')
  }

  const confirmarBloqueo = async e => {
    e.preventDefault()
    if (!casilleroBloqueo) return
    setProcesandoBloqueo(true)
    setErrorBloqueo('')
    try {
      await bloquearCasillero(casilleroBloqueo.id, motivoBloqueo)
      const numero = casilleroBloqueo.numero
      setCasilleroBloqueo(null)
      await cargarCasilleros()
      setToast(`Casillero ${numero} bloqueado correctamente`)
    } catch (err) {
      const data = err?.response?.data
      const msg =
        data?.message ||
        (data?.errors && Object.values(data.errors)[0]?.[0]) ||
        'No se pudo bloquear el casillero.'
      setErrorBloqueo(msg)
    } finally {
      setProcesandoBloqueo(false)
    }
  }

  const pedirConfirmacion = (tipo, casillero) => {
    setErrorConfirmacion('')
    setConfirmacion({ tipo, casillero })
  }

  const cerrarConfirmacion = () => {
    if (procesandoConfirmacion) return
    setConfirmacion(null)
    setErrorConfirmacion('')
  }

  const ejecutarConfirmacion = async () => {
    if (!confirmacion) return
    const { tipo, casillero } = confirmacion
    setProcesandoConfirmacion(true)
    setErrorConfirmacion('')
    try {
      if (tipo === 'liberar') {
        await liberarCasillero(casillero.id)
      } else {
        await desbloquearCasillero(casillero.id)
      }
      setConfirmacion(null)
      await cargarCasilleros()
      setToast(
        tipo === 'liberar'
          ? `Casillero ${casillero.numero} liberado correctamente`
          : `Casillero ${casillero.numero} desbloqueado correctamente`
      )
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (tipo === 'liberar'
          ? 'No se pudo liberar el casillero.'
          : 'No se pudo desbloquear el casillero.')
      setErrorConfirmacion(msg)
    } finally {
      setProcesandoConfirmacion(false)
    }
  }

  const copyConfirmacion = (() => {
    if (!confirmacion) return null
    const { tipo, casillero } = confirmacion
    if (tipo === 'liberar') {
      return {
        tipo,
        titulo: '¿Liberar casillero?',
        mensaje: (
          <>
            ¿Estás seguro de que quieres liberar el casillero{' '}
            <strong>{casillero.numero}</strong>?
          </>
        ),
        nota: 'El usuario dejará de ser el ocupante actual. El historial y la credencial RFID se conservan.',
        confirmar: 'Sí, liberar',
        procesando: 'Liberando...',
      }
    }
    return {
      tipo,
      titulo: '¿Desbloquear casillero?',
      mensaje: (
        <>
          ¿Estás seguro de que quieres desbloquear el casillero{' '}
          <strong>{casillero.numero}</strong>?
        </>
      ),
      nota: 'El casillero volverá a quedar operativo según su asignación actual.',
      confirmar: 'Sí, desbloquear',
      procesando: 'Desbloqueando...',
    }
  })()

  return (
    <div className="ls-casilleros">

      {toast && (
        <ToastNotification mensaje={toast} onClose={() => setToast('')} />
      )}

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

        {cargaError && (
          <div className="ls-casillero-error" role="alert" style={{ margin: '0 0 16px' }}>
            {cargaError}
          </div>
        )}

        {/* TARJETAS */}
        <div className="ls-casilleros-grid-scroll">
          <div className="ls-casilleros-grid">

            {cargando ? (
              <div className="ls-casilleros-sin-resultados">
                <Search size={30} />
                <p>Cargando casilleros...</p>
              </div>
            ) : casillerosFiltrados.length > 0 ? (
              casillerosFiltrados.map(casillero => {
                const estado = etiquetaEstado(casillero)
                const estadoClase = claseEstado(casillero)
                return (
                  <article
                    className={`ls-casillero-card ${estadoClase}`}
                    key={casillero.id}
                  >

                    <div className="ls-casillero-card-titulo">
                      <LockKeyhole
                        size={34}
                        strokeWidth={3}
                      />

                      <h3>{casillero.numero}</h3>
                    </div>

                    <span
                      className={`ls-casillero-card-estado ${estadoClase}`}
                    >
                      {estado}
                      {casillero.bloqueado && casillero.motivoBloqueo
                        ? ` · ${textoMotivo(casillero.motivoBloqueo)}`
                        : ''}
                    </span>

                    {casillero.bloqueado ? (
                      <div className="ls-casillero-card-acciones">
                        {casillero.ocupado && (
                          <button
                            type="button"
                            className="ls-casillero-boton usuario"
                            title="Ver usuario asignado"
                            aria-label="Ver usuario asignado"
                            onClick={() => verUsuario(casillero)}
                          >
                            <UserRound size={28} fill="currentColor" />
                          </button>
                        )}

                        <button
                          type="button"
                          className="ls-casillero-boton bloqueo"
                          title="Desbloquear casillero"
                          aria-label="Desbloquear casillero"
                          onClick={() => pedirConfirmacion('desbloquear', casillero)}
                        >
                          <ShieldCheck size={27} />
                        </button>

                        {casillero.ocupado && (
                          <button
                            type="button"
                            className="ls-casillero-boton liberar"
                            title="Liberar casillero"
                            aria-label="Liberar casillero"
                            onClick={() => pedirConfirmacion('liberar', casillero)}
                          >
                            <LogOut size={27} />
                          </button>
                        )}
                      </div>
                    ) : casillero.ocupado ? (
                      <div className="ls-casillero-card-acciones">
                        <button
                          type="button"
                          className="ls-casillero-boton usuario"
                          title="Ver usuario asignado"
                          aria-label="Ver usuario asignado"
                          onClick={() => verUsuario(casillero)}
                        >
                          <UserRound size={28} fill="currentColor" />
                        </button>

                        <button
                          type="button"
                          className="ls-casillero-boton bloqueo"
                          title="Bloquear casillero"
                          aria-label="Bloquear casillero"
                          onClick={() => abrirBloqueo(casillero)}
                        >
                          <Ban size={27} />
                        </button>

                        <button
                          type="button"
                          className="ls-casillero-boton liberar"
                          title="Liberar casillero"
                          aria-label="Liberar casillero"
                          onClick={() => pedirConfirmacion('liberar', casillero)}
                        >
                          <LogOut size={27} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="ls-casillero-card-edicion">
                          <button
                            type="button"
                            title="Bloquear por mantenimiento"
                            aria-label="Bloquear casillero"
                            onClick={() => abrirBloqueo(casillero)}
                          >
                            <Ban size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="ls-casillero-asignar"
                          onClick={() => abrirAsignacion(casillero)}
                        >
                          Asignar Casillero
                        </button>
                      </>
                    )}

                  </article>
                )
              })
            ) : placeholdersVisuales === 0 ? (
              <div className="ls-casilleros-sin-resultados">
                <Search size={30} />
                <p>
                  {busqueda
                    ? 'No se encontraron casilleros.'
                    : 'No hay casilleros registrados.'}
                </p>
              </div>
            ) : null}

            {placeholdersVisuales > 0 &&
              Array.from({ length: placeholdersVisuales }).map((_, i) => (
                <article
                  className="ls-casillero-card ls-casillero-card-placeholder"
                  key={`placeholder-${i}`}
                  aria-hidden="true"
                >
                  <div className="ls-casillero-card-titulo">
                    <LockKeyhole size={34} strokeWidth={3} />
                    <h3>—</h3>
                  </div>

                  <span className="ls-casillero-card-estado ls-casillero-placeholder-badge">
                    No disponible
                  </span>

                  <p className="ls-casillero-placeholder-nota">
                    Espacio visual
                  </p>
                </article>
              ))}

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
                onClick={() => setCasilleroSeleccionado(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarAsignacion}>
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
                    onChange={e => setUsuarioSeleccionado(e.target.value)}
                    disabled={usuariosCargando}
                  >
                    <option value="">
                      {usuariosCargando
                        ? 'Cargando usuarios...'
                        : usuarios.length === 0
                          ? 'No hay usuarios disponibles'
                          : 'Selecciona un usuario'}
                    </option>

                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {nombreUsuario(usuario)}
                      </option>
                    ))}
                  </select>

                  {usuariosError && (
                    <div className="ls-casillero-error" style={{ marginTop: 8 }}>
                      {usuariosError}
                    </div>
                  )}
                </div>

                {/* UID RFID: campo editable. El admin escribe el código de la
                    tarjeta física que tiene en la mano. Opcional: si se deja
                    vacío, el usuario queda sin tarjeta asignada. */}
                <div className="ls-casillero-form-group">
                  <label htmlFor="uid-rfid">UID de la tarjeta RFID</label>
                  <input
                    id="uid-rfid"
                    type="text"
                    value={uidRfid}
                    onChange={e => setUidRfid(e.target.value)}
                    placeholder="Ej. 04A2B3C4D5E680"
                    maxLength={50}
                  />
                  <p className="ls-casillero-form-nota">
                    Ingresa el UID que aparece impreso en la tarjeta. Si lo dejas vacío, el usuario quedará sin tarjeta RFID asignada.
                  </p>
                </div>

              </div>

              <div className="ls-casillero-modal-footer">
                <button
                  type="button"
                  className="ls-casillero-cancelar"
                  onClick={() => setCasilleroSeleccionado(null)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="ls-casillero-guardar"
                  disabled={guardandoAsignacion || usuarios.length === 0}
                >
                  {guardandoAsignacion ? 'Guardando...' : 'Guardar asignación'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL PARA BLOQUEAR CASILLERO */}
      {casilleroBloqueo && (
        <div
          className="ls-casillero-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setCasilleroBloqueo(null)
            }
          }}
        >
          <section
            className="ls-casillero-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-bloqueo"
          >

            <div className="ls-casillero-modal-header">
              <div>
                <h2 id="titulo-bloqueo">
                  Bloquear casillero
                </h2>

                <p>
                  {casilleroBloqueo.numero}
                </p>
              </div>

              <button
                type="button"
                className="ls-casillero-modal-cerrar"
                onClick={() => setCasilleroBloqueo(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={confirmarBloqueo}>
              <div className="ls-casillero-modal-body">

                {errorBloqueo && (
                  <div className="ls-casillero-error">
                    {errorBloqueo}
                  </div>
                )}

                <div className="ls-casillero-form-group">
                  <label htmlFor="motivo-bloqueo">
                    Motivo del bloqueo
                  </label>

                  <select
                    id="motivo-bloqueo"
                    value={motivoBloqueo}
                    onChange={e => setMotivoBloqueo(e.target.value)}
                  >
                    {casilleroBloqueo.ocupado && (
                      <option value="ADMINISTRATIVO">Administrativo</option>
                    )}
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                </div>

              </div>

              <div className="ls-casillero-modal-footer">
                <button
                  type="button"
                  className="ls-casillero-cancelar"
                  onClick={() => setCasilleroBloqueo(null)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="ls-casillero-guardar"
                  disabled={procesandoBloqueo}
                >
                  {procesandoBloqueo ? 'Bloqueando...' : 'Confirmar bloqueo'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN (LIBERAR / DESBLOQUEAR) */}
      {confirmacion && copyConfirmacion && (
        <div
          className="ls-casillero-modal-fondo"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              cerrarConfirmacion()
            }
          }}
        >
          <section
            className="ls-casillero-modal ls-casillero-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacion"
          >

            <button
              type="button"
              className="ls-casillero-modal-cerrar ls-casillero-confirm-cerrar"
              onClick={cerrarConfirmacion}
              aria-label="Cerrar"
              disabled={procesandoConfirmacion}
            >
              ×
            </button>

            <div className="ls-casillero-confirm-body">

              <div className="ls-casillero-confirm-icono">
                <UnlockKeyhole size={30} strokeWidth={2.4} />
              </div>

              <h2 id="titulo-confirmacion" className="ls-casillero-confirm-titulo">
                {copyConfirmacion.titulo}
              </h2>

              <p className="ls-casillero-confirm-mensaje">
                {copyConfirmacion.mensaje}
              </p>

              {copyConfirmacion.nota && (
                <p className="ls-casillero-confirm-nota">
                  {copyConfirmacion.nota}
                </p>
              )}

              {errorConfirmacion && (
                <div className="ls-casillero-error ls-casillero-confirm-error">
                  {errorConfirmacion}
                </div>
              )}
            </div>

            <div className="ls-casillero-confirm-acciones">
              <button
                type="button"
                className="ls-casillero-cancelar ls-casillero-confirm-btn"
                onClick={cerrarConfirmacion}
                disabled={procesandoConfirmacion}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="ls-casillero-guardar ls-casillero-confirm-btn"
                onClick={ejecutarConfirmacion}
                disabled={procesandoConfirmacion}
              >
                {procesandoConfirmacion
                  ? copyConfirmacion.procesando
                  : copyConfirmacion.confirmar}
              </button>
            </div>
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

              {usuarioInfoCargando ? (
                <div className="ls-casillero-info-dato">
                  <span>Cargando...</span>
                </div>
              ) : usuarioInfoError ? (
                <div className="ls-casillero-error">
                  {usuarioInfoError}
                </div>
              ) : (
                <>
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
                        {usuarioInfo.usuario || 'Sin usuario'}
                      </strong>
                    </div>

                  </div>

                  {usuarioInfo.correo && (
                    <div className="ls-casillero-info-dato">
                      <span>Correo</span>
                      <strong>
                        {usuarioInfo.correo}
                      </strong>
                    </div>
                  )}

                  <div className="ls-casillero-info-dato">
                    <span>Casillero</span>
                    <strong>
                      {usuarioInfo.numero}
                    </strong>
                  </div>

                  <div className="ls-casillero-info-dato">
                    <span>UID de tarjeta RFID</span>
                    <strong>
                      {usuarioInfo.uid || 'Sin tarjeta RFID asociada'}
                    </strong>
                  </div>

                  <div className="ls-casillero-info-dato">
                    <span>Estado</span>
                    <strong>
                      {usuarioInfo.bloqueado
                        ? `Bloqueado${usuarioInfo.motivoBloqueo ? ` · ${textoMotivo(usuarioInfo.motivoBloqueo)}` : ''}`
                        : usuarioInfo.ocupado
                          ? 'Asignado'
                          : 'Sin asignar'}
                    </strong>
                  </div>
                </>
              )}

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