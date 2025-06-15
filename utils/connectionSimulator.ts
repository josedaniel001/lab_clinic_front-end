interface SimulationScenario {
  id: string
  name: string
  description: string
  networkOnline: boolean
  apiAvailable: boolean
  apiResponseTime: number
  apiErrorType?: "timeout" | "server_error" | "network_error" | "rate_limit"
  intermittent?: boolean
  duration?: number // segundos
}

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: "normal",
    name: "🟢 Normal",
    description: "Conexión estable y API funcionando correctamente",
    networkOnline: true,
    apiAvailable: true,
    apiResponseTime: 150,
  },
  {
    id: "slow_connection",
    name: "🟡 Conexión Lenta",
    description: "Internet lento pero funcional",
    networkOnline: true,
    apiAvailable: true,
    apiResponseTime: 3000,
  },
  {
    id: "api_down",
    name: "🔴 API Caída",
    description: "Internet OK pero API no responde",
    networkOnline: true,
    apiAvailable: false,
    apiResponseTime: 0,
    apiErrorType: "server_error",
  },
  {
    id: "no_internet",
    name: "📵 Sin Internet",
    description: "Sin conexión a internet",
    networkOnline: false,
    apiAvailable: false,
    apiResponseTime: 0,
    apiErrorType: "network_error",
  },
  {
    id: "api_timeout",
    name: "⏱️ API Timeout",
    description: "API responde muy lento (timeout)",
    networkOnline: true,
    apiAvailable: false,
    apiResponseTime: 10000,
    apiErrorType: "timeout",
  },
  {
    id: "intermittent",
    name: "📶 Intermitente",
    description: "Conexión inestable que va y viene",
    networkOnline: true,
    apiAvailable: true,
    apiResponseTime: 500,
    intermittent: true,
    duration: 30,
  },
  {
    id: "rate_limited",
    name: "🚫 Rate Limited",
    description: "API bloqueando por exceso de requests",
    networkOnline: true,
    apiAvailable: false,
    apiResponseTime: 200,
    apiErrorType: "rate_limit",
  },
  {
    id: "recovering",
    name: "🔄 Recuperándose",
    description: "API volviendo online gradualmente",
    networkOnline: true,
    apiAvailable: true,
    apiResponseTime: 2000,
    intermittent: true,
    duration: 60,
  },
]

class ConnectionSimulator {
  private isSimulating = false
  private currentScenario: SimulationScenario | null = null
  private simulationTimer: NodeJS.Timeout | null = null
  private intermittentTimer: NodeJS.Timeout | null = null
  private callbacks: ((scenario: SimulationScenario | null) => void)[] = []

  // Iniciar simulación
  startSimulation(scenarioId: string) {
    const scenario = SIMULATION_SCENARIOS.find((s) => s.id === scenarioId)
    if (!scenario) {
      throw new Error(`Escenario no encontrado: ${scenarioId}`)
    }

    this.stopSimulation()
    this.isSimulating = true
    this.currentScenario = scenario

    console.log(`🎭 Iniciando simulación: ${scenario.name}`)

    // Aplicar el escenario inmediatamente
    this.applyScenario(scenario)

    // Si es intermitente, configurar alternancia
    if (scenario.intermittent) {
      this.startIntermittentSimulation(scenario)
    }

    // Si tiene duración, programar finalización
    if (scenario.duration) {
      this.simulationTimer = setTimeout(() => {
        this.stopSimulation()
      }, scenario.duration * 1000)
    }

    // Notificar callbacks
    this.notifyCallbacks()
  }

