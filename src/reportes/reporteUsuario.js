// LockSense - Reporte PDF del usuario
//
// Arma el PDF de 2 páginas (Resumen y anomalías / Mi comportamiento)
// con los datos que ya manda el back. Las gráficas se dibujan con
// Chart.js en un canvas oculto y se insertan como imagen.
//
// Requiere:  npm install jspdf jspdf-autotable

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Chart from 'chart.js/auto'

// ---------- Colores de LockSense ----------
const C = {
  oscuro:    [15, 41, 34],     // #0f2922
  verde:     [24, 185, 130],   // #18b982
  verdeTxt:  [15, 122, 85],    // #0f7a55
  verdeSuave:[228, 245, 237],  // #e4f5ed
  texto:     [37, 54, 46],     // #25362e
  gris:      [100, 115, 107],  // #64736b
  grisClaro: [145, 160, 152],  // #91a098
  borde:     [230, 238, 233],  // #e6eee9
  fondo:     [248, 250, 249],  // #f8faf9
  menta:     [159, 199, 184],  // #9fc7b8
  rojo:      [237, 78, 78],
  rojoSuave: [255, 243, 243],
  ambar:     [138, 100, 0],
  ambarSuave:[255, 246, 224],
}

const ESTADOS = {
  SEGURO:     'Seguro',
  ALERTA:     'En alerta',
  BLOQUEADO:  'Bloqueado',
  DESOCUPADO: 'Desocupado',
}

// Colores del riesgo en la tabla: [fondo, texto]
const COLOR_RIESGO = {
  Bajo:    [[228, 245, 237], [15, 122, 85]],
  Medio:   [[255, 241, 214], [138, 100, 0]],
  Alto:    [[255, 224, 224], [192, 52, 52]],
  Crítico: [[255, 205, 205], [150, 20, 20]],
}

// Medidas de la hoja (A4 en mm)
const ANCHO = 210
const ALTO = 297
const MARGEN = 14
const UTIL = ANCHO - MARGEN * 2

// ======================================================
// Función principal
// ======================================================
export async function generarReporteUsuario({ dashboard, comportamiento, reporte }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  await paginaResumen(doc, dashboard, reporte)

  doc.addPage()
  await paginaComportamiento(doc, comportamiento)

  // Pie de página en todas las hojas (ya se sabe cuántas son)
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    pie(doc, i, total, reporte.generado)
  }

  const fecha = new Date().toISOString().slice(0, 10)
  const casillero = reporte.casillero ? `-casillero-${reporte.casillero}` : ''
  doc.save(`reporte-locksense${casillero}-${fecha}.pdf`)
}

// ======================================================
// Página 1: Resumen y anomalías
// ======================================================
async function paginaResumen(doc, dashboard, reporte) {
  encabezado(doc, 'Resumen y anomalías')

  // ---- Datos del reporte ----
  let y = 37
  caja(doc, MARGEN, y, UTIL, 15, C.fondo, C.borde)

  const datos = [
    ['USUARIO', reporte.usuario || dashboard.nombre || '-'],
    ['CASILLERO', reporte.casillero ? String(reporte.casillero) : 'Sin asignar'],
    ['ORGANIZACIÓN', reporte.organizacion || '-'],
    ['PERIODO', `${reporte.periodo.desde} al ${reporte.periodo.hasta}`],
  ]
  const anchoDato = UTIL / 4
  datos.forEach(([etiqueta, valor], i) => {
    const x = MARGEN + 4 + i * anchoDato
    texto(doc, etiqueta, x, y + 5.5, 6.5, C.gris)
    texto(doc, recortar(doc, valor, anchoDato - 6, 8.5, 'bold'), x, y + 10.5, 8.5, C.texto, 'bold')
  })

  // ---- Resumen (3 tarjetas) ----
  y = 60
  titulo(doc, 'Resumen', 'Estado actual de tu casillero al momento de generar el reporte.', y)

  y += 9
  const tarjetas = [
    ['Estado', ESTADOS[dashboard.estado] || 'Seguro', false],
    ['Accesos del mes', String(dashboard.accesos_mes ?? 0), false],
    ['Alertas de hoy', String(dashboard.alertas_hoy ?? 0), (dashboard.alertas_hoy ?? 0) > 0],
  ]
  const anchoTarjeta = (UTIL - 8) / 3
  tarjetas.forEach(([etiqueta, valor, alerta], i) => {
    const x = MARGEN + i * (anchoTarjeta + 4)
    caja(doc, x, y, anchoTarjeta, 18, alerta ? C.rojoSuave : [241, 248, 245])
    doc.setFillColor(...(alerta ? C.rojo : C.verde))
    doc.rect(x, y, 1.5, 18, 'F')
    texto(doc, etiqueta, x + 5, y + 6.5, 7.5, C.gris)
    texto(doc, valor, x + 5, y + 14, 14, C.texto, 'bold')
  })

  // ---- Gráfica de anomalías ----
  y = 96
  titulo(doc, 'Anomalías detectadas (últimos 7 días)',
    'Número de eventos sospechosos registrados cada día en tu casillero.', y)

  const grafica = dashboard.grafica ?? []
  const imagenLinea = await imagenGrafica(configLinea(grafica), UTIL, 52)
  doc.addImage(imagenLinea, 'PNG', MARGEN, y + 8, UTIL, 52)

  // ---- Tabla de anomalías ----
  y = 168
  titulo(doc, 'Detalle de anomalías',
    'Cada evento sospechoso con la razón por la que el sistema lo marcó.', y)

  const anomalias = reporte.anomalias ?? []

  if (anomalias.length === 0) {
    caja(doc, MARGEN, y + 9, UTIL, 12, C.verdeSuave)
    texto(doc, 'No se detectaron anomalías en los últimos 7 días. Todo en orden.',
      ANCHO / 2, y + 16.5, 9, C.verdeTxt, 'bold', 'center')
    return
  }

  autoTable(doc, {
    startY: y + 9,
    margin: { left: MARGEN, right: MARGEN, top: 20, bottom: 20 },
    head: [['Fecha', 'Hora', 'Tipo', 'Riesgo', 'Motivo']],
    body: anomalias.map((a) => [a.fecha, a.hora, a.tipo, a.riesgo, a.motivo]),
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: C.texto,
      cellPadding: 2.2,
      lineColor: C.borde,
      lineWidth: { bottom: 0.2 },
      valign: 'middle',
    },
    headStyles: { fillColor: C.oscuro, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: C.fondo },
    columnStyles: {
      0: { cellWidth: 21 },
      1: { cellWidth: 13 },
      2: { cellWidth: 34 },
      3: { cellWidth: 17, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 'auto' },
    },
    // Color de la columna Riesgo
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const colores = COLOR_RIESGO[data.cell.raw]
        if (colores) {
          data.cell.styles.fillColor = colores[0]
          data.cell.styles.textColor = colores[1]
        }
      }
    },
  })
}

