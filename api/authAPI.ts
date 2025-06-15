import {
  mockLogin,
  mockRegister,
  mockGetCurrentUser,
  mockRefreshToken,
  mockVerifyTwoFactor,
  mockEnableTwoFactor,
  mockDisableTwoFactor,
} from "./mockData"

export const authAPI = {
  /**
   * Inicia sesión con nombre de usuario y contraseña
   */
  login: async (username: string, password: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/auth/login', { username, password })
    // return response.data

    // Simulación con datos de prueba
    return mockLogin(username, password)
  },

  /**
   * Registra un nuevo usuario
   */
  register: async (userData: any) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/auth/register', userData)
    // return response.data

    // Simulación con datos de prueba
    return mockRegister(userData)
  },

  /**
   * Obtiene la información del usuario actual
   */
  getCurrentUser: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.get('/auth/me')
    // return response.data

    // Simulación con datos de prueba
    return mockGetCurrentUser()
  },

  /**
   * Refresca el token de acceso usando el refresh token
   */
  refreshToken: async (refreshToken: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/auth/refresh', { refreshToken })
    // return response.data

    // Simulación con datos de prueba
    return mockRefreshToken(refreshToken)
  },

  /**
   * Verifica el código de autenticación de dos factores
   */
  verifyTwoFactor: async (tempToken: string, code: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/auth/verify-2fa', { tempToken, code })
    // return response.data

    // Simulación con datos de prueba
    return mockVerifyTwoFactor(tempToken, code)
  },

  /**
   * Habilita la autenticación de dos factores para el usuario actual
   */
  enableTwoFactor: async () => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/auth/enable-2fa')
    // return response.data

    // Simulación con datos de prueba
    return mockEnableTwoFactor()
  },

  /**
   * Deshabilita la autenticación de dos factores para el usuario actual
   */
  disableTwoFactor: async (code: string) => {
    // En un entorno real, esto sería una llamada a la API
    // const response = await api.post('/auth/disable-2fa', { code })
    // return response.data

    // Simulación con datos de prueba
    return mockDisableTwoFactor(code)
  },
}
