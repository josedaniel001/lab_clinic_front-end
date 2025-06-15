import { mockGetUsuarios, mockCreateUsuario, mockUpdateUsuario, mockDeleteUsuario } from "./mockData"

export const usuariosAPI = {
  /**
   * Obtiene todos los usuarios
   */
  getUsuarios: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/usuarios')
    // return response.data

    // Simulación con datos de prueba
    return mockGetUsuarios()
  },

  /**
   * Crea un nuevo usuario
   */
  createUsuario: async (userData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/usuarios', userData)
    // return response.data

    // Simulación con datos de prueba
    return mockCreateUsuario(userData)
  },

  /**
   * Actualiza un usuario existente
   */
  updateUsuario: async (id: string, userData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.put(`/usuarios/${id}`, userData)
    // return response.data

    // Simulación con datos de prueba
    return mockUpdateUsuario(id, userData)
  },

  /**
   * Elimina un usuario
   */
  deleteUsuario: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.delete(`/usuarios/${id}`)
    // return response.data

    // Simulación con datos de prueba
    return mockDeleteUsuario(id)
  },
}
