import axios from "axios"
import { getToken, setToken, getRefreshToken, removeToken, removeRefreshToken } from "@/utils/token"

// Intentar diferentes URLs para el backend
const API_URLS = [process.env.NEXT_PUBLIC_API_URL, "http://192.168.1.4:8000/api", "http://127.0.0.1:8000/api"].filter(
  Boolean,
)

const API_URL = API_URLS[1]

// Crear instancia de axios con configuración mejorada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 segundos
  withCredentials: true, // Habilitar cookies para CORS
})

// Variable para evitar múltiples llamadas de refresh simultáneas
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor de request para agregar token de autorización
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Configuración adicional para CORS
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Manejar errores de red
    if (error.code === "ERR_NETWORK") {
      throw new Error("No se puede conectar con el servidor. Verifica tu conexión a internet.")
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Timeout de conexión. El servidor tardó demasiado en responder.")
    }

    // Manejar errores 401 (token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          setToken(access)

          processQueue(null, access)
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        } catch (refreshError: any) {
          processQueue(refreshError, null)

          // Solo cerrar sesión si es un error definitivo, no temporal
          if (refreshError.response?.status === 401 || refreshError.response?.status === 400) {
            removeToken()
            removeRefreshToken()

            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
          }

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // Solo redirigir si no hay refresh token
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

export default api
