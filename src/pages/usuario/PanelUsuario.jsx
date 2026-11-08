import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ToastNotification from '../../components/ToastNotification'
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

export default function PanelUsuario() {
  const usuarioSesion = obtenerUsuario()
  const location = useLocation()
  const [mostrarToast, setMostrarToast] = useState(false)

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

  // Anomalías por día (últimos 7 días) que manda el back
  const grafica = datos?.grafica ?? []

  const datosAnomalias = useMemo(() => ({
    labels: grafica.map((d) => d.dia),
    datasets: [
      {
        label: 'Anomalías detectadas',
        data: grafica.map((d) => d.total),
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
  }), [grafica])

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
        callbacks: {
          title: (items) => {
            const d = grafica[items[0]?.dataIndex]
            return d ? `${d.dia} ${d.fecha}` : ''
          },
          label: (context) => ` ${context.raw} ${context.raw === 1 ? 'anomalía' : 'anomalías'}`,
        },
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
        suggestedMax: 5,       // se ajusta solo si hay más anomalías
        ticks: {
          precision: 0,        // solo números enteros
          color: '#66736c',
        },
        grid: {
          color: '#e7ece9',
        },
      },
    },
  }), [grafica])

  const descargarReporte = () => {
    const contenido = [
      ['Fecha', 'Día', 'Anomalías detectadas'],
      ...grafica.map((d) => [d.fecha, d.dia, d.total]),
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
      {/* NOTIFICACIÓN FLOTANTE DE LOGIN */}
      {mostrarToast && (
        <ToastNotification
          mensaje="Inicio de sesión exitoso"
          onClose={() => setMostrarToast(false)}
        />
      )}

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

      {/* GRÁFICA DE ANOMALÍAS (últimos 7 días) */}
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
            disabled={cargando || grafica.length === 0}
          >
            <Download size={16} />
            Descargar reporte
          </button>
        </div>

      </section>

    </div>
  )
}