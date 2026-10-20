import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import Olvidar from './pages/auth/ForgotPassword'
import Recuperar from './pages/auth/ResetPassword'
import CapturaFacial from './components/usuario/CapturaFacial';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CapturaFacial />} /> {/* Aquí entra directo a la cámara */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path='/olvidar' element={<Olvidar />} />
      <Route path='/recuperar' element={<Recuperar />} />
      <Route path="/CapturaFacial" element={<CapturaFacial />} />
    </Routes>
  )
}