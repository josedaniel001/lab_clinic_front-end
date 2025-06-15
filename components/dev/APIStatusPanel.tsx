"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, RefreshCw, Server, Wifi, WifiOff, Clock, Database } from "lucide-react"
import { apiConnector } from "@/utils/apiConnector"

interface APIStatusPanelProps {
  className?: string
}

export function APIStatusPanel({ className }: APIStatusPanelProps) {
  const [apiStatus, setApiStatus] = useState({
    isConnected: false,
    message: "Verificando...",
    version: undefined,
    endpoints: [],
  })
  const [endpointStatus, setEndpointStatus] = useState<Record<string, boolean>>({})
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkAPIStatus = async () => {
    setIsChecking(true)
    try {
      // Verificar estado general de la API
      const status = await apiConnector.checkAPIHealth()
      setApiStatus(status)

      // Verificar endpoints específicos del laboratorio
      const endpoints = await apiConnector.checkLabEndpoints()
      setEndpointStatus(endpoints)

      setLastCheck(new Date())
    } catch (error) {
      console.error("Error verificando API:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkAPIStatus()
  }, [])

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? "text-green-600" : "text-red-600"
  }

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Estado de la API
          {apiStatus.isConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado General */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(apiStatus.isConnected)}
            <span className={`font-medium ${getStatusColor(apiStatus.isConnected)}`}>
              {apiStatus.isConnected ? "Conectado" : "Desconectado"}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={checkAPIStatus} disabled={isChecking}>
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Verificar
          </Button>
        </div>

        {/* Información de la API */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">URL:</span>
            <span className="font-mono text-xs">http://localhost:8000/api</span>
          </div>

          {apiStatus.version && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Versión:</span>
              <Badge variant="outline">{apiStatus.version}</Badge>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estado:</span>
            <span className={getStatusColor(apiStatus.isConnected)}>{apiStatus.message}</span>
          </div>

          {lastCheck && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Última verificación:</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {lastCheck.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Estado de Endpoints */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Endpoints del Laboratorio
          </h4>

          <div className="space-y-2">
            {Object.entries(endpointStatus).map(([endpoint, isAvailable]) => (
              <div key={endpoint} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs">{endpoint}</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(isAvailable)}
                  <span className={getStatusColor(isAvailable)}>{isAvailable ? "OK" : "Error"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instrucciones */}
        {!apiStatus.isConnected && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h5 className="font-medium text-yellow-800 mb-2">⚠️ API no disponible</h5>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Verifica que tu backend esté corriendo en el puerto 8000</p>
              <p>• Asegúrate de que CORS esté configurado correctamente</p>
              <p>• Revisa que la URL de la API sea correcta</p>
            </div>
          </div>
        )}

        {apiStatus.isConnected && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">✅ API Conectada</h5>
            <p className="text-sm text-green-700">El sistema está listo para usar datos reales del backend.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
