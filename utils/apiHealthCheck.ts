import api from "@/api/api"

interface APIHealthStatus {
  isAPIAvailable: boolean
  lastSuccessfulCall: Date | null
  lastFailedCall: Date | null
  consecutiveFailures: number
  responseTime: number | null
  errorMessage: string | null
}

class APIHealthChecker {
  private healthStatus: APIHealthStatus = {
    isAPIAvailable: true,
    lastSuccessfulCall: null,
    lastFailedCall: null,
    consecutiveFailures: 0,
    responseTime: null,
    errorMessage: null,
  }

  private healthCheckInterval: NodeJS.Timeout | null = null
  private callbacks: ((status: APIHealthStatus) => void)[] = []

  // Iniciar monitoreo de salud de la API
  startHealthCheck(intervalMs = 30000) {
    this.stopHealthCheck()

    // Verificación inicial
    this.checkAPIHealth()

    // Verificación periódica
    this.healthCheckInterval = setInterval(() => {
      this.checkAPIHealth()
    }, intervalMs)
  }

  // Detener monitoreo
  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  // Verificar salud de la API
  async checkAPIHealth(): Promise<APIHealthStatus> {
    const startTime = Date.now()

    try {
      // Endpoint simple para verificar conectividad
      const response = await api.get("/health", { timeout: 5000 })
      const responseTime = Date.now() - startTime

      this.healthStatus = {
        isAPIAvailable: true,
        lastSuccessfulCall: new Date(),
        lastFailedCall: this.healthStatus.lastFailedCall,
        consecutiveFailures: 0,
        responseTime,
        errorMessage: null,
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime

      this.healthStatus = {
        isAPIAvailable: false,
        lastSuccessfulCall: this.healthStatus.lastSuccessfulCall,
        lastFailedCall: new Date(),
        consecutiveFailures: this.healthStatus.consecutiveFailures + 1,
        responseTime,
        errorMessage: this.getErrorMessage(error),
      }
    }

    // Notificar a los callbacks
    this.callbacks.forEach((callback) => callback(this.healthStatus))

    return this.healthStatus
  }

  // Obtener mensaje de error legible
  private getErrorMessage(error: any): string {
    if (error.code === "NETWORK_ERROR") return "Error de red"
    if (error.code === "TIMEOUT") return "Timeout de conexión"
    if (error.response?.status === 500) return "Error interno del servidor"
    if (error.response?.status === 503) return "Servicio no disponible"
    if (error.response?.status >= 400) return `Error HTTP ${error.response.status}`
    return error.message || "Error desconocido"
  }

  // Suscribirse a cambios de estado
  onHealthChange(callback: (status: APIHealthStatus) => void) {
    this.callbacks.push(callback)

    // Retornar función para desuscribirse
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback)
    }
  }

  // Obtener estado actual
  getHealthStatus(): APIHealthStatus {
    return { ...this.healthStatus }
  }

  // Verificar si la API está disponible
  isAPIHealthy(): boolean {
    return this.healthStatus.isAPIAvailable
  }

  // Forzar verificación inmediata
  async forceHealthCheck(): Promise<APIHealthStatus> {
    return await this.checkAPIHealth()
  }
}

export const apiHealthChecker = new APIHealthChecker()
