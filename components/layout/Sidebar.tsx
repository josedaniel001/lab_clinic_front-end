"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  LayoutDashboard,
  Users,
  ClipboardList,
  FlaskConical,
  BarChart3,
  Settings,
  UserCheck,
  Stethoscope,
  TestTube,
  Package,
  Receipt,
  TrendingUp,
  Shield,
  Hospital,
  User,
  Syringe,
  DropletIcon,
} from "lucide-react"
import { Biotech, Engineering } from "@mui/icons-material"

interface SidebarProps {
  collapsed: boolean
  toggleCollapsed: () => void
  isMobileOpen: boolean
  toggleMobile: () => void
}

interface MenuItem {
  title: string
  path?: string
  icon: React.ReactNode
  permission?: string
  children?: MenuItem[]
}

function Sidebar({ collapsed, toggleCollapsed, isMobileOpen, toggleMobile }: SidebarProps) {
  const { isDarkMode, toggleTheme } = useTheme()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({})

  // Función para verificar permisos
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false
    if (user.is_staff) return true
    if (user.custom_permissions?.includes(permission)) return true
    if (user.permissions?.includes(permission)) return true
    return false
  }

  const handleSubMenuToggle = (title: string) => {
    if (collapsed) return
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const isActive = (path: string) => pathname === path

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      permission: "ver_dashboard",
    },
    {
      title: "Recepción",
      icon: <Hospital size={20} />,
      permission: "ver_modulo_recepcion",
      children: [
        {
          title: "Donantes",
          path: "/recepcion/donantes",
          icon: <Users size={18} />,
          permission: "ver_pacientes",
        },  
        {
          title: "Médicos",
          path: "/recepcion/medicos",
          icon: <Stethoscope size={18} />,
          permission: "ver_medicos",
        },        
      ],
    },   
    {
      title: "Banco de Sangre",
      icon: <DropletIcon size={20} />,
      permission: "ver_modulo_banco_sangre",
      children: [
        {
          title: "Muestras de Donantes",
          path: "/banco_sangre/muestras",
          icon: <Syringe size={18} />,
          permission: "ver_muestras",
        },   
        {
          title: "Exámenes",
          path: "/laboratorio/examenes",
          icon: <FlaskConical size={18} />,
          permission: "ver_examenes",
        },           
         {
          title: "Órdenes para Examenes",
          path: "/banco_sangre/ordenes",
          icon: <ClipboardList size={18} />,
          permission: "ver_ordenes",
        },
        {
          title: "Resultados de Examenes Donantes",
          path: "/laboratorio/resultados",
          icon: <TestTube size={18} />,
          permission: "ver_resultados",
        },
      ],
    },
    {
      title: "Reportes",
      icon: <BarChart3 size={20} />,
      permission: "ver_modulo_reportes",
      children: [
        {
          title: "Estadísticas",
          path: "/reportes/estadisticas",
          icon: <BarChart3 size={18} />,
          permission: "ver_estadisticas",
        },
      ],
    },    
    {
      title: "Configuración",
      icon: <Engineering size={20} />,
      permission: "ver_modulo_configuracion",
      children: [
        {
          title: "General",
          path: "/configuracion",
          icon: <Biotech size={18} />,
          permission: "ver_usuarios",
        },
        {
          title: "Notificaciones",
          path: "/configuracion/notificaciones",
          icon: <Engineering size={18} />,
          permission: "ver_roles",
        },
      ],
    },
  ]

  // Inicializar submenús abiertos
  useEffect(() => {
    if (!collapsed) {
      const newOpenSubMenus: { [key: string]: boolean } = {}
      menuItems.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some((child) => pathname.startsWith(child.path || ""))
          if (isChildActive) {
            newOpenSubMenus[item.title] = true
          }
        }
      })
      setOpenSubMenus(newOpenSubMenus)
    }
  }, [pathname, collapsed])

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      if (item.permission && !hasPermission(item.permission)) {
        return null
      }

      if (item.children) {
        const visibleChildren = item.children.filter((child) => {
          if (child.permission && !hasPermission(child.permission)) {
            return false
          }
          return true
        })

        if (visibleChildren.length === 0) {
          return null
        }

        const isOpen = openSubMenus[item.title]
        const hasActiveChild = visibleChildren.some((child) => child.path && pathname.startsWith(child.path))

        return (
          <div key={item.title} className="mb-1">
            <button
              onClick={() => handleSubMenuToggle(item.title)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left
                transition-all duration-200 group
                ${
                  hasActiveChild
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? item.title : undefined}
            >
              <div className="flex items-center">
                <div
                  className={`${hasActiveChild ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {item.icon}
                </div>
                {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
              </div>
              {!collapsed && (
                <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} />
                </div>
              )}
            </button>

            {!collapsed && isOpen && (
              <div className="mt-1 ml-4 space-y-1">
                {visibleChildren.map((child) => {
                  const isChildActive = child.path ? isActive(child.path) : false
                  return (
                    <Link
                      key={child.title}
                      href={child.path || "#"}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-sm
                        transition-all duration-200 group
                        ${
                          isChildActive
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                        }
                      `}
                    >
                      <div
                        className={`${isChildActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        {child.icon}
                      </div>
                      <span className="ml-3">{child.title}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      }

      const isItemActive = item.path ? isActive(item.path) : false

      return (
        <div key={item.title} className="mb-1">
          <Link
            href={item.path || "#"}
            className={`
              flex items-center px-3 py-2.5 rounded-lg
              transition-all duration-200 group
              ${
                isItemActive
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? item.title : undefined}
          >
            <div
              className={`${isItemActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
            >
              {item.icon}
            </div>
            {!collapsed && <span className="ml-3 font-medium">{item.title}</span>}
          </Link>
        </div>
      )
    })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 ${collapsed ? "px-2" : ""}`}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <div className="relative w-32 h-8">
              <Image src="/logo-labofutura.png" alt="LaboFutura Logo" fill className="object-contain" />
            </div>
          </Link>
        )}

        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">{renderMenuItems(menuItems)}</div>

      {/* User Profile Section */}
      {isAuthenticated && user && (
        <div className={`p-4 border-t border-gray-200 dark:border-gray-800 ${collapsed ? "px-2" : ""}`}>
          {collapsed ? (
           <Link
                href="/perfil"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                > <div
              className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              title={`${user.display_name || user.username} - ${user.role_display || user.role}`}
            >
              <User size={20} className="text-gray-600 dark:text-gray-400" />
            </div></Link>
          ) : ( 
            <Link
                href="/perfil"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(user.first_name?.[0] || user.username?.[0] || "U").toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.display_name || user.first_name || user.username}
                </p>                
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role_display || user.role || "Usuario"}
                </p>              
              </div>
            </div>
            </Link>
          )}
        </div>
      )}

      {/* Theme Toggle */}
      <div className={`p-4 border-t border-gray-200 dark:border-gray-800 ${collapsed ? "px-2" : ""}`}>
        {collapsed ? (
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Cambiar a modo ${isDarkMode ? "claro" : "oscuro"}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              <span>{isDarkMode ? "Modo Oscuro" : "Modo Claro"}</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${isDarkMode ? "bg-blue-600" : "bg-gray-200"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isDarkMode ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={toggleMobile} />}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`
          hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:w-16" : "lg:w-72"}
        `}
      >
        {sidebarContent}
      </div>
    </>
  )
}

export default Sidebar
