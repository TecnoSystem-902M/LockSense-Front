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
  Fingerprint,
  Clock,
  CalendarDays,
  Repeat,
  CheckCircle2,
} from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { obtenerUsuario } from '../../utils/session'
import { obtenerDashboard, obtenerComportamiento, obtenerReporte } from '../../api/usuario'
import '../../styles/Usuarios/PanelUsuario.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

// 2.7 -> "2 a 3 veces al día"   |   3 -> "3 veces al día"
const textoPorDia = ({ promedio }) => {
  const bajo = Math.floor(promedio)
  const alto = Math.ceil(promedio)
  const veces = (n) => `${n} ${n === 1 ? 'vez' : 'veces'}`

  if (bajo === alto || bajo === 0) return `${veces(alto)} al día`
  return `${bajo} a ${veces(alto)} al día`
}

export default function PanelUsuario() {
  const usuarioSesion = obtenerUsuario()
  const location = useLocation()
  const [mostrarToast, setMostrarToast] = useState(false)

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Qué muestra la tarjeta: 'anomalias' o 'comportamiento'
  const [vista, setVista] = useState('anomalias')

  // Datos de "Mi comportamiento"
  const [comportamiento, setComportamiento] = useState(null)
  const [cargandoComportamiento, setCargandoComportamiento] = useState(true)

  // Reporte PDF
  const [generandoReporte, setGenerandoReporte] = useState(false)
  const [errorReporte, setErrorReporte] = useState('')

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

  // Comportamiento: se carga una vez (cambia poco)
  useEffect(() => {
    let activo = true

    obtenerComportamiento()
      .then((respuesta) => {
        if (activo) setComportamiento(respuesta)
      })
      .catch(() => {
        // Si falla, se muestra un mensaje dentro de la vista
      })
      .finally(() => {
        if (activo) setCargandoComportamiento(false)
      })

    return () => {
      activo = false
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

  // ---------- MI COMPORTAMIENTO ----------
  const horas = comportamiento?.horas ?? []

  const datosHoras = useMemo(() => ({
    labels: horas.map((_, h) => `${h}`),
    datasets: [
      {
        label: 'Accesos',
        data: horas,
        backgroundColor: '#18b982',
        borderRadius: 4,
        maxBarThickness: 18,
      },
    ],
  }), [horas])

  const opcionesHoras = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#102e25',
        displayColors: false,
        callbacks: {
          title: (items) => {
            const h = Number(items[0]?.label ?? 0)
            return `${String(h).padStart(2, '0')}:00 a ${String(h).padStart(2, '0')}:59`
          },
          label: (context) => ` ${context.raw} ${context.raw === 1 ? 'acceso' : 'accesos'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#66736c',
          font: { size: 10 },
          // En pantallas chicas solo se ven 0, 3, 6, 9...
          callback: (valor, indice) => (indice % 3 === 0 ? `${indice} h` : ''),
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 3,
        ticks: { precision: 0, color: '#66736c' },
        grid: { color: '#e7ece9' },
      },
    },
  }), [])

  const analisis = comportamiento?.analisis
  const progresoAnalisis = analisis
    ? Math.min(100, Math.round((analisis.accesos / analisis.minimo) * 100))
    : 0

  const diasHabituales = (comportamiento?.dias ?? [])
    .filter((d) => d.total > 0 && d.intensidad >= 0.5)
    .map((d) => d.dia)

  // Descarga el reporte PDF (resumen, anomalías y comportamiento).
  const descargarReporte = async () => {
    setGenerandoReporte(true)
    setErrorReporte('')

    try {
      // Se piden los datos al momento para que el reporte esté al día.
      const [dashboard, comportamientoActual, reporte] = await Promise.all([
        obtenerDashboard(),
        obtenerComportamiento(),
        obtenerReporte(),
      ])

      // jsPDF solo se carga cuando se presiona el botón.
      const { generarReporteUsuario } = await import('../../reportes/reporteUsuario')

      await generarReporteUsuario({
        dashboard,
        comportamiento: comportamientoActual,
        reporte,
      })
    } catch {
      setErrorReporte('No se pudo generar el reporte. Intenta de nuevo.')
    } finally {
      setGenerandoReporte(false)
    }
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

      {/* TARJETA: ANOMALÍAS / MI COMPORTAMIENTO */}
      <section className="ls-usuario-grafica-card">

        <div className="ls-usuario-grafica-header ls-grafica-header-con-vistas">
          <div className="ls-usuario-grafica-titulo">
            {vista === 'anomalias'
              ? <ChartNoAxesCombined size={24} />
              : <Fingerprint size={24} />}
            <h2>{vista === 'anomalias' ? 'Anomalías detectadas' : 'Mi comportamiento'}</h2>
          </div>

          {/* Selector de vista (esquina superior derecha) */}
          <div className="ls-grafica-vistas" role="tablist" aria-label="Cambiar vista">
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'anomalias'}
              className={vista === 'anomalias' ? 'activa' : ''}
              onClick={() => setVista('anomalias')}
            >
              <ChartNoAxesCombined size={15} />
              <span>Anomalías</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'comportamiento'}
              className={vista === 'comportamiento' ? 'activa' : ''}
              onClick={() => setVista('comportamiento')}
            >
              <Fingerprint size={15} />
              <span>Comportamiento</span>
            </button>
          </div>
        </div>

        {/* ---------- VISTA: ANOMALÍAS ---------- */}
        {vista === 'anomalias' && (
          <>
            <div className="ls-usuario-grafica-contenido">
              <Line
                data={datosAnomalias}
                options={opcionesGrafica}
              />
            </div>

            <div className="ls-usuario-grafica-footer">
              {errorReporte && <p className="ls-usuario-reporte-error">{errorReporte}</p>}
              <button
                type="button"
                className="ls-usuario-btn-reporte"
                onClick={descargarReporte}
                disabled={cargando || generandoReporte}
              >
                <Download size={16} />
                {generandoReporte ? 'Generando reporte...' : 'Descargar reporte'}
              </button>
            </div>
          </>
        )}

        {/* ---------- VISTA: MI COMPORTAMIENTO ---------- */}
        {vista === 'comportamiento' && (
          <div className="ls-comportamiento">

            {cargandoComportamiento && (
              <p className="ls-comportamiento-mensaje">Cargando tu comportamiento...</p>
            )}

            {!cargandoComportamiento && !comportamiento && (
              <p className="ls-comportamiento-mensaje">
                No se pudo cargar tu comportamiento. Intenta de nuevo más tarde.
              </p>
            )}

            {comportamiento && (
              <>
                <p className="ls-comportamiento-descripcion">
                  Así usas normalmente tu casillero. Si un acceso se sale de este patrón,
                  te avisaremos como "acceso inusual".
                </p>

                {/* 1. Estado del análisis */}
                {analisis?.activo ? (
                  <div className="ls-comportamiento-estado activo">
                    <CheckCircle2 size={18} />
                    <div>
                      <span>El sistema ya conoce tu forma de usar el casillero.</span>
                      <small>
                        Aprendió tu patrón con tus últimos {analisis.accesos} accesos y lo usa
                        para detectar accesos que no se parecen a los tuyos.
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="ls-comportamiento-estado aprendiendo">
                    <span>
                      El sistema está aprendiendo tu comportamiento:{' '}
                      {analisis?.faltan === 1 ? 'falta 1 acceso' : `faltan ${analisis?.faltan} accesos`}.
                    </span>
                    <div className="ls-comportamiento-progreso">
                      <div style={{ width: `${progresoAnalisis}%` }} />
                    </div>
                    <small>
                      Se necesitan al menos {analisis?.minimo} accesos para conocer tu patrón.
                      Llevas {analisis?.accesos}. Mientras tanto no se revisan accesos inusuales.
                    </small>
                  </div>
                )}

                {/* 2. Datos de su patrón */}
                <div className="ls-comportamiento-datos">
                  <article>
                    <Clock size={20} />
                    <div>
                      <span>Horario habitual</span>
                      <strong>
                        {comportamiento.horario
                          ? `${comportamiento.horario.inicio} a ${comportamiento.horario.fin}`
                          : 'Sin datos'}
                      </strong>
                    </div>
                  </article>

                  <article>
                    <CalendarDays size={20} />
                    <div>
                      <span>Días que más lo usas</span>
                      <strong>{diasHabituales.length > 0 ? diasHabituales.join(' · ') : 'Sin datos'}</strong>
                    </div>
                  </article>

                  <article>
                    <Repeat size={20} />
                    <div>
                      <span>Accesos por día</span>
                      <strong>
                        {comportamiento.por_dia ? textoPorDia(comportamiento.por_dia) : 'Sin datos'}
                      </strong>
                    </div>
                  </article>
                </div>

                {/* 3. Accesos por hora */}
                <h3 className="ls-comportamiento-subtitulo">¿A qué hora usas tu casillero?</h3>
                <p className="ls-comportamiento-ayuda">
                  Cada barra es una hora del día (de 0 h, medianoche, a 23 h) y su altura indica
                  cuántas veces abriste tu casillero a esa hora en los últimos 30 días.
                  Las horas sin barra son en las que no sueles usarlo.
                </p>
                <div className="ls-comportamiento-grafica">
                  <Bar data={datosHoras} options={opcionesHoras} />
                </div>
                <p className="ls-comportamiento-nota">Hora del día · Últimos 30 días</p>

                {/* 4. Días de la semana */}
                <h3 className="ls-comportamiento-subtitulo">Días de la semana</h3>
                <p className="ls-comportamiento-ayuda">
                  Número de accesos que has hecho cada día de la semana.
                  Entre más verde el recuadro, más usas tu casillero ese día.
                </p>
                <div className="ls-comportamiento-semana">
                  {(comportamiento.dias ?? []).map((d) => (
                    <div
                      key={d.dia}
                      className="ls-comportamiento-dia"
                      title={`${d.total} ${d.total === 1 ? 'acceso' : 'accesos'}`}
                      style={{ '--intensidad': d.intensidad }}
                    >
                      <span>{d.dia}</span>
                      <strong>{d.total}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </section>

    </div>
  )
}