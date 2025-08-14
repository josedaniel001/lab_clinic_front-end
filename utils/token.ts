// Duración del token en milisegundos (24 horas)
const TOKEN_DURATION = 24 * 60 * 60 * 1000

// Claves para almacenar tokens en localStorage
const TOKEN_KEY = "labofutura_token"
const TOKEN_EXPIRY_KEY = "labofutura_token_expiry"
const REFRESH_TOKEN_KEY = "labofutura_refresh_token"

/**
 * Guarda el token JWT en localStorage con tiempo de expiración
 */
export const setToken = (token: string) => {
  const expiryTime = new Date().getTime() + TOKEN_DURATION
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
}

/**
 * Guarda el refresh token en localStorage
 */
export const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * Obtiene el token JWT de localStorage si es válido
 * Retorna null si no existe o ha expirado
 */
export const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)

  if (!token || !expiryTime) {
    return null
  }

  const now = new Date().getTime()

  if (now > Number.parseInt(expiryTime)) {
    removeToken()
    return null
  }

  return token
}

/**
 * Obtiene el refresh token de localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Elimina el token JWT de localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Elimina el refresh token de localStorage
 */
export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
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
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiryTime) return 0

  const now = new Date().getTime()
  const expiry = Number.parseInt(expiryTime)

  return Math.max(0, Math.floor((expiry - now) / 1000))
}
