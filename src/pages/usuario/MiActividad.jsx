import { useState } from 'react'
import {
  Activity,
  Search,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import '../../styles/Usuarios/MiActividad.css'

const actividades = [
  { id: 1, usuario: 'Juan Perez', tipo: 'Abierto', fecha: '23/09/2026', hora: '12:00', riesgo: 'Seguro' },
  { id: 2, usuario: 'Lupita Tellez', tipo: 'Ingreso de contraseña incorrecta', fecha: '14/09/2026', hora: '15:40', riesgo: 'Sospechoso' },
  { id: 3, usuario: 'Ana Lucia', tipo: 'Cerrado', fecha: '30/09/2026', hora: '09:00', riesgo: 'Seguro' },
  { id: 4, usuario: 'Gabriel Sanchez', tipo: 'La puerta a sido golpeada', fecha: '25/09/2026', hora: '16:50', riesgo: 'Sospechoso' },
  { id: 5, usuario: 'Juan Perez', tipo: 'Acceso RFID/NFC', fecha: '24/09/2026', hora: '10:30', riesgo: 'Seguro' },
  { id: 6, usuario: 'Ana Lucia', tipo: 'Acceso facial', fecha: '24/09/2026', hora: '11:15', riesgo: 'Seguro' },
  { id: 7, usuario: 'Lupita Tellez', tipo: 'Intento de acceso fallido', fecha: '22/09/2026', hora: '14:20', riesgo: 'Sospechoso' },
  { id: 8, usuario: 'Juan Perez', tipo: 'Cerrado', fecha: '21/09/2026', hora: '17:45', riesgo: 'Seguro' },
  { id: 9, usuario: 'Gabriel Sanchez', tipo: 'Acceso RFID/NFC', fecha: '20/09/2026', hora: '08:40', riesgo: 'Seguro' },
  { id: 10, usuario: 'Ana Lucia', tipo: 'Intento de acceso fallido', fecha: '19/09/2026', hora: '13:10', riesgo: 'Sospechoso' },
  { id: 11, usuario: 'Juan Perez', tipo: 'Abierto', fecha: '18/09/2026', hora: '09:20', riesgo: 'Seguro' },
  { id: 12, usuario: 'Lupita Tellez', tipo: 'Cerrado', fecha: '17/09/2026', hora: '18:00', riesgo: 'Seguro' },
  { id: 13, usuario: 'Gabriel Sanchez', tipo: 'Acceso facial', fecha: '16/09/2026', hora: '08:15', riesgo: 'Seguro' },
]

const ITEMS_POR_PAGINA = 5

export default function MiActividad() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroRiesgo, setFiltroRiesgo] = useState('Todos')
  const [paginaActual, setPaginaActual] = useState(1)

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
              </tr>
            </thead>
            <tbody>
              {resultadosPaginados.map((actividad) => (
                <tr key={actividad.id}>
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
                </tr>
              ))}

              {resultados.length === 0 && (
                <tr>
                  <td colSpan="5" className="ls-actividad-vacio">
                    No se encontraron actividades.
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
    </div>
  )
}