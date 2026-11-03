import { createContext, useContext, useState } from 'react'

const LockSenseContext = createContext(null)

const usuariosIniciales = [
  {
    id: 1,
    nombre: 'Carlos Hernández',
    uuid: '550e8400-e29b-41d4-a716-446655440001',
  },
  {
    id: 2,
    nombre: 'María González',
    uuid: '550e8400-e29b-41d4-a716-446655440002',
  },
  {
    id: 3,
    nombre: 'Luis Martínez',
    uuid: '550e8400-e29b-41d4-a716-446655440003',
  },
]

export function LockSenseProvider({ children }) {
  const [usuarios, setUsuarios] = useState(usuariosIniciales)

  const agregarUsuario = (usuario) => {
    setUsuarios(actuales => [...actuales, usuario])
  }

  const modificarUsuario = (usuarioActualizado) => {
    setUsuarios(actuales =>
      actuales.map(usuario =>
        usuario.id === usuarioActualizado.id
          ? usuarioActualizado
          : usuario
      )
    )
  }

  const eliminarUsuario = (id) => {
    setUsuarios(actuales =>
      actuales.filter(usuario => usuario.id !== id)
    )
  }

  return (
    <LockSenseContext.Provider
      value={{
        usuarios,
        agregarUsuario,
        modificarUsuario,
        eliminarUsuario,
      }}
    >
      {children}
    </LockSenseContext.Provider>
  )
}

export function useLockSense() {
  const contexto = useContext(LockSenseContext)

  if (!contexto) {
    throw new Error(
      'useLockSense debe utilizarse dentro de LockSenseProvider'
    )
  }

  return contexto
}