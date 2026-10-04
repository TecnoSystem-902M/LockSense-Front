import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ToastNotification from '../../components/ToastNotification'
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

const asignacionData = {
  labels: ['Asignados', 'Sin asignar', 'Bloqueados'],
  datasets: [
    {
      data: [65, 40, 15],
      backgroundColor: [
        '#259568',
        '#e6a13e',
        '#d65c5c',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 7,
    },
  ],
}

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
          const total = context.dataset.data.reduce(
            (a, b) => a + b,
            0
          )

          const porcentaje = (
            (context.raw / total) *
            100
          ).toFixed(1)

          return ` ${context.label}: ${context.raw} (${porcentaje}%)`
        },
      },
    },
  },
}

const tendenciaData = {
  labels: [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom',
  ],

  datasets: [
    {
      label: 'Abiertos',
      data: [12, 18, 25, 20, 32, 15, 9],
      borderColor: '#259568',
      backgroundColor: '#259568',
      tension: 0.35,
      pointRadius: 4,
    },

    {
      label: 'Cerrados',
      data: [108, 102, 95, 100, 88, 105, 111],
      borderColor: '#3975b8',
      backgroundColor: '#3975b8',
      tension: 0.35,
      pointRadius: 4,
    },
  ],
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

      title: {
        display: true,
        text: 'Cantidad de casilleros',
      },
    },
  },
}


/* =========================================================
   DESCARGA DE REPORTES
   ========================================================= */

const descargarCSV = (nombreArchivo, contenido) => {
  const blob = new Blob(
    [contenido],
    {
      type: 'text/csv;charset=utf-8;',
    }
  )

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
   REPORTE DE DISTRIBUCIÓN
   ========================================================= */

const descargarReporteDistribucion = () => {
  const contenido = [
    'Reporte de distribución de casilleros',
    '',
    'Estado,Cantidad,Porcentaje',
    'Asignados,65,54.2%',
    'Sin asignar,40,33.3%',
    'Bloqueados,15,12.5%',
    '',
    'Total,120,100%',
  ].join('\n')

  descargarCSV(
    'reporte-distribucion-casilleros.csv',
    contenido
  )
}


/* =========================================================
   REPORTE DE TENDENCIA
   ========================================================= */

const descargarReporteTendencia = () => {
  const contenido = [
    'Reporte de tendencia de uso',
    '',
    'Día,Abiertos,Cerrados',
    'Lun,12,108',
    'Mar,18,102',
    'Mié,25,95',
    'Jue,20,100',
    'Vie,32,88',
    'Sáb,15,105',
    'Dom,9,111',
  ].join('\n')

  descargarCSV(
    'reporte-tendencia-uso.csv',
    contenido
  )
}


/* =========================================================
   TARJETAS PRINCIPALES
   ========================================================= */

const resumen = [
  {
    titulo: 'Usuarios totales',
    valor: '45',
    detalle: 'Cuentas registradas',
    icono: Users,
    color: 'morado',
  },

  {
    titulo: 'Casilleros totales',
    valor: '120',
    detalle: 'Registrados en el sistema',
    icono: LockKeyhole,
    color: 'verde',
  },

  {
    titulo: 'Casilleros bloqueados',
    valor: '15',
    detalle: 'Requieren atención',
    icono: CheckCircle2,
    color: 'rojo',
  },
]


export default function Dashboard() {
  const location = useLocation()
  const [mostrarToast, setMostrarToast] = useState(false)

  useEffect(() => {
    if (location.state?.loginExitoso) {
      setMostrarToast(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

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
                <strong>120</strong>
                <span>Casilleros</span>
              </div>

            </div>

          </div>


          <div className="ls-chart-legend">

            <div>
              <span className="ls-chart-dot asignados"></span>

              <span>Asignados</span>

              <strong>
                65 (54.2%)
              </strong>
            </div>

            <div>
              <span className="ls-chart-dot sin-asignar"></span>

              <span>Sin asignar</span>

              <strong>
                40 (33.3%)
              </strong>
            </div>

            <div>
              <span className="ls-chart-dot bloqueados"></span>

              <span>Bloqueados</span>

              <strong>
                15 (12.5%)
              </strong>
            </div>

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
            Datos ilustrativos de la actividad semanal.
          </p>


          {/* BOTÓN DE REPORTE */}

          <button
            type="button"
            className="ls-dashboard-reporte"
            onClick={descargarReporteTendencia}
          >
            <Download size={16} />

            Descargar reporte
          </button>

        </section>

      </div>

    </div>
  )
}