import { useState, useEffect, useCallback } from 'react'
import {
    Building2,
    Pencil,
    Ban,
    RotateCcw,
    X,
    AlertTriangle,
    Plus
} from 'lucide-react'
import ToastNotification from '../../components/ToastNotification'
import {
    listarOrganizaciones,
    crearOrganizacion,
    actualizarOrganizacion,
    cambiarEstadoOrganizacion,
} from '../../api/superadmin'
import '../../styles/superadmin/Organizaciones.css'

// Deben ser los mismos que acepta el back (OrganizacionController::TIPOS)
const TIPOS = [
    'Empresa / Corporativo',
    'Fábrica / Planta Industrial',
    'Escuela Pública',
    'Escuela Privada / Universidad',
    'Gimnasio',
    'Centro Deportivo',
    'Hospital / Clínica',
    'Hotel / Hospedaje',
    'Otro',
]

const formVacio = {
    nombre: '',
    tipo: '',
    telefono: '',
    direccion: '',
    colonia: '',
    ciudad: '',
    codigo_postal: '',
}

// ---------- VALIDACIÓN (la misma que hace el back) ----------
function validarFormulario(form) {
    const errores = {}
    const nombre = form.nombre.trim()
    const telefono = form.telefono.replace(/\D/g, '')
    const cp = form.codigo_postal.trim()

    if (!nombre) errores.nombre = 'El nombre es obligatorio.'
    else if (nombre.length < 3) errores.nombre = 'El nombre debe tener al menos 3 caracteres.'
    else if (nombre.length > 150) errores.nombre = 'El nombre no puede pasar de 150 caracteres.'

    if (!form.tipo) errores.tipo = 'Selecciona el tipo de organización.'
    else if (!TIPOS.includes(form.tipo)) errores.tipo = 'El tipo seleccionado no es válido.'

    if (!telefono) errores.telefono = 'El teléfono es obligatorio.'
    else if (telefono.length !== 10) errores.telefono = 'El teléfono debe tener 10 dígitos (lada + número).'

    if (!form.direccion.trim()) errores.direccion = 'La dirección es obligatoria.'
    else if (form.direccion.trim().length > 225) errores.direccion = 'La dirección no puede pasar de 225 caracteres.'

    if (!form.colonia.trim()) errores.colonia = 'La colonia es obligatoria.'
    else if (form.colonia.trim().length > 100) errores.colonia = 'La colonia no puede pasar de 100 caracteres.'

    if (!form.ciudad.trim()) errores.ciudad = 'La ciudad es obligatoria.'
    else if (form.ciudad.trim().length > 100) errores.ciudad = 'La ciudad no puede pasar de 100 caracteres.'

    if (!cp) errores.codigo_postal = 'El código postal es obligatorio.'
    else if (!/^\d{5}$/.test(cp)) errores.codigo_postal = 'El código postal debe tener 5 dígitos.'

    return errores
}

// Convierte los errores 422 de Laravel ({campo: ['msg']}) a {campo: 'msg'}
function erroresDelBack(err) {
    const errors = err?.response?.data?.errors
    if (!errors) return null
    return Object.fromEntries(Object.entries(errors).map(([campo, msgs]) => [campo, msgs[0]]))
}

function direccionCompleta(org) {
    return [org.direccion, org.colonia, org.ciudad, org.codigo_postal && `C.P. ${org.codigo_postal}`]
        .filter(Boolean)
        .join(', ')
}

function formatearTelefono(tel) {
    if (!tel || tel.length !== 10) return tel || '—'
    return `${tel.slice(0, 2)} ${tel.slice(2, 6)} ${tel.slice(6)}`
}

