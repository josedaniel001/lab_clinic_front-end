"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Menu,
  X,
  Home,
  Users,
  FileText,
  TestTube,
  BarChart3,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { ConnectionSimulatorPanel } from "@/components/dev/ConnectionSimulatorPanel"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    current: false,
  },
  {
    name: "Recepción",
    icon: Users,
    children: [
      { name: "Pacientes", href: "/recepcion/pacientes" },
      { name: "Médicos", href: "/recepcion/medicos" },
      { name: "Órdenes", href: "/recepcion/ordenes" },
    ],
  },
  {
    name: "Laboratorio",
    icon: TestTube,
    children: [
      { name: "Resultados", href: "/laboratorio/resultados" },
      { name: "Inventario", href: "/laboratorio/inventario" },
    ],
  },
  {
    name: "Administración",
    icon: Settings,
    children: [
      { name: "Usuarios", href: "/admin/usuarios" },
      { name: "Roles", href: "/admin/roles" },
    ],
  },
  {
    name: "Facturación",
    icon: FileText,
    children: [
      { name: "Facturas", href: "/facturacion/facturas" },
      { name: "Reportes", href: "/facturacion/reportes" },
    ],
  },
  {
    name: "Reportes",
    href: "/reportes/estadisticas",
    icon: BarChart3,
  },
  {
    name: "Configuración",
    icon: Settings,
    children: [
      { name: "General", href: "/configuracion" },
      { name: "Notificaciones", href: "/configuracion/notificaciones" },
    ],
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    )
  }

  const isCurrentPath = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isParentActive = (children: any[]) => {
    return children.some((child) => isCurrentPath(child.href))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-xl font-bold text-white">LaboFutura</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-blue-500"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isCurrentPath(item.href) ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isParentActive(item.children || [])
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedItems.includes(item.name) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedItems.includes(item.name) && item.children && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isCurrentPath(child.href)
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-lg">
          <div className="flex items-center h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-xl font-bold text-white">LaboFutura</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isCurrentPath(item.href)
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isParentActive(item.children || [])
                          ? "bg-blue-100 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedItems.includes(item.name) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedItems.includes(item.name) && item.children && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isCurrentPath(child.href)
                                ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.nombre_usuario || "Usuario"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.rol || "Rol"}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>

              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">3</Badge>
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.nombre_usuario || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{user?.rol || "Rol"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Suspense>{children}</Suspense>
        </main>
      </div>

      {/* Panel de simulación solo en desarrollo */}
      {process.env.NODE_ENV === "development" && <ConnectionSimulatorPanel />}
    </div>
  )
}
