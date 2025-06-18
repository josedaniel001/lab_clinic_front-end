// import { mockGetOrdenes, mockCreateOrden, mockDeleteOrden } from "./mockData" // Mock data removed
import api from "../api" // API instance imported from ../api

export const ordenesAPI = {
  /**
   * Obtiene todas las órdenes
   */
  getOrdenes: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/ordenes/?page=${page}` : "/ordenes/" // Conditional URL with trailing slash
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
}
