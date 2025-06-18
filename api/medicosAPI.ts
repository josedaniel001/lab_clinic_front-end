// import { mockGetMedicos, mockCreateMedico, mockUpdateMedico, mockDeleteMedico } from "./mockData" // Mock data removed
import api from "../api" // API instance imported from ../api

export const medicosAPI = {
  /**
   * Obtiene todos los médicos
   */
  getMedicos: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/medicos/?page=${page}` : "/medicos/" // Conditional URL with trailing slash
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetMedicos() // Mock data removed
  },

  /**
   * Crea un nuevo médico
   */
  createMedico: async (medicoData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/medicos/', medicoData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockCreateMedico(medicoData) // Mock data removed
  },

  /**
   * Actualiza un médico existente
   */
  updateMedico: async (id: string, medicoData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.put(`/medicos/${id}/`, medicoData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockUpdateMedico(id, medicoData) // Mock data removed
  },

  /**
   * Elimina un médico
   */
  deleteMedico: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/medicos/${id}/`) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockDeleteMedico(id) // Mock data removed
  },
}
