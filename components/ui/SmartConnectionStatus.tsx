"use client"

import { useConnectionStatus } from "@/hooks/useConnectionStatus"
import { syncManager } from "@/utils/syncManager"
import { useState, useEffect } from "react"
import { WifiOff, ServerOff, FolderSyncIcon as Sync, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useNotification } from "@/hooks/useNotification"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SmartConnectionStatus() {
  const connectionStatus = useConnectionStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const { showNotification } = useNotification()

  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await syncManager.getPendingOperationsCount()
      setPendingCount(count)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-sync cuando la API vuelve a estar disponible
    if (connectionStatus.canUseAPI && pendingCount > 0) {
      handleAutoSync()
    }
  }, [connectionStatus.canUseAPI])

  const handleAutoSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      const result = await syncManager.syncPendingOperations()

      if (result.success && result.syncedOperations > 0) {
        showNotification(`🔄 Auto-sincronización: ${result.syncedOperations} operaciones sincronizadas`, "success")
      }

      setPendingCount(await syncManager.getPendingOperationsCount())
    } catch (error) {
      console.error("Error en auto-sincronización:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleManualSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      await connectionStatus.recheckConnection()

      const result = await syncManager.syncPendingOperations()

      if (result.success) {
        showNotification(`✅ Sincronización manual: ${result.syncedOperations} operaciones sincronizadas`, "success")
      } else {
        showNotification(
          `⚠️ Sincronización parcial: ${result.syncedOperations} exitosas, ${result.failedOperations} fallidas`,
          "warning",
        )
      }

      setPendingCount(await syncManager.getPendingOperationsCount())
    } catch (error) {
      showNotification("❌ Error durante la sincronización manual", "error")
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = () => {
    if (connectionStatus.canUseAPI) return "text-green-600"
    if (connectionStatus.isOnline && !connectionStatus.isAPIAvailable) return "text-orange-600"
    return "text-red-600"
  }

  const getStatusBg = () => {
    if (connectionStatus.canUseAPI) return "bg-green-50 border-green-200"
    if (connectionStatus.isOnline && !connectionStatus.isAPIAvailable) return "bg-orange-50 border-orange-200"
    return "bg-red-50 border-red-200"
  }

  const getStatusIcon = () => {
    if (connectionStatus.canUseAPI) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    if (connectionStatus.isOnline && !connectionStatus.isAPIAvailable) {
      return <ServerOff className="h-4 w-4 text-orange-600" />
    }
    return <WifiOff className="h-4 w-4 text-red-600" />
  }

  const getStatusText = () => {
    if (connectionStatus.canUseAPI) return "Sistema Online"
    if (connectionStatus.isOnline && !connectionStatus.isAPIAvailable) return "API No Disponible"
    return "Sin Conexión"
  }

  const getStatusDescription = () => {
    if (connectionStatus.canUseAPI) {
      return `Conectado al servidor • ${connectionStatus.apiResponseTime}ms`
    }
    if (connectionStatus.isOnline && !connectionStatus.isAPIAvailable) {
      return `Internet OK • Servidor: ${connectionStatus.apiErrorMessage}`
    }
    return "Trabajando en modo offline"
  }

  // Vista compacta para el header
  if (connectionStatus.canUseAPI && pendingCount === 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-green-600 cursor-help">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Online</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sistema funcionando correctamente</p>
            <p className="text-xs text-gray-500">Respuesta: {connectionStatus.apiResponseTime}ms</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Vista expandida cuando hay problemas o operaciones pendientes
  return (
    <Card className={`${getStatusBg()} shadow-sm`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>

                {connectionStatus.isSlowConnection && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    <Zap className="h-3 w-3 mr-1" />
                    Lento
                  </Badge>
                )}
              </div>

              <span className="text-xs text-gray-600">{getStatusDescription()}</span>

              {pendingCount > 0 && (
                <span className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {pendingCount} operaciones pendientes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                {pendingCount}
              </Badge>
            )}

            {(connectionStatus.canUseAPI || connectionStatus.isOnline) && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="h-7 px-2 text-xs"
              >
                {isSyncing ? <Sync className="h-3 w-3 animate-spin" /> : <Sync className="h-3 w-3" />}
                <span className="ml-1 hidden sm:inline">{isSyncing ? "Sync..." : "Sync"}</span>
              </Button>
            )}
          </div>
        </div>

        {connectionStatus.consecutiveAPIFailures > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span>{connectionStatus.consecutiveAPIFailures} fallos consecutivos del servidor</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
