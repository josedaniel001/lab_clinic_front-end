"use client"

import type { ReactNode } from "react"
import { BackButton } from "@/components/ui/BackButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search } from "lucide-react"

interface PageLayoutProps {
  title: string
  description: string
  icon: ReactNode
  backRoute?: string
  children: ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
  actions?: ReactNode
  stats?: Array<{
    title: string
    value: string | number
    icon: ReactNode
    color: string
    trend?: string
  }>
}

export function PageLayout({
  title,
  description,
  icon,
  backRoute = "/dashboard",
  children,
  searchValue = "",
  onSearchChange,
  onRefresh,
  isRefreshing = false,
  actions,
  stats,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Back Button */}
        <BackButton route={backRoute} />

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-lg border border-blue-100">{icon}</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-gray-700 mt-1 font-medium">{description}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              // Definir colores específicos basados en el color prop
              const getCardColors = (color: string) => {
                switch (color) {
                  case "primary":
                    return {
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      textColor: "#ffffff",
                    }
                  case "success":
                    return {
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      textColor: "#ffffff",
                    }
                  case "error":
                    return {
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      textColor: "#ffffff",
                    }
                  case "warning":
                    return {
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      textColor: "#ffffff",
                    }
                  case "info":
                    return {
                      background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                      textColor: "#ffffff",
                    }
                  case "secondary":
                    return {
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      textColor: "#ffffff",
                    }
                  default:
                    return {
                      background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                      textColor: "#ffffff",
                    }
                }
              }

              const cardColors = getCardColors(stat.color)

              return (
                <Card key={index} className="overflow-hidden border-0 shadow-lg bg-white">
                  <CardContent className="p-0">
                    <div
                      className="p-4"
                      style={{
                        background: cardColors.background,
                        color: cardColors.textColor,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p
                            className="text-xs font-medium uppercase tracking-wide mb-1"
                            style={{ color: "rgba(255, 255, 255, 0.9)" }}
                          >
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold mb-1" style={{ color: "#ffffff" }}>
                            {stat.value}
                          </p>
                          {stat.trend && (
                            <p
                              className="text-xs px-2 py-1 rounded-full inline-block"
                              style={{
                                color: "rgba(255, 255, 255, 0.8)",
                                backgroundColor: "rgba(255, 255, 255, 0.2)",
                              }}
                            >
                              {stat.trend}
                            </p>
                          )}
                        </div>
                        <div
                          className="ml-3 p-2 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            color: "#ffffff",
                          }}
                        >
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
                <CardDescription className="text-blue-100">{description}</CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search */}
                {onSearchChange && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Buscar..."
                      value={searchValue}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-10 w-full sm:w-80 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      style={{
                        backgroundColor: "white",
                        color: "#1f2937",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>
                )}

                {/* Refresh Button */}
                {onRefresh && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="gradient-primary hover:gradient-success text-white border-white/30"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    {isRefreshing ? "Actualizando..." : "Actualizar"}
                  </Button>
                )}

                {/* Custom Actions */}
                {actions}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-white text-gray-900">{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
