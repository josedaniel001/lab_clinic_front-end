"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"

interface LoaderContextType {
  loading: boolean
  showLoader: () => void
  hideLoader: () => void
  resetLoader: () => void
}

export const LoaderContext = createContext<LoaderContextType>({
  loading: false,
  showLoader: () => {},
  hideLoader: () => {},
  resetLoader: () => {},
})

interface LoaderProviderProps {
  children: ReactNode
}

export function LoaderProvider({ children }: LoaderProviderProps) {
  const [loading, setLoading] = useState(false)
  const [loadingCount, setLoadingCount] = useState(0)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Función de seguridad para evitar que el loader se quede atascado
  useEffect(() => {
    if (loading) {
      // Si el loader está activo por más de 10 segundos, lo reseteamos automáticamente
      const id = setTimeout(() => {
        console.warn("Loader safety timeout triggered - resetting loader state")
        resetLoader()
      }, 10000)

      setTimeoutId(id)

      return () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
    } else if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }, [loading])

  const showLoader = () => {
    setLoadingCount((prev) => prev + 1)
    setLoading(true)
  }

  const hideLoader = () => {
    setLoadingCount((prev) => {
      const newCount = Math.max(0, prev - 1)
      if (newCount === 0) {
        setLoading(false)
      }
      return newCount
    })
  }

  const resetLoader = () => {
    setLoadingCount(0)
    setLoading(false)
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader, resetLoader }}>{children}</LoaderContext.Provider>
  )
}
