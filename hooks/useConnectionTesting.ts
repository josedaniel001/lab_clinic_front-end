"use client"

import { useState, useEffect } from "react"
import { connectionSimulator } from "@/utils/connectionSimulator"
import { useConnectionStatus } from "@/hooks/useConnectionStatus"
import { syncManager } from "@/utils/syncManager"

interface TestingMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  cacheHits: number
  cacheMisses: number
  pendingOperations: number
  syncAttempts: number
  successfulSyncs: number
}

export function useConnectionTesting() {
  const connectionStatus = useConnectionStatus()
  const [metrics, setMetrics] = useState<TestingMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    pendingOperations: 0,
    syncAttempts: 0,
    successfulSyncs: 0,
  })

  const [testResults, setTestResults] = useState<
    Array<{
      timestamp: Date
      scenario: string
      action: string
      result: "success" | "error" | "cached"
      responseTime?: number
      error?: string
    }>
  >([])

  // Función para ejecutar test automático
  const runAutomatedTest = async () => {
    const scenarios = ["normal", "slow_connection", "api_down", "no_internet", "api_timeout", "intermittent"]

    const testActions = [
      { action: "get_patients", endpoint: "/api/pacientes" },
      { action: "create_patient", endpoint: "/api/pacientes", method: "POST" },
      { action: "get_orders", endpoint: "/api/ordenes" },
      { action: "create_order", endpoint: "/api/ordenes", method: "POST" },
    ]

    console.log("🧪 Iniciando test automático de conexión...")

    for (const scenarioId of scenarios) {
      console.log(`🎭 Testing scenario: ${scenarioId}`)

      // Iniciar simulación
      connectionSimulator.startSimulation(scenarioId)

      // Esperar que se aplique el escenario
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Ejecutar acciones de test
      for (const testAction of testActions) {
        const startTime = Date.now()

        try {
          let result: any

          if (testAction.method === "POST") {
            // Simular creación de datos
            const mockData = {
              nombre: `Test ${Date.now()}`,
              cedula: `${Math.random().toString().slice(2, 10)}`,
            }

            result = await fetch(testAction.endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(mockData),
            })
          } else {
            result = await fetch(testAction.endpoint)
          }

          const responseTime = Date.now() - startTime

          setTestResults((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              scenario: scenarioId,
              action: testAction.action,
              result: result.ok ? "success" : "error",
              responseTime,
            },
          ])
        } catch (error: any) {
          const responseTime = Date.now() - startTime

          setTestResults((prev) => [
            ...prev,
            {
              timestamp: new Date(),
              scenario: scenarioId,
              action: testAction.action,
              result: "error",
              responseTime,
              error: error.message,
            },
          ])
        }

        // Pausa entre acciones
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Pausa entre escenarios
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    // Detener simulación
    connectionSimulator.stopSimulation()

    console.log("✅ Test automático completado")
  }

  // Función para test de estrés
  const runStressTest = async (duration = 60) => {
    console.log(`🔥 Iniciando test de estrés por ${duration} segundos...`)

    const endTime = Date.now() + duration * 1000
    let requestCount = 0

    while (Date.now() < endTime) {
      const scenarios = ["normal", "slow_connection", "api_down", "intermittent"]
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]

      // Cambiar escenario aleatoriamente
      if (Math.random() < 0.3) {
        connectionSimulator.startSimulation(randomScenario)
      }

      // Hacer request aleatorio
      try {
        const endpoints = ["/api/pacientes", "/api/ordenes", "/api/examenes"]
        const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)]

        const startTime = Date.now()
        await fetch(randomEndpoint)
        const responseTime = Date.now() - startTime

        requestCount++

        setTestResults((prev) => [
          ...prev.slice(-100),
          {
            // Mantener solo últimos 100
            timestamp: new Date(),
            scenario: randomScenario,
            action: `stress_${requestCount}`,
            result: "success",
            responseTime,
          },
        ])
      } catch (error: any) {
        setTestResults((prev) => [
          ...prev.slice(-100),
          {
            timestamp: new Date(),
            scenario: randomScenario,
            action: `stress_${requestCount}`,
            result: "error",
            error: error.message,
          },
        ])
      }

      // Pausa aleatoria entre requests
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 500))
    }

    connectionSimulator.stopSimulation()
    console.log(`✅ Test de estrés completado. ${requestCount} requests realizados`)
  }

  // Función para test de sincronización
  const runSyncTest = async () => {
    console.log("🔄 Iniciando test de sincronización...")

    // 1. Simular modo offline
    connectionSimulator.startSimulation("no_internet")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 2. Crear datos offline
    const offlineData = [
      { nombre: "Paciente Offline 1", cedula: "11111111" },
      { nombre: "Paciente Offline 2", cedula: "22222222" },
      { nombre: "Paciente Offline 3", cedula: "33333333" },
    ]

    for (const data of offlineData) {
      try {
        await fetch("/api/pacientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        setTestResults((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            scenario: "no_internet",
            action: "create_offline",
            result: "cached",
          },
        ])
      } catch (error: any) {
        setTestResults((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            scenario: "no_internet",
            action: "create_offline",
            result: "error",
            error: error.message,
          },
        ])
      }
    }

    // 3. Verificar operaciones pendientes
    const pendingCount = await syncManager.getPendingOperationsCount()
    console.log(`📝 Operaciones pendientes: ${pendingCount}`)

    // 4. Simular recuperación de conexión
    await new Promise((resolve) => setTimeout(resolve, 3000))
    connectionSimulator.startSimulation("normal")

    // 5. Esperar sincronización automática
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // 6. Verificar sincronización
    const remainingPending = await syncManager.getPendingOperationsCount()
    console.log(`📝 Operaciones restantes: ${remainingPending}`)

    setTestResults((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        scenario: "sync_test",
        action: "auto_sync",
        result: remainingPending === 0 ? "success" : "error",
      },
    ])

    connectionSimulator.stopSimulation()
    console.log("✅ Test de sincronización completado")
  }

  // Limpiar resultados
  const clearTestResults = () => {
    setTestResults([])
    setMetrics({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      pendingOperations: 0,
      syncAttempts: 0,
      successfulSyncs: 0,
    })
  }

  // Actualizar métricas basadas en resultados
  useEffect(() => {
    const newMetrics = testResults.reduce(
      (acc, result) => {
        acc.totalRequests++

        if (result.result === "success") acc.successfulRequests++
        if (result.result === "error") acc.failedRequests++
        if (result.result === "cached") acc.cacheHits++

        if (result.responseTime) {
          acc.averageResponseTime = (acc.averageResponseTime + result.responseTime) / 2
        }

        return acc
      },
      {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        cacheHits: 0,
        cacheMisses: 0,
        pendingOperations: 0,
        syncAttempts: 0,
        successfulSyncs: 0,
      },
    )

    setMetrics(newMetrics)
  }, [testResults])

  return {
    connectionStatus,
    metrics,
    testResults,
    runAutomatedTest,
    runStressTest,
    runSyncTest,
    clearTestResults,
  }
}
