// import { mockGetDashboardStats, mockGetRecentOrders } from "./mockData" // Mock data removed
import api from "../api" // API instance imported from ../api

export const dashboardAPI = {
  /**
   * Obtiene estadísticas para el dashboard
   */
  getStats: async () => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.get('/dashboard/stats/') // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockGetDashboardStats() // Mock data removed
  },

  /**
   * Obtiene órdenes recientes para el dashboard
   */
  getRecentOrders: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/dashboard/recent-orders/?page=${page}` : '/dashboard/recent-orders/' // Conditional URL with trailing slash
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetRecentOrders() // Mock data removed
  },
}