// ======================================================
// Página 2: Mi comportamiento
// ======================================================
async function paginaComportamiento(doc, comportamiento) {
  encabezado(doc, 'Mi comportamiento')

  let y = 40
  titulo(doc, 'Mi comportamiento',
    'Así usas normalmente tu casillero. Si un acceso se sale de este patrón, el sistema lo marca como "acceso inusual".', y)

  // ---- Estado del análisis ----
  y += 10
  const analisis = comportamiento.analisis

  if (analisis.activo) {
    caja(doc, MARGEN, y, UTIL, 13, C.verdeSuave)
    texto(doc, 'El sistema ya conoce tu forma de usar el casillero.', MARGEN + 4, y + 5.5, 8.5, C.verdeTxt, 'bold')
    texto(doc, `Aprendió tu patrón con tus últimos ${analisis.accesos} accesos.`, MARGEN + 4, y + 10, 7.5, C.verdeTxt)
  } else {
    caja(doc, MARGEN, y, UTIL, 17, C.ambarSuave)
    const faltan = analisis.faltan === 1 ? 'falta 1 acceso' : `faltan ${analisis.faltan} accesos`
    texto(doc, `El sistema está aprendiendo tu comportamiento: ${faltan}.`, MARGEN + 4, y + 5.5, 8.5, C.ambar, 'bold')
    // barra de progreso
    const progreso = Math.min(1, analisis.accesos / analisis.minimo)
    doc.setFillColor(240, 226, 190)
    doc.roundedRect(MARGEN + 4, y + 8.5, UTIL - 8, 2, 1, 1, 'F')
    doc.setFillColor(230, 161, 62)
    if (progreso > 0) doc.roundedRect(MARGEN + 4, y + 8.5, (UTIL - 8) * progreso, 2, 1, 1, 'F')
    texto(doc, `Se necesitan al menos ${analisis.minimo} accesos. Llevas ${analisis.accesos}.`, MARGEN + 4, y + 14.5, 7, C.ambar)
    y += 4
  }

  // ---- Tres datos ----
  y += 18
  const dias = comportamiento.dias ?? []
  const diasHabituales = dias.filter((d) => d.total > 0 && d.intensidad >= 0.5).map((d) => d.dia)
  const porDia = comportamiento.por_dia

  const datos = [
    [
      'Horario habitual',
      comportamiento.horario ? `${comportamiento.horario.inicio} a ${comportamiento.horario.fin}` : 'Sin datos',
      '8 de cada 10 de tus accesos ocurren en este rango de horas.',
    ],
    [
      'Días que más lo usas',
      diasHabituales.length > 0 ? diasHabituales.join(' · ') : 'Sin datos',
      'Los días en los que más abres tu casillero.',
    ],
    [
      'Accesos por día',
      porDia ? textoPorDia(porDia.promedio) : 'Sin datos',
      porDia
        ? `Casi nunca pasas de ${porDia.maximo}; más de ${porDia.maximo + 2} en un día puede marcarse como inusual.`
        : 'Todavía no hay accesos registrados.',
    ],
  ]

  const anchoDato = (UTIL - 8) / 3
  datos.forEach(([etiqueta, valor, ayuda], i) => {
    const x = MARGEN + i * (anchoDato + 4)
    caja(doc, x, y, anchoDato, 24, C.fondo, C.borde)
    texto(doc, etiqueta, x + 4, y + 6, 7.5, C.gris)
    texto(doc, recortar(doc, valor, anchoDato - 8, 10, 'bold'), x + 4, y + 11.5, 10, C.texto, 'bold')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.8)
    doc.setTextColor(...C.grisClaro)
    doc.text(doc.splitTextToSize(ayuda, anchoDato - 8), x + 4, y + 16)
  })

  // ---- Accesos por hora ----
  y += 33
  titulo(doc, '¿A qué hora usas tu casillero?', 'Accesos por hora del día en los últimos 30 días.', y)

  const imagenBarras = await imagenGrafica(configBarras(comportamiento.horas ?? []), UTIL, 55)
  doc.addImage(imagenBarras, 'PNG', MARGEN, y + 8, UTIL, 55)

  // ---- Días de la semana ----
  y += 72
  titulo(doc, 'Días de la semana', 'Accesos por día. Entre más verde, más usas tu casillero ese día.', y)

  y += 9
  const anchoDia = (UTIL - 6 * 3) / 7
  dias.forEach((d, i) => {
    const x = MARGEN + i * (anchoDia + 3)
    caja(doc, x, y, anchoDia, 15, mezclar(C.verde, [238, 243, 240], d.intensidad))
    texto(doc, d.dia, x + anchoDia / 2, y + 5.5, 7.5, C.texto, 'bold', 'center')
    texto(doc, String(d.total), x + anchoDia / 2, y + 11.5, 11, C.texto, 'bold', 'center')
  })

  // ---- Nota ----
  y += 24
  doc.setDrawColor(185, 213, 201)
  doc.setLineDashPattern([1.2, 1], 0)
  doc.roundedRect(MARGEN, y, UTIL, 17, 2.5, 2.5, 'S')
  doc.setLineDashPattern([], 0)

  texto(doc, '¿Cómo leer este reporte?', MARGEN + 4, y + 5.5, 8.5, C.oscuro, 'bold')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(79, 95, 87)
  doc.text(
    doc.splitTextToSize(
      'Las anomalías no significan que alguien haya entrado sin permiso: indican accesos que no se parecen a tu forma habitual de usar el casillero. Si no reconoces alguno, avisa al administrador de tu organización.',
      UTIL - 8
    ),
    MARGEN + 4,
    y + 10
  )
}

