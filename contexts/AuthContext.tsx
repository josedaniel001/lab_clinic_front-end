"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "@/api/authAPI"
import { useLoader } from "@/hooks/useLoader"
import { getToken, setToken, removeToken, setRefreshToken, getRefreshToken, removeRefreshToken } from "@/utils/token"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  // Agregar campos específicos de tu modelo de usuario Django
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

export const AuthContext = createContext<AuthContextType>({
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
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Error al refrescar el token:", error)
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
          // Intentar obtener el usuario actual
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
          setIsAuthenticated(true)

          // Configurar un intervalo para refrescar el token cada 4 minutos
          // (antes de que expire a los 5 minutos)
          const refreshInterval = setInterval(
            () => {
              refreshUserSession()
            },
            4 * 60 * 1000, // 4 minutos
          )

          return () => clearInterval(refreshInterval)
        } catch (error) {
          console.error("Error al verificar el token:", error)
          // Intentar refrescar el token
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
      const { token, user: userData, requireTwoFactor } = await authAPI.login(username, password)

      if (requireTwoFactor) {
        hideLoader()
        return { requireTwoFactor: true }
      }

      // Guardar tokens
      setToken(token.accessToken)
      setRefreshToken(token.refreshToken)

      // Obtener información completa del usuario
      const fullUserData = await authAPI.getCurrentUser()
      setUser(fullUserData)
      setIsAuthenticated(true)

      hideLoader()
      return { requireTwoFactor: false }
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      hideLoader()
      throw new Error(error.message || "Error de autenticación")
    }
  }

  const register = async (userData: any) => {
    showLoader()
    try {
      await authAPI.register(userData)
    } catch (error: any) {
      console.error("Error al registrar usuario:", error)
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