  // Detener simulación
  stopSimulation() {
    if (!this.isSimulating) return

    console.log("🎭 Deteniendo simulación")

    this.isSimulating = false
    this.currentScenario = null

    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer)
      this.simulationTimer = null
    }

    if (this.intermittentTimer) {
      clearInterval(this.intermittentTimer)
      this.intermittentTimer = null
    }

    // Restaurar estado normal
    this.applyScenario(SIMULATION_SCENARIOS[0]) // Normal

    this.notifyCallbacks()
  }

  // Aplicar escenario específico
  private applyScenario(scenario: SimulationScenario) {
    // Simular estado de red
    if (typeof window !== "undefined") {
      // Override navigator.onLine
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: scenario.networkOnline,
      })

      // Disparar eventos de red
      if (scenario.networkOnline) {
        window.dispatchEvent(new Event("online"))
      } else {
        window.dispatchEvent(new Event("offline"))
      }
    }

    // Configurar interceptor de API
    this.setupAPIInterceptor(scenario)
  }

  // Configurar interceptor para simular respuestas de API
  private setupAPIInterceptor(scenario: SimulationScenario) {
    // Guardar referencia original si no existe
    if (!(window as any).__originalFetch) {
      ;(window as any).__originalFetch = window.fetch
    }

    // Interceptor personalizado
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString()

      // Solo interceptar llamadas a nuestra API
      if (url.includes("/api/") || url.includes("localhost") || url.includes("labofutura")) {
        return this.simulateAPIResponse(url, scenario)
      }

      // Para otras URLs, usar fetch original
      return (window as any).__originalFetch(input, init)
    }
  }

  // Simular respuesta de API según escenario
  private async simulateAPIResponse(url: string, scenario: SimulationScenario): Promise<Response> {
    // Simular tiempo de respuesta
    await new Promise((resolve) => setTimeout(resolve, scenario.apiResponseTime))

    if (!scenario.apiAvailable) {
      // Simular diferentes tipos de error
      switch (scenario.apiErrorType) {
        case "timeout":
          throw new Error("Request timeout")
        case "server_error":
          return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            statusText: "Internal Server Error",
          })
        case "network_error":
          throw new Error("Network Error")
        case "rate_limit":
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429,
            statusText: "Too Many Requests",
          })
        default:
          throw new Error("API not available")
      }
    }

    // Simular respuesta exitosa
    const mockData = this.generateMockResponse(url)
    return new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
    })
  }

  // Generar respuesta mock según la URL
  private generateMockResponse(url: string) {
    if (url.includes("/health")) {
      return { status: "ok", timestamp: new Date().toISOString() }
    }

    if (url.includes("/pacientes")) {
      return [
        { id: 1, nombre: "Juan Pérez", cedula: "12345678" },
        { id: 2, nombre: "María García", cedula: "87654321" },
      ]
    }

    if (url.includes("/ordenes")) {
      return [{ id: 1, paciente_id: 1, estado: "pendiente", fecha: new Date().toISOString() }]
    }

    return { success: true, data: [], timestamp: new Date().toISOString() }
  }

  // Simulación intermitente
  private startIntermittentSimulation(scenario: SimulationScenario) {
    let isUp = true

    this.intermittentTimer = setInterval(() => {
      isUp = !isUp

      const intermittentScenario = {
        ...scenario,
        apiAvailable: isUp,
        networkOnline: isUp ? scenario.networkOnline : false,
      }

      console.log(`🎭 Intermitente: ${isUp ? "UP" : "DOWN"}`)
      this.applyScenario(intermittentScenario)
      this.notifyCallbacks()
    }, 5000) // Cambiar cada 5 segundos
  }

  // Suscribirse a cambios
  onScenarioChange(callback: (scenario: SimulationScenario | null) => void) {
    this.callbacks.push(callback)
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback)
    }
  }

  // Notificar callbacks
  private notifyCallbacks() {
    this.callbacks.forEach((callback) => callback(this.currentScenario))
  }

  // Getters
  isSimulationActive(): boolean {
    return this.isSimulating
  }

  getCurrentScenario(): SimulationScenario | null {
    return this.currentScenario
  }

  getAvailableScenarios(): SimulationScenario[] {
    return [...SIMULATION_SCENARIOS]
  }

  // Restaurar fetch original
  restoreOriginalFetch() {
    if ((window as any).__originalFetch) {
      window.fetch = (window as any).__originalFetch
      delete (window as any).__originalFetch
    }
  }
}

export const connectionSimulator = new ConnectionSimulator()
