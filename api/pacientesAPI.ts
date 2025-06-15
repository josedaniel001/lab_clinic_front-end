import { mockGetPacientes, mockCreatePaciente, mockUpdatePaciente, mockDeletePaciente } from "./mockData"

export const pacientesAPI = {
  /**
   * Obtiene todos los pacientes
   */
  getPacientes: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/pacientes')
    // return response.data

    // Simulación con datos de prueba
    return mockGetPacientes()
  },

  /**
   * Crea un nuevo paciente
   */
  createPaciente: async (pacienteData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/pacientes', pacienteData)
    // return response.data

    // Simulación con datos de prueba
    return mockCreatePaciente(pacienteData)
  },

  /**
   * Actualiza un paciente existente
   */
  updatePaciente: async (id: string, pacienteData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.put(`/pacientes/${id}`, pacienteData)
    // return response.data

    // Simulación con datos de prueba
    return mockUpdatePaciente(id, pacienteData)
  },

  /**
   * Elimina un paciente
   */
  deletePaciente: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.delete(`/pacientes/${id}`)
    // return response.data

    // Simulación con datos de prueba
    return mockDeletePaciente(id)
  },
}
