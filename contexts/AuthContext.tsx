"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "@/api/authAPI"
import { useLoader } from "@/hooks/useLoader"
import { getToken, setToken, removeToken, setRefreshToken, getRefreshToken, removeRefreshToken, getTokenRemainingTime } from "@/utils/token"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  // Campos adicionales para roles
  groups?: string[] // Grupos de Django
  role?: string // Rol procesado
  role_display?: string // Nombre del rol para mostrar
  permissions?: string[] // Permisos del usuario
  custom_permissions?: string[] // Permisos personalizados
  // Campos de compatibilidad
  full_name?: string
  nombre_usuario?: string
  id_rol?: string // Para compatibilidad con código existente
  display_name?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ requireTwoFactor: boolean }>
  register: (userData: any) => Promise<void>
  logout: () => void
  verifyTwoFactor: (code: string) => Promise<void>
  enableTwoFactor: () => Promise<{ secret: string; qrCodeUrl: string }>
  disableTwoFactor: (code: string) => Promise<void>
  refreshUserSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ requireTwoFactor: false }),
  register: async () => {},
  logout: () => {},
  verifyTwoFactor: async () => {},
  enableTwoFactor: async () => ({ secret: "", qrCodeUrl: "" }),
  disableTwoFactor: async () => {},
  refreshUserSession: async () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { showLoader, hideLoader } = useLoader()

  // Función para procesar datos del usuario de Django
  const processUserData = (userData: any): User => {
    // Determinar el rol basado en los datos que devuelve tu /auth/me/
    let roleInfo = {
      role: "usuario",
      role_display: "Usuario",
      id_rol: "4",
    }

    // Si tienes grupos en la respuesta
    if (userData.groups && userData.groups.length > 0) {
      const group = userData.groups[0]
      roleInfo = {
        role: group.toLowerCase(),
        role_display: group,
        id_rol: group.toLowerCase(),
      }
    }

    // Si tienes un campo role directo
    if (userData.role) {
      roleInfo = {
        role: userData.role.toLowerCase(),
        role_display: userData.role,
        id_rol: userData.role.toLowerCase(),
      }
    }

    // Si es staff, asumimos que es administrador
    if (userData.is_staff) {
      roleInfo = {
        role: "administrador",
        role_display: "Administrador",
        id_rol: "1",
      }
    }

    const processedUser: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email || "",
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      is_staff: userData.is_staff || false,
      is_active: userData.is_active || true,

      // Información de roles
      groups: userData.groups || [],
      role: roleInfo.role,
      role_display: roleInfo.role_display,
      permissions: userData.permissions || [],
      custom_permissions: userData.custom_permissions || [],

      // Campos de compatibilidad
      full_name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || userData.username,
      nombre_usuario: userData.first_name || userData.username,
      display_name: userData.display_name || userData.first_name || userData.username,
      id_rol: roleInfo.id_rol,
    }

    return processedUser
  }

  // Función para refrescar el token y obtener usuario
  const refreshUserSession = async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      removeToken()
      setIsAuthenticated(false)
      setUser(null)
      return
    }

    try {
      const { token } = await authAPI.refreshToken(refreshToken)
      setToken(token)

      // Obtener información del usuario
      const userData = await authAPI.getCurrentUser()
      const processedUser = processUserData(userData)
      setUser(processedUser)
      setIsAuthenticated(true)
    } catch (error) {
      removeToken()
      removeRefreshToken()
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken()

      if (token) {
        try {
          const userData = await authAPI.getCurrentUser()
          const processedUser = processUserData(userData)
          setUser(processedUser)
          setIsAuthenticated(true)

          // Configurar un intervalo para refrescar el token cada 10 minutos
          const refreshInterval = setInterval(
            async () => {
              try {
                await refreshUserSession()
              } catch (error) {
                // No cerrar sesión inmediatamente, intentar en el próximo refresh
              }
            },
            10 * 60 * 1000, // 10 minutos
          )

          // También configurar un refresh cuando queden 5 minutos para que expire
          const checkExpiryInterval = setInterval(() => {
            const remainingTime = getTokenRemainingTime()
            if (remainingTime < 5 * 60) { // Menos de 5 minutos
              refreshUserSession()
            }
          }, 60 * 1000) // Verificar cada minuto

          return () => {
            clearInterval(refreshInterval)
            clearInterval(checkExpiryInterval)
          }
        } catch (error) {
          await refreshUserSession()
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    showLoader()
    try {
      const { token } = await authAPI.login(username, password)

      setToken(token.accessToken)
      setRefreshToken(token.refreshToken)

      const userData = await authAPI.getCurrentUser()
      const processedUser = processUserData(userData)
      setUser(processedUser)
      setIsAuthenticated(true)

      hideLoader()
      return { requireTwoFactor: false }
    } catch (error: any) {
      hideLoader()
      throw new Error(error.message || "Error de autenticación")
    }
  }

  const register = async (userData: any) => {
    showLoader()
    try {
      await authAPI.register(userData)
    } catch (error: any) {
      throw new Error(error.message || "Error en el registro")
    } finally {
      hideLoader()
    }
  }

  const logout = () => {
    removeToken()
    removeRefreshToken()
    setUser(null)
    setIsAuthenticated(false)
    
    // Redirigir a la página de login
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  // Funciones de 2FA (implementar cuando esté listo en Django)
  const verifyTwoFactor = async (code: string) => {
    throw new Error("2FA no implementado aún")
  }

  const enableTwoFactor = async () => {
    throw new Error("2FA no implementado aún")
  }

  const disableTwoFactor = async (code: string) => {
    throw new Error("2FA no implementado aún")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        verifyTwoFactor,
        enableTwoFactor,
        disableTwoFactor,
        refreshUserSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }

  return context
}

export { AuthContext }
