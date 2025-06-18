// import { mockGetPacientes, mockCreatePaciente, mockUpdatePaciente, mockDeletePaciente } from "./mockData" // Mock data removed
import api from "./api" // Assuming api is imported from a local file

export const pacientesAPI = {
  /**
   * Obtiene todos los pacientes
   */
  getPacientes: async (page?: number) => { // Added optional page parameter
    // En un entorno real, esto sería una llamada a la API
    const url = page ? `/pacientes/?page=${page}` : "/pacientes/" // Conditional URL
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetPacientes() // Mock data removed
  },

  /**
   * Crea un nuevo paciente
   */
  createPaciente: async (pacienteData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/pacientes/', pacienteData) // Added / at the end of the URL
    return response.data

    // Simulación con datos de prueba
    // return mockCreatePaciente(pacienteData) // Mock data removed
  },

  /**
   * Actualiza un paciente existente
   */
  updatePaciente: async (id: string, pacienteData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.put(`/pacientes/${id}/`, pacienteData) // Added / at the end of the URL
    return response.data

    // Simulación con datos de prueba
    // return mockUpdatePaciente(id, pacienteData) // Mock data removed
  },

  /**
   * Elimina un paciente
   */
  deletePaciente: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/pacientes/${id}/`) // Added / at the end of the URL
    return response.data

    // Simulación con datos de prueba
    // return mockDeletePaciente(id) // Mock data removed
  },
}
