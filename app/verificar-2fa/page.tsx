"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useNotification } from "@/hooks/useNotification"
import Image from "next/image"
import Link from "next/link"

// Versión simplificada sin componentes problemáticos de Material UI
export default function VerificarTwoFactorPage() {
  const router = useRouter()
  const { verifyTwoFactor } = useAuth()
  const { showNotification } = useNotification()

  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente esté montado antes de renderizar
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!code.trim()) {
      setError("Ingrese el código de verificación")
      return
    }

    setIsLoading(true)
    try {
      await verifyTwoFactor(code)
      showNotification("Verificación exitosa", "success")

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Error en la verificación:", error)
      setError("Código de verificación inválido")
      showNotification("Error en la verificación", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // No renderizar nada durante SSR
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6 w-[180px] h-[60px] relative">
            <Image src="/logo-labofutura.png" alt="LaboFutura Logo" fill style={{ objectFit: "contain" }} />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Verificación de Dos Factores</h1>

          {/* Descripción */}
          <p className="text-gray-600 text-center mb-6">
            Ingrese el código de verificación de su aplicación de autenticación
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Verificación
              </label>
              <input
                type="text"
                id="code"
                name="code"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className={`w-full px-4 py-2 border ${
                  error ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Ingrese el código de 6 dígitos"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verificando...
                  </>
                ) : (
                  "Verificar"
                )}
              </button>

              <Link
                href="/login"
                className="w-full block text-center border border-blue-600 text-blue-600 font-medium py-2 px-4 rounded-md hover:bg-blue-50 transition duration-200"
              >
                Volver al Inicio de Sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
