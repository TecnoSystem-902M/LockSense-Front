import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AvisoActualizacion from './pwa/AvisoActualizacion.jsx'
import BotonInstalarApp from './pwa/BotonInstalarApp.jsx'
import { registrarServiceWorker } from './pwa/pwa'
import './index.css'
import './auth.css'

// PWA: registra el service worker (solo en producción).
registrarServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <AvisoActualizacion />
      <BotonInstalarApp />   {/* bolita "Descargar app" (solo en la página principal) */}
    </BrowserRouter>
  </React.StrictMode>
)