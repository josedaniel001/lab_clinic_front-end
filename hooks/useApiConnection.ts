"use client"

import { useState, useEffect } from "react"
import { setBackendURL } from "@/api/api"

interface ApiConnectionStatus {
  isConnected: boolean
  currentURL: string
  isLoading: boolean
  error: string | null
}

export const useApiConnection = () => {
  const [status, setStatus] = useState<ApiConnectionStatus>({
    isConnected: false,
    currentURL: "",
    isLoading: true,
    error: null,
  })

  const testConnection = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(`${url}/health/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const connectToBackend = async (url: string) => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const isConnected = await testConnection(url)
      
      if (isConnected) {
        setBackendURL(url)
        setStatus({
          isConnected: true,
          currentURL: url,
          isLoading: false,
          error: null,
        })
        console.log(`✅ Conectado exitosamente a: ${url}`)
      } else {
        setStatus({
          isConnected: false,
          currentURL: url,
          isLoading: false,
          error: `No se pudo conectar a ${url}`,
        })
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        currentURL: url,
        isLoading: false,
        error: `Error al conectar: ${error}`,
      })
    }
  }

  const getLocalIPs = async (): Promise<string[]> => {
    const ips: string[] = []
    
    try {
      // Intentar obtener la IP local del navegador
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      
      // Generar posibles IPs locales basadas en la IP pública
      const baseIP = data.ip.split(".").slice(0, 3).join(".")
      for (let i = 1; i <= 254; i++) {
        ips.push(`http://${baseIP}.${i}:8000/api`)
      }
    } catch (error) {
      // Si no se puede obtener la IP pública, usar rangos comunes
      const commonRanges = [
        "192.168.1",
        "192.168.0", 
        "10.0.0",
        "172.16.0",
      ]
      
      commonRanges.forEach(range => {
        for (let i = 1; i <= 254; i++) {
          ips.push(`http://${range}.${i}:8000/api`)
        }
      })
    }
    
    return ips
  }

  const autoDetectBackend = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }))
    
    const urls = [
      // URLs específicas
      "http://localhost:8000/api",
      "http://127.0.0.1:8000/api",
      "http://bioanalisisadmin.com/api",
      "http://lab_clinic_web:8000/api",
      
      // IPs comunes
      "http://192.168.1.100:8000/api",
      "http://192.168.1.4:8000/api",
      "http://10.0.0.100:8000/api",
    ]
    
    // Agregar IPs locales detectadas
    const localIPs = await getLocalIPs()
    urls.push(...localIPs.slice(0, 10)) // Limitar a las primeras 10 IPs
    
    for (const url of urls) {
      const isConnected = await testConnection(url)
      if (isConnected) {
        setBackendURL(url)
        setStatus({
          isConnected: true,
          currentURL: url,
          isLoading: false,
          error: null,
        })
        console.log(`✅ Backend detectado automáticamente en: ${url}`)
        return
      }
    }
    
    setStatus({
      isConnected: false,
      currentURL: "",
      isLoading: false,
      error: "No se pudo detectar ningún backend disponible",
    })
  }

  useEffect(() => {
    autoDetectBackend()
  }, [])

  return {
    ...status,
    connectToBackend,
    autoDetectBackend,
  }
}
