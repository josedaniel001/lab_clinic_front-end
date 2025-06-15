// Duración del token en milisegundos (por ejemplo, 1 hora)
const TOKEN_DURATION = 1 * 60 * 60 * 1000

// Claves para almacenar tokens en sessionStorage
const TOKEN_KEY = "labofutura_token"
const TOKEN_EXPIRY_KEY = "labofutura_token_expiry"
const REFRESH_TOKEN_KEY = "labofutura_refresh_token"

/**
 * Guarda el token JWT en sessionStorage con tiempo de expiración
 */
export const setToken = (token: string) => {
  const expiryTime = new Date().getTime() + TOKEN_DURATION
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
}

/**
 * Guarda el refresh token en sessionStorage
 */
export const setRefreshToken = (refreshToken: string) => {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * Obtiene el token JWT de sessionStorage si es válido
 * Retorna null si no existe o ha expirado
 */
export const getToken = (): string | null => {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY)

  if (!token || !expiryTime) {
    return null
  }

  const now = new Date().getTime()

  if (now > Number.parseInt(expiryTime)) {
    // El token ha expirado, lo eliminamos
    removeToken()
    return null
  }

  return token
}

/**
 * Obtiene el refresh token de sessionStorage
 */
export const getRefreshToken = (): string | null => {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Elimina el token JWT de sessionStorage
 */
export const removeToken = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Elimina el refresh token de sessionStorage
 */
export const removeRefreshToken = () => {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Verifica si el token está presente y es válido
 */
export const isTokenValid = (): boolean => {
  return getToken() !== null
}

/**
 * Obtiene el tiempo restante de validez del token en segundos
 */
export const getTokenRemainingTime = (): number => {
  const expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiryTime) return 0

  const now = new Date().getTime()
  const expiry = Number.parseInt(expiryTime)

  return Math.max(0, Math.floor((expiry - now) / 1000))
}
