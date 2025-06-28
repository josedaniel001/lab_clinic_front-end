"use client"

import { createContext, useState, useCallback, type ReactNode } from "react"

type NotificationType = "success" | "info" | "warning" | "error" | "primary"

interface NotificationState {
  open: boolean
  message: string
  type: NotificationType
}

interface NotificationContextType {
  notification: NotificationState
  showNotification: (message: string, type: NotificationType) => void
  hideNotification: () => void
}

export const NotificationContext = createContext<NotificationContextType>({
  notification: {
    open: false,
    message: "",
    type: "info",
  },
  showNotification: () => {},
  hideNotification: () => {},
})

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    type: "info",
  })

  const showNotification = useCallback((message: string, type: NotificationType = "info") => {
    setNotification({
      open: true,
      message,
      type,
    })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }))
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
