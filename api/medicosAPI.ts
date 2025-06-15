import { mockGetMedicos, mockCreateMedico, mockUpdateMedico, mockDeleteMedico } from "./mockData"

export const medicosAPI = {
  /**
   * Obtiene todos los médicos
   */
  getMedicos: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/medicos')
    // return response.data

    // Simulación con datos de prueba
    return mockGetMedicos()
  },

  /**
   * Crea un nuevo médico
   */
  createMedico: async (medicoData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/medicos', medicoData)
    // return response.data

    // Simulación con datos de prueba
    return mockCreateMedico(medicoData)
  },

  /**
   * Actualiza un médico existente
   */
  updateMedico: async (id: string, medicoData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.put(`/medicos/${id}`, medicoData)
    // return response.data

    // Simulación con datos de prueba
    return mockUpdateMedico(id, medicoData)
  },

  /**
   * Elimina un médico
   */
  deleteMedico: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.delete(`/medicos/${id}`)
    // return response.data

    // Simulación con datos de prueba
    return mockDeleteMedico(id)
  },
}
