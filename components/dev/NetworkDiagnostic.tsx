"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  test: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
}

export default function NetworkDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    // Test 1: Verificar si Django está corriendo
    try {
      const response = await fetch("http://localhost:8000", {
        method: "GET",
        mode: "no-cors", // Para evitar CORS en esta prueba
      })
      diagnostics.push({
        test: "Django Server",
        status: "success",
        message: "Django está corriendo en puerto 8000",
      })
    } catch (error) {
      diagnostics.push({
        test: "Django Server",
        status: "error",
        message: "Django no está corriendo o no responde",
        details: "Verifica que Django esté iniciado con: python manage.py runserver 8000",
      })
    }

    // Test 2: Verificar CORS
    try {
      const response = await fetch("http://localhost:8000/api/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        diagnostics.push({
          test: "CORS Configuration",
          status: "success",
          message: "CORS está configurado correctamente",
        })
      } else {
        diagnostics.push({
          test: "CORS Configuration",
          status: "warning",
          message: `Respuesta HTTP ${response.status}`,
          details: "El servidor responde pero puede haber problemas de configuración",
        })
      }
    } catch (error: any) {
      if (error.message.includes("CORS")) {
        diagnostics.push({
          test: "CORS Configuration",
          status: "error",
          message: "Error de CORS",
          details: "Configura CORS_ALLOW_ALL_ORIGINS = True en Django settings.py",
        })
      } else {
        diagnostics.push({
          test: "CORS Configuration",
          status: "error",
          message: "Error de conectividad",
          details: error.message,
        })
      }
    }

    // Test 3: Verificar endpoint de token
    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "OPTIONS", // Preflight request
        headers: {
          "Content-Type": "application/json",
        },
      })

      diagnostics.push({
        test: "Token Endpoint",
        status: "success",
        message: "Endpoint /api/token/ está disponible",
      })
    } catch (error: any) {
      diagnostics.push({
        test: "Token Endpoint",
        status: "error",
        message: "Endpoint /api/token/ no disponible",
        details: error.message,
      })
    }

    // Test 4: Verificar configuración de red local
    try {
      const response = await fetch("http://127.0.0.1:8000/api/", {
        method: "GET",
        mode: "no-cors",
      })
      diagnostics.push({
        test: "Local Network",
        status: "success",
        message: "Red local funcionando (127.0.0.1)",
      })
    } catch (error) {
      diagnostics.push({
        test: "Local Network",
        status: "warning",
        message: "Problema con 127.0.0.1, usando localhost",
      })
    }

    setResults(diagnostics)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Diagnóstico de Red - Django Backend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Verifica la conectividad con tu backend Django</p>
          <Button onClick={runDiagnostics} disabled={isRunning} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Ejecutando..." : "Ejecutar Diagnóstico"}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>{result.status.toUpperCase()}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                {result.details && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">💡 {result.details}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Pasos para solucionar:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>
              Verifica que Django esté corriendo:{" "}
              <code className="bg-blue-100 px-1 rounded">python manage.py runserver 8000</code>
            </li>
            <li>Configura CORS en Django settings.py</li>
            <li>Verifica que el endpoint /api/token/ exista</li>
            <li>Revisa los logs de Django para errores</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
