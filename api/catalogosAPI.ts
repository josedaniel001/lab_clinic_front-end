// src/api/catalogosAPI.ts
import api from "./api" // tu archivo base donde defines axios u otra config

export const catalogosAPI = {
  async getPaises() {
    const res = await api.get("localizacion/paises/")
    return res.data
  },

  async getDepartamentos(paisId?: number) {
    const res = await api.get("localizacion/departamentos/")
    const all = res.data
    if (paisId) {
      return all.filter((d: any) => d.pais.id === paisId)
    }
    return all
  },

  async getMunicipios(departamentoId?: number) {
    const res = await api.get("localizacion/municipios/")
    const all = res.data
    if (departamentoId) {
      return all.filter((m: any) => m.departamento.id === departamentoId)
    }
    return all
  }
}