export default function Organizaciones() {
    const [organizaciones, setOrganizaciones] = useState([])
    const [cargando, setCargando] = useState(false)
    const [errorCarga, setErrorCarga] = useState('')

    // Modal crear / editar
    const [modalAbierto, setModalAbierto] = useState(false)
    const [organizacionEditando, setOrganizacionEditando] = useState(null)
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

    const cargarOrganizaciones = useCallback(async () => {
        setCargando(true)
        setErrorCarga('')
        try {
            const data = await listarOrganizaciones()
            setOrganizaciones(data.organizaciones ?? [])
        } catch {
            setOrganizaciones([])
            setErrorCarga('No se pudieron cargar las organizaciones.')
        } finally {
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
        return [org.nombre, org.codigo, org.tipo, org.ciudad, org.direccion]
            .filter(Boolean)
            .some((valor) => valor.toLowerCase().includes(termino))
    })

    // Paginación
    const totalPaginas = Math.max(1, Math.ceil(organizacionesFiltradas.length / registrosPorPagina))
    const paginaSegura = Math.min(paginaActual, totalPaginas)
    const indiceInicial = (paginaSegura - 1) * registrosPorPagina
    const organizacionesVisibles = organizacionesFiltradas.slice(indiceInicial, indiceInicial + registrosPorPagina)

    const cambiarBusqueda = (valor) => {
        setBusqueda(valor)
        setPaginaActual(1)
    }

    // ---------- MODAL CREAR / EDITAR ----------
    const abrirNuevo = () => {
        setOrganizacionEditando(null)
        setForm(formVacio)
        setErrores({})
        setErrorGeneral('')
        setModalAbierto(true)
    }

    const abrirModificar = (org) => {
        setOrganizacionEditando(org)
        setForm({
            nombre: org.nombre ?? '',
            tipo: org.tipo ?? '',
            telefono: org.telefono ?? '',
            direccion: org.direccion ?? '',
            colonia: org.colonia ?? '',
            ciudad: org.ciudad ?? '',
            codigo_postal: org.codigo_postal ?? '',
        })
        setErrores({})
        setErrorGeneral('')
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
        // Quita el error del campo en cuanto el usuario lo corrige
        if (errores[name]) setErrores((prev) => ({ ...prev, [name]: undefined }))
    }

    const guardar = async (e) => {
        e.preventDefault()
        setErrorGeneral('')

        const erroresForm = validarFormulario(form)
        if (Object.keys(erroresForm).length > 0) {
            setErrores(erroresForm)
            return
        }

        const payload = {
            ...form,
            nombre: form.nombre.trim(),
            telefono: form.telefono.replace(/\D/g, ''),
        }

        setGuardando(true)
        try {
            if (organizacionEditando) {
                await actualizarOrganizacion(organizacionEditando.id, payload)
                setToast('Organización actualizada correctamente')
            } else {
                await crearOrganizacion(payload)
                setToast('Organización registrada correctamente')
            }
            setModalAbierto(false)
            setOrganizacionEditando(null)
            await cargarOrganizaciones()
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
            await cambiarEstadoOrganizacion(confirmarEstado.id, nuevoEstado)
            setToast(nuevoEstado === 'I'
                ? `${confirmarEstado.nombre} fue dada de baja`
                : `${confirmarEstado.nombre} fue reactivada`)
            setConfirmarEstado(null)
            await cargarOrganizaciones()
        } catch (err) {
            setToast(err?.response?.data?.message || 'No se pudo cambiar el estado.')
        } finally {
            setCambiandoEstado(false)
        }
    }

    const darDeBaja = confirmarEstado?.estado === 'A'

    // Clase del input según tenga error
    const claseInput = (campo) => (errores[campo] ? 'ls-input-error' : '')

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
                            placeholder="Buscar por nombre, código o tipo..."
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
                                <th>Estado</th>
                                <th className="ls-col-acciones">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizacionesVisibles.map((org) => (
                                <tr key={org.id} className={org.estado !== 'A' ? 'ls-org-fila-inactiva' : ''}>
                                    <td>{org.id}</td>
                                    <td>
                                        <div className="ls-org-nombre">
                                            <div className="ls-org-avatar">
                                                <Building2 size={18} />
                                            </div>
                                            <div>
                                                <strong>{org.nombre}</strong>
                                                {org.codigo && <small className="ls-org-codigo">{org.codigo}</small>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{org.tipo}</td>
                                    <td>{direccionCompleta(org) || '—'}</td>
                                    <td>{formatearTelefono(org.telefono)}</td>
                                    <td>
                                        <span className={`ls-org-estado ${org.estado === 'A' ? 'activa' : 'inactiva'}`}>
                                            {org.estado === 'A' ? 'Activa' : 'Dada de baja'}
                                        </span>
                                    </td>
                                    <td className="ls-col-acciones">
                                        <div className="ls-org-acciones">
                                            <button
                                                type="button"
                                                className="ls-accion-btn modificar"
                                                onClick={() => abrirModificar(org)}
                                                title="Modificar"
                                            >
                                                <Pencil size={17} />
                                            </button>
                                            {org.estado === 'A' ? (
                                                <button
                                                    type="button"
                                                    className="ls-accion-btn eliminar"
                                                    onClick={() => setConfirmarEstado(org)}
                                                    title="Dar de baja"
                                                >
                                                    <Ban size={17} />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="ls-accion-btn reactivar"
                                                    onClick={() => setConfirmarEstado(org)}
                                                    title="Reactivar"
                                                >
                                                    <RotateCcw size={17} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {organizacionesVisibles.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="ls-org-vacio">
                                        {cargando
                                            ? 'Cargando organizaciones...'
                                            : errorCarga || 'No se encontraron organizaciones.'}
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
                                <p>
                                    {organizacionEditando
                                        ? `Código: ${organizacionEditando.codigo || '—'}`
                                        : 'Se crearán su código y sus 6 casilleros automáticamente.'}
                                </p>
                            </div>
                            <button type="button" className="ls-modal-cerrar" onClick={cerrarModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={guardar} noValidate>
                            <div className="ls-modal-body">
                                {errorGeneral && <p className="ls-form-error-general">{errorGeneral}</p>}

                                <div className="ls-form-group">
                                    <label>Nombre de la organización *</label>
                                    <input
                                        name="nombre"
                                        type="text"
                                        maxLength={150}
                                        placeholder="Ej: Universidad Tecnológica de Nezahualcóyotl"
                                        value={form.nombre}
                                        onChange={handleCampo}
                                        className={claseInput('nombre')}
                                    />
                                    {errores.nombre && <span className="ls-form-error">{errores.nombre}</span>}
                                </div>

                                <div className="ls-form-row">
                                    <div className="ls-form-group">
                                        <label>Tipo *</label>
                                        <select
                                            name="tipo"
                                            value={form.tipo}
                                            onChange={handleCampo}
                                            className={claseInput('tipo')}
                                        >
                                            <option value="" disabled>Selecciona el tipo</option>
                                            {TIPOS.map((tipo) => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                        {errores.tipo && <span className="ls-form-error">{errores.tipo}</span>}
                                    </div>
                                    <div className="ls-form-group">
                                        <label>Teléfono con lada *</label>
                                        <input
                                            name="telefono"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={14}
                                            placeholder="Ej: 55 1234 5678 (10 dígitos)"
                                            value={form.telefono}
                                            onChange={handleCampo}
                                            className={claseInput('telefono')}
                                        />
                                        {errores.telefono && <span className="ls-form-error">{errores.telefono}</span>}
                                    </div>
                                </div>

                                <div className="ls-form-group">
                                    <label>Dirección *</label>
                                    <input
                                        name="direccion"
                                        type="text"
                                        maxLength={225}
                                        placeholder="Ej: Av. Bordo de Xochiaca s/n"
                                        value={form.direccion}
                                        onChange={handleCampo}
                                        className={claseInput('direccion')}
                                    />
                                    {errores.direccion && <span className="ls-form-error">{errores.direccion}</span>}
                                </div>

                                <div className="ls-form-group">
                                    <label>Colonia *</label>
                                    <input
                                        name="colonia"
                                        type="text"
                                        maxLength={100}
                                        placeholder="Ej: Benito Juárez"
                                        value={form.colonia}
                                        onChange={handleCampo}
                                        className={claseInput('colonia')}
                                    />
                                    {errores.colonia && <span className="ls-form-error">{errores.colonia}</span>}
                                </div>

                                <div className="ls-form-row">
                                    <div className="ls-form-group">
                                        <label>Ciudad *</label>
                                        <input
                                            name="ciudad"
                                            type="text"
                                            maxLength={100}
                                            placeholder="Ej: Nezahualcóyotl"
                                            value={form.ciudad}
                                            onChange={handleCampo}
                                            className={claseInput('ciudad')}
                                        />
                                        {errores.ciudad && <span className="ls-form-error">{errores.ciudad}</span>}
                                    </div>
                                    <div className="ls-form-group">
                                        <label>Código postal *</label>
                                        <input
                                            name="codigo_postal"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={5}
                                            placeholder="Ej: 57000"
                                            value={form.codigo_postal}
                                            onChange={handleCampo}
                                            className={claseInput('codigo_postal')}
                                        />
                                        {errores.codigo_postal && <span className="ls-form-error">{errores.codigo_postal}</span>}
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
                            {darDeBaja ? '¿Dar de baja la organización?' : '¿Reactivar la organización?'}
                        </h2>
                        <div className="ls-modal-cuerpo-centro">
                            <p className="ls-modal-texto-principal">
                                {darDeBaja ? 'Vas a dar de baja a ' : 'Vas a reactivar a '}
                                <strong>{confirmarEstado.nombre}</strong>.
                            </p>
                            <p className="ls-modal-texto-secundario">
                                {darDeBaja
                                    ? 'Sus usuarios ya no podrán iniciar sesión. Su historial se conserva y puedes reactivarla después.'
                                    : 'Sus usuarios podrán volver a iniciar sesión.'}
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