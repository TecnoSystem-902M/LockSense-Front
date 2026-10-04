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

export default function App() {
  return (
    <LockSenseProvider>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/olvidar" element={<Olvidar />} />
        <Route path="/recuperar" element={<Recuperar />} />

        {/* Panel de administración */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="casilleros" element={<Casilleros />} />
        </Route>
      </Routes>
    </LockSenseProvider>
  )
}
