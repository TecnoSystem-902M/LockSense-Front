import { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Plus
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import '../../styles/superadmin/Administradores.css'

// --- DATOS DE PRUEBA (Luego conectas tu API aquí) ---
const adminsEjemplo = [
  { id: 1, nombre: 'Carlos Mendoza', correo: 'carlos@techcorp.com', organizacion: 'TechCorp Solutions' },
  { id: 2, nombre: 'Ana Lucía Gómez', correo: 'ana.gomez@ut.edu.mx', organizacion: 'Universidad Tecnológica' },
  { id: 3, nombre: 'Roberto Díaz', correo: 'rdiaz@gobierno.gob.mx', organizacion: 'Gobierno del Estado' },
  { id: 4, nombre: 'María José Pérez', correo: 'mjperez@colegiosanjose.edu', organizacion: 'Colegio San José' },
]

// Simulamos las organizaciones para el <select> del formulario
const organizacionesDisponibles = [
  'TechCorp Solutions',
  'Universidad Tecnológica',
  'Gobierno del Estado',
  'Colegio San José'
]

const formVacio = {
  nombre: '',
  correo: '',
  organizacion: '',
}

export default function Administradores() {
  const [administradores, setAdministradores] = useState([])
  const [cargando, setCargando] = useState(false)

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false)
  const [adminEditando, setAdminEditando] = useState(null)
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
  const cargarAdministradores = useCallback(async () => {
    setCargando(true)
    try {
      setTimeout(() => {
        setAdministradores(adminsEjemplo)
        setCargando(false)
      }, 500)
    } catch {
      setAdministradores([])
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarAdministradores()
  }, [cargarAdministradores])

  // Filtrado
  const adminsFiltrados = administradores.filter((admin) => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return true
    return (
      admin.nombre.toLowerCase().includes(termino) ||
      admin.correo.toLowerCase().includes(termino) ||
      admin.organizacion.toLowerCase().includes(termino)
    )
  })

  // Lógica de paginación
  const totalPaginas = Math.max(1, Math.ceil(adminsFiltrados.length / registrosPorPagina))
  const paginaSegura = Math.min(paginaActual, totalPaginas)
  const indiceInicial = (paginaSegura - 1) * registrosPorPagina
  const adminsVisibles = adminsFiltrados.slice(indiceInicial, indiceInicial + registrosPorPagina)

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor)
    setPaginaActual(1)
  }

  // Handlers Modales
  const abrirNuevo = () => {
    setAdminEditando(null)
    setForm(formVacio)
    setModalAbierto(true)
  }

  const abrirModificar = (admin) => {
    setAdminEditando(admin)
    setForm({
      nombre: admin.nombre,
      correo: admin.correo,
      organizacion: admin.organizacion,
    })
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
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      setTimeout(() => {
        if (adminEditando) {
          setAdministradores(prev => prev.map(a => a.id === adminEditando.id ? { ...a, ...form } : a))
          setToast('Administrador actualizado correctamente')
        } else {
          const nuevo = { id: Date.now(), ...form }
          setAdministradores(prev => [...prev, nuevo])
          setToast('Administrador registrado correctamente')
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
      setAdministradores(prev => prev.filter(a => a.id !== confirmarBaja.id))
      setToast(`Administrador ${confirmarBaja.nombre} eliminado`)
      setConfirmarBaja(null)
      setEliminando(false)
    }, 500)
  }

  // Generar iniciales para el avatar
  const obtenerIniciales = (nombre) => {
    return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

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
                <th className="ls-col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adminsVisibles.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>
                    <div className="ls-admin-nombre">
                      <div className="ls-admin-avatar">
                        {obtenerIniciales(admin.nombre)}
                      </div>
                      <strong>{admin.nombre}</strong>
                    </div>
                  </td>
                  <td>{admin.correo}</td>
                  <td>{admin.organizacion}</td>
                  <td className="ls-col-acciones">
                    <div className="ls-admin-acciones">
                      <button
                        type="button"
                        className="ls-accion-btn modificar"
                        onClick={() => abrirModificar(admin)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        className="ls-accion-btn eliminar"
                        onClick={() => setConfirmarBaja(admin)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {adminsVisibles.length === 0 && (
                <tr>
                  <td colSpan="5" className="ls-admins-vacio">
                    {cargando ? 'Cargando administradores...' : 'No se encontraron administradores.'}
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

            <form onSubmit={guardar}>
              <div className="ls-modal-body">
                
                <div className="ls-form-group">
                  <label>Nombre completo</label>
                  <input 
                    name="nombre" 
                    type="text" 
                    placeholder="Ej: Juan Pérez"
                    value={form.nombre} 
                    onChange={handleCampo} 
                    required 
                  />
                </div>

                <div className="ls-form-group">
                  <label>Correo electrónico</label>
                  <input 
                    name="correo" 
                    type="email" 
                    placeholder="Ej: juan@empresa.com"
                    value={form.correo} 
                    onChange={handleCampo} 
                    required 
                  />
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
            <h2 className="ls-modal-titulo-centro">¿Eliminar administrador?</h2>
            <div className="ls-modal-cuerpo-centro">
              <p className="ls-modal-texto-principal">
                ¿Estás seguro de eliminar a <strong>{confirmarBaja.nombre}</strong>?
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