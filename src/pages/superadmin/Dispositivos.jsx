import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Cpu,
  Camera,
  Pencil,
  KeyRound,
  Ban,
  RotateCcw,
  X,
  AlertTriangle,
  Plus,
  Copy,
  Check,
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import {
  listarDispositivos,
  opcionesDispositivo,
  crearDispositivo,
  actualizarDispositivo,
  regenerarTokenDispositivo,
  cambiarEstadoDispositivo,
} from '../../api/Superadmin'
import '../../styles/superadmin/Dispositivos.css'

const TIPOS = [
  { valor: 'CERRADURAS', texto: 'Cerraduras (ESP32 principal)' },
  { valor: 'CAMARA', texto: 'Cámara (ESP32-CAM)' },
]

const formVacio = {
  identificador: '',
  tipo: '',
  organizaciones_id: '',
  casilleros: [],
}

const FORMATO_MAC = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/

// "aa-bb-cc..." -> "AA:BB:CC..."
const normalizarMac = (mac) => mac.trim().toUpperCase().replace(/-/g, ':')

// ---------- VALIDACIÓN (la misma que hace el back) ----------
function validarFormulario(form, tipo) {
  const errores = {}
  const mac = normalizarMac(form.identificador)

  if (!mac) errores.identificador = 'La MAC es obligatoria.'
  else if (!FORMATO_MAC.test(mac)) errores.identificador = 'La MAC debe tener el formato AA:BB:CC:DD:EE:FF.'

  if (!tipo) errores.tipo = 'Selecciona el tipo de dispositivo.'

  if (!form.organizaciones_id) errores.organizaciones_id = 'Selecciona la organización.'

  if (tipo === 'CERRADURAS' && form.organizaciones_id && form.casilleros.length === 0) {
    errores.casilleros = 'Selecciona al menos un casillero.'
  }

  return errores
}

function erroresDelBack(err) {
  const errors = err?.response?.data?.errors
  if (!errors) return null
  return Object.fromEntries(
    Object.entries(errors).map(([campo, msgs]) => [campo.startsWith('casilleros') ? 'casilleros' : campo, msgs[0]])
  )
}

const textoTipo = (tipo) => (tipo === 'CAMARA' ? 'Cámara' : 'Cerraduras')

