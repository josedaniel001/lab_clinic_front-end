import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ThemeRegistry from "@/theme/ThemeRegistry"
import { AuthProvider } from "@/contexts/AuthContext"
import { LoaderProvider } from "@/contexts/LoaderContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { RoleProvider } from "@/contexts/RoleContext"
import GlobalLoader from "@/components/ui/GlobalLoader"
import GlobalNotification from "@/components/ui/GlobalNotification"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LaboFutura - Sistema de Laboratorio Clínico",
  description: "Sistema integral para la gestión de laboratorios clínicos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeRegistry>
          <LoaderProvider>
            <NotificationProvider>
              <AuthProvider>
                <RoleProvider>
                  <GlobalLoader />
                  <GlobalNotification />
                  {children}
                </RoleProvider>
              </AuthProvider>
            </NotificationProvider>
          </LoaderProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
