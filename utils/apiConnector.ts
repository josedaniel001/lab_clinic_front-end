import api from "@/api/api"

interface APIStatus {
  isConnected: boolean
  version?: string
  message: string
  endpoints?: string[]
}

class APIConnector {
  private static instance: APIConnector
  private connectionStatus: APIStatus = {
    isConnected: false,
    message: "No verificado",
  }

  static getInstance(): APIConnector {
    if (!APIConnector.instance) {
      APIConnector.instance = new APIConnector()
    }
    return APIConnector.instance
  }

  // Verificar si la API está disponible
  async checkAPIHealth(): Promise<APIStatus> {
    try {
      console.log("🔍 Verificando conexión con API...")

      // Intentar conectar con el endpoint de salud
      const response = await api.get("/health", { timeout: 5000 })

      this.connectionStatus = {
        isConnected: true,
        version: response.data.version || "1.0.0",
        message: "Conectado exitosamente",
        endpoints: response.data.endpoints || [],
      }

      console.log("✅ API conectada:", this.connectionStatus)
      return this.connectionStatus
    } catch (error: any) {
      console.log("❌ Error conectando con API:", error.message)

      // Intentar con endpoint alternativo
      try {
        const response = await api.get("/", { timeout: 3000 })

        this.connectionStatus = {
          isConnected: true,
          message: "Conectado (endpoint alternativo)",
          version: "Desconocida",
        }

        console.log("✅ API conectada (alternativo):", this.connectionStatus)
        return this.connectionStatus
      } catch (altError: any) {
        this.connectionStatus = {
          isConnected: false,
          message: `Error: ${error.message || "API no disponible"}`,
        }

        console.log("❌ API no disponible:", this.connectionStatus)
        return this.connectionStatus
      }
    }
  }

  // Obtener endpoints disponibles
  async getAvailableEndpoints(): Promise<string[]> {
    try {
      const response = await api.get("/endpoints")
      return response.data.endpoints || []
    } catch (error) {
      console.log("No se pudieron obtener los endpoints")
      return []
    }
  }

  // Probar endpoint específico
  async testEndpoint(endpoint: string): Promise<boolean> {
    try {
      await api.get(endpoint, { timeout: 3000 })
      return true
    } catch (error) {
      return false
    }
  }

  // Obtener estado actual
  getConnectionStatus(): APIStatus {
    return this.connectionStatus
  }

  // Verificar endpoints comunes del laboratorio
  async checkLabEndpoints(): Promise<Record<string, boolean>> {
    const endpoints = [
      "/auth/login",
      "/usuarios",
      "/roles",
      "/pacientes",
      "/medicos",
      "/ordenes",
      "/resultados",
      "/examenes",
    ]

    const results: Record<string, boolean> = {}

    for (const endpoint of endpoints) {
      results[endpoint] = await this.testEndpoint(endpoint)
    }

    return results
  }
}

export const apiConnector = APIConnector.getInstance()
