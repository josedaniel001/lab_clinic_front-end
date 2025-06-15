import { mockGetEstadisticas } from "./mockData"

export const reportesAPI = {
  /**
   * Obtiene estadísticas según filtros
   */
  getEstadisticas: async (filtros: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/reportes/estadisticas', { params: filtros })
    // return response.data

    // Simulación con datos de prueba
    return mockGetEstadisticas(filtros)
  },
}
