import {
  mockGetOrdenesPendientes,
  mockGetOrdenesEnProceso,
  mockGetOrdenesValidadas,
  mockGetResultadosByOrden,
  mockSaveResultados,
  mockValidateResultados,
} from "./mockData"

export const resultadosAPI = {
  /**
   * Obtiene las órdenes con estado pendiente
   */
  getOrdenesPendientes: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/ordenes?estado=pendiente')
    // return response.data

    // Simulación con datos de prueba
    return mockGetOrdenesPendientes()
  },

  /**
   * Obtiene las órdenes con estado en proceso
   */
  getOrdenesEnProceso: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/ordenes?estado=procesado')
    // return response.data

    // Simulación con datos de prueba
    return mockGetOrdenesEnProceso()
  },

  /**
   * Obtiene las órdenes con estado validado
   */
  getOrdenesValidadas: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/ordenes?estado=validado')
    // return response.data

    // Simulación con datos de prueba
    return mockGetOrdenesValidadas()
  },

  /**
   * Obtiene los resultados de una orden específica
   */
  getResultadosByOrden: async (ordenId: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get(`/ordenes/${ordenId}/resultados`)
    // return response.data

    // Simulación con datos de prueba
    return mockGetResultadosByOrden(ordenId)
  },

  /**
   * Guarda los resultados de una orden
   */
  saveResultados: async (ordenId: string, resultadosData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post(`/ordenes/${ordenId}/resultados`, resultadosData)
    // return response.data

    // Simulación con datos de prueba
    return mockSaveResultados(ordenId, resultadosData)
  },

  /**
   * Valida los resultados de una orden
   */
  validateResultados: async (ordenId: string, resultadosData: any, usuarioId: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.put(`/ordenes/${ordenId}/resultados/validar`, { resultados: resultadosData, id_usuario: usuarioId })
    // return response.data

    // Simulación con datos de prueba
    return mockValidateResultados(ordenId, resultadosData, usuarioId)
  },
}
