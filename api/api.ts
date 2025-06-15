import axios from "axios"
import { getToken, setToken, getRefreshToken, removeToken, removeRefreshToken } from "@/utils/token"

// Intentar diferentes URLs para el backend
const API_URLS = [process.env.NEXT_PUBLIC_API_URL, "http://localhost:8000/api", "http://127.0.0.1:8000/api"].filter(
  Boolean,
)

const API_URL = API_URLS[0] || "http://localhost:8000/api"

console.log("🔗 Configurando API con URL:", API_URL)

// Crear instancia de axios con configuración mejorada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 segundos
  withCredentials: false, // Cambiar a true si necesitas cookies
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

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`)

    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    console.error("❌ Response Error:", error.message)

    // Manejar diferentes tipos de errores
    if (error.code === "ERR_NETWORK") {
      console.error("🔌 Error de red - Django no está disponible")
      throw new Error("No se puede conectar con el servidor. Verifica que Django esté corriendo en puerto 8000.")
    }

    if (error.code === "ECONNABORTED") {
      console.error("⏱️ Timeout de conexión")
      throw new Error("Timeout de conexión. El servidor tardó demasiado en responder.")
    }

    const originalRequest = error.config

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
          console.log("🔄 Renovando token...")
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          setToken(access)

          processQueue(null, access)
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        } catch (refreshError) {
          console.error("❌ Error renovando token:", refreshError)
          processQueue(refreshError, null)

          removeToken()
          removeRefreshToken()

          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

export default api