// ======================================================
// Gráficas (Chart.js en un canvas oculto)
// ======================================================
function configLinea(grafica) {
  return {
    type: 'line',
    data: {
      labels: grafica.map((d) => `${d.dia} ${d.fecha.slice(0, 5)}`),
      datasets: [{
        data: grafica.map((d) => d.total),
        borderColor: '#18b982',
        backgroundColor: 'rgba(24, 185, 130, 0.12)',
        borderWidth: 5,
        pointRadius: 7,
        pointBackgroundColor: '#18b982',
        pointBorderWidth: 0,
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      scales: {
        x: { grid: { display: false }, ticks: { color: '#66736c', font: { size: 22 } } },
        y: {
          beginAtZero: true,
          suggestedMax: 3,
          ticks: { precision: 0, color: '#66736c', font: { size: 22 } },
          grid: { color: '#e7ece9' },
        },
      },
    },
  }
}

function configBarras(horas) {
  return {
    type: 'bar',
    data: {
      labels: horas.map((_, h) => h),
      datasets: [{
        data: horas,
        backgroundColor: '#18b982',
        borderRadius: 6,
        maxBarThickness: 34,
      }],
    },
    options: {
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#66736c',
            font: { size: 20 },
            autoSkip: false,
            maxRotation: 0,
            callback: (valor, indice) => (indice % 3 === 0 ? `${indice} h` : ''),
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: 3,
          ticks: { precision: 0, color: '#66736c', font: { size: 20 } },
          grid: { color: '#e7ece9' },
        },
      },
    },
    // Escribe el número encima de cada barra
    plugins: [{
      id: 'valores',
      afterDatasetsDraw(chart) {
        const { ctx } = chart
        const meta = chart.getDatasetMeta(0)
        ctx.save()
        ctx.fillStyle = '#25362e'
        ctx.font = 'bold 18px Helvetica, Arial, sans-serif'
        ctx.textAlign = 'center'
        meta.data.forEach((barra, i) => {
          const valor = chart.data.datasets[0].data[i]
          if (valor > 0) ctx.fillText(valor, barra.x, barra.y - 8)
        })
        ctx.restore()
      },
    }],
  }
}

