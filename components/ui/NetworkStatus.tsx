"use client"

import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { syncManager } from "@/utils/syncManager"
import { useState, useEffect } from "react"
import { Wifi, Cloud, CloudOff, FolderSyncIcon as Sync, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useNotification } from "@/hooks/useNotification"

export function NetworkStatus() {
  const networkStatus = useNetworkStatus()
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const { showNotification } = useNotification()

  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await syncManager.getPendingOperationsCount()
      setPendingCount(count)
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-sync cuando se recupera la conexión
    if (networkStatus.isOnline && pendingCount > 0) {
      handleSync()
    }
  }, [networkStatus.isOnline])

  const handleSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      const result = await syncManager.syncPendingOperations()

      if (result.success) {
        showNotification(`Sincronización completada: ${result.syncedOperations} operaciones sincronizadas`, "success")
      } else {
        showNotification(
          `Sincronización parcial: ${result.syncedOperations} exitosas, ${result.failedOperations} fallidas`,
          "warning",
        )
      }

      setPendingCount(await syncManager.getPendingOperationsCount())
    } catch (error) {
      showNotification("Error durante la sincronización", "error")
    } finally {
      setIsSyncing(false)
    }
  }

  if (networkStatus.isOnline && pendingCount === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Wifi className="h-4 w-4" />
        <span className="text-sm font-medium">En línea</span>
      </div>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {networkStatus.isOnline ? (
              <Cloud className="h-4 w-4 text-blue-600" />
            ) : (
              <CloudOff className="h-4 w-4 text-red-600" />
            )}

            <div className="flex flex-col">
              <span className="text-sm font-medium">{networkStatus.isOnline ? "En línea" : "Sin conexión"}</span>
              {pendingCount > 0 && <span className="text-xs text-gray-600">{pendingCount} operaciones pendientes</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {pendingCount}
              </Badge>
            )}

            {networkStatus.isOnline && pendingCount > 0 && (
              <Button size="sm" variant="outline" onClick={handleSync} disabled={isSyncing} className="h-8 px-2">
                {isSyncing ? <Sync className="h-3 w-3 animate-spin" /> : <Sync className="h-3 w-3" />}
                <span className="ml-1 text-xs">Sync</span>
              </Button>
            )}
          </div>
        </div>

        {networkStatus.isSlowConnection && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            <span>Conexión lenta detectada</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
