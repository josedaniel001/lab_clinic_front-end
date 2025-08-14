"use client"

import { useNotification } from "@/hooks/useNotification"
import { useEffect } from "react"
import { X } from "lucide-react"
import clsx from "clsx"

export default function GlobalNotification() {
  const { notification, hideNotification } = useNotification()

  useEffect(() => {
    if (notification.open) {
      const timeout = setTimeout(() => {
        hideNotification()
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [notification.open, hideNotification])

  if (!notification.open) return null

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-slide-in">
      <div
        className={clsx(
          "flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg text-white min-w-[280px] max-w-sm",
          {
            "bg-green-600": notification.type === "success",
            "bg-blue-600": notification.type === "info",
            "bg-yellow-500": notification.type === "warning",
            "bg-red-600": notification.type === "error",
            "bg-indigo-600": notification.type === "primary",
            "bg-purple-600": notification.type === "secondary",
          }
        )}
      >
        <div className="flex-1 text-sm">{notification.message}</div>
        <button onClick={hideNotification} className="text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
