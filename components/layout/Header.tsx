"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useConnectionStatus } from "@/hooks/useConnectionStatus"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Menu, Bell, Search, LogOut, ChevronLeft, ChevronRight, Wifi, WifiOff, SidebarOpen, SidebarClose, User } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Sidebar from "@/components/layout/Sidebar"
import { NetworkStatus } from "@/components/ui/NetworkStatus"

export default function TopBar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { isOnline } = useConnectionStatus()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // No mostrar en páginas de auth
  if (!isAuthenticated || pathname === "/login" || pathname === "/register" || pathname === "/verificar-2fa") {
    return null
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleSidebarCollapsed = () => setSidebarCollapsed(!sidebarCollapsed)

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname.includes("/recepcion")) return "Recepción"
    if (pathname.includes("/laboratorio")) return "Laboratorio"
    if (pathname.includes("/admin")) return "Administración"
    if (pathname.includes("/facturacion")) return "Facturación"
    if (pathname.includes("/reportes")) return "Reportes"
    if (pathname.includes("/configuracion")) return "Configuración"
    if (pathname.includes("/medicos")) return "Médicos"
    return "Dashboard"
  }

  return (
    <>
      <Sidebar
        collapsed={sidebarCollapsed}
        toggleCollapsed={toggleSidebarCollapsed}
        isMobileOpen={sidebarOpen}
        toggleMobile={toggleSidebar}
      />

      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            {/* Botón hamburguesa móvil */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-6 w-6" />
            </Button>

            
            {/* Logo */            
            <Link href="/dashboard" className="flex items-left">
            <div className="relative w-32 h-8">
              <Image
                src={"/BIOANALISIS.png"}
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">{getPageTitle()}</h1>
          </Link>                    
          }
          {/* Botón collapse desktop */}
          <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarCollapsed}
              className="hidden lg:flex text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {sidebarCollapsed ? <SidebarOpen className="h-5 w-5" /> : <SidebarClose className="h-5 w-5" />}
            </Button>
            

            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 min-w-[300px]">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar pacientes, órdenes, resultados..."
                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status de conexión */}
            <NetworkStatus />

            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white border-2 border-white dark:border-gray-800 flex items-center justify-center">
                4
              </Badge>
            </Button>

            <Separator orientation="vertical" className="h-6 bg-gray-300 dark:bg-gray-600" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-medium">
                  {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.display_name ||
                    user?.full_name ||
                    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                    user?.username ||
                    "Usuario"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role_display || user?.role || "Rol"}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
