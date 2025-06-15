"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import { permisosAPI } from "@/api/permisosAPI"

interface RoleContextType {
  permissions: string[]
  loading: boolean
}

export const RoleContext = createContext<RoleContextType>({
  permissions: [],
  loading: true,
})

interface RoleProviderProps {
  children: ReactNode
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      if (isAuthenticated && user?.id_rol) {
        try {
          const permisos = await permisosAPI.getPermisosByRol(user.id_rol)
          const permissionNames = permisos
            .filter((permiso: any) => permiso.activo)
            .map((permiso: any) => permiso.nombre)

          setPermissions(permissionNames)
        } catch (error) {
          console.error("Error al cargar permisos:", error)
          setPermissions([])
        } finally {
          setLoading(false)
        }
      } else {
        setPermissions([])
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [isAuthenticated, user])

  return <RoleContext.Provider value={{ permissions, loading }}>{children}</RoleContext.Provider>
}
