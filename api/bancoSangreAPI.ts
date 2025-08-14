import api from "./api" // tu archivo base donde defines axios u otra config

export const donantesAPI = {
    geDonantes: async (page?: number, limit?: number) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())

    const url = `/banco_sangre/donantes/?${params.toString()}`
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

    getMuestrasUnidades: async (page?: number, limite?: number, excludeEstados?: string[]) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limite) params.append("limit", limite.toString())
    if (excludeEstados && excludeEstados.length > 0) params.append("exclude_estado", excludeEstados.join(","))

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
    patchUnidad: async (id: string, data: any) => {
    const response = await api.patch(`/banco_sangre/unidades/${id}/`, data)
    return response.data
  },
  deleteUnidades: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.delete(`/banco_sangre/unidades/${id}/`) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return mockDeleteMedico(id) // Mock data removed
  },
   generarEtiquetaUnidad: async (id: number) => {
    const response = await api.get(`/banco_sangre/unidades/${id}/generar-etiqueta/`)
    return response.data  // { file_url: ... }
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
    },
     generarEtiquetasLote: async (id: number) => {
    const response = await api.get(`/banco_sangre/lotes/${id}/generar-etiquetas/`)
    return response.data  // { file_url: ... }
  },
}

export const salidaAPI = {
  createSalida: async (salidaData: any) => {
    const response = await api.post('/banco_sangre/salidas/', salidaData)
    return response.data
  },
  
  getSalidas: async (page?: number, limit?: number) => {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())

    const url = `/banco_sangre/salidas/?${params.toString()}`
    const response = await api.get(url)
    return response.data
  },
  
  updateSalida: async (id: string, salidaData: any) => {
    const response = await api.put(`/banco_sangre/salidas/${id}/`, salidaData)
    return response.data
  },
  
  deleteSalida: async (id: string) => {
    const response = await api.delete(`/banco_sangre/salidas/${id}/`)
    return response.data
  }
}

