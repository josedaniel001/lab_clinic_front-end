// Mock data imports removed
// import {
//   mockGetOrdenesPendientes,
//   mockGetOrdenesEnProceso,
//   mockGetOrdenesValidadas,
//   mockGetResultadosByOrden,
//   mockSaveResultados,
//   mockValidateResultados,
// } from "./mockData"
import api from "./api" // API instance imported from ../api

export const resultadosAPI = {
  /**
   * Obtiene las órdenes con estado pendiente
   */
  getOrdenesPendientes: async (page?: number,estado?:string) => {
    // En un entorno real, esto sería una llamada a la API
    const baseUrl = estado?`/ordenes/?estado=${estado}`:"/ordenes/?estado=PENDIENTE"
    const url = page ? `${baseUrl}&page=${page}` : baseUrl
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetOrdenesPendientes() // Mock data removed
  },

  /**
   * Obtiene las órdenes con estado en proceso
   */
  /**
   * Obtiene los resultados de una orden específica
   */
  getResultadosByOrden: async (ordenId: string, page?: number) => {
    // En un entorno real, esto sería una llamada a la API
    const baseUrl = `/resultados/ordenes/${ordenId}/resultados/`
    const url = page ? `${baseUrl}?page=${page}` : baseUrl
    const response = await api.get(url)
    return response.data

    // Simulación con datos de prueba
    // return mockGetResultadosByOrden(ordenId) // Mock data removed
  },

  /**
   * Guarda los resultados de una orden
   */
  saveResultados: async (detalleOrdenId: number, payload: any) => {
    console.log("RESULTADO: "+JSON.stringify(payload))
    console.log("ID ORDEN: "+detalleOrdenId)
    const response = await api.post(`/resultados/`, {
      detalle_orden_id: detalleOrdenId,
      observaciones: payload.observaciones || "",
      validado_por: payload.validado_por || null,
      fecha_resultado: payload.fecha_resultado || null,
      fecha_validacion: payload.fecha_validacion || null,
      estado: payload.estado || "PENDIENTE",
      prioridad: payload.prioridad || "normal",
      valores: payload.valores // array de parámetros
    })
    return response.data
  },
  

  /**
   * Valida los resultados de una orden
   */
  validateResultados: async (resultadoId: string, resultadosData: any, usuarioId: string) => {
    // Aquí resultadoId es el ID del resultado principal para construir la ruta detail=True
    console.log("Resultado ingresados %s, usuario %s",resultadoId,usuarioId," Datos"+JSON.stringify(resultadosData))
    const response = await api.put(`/resultados/${resultadoId}/validar/`, {
      resultados: resultadosData,
      id_usuario: usuarioId,
    })
    return response.data
  },
}
