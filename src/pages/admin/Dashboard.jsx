import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import ToastNotification from '../../components/ToastNotification'
import { getMetrics } from '../../api/dashboard'
import {
  LockKeyhole,
  Users,
  Activity,
  CheckCircle2,
  Download,
} from 'lucide-react'
import '../../styles/admin/Dashboard.css'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js'

import { Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

const COLORES_DISTRIBUCION = ['#259568', '#e6a13e', '#d65c5c']

const asignacionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',

  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      callbacks: {
        label: context => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const porcentaje = total ? ((context.raw / total) * 100).toFixed(1) : '0.0'
          return ` ${context.label}: ${context.raw} (${porcentaje}%)`
        },
      },
    },
  },
}

const tendenciaOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    intersect: false,
    mode: 'index',
  },

  plugins: {
    legend: {
      position: 'bottom',
    },
  },

  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 5,
      ticks: { precision: 0 }, // solo números enteros

      title: {
        display: true,
        text: 'Cantidad de casilleros',
      },
    },
  },
}

// Porcentaje con un decimal (sin dividir entre 0)
const porcentaje = (valor, total) => (total ? ((valor / total) * 100).toFixed(1) : '0.0')


/* =========================================================
   DESCARGA DE REPORTES
   ========================================================= */

const descargarCSV = (nombreArchivo, filas) => {
  const contenido = filas.map((fila) => fila.join(',')).join('\n')

  // \uFEFF: para que Excel respete los acentos
  const blob = new Blob(['\uFEFF' + contenido], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')

  enlace.href = url
  enlace.download = nombreArchivo

  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)

  URL.revokeObjectURL(url)
}


/* =========================================================
   TARJETAS PRINCIPALES
   ========================================================= */

