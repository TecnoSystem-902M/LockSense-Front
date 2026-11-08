// LockSense - PWA: registro del service worker, actualizaciones e instalación.
//
// Se importa en main.jsx ANTES de que cargue la app, porque el navegador
// avisa que se puede instalar ("beforeinstallprompt") muy pronto y si nadie
// está escuchando, el aviso se pierde.

export const EVENTO_ACTUALIZACION = 'ls-pwa-actualizacion'
export const EVENTO_INSTALACION = 'ls-pwa-instalacion'

let avisoInstalacion = null   // evento guardado para mostrar "Instalar" después

// ---------- Instalación ----------
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()          // no mostrar la barra automática del navegador
  avisoInstalacion = event
  window.dispatchEvent(new Event(EVENTO_INSTALACION))
})

window.addEventListener('appinstalled', () => {
  avisoInstalacion = null
  window.dispatchEvent(new Event(EVENTO_INSTALACION))
})

export const puedeInstalar = () => avisoInstalacion !== null

/** Abre la ventana nativa de instalación. Regresa true si la aceptó. */
export async function instalarApp() {
  if (!avisoInstalacion) return false

  avisoInstalacion.prompt()
  const { outcome } = await avisoInstalacion.userChoice
  avisoInstalacion = null        // el aviso solo se puede usar una vez
  window.dispatchEvent(new Event(EVENTO_INSTALACION))

  return outcome === 'accepted'
}

/** ¿Se está usando ya como app instalada? */
export const esAppInstalada = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true          // iPhone

/** iPhone / iPad (en iOS no existe el botón de instalar). */
export const esIOS = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)

// ---------- Service worker ----------
export function registrarServiceWorker() {
  // En desarrollo (npm run dev) no se registra para que el caché no estorbe.
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('/sw.js')

      // Ya había una versión nueva esperando
      if (registro.waiting && navigator.serviceWorker.controller) {
        avisarActualizacion(registro.waiting)
      }

      // Llega una versión nueva mientras la app está abierta
      registro.addEventListener('updatefound', () => {
        const nuevo = registro.installing
        if (!nuevo) return

        nuevo.addEventListener('statechange', () => {
          if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
            avisarActualizacion(nuevo)
          }
        })
      })

      // Revisa si hay versión nueva cada hora (por si la app se queda abierta)
      setInterval(() => registro.update(), 60 * 60 * 1000)
    } catch (error) {
      console.error('No se pudo registrar el service worker:', error)
    }
  })

  // Cuando la versión nueva toma el control, se recarga una sola vez.
  let recargando = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return
    recargando = true
    window.location.reload()
  })
}

function avisarActualizacion(trabajador) {
  window.dispatchEvent(new CustomEvent(EVENTO_ACTUALIZACION, { detail: trabajador }))
}