/* =========================================================
   LockSense - Service Worker (PWA)

   Qué hace:
   - Guarda la INTERFAZ (JS, CSS, imágenes, íconos) para que la app
     abra rápido.
   - NUNCA guarda las llamadas a la API (Render / Azure): los datos
     siempre se piden en vivo y no quedan datos privados en el caché.
   - Sin internet, al abrir una página muestra /offline.html.

   Para forzar que todos reciban la versión nueva del SW, cambia VERSION.
   ========================================================= */

const VERSION = 'locksense-v1'
const CACHE = `${VERSION}-app`

// Lo mínimo que se guarda al instalar.
const PRECARGA = [
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ---------- Instalación ----------
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECARGA)))
  // No se llama skipWaiting(): la versión nueva espera a que el usuario
  // presione "Actualizar" (ver mensaje SKIP_WAITING abajo).
})

// ---------- Activación: borra cachés de versiones viejas ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(
        claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))
      ))
      .then(() => self.clients.claim())
  )
})

// El aviso "Hay una nueva versión" manda este mensaje al presionar Actualizar.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

// ---------- Peticiones ----------
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo GET del mismo dominio (Vercel). La API está en otro dominio,
  // así que nunca pasa por aquí. /api/ también se excluye por si acaso.
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // 1) Abrir una página (navegación): siempre de la red.
  //    Sin internet -> pantalla "Sin conexión".
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    )
    return
  }

  // 2) Archivos de Vite (/assets/...): el nombre lleva un hash y nunca
  //    cambia, así que se toman del caché si ya están.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(desdeCache(request))
    return
  }

  // 3) Íconos, imágenes y demás archivos públicos: se responde con el
  //    caché (rápido) y se actualiza en segundo plano.
  if (/\.(png|jpe?g|svg|webp|ico|woff2?|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(cacheYActualiza(request))
  }
})

async function desdeCache(request) {
  const guardada = await caches.match(request)
  if (guardada) return guardada

  const respuesta = await fetch(request)
  if (respuesta.ok) {
    const cache = await caches.open(CACHE)
    cache.put(request, respuesta.clone())
  }
  return respuesta
}

async function cacheYActualiza(request) {
  const cache = await caches.open(CACHE)
  const guardada = await cache.match(request)

  const deRed = fetch(request)
    .then((respuesta) => {
      if (respuesta.ok) cache.put(request, respuesta.clone())
      return respuesta
    })
    .catch(() => guardada)

  return guardada || deRed
}