import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import Olvidar from './pages/auth/ForgotPassword'
import Recuperar from './pages/auth/ResetPassword'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path='/olvidar' element={<Olvidar />} />
      <Route path='/recuperar' element={<Recuperar />} />
    </Routes>
  )
}
