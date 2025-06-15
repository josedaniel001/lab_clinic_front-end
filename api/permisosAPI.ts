import { mockGetPermisos, mockGetPermisosByRol, mockSavePermisos } from "./mockData"

export const permisosAPI = {
  /**
   * Obtiene todos los permisos
   */
  getPermisos: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/permisos')
    // return response.data

    // Simulación con datos de prueba
    return mockGetPermisos()
  },

  /**
   * Obtiene los permisos de un rol específico
   */
  getPermisosByRol: async (rolId: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get(`/roles/${rolId}/permisos`)
    // return response.data

    // Simulación con datos de prueba
    return mockGetPermisosByRol(rolId)
  },

  /**
   * Guarda los permisos de un rol
   */
  savePermisos: async (rolId: string, permisosData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post(`/roles/${rolId}/permisos`, permisosData)
    // return response.data

    // Simulación con datos de prueba
    return mockSavePermisos(rolId, permisosData)
  },
}
