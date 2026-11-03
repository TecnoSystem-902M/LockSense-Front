import { useState } from 'react'
import {
  Activity,
  Search,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import '../../styles/Usuarios/usuario1.css'

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
]

export default function MiActividad() {
  const [busqueda, setBusqueda] = useState('')

  const resultados = actividades.filter((actividad) => {
    const texto = [
      actividad.usuario,
      actividad.tipo,
      actividad.fecha,
      actividad.riesgo,
    ].join(' ').toLowerCase()

    return texto.includes(busqueda.toLowerCase())
  })

  return (
  <div className="ls-mi-actividad">

    <div className="ls-usuario-pagina-titulo">
      <h2>Mi actividad</h2>
      <p>Monitorea los movimientos y eventos de seguridad.</p>
    </div>

    <section className="ls-actividad-panel">

      <div className="ls-actividad-panel-header">
        <div>
          <h3><Activity size={21} /> Actividad</h3>
          <p>Historial de eventos registrados</p>
        </div>

        <span className="ls-actividad-total">
          {resultados.length} registros
        </span>
      </div>

      <div className="ls-actividad-busqueda">
        <Search size={18} />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar actividad o riesgo..."
        />
      </div>

      <div className="ls-actividad-tarjetas">
        {resultados.map((actividad) => (
          <article className="ls-actividad-card" key={actividad.id}>

            <div className="ls-actividad-card-id">
              #{actividad.id}
            </div>

            <div className="ls-actividad-card-contenido">
              <div className="ls-actividad-card-titulo">
                <strong>{actividad.tipo}</strong>

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
              </div>

              <div className="ls-actividad-card-detalles">
                <span>Usuario: {actividad.usuario}</span>
                <span>Fecha: {actividad.fecha}</span>
                <span>Hora: {actividad.hora} hrs</span>
              </div>
            </div>

          </article>
        ))}

        {resultados.length === 0 && (
          <p className="ls-actividad-vacio">
            No se encontraron actividades.
          </p>
        )}
      </div>

    </section>
  </div>
)
}