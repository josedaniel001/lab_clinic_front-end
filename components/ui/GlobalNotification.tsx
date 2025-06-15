"use client"

import { useEffect, useState } from "react"
import { useNotification } from "@/hooks/useNotification"

export default function GlobalNotification() {
  const { notification, hideNotification } = useNotification()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (notification.open) {
      const timer = setTimeout(() => {
        hideNotification()
      }, notification.duration || 6000)
      return () => clearTimeout(timer)
    }
  }, [notification, hideNotification])

  if (!mounted || !notification.open) {
    return null
  }

  // Determinar el color basado en el tipo
  const getColorClasses = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-500 text-white"
      case "error":
        return "bg-red-500 text-white"
      case "warning":
        return "bg-amber-500 text-white"
      case "info":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-700 text-white"
    }
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center z-50 pointer-events-none">
      <div
        className={`${getColorClasses()} py-2 px-4 rounded-md shadow-lg max-w-md mx-4 pointer-events-auto flex items-center justify-between animate-fadeIn`}
      >
        <span>{notification.message}</span>
        <button onClick={hideNotification} className="ml-4 text-white hover:text-gray-200 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
