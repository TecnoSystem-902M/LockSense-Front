import { useMemo, useRef, useState, useEffect } from 'react' // <-- Agregamos useRef, useState, useEffect
import {
  Building2,
  Users,
  UserCog,
  BarChart3,
  PieChart,
  Menu,
  Download
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import '../../styles/superadmin/SuperAdminDashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// --- DATOS ---
const datosOrganizacionesMes = {
  labels: ['Ene', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Registros',
      data: [2000, 2400, 3000],
      backgroundColor: '#10b981',
      borderRadius: 6,
      barThickness: 80,
    },
  ],
}

const datosOrganizacionesTipo = {
  labels: ['Escuelas', 'Otras', 'Empresas'],
  datasets: [
    {
      label: 'Cantidad',
      data: [450, 150, 1000],
      backgroundColor: '#10b981',
      borderRadius: 6,
      barThickness: 30,
    },
  ],
}

export default function SuperAdminDashboard() {
  const dashboardRef = useRef(null)
  const [keyGrafica, setKeyGrafica] = useState(0) // Estado para forzar recarga de la gráfica

  // EFECTO PARA REDIMENSIONAR LAS GRÁFICAS AL ABRIR/CERRAR EL MENÚ
  useEffect(() => {
    if (!dashboardRef.current) return

    const observer = new ResizeObserver(() => {
      // Un pequeño timeout para esperar a que la transición del menú termine
      setTimeout(() => {
        setKeyGrafica(prev => prev + 1) 
      }, 350) // 350ms es la duración de la transición de tu menú + un pequeño margen
    })

    observer.observe(dashboardRef.current)

    return () => observer.disconnect()
  }, [])

  // Opciones gráfica vertical
  const opcionesVertical = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } }
      },
      tooltip: { backgroundColor: '#0f2922' },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#687b72' }
      },
      y: {
        beginAtZero: true,
        max: 3000,
        ticks: { stepSize: 500, color: '#687b72' },
        grid: { color: '#f0f4f2' }
      },
    },
  }), [])

  // Opciones gráfica horizontal
  const opcionesHorizontal = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } }
      },
      tooltip: { backgroundColor: '#0f2922' },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 1000,
        ticks: { color: '#687b72' },
        grid: { color: '#f0f4f2' }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#687b72' }
      },
    },
  }), [])

  return (
    <div className="ls-sa-dashboard" ref={dashboardRef}> {/* <-- Referencia añadida */}
      
      {/* ENCABEZADO */}
      <header className="ls-sa-header">
        <div className="ls-sa-header-title">
          <div>
            <h1>Panel de SuperAdministrador</h1>
            <p>Monitoreo de las organizaciones y usuarios</p>
          </div>
        </div>


      </header>

      {/* TARJETAS */}
      <section className="ls-sa-stats">
        <article className="ls-sa-card">
          <div className="ls-sa-card-icon morado"><Building2 size={26} /></div>
          <div className="ls-sa-card-info">
            <p>Organizaciones</p>
            <strong>24</strong>
            <span>Registradas en el sistema</span>
          </div>
        </article>

        <article className="ls-sa-card">
          <div className="ls-sa-card-icon verde"><Users size={26} /></div>
          <div className="ls-sa-card-info">
            <p>Usuarios totales</p>
            <strong>100</strong>
            <span>Cuentas registradas</span>
          </div>
        </article>

        <article className="ls-sa-card">
          <div className="ls-sa-card-icon rojo"><UserCog size={26} /></div>
          <div className="ls-sa-card-info">
            <p>Administradores</p>
            <strong>30</strong>
            <span>Requieren atención</span>
          </div>
        </article>
      </section>

      {/* GRÁFICAS */}
      <section className="ls-sa-charts">
        
        <article className="ls-sa-chart-panel">
          <div className="ls-sa-panel-header">
            <BarChart3 size={22} className="ls-sa-panel-icon" />
            <h2>Organizaciones registradas</h2>
          </div>
          <div className="ls-sa-chart-container">
            {/* key={keyGrafica} fuerza a la gráfica a redibujarse al cambiar el tamaño */}
            <Bar key={`bar1-${keyGrafica}`} data={datosOrganizacionesMes} options={opcionesVertical} />
          </div>
          <button type="button" className="ls-sa-btn-reporte" onClick={() => console.log('Descargar 1')}>
            <Download size={18} /> Descargar reporte
          </button>
        </article>

        <article className="ls-sa-chart-panel">
          <div className="ls-sa-panel-header">
            <PieChart size={22} className="ls-sa-panel-icon" />
            <h2>Organizaciones por tipo</h2>
          </div>
          <div className="ls-sa-chart-container">
            <Bar key={`bar2-${keyGrafica}`} data={datosOrganizacionesTipo} options={opcionesHorizontal} />
          </div>
          <button type="button" className="ls-sa-btn-reporte" onClick={() => console.log('Descargar 2')}>
            <Download size={18} /> Descargar reporte
          </button>
        </article>

      </section>
    </div>
  )
}