export default function Dashboard() {
  const location = useLocation()
  const [mostrarToast, setMostrarToast] = useState(false)

  const [metrics, setMetrics] = useState({
    usuarios_totales: 0,
    casilleros_totales: 0,
    casilleros_bloqueados: 0,
  })
  const [distribucion, setDistribucion] = useState({
    asignados: 0,
    sin_asignar: 0,
    bloqueados: 0,
    total: 0,
  })
  const [tendencia, setTendencia] = useState([])

  const resumen = [
    {
      titulo: 'Usuarios totales',
      valor: metrics.usuarios_totales,
      detalle: 'Cuentas registradas',
      icono: Users,
      color: 'morado',
    },

    {
      titulo: 'Casilleros totales',
      valor: metrics.casilleros_totales,
      detalle: 'Registrados en el sistema',
      icono: LockKeyhole,
      color: 'verde',
    },

    {
      titulo: 'Casilleros bloqueados',
      valor: metrics.casilleros_bloqueados,
      detalle: 'Requieren atención',
      icono: CheckCircle2,
      color: 'rojo',
    },
  ]

  useEffect(() => {
    if (location.state?.loginExitoso) {
      setMostrarToast(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  useEffect(() => {
    let activo = true

    getMetrics()
      .then((data) => {
        if (!activo) return
        setMetrics({
          usuarios_totales: data.usuarios_totales ?? 0,
          casilleros_totales: data.casilleros_totales ?? 0,
          casilleros_bloqueados: data.casilleros_bloqueados ?? 0,
        })
        if (data.distribucion) setDistribucion(data.distribucion)
        setTendencia(data.tendencia ?? [])
      })
      .catch(() => {
        // Si la petición falla, se mantienen los valores por defecto (0)
      })

    return () => {
      activo = false
    }
  }, [])

  /* ---------- DATOS DE LAS GRÁFICAS ---------- */

  const asignacionData = useMemo(() => ({
    labels: ['Asignados', 'Sin asignar', 'Bloqueados'],
    datasets: [
      {
        data: [distribucion.asignados, distribucion.sin_asignar, distribucion.bloqueados],
        backgroundColor: COLORES_DISTRIBUCION,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 7,
      },
    ],
  }), [distribucion])

  const tendenciaData = useMemo(() => ({
    labels: tendencia.map((d) => d.dia),
    datasets: [
      {
        label: 'Abiertos',
        data: tendencia.map((d) => d.abiertos),
        borderColor: '#259568',
        backgroundColor: '#259568',
        tension: 0.35,
        pointRadius: 4,
      },
      {
        label: 'Cerrados',
        data: tendencia.map((d) => d.cerrados),
        borderColor: '#3975b8',
        backgroundColor: '#3975b8',
        tension: 0.35,
        pointRadius: 4,
      },
    ],
  }), [tendencia])

  const leyenda = [
    { clase: 'asignados', texto: 'Asignados', valor: distribucion.asignados },
    { clase: 'sin-asignar', texto: 'Sin asignar', valor: distribucion.sin_asignar },
    { clase: 'bloqueados', texto: 'Bloqueados', valor: distribucion.bloqueados },
  ]

  /* ---------- REPORTES ---------- */

  const descargarReporteDistribucion = () => {
    descargarCSV('reporte-distribucion-casilleros.csv', [
      ['Estado', 'Cantidad', 'Porcentaje'],
      ...leyenda.map((l) => [l.texto, l.valor, `${porcentaje(l.valor, distribucion.total)}%`]),
      ['Total', distribucion.total, '100%'],
    ])
  }

  const descargarReporteTendencia = () => {
    descargarCSV('reporte-tendencia-uso.csv', [
      ['Fecha', 'Día', 'Abiertos', 'Cerrados'],
      ...tendencia.map((d) => [d.fecha, d.dia, d.abiertos, d.cerrados]),
    ])
  }

  return (
    <div className="ls-dashboard">
      {/* NOTIFICACIÓN FLOTANTE DE LOGIN */}
      {mostrarToast && (
        <ToastNotification
          mensaje="Inicio de sesión exitoso"
          onClose={() => setMostrarToast(false)}
        />
      )}

      {/* =====================================================
          ENCABEZADO
          ===================================================== */}

      <div className="ls-dashboard-heading">
        <div>
          <h1>Dashboard</h1>

          <p>
            Resumen general del sistema LOCKSENSE
          </p>
        </div>
      </div>


      {/* =====================================================
          TARJETAS DE RESUMEN
          ===================================================== */}

      <div className="ls-dashboard-cards">

        {resumen.map(item => {
          const Icono = item.icono

          return (
            <article
              className="ls-stat-card"
              key={item.titulo}
            >
              <div
                className={`ls-stat-icon ${item.color}`}
              >
                <Icono size={23} />
              </div>

              <div className="ls-stat-info">
                <p>{item.titulo}</p>

                <strong>{item.valor}</strong>

                <span>{item.detalle}</span>
              </div>
            </article>
          )
        })}

      </div>


      {/* =====================================================
          GRÁFICAS
          ===================================================== */}

      <div className="ls-dashboard-charts">

        {/* ===================================================
            DISTRIBUCIÓN DE CASILLEROS
            =================================================== */}

        <section className="ls-dashboard-panel ls-chart-panel">

          <div className="ls-panel-heading">

            <div>
              <h2>Distribución de casilleros</h2>

              <p>
                Asignación y disponibilidad
              </p>
            </div>

            <LockKeyhole size={21} />

          </div>


          <div className="ls-doughnut-container">

            <div className="ls-doughnut-chart">

              <Doughnut
                data={asignacionData}
                options={asignacionOptions}
              />

              <div className="ls-doughnut-center">
                <strong>{distribucion.total}</strong>
                <span>Casilleros</span>
              </div>

            </div>

          </div>


          <div className="ls-chart-legend">
            {leyenda.map((l) => (
              <div key={l.clase}>
                <span className={`ls-chart-dot ${l.clase}`}></span>
                <span>{l.texto}</span>
                <strong>
                  {l.valor} ({porcentaje(l.valor, distribucion.total)}%)
                </strong>
              </div>
            ))}
          </div>


          {/* BOTÓN DE REPORTE */}

          <button
            type="button"
            className="ls-dashboard-reporte"
            onClick={descargarReporteDistribucion}
          >
            <Download size={16} />

            Descargar reporte
          </button>

        </section>


        {/* ===================================================
            TENDENCIA DE USO
            =================================================== */}

        <section className="ls-dashboard-panel ls-chart-panel">

          <div className="ls-panel-heading">

            <div>
              <h2>Tendencia de uso</h2>

              <p>
                Casilleros abiertos y cerrados por día
              </p>
            </div>

            <Activity size={21} />

          </div>


          <div className="ls-line-chart">

            <Line
              data={tendenciaData}
              options={tendenciaOptions}
            />

          </div>


          <p className="ls-chart-note">
            Últimos 7 días. Un casillero cuenta como abierto si se abrió al menos una vez ese día.
          </p>


          {/* BOTÓN DE REPORTE */}

          <button
            type="button"
            className="ls-dashboard-reporte"
            onClick={descargarReporteTendencia}
          >
            <Download size={16} />

            Descargar excel
          </button>

        </section>

      </div>

    </div>
  )
}