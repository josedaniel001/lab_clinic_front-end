// import { mockGetPermisos, mockGetPermisosByRol, mockSavePermisos } from "./mockData" // Mock data removed
import api from "../api" // API instance imported from ../api

export const permisosAPI = {
  /**
   * Obtiene todos los permisos
   */
  getPermisos: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/permisos/?page=${page}` : "/permisos/" // Conditional URL with trailing slash
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetPermisos() // Mock data removed
  },

  /**
   * Obtiene los permisos de un rol específico
   */
  getPermisosByRol: async (rolId: string, page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/roles/${rolId}/permisos/?page=${page}` : `/roles/${rolId}/permisos/` // Conditional URL with trailing slash
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetPermisosByRol(rolId) // Mock data removed
  },

  /**
   * Guarda los permisos de un rol
   */
  savePermisos: async (rolId: string, permisosData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post(`/roles/${rolId}/permisos/`, permisosData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockSavePermisos(rolId, permisosData) // Mock data removed
  },
}
