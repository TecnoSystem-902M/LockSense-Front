import { useEffect, useState } from 'react'
import {
  LockKeyhole,
  KeyRound,
  CreditCard,
  ScanFace,
  Clock,
} from 'lucide-react'
import { obtenerMiCasillero } from '../../api/usuario'
import '../../styles/Usuarios/MiCasillero.css'

// IMPORTAMOS LA IMAGEN DEL CASILLERO DESDE TU CARPETA ASSETS
import casilleroPersonalImg from '../../assets/casillero-personal.png'

// Texto y clase de la etiqueta según el estado que manda el back.
const ESTADOS_PUERTA = {
  ABIERTO:   { texto: 'Abierto',   clase: 'abierto' },
  CERRADO:   { texto: 'Cerrado',   clase: 'cerrado' },
  BLOQUEADO: { texto: 'Bloqueado', clase: 'bloqueado' },
}

function IconoMetodo({ metodo }) {
  return metodo === 'Rostro'
    ? <ScanFace size={18} />
    : <CreditCard size={18} />
}

function SinRegistros() {
  return (
    <div className="ls-info-registro">
      <div className="ls-info-detalle">
        <span>Sin registros todavía.</span>
      </div>
    </div>
  )
}

export default function MiCasillero() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    obtenerMiCasillero()
      .then((respuesta) => {
        if (activo) setDatos(respuesta)
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar la información de tu casillero.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const accesos = datos?.accesos ?? []
  const estados = datos?.estados ?? []
  const estadoPuerta = ESTADOS_PUERTA[datos?.estado]

  let textoEtiqueta = estadoPuerta?.texto ?? 'Sin casillero'
  if (cargando) textoEtiqueta = 'Cargando…'
  if (error) textoEtiqueta = '—'

  return (
    <div className="ls-mi-casillero">

      <div className="ls-usuario-pagina-titulo">
        <h2>
          Mi casillero
          {datos?.casillero ? ` ${datos.casillero}` : ''}
        </h2>
        <p>Consulta el estado y los accesos de tu casillero.</p>
        {error && <p className="ls-dashboard-error">{error}</p>}
      </div>

      <section className="ls-casillero-resumen">
        <div className="ls-casillero-ilustracion">
          <div className="ls-casillero-ilustracion-contenedor">
            <img
              src={casilleroPersonalImg}
              alt="Casillero Personal"
              className="ls-casillero-imagen-render"
            />
          </div>
          <span className={`ls-casillero-estado ${estadoPuerta?.clase ?? ''}`}>
            {textoEtiqueta}
          </span>
        </div>

        <div className="ls-casillero-informacion">
          {/* ÚLTIMOS MÉTODOS */}
          <article className="ls-casillero-info-card">
            <h3>
              <KeyRound size={19} />
              Últimos métodos
              <span className="ls-info-contador">{accesos.length}</span>
            </h3>

            <div className="ls-info-lista">
              {!cargando && accesos.length === 0 && <SinRegistros />}

              {accesos.map((acceso) => (
                <div className="ls-info-registro" key={acceso.id}>
                  <div className="ls-info-icono">
                    <IconoMetodo metodo={acceso.metodo} />
                  </div>

                  <div className="ls-info-detalle">
                    <strong>{acceso.metodo}</strong>
                    <span>{acceso.fecha} · {acceso.hora}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* ÚLTIMOS ESTADOS */}
          <article className="ls-casillero-info-card">
            <h3>
              <LockKeyhole size={19} />
              Últimos estados
              <span className="ls-info-contador">{estados.length}</span>
            </h3>

            <div className="ls-info-lista">
              {!cargando && estados.length === 0 && <SinRegistros />}

              {estados.map((registro) => {
                const abierto = registro.estado === 'ABIERTO'

                return (
                  <div className="ls-info-registro" key={registro.id}>
                    <div className={`ls-info-icono ${abierto ? 'estado-abierto' : 'estado-cerrado'}`}>
                      <LockKeyhole size={18} />
                    </div>

                    <div className="ls-info-detalle">
                      <strong>{abierto ? 'Abierto' : 'Cerrado'}</strong>
                      <span>{registro.fecha} · {registro.hora}</span>
                    </div>

                    <span className={`ls-info-indicador ${abierto ? 'abierto' : 'cerrado'}`} />
                  </div>
                )
              })}
            </div>
          </article>
        </div>
      </section>

      {/* ÚLTIMOS ACCESOS */}
      <section className="ls-casillero-historial">
        <div className="ls-usuario-seccion-header">
          <h3><Clock size={20} /> Últimos accesos</h3>
          <span>{accesos.length} {accesos.length === 1 ? 'registro' : 'registros'}</span>
        </div>

        <div className="ls-casillero-tabla-scroll">
          <table className="ls-usuario-tabla-accesos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {!cargando && accesos.length === 0 && (
                <tr>
                  <td colSpan={3}>Sin accesos registrados todavía.</td>
                </tr>
              )}

              {accesos.map((acceso) => (
                <tr key={acceso.id}>
                  <td>{acceso.fecha}</td>
                  <td>{acceso.hora}</td>
                  <td>
                    <span className="ls-metodo-acceso">
                      <IconoMetodo metodo={acceso.metodo} />
                      {acceso.metodo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}