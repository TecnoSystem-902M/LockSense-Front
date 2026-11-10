import { LockSenseProvider } from './context/LockSenseContext'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import Olvidar from './pages/auth/ForgotPassword'
import Recuperar from './pages/auth/ResetPassword'

import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Usuarios from './pages/admin/Usuarios'
import Casilleros from './pages/admin/Casilleros'

import FaceRegister from './pages/auth/FaceAuth/FaceRegister'

import UsuarioLayout from './components/usuario/UsuarioLayout'
import PanelUsuario from './pages/usuario/PanelUsuario'
import MiCasillero from './pages/usuario/MiCasillero'
import MiActividad from './pages/usuario/MiActividad'

import SuperAdminLayout from './components/superadmin/SuperAdminLayout'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import Organizaciones from './pages/superadmin/Organizaciones'
import Administradores from './pages/superadmin/Administradores'
import Dispositivos from './pages/superadmin/Dispositivos'

import ProtectedRoute from './components/ProtectedRoute'
import SoloInvitados from './components/SoloInvitados'

import PruebaSensor from './pages/PruebaSensor'

export default function App() {
  return (
    <LockSenseProvider>
      <Routes>

        {/* Páginas públicas */}
        <Route element={<SoloInvitados />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Route>

        {/* Recuperación de contraseña */}
        <Route path="/olvidar" element={<Olvidar />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* Panel de Super administración */}
        <Route element={<ProtectedRoute rolPermitido="SUPERADMIN" />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="organizaciones" element={<Organizaciones />} />
          <Route path="administradores" element={<Administradores />} />
          <Route path="dispositivos" element={<Dispositivos />} />
          </Route>
        </Route>

        {/* Panel de administración */}
        <Route element={<ProtectedRoute rolPermitido="ADMINISTRADOR" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="casilleros" element={<Casilleros />} />
          </Route>
        </Route>

        {/* Panel de usuario */}
        <Route element={<ProtectedRoute rolPermitido="USUARIO" />}>
          <Route path="/usuario" element={<UsuarioLayout />}>
            <Route index element={<PanelUsuario />} />
            <Route path="casillero" element={<MiCasillero />} />
            <Route path="actividad" element={<MiActividad />} />
          </Route>

          {/* Registro facial independiente del layout */}
          <Route
            path="/usuario/registrar-rostro"
            element={<FaceRegister />}
          />
        </Route>

        <Route path="/prueba-sensor/:clave" element={<PruebaSensor />} />

      </Routes>
    </LockSenseProvider>
  )
}