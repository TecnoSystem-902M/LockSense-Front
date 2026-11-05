import { useState, useEffect, useCallback } from 'react'
import {
    Building2,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    Plus
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import '../../styles/superadmin/Organizaciones.css'

// --- DATOS DE PRUEBA (Luego conectas tu API aquí) ---
const organizacionesEjemplo = [
    { id: 1, nombre: 'Universidad Tecnológica', tipo: 'Escuelas', direccion: 'Av. Central 123', telefono: '+52 555 123 4567' },
    { id: 2, nombre: 'TechCorp Solutions', tipo: 'Empresas', direccion: 'Calle Falsa 456', telefono: '+52 555 987 6543' },
    { id: 3, nombre: 'Gobierno del Estado', tipo: 'Otras', direccion: 'Palacio de Gobierno', telefono: '+52 555 111 2222' },
    { id: 4, nombre: 'Colegio San José', tipo: 'Escuelas', direccion: 'Av. de los Maestros 89', telefono: '+52 555 333 4444' },
]

const formVacio = {
    nombre: '',
    tipo: 'Escuelas',
    direccion: '',
    telefono: '',
}

export default function Organizaciones() {
    const [organizaciones, setOrganizaciones] = useState([])
    const [cargando, setCargando] = useState(false)

    // Modales
    const [modalAbierto, setModalAbierto] = useState(false)
    const [organizacionEditando, setOrganizacionEditando] = useState(null)
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
    const cargarOrganizaciones = useCallback(async () => {
        setCargando(true)
        try {
            // Aquí iría tu API: const data = await listarOrganizaciones()
            setTimeout(() => {
                setOrganizaciones(organizacionesEjemplo)
                setCargando(false)
            }, 500)
        } catch {
            setOrganizaciones([])
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargarOrganizaciones()
    }, [cargarOrganizaciones])

    // Filtrado
    const organizacionesFiltradas = organizaciones.filter((org) => {
        const termino = busqueda.trim().toLowerCase()
        if (!termino) return true
        return (
            org.nombre.toLowerCase().includes(termino) ||
            org.tipo.toLowerCase().includes(termino) ||
            org.direccion.toLowerCase().includes(termino)
        )
    })

    // Lógica de paginación
    const totalPaginas = Math.max(1, Math.ceil(organizacionesFiltradas.length / registrosPorPagina))
    const paginaSegura = Math.min(paginaActual, totalPaginas)
    const indiceInicial = (paginaSegura - 1) * registrosPorPagina
    const organizacionesVisibles = organizacionesFiltradas.slice(indiceInicial, indiceInicial + registrosPorPagina)

    const cambiarBusqueda = (valor) => {
        setBusqueda(valor)
        setPaginaActual(1)
    }

    // Handlers Modales
    const abrirNuevo = () => {
        setOrganizacionEditando(null)
        setForm(formVacio)
        setModalAbierto(true)
    }

    const abrirModificar = (org) => {
        setOrganizacionEditando(org)
        setForm({
            nombre: org.nombre,
            tipo: org.tipo,
            direccion: org.direccion,
            telefono: org.telefono,
        })
        setModalAbierto(true)
    }

    const cerrarModal = () => {
        if (guardando) return
        setModalAbierto(false)
        setOrganizacionEditando(null)
    }

    const handleCampo = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const guardar = async (e) => {
        e.preventDefault()
        setGuardando(true)
        try {
            // Simulación de guardado en API
            setTimeout(() => {
                if (organizacionEditando) {
                    setOrganizaciones(prev => prev.map(o => o.id === organizacionEditando.id ? { ...o, ...form } : o))
                    setToast('Organización actualizada correctamente')
                } else {
                    const nueva = { id: Date.now(), ...form }
                    setOrganizaciones(prev => [...prev, nueva])
                    setToast('Organización registrada correctamente')
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
            setOrganizaciones(prev => prev.filter(o => o.id !== confirmarBaja.id))
            setToast(`Organización ${confirmarBaja.nombre} eliminada`)
            setConfirmarBaja(null)
            setEliminando(false)
        }, 500)
    }

    return (
        <div className="ls-organizaciones">
            {toast && <ToastNotification mensaje={toast} onClose={() => setToast('')} />}

            {/* HEADER */}
            <div className="ls-org-heading">
                <div>
                    <h1>Organizaciones</h1>
                    <p>Administración de las organizaciones registradas en LOCKSENSE</p>
                </div>
                <button type="button" className="ls-org-btn-nuevo" onClick={abrirNuevo}>
                    <Plus size={18} />
                    <span>Nueva organización</span>
                </button>
            </div>

            {/* PANEL DE TABLA */}
            <section className="ls-org-panel">

                {/* TÍTULO DEL LISTADO */}
                <div className="ls-org-panel-heading">
                    <h2>Listado de organizaciones</h2>
                </div>

                <div className="ls-org-controles">
                    <div className="ls-org-mostrar">
                        Organizaciones registradas: <strong>{organizaciones.length}</strong>
                    </div>
                    <label className="ls-org-busqueda">
                        <span>Buscar:</span>
                        <input
                            type="search"
                            placeholder="Buscar por nombre o tipo..."
                            value={busqueda}
                            onChange={(e) => cambiarBusqueda(e.target.value)}
                        />
                    </label>
                </div>

                <div className="ls-org-tabla-contenedor">
                    <table className="ls-org-tabla">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Organización</th>
                                <th>Tipo</th>
                                <th>Dirección</th>
                                <th>Teléfono</th>
                                <th className="ls-col-acciones">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizacionesVisibles.map((org) => (
                                <tr key={org.id}>
                                    <td>{org.id}</td>
                                    <td>
                                        <div className="ls-org-nombre">
                                            <div className="ls-org-avatar">
                                                <Building2 size={18} />
                                            </div>
                                            <strong>{org.nombre}</strong>
                                        </div>
                                    </td>
                                    <td>{org.tipo}</td>
                                    <td>{org.direccion}</td>
                                    <td>{org.telefono}</td>
                                    <td className="ls-col-acciones">
                                        <div className="ls-org-acciones">
                                            <button
                                                type="button"
                                                className="ls-accion-btn modificar"
                                                onClick={() => abrirModificar(org)}
                                            >
                                                <Pencil size={17} />
                                            </button>
                                            <button
                                                type="button"
                                                className="ls-accion-btn eliminar"
                                                onClick={() => setConfirmarBaja(org)}
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {organizacionesVisibles.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="ls-org-vacio">
                                        {cargando ? 'Cargando organizaciones...' : 'No se encontraron organizaciones.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN */}
                <div className="ls-org-paginacion">
                    <span>
                        Mostrando {organizacionesVisibles.length} de {organizacionesFiltradas.length} registros
                    </span>
                    <div className="ls-org-paginacion-botones">
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
                                <h2>{organizacionEditando ? 'Modificar organización' : 'Nueva organización'}</h2>
                                <p>Ingresa los datos de la organización.</p>
                            </div>
                            <button type="button" className="ls-modal-cerrar" onClick={cerrarModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={guardar}>
                            <div className="ls-modal-body">
                                <div className="ls-form-group">
                                    <label>Nombre de la organización</label>
                                    <input
                                        name="nombre"
                                        type="text"
                                        placeholder="Ej: Universidad Tecnológica, TechCorp..."
                                        value={form.nombre}
                                        onChange={handleCampo}
                                        required
                                    />
                                </div>

                                <div className="ls-form-row">
                                    <div className="ls-form-group">
                                        <label>Tipo</label>
                                        <select name="tipo" value={form.tipo} onChange={handleCampo}>
                                            <option value="" disabled>Selecciona el tipo</option>
                                            <option value="Empresa / Corporativo">Empresa / Corporativo</option>
                                            <option value="Fábrica / Planta Industrial">Fábrica / Planta Industrial</option>
                                            <option value="Escuela Pública">Escuela Pública</option>
                                            <option value="Escuela Privada / Universidad">Escuela Privada / Universidad</option>
                                            <option value="Gimnasio">Gimnasio</option>
                                            <option value="Centro Deportivo">Centro Deportivo</option>
                                            <option value="Hospital / Clínica">Hospital / Clínica</option>
                                            <option value="Hotel / Hospedaje">Hotel / Hospedaje</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                    <div className="ls-form-group">
                                        <label>Teléfono</label>
                                        <input
                                            name="telefono"
                                            type="text"
                                            placeholder="Ej: +52 555 123 4567"
                                            value={form.telefono}
                                            onChange={handleCampo}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="ls-form-group">
                                    <label>Dirección</label>
                                    <input
                                        name="direccion"
                                        type="text"
                                        placeholder="Ej: Av. Central 123, Col. Centro"
                                        value={form.direccion}
                                        onChange={handleCampo}
                                        required
                                    />
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
                        <h2 className="ls-modal-titulo-centro">¿Eliminar organización?</h2>
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