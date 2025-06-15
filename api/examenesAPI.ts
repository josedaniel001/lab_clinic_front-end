import { mockGetExamenes } from "./mockData"

export const examenesAPI = {
  /**
   * Obtiene todos los exámenes
   */
  getExamenes: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/examenes')
    // return response.data

    // Simulación con datos de prueba
    return mockGetExamenes()
  },
}
