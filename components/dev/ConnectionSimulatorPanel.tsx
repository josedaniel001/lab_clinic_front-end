"use client"

import { useState, useEffect } from "react"
import { connectionSimulator, SIMULATION_SCENARIOS, type SimulationScenario } from "@/utils/connectionSimulator"
import { useConnectionStatus } from "@/hooks/useConnectionStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Square,
  Wifi,
  WifiOff,
  Server,
  ServerOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings,
  RotateCcw,
} from "lucide-react"

export function ConnectionSimulatorPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [currentSimulation, setCurrentSimulation] = useState<SimulationScenario | null>(null)
  const [autoMode, setAutoMode] = useState(false)
  const [autoTimer, setAutoTimer] = useState<NodeJS.Timeout | null>(null)

  const connectionStatus = useConnectionStatus()

  useEffect(() => {
    // Suscribirse a cambios de simulación
    const unsubscribe = connectionSimulator.onScenarioChange((scenario) => {
      setCurrentSimulation(scenario)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    // Modo automático: cambiar escenarios cada 30 segundos
    if (autoMode) {
      const scenarios = SIMULATION_SCENARIOS.filter((s) => s.id !== "normal")
      let currentIndex = 0

      const timer = setInterval(() => {
        const scenario = scenarios[currentIndex]
        connectionSimulator.startSimulation(scenario.id)
        currentIndex = (currentIndex + 1) % scenarios.length
      }, 30000)

      setAutoTimer(timer)
    } else {
      if (autoTimer) {
        clearInterval(autoTimer)
        setAutoTimer(null)
      }
    }

    return () => {
      if (autoTimer) {
        clearInterval(autoTimer)
      }
    }
  }, [autoMode])

  const handleStartSimulation = () => {
    if (selectedScenario) {
      connectionSimulator.startSimulation(selectedScenario)
    }
  }

  const handleStopSimulation = () => {
    connectionSimulator.stopSimulation()
    setAutoMode(false)
  }

  const handleQuickScenario = (scenarioId: string) => {
    connectionSimulator.startSimulation(scenarioId)
  }

  const getStatusIcon = (scenario: SimulationScenario) => {
    if (!scenario.networkOnline) return <WifiOff className="h-4 w-4 text-red-500" />
    if (!scenario.apiAvailable) return <ServerOff className="h-4 w-4 text-orange-500" />
    if (scenario.apiResponseTime > 2000) return <Clock className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusColor = (scenario: SimulationScenario) => {
    if (!scenario.networkOnline || !scenario.apiAvailable) return "destructive"
    if (scenario.apiResponseTime > 2000) return "secondary"
    return "default"
  }

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <>
      {/* Botón flotante para abrir el panel */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
          variant={currentSimulation ? "destructive" : "outline"}
          className="shadow-lg"
        >
          <Settings className="h-4 w-4 mr-2" />
          {currentSimulation ? "Simulando" : "Dev Tools"}
        </Button>
      </div>

      {/* Panel de simulación */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
          <Card className="shadow-xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Connection Simulator
                  </CardTitle>
                  <CardDescription>Simular diferentes estados de conexión</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Estado actual */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado Actual</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  {connectionStatus.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  {connectionStatus.isAPIAvailable ? (
                    <Server className="h-4 w-4 text-green-500" />
                  ) : (
                    <ServerOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">{connectionStatus.canUseAPI ? "Online" : "Offline"}</span>
                  {connectionStatus.apiResponseTime && (
                    <Badge variant="outline" className="text-xs">
                      {connectionStatus.apiResponseTime}ms
                    </Badge>
                  )}
                </div>
              </div>

              {/* Simulación activa */}
              {currentSimulation && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        Simulando: <strong>{currentSimulation.name}</strong>
                      </span>
                      <Button size="sm" variant="outline" onClick={handleStopSimulation} className="h-6 px-2 text-xs">
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Escenarios rápidos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Escenarios Rápidos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SIMULATION_SCENARIOS.slice(0, 6).map((scenario) => (
                    <Button
                      key={scenario.id}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickScenario(scenario.id)}
                      className="h-auto p-2 flex flex-col items-start gap-1"
                      disabled={currentSimulation?.id === scenario.id}
                    >
                      <div className="flex items-center gap-1 w-full">
                        {getStatusIcon(scenario)}
                        <span className="text-xs font-medium truncate">{scenario.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 text-left">{scenario.description.slice(0, 30)}...</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Control manual */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Control Manual</Label>

                <div className="space-y-2">
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar escenario..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SIMULATION_SCENARIOS.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(scenario)}
                            <span>{scenario.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleStartSimulation}
                      disabled={!selectedScenario || connectionSimulator.isSimulationActive()}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStopSimulation}
                      disabled={!connectionSimulator.isSimulationActive()}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Detener
                    </Button>
                  </div>
                </div>

                {/* Modo automático */}
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
                  <Switch
                    id="auto-mode"
                    checked={autoMode}
                    onCheckedChange={setAutoMode}
                    disabled={connectionSimulator.isSimulationActive() && !autoMode}
                  />
                  <Label htmlFor="auto-mode" className="text-sm">
                    Modo automático (30s cada escenario)
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Información del escenario seleccionado */}
              {selectedScenario && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Detalles del Escenario</Label>
                  {(() => {
                    const scenario = SIMULATION_SCENARIOS.find((s) => s.id === selectedScenario)
                    if (!scenario) return null

                    return (
                      <div className="p-3 bg-gray-50 rounded-md space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(scenario)}
                          <span className="font-medium">{scenario.name}</span>
                          <Badge variant={getStatusColor(scenario)} className="text-xs">
                            {scenario.apiResponseTime}ms
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                        <div className="flex gap-2 text-xs">
                          <Badge variant={scenario.networkOnline ? "default" : "destructive"}>
                            Red: {scenario.networkOnline ? "ON" : "OFF"}
                          </Badge>
                          <Badge variant={scenario.apiAvailable ? "default" : "destructive"}>
                            API: {scenario.apiAvailable ? "ON" : "OFF"}
                          </Badge>
                          {scenario.intermittent && <Badge variant="secondary">Intermitente</Badge>}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Botón de reset */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  handleStopSimulation()
                  setSelectedScenario("")
                  connectionSimulator.restoreOriginalFetch()
                }}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
