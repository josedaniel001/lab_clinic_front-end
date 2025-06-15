"use client"

import { useState, useEffect } from "react"
import { offlineAPI } from "@/api/offlineAPI"
import { useNetworkStatus } from "./useNetworkStatus"
import { useNotification } from "./useNotification"

interface UseOfflineAPIOptions {
  cacheKey?: string
  cacheExpiry?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useOfflineAPI<T = any>(endpoint: string, options: UseOfflineAPIOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  const networkStatus = useNetworkStatus()
  const { showNotification } = useNotification()

  const {
    cacheKey = endpoint,
    cacheExpiry = 30,
    autoRefresh = true,
    refreshInterval = 60000, // 1 minuto
  } = options

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    try {
      const result = await offlineAPI.get(endpoint, {
        cacheKey,
        cacheExpiry,
        allowOffline: true,
      })

      setData(result)
      setIsFromCache(!networkStatus.isOnline)

      if (!networkStatus.isOnline) {
        showNotification("Mostrando datos guardados (sin conexión)", "info")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      showNotification("Error al cargar datos", "error")
    } finally {
      setLoading(false)
    }
  }

  const createData = async (newData: any) => {
    try {
      const result = await offlineAPI.post(endpoint, newData)

      if (result._isOffline) {
        showNotification("Datos guardados. Se sincronizarán cuando haya conexión", "warning")
      } else {
        showNotification("Datos guardados correctamente", "success")
      }

      // Actualizar datos locales
      if (Array.isArray(data)) {
        setData([...data, result] as T)
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar"
      showNotification(message, "error")
      throw err
    }
  }

  const updateData = async (id: string, updatedData: any) => {
    try {
      const result = await offlineAPI.put(`${endpoint}/${id}`, updatedData)

      if (result._isOffline) {
        showNotification("Cambios guardados. Se sincronizarán cuando haya conexión", "warning")
      } else {
        showNotification("Datos actualizados correctamente", "success")
      }

      // Actualizar datos locales
      if (Array.isArray(data)) {
        setData(data.map((item: any) => (item.id === id ? { ...item, ...updatedData } : item)) as T)
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar"
      showNotification(message, "error")
      throw err
    }
  }

  const deleteData = async (id: string) => {
    try {
      const result = await offlineAPI.delete(`${endpoint}/${id}`)

      if (result._isOffline) {
        showNotification("Eliminación programada. Se ejecutará cuando haya conexión", "warning")
      } else {
        showNotification("Datos eliminados correctamente", "success")
      }

      // Actualizar datos locales
      if (Array.isArray(data)) {
        setData(data.filter((item: any) => item.id !== id) as T)
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar"
      showNotification(message, "error")
      throw err
    }
  }

  const refresh = () => fetchData(false)

  // Cargar datos iniciales
  useEffect(() => {
    fetchData()
  }, [endpoint])

  // Auto-refresh cuando se recupera la conexión
  useEffect(() => {
    if (networkStatus.isOnline && isFromCache) {
      fetchData(false)
    }
  }, [networkStatus.isOnline])

  // Auto-refresh periódico
  useEffect(() => {
    if (!autoRefresh || !networkStatus.isOnline) return

    const interval = setInterval(() => {
      fetchData(false)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, networkStatus.isOnline])

  return {
    data,
    loading,
    error,
    isFromCache,
    isOnline: networkStatus.isOnline,
    refresh,
    create: createData,
    update: updateData,
    delete: deleteData,
  }
}
