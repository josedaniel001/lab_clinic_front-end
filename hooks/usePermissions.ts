"use client"

import { useContext } from "react"
import { RoleContext } from "@/contexts/RoleContext"

export function usePermissions() {
  const { permissions, loading } = useContext(RoleContext)

  if (permissions === undefined) {
    throw new Error("usePermissions debe ser usado dentro de un RoleProvider")
  }

  const hasPermission = (permissionName: string) => {
    // Si está cargando, asumimos que no tiene el permiso
    if (loading) return false

    // Para desarrollo, permitimos todo
    if (process.env.NODE_ENV === "development") return true

    return permissions.includes(permissionName)
  }

  return { permissions, hasPermission, loading }
}
