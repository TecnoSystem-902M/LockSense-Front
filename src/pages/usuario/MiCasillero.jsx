import {
  LockKeyhole,
  KeyRound,
  CreditCard,
  ScanFace,
  Clock,
} from 'lucide-react'
import '../../styles/Usuarios/MiCasillero.css'

// IMPORTAMOS LA IMAGEN DEL CASILLERO DESDE TU CARPETA ASSETS
import casilleroPersonalImg from '../../assets/casillero-personal.png'

const metodos = [
  'RFID/NFC',
  'Rostro',
  'RFID/NFC',
  'Rostro',
  'RFID/NFC',
  'Rostro',
  'RFID/NFC',
  'Rostro',
  'RFID/NFC',
  'Rostro',
]

const estados = [
  'Cerrado',
  'Abierto',
  'Cerrado',
  'Cerrado',
  'Abierto',
  'Cerrado',
  'Abierto',
  'Cerrado',
  'Cerrado',
  'Abierto',
]

const accesos = [
  { dia: 'Hoy', hora: '10:32', metodo: 'RFID/NFC' },
  { dia: 'Ayer', hora: '16:45', metodo: 'Rostro' },
  { dia: 'Ayer', hora: '12:20', metodo: 'RFID/NFC' },
  { dia: '30 Oct', hora: '09:15', metodo: 'Rostro' },
  { dia: '29 Oct', hora: '18:30', metodo: 'RFID/NFC' },
  { dia: '28 Oct', hora: '11:05', metodo: 'Rostro' },
  { dia: '27 Oct', hora: '14:40', metodo: 'RFID/NFC' },
  { dia: '26 Oct', hora: '08:50', metodo: 'Rostro' },
  { dia: '25 Oct', hora: '17:10', metodo: 'RFID/NFC' },
  { dia: '24 Oct', hora: '13:25', metodo: 'Rostro' },
]

export default function MiCasillero() {
  return (
    <div className="ls-mi-casillero">

      <div className="ls-usuario-pagina-titulo">
        <h2>Mi casillero</h2>
        <p>Consulta el estado y los accesos de tu casillero.</p>
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
          <span className="ls-casillero-estado">Cerrado</span>
        </div>

        <div className="ls-casillero-informacion">
          <article className="ls-casillero-info-card">
            <h3>
              <KeyRound size={19} />
              Últimos métodos
              <span className="ls-info-contador">10</span>
            </h3>

            <div className="ls-info-lista">
              {metodos.map((metodo, index) => (
                <div className="ls-info-registro" key={index}>
                  <div className="ls-info-icono">
                    {metodo === 'Rostro'
                      ? <ScanFace size={18} />
                      : <CreditCard size={18} />}
                  </div>

                  <div className="ls-info-detalle">
                    <strong>{metodo}</strong>
                    <span>Registro #{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="ls-casillero-info-card">
            <h3>
              <LockKeyhole size={19} />
              Últimos estados
              <span className="ls-info-contador">10</span>
            </h3>

            <div className="ls-info-lista">
              {estados.map((estado, index) => (
                <div className="ls-info-registro" key={index}>
                  <div className={`ls-info-icono ${estado === 'Abierto' ? 'estado-abierto' : 'estado-cerrado'
                    }`}>
                    <LockKeyhole size={18} />
                  </div>

                  <div className="ls-info-detalle">
                    <strong>{estado}</strong>
                    <span>Registro #{index + 1}</span>
                  </div>

                  <span className={`ls-info-indicador ${estado === 'Abierto' ? 'abierto' : 'cerrado'
                    }`} />
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="ls-casillero-historial">
        <div className="ls-usuario-seccion-header">
          <h3><Clock size={20} /> Últimos accesos</h3>
          <span>10 registros</span>
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
              {accesos.map((acceso, index) => (
                <tr key={index}>
                  <td>{acceso.dia}</td>
                  <td>{acceso.hora}</td>
                  <td>
                    <span className="ls-metodo-acceso">
                      {acceso.metodo === 'Rostro'
                        ? <ScanFace size={18} />
                        : <CreditCard size={18} />}
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