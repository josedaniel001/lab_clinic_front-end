// Sistema de almacenamiento offline con IndexedDB
interface OfflineOperation {
  id: string
  type: "CREATE" | "UPDATE" | "DELETE"
  endpoint: string
  data: any
  timestamp: number
  retryCount: number
}

interface CachedData {
  key: string
  data: any
  timestamp: number
  expiry?: number
}

class OfflineStorageManager {
  private dbName = "labofutura_offline"
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Store para operaciones pendientes
        if (!db.objectStoreNames.contains("pendingOperations")) {
          const operationsStore = db.createObjectStore("pendingOperations", { keyPath: "id" })
          operationsStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        // Store para datos cacheados
        if (!db.objectStoreNames.contains("cachedData")) {
          const cacheStore = db.createObjectStore("cachedData", { keyPath: "key" })
          cacheStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        // Store para configuración offline
        if (!db.objectStoreNames.contains("offlineConfig")) {
          db.createObjectStore("offlineConfig", { keyPath: "key" })
        }
      }
    })
  }

  // Guardar operación pendiente
  async addPendingOperation(operation: Omit<OfflineOperation, "id" | "timestamp" | "retryCount">): Promise<void> {
    if (!this.db) await this.init()

    const fullOperation: OfflineOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pendingOperations"], "readwrite")
      const store = transaction.objectStore("pendingOperations")
      const request = store.add(fullOperation)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Obtener operaciones pendientes
  async getPendingOperations(): Promise<OfflineOperation[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pendingOperations"], "readonly")
      const store = transaction.objectStore("pendingOperations")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Eliminar operación pendiente
  async removePendingOperation(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pendingOperations"], "readwrite")
      const store = transaction.objectStore("pendingOperations")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Cachear datos
  async cacheData(key: string, data: any, expiryMinutes?: number): Promise<void> {
    if (!this.db) await this.init()

    const cachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : undefined,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readwrite")
      const store = transaction.objectStore("cachedData")
      const request = store.put(cachedData)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Obtener datos cacheados
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readonly")
      const store = transaction.objectStore("cachedData")
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }

        // Verificar si ha expirado
        if (result.expiry && Date.now() > result.expiry) {
          this.removeCachedData(key)
          resolve(null)
          return
        }

        resolve(result.data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Eliminar datos cacheados
  async removeCachedData(key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readwrite")
      const store = transaction.objectStore("cachedData")
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Limpiar cache expirado
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readwrite")
      const store = transaction.objectStore("cachedData")
      const request = store.getAll()

      request.onsuccess = () => {
        const allData = request.result
        const now = Date.now()

        allData.forEach((item) => {
          if (item.expiry && now > item.expiry) {
            store.delete(item.key)
          }
        })
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Limpiar todo el cache
  async clearAllCache(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cachedData"], "readwrite")
      const store = transaction.objectStore("cachedData")
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorageManager()
