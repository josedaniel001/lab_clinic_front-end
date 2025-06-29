// src/api/configuracionAPI.ts
import api from "./api"

export const configuracionAPI = {
    getConfiguracion: async () => {
        const response = await api.get(`/configuracion/1/`)
        return response.data
      },
      
      updateConfiguracion: async (formData: FormData) => {
        // ⚠️ Si ya recibes FormData, no recrees uno
        console.log("[updateConfiguracion] Datos a enviar:")
        for (const pair of formData.entries()) {
          console.log(pair[0] + ": " + pair[1])
        }
      
        const response = await api.patch(`/configuracion/1/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
      },
        async saveConfiguracion(data: any) {
            if (data.id) {
            const res = await api.put(`/configuracion/${data.id}/`, data)
            return res.data
            } else {
            const res = await api.post("/configuracion/", data)
            return res.data
            }
        }
}
