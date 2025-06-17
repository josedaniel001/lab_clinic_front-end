"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"

interface PermissionsContextType {
  hasPermission: (permission: string) => boolean
  permissions: string[]
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // Aquí defines los permisos basados en el rol del usuario
  const getPermissionsByRole = (role: string | undefined): string[] => {
    if (!role) return []

    const rolePermissions: Record<string, string[]> = {
      admin: [
        "ver_dashboard",
        "ver_modulo_recepcion",
        "ver_pacientes",
        "crear_pacientes",
        "editar_pacientes",
        "eliminar_pacientes",
        "ver_medicos",
        "crear_medicos",
        "editar_medicos",
        "eliminar_medicos",
        "ver_ordenes",
        "crear_ordenes",
        "editar_ordenes",
        "eliminar_ordenes",
        "ver_modulo_laboratorio",
        "ver_resultados",
        "crear_resultados",
        "editar_resultados",
        "eliminar_resultados",
        "ver_inventario",
        "crear_inventario",
        "editar_inventario",
        "eliminar_inventario",
        "ver_examenes",
        "crear_examenes",
        "editar_examenes",
        "eliminar_examenes",
        "ver_modulo_facturacion",
        "ver_facturas",
        "crear_facturas",
        "editar_facturas",
        "eliminar_facturas",
        "ver_reportes_facturacion",
        "ver_modulo_reportes",
        "ver_estadisticas",
        "ver_modulo_admin",
        "ver_usuarios",
        "crear_usuarios",
        "editar_usuarios",
        "eliminar_usuarios",
        "ver_roles",
        "crear_roles",
        "editar_roles",
        "eliminar_roles",
      ],
      medico: [
        "ver_dashboard",
        "ver_modulo_recepcion",
        "ver_pacientes",
        "crear_pacientes",
        "editar_pacientes",
        "ver_medicos",
        "ver_ordenes",
        "crear_ordenes",
        "editar_ordenes",
        "ver_modulo_laboratorio",
        "ver_resultados",
        "ver_examenes",
      ],
      recepcionista: [
        "ver_dashboard",
        "ver_modulo_recepcion",
        "ver_pacientes",
        "crear_pacientes",
        "editar_pacientes",
        "ver_medicos",
        "ver_ordenes",
        "crear_ordenes",
        "editar_ordenes",
      ],
      laboratorista: [
        "ver_dashboard",
        "ver_modulo_laboratorio",
        "ver_resultados",
        "crear_resultados",
        "editar_resultados",
        "ver_inventario",
        "editar_inventario",
        "ver_examenes",
        "ver_pacientes",
        "ver_ordenes",
      ],
    }

    return rolePermissions[role.toLowerCase()] || []
  }

  const permissions = getPermissionsByRole(user?.rol)

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  return <PermissionsContext.Provider value={{ hasPermission, permissions }}>{children}</PermissionsContext.Provider>
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider")
  }
  return context
}
