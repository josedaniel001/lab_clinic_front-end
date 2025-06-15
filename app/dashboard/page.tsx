"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useLoader } from "@/hooks/useLoader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  TestTube,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()
  const { showLoader, hideLoader } = useLoader()

  const [stats, setStats] = useState({
    pacientes: 1247,
    ordenes: 89,
    resultados: 156,
    pendientes: 23,
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "orden", description: "Nueva orden de Juan Pérez", time: "Hace 5 min", status: "new" },
    {
      id: 2,
      type: "resultado",
      description: "Resultados validados para María García",
      time: "Hace 15 min",
      status: "completed",
    },
    {
      id: 3,
      type: "paciente",
      description: "Nuevo paciente registrado: Carlos López",
      time: "Hace 30 min",
      status: "new",
    },
    {
      id: 4,
      type: "orden",
      description: "Orden completada para Ana Martínez",
      time: "Hace 1 hora",
      status: "completed",
    },
  ])

  const quickActions = [
    {
      title: "Nuevo Paciente",
      description: "Registrar un nuevo paciente",
      icon: Users,
      href: "/recepcion/pacientes",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Nueva Orden",
      description: "Crear una nueva orden de laboratorio",
      icon: FileText,
      href: "/recepcion/ordenes",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Cargar Resultados",
      description: "Ingresar resultados de exámenes",
      icon: TestTube,
      href: "/laboratorio/resultados",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Ver Estadísticas",
      description: "Revisar reportes y estadísticas",
      icon: BarChart3,
      href: "/reportes/estadisticas",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "orden":
        return <FileText className="h-4 w-4" />
      case "resultado":
        return <TestTube className="h-4 w-4" />
      case "paciente":
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "new":
        return "text-blue-600 bg-blue-100"
      case "completed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">¡Bienvenido, {user?.nombre_usuario || "Usuario"}! 👋</h1>
            <p className="text-gray-600 mt-2">Aquí tienes un resumen de la actividad del laboratorio</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Hoy es</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Pacientes</p>
                  <p className="text-3xl font-bold">{stats.pacientes.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs mt-1">+12% este mes</p>
                </div>
                <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                  <Users className="h-8 w-8 text-blue-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Órdenes Hoy</p>
                  <p className="text-3xl font-bold">{stats.ordenes}</p>
                  <p className="text-green-200 text-xs mt-1">+8% vs ayer</p>
                </div>
                <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
                  <FileText className="h-8 w-8 text-green-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Resultados Validados</p>
                  <p className="text-3xl font-bold">{stats.resultados}</p>
                  <p className="text-purple-200 text-xs mt-1">Esta semana</p>
                </div>
                <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
                  <CheckCircle className="h-8 w-8 text-purple-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold">{stats.pendientes}</p>
                  <p className="text-orange-200 text-xs mt-1">Requieren atención</p>
                </div>
                <div className="p-3 bg-orange-400 bg-opacity-30 rounded-full">
                  <Clock className="h-8 w-8 text-orange-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Acciones Rápidas</CardTitle>
            <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div
                        className={`inline-flex p-4 rounded-full ${action.color} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}
                      >
                        <action.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver toda la actividad
              </Button>
            </CardContent>
          </Card>

          {/* Progress & Alerts */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>Progreso y alertas importantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Indicators */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Órdenes Procesadas Hoy</span>
                    <span className="text-sm text-gray-500">67/89</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Resultados Validados</span>
                    <span className="text-sm text-gray-500">156/180</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Capacidad del Sistema</span>
                    <span className="text-sm text-gray-500">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>

              {/* Alerts */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Inventario Bajo</p>
                    <p className="text-xs text-yellow-600">3 reactivos necesitan reposición</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Mantenimiento Programado</p>
                    <p className="text-xs text-blue-600">Equipo de hematología - Mañana 9:00 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rendimiento Semanal
            </CardTitle>
            <CardDescription>Órdenes procesadas en los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[65, 78, 82, 91, 87, 94, 89].map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-12 transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    style={{ height: `${(value / 100) * 200}px` }}
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][index]}
                  </span>
                  <span className="text-xs text-gray-400">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
