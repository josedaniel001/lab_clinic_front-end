"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { salidaAPI } from "@/api/bancoSangreAPI"

export function APIStatusPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [testData, setTestData] = useState({
    receptor: "Dr. Juan Pérez",
    cedula_receptor: "12345678",
    medico_solicitante: "Dr. María García",
    observaciones: "Prueba de API - Urgente para cirugía",
    unidades_ids: [1, 2, 3]
  })

  const testSalidaAPI = async () => {
    setIsLoading(true)
    setError("")
    setResponse(null)

    try {
      console.log("Enviando datos de prueba:", testData)
      const result = await salidaAPI.createSalida(testData)
      console.log("Respuesta exitosa:", result)
      setResponse(result)
    } catch (err: any) {
      console.error("Error en la prueba:", err)
      setError(err.response?.data?.message || err.message || "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const testGetSalidas = async () => {
    setIsLoading(true)
    setError("")
    setResponse(null)

    try {
      const result = await salidaAPI.getSalidas(1, 10)
      console.log("Salidas obtenidas:", result)
      setResponse(result)
    } catch (err: any) {
      console.error("Error obteniendo salidas:", err)
      setError(err.response?.data?.message || err.message || "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Prueba de API - Salidas de Banco de Sangre
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Datos de prueba */}
        <div className="space-y-3">
          <h4 className="font-medium">Datos de Prueba:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Receptor:</label>
              <Input
                value={testData.receptor}
                onChange={(e) => setTestData({...testData, receptor: e.target.value})}
                placeholder="Nombre del receptor"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cédula:</label>
              <Input
                value={testData.cedula_receptor}
                onChange={(e) => setTestData({...testData, cedula_receptor: e.target.value})}
                placeholder="Cédula del receptor"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Médico Solicitante:</label>
              <Input
                value={testData.medico_solicitante}
                onChange={(e) => setTestData({...testData, medico_solicitante: e.target.value})}
                placeholder="Médico solicitante"
              />
            </div>
            <div>
              <label className="text-sm font-medium">IDs de Unidades:</label>
              <Input
                value={testData.unidades_ids.join(", ")}
                onChange={(e) => setTestData({
                  ...testData, 
                  unidades_ids: e.target.value.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                })}
                placeholder="1, 2, 3"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Observaciones:</label>
            <Textarea
              value={testData.observaciones}
              onChange={(e) => setTestData({...testData, observaciones: e.target.value})}
              placeholder="Observaciones de la salida"
              rows={2}
            />
          </div>
        </div>

        {/* Botones de prueba */}
        <div className="flex gap-2">
          <Button 
            onClick={testSalidaAPI} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Probar Crear Salida
          </Button>
          <Button 
            onClick={testGetSalidas} 
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            Obtener Salidas
          </Button>
        </div>

        {/* Resultado */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {response && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Respuesta Exitosa:</span>
            </div>
            <pre className="text-sm text-green-600 mt-2 overflow-auto max-h-40">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {/* Información del endpoint */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Endpoint de Prueba:</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p><strong>POST:</strong> /api/banco_sangre/salidas/</p>
            <p><strong>GET:</strong> /api/banco_sangre/salidas/?page=1&limit=10</p>
            <p><strong>Payload esperado:</strong></p>
            <pre className="text-xs bg-blue-100 p-2 rounded mt-1 overflow-auto">
{`{
  "receptor": "Dr. Juan Pérez",
  "cedula_receptor": "12345678", 
  "medico_solicitante": "Dr. María García",
  "observaciones": "Urgente para cirugía",
  "unidades_ids": [1, 2, 3]
}`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
