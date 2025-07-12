import api from "./api" // tu archivo base donde defines axios u otra config

export const donantesAPI = {
    geDonantes: async () => {
    /*const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limite) params.append("limit", limite.toString())*/

    const url = `/banco_sangre/donantes/`
    const response = await api.get(url)
    return response.data
    },

    createDonante: async (pacienteData: any) => {
      // En un entorno real, esto sería una llamada a la API
      const response = await api.post('/banco_sangre/donantes/', pacienteData) // Added / at the end of the URL
      return response.data
  
      // Simulación con datos de prueba
      // return mockCreatePaciente(pacienteData) // Mock data removed
    },
  
    /**
     * Actualiza un paciente existente
     */
    updateDonante: async (id: string, pacienteData: any) => {
      // En un entorno real, esto sería una llamada a la API
      const response = await api.put(`/banco_sangre/donantes/${id}/`, pacienteData) // Added / at the end of the URL
      return response.data
  
      // Simulación con datos de prueba
      // return mockUpdatePaciente(id, pacienteData) // Mock data removed
    },
    deleteDonante: async (id: string) => {
      // En un entorno real, esto sería una llamada a la API
      const response = await api.delete(`/banco_sangre/donantes/${id}/`) // Added / at the end of the URL
      return response.data
  
      // Simulación con datos de prueba
      // return mockDeletePaciente(id) // Mock data removed
    },
}

export const muestraAPI = {

    getMuestrasUnidades: async (page?: number, limite?: number) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limite) params.append("limit", limite.toString())

    const url = `/banco_sangre/unidades/?${params.toString()}`
    const response = await api.get(url)
    return response.data
}, createUnidades: async (unidadesData: any | any[]) => {
    // ✅ El backend detecta automáticamente si es lista o solo un objeto
    const response = await api.post('/banco_sangre/unidades/', unidadesData)
    return response.data
  },
   updateUnidades: async (id: string, examenData: any) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.put(`/banco_sangre/unidades/${id}/`, examenData) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockUpdateMedico(id, medicoData) // Mock data removed
  },
  deleteUnidades: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/banco_sangre/unidades/${id}/`) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockDeleteMedico(id) // Mock data removed
  },
}

export const loteAPI = {
     geLotes: async () => {
    /*const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limite) params.append("limit", limite.toString())*/

    const url = `/banco_sangre/lotes/`
    const response = await api.get(url)
    return response.data
    }
}

