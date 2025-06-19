// import { mockGetExamenes } from "./mockData" // Mock data removed
import api from "./api" // API instance imported from ../api

export const examenesAPI = {
  /**
   * Obtiene todos los exámenes
   */
  getExamenes: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/examenes/?page=${page}` : "/examenes/" // Conditional URL with trailing slash
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetExamenes() // Mock data removed
  },
}
