// Mock data imports removed
// import {
//   mockGetOrdenesPendientes,
//   mockGetOrdenesEnProceso,
//   mockGetOrdenesValidadas,
//   mockGetResultadosByOrden,
//   mockSaveResultados,
//   mockValidateResultados,
// } from "./mockData"
import api from "./api" // API instance imported from ../api

export const resultadosAPI = {
  /**
   * Obtiene las órdenes con estado pendiente
   */
  getOrdenesPendientes: async (page?: number) => {
    // En un entorno real, esto sería una llamada a la API
    const baseUrl = "/ordenes/?estado=pendiente"
    const url = page ? `${baseUrl}&page=${page}` : baseUrl
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetOrdenesPendientes() // Mock data removed
  },

  /**
   * Obtiene las órdenes con estado en proceso
   */
  getOrdenesEnProceso: async (page?: number) => {
    // En un entorno real, esto sería una llamada a la API
    const baseUrl = "/ordenes/?estado=procesado"
    const url = page ? `${baseUrl}&page=${page}` : baseUrl
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetOrdenesEnProceso() // Mock data removed
  },

  /**
   * Obtiene las órdenes con estado validado
   */
  getOrdenesValidadas: async (page?: number) => {
    // En un entorno real, esto sería una llamada a la API
    const baseUrl = "/ordenes/?estado=validado"
    const url = page ? `${baseUrl}&page=${page}` : baseUrl
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetOrdenesValidadas() // Mock data removed
  },

  /**
   * Obtiene los resultados de una orden específica
   */
  getResultadosByOrden: async (ordenId: string, page?: number) => {
    // En un entorno real, esto sería una llamada a la API
    const baseUrl = `/ordenes/${ordenId}/resultados/`
    const url = page ? `${baseUrl}?page=${page}` : baseUrl
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetResultadosByOrden(ordenId) // Mock data removed
  },

  /**
   * Guarda los resultados de una orden
   */
  saveResultados: async (ordenId: string, resultadosData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post(`/ordenes/${ordenId}/resultados/`, resultadosData)
    return response.data

    // Simulación con datos de prueba
    // return mockSaveResultados(ordenId, resultadosData) // Mock data removed
  },

  /**
   * Valida los resultados de una orden
   */
  validateResultados: async (ordenId: string, resultadosData: any, usuarioId: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.put(`/ordenes/${ordenId}/resultados/validar/`, { resultados: resultadosData, id_usuario: usuarioId })
    return response.data

    // Simulación con datos de prueba
    // return mockValidateResultados(ordenId, resultadosData, usuarioId) // Mock data removed
  },
}
