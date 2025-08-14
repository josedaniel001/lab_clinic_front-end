import { useEffect, useState } from "react"
import { configuracionAPI } from "@/api/configuracionAPI"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export function useConfiguracion() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    configuracionAPI.getConfiguracion()
      .then((data) => {
        if (mounted) setConfig(data)
      })
      .catch((err) => {
        if (mounted) setError("No se pudo cargar la configuración")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  // Construir la URL completa del logo si existe
  let logoUrl = null
  if (config?.logo) {
    if (config.logo.startsWith("http")) {
      logoUrl = config.logo
    } else {
      logoUrl = `${API_URL.replace(/\/$/, "")}/${config.logo.replace(/^\//, "")}`
    }
  }

  return { config, logoUrl, loading, error }
} 