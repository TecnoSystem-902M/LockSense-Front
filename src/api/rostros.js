import api from './client'

// Registro facial (reutiliza el cliente Axios existente con Bearer token).
//
// Envía la imagen al backend Laravel mediante multipart/form-data en el campo
// `imagen` (nombre que valida RostroController). NO se fuerza
// Content-Type: application/json; al pasar un FormData, Axios/navegador
// establece multipart/form-data con el boundary correcto.

export const registrarRostro = async (blob) => {
  const formData = new FormData()
  formData.append('imagen', blob, 'rostro.jpg')

  // El cliente Axios compartido fija Content-Type: application/json por
  // defecto. Lo anulamos SOLO en esta petición (Content-Type: undefined) para
  // que Axios/navegador detecten el FormData y generen el encabezado
  // multipart/form-data con su boundary correcto.
  const { data } = await api.post('/rostro', formData, {
    headers: {
      'Content-Type': undefined,
    },
  })
  return data
}
