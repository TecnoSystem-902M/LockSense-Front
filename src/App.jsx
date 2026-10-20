import { LockSenseProvider } from './context/LockSenseContext'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import Olvidar from './pages/auth/ForgotPassword'
import Recuperar from './pages/auth/ResetPassword'
import CapturaFacial from './components/usuario/CapturaFacial';

import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Usuarios from './pages/admin/Usuarios'
import Casilleros from './pages/admin/Casilleros'

import FaceRegister from './pages/auth/FaceAuth/FaceRegister'

import ProtectedRoute from './components/ProtectedRoute'
import SoloInvitados from './components/SoloInvitados'

export default function App() {
  return (
    <LockSenseProvider>
      <Routes>
        {/* Páginas públicas: si hay sesión, mandan directo al panel del rol */}
        <Route element={<SoloInvitados />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Route>

        {/* Recuperación de contraseña: accesibles siempre */}
        <Route path="/olvidar" element={<Olvidar />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* Panel de administración (solo ADMINISTRADOR) */}
        <Route element={<ProtectedRoute rolPermitido="ADMINISTRADOR" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="casilleros" element={<Casilleros />} />
          </Route>
        </Route>

        {/* Usuario (solo USUARIO): registro de rostro después del login */}
        <Route element={<ProtectedRoute rolPermitido="USUARIO" />}>
          <Route path="/usuario/registrar-rostro" element={<FaceRegister />} />
        </Route>

      </Routes>
    </LockSenseProvider>
  )
}