import api from "./api"
import { offlineStorage } from "@/utils/offlineStorage"
import { apiHealthChecker } from "@/utils/apiHealthCheck"

interface SmartAPIOptions {
  cacheKey?: string
  cacheExpiry?: number // minutos
  forceOffline?: boolean
  retryAttempts?: number
  timeout?: number
}

class SmartOfflineAPI {
  private requestQueue: Map<string, Promise<any>> = new Map()

  async get(endpoint: string, options: SmartAPIOptions = {}): Promise<any> {
    const { cacheKey = endpoint, cacheExpiry = 30, forceOffline = false, retryAttempts = 2, timeout = 10000 } = options

    if (forceOffline || !apiHealthChecker.isAPIHealthy()) {
      const cachedData = await offlineStorage.getCachedData(cacheKey)
      if (cachedData) {
        console.log(`📱 Usando datos offline para: ${endpoint}`)
        return { ...cachedData, _fromCache: true }
      }
      throw new Error(`No hay datos offline disponibles para ${endpoint}`)
    }

    const requestKey = `GET:${endpoint}`
    if (this.requestQueue.has(requestKey)) {
      return await this.requestQueue.get(requestKey)!
    }

    const requestPromise = this.executeGetRequest(endpoint, cacheKey, cacheExpiry, retryAttempts, timeout)
    this.requestQueue.set(requestKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.requestQueue.delete(requestKey)
    }
  }

  private async executeGetRequest(
    endpoint: string,
    cacheKey: string,
    cacheExpiry: number,
    retryAttempts: number,
    timeout: number,
  ): Promise<any> {
    let lastError: any

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`🌐 Intentando conectar con API: ${endpoint} (intento ${attempt}/${retryAttempts})`)

        const response = await api.get(endpoint, { timeout })
        await offlineStorage.cacheData(cacheKey, response.data, cacheExpiry)

        console.log(`✅ Datos obtenidos de API: ${endpoint}`)
        return response.data
      } catch (error: any) {
        lastError = error
        console.log(`❌ Error en API (intento ${attempt}): ${error.message}`)

        if (attempt === retryAttempts) {
          const cachedData = await offlineStorage.getCachedData(cacheKey)
          if (cachedData) {
            console.log(`📱 Fallback a cache offline: ${endpoint}`)
            return { ...cachedData, _fromCache: true, _apiError: error.message }
          }
        }

        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    throw lastError
  }

  async post(endpoint: string, data: any, options: SmartAPIOptions = {}): Promise<any> {
    const { forceOffline = false, retryAttempts = 1, timeout = 15000 } = options

    if (forceOffline || !apiHealthChecker.isAPIHealthy()) {
      console.log(`📱 Guardando operación offline: POST ${endpoint}`)

      await offlineStorage.addPendingOperation({
        type: "CREATE",
        endpoint,
        data,
        error: null
      })

      return {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        _isOffline: true,
        _pendingSync: true,
        createdAt: new Date().toISOString(),
      }
    }

    return await this.executePostRequest(endpoint, data, retryAttempts, timeout)
  }

  private async executePostRequest(endpoint: string, data: any, retryAttempts: number, timeout: number): Promise<any> {
    let lastError: any

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`🌐 Enviando a API: POST ${endpoint} (intento ${attempt}/${retryAttempts})`)

        const response = await api.post(endpoint, data, { timeout })
        console.log(`✅ Datos enviados a API: POST ${endpoint}`)
        return response.data
      } catch (error: any) {
        lastError = error
        console.log(`❌ Error enviando a API (intento ${attempt}): ${error.message}`)

        if (attempt === retryAttempts) {
          console.log(`📱 Guardando en queue offline: POST ${endpoint}`)

          await offlineStorage.addPendingOperation({
            type: "CREATE",
            endpoint,
            data,
            error: error.message
          })

          return {
            id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            _isOffline: true,
            _pendingSync: true,
            _apiError: error.message,
            createdAt: new Date().toISOString(),
          }
        }

        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
        }
      }
    }

    throw lastError
  }

  async put(endpoint: string, data: any, options: SmartAPIOptions = {}): Promise<any> {
    const { forceOffline = false, retryAttempts = 1, timeout = 15000 } = options

    if (forceOffline || !apiHealthChecker.isAPIHealthy()) {
      console.log(`📱 Guardando actualización offline: PUT ${endpoint}`)

      await offlineStorage.addPendingOperation({
        type: "UPDATE",
        endpoint,
        data,
        error: null
      })

      return { ...data, _isOffline: true, _pendingSync: true }
    }

    return await this.executePutRequest(endpoint, data, retryAttempts, timeout)
  }

  private async executePutRequest(endpoint: string, data: any, retryAttempts: number, timeout: number): Promise<any> {
    let lastError: any

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await api.put(endpoint, data, { timeout })
        return response.data
      } catch (error: any) {
        lastError = error

        if (attempt === retryAttempts) {
          await offlineStorage.addPendingOperation({
            type: "UPDATE",
            endpoint,
            data,
            error: error.message
          })

          return { ...data, _isOffline: true, _pendingSync: true, _apiError: error.message }
        }

        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
        }
      }
    }

    throw lastError
  }

  async delete(endpoint: string, options: SmartAPIOptions = {}): Promise<any> {
    const { forceOffline = false, retryAttempts = 1, timeout = 10000 } = options

    if (forceOffline || !apiHealthChecker.isAPIHealthy()) {
      console.log(`📱 Guardando eliminación offline: DELETE ${endpoint}`)

      await offlineStorage.addPendingOperation({
        type: "DELETE",
        endpoint,
        data: null,
        error: null
      })

      return { success: true, _isOffline: true, _pendingSync: true }
    }

    return await this.executeDeleteRequest(endpoint, retryAttempts, timeout)
  }

  private async executeDeleteRequest(endpoint: string, retryAttempts: number, timeout: number): Promise<any> {
    let lastError: any

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await api.delete(endpoint, { timeout })
        return response.data
      } catch (error: any) {
        lastError = error

        if (attempt === retryAttempts) {
          await offlineStorage.addPendingOperation({
            type: "DELETE",
            endpoint,
            data: null,
            error: error.message
          })

          return { success: true, _isOffline: true, _pendingSync: true, _apiError: error.message }
        }

        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    throw lastError
  }

  async checkAPIStatus(): Promise<boolean> {
    return apiHealthChecker.isAPIHealthy()
  }

  async forceAPICheck(): Promise<void> {
    await apiHealthChecker.forceHealthCheck()
  }
}

export const smartAPI = new SmartOfflineAPI()
