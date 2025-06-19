// import { mockGetUsuarios, mockCreateUsuario, mockUpdateUsuario, mockDeleteUsuario } from "./mockData" // Mock data removed
import api from "./api" // API instance imported from ../api

export const usuariosAPI = {
  /**
   * Obtiene todos los usuarios
   */
  getUsuarios: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/usuarios/?page=${page}` : "/usuarios/" // Conditional URL with trailing slash
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetUsuarios() // Mock data removed
  },

  /**
   * Crea un nuevo usuario
   */
  createUsuario: async (userData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/usuarios/', userData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockCreateUsuario(userData) // Mock data removed
  },

  /**
   * Actualiza un usuario existente
   */
  updateUsuario: async (id: string, userData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.put(`/usuarios/${id}/`, userData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockUpdateUsuario(id, userData) // Mock data removed
  },

  /**
   * Elimina un usuario
   */
  deleteUsuario: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/usuarios/${id}/`) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockDeleteUsuario(id) // Mock data removed
  },
}
