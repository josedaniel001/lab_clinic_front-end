"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "@/api/authAPI"
import { useLoader } from "@/hooks/useLoader"
import { getToken, setToken, removeToken, setRefreshToken, getRefreshToken, removeRefreshToken } from "@/utils/token"

interface User {
  id_usuario: string
  nombre_usuario: string
  correo: string
  id_rol: string
  nombre: string
  twoFactorEnabled: boolean
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
  const [twoFactorPending, setTwoFactorPending] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)
  const { showLoader, hideLoader } = useLoader()

  // Función para refrescar el token
  const refreshUserSession = async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      removeToken()
      setIsAuthenticated(false)
      setUser(null)
      return
    }

    try {
      const { token, refreshToken: newRefreshToken } = await authAPI.refreshToken(refreshToken)
      setToken(token)
      setRefreshToken(newRefreshToken)
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
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
          setIsAuthenticated(true)

          // Configurar un intervalo para refrescar el token periódicamente
          const refreshInterval = setInterval(
            () => {
              refreshUserSession()
            },
            15 * 60 * 1000,
          ) // Refrescar cada 15 minutos

          return () => clearInterval(refreshInterval)
        } catch (error) {
          console.error("Error al verificar el token:", error)
          removeToken()
          removeRefreshToken()
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    showLoader()
    try {
      const { token, user, requireTwoFactor } = await authAPI.login(username, password)

      if (requireTwoFactor) {
        // Si se requiere 2FA, guardamos el token temporal pero no establecemos la autenticación completa
        setTempToken(token)
        setTwoFactorPending(true)
        hideLoader()
        return { requireTwoFactor: true }
      }

      // Si no se requiere 2FA o ya se ha completado, procedemos con la autenticación normal
      setToken(token.accessToken)
      setRefreshToken(token.refreshToken)
      setUser(user)
      setIsAuthenticated(true)
      hideLoader()
      return { requireTwoFactor: false }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      hideLoader()
      throw error
    }
  }

  const verifyTwoFactor = async (code: string) => {
    if (!twoFactorPending || !tempToken) {
      throw new Error("No hay una verificación de dos factores pendiente")
    }

    showLoader()
    try {
      const { token, user } = await authAPI.verifyTwoFactor(tempToken, code)
      setToken(token.accessToken)
      setRefreshToken(token.refreshToken)
      setUser(user)
      setIsAuthenticated(true)
      setTwoFactorPending(false)
      setTempToken(null)
    } catch (error) {
      console.error("Error al verificar código de dos factores:", error)
      throw error
    } finally {
      hideLoader()
    }
  }

  const enableTwoFactor = async () => {
    showLoader()
    try {
      const { secret, qrCodeUrl } = await authAPI.enableTwoFactor()
      return { secret, qrCodeUrl }
    } catch (error) {
      console.error("Error al habilitar autenticación de dos factores:", error)
      throw error
    } finally {
      hideLoader()
    }
  }

  const disableTwoFactor = async (code: string) => {
    showLoader()
    try {
      await authAPI.disableTwoFactor(code)
      // Actualizar el usuario para reflejar que 2FA está deshabilitado
      const userData = await authAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Error al deshabilitar autenticación de dos factores:", error)
      throw error
    } finally {
      hideLoader()
    }
  }

  const register = async (userData: any) => {
    showLoader()
    try {
      await authAPI.register(userData)
    } catch (error) {
      console.error("Error al registrar usuario:", error)
      throw error
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
