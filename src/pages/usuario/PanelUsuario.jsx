import { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Lock,
  DoorOpen,
  AlertTriangle,
  ChartNoAxesCombined,
  Download,
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { obtenerUsuario } from '../../utils/session'
import { obtenerDashboard } from '../../api/usuario'
import '../../styles/Usuarios/PanelUsuario.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
)

// Cómo se muestra cada estado que manda el back.
const ESTADOS = {
  SEGURO:     { texto: 'Seguro',     Icono: ShieldCheck, clase: 'seguro',  check: true },
  ALERTA:     { texto: 'En alerta',  Icono: ShieldAlert, clase: 'alertas', check: false },
  BLOQUEADO:  { texto: 'Bloqueado',  Icono: Lock,        clase: 'alertas', check: false },
  DESOCUPADO: { texto: 'Desocupado', Icono: ShieldOff,   clase: 'accesos', check: false },
}

// PENDIENTE: la gráfica sigue con datos provisionales.
const datosAnomalias = {
  labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  datasets: [
    {
      label: 'Anomalías detectadas',
      data: [0, 2, 10, 0, 0],
      borderColor: '#18b982',
      backgroundColor: 'rgba(24, 185, 130, 0.10)',
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#18b982',
      pointBorderWidth: 0,
      tension: 0.4,
      fill: true,
    },
  ],
}

export default function PanelUsuario() {
  const usuarioSesion = obtenerUsuario()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true // evita actualizar el estado si el componente ya se desmontó

    const cargar = () => {
      obtenerDashboard()
        .then((respuesta) => {
          if (activo) {
            setDatos(respuesta)
            setError('')
          }
        })
        .catch(() => {
          if (activo) setError('No se pudo cargar la información. Intenta de nuevo más tarde.')
        })
        .finally(() => {
          if (activo) setCargando(false)
        })
    }

    cargar()

    // Se actualiza cada minuto, para que "En alerta" aparezca y se quite solo.
    const intervalo = setInterval(cargar, 60000)

    return () => {
      activo = false
      clearInterval(intervalo)
    }
  }, [])

  const nombre = datos?.nombre || usuarioSesion?.nombre || 'usuario'
  const estado = ESTADOS[datos?.estado] || ESTADOS.SEGURO
  const IconoEstado = estado.Icono

  // Mientras carga (o si falló) se muestra un guion en lugar de un número.
  const mostrar = (valor) => (cargando || error ? '—' : valor)

  const opcionesGrafica = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#102e25',
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#38443e',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: '#66736c',
        },
        grid: {
          color: '#e7ece9',
        },
      },
    },
  }), [])

  const descargarReporte = () => {
    const contenido = [
      ['Día', 'Anomalías detectadas'],
      ['Lunes', 0],
      ['Martes', 2],
      ['Miércoles', 10],
      ['Jueves', 0],
      ['Viernes', 0],
    ]

    const csv = contenido.map(fila => fila.join(',')).join('\n')
    const archivo = new Blob(['﻿' + csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = 'reporte-anomalias-locksense.csv'
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="ls-dashboard-usuario">

      <div className="ls-dashboard-bienvenida">
        <div>
          <h2>Bienvenido, {nombre}</h2>
          <p>
            {datos?.casillero
              ? `Consulta el estado y la seguridad de tu casillero ${datos.casillero}.`
              : 'Consulta el estado y la seguridad de tu casillero.'}
          </p>
          {error && <p className="ls-dashboard-error">{error}</p>}
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <section className="ls-usuario-stats">

        <article className="ls-usuario-stat-card">
          <div className={`ls-usuario-stat-icon ${estado.clase}`}>
            <IconoEstado size={27} />
          </div>
          <div className="ls-usuario-stat-info">
            <span>Estado</span>
            <strong>
              {mostrar(estado.texto)}
              {!cargando && !error && estado.check && (
                <span className="ls-usuario-check">✓</span>
              )}
            </strong>
          </div>
        </article>

        <article className="ls-usuario-stat-card">
          <div className="ls-usuario-stat-icon accesos">
            <DoorOpen size={27} />
          </div>
          <div className="ls-usuario-stat-info">
            <span>Accesos del mes</span>
            <strong>{mostrar(datos?.accesos_mes ?? 0)}</strong>
          </div>
        </article>

        <article className="ls-usuario-stat-card">
          <div className="ls-usuario-stat-icon alertas">
            <AlertTriangle size={27} />
          </div>
          <div className="ls-usuario-stat-info">
            <span>Alertas de hoy</span>
            <strong>{mostrar(datos?.alertas_hoy ?? 0)}</strong>
          </div>
        </article>

      </section>

      {/* GRÁFICA DE ANOMALÍAS (PENDIENTE: datos provisionales) */}
      <section className="ls-usuario-grafica-card">

        <div className="ls-usuario-grafica-header">
          <div className="ls-usuario-grafica-titulo">
            <ChartNoAxesCombined size={24} />
            <h2>Anomalías detectadas</h2>
          </div>
        </div>

        <div className="ls-usuario-grafica-contenido">
          <Line
            data={datosAnomalias}
            options={opcionesGrafica}
          />
        </div>

        <div className="ls-usuario-grafica-footer">
          <button
            type="button"
            className="ls-usuario-btn-reporte"
            onClick={descargarReporte}
          >
            <Download size={16} />
            Descargar reporte
          </button>
        </div>

      </section>

    </div>
  )
}