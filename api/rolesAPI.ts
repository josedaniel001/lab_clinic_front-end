import { mockGetRoles, mockCreateRol, mockUpdateRol, mockDeleteRol } from "./mockData"

export const rolesAPI = {
  /**
   * Obtiene todos los roles
   */
  getRoles: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/roles')
    // return response.data

    // Simulación con datos de prueba
    return mockGetRoles()
  },

  /**
   * Crea un nuevo rol
   */
  createRol: async (rolData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/roles', rolData)
    // return response.data

    // Simulación con datos de prueba
    return mockCreateRol(rolData)
  },

  /**
   * Actualiza un rol existente
   */
  updateRol: async (id: string, rolData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.put(`/roles/${id}`, rolData)
    // return response.data

    // Simulación con datos de prueba
    return mockUpdateRol(id, rolData)
  },

  /**
   * Elimina un rol
   */
  deleteRol: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.delete(`/roles/${id}`)
    // return response.data

    // Simulación con datos de prueba
    return mockDeleteRol(id)
  },
}
