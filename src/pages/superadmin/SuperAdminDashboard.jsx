import { useMemo, useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ToastNotification from '../../components/ToastNotification'
import {
  Building2,
  Users,
  UserCog,
  BarChart3,
  PieChart,
  Download,
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
import { obtenerDashboardSuperAdmin } from '../../api/Superadmin'
import '../../styles/superadmin/SuperAdminDashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Descarga un CSV a partir de filas [[encabezado...], [valor...], ...]
function descargarCsv(filas, nombreArchivo) {
  const csv = filas.map((fila) => fila.join(',')).join('\n')
  const archivo = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')

  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  URL.revokeObjectURL(url)
}

export default function SuperAdminDashboard() {
  const location = useLocation()
  const [mostrarToast, setMostrarToast] = useState(false)

  const dashboardRef = useRef(null)
  const [keyGrafica, setKeyGrafica] = useState(0) // fuerza a redibujar las gráficas

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Mensaje de inicio de sesión (solo al llegar desde el login)
  useEffect(() => {
    if (location.state?.loginExitoso) {
      setMostrarToast(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Cargar datos del back
  useEffect(() => {
    let activo = true

    obtenerDashboardSuperAdmin()
      .then((respuesta) => {
        if (activo) setDatos(respuesta)
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar la información. Intenta de nuevo más tarde.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  // Redimensionar las gráficas al abrir/cerrar el menú
  useEffect(() => {
    if (!dashboardRef.current) return

    const observer = new ResizeObserver(() => {
      setTimeout(() => {
        setKeyGrafica((prev) => prev + 1)
      }, 350)
    })

    observer.observe(dashboardRef.current)

    return () => observer.disconnect()
  }, [])

  const porMes = datos?.por_mes ?? []
  const porTipo = datos?.por_tipo ?? []

  // Mientras carga (o si falló) se muestra un guion en lugar del número
  const mostrar = (valor) => (cargando || error ? '—' : valor)

  // --- DATOS DE LAS GRÁFICAS ---
  const datosOrganizacionesMes = useMemo(() => ({
    labels: porMes.map((m) => m.mes),
    datasets: [
      {
        label: 'Registros',
        data: porMes.map((m) => m.total),
        backgroundColor: '#10b981',
        borderRadius: 6,
        maxBarThickness: 60,
      },
    ],
  }), [porMes])

  const datosOrganizacionesTipo = useMemo(() => ({
    labels: porTipo.map((t) => t.tipo),
    datasets: [
      {
        label: 'Cantidad',
        data: porTipo.map((t) => t.total),
        backgroundColor: '#10b981',
        borderRadius: 6,
        maxBarThickness: 30,
      },
    ],
  }), [porTipo])

  // Opciones gráfica vertical (sin máximo fijo: se ajusta a los datos)
  const opcionesVertical = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
      },
      tooltip: { backgroundColor: '#0f2922' },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#687b72' },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 5,
        ticks: { precision: 0, color: '#687b72' }, // solo números enteros
        grid: { color: '#f0f4f2' },
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
        labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
      },
      tooltip: { backgroundColor: '#0f2922' },
    },
    scales: {
      x: {
        beginAtZero: true,
        suggestedMax: 5,
        ticks: { precision: 0, color: '#687b72' },
        grid: { color: '#f0f4f2' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#687b72' },
      },
    },
  }), [])

  const descargarReporteMes = () => {
    descargarCsv(
      [['Mes', 'Organizaciones registradas'], ...porMes.map((m) => [m.mes, m.total])],
      'reporte-organizaciones-por-mes.csv'
    )
  }

  const descargarReporteTipo = () => {
    descargarCsv(
      [['Tipo', 'Organizaciones'], ...porTipo.map((t) => [t.tipo, t.total])],
      'reporte-organizaciones-por-tipo.csv'
    )
  }

  return (
    <div className="ls-sa-dashboard" ref={dashboardRef}>
      {/* NOTIFICACIÓN FLOTANTE DE LOGIN */}
      {mostrarToast && (
        <ToastNotification
          mensaje="Inicio de sesión exitoso"
          onClose={() => setMostrarToast(false)}
        />
      )}

      {/* ENCABEZADO */}
      <header className="ls-sa-header">
        <div className="ls-sa-header-title">
          <div>
            <h1>Panel de SuperAdministrador</h1>
            <p>Monitoreo de las organizaciones y usuarios</p>
            {error && <p className="ls-sa-error">{error}</p>}
          </div>
        </div>
      </header>

      {/* TARJETAS */}
      <section className="ls-sa-stats">
        <article className="ls-sa-card">
          <div className="ls-sa-card-icon morado"><Building2 size={26} /></div>
          <div className="ls-sa-card-info">
            <p>Organizaciones</p>
            <strong>{mostrar(datos?.tarjetas?.organizaciones ?? 0)}</strong>
            <span>Registradas en el sistema</span>
          </div>
        </article>

        <article className="ls-sa-card">
          <div className="ls-sa-card-icon verde"><Users size={26} /></div>
          <div className="ls-sa-card-info">
            <p>Usuarios totales</p>
            <strong>{mostrar(datos?.tarjetas?.usuarios ?? 0)}</strong>
            <span>Cuentas registradas</span>
          </div>
        </article>

        <article className="ls-sa-card">
          <div className="ls-sa-card-icon rojo"><UserCog size={26} /></div>
          <div className="ls-sa-card-info">
            <p>Administradores</p>
            <strong>{mostrar(datos?.tarjetas?.administradores ?? 0)}</strong>
            <span>Gestionan organizaciones</span>
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
            <Bar key={`bar1-${keyGrafica}`} data={datosOrganizacionesMes} options={opcionesVertical} />
          </div>
          <button
            type="button"
            className="ls-sa-btn-reporte"
            onClick={descargarReporteMes}
            disabled={cargando || porMes.length === 0}
          >
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
          <button
            type="button"
            className="ls-sa-btn-reporte"
            onClick={descargarReporteTipo}
            disabled={cargando || porTipo.length === 0}
          >
            <Download size={18} /> Descargar reporte
          </button>
        </article>

      </section>
    </div>
  )
}