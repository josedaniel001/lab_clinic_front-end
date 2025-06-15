import api from "./api"

export const authAPI = {
  /**
   * Inicia sesión con username y password usando Django JWT
   */
  login: async (username: string, password: string) => {
    try {
      const response = await api.post("/token/", {
        username,
        password,
      })

      const { access, refresh } = response.data

      return {
        token: {
          accessToken: access,
          refreshToken: refresh,
        },
        user: null, // Lo obtendremos después con getCurrentUser
        requireTwoFactor: false,
      }
    } catch (error: any) {
      console.error("Error en login:", error)
      throw new Error(error.response?.data?.detail || "Error de autenticación")
    }
  },

  /**
   * Obtiene la información del usuario actual
   */
  getCurrentUser: async () => {
    try {
      // Asumiendo que tienes un endpoint para obtener el usuario actual
      const response = await api.get("/auth/me/")
      return response.data
    } catch (error: any) {
      console.error("Error al obtener usuario:", error)
      throw error
    }
  },

  /**
   * Refresca el token de acceso usando el refresh token
   */
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post("/token/refresh/", {
        refresh: refreshToken,
      })

      const { access } = response.data

      return {
        token: access,
        refreshToken: refreshToken, // El refresh token se mantiene igual
      }
    } catch (error: any) {
      console.error("Error al refrescar token:", error)
      throw new Error("Token de refresco inválido")
    }
  },

  /**
   * Registra un nuevo usuario
   */
  register: async (userData: any) => {
    try {
      const response = await api.post("/auth/register/", userData)
      return response.data
    } catch (error: any) {
      console.error("Error en registro:", error)
      throw new Error(error.response?.data?.detail || "Error en el registro")
    }
  },

  /**
   * Verifica el código de autenticación de dos factores
   */
  verifyTwoFactor: async (tempToken: string, code: string) => {
    // Implementar cuando tengas 2FA en Django
    throw new Error("2FA no implementado aún")
  },

  /**
   * Habilita la autenticación de dos factores
   */
  enableTwoFactor: async () => {
    // Implementar cuando tengas 2FA en Django
    throw new Error("2FA no implementado aún")
  },

  /**
   * Deshabilita la autenticación de dos factores
   */
  disableTwoFactor: async (code: string) => {
    // Implementar cuando tengas 2FA en Django
    throw new Error("2FA no implementado aún")
  },
}
