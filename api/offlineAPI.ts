import api from "./api"
import { offlineStorage } from "@/utils/offlineStorage"

interface OfflineAPIOptions {
  cacheKey?: string
  cacheExpiry?: number // minutos
  allowOffline?: boolean
}

class OfflineAPI {
  // GET con cache automático
  async get(endpoint: string, options: OfflineAPIOptions = {}): Promise<any> {
    const { cacheKey = endpoint, cacheExpiry = 30, allowOffline = true } = options

    try {
      // Intentar obtener datos del servidor
      const response = await api.get(endpoint)

      // Cachear la respuesta
      if (allowOffline) {
        await offlineStorage.cacheData(cacheKey, response.data, cacheExpiry)
      }

      return response.data
    } catch (error) {
      // Si falla y estamos offline, usar cache
      if (!navigator.onLine && allowOffline) {
        const cachedData = await offlineStorage.getCachedData(cacheKey)
        if (cachedData) {
          return cachedData
        }
      }
      throw error
    }
  }

  // POST con queue offline
  async post(endpoint: string, data: any, options: OfflineAPIOptions = {}): Promise<any> {
    const { allowOffline = true } = options

    try {
      // Intentar enviar al servidor
      const response = await api.post(endpoint, data)
      return response.data
    } catch (error) {
      // Si falla y estamos offline, guardar en queue
      if (!navigator.onLine && allowOffline) {
        await offlineStorage.addPendingOperation({
          type: "CREATE",
          endpoint,
          data,
        })

        // Retornar un ID temporal para la UI
        return {
          id: `temp_${Date.now()}`,
          ...data,
          _isOffline: true,
          _tempId: true,
        }
      }
      throw error
    }
  }

  // PUT con queue offline
  async put(endpoint: string, data: any, options: OfflineAPIOptions = {}): Promise<any> {
    const { allowOffline = true } = options

    try {
      const response = await api.put(endpoint, data)
      return response.data
    } catch (error) {
      if (!navigator.onLine && allowOffline) {
        await offlineStorage.addPendingOperation({
          type: "UPDATE",
          endpoint,
          data,
        })

        return { ...data, _isOffline: true }
      }
      throw error
    }
  }

  // DELETE con queue offline
  async delete(endpoint: string, options: OfflineAPIOptions = {}): Promise<any> {
    const { allowOffline = true } = options

    try {
      const response = await api.delete(endpoint)
      return response.data
    } catch (error) {
      if (!navigator.onLine && allowOffline) {
        await offlineStorage.addPendingOperation({
          type: "DELETE",
          endpoint,
          data: null,
        })

        return { success: true, _isOffline: true }
      }
      throw error
    }
  }
}

export const offlineAPI = new OfflineAPI()
