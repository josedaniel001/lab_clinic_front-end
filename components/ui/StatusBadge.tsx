"use client"

import { Chip } from "@mui/material"
import type { ReactNode } from "react"

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "default"
  label: string | ReactNode
  size?: "small" | "medium"
  variant?: "filled" | "outlined"
}

export function StatusBadge({ status, label, size = "small", variant = "filled" }: StatusBadgeProps) {
  const getColor = () => {
    switch (status) {
      case "success":
        return "success"
      case "warning":
        return "warning"
      case "error":
        return "error"
      case "info":
        return "info"
      default:
        return "default"
    }
  }

  return <Chip label={label} color={getColor() as any} size={size} variant={variant} />
}
