import { mockGetDashboardStats, mockGetRecentOrders } from "./mockData"

export const dashboardAPI = {
  /**
   * Obtiene estadísticas para el dashboard
   */
  getStats: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/dashboard/stats')
    // return response.data

    // Simulación con datos de prueba
    return mockGetDashboardStats()
  },

  /**
   * Obtiene órdenes recientes para el dashboard
   */
  getRecentOrders: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/dashboard/recent-orders')
    // return response.data

    // Simulación con datos de prueba
    return mockGetRecentOrders()
  },
}
