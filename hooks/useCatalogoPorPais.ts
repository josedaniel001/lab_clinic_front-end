// src/hooks/useCatalogosPorPais.ts
import { useEffect, useState } from "react"
import { catalogosAPI } from "@/api/catalogosAPI"

export function useCatalogosPorPais(paisId?: number, paisNombre?: string) {
  const [paises, setPaises] = useState<any[]>([])
  const [departamentos, setDepartamentos] = useState<any[]>([])
  const [municipios, setMunicipios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoading(true)
      try {
        const paisesData = await catalogosAPI.getPaises()
        setPaises(paisesData)

        let paisSeleccionadoId = paisId
        if (!paisSeleccionadoId && paisNombre) {
          const encontrado = paisesData.find((p) =>
            p.nombre.toLowerCase() === paisNombre.toLowerCase()
          )
          paisSeleccionadoId = encontrado?.id
        }

        if (!paisSeleccionadoId) {
          setDepartamentos([])
          setMunicipios([])
          setLoading(false)
          return
        }

        const departamentosData = await catalogosAPI.getDepartamentos(paisSeleccionadoId)
        setDepartamentos(departamentosData)

        const municipiosData = await catalogosAPI.getMunicipios()
        const filtrados = municipiosData.filter((m: any) =>
          departamentosData.some((d: any) => d.id === m.departamento.id)
        )
        setMunicipios(filtrados)
      } catch (error) {
        console.error("Error cargando catálogos:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarCatalogos()
  }, [paisId, paisNombre])

  return {
    paises,
    departamentos,
    municipios,
    loading,
  }
}
