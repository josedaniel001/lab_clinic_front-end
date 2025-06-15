"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  route?: string
  text?: string
  variant?: "default" | "outline" | "ghost"
}

export function BackButton({ route, text = "Regresar", variant = "outline" }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (route) {
      router.push(route)
    } else {
      router.back()
    }
  }

  return (
    <Button variant={variant} onClick={handleBack} className="mb-6 gap-2 hover:gap-3 transition-all duration-200">
      <ArrowLeft className="h-4 w-4" />
      {text}
    </Button>
  )
}