/** Dibuja la gráfica fuera de pantalla y regresa la imagen PNG. */
function imagenGrafica(config, anchoMm, altoMm) {
  return new Promise((resolve) => {
    const ancho = 1400
    const alto = Math.round(ancho * (altoMm / anchoMm))

    const contenedor = document.createElement('div')
    contenedor.style.cssText = `position:fixed;left:-10000px;top:0;width:${ancho}px;height:${alto}px;`
    const canvas = document.createElement('canvas')
    canvas.width = ancho
    canvas.height = alto
    contenedor.appendChild(canvas)
    document.body.appendChild(contenedor)

    const grafica = new Chart(canvas, {
      ...config,
      options: {
        ...config.options,
        responsive: false,
        animation: false,
        devicePixelRatio: 1,
        layout: { padding: { top: 24, right: 20 } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      },
    })

    const imagen = grafica.toBase64Image('image/png', 1)
    grafica.destroy()
    contenedor.remove()
    resolve(imagen)
  })
}

// ======================================================
// Piezas reutilizables
// ======================================================
function encabezado(doc, subtitulo) {
  doc.setFillColor(...C.oscuro)
  doc.rect(0, 0, ANCHO, 28, 'F')

  // Logo: círculo blanco con "LS"
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(0.6)
  doc.circle(MARGEN + 6, 14, 6, 'FD')
  texto(doc, 'LS', MARGEN + 6, 15.6, 9, C.oscuro, 'bold', 'center')

  texto(doc, 'LockSense', MARGEN + 15, 13, 13, [255, 255, 255], 'bold')
  texto(doc, 'Casilleros inteligentes', MARGEN + 15, 18, 7.5, C.menta)

  texto(doc, 'Reporte de seguridad', ANCHO - MARGEN, 13, 13, [255, 255, 255], 'bold', 'right')
  texto(doc, subtitulo, ANCHO - MARGEN, 18, 7.5, C.menta, 'normal', 'right')
}

function pie(doc, pagina, total, generado) {
  doc.setDrawColor(...C.borde)
  doc.setLineWidth(0.3)
  doc.line(MARGEN, ALTO - 13, ANCHO - MARGEN, ALTO - 13)
  texto(doc, `Generado automáticamente por LockSense · ${generado}`, MARGEN, ALTO - 8.5, 7, C.grisClaro)
  texto(doc, `Página ${pagina} de ${total}`, ANCHO - MARGEN, ALTO - 8.5, 7, C.grisClaro, 'normal', 'right')
}

function titulo(doc, principal, subtitulo, y) {
  texto(doc, principal, MARGEN, y, 11.5, C.oscuro, 'bold')
  texto(doc, subtitulo, MARGEN, y + 5, 7.8, C.grisClaro)
}

function texto(doc, contenido, x, y, tamano, color, estilo = 'normal', alineacion = 'left') {
  doc.setFont('helvetica', estilo)
  doc.setFontSize(tamano)
  doc.setTextColor(...color)
  doc.text(String(contenido), x, y, { align: alineacion })
}

function caja(doc, x, y, ancho, alto, relleno, borde = null) {
  doc.setFillColor(...relleno)
  if (borde) {
    doc.setDrawColor(...borde)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, ancho, alto, 2.5, 2.5, 'FD')
  } else {
    doc.roundedRect(x, y, ancho, alto, 2.5, 2.5, 'F')
  }
}

/** Corta el texto con "..." si no cabe en el ancho. */
function recortar(doc, contenido, anchoMax, tamano, estilo) {
  doc.setFont('helvetica', estilo)
  doc.setFontSize(tamano)
  let t = String(contenido)
  if (doc.getTextWidth(t) <= anchoMax) return t
  while (t.length > 1 && doc.getTextWidth(t + '...') > anchoMax) t = t.slice(0, -1)
  return t + '...'
}

/** Mezcla dos colores: t = 1 es todo el primero, t = 0 todo el segundo. */
function mezclar(a, b, t) {
  return a.map((v, i) => Math.round(v * t + b[i] * (1 - t)))
}

// 2.7 -> "2 a 3 veces al día"  |  3 -> "3 veces al día"
function textoPorDia(promedio) {
  const bajo = Math.floor(promedio)
  const alto = Math.ceil(promedio)
  const veces = (n) => `${n} ${n === 1 ? 'vez' : 'veces'}`

  if (bajo === alto || bajo === 0) return `${veces(alto)} al día`
  return `${bajo} a ${veces(alto)} al día`
}