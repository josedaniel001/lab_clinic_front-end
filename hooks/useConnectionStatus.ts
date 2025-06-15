"use client"

import { useState, useEffect } from "react"
import { useNetworkStatus } from "./useNetworkStatus"
import { apiHealthChecker, type APIHealthStatus } from "@/utils/apiHealthCheck"

export interface ConnectionStatus {
  // Estado de red general
  isOnline: boolean
  isSlowConnection: boolean

  // Estado específico de la API
  isAPIAvailable: boolean
  apiResponseTime: number | null
  apiErrorMessage: string | null
  consecutiveAPIFailures: number

  // Estado combinado
  canUseAPI: boolean
  shouldUseOfflineMode: boolean

  // Timestamps
  lastAPISuccess: Date | null
  lastAPIFailure: Date | null
  lastNetworkChange: Date | null
}

export function useConnectionStatus() {
  const networkStatus = useNetworkStatus()
  const [apiHealth, setApiHealth] = useState<APIHealthStatus>({
    isAPIAvailable: true,
    lastSuccessfulCall: null,
    lastFailedCall: null,
    consecutiveFailures: 0,
    responseTime: null,
    errorMessage: null,
  })

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
    isAPIAvailable: true,
    apiResponseTime: null,
    apiErrorMessage: null,
    consecutiveAPIFailures: 0,
    canUseAPI: true,
    shouldUseOfflineMode: false,
    lastAPISuccess: null,
    lastAPIFailure: null,
    lastNetworkChange: null,
  })

  useEffect(() => {
    // Iniciar monitoreo de salud de la API
    apiHealthChecker.startHealthCheck(15000) // Cada 15 segundos

    // Suscribirse a cambios de salud de la API
    const unsubscribe = apiHealthChecker.onHealthChange((health) => {
      setApiHealth(health)
    })

    // Verificación inicial
    apiHealthChecker.forceHealthCheck()

    return () => {
      unsubscribe()
      apiHealthChecker.stopHealthCheck()
    }
  }, [])

  useEffect(() => {
    // Actualizar estado combinado cuando cambie la red o la API
    const canUseAPI = networkStatus.isOnline && apiHealth.isAPIAvailable
    const shouldUseOfflineMode = !canUseAPI

    setConnectionStatus({
      isOnline: networkStatus.isOnline,
      isSlowConnection: networkStatus.isSlowConnection,
      isAPIAvailable: apiHealth.isAPIAvailable,
      apiResponseTime: apiHealth.responseTime,
      apiErrorMessage: apiHealth.errorMessage,
      consecutiveAPIFailures: apiHealth.consecutiveFailures,
      canUseAPI,
      shouldUseOfflineMode,
      lastAPISuccess: apiHealth.lastSuccessfulCall,
      lastAPIFailure: apiHealth.lastFailedCall,
      lastNetworkChange: networkStatus.lastOnline || networkStatus.lastOffline,
    })
  }, [networkStatus, apiHealth])

  // Función para forzar verificación
  const recheckConnection = async () => {
    await apiHealthChecker.forceHealthCheck()
  }

  return {
    ...connectionStatus,
    recheckConnection,
  }
}
