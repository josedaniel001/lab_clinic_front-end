"use client"

import { useState, useEffect } from "react"

export interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
  lastOnline: Date | null
  lastOffline: Date | null
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: "unknown",
    lastOnline: null,
    lastOffline: null,
  })

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      setNetworkStatus((prev) => ({
        ...prev,
        isOnline,
        isSlowConnection: connection
          ? connection.effectiveType === "slow-2g" || connection.effectiveType === "2g"
          : false,
        connectionType: connection ? connection.effectiveType : "unknown",
        lastOnline: isOnline && !prev.isOnline ? new Date() : prev.lastOnline,
        lastOffline: !isOnline && prev.isOnline ? new Date() : prev.lastOffline,
      }))
    }

    const handleOnline = () => updateNetworkStatus()
    const handleOffline = () => updateNetworkStatus()

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Verificar conexión cada 30 segundos
    const intervalId = setInterval(updateNetworkStatus, 30000)

    // Verificación inicial
    updateNetworkStatus()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(intervalId)
    }
  }, [])

  return networkStatus
}
