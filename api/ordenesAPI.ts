import { mockGetOrdenes, mockCreateOrden, mockDeleteOrden } from "./mockData"

export const ordenesAPI = {
  /**
   * Obtiene todas las órdenes
   */
  getOrdenes: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/ordenes')
    // return response.data

    // Simulación con datos de prueba
    return mockGetOrdenes()
  },

  /**
   * Crea una nueva orden
   */
  createOrden: async (ordenData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/ordenes', ordenData)
    // return response.data

    // Simulación con datos de prueba
    return mockCreateOrden(ordenData)
  },

  /**
   * Elimina una orden
   */
  deleteOrden: async (id: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.delete(`/ordenes/${id}`)
    // return response.data

    // Simulación con datos de prueba
    return mockDeleteOrden(id)
  },
}
