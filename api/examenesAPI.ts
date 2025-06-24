// import { mockGetExamenes } from "./mockData" // Mock data removed
import api from "./api" // API instance imported from ../api

export const examenesAPI = {
  /**
   * Obtiene todos los exámenes
   */
  getExamenes: async (page?: number, limite?: number) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limite) params.append("limit", limite.toString())

    const url = `/examenes/?${params.toString()}`
    const response = await api.get(url)
    return response.data
}, createExamen: async (examenData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/examenes/', examenData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockCreateOrden(ordenData) // Mock data removed
  },
   updateExamen: async (id: string, examenData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.put(`/examenes/${id}/`, examenData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockUpdateMedico(id, medicoData) // Mock data removed
  },
  deleteExamen: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/examenes/${id}/`) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockDeleteMedico(id) // Mock data removed
  },
}