export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([])
  const [organizaciones, setOrganizaciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')

  // Modal crear / editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [dispositivoEditando, setDispositivoEditando] = useState(null)
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Modal del token (se muestra una sola vez)
  const [tokenMostrado, setTokenMostrado] = useState(null) // { token, mac }
  const [copiado, setCopiado] = useState(false)

  // Modal confirmar: { tipo: 'estado' | 'token', dispositivo }
  const [confirmacion, setConfirmacion] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const [toast, setToast] = useState('')

  // Búsqueda y paginación
  const [busqueda, setBusqueda] = useState('')
  const registrosPorPagina = 5
  const [paginaActual, setPaginaActual] = useState(1)

  const cargarDispositivos = useCallback(async () => {
    setCargando(true)
    setErrorCarga('')
    try {
      const [lista, opciones] = await Promise.all([listarDispositivos(), opcionesDispositivo()])
      setDispositivos(lista.dispositivos ?? [])
      setOrganizaciones(opciones.organizaciones ?? [])
    } catch {
      setDispositivos([])
      setErrorCarga('No se pudieron cargar los dispositivos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDispositivos()
  }, [cargarDispositivos])

  // Tipo efectivo: al modificar es el que ya tiene (no se cambia)
  const tipoActual = dispositivoEditando?.tipo ?? form.tipo

  // Casilleros de la organización elegida
  const casillerosDeLaOrg = useMemo(() => {
    const org = organizaciones.find((o) => String(o.id) === String(form.organizaciones_id))
    return org?.casilleros ?? []
  }, [organizaciones, form.organizaciones_id])

  // Un casillero está ocupado si lo controla OTRO dispositivo activo
  const estaOcupado = (casillero) =>
    casillero.dispositivos_id && casillero.dispositivos_id !== dispositivoEditando?.id

  // Organizaciones del select (al modificar, incluye la suya aunque esté de baja)
  const organizacionesSelect = useMemo(() => {
    if (!dispositivoEditando?.organizacion) return organizaciones
    const yaEsta = organizaciones.some((o) => o.id === dispositivoEditando.organizacion.id)
    return yaEsta ? organizaciones : [...organizaciones, { ...dispositivoEditando.organizacion, casilleros: [] }]
  }, [organizaciones, dispositivoEditando])

  // Filtrado
  const dispositivosFiltrados = dispositivos.filter((disp) => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return true
    return [disp.identificador, textoTipo(disp.tipo), disp.organizacion?.nombre,
      disp.estado === 'A' ? 'activo' : 'dado de baja']
      .filter(Boolean)
      .some((valor) => valor.toLowerCase().includes(termino))
  })

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(dispositivosFiltrados.length / registrosPorPagina))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const indiceInicial = (paginaSegura - 1) * registrosPorPagina
  const dispositivosVisibles = dispositivosFiltrados.slice(indiceInicial, indiceInicial + registrosPorPagina)

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor)
    setPaginaActual(1)
  }

  // ---------- MODAL CREAR / EDITAR ----------
  const abrirNuevo = () => {
    setDispositivoEditando(null)
    setForm(formVacio)
    setErrores({})
    setErrorGeneral('')
    setModalAbierto(true)
  }

  const abrirModificar = (disp) => {
    setDispositivoEditando(disp)
    setForm({
      identificador: disp.identificador,
      tipo: disp.tipo,
      organizaciones_id: disp.organizacion?.id ? String(disp.organizacion.id) : '',
      casilleros: disp.casilleros.map((c) => c.id),
    })
    setErrores({})
    setErrorGeneral('')
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    if (guardando) return
    setModalAbierto(false)
    setDispositivoEditando(null)
  }

  const handleCampo = (e) => {
    const { name, value } = e.target

    setForm((prev) => {
      const nuevo = { ...prev, [name]: value }

      // Al cambiar de organización, se preseleccionan sus casilleros libres
      if (name === 'organizaciones_id') {
        const org = organizaciones.find((o) => String(o.id) === String(value))
        nuevo.casilleros = (org?.casilleros ?? [])
          .filter((c) => !c.dispositivos_id || c.dispositivos_id === dispositivoEditando?.id)
          .map((c) => c.id)
      }

      return nuevo
    })

    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: undefined }))
  }

  const alternarCasillero = (id) => {
    setForm((prev) => ({
      ...prev,
      casilleros: prev.casilleros.includes(id)
        ? prev.casilleros.filter((c) => c !== id)
        : [...prev.casilleros, id],
    }))
    if (errores.casilleros) setErrores((prev) => ({ ...prev, casilleros: undefined }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')

    const erroresForm = validarFormulario(form, tipoActual)
    if (Object.keys(erroresForm).length > 0) {
      setErrores(erroresForm)
      return
    }

    const payload = {
      identificador: normalizarMac(form.identificador),
      organizaciones_id: Number(form.organizaciones_id),
      casilleros: tipoActual === 'CERRADURAS' ? form.casilleros : [],
    }
    if (!dispositivoEditando) payload.tipo = form.tipo

    setGuardando(true)
    try {
      if (dispositivoEditando) {
        await actualizarDispositivo(dispositivoEditando.id, payload)
        setToast('Dispositivo actualizado correctamente')
      } else {
        const respuesta = await crearDispositivo(payload)
        setTokenMostrado({ token: respuesta.token, mac: payload.identificador })
        setCopiado(false)
      }
      setModalAbierto(false)
      setDispositivoEditando(null)
      await cargarDispositivos()
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

  // ---------- CONFIRMACIONES (baja / reactivar / regenerar token) ----------
  const aplicarConfirmacion = async () => {
    if (!confirmacion) return
    const { tipo, dispositivo } = confirmacion

    setProcesando(true)
    try {
      if (tipo === 'token') {
        const respuesta = await regenerarTokenDispositivo(dispositivo.id)
        setTokenMostrado({ token: respuesta.token, mac: dispositivo.identificador })
        setCopiado(false)
      } else {
        const nuevoEstado = dispositivo.estado === 'A' ? 'I' : 'A'
        const respuesta = await cambiarEstadoDispositivo(dispositivo.id, nuevoEstado)
        setToast(respuesta.message)
        await cargarDispositivos()
      }
      setConfirmacion(null)
    } catch (err) {
      setToast(err?.response?.data?.message || 'No se pudo completar la acción.')
      setConfirmacion(null)
    } finally {
      setProcesando(false)
    }
  }

  const copiarToken = async () => {
    try {
      await navigator.clipboard.writeText(tokenMostrado.token)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  const claseInput = (campo) => (errores[campo] ? 'ls-input-error' : '')

  // Textos del modal de confirmación
  const conf = confirmacion && (
    confirmacion.tipo === 'token'
      ? {
          icono: <KeyRound size={26} />,
          titulo: '¿Regenerar el token?',
          texto: 'El token actual dejará de funcionar de inmediato. Tendrás que pegar el nuevo en el código del ESP32 y volver a subirlo.',
          boton: 'Sí, regenerar',
        }
      : confirmacion.dispositivo.estado === 'A'
        ? {
            icono: <AlertTriangle size={26} />,
            titulo: '¿Dar de baja el dispositivo?',
            texto: 'Dejará de conectarse de inmediato y se liberarán sus casilleros. Su historial se conserva y puedes reactivarlo después.',
            boton: 'Sí, dar de baja',
          }
        : {
            icono: <RotateCcw size={26} />,
            titulo: '¿Reactivar el dispositivo?',
            texto: 'Podrá volver a conectarse. Si es de cerraduras, después asígnale sus casilleros con Modificar.',
            boton: 'Sí, reactivar',
          }
  )

  return (
    <div className="ls-dispositivos">
      {toast && <ToastNotification mensaje={toast} onClose={() => setToast('')} />}

      {/* HEADER */}
      <div className="ls-disp-heading">
        <div>
          <h1>Dispositivos</h1>
          <p>Gestión de dispositivos registrados en la red LOCKSENSE</p>
        </div>
        <button type="button" className="ls-disp-btn-nuevo" onClick={abrirNuevo}>
          <Plus size={18} />
          <span>Nuevo dispositivo</span>
        </button>
      </div>

      {/* PANEL DE TABLA */}
      <section className="ls-disp-panel">

        <div className="ls-disp-panel-heading">
          <h2>Listado de dispositivos</h2>
        </div>

        <div className="ls-disp-controles">
          <div className="ls-disp-mostrar">
            Dispositivos registrados: <strong>{dispositivos.length}</strong>
          </div>
          <label className="ls-disp-busqueda">
            <span>Buscar:</span>
            <input
              type="search"
              placeholder="Buscar por MAC, tipo u organización..."
              value={busqueda}
              onChange={(e) => cambiarBusqueda(e.target.value)}
            />
          </label>
        </div>

        <div className="ls-disp-tabla-contenedor">
          <table className="ls-disp-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dispositivo</th>
                <th>Organización</th>
                <th>Casilleros</th>
                <th>Última conexión</th>
                <th>Estado</th>
                <th className="ls-col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dispositivosVisibles.map((disp) => (
                <tr key={disp.id} className={disp.estado !== 'A' ? 'ls-disp-fila-inactiva' : ''}>
                  <td>{disp.id}</td>
                  <td>
                    <div className="ls-disp-identificador">
                      <div className="ls-disp-icono">
                        {disp.tipo === 'CAMARA' ? <Camera size={18} /> : <Cpu size={18} />}
                      </div>
                      <div>
                        <strong className="ls-disp-mac">{disp.identificador}</strong>
                        <small className="ls-disp-tipo">{textoTipo(disp.tipo)}</small>
                      </div>
                    </div>
                  </td>
                  <td>{disp.organizacion?.nombre ?? '—'}</td>
                  <td>
                    {disp.tipo === 'CAMARA'
                      ? <span className="ls-disp-sin-dato">No aplica</span>
                      : disp.casilleros.length > 0
                        ? disp.casilleros.map((c) => c.numero).join(', ')
                        : <span className="ls-disp-sin-dato">Sin casilleros</span>}
                  </td>
                  <td>{disp.ultima_conexion ?? <span className="ls-disp-sin-dato">Nunca</span>}</td>
                  <td>
                    <span className={`ls-disp-badge ${disp.estado === 'A' ? 'estado-activo' : 'estado-inactivo'}`}>
                      {disp.estado === 'A' ? 'Activo' : 'Dado de baja'}
                    </span>
                  </td>
                  <td className="ls-col-acciones">
                    <div className="ls-disp-acciones">
                      <button
                        type="button"
                        className="ls-accion-btn modificar"
                        onClick={() => abrirModificar(disp)}
                        title="Modificar"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        className="ls-accion-btn token"
                        onClick={() => setConfirmacion({ tipo: 'token', dispositivo: disp })}
                        title="Regenerar token"
                      >
                        <KeyRound size={17} />
                      </button>
                      {disp.estado === 'A' ? (
                        <button
                          type="button"
                          className="ls-accion-btn eliminar"
                          onClick={() => setConfirmacion({ tipo: 'estado', dispositivo: disp })}
                          title="Dar de baja"
                        >
                          <Ban size={17} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ls-accion-btn reactivar"
                          onClick={() => setConfirmacion({ tipo: 'estado', dispositivo: disp })}
                          title="Reactivar"
                        >
                          <RotateCcw size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {dispositivosVisibles.length === 0 && (
                <tr>
                  <td colSpan="7" className="ls-disp-vacio">
                    {cargando
                      ? 'Cargando dispositivos...'
                      : errorCarga || 'No se encontraron dispositivos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="ls-disp-paginacion">
          <span>
            Mostrando {dispositivosVisibles.length} de {dispositivosFiltrados.length} registros
          </span>
          <div className="ls-disp-paginacion-botones">
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
                <h2>{dispositivoEditando ? 'Modificar dispositivo' : 'Nuevo dispositivo'}</h2>
                <p>
                  {dispositivoEditando
                    ? `Tipo: ${textoTipo(dispositivoEditando.tipo)}`
                    : 'Al guardar se generará su token.'}
                </p>
              </div>
              <button type="button" className="ls-modal-cerrar" onClick={cerrarModal}><X size={20} /></button>
            </div>

            <form onSubmit={guardar} noValidate>
              <div className="ls-modal-body">
                {errorGeneral && <p className="ls-form-error-general">{errorGeneral}</p>}

                <div className="ls-form-group">
                  <label>MAC del ESP32 *</label>
                  <input
                    name="identificador"
                    type="text"
                    maxLength={17}
                    placeholder="Ej: CC:DB:A7:30:FB:34"
                    value={form.identificador}
                    onChange={handleCampo}
                    className={claseInput('identificador')}
                    autoComplete="off"
                  />
                  <small className="ls-form-ayuda">La que aparece en el Monitor Serie al encender la placa.</small>
                  {errores.identificador && <span className="ls-form-error">{errores.identificador}</span>}
                </div>

                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label>Tipo *</label>
                    <select
                      name="tipo"
                      value={tipoActual}
                      onChange={handleCampo}
                      disabled={Boolean(dispositivoEditando)}
                      className={claseInput('tipo')}
                    >
                      <option value="" disabled>Selecciona el tipo</option>
                      {TIPOS.map((t) => (
                        <option key={t.valor} value={t.valor}>{t.texto}</option>
                      ))}
                    </select>
                    {errores.tipo && <span className="ls-form-error">{errores.tipo}</span>}
                  </div>

                  <div className="ls-form-group">
                    <label>Organización *</label>
                    <select
                      name="organizaciones_id"
                      value={form.organizaciones_id}
                      onChange={handleCampo}
                      className={claseInput('organizaciones_id')}
                    >
                      <option value="" disabled>Selecciona la organización</option>
                      {organizacionesSelect.map((org) => (
                        <option key={org.id} value={org.id}>{org.nombre}</option>
                      ))}
                    </select>
                    {errores.organizaciones_id && (
                      <span className="ls-form-error">{errores.organizaciones_id}</span>
                    )}
                  </div>
                </div>

                {/* CASILLEROS: solo para cerraduras */}
                {tipoActual === 'CERRADURAS' && form.organizaciones_id && (
                  <div className="ls-form-group">
                    <label>Casilleros que controla *</label>
                    {casillerosDeLaOrg.length === 0 ? (
                      <small className="ls-form-ayuda">Esta organización no tiene casilleros.</small>
                    ) : (
                      <div className="ls-disp-casilleros">
                        {casillerosDeLaOrg.map((c) => {
                          const ocupado = estaOcupado(c)
                          return (
                            <label
                              key={c.id}
                              className={`ls-disp-casillero ${ocupado ? 'ocupado' : ''} ${form.casilleros.includes(c.id) ? 'marcado' : ''}`}
                              title={ocupado ? `Lo controla ${c.dispositivo_mac}` : ''}
                            >
                              <input
                                type="checkbox"
                                checked={form.casilleros.includes(c.id)}
                                onChange={() => alternarCasillero(c.id)}
                                disabled={ocupado}
                              />
                              {c.numero}
                            </label>
                          )
                        })}
                      </div>
                    )}
                    <small className="ls-form-ayuda">
                      La posición en el código del ESP32 es el número del casillero (A-03 = posición 3).
                    </small>
                    {errores.casilleros && <span className="ls-form-error">{errores.casilleros}</span>}
                  </div>
                )}
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

      {/* MODAL DEL TOKEN (una sola vez) */}
      {tokenMostrado && (
        <div className="ls-modal-fondo">
          <section className="ls-modal ls-modal-confirmacion">
            <div className="ls-modal-icono-badge ls-disp-icono-token">
              <KeyRound size={26} />
            </div>
            <h2 className="ls-modal-titulo-centro">Token del dispositivo</h2>
            <div className="ls-modal-cuerpo-centro">
              <p className="ls-modal-texto-principal">
                Para <strong>{tokenMostrado.mac}</strong>
              </p>
              <div className="ls-disp-token-caja">
                <code>{tokenMostrado.token}</code>
                <button type="button" onClick={copiarToken} title="Copiar">
                  {copiado ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="ls-modal-texto-secundario">
                Cópialo y pégalo en <code>DEVICE_TOKEN</code> del código del ESP32.
                <strong> No se volverá a mostrar.</strong> Si lo pierdes, regenéralo.
              </p>
            </div>
            <div className="ls-modal-footer-botones">
              <button
                type="button"
                className="ls-btn-primario"
                onClick={() => {
                  setTokenMostrado(null)
                  setToast('Dispositivo listo. Recuerda actualizar su código.')
                }}
              >
                Ya lo copié
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL CONFIRMAR (baja / reactivar / regenerar token) */}
      {confirmacion && conf && (
        <div className="ls-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !procesando) setConfirmacion(null) }}>
          <section className="ls-modal ls-modal-confirmacion">
            <button type="button" className="ls-modal-cerrar-esquina" onClick={() => !procesando && setConfirmacion(null)}>
              <X size={16} />
            </button>
            <div className="ls-modal-icono-badge">{conf.icono}</div>
            <h2 className="ls-modal-titulo-centro">{conf.titulo}</h2>
            <div className="ls-modal-cuerpo-centro">
              <p className="ls-modal-texto-principal">
                Dispositivo <strong>{confirmacion.dispositivo.identificador}</strong>
              </p>
              <p className="ls-modal-texto-secundario">{conf.texto}</p>
            </div>
            <div className="ls-modal-footer-botones">
              <button type="button" className="ls-btn-secundario" onClick={() => setConfirmacion(null)} disabled={procesando}>Cancelar</button>
              <button type="button" className="ls-btn-primario" onClick={aplicarConfirmacion} disabled={procesando}>
                {procesando ? 'Procesando...' : conf.boton}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}