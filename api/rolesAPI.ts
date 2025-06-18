// import { mockGetRoles, mockCreateRol, mockUpdateRol, mockDeleteRol } from "./mockData" // Mock data removed
import api from "../api" // API instance imported from ../api

export const rolesAPI = {
  /**
   * Obtiene todos los roles
   */
  getRoles: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/roles/?page=${page}` : "/roles/" // Conditional URL with trailing slash
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetRoles() // Mock data removed
  },

  /**
   * Crea un nuevo rol
   */
  createRol: async (rolData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/roles/', rolData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockCreateRol(rolData) // Mock data removed
  },

  /**
   * Actualiza un rol existente
   */
  updateRol: async (id: string, rolData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.put(`/roles/${id}/`, rolData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockUpdateRol(id, rolData) // Mock data removed
  },

  /**
   * Elimina un rol
   */
  deleteRol: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/roles/${id}/`) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockDeleteRol(id) // Mock data removed
  },
}
