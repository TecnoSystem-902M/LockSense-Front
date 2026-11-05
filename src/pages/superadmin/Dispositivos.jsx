import { useState, useEffect, useCallback } from 'react'
import {
  Cpu,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Plus
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import '../../styles/superadmin/Dispositivos.css'

// --- DATOS DE PRUEBA ---
const dispositivosEjemplo = [
  { id: 1, identificador: 'DEV-A1B2', token: 'tk_9f8a7b6c5d4e3f2g1h', estado: 'Activo', organizacion: 'TechCorp Solutions' },
  { id: 2, identificador: 'DEV-X9Y8', token: 'tk_1a2b3c4d5e6f7g8h9i', estado: 'Inactivo', organizacion: 'Universidad Tecnológica' },
  { id: 3, identificador: 'DEV-M4N5', token: 'tk_0z9y8x7w6v5u4t3s2r', estado: 'Activo', organizacion: 'Gobierno del Estado' },
  { id: 4, identificador: 'DEV-Q1W2', token: 'tk_5p4o3i2u1y0t9r8e7w', estado: 'Bloqueado', organizacion: 'Colegio San José' },
]

// Simulamos las organizaciones para el <select> del formulario
const organizacionesDisponibles = [
  'TechCorp Solutions',
  'Universidad Tecnológica',
  'Gobierno del Estado',
  'Colegio San José'
]

const formVacio = {
  identificador: '',
  token: '',
  estado: 'Activo',
  organizacion: '',
}

export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([])
  const [cargando, setCargando] = useState(false)

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false)
  const [dispositivoEditando, setDispositivoEditando] = useState(null)
  const [form, setForm] = useState(formVacio)
  const [guardando, setGuardando] = useState(false)

  const [confirmarBaja, setConfirmarBaja] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Notificaciones
  const [toast, setToast] = useState('')

  // Paginación y Búsqueda
  const [busqueda, setBusqueda] = useState('')
  const registrosPorPagina = 5
  const [paginaActual, setPaginaActual] = useState(1)

  // Simulación de carga de datos
  const cargarDispositivos = useCallback(async () => {
    setCargando(true)
    try {
      setTimeout(() => {
        setDispositivos(dispositivosEjemplo)
        setCargando(false)
      }, 500)
    } catch {
      setDispositivos([])
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDispositivos()
  }, [cargarDispositivos])

  // Filtrado
  const dispositivosFiltrados = dispositivos.filter((disp) => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return true
    return (
      disp.identificador.toLowerCase().includes(termino) ||
      disp.token.toLowerCase().includes(termino) ||
      disp.estado.toLowerCase().includes(termino) ||
      disp.organizacion.toLowerCase().includes(termino)
    )
  })

  // Lógica de paginación
  const totalPaginas = Math.max(1, Math.ceil(dispositivosFiltrados.length / registrosPorPagina))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const indiceInicial = (paginaSegura - 1) * registrosPorPagina
  const dispositivosVisibles = dispositivosFiltrados.slice(indiceInicial, indiceInicial + registrosPorPagina)

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor)
    setPaginaActual(1)
  }

  // Handlers Modales
  const abrirNuevo = () => {
    setDispositivoEditando(null)
    setForm(formVacio)
    setModalAbierto(true)
  }

  const abrirModificar = (dispositivo) => {
    setDispositivoEditando(dispositivo)
    setForm({
      identificador: dispositivo.identificador,
      token: dispositivo.token,
      estado: dispositivo.estado,
      organizacion: dispositivo.organizacion,
    })
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    if (guardando) return
    setModalAbierto(false)
    setDispositivoEditando(null)
  }

  const handleCampo = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      setTimeout(() => {
        if (dispositivoEditando) {
          setDispositivos(prev => prev.map(d => d.id === dispositivoEditando.id ? { ...d, ...form } : d))
          setToast('Dispositivo actualizado correctamente')
        } else {
          const nuevo = { id: Date.now(), ...form }
          setDispositivos(prev => [...prev, nuevo])
          setToast('Dispositivo registrado correctamente')
        }
        setModalAbierto(false)
        setGuardando(false)
      }, 500)
    } catch {
      setGuardando(false)
    }
  }

  const confirmarEliminar = () => {
    if (!confirmarBaja) return
    setEliminando(true)
    setTimeout(() => {
      setDispositivos(prev => prev.filter(d => d.id !== confirmarBaja.id))
      setToast(`Dispositivo ${confirmarBaja.identificador} eliminado`)
      setConfirmarBaja(null)
      setEliminando(false)
    }, 500)
  }

  // Helper para el color del estado
  const getEstadoColor = (estado) => {
    if (estado === 'Activo') return 'estado-activo'
    if (estado === 'Inactivo') return 'estado-inactivo'
    return 'estado-bloqueado'
  }

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
              placeholder="Buscar por identificador, token u organización..."
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
                <th>Identificador</th>
                <th>Token</th>
                <th>Estado</th>
                <th>Organización</th>
                <th className="ls-col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dispositivosVisibles.map((disp) => (
                <tr key={disp.id}>
                  <td>{disp.id}</td>
                  <td>
                    <div className="ls-disp-identificador">
                      <div className="ls-disp-icono">
                        <Cpu size={18} />
                      </div>
                      <strong>{disp.identificador}</strong>
                    </div>
                  </td>
                  <td>
                    <code className="ls-disp-token">{disp.token}</code>
                  </td>
                  <td>
                    <span className={`ls-disp-badge ${getEstadoColor(disp.estado)}`}>
                      {disp.estado}
                    </span>
                  </td>
                  <td>{disp.organizacion}</td>
                  <td className="ls-col-acciones">
                    <div className="ls-disp-acciones">
                      <button
                        type="button"
                        className="ls-accion-btn modificar"
                        onClick={() => abrirModificar(disp)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        className="ls-accion-btn eliminar"
                        onClick={() => setConfirmarBaja(disp)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {dispositivosVisibles.length === 0 && (
                <tr>
                  <td colSpan="6" className="ls-disp-vacio">
                    {cargando ? 'Cargando dispositivos...' : 'No se encontraron dispositivos.'}
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
                <p>Ingresa los datos del dispositivo.</p>
              </div>
              <button type="button" className="ls-modal-cerrar" onClick={cerrarModal}><X size={20} /></button>
            </div>

            <form onSubmit={guardar}>
              <div className="ls-modal-body">
                
                <div className="ls-form-group">
                  <label>Identificador</label>
                  <input 
                    name="identificador" 
                    type="text" 
                    placeholder="Ej: DEV-A1B2"
                    value={form.identificador} 
                    onChange={handleCampo} 
                    required 
                  />
                </div>

                <div className="ls-form-group">
                  <label>Token</label>
                  <input 
                    name="token" 
                    type="text" 
                    placeholder="Ej: tk_9f8a7b6c5d4e3f2g1h"
                    value={form.token} 
                    onChange={handleCampo} 
                    required 
                  />
                </div>

                <div className="ls-form-row">
                  <div className="ls-form-group">
                    <label>Estado</label>
                    <select name="estado" value={form.estado} onChange={handleCampo}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Bloqueado">Bloqueado</option>
                    </select>
                  </div>

                  <div className="ls-form-group">
                    <label>Organización</label>
                    <select name="organizacion" value={form.organizacion} onChange={handleCampo} required>
                      <option value="" disabled>Selecciona la organización</option>
                      {organizacionesDisponibles.map(org => (
                        <option key={org} value={org}>{org}</option>
                      ))}
                    </select>
                  </div>
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

      {/* MODAL CONFIRMAR BAJA */}
      {confirmarBaja && (
        <div className="ls-modal-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget && !eliminando) setConfirmarBaja(null) }}>
          <section className="ls-modal ls-modal-confirmacion">
            <button type="button" className="ls-modal-cerrar-esquina" onClick={() => !eliminando && setConfirmarBaja(null)}>
              <X size={16} />
            </button>
            <div className="ls-modal-icono-badge">
              <AlertTriangle size={26} />
            </div>
            <h2 className="ls-modal-titulo-centro">¿Eliminar dispositivo?</h2>
            <div className="ls-modal-cuerpo-centro">
              <p className="ls-modal-texto-principal">
                ¿Estás seguro de eliminar el dispositivo <strong>{confirmarBaja.identificador}</strong>?
              </p>
              <p className="ls-modal-texto-secundario">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="ls-modal-footer-botones">
              <button type="button" className="ls-btn-secundario" onClick={() => setConfirmarBaja(null)} disabled={eliminando}>Cancelar</button>
              <button type="button" className="ls-btn-primario" onClick={confirmarEliminar} disabled={eliminando}>
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}