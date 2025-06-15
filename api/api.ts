import axios from "axios"
import { getToken } from "@/utils/token"

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.labofutura.com/api"

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Redirigir a la página de login si es necesario
      if (typeof window !== "undefined") {
        // Solo ejecutar en el cliente
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api
