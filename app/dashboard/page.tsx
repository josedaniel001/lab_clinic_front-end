"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ClipboardList, TestTube, Clock, AlertCircle, BarChart3, FileText, Activity } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardStats {
  totalPacientes: number
  ordenesHoy: number
  resultadosValidados: number
  pendientesAtencion: number
  tendenciaPacientes: string
  tendenciaOrdenes: string
  tendenciaResultados: string
  tendenciaPendientes: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 1247,
    ordenesHoy: 89,
    resultadosValidados: 156,
    pendientesAtencion: 23,
    tendenciaPacientes: "+12% este mes",
    tendenciaOrdenes: "+8% vs ayer",
    tendenciaResultados: "Esta semana",
    tendenciaPendientes: "Requieren atención",
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const quickActions = [
    {
      title: "Nuevo Paciente",
      description: "Registrar un nuevo paciente",
      icon: <Users className="h-6 w-6" />,
      color: "bg-blue-500 hover:bg-blue-600",
      href: "/recepcion/pacientes",
    },
    {
      title: "Nueva Orden",
      description: "Crear una nueva orden de laboratorio",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "bg-green-500 hover:bg-green-600",
      href: "/recepcion/ordenes",
    },
    {
      title: "Cargar Resultados",
      description: "Ingresar resultados de exámenes",
      icon: <TestTube className="h-6 w-6" />,
      color: "bg-purple-500 hover:bg-purple-600",
      href: "/laboratorio/resultados",
    },
    {
      title: "Ver Estadísticas",
      description: "Revisar reportes y estadísticas",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-orange-500 hover:bg-orange-600",
      href: "/reportes/estadisticas",
    },
  ]

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ¡Bienvenido, {user?.nombre_usuario || "Admin"}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Aquí tienes un resumen de la actividad del laboratorio
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Hoy es</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(currentTime)}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Pacientes</p>
                <p className="text-3xl font-bold mt-2">{stats.totalPacientes.toLocaleString()}</p>
                <p className="text-blue-100 text-sm mt-1">{stats.tendenciaPacientes}</p>
              </div>
              <div className="bg-blue-400/20 p-3 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Órdenes Hoy</p>
                <p className="text-3xl font-bold mt-2">{stats.ordenesHoy}</p>
                <p className="text-green-100 text-sm mt-1">{stats.tendenciaOrdenes}</p>
              </div>
              <div className="bg-green-400/20 p-3 rounded-lg">
                <ClipboardList className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Resultados Validados</p>
                <p className="text-3xl font-bold mt-2">{stats.resultadosValidados}</p>
                <p className="text-purple-100 text-sm mt-1">{stats.tendenciaResultados}</p>
              </div>
              <div className="bg-purple-400/20 p-3 rounded-lg">
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Pendientes</p>
                <p className="text-3xl font-bold mt-2">{stats.pendientesAtencion}</p>
                <p className="text-orange-100 text-sm mt-1">{stats.tendenciaPendientes}</p>
              </div>
              <div className="bg-orange-400/20 p-3 rounded-lg">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Acciones Rápidas</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">Accede rápidamente a las funciones más utilizadas</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                asChild
              >
                <a href={action.href}>
                  <div className={`p-3 rounded-full text-white ${action.color}`}>{action.icon}</div>
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                  </div>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nuevo paciente registrado", time: "Hace 5 min", type: "success" },
                { action: "Resultado validado", time: "Hace 12 min", type: "info" },
                { action: "Orden pendiente", time: "Hace 18 min", type: "warning" },
                { action: "Examen completado", time: "Hace 25 min", type: "success" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.type === "success"
                        ? "bg-green-500"
                        : item.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Inventario bajo</p>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Algunos reactivos están por agotarse
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Reportes pendientes</p>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">3 reportes mensuales por generar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
