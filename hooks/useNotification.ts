"use client"

import { useContext } from "react"
import { NotificationContext } from "@/contexts/NotificationContext"

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotification debe ser usado dentro de un NotificationProvider")
  }

  return context
}
