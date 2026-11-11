import { useEffect, useState } from 'react'
import {
  Activity,
  Search,
  ShieldCheck,
  AlertTriangle,
  Camera,
  X,
} from 'lucide-react'
import { obtenerMiActividad, obtenerEvidencia } from '../../api/usuario'
import '../../styles/Usuarios/MiActividad.css'

const ITEMS_POR_PAGINA = 5

export default function MiActividad() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroRiesgo, setFiltroRiesgo] = useState('Todos')
  const [paginaActual, setPaginaActual] = useState(1)

  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Foto de la cámara (modal)
  const [foto, setFoto] = useState(null)            // datos de la anomalía + imagen
  const [fotoAbierta, setFotoAbierta] = useState(false)
  const [fotoCargando, setFotoCargando] = useState(false)
  const [fotoError, setFotoError] = useState('')

  const verFoto = async (anomaliaId) => {
    setFotoAbierta(true)
    setFoto(null)
    setFotoError('')
    setFotoCargando(true)

    try {
      setFoto(await obtenerEvidencia(anomaliaId))
    } catch (err) {
      setFotoError(err?.response?.data?.message || 'No se pudo cargar la foto.')
    } finally {
      setFotoCargando(false)
    }
  }

  const cerrarFoto = () => {
    setFotoAbierta(false)
    setFoto(null)
    setFotoError('')
  }

  // Cerrar el modal con la tecla Esc
  useEffect(() => {
    if (!fotoAbierta) return undefined
    const alPresionar = (e) => { if (e.key === 'Escape') cerrarFoto() }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [fotoAbierta])

  useEffect(() => {
    let activo = true

    obtenerMiActividad()
      .then((respuesta) => {
        if (activo) setActividades(respuesta.actividades ?? [])
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar tu actividad. Intenta de nuevo más tarde.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  // Filtrado por búsqueda y por nivel de riesgo
  const resultados = actividades.filter((actividad) => {
    const texto = [
      actividad.usuario,
      actividad.tipo,
      actividad.fecha,
      actividad.riesgo,
    ].join(' ').toLowerCase()

    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideRiesgo = filtroRiesgo === 'Todos' || actividad.riesgo === filtroRiesgo

    return coincideBusqueda && coincideRiesgo
  })

  const totalPaginas = Math.ceil(resultados.length / ITEMS_POR_PAGINA)
  const indiceInicial = (paginaActual - 1) * ITEMS_POR_PAGINA
  const indiceFinal = indiceInicial + ITEMS_POR_PAGINA
  const resultadosPaginados = resultados.slice(indiceInicial, indiceFinal)

  const manejarBusqueda = (e) => {
    setBusqueda(e.target.value)
    setPaginaActual(1)
  }

  const manejarFiltroRiesgo = (e) => {
    setFiltroRiesgo(e.target.value)
    setPaginaActual(1)
  }

  return (
    <div className="ls-mi-actividad">

      <div className="ls-usuario-pagina-titulo">
        <h2>Mi actividad</h2>
        <p>Monitorea los movimientos y eventos de seguridad.</p>
        {error && <p className="ls-dashboard-error">{error}</p>}
      </div>

      <section className="ls-actividad-panel">

        <div className="ls-actividad-panel-header">
          <div className="ls-actividad-header-top">
            <h3><Activity size={21} /> Actividad</h3>
          </div>
          
          <div className="ls-actividad-toolbar">
            
            {/* IZQUIERDA: Conteo */}
            <span className="ls-actividad-registros">
              Registros totales: <strong>{resultados.length}</strong>
            </span>

            {/* DERECHA: Filtro y Buscador */}
            <div className="ls-actividad-controles">
              
              {/* Filtro con etiqueta */}
              <div className="ls-actividad-filtro">
                <label>Riesgo:</label>
                <select value={filtroRiesgo} onChange={manejarFiltroRiesgo}>
                  <option value="Todos">Todos</option>
                  <option value="Seguro">Seguro</option>
                  <option value="Sospechoso">Sospechoso</option>
                </select>
              </div>

              {/* Buscador */}
              <div className="ls-actividad-busqueda">
                <label>Buscar:</label>
                <div className="ls-busqueda-input-wrapper">
                  <Search size={18} />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={manejarBusqueda}
                    placeholder="Buscar por actividad..."
                  />
                </div>
              </div>

            </div>

          </div>
        </div>

        <div className="ls-actividad-tabla-scroll sin-scroll">
          <table className="ls-actividad-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Tipo de actividad</th>
                <th>Fecha y Hora</th>
                <th>Riesgo</th>
                <th className="ls-actividad-col-foto">Foto</th>
              </tr>
            </thead>
            <tbody>
              {resultadosPaginados.map((actividad) => (
                <tr key={actividad.clave}>
                  <td>{actividad.id}</td>
                  <td>{actividad.usuario}</td>
                  <td>{actividad.tipo}</td>
                  <td>
                    {actividad.fecha}
                    <small>{actividad.hora} hrs</small>
                  </td>
                  <td>
                    <span className={`ls-riesgo ${
                      actividad.riesgo === 'Seguro'
                        ? 'ls-riesgo-seguro'
                        : 'ls-riesgo-sospechoso'
                    }`}>
                      {actividad.riesgo === 'Seguro'
                        ? <ShieldCheck size={14} />
                        : <AlertTriangle size={14} />}
                      {actividad.riesgo}
                    </span>
                  </td>
                  <td className="ls-actividad-col-foto">
                    {actividad.anomalia_id ? (
                      <button
                        type="button"
                        className="ls-actividad-foto-btn"
                        onClick={() => verFoto(actividad.anomalia_id)}
                        title="Ver foto de la cámara"
                        aria-label="Ver foto de la cámara"
                      >
                        <Camera size={17} />
                      </button>
                    ) : (
                      <span className="ls-actividad-sin-foto">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {cargando && (
                <tr>
                  <td colSpan="6" className="ls-actividad-vacio">
                    Cargando actividad…
                  </td>
                </tr>
              )}

              {!cargando && resultados.length === 0 && (
                <tr>
                  <td colSpan="6" className="ls-actividad-vacio">
                    {actividades.length === 0 && !error
                      ? 'Todavía no hay actividad registrada.'
                      : 'No se encontraron actividades.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="ls-actividad-paginacion">
            <span className="ls-paginacion-texto">
              Mostrando {resultadosPaginados.length} registros
            </span>

            <div className="ls-paginacion-controles">
              <button
                type="button"
                className="ls-paginacion-btn"
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>

              <span className="ls-paginacion-paginas">
                {paginaActual} / {totalPaginas || 1}
              </span>

              <button
                type="button"
                className="ls-paginacion-btn"
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas || totalPaginas === 0}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

      </section>

      {/* MODAL: FOTO DE LA CÁMARA */}
      {fotoAbierta && (
        <div className="ls-actividad-foto-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) cerrarFoto() }}>
          <section className="ls-actividad-foto-modal" role="dialog" aria-modal="true" aria-labelledby="ls-foto-titulo">

            <div className="ls-actividad-foto-header">
              <div>
                <h3 id="ls-foto-titulo">{foto?.tipo || 'Foto de la cámara'}</h3>
                {foto && <p>{foto.fecha} · {foto.hora} hrs</p>}
              </div>
              <button type="button" className="ls-actividad-foto-cerrar" onClick={cerrarFoto} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>

            <div className="ls-actividad-foto-cuerpo">
              {fotoCargando && <p className="ls-actividad-foto-mensaje">Cargando foto…</p>}

              {fotoError && <p className="ls-actividad-foto-mensaje error">{fotoError}</p>}

              {foto && (
                <>
                  <img
                    className="ls-actividad-foto-imagen"
                    src={foto.imagen}
                    alt={`Foto de la cámara: ${foto.tipo}`}
                  />

                  <span className={`ls-actividad-foto-riesgo riesgo-${(foto.riesgo || '').toLowerCase()}`}>
                    <AlertTriangle size={14} />
                    Riesgo {foto.riesgo}
                  </span>

                  {foto.descripcion && (
                    <p className="ls-actividad-foto-descripcion">{foto.descripcion}</p>
                  )}

                  <p className="ls-actividad-foto-nota">
                    Las fotos se borran automáticamente después de 30 días.
                  </p>
                </>
              )}
            </div>

          </section>
        </div>
      )}
    </div>
  )
}