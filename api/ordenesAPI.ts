// import { mockGetOrdenes, mockCreateOrden, mockDeleteOrden } from "./mockData" // Mock data removed
import api from "./api" // API instance imported from ../api

export const ordenesAPI = {
  /**
   * Obtiene todas las órdenes con filtros opcionales
   */
  getOrdenes: async (page?: number, limit?: number, filters?: any) => {
    // Construir la URL base
    let url = '/ordenes/?'
    
    // Agregar parámetros de paginación
    if (page) url += `page=${page}&`
    if (limit) url += `limit=${limit}&`
    
    // Agregar filtros si se proporcionan
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'page' && key !== 'limit') {
          url += `${key}=${encodeURIComponent(filters[key])}&`
        }
      })
    }
    
    // Remover el último '&' si existe
    url = url.replace(/&$/, '')
    
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetOrdenes() // Mock data removed
  },

  /**
   * Crea una nueva orden
   */
  createOrden: async (ordenData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/ordenes/', ordenData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockCreateOrden(ordenData) // Mock data removed
  },

  /**
   * Elimina una orden
   */
  deleteOrden: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/ordenes/${id}/`) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockDeleteOrden(id) // Mock data removed
  },

  /**
   * Obtiene una orden por su ID
   */
  getOrdenById: async (id: string | number) => {
    const response = await api.get(`/ordenes/${id}/`)
    return response.data
  },
}
