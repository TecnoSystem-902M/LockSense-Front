// LockSense - Alertas push: pedir permiso, suscribir el dispositivo y
// mandar la suscripción a Laravel.

import { obtenerClavePublica, guardarSuscripcion } from '../api/push'

/** ¿Este navegador puede recibir notificaciones push? */
export const pushSoportado = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

/** 'default' (no ha decidido), 'granted' (aceptó) o 'denied' (bloqueó) */
export const estadoPermiso = () => (pushSoportado() ? Notification.permission : 'denied')

/**
 * Pide el permiso del navegador y, si acepta, guarda el dispositivo en Laravel.
 * Regresa true si quedaron activadas.
 */
export async function activarAlertas() {
  if (!pushSoportado()) {
    throw new Error('Este navegador no permite notificaciones.')
  }

  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') return false

  await suscribirDispositivo()
  return true
}

/**
 * Si ya dio permiso antes, vuelve a mandar la suscripción a Laravel en silencio.
 * Sirve si otro usuario usó este dispositivo o si la suscripción cambió.
 */
export async function sincronizarAlertas() {
  if (estadoPermiso() !== 'granted') return
  try {
    await suscribirDispositivo()
  } catch (error) {
    console.warn('No se pudo sincronizar la suscripción push:', error)
  }
}

async function suscribirDispositivo() {
  const registro = await obtenerServiceWorker()

  let suscripcion = await registro.pushManager.getSubscription()

  if (!suscripcion) {
    const clave = await obtenerClavePublica()
    if (!clave) throw new Error('El servidor no tiene configuradas las alertas.')

    suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,                       // siempre se muestra una notificación
      applicationServerKey: base64UrlABytes(clave),
    })
  }

  await guardarSuscripcion(suscripcion.toJSON())
}

async function obtenerServiceWorker() {
  // El service worker solo se registra en producción (ver pwa.js).
  const registro = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
  ])

  if (!registro) {
    throw new Error('Las alertas solo funcionan en la versión publicada (no en npm run dev).')
  }
  return registro
}

// La clave VAPID viene en base64 "url"; el navegador la pide en bytes.
function base64UrlABytes(base64Url) {
  const relleno = '='.repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + relleno).replace(/-/g, '+').replace(/_/g, '/')
  const texto = window.atob(base64)
  return Uint8Array.from(texto, (c) => c.charCodeAt(0))
}