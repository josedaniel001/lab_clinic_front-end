import { offlineStorage } from "./offlineStorage"
import api from "@/api/api"

interface SyncResult {
  success: boolean
  syncedOperations: number
  failedOperations: number
  errors: string[]
}

class SyncManager {
  private isSyncing = false
  private syncCallbacks: ((result: SyncResult) => void)[] = []

  // Registrar callback para eventos de sincronización
  onSync(callback: (result: SyncResult) => void) {
    this.syncCallbacks.push(callback)
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter((cb) => cb !== callback)
    }
  }

  // Sincronizar operaciones pendientes
  async syncPendingOperations(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, syncedOperations: 0, failedOperations: 0, errors: ["Sync already in progress"] }
    }

    this.isSyncing = true
    const result: SyncResult = {
      success: true,
      syncedOperations: 0,
      failedOperations: 0,
      errors: [],
    }

    try {
      const pendingOperations = await offlineStorage.getPendingOperations()

      for (const operation of pendingOperations) {
        try {
          await this.executeOperation(operation)
          await offlineStorage.removePendingOperation(operation.id)
          result.syncedOperations++
        } catch (error) {
          result.failedOperations++
          result.errors.push(`Failed to sync ${operation.type} ${operation.endpoint}: ${error}`)

          // Incrementar contador de reintentos
          operation.retryCount++

          // Si ha fallado muchas veces, eliminar la operación
          if (operation.retryCount >= 3) {
            await offlineStorage.removePendingOperation(operation.id)
            result.errors.push(`Operation ${operation.id} removed after 3 failed attempts`)
          }
        }
      }

      // Notificar a los callbacks
      this.syncCallbacks.forEach((callback) => callback(result))
    } catch (error) {
      result.success = false
      result.errors.push(`Sync failed: ${error}`)
    } finally {
      this.isSyncing = false
    }

    return result
  }

  // Ejecutar una operación específica
  private async executeOperation(operation: any): Promise<any> {
    switch (operation.type) {
      case "CREATE":
        return await api.post(operation.endpoint, operation.data)
      case "UPDATE":
        return await api.put(operation.endpoint, operation.data)
      case "DELETE":
        return await api.delete(operation.endpoint)
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }

  // Verificar si hay operaciones pendientes
  async hasPendingOperations(): Promise<boolean> {
    const operations = await offlineStorage.getPendingOperations()
    return operations.length > 0
  }

  // Obtener número de operaciones pendientes
  async getPendingOperationsCount(): Promise<number> {
    const operations = await offlineStorage.getPendingOperations()
    return operations.length
  }
}

export const syncManager = new SyncManager()
