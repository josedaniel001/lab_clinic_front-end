"use client"

import type React from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

// Rutas que NO deben mostrar el sidebar
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password"]

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Si está cargando, mostrar solo children (el GlobalLoader se encarga del loading)
  if (isLoading) {
    return <>{children}</>
  }

  // Determinar si mostrar el layout completo
  const shouldShowLayout = user && !PUBLIC_ROUTES.includes(pathname)

  // Si no debe mostrar layout (rutas públicas o sin autenticar), renderizar solo children
  if (!shouldShowLayout) {
    return <>{children}</>
  }

  // Layout completo con sidebar para rutas autenticadas
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar persistente */}
      <Sidebar open={sidebarOpen} toggleDrawer={toggleSidebar} />

      {/* Contenido principal */}
      <div className="lg:pl-60">
        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Contenido de la página */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
