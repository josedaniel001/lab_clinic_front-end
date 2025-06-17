import type React from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Ya no necesita nada, el TopBar maneja todo
  return <>{children}</>
}
