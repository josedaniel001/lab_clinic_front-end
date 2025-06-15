"use client"

import { useContext } from "react"
import { LoaderContext } from "@/contexts/LoaderContext"

export function useLoader() {
  const context = useContext(LoaderContext)

  if (!context) {
    throw new Error("useLoader debe ser usado dentro de un LoaderProvider")
  }

  return context
}
