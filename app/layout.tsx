import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ThemeRegistry from "@/theme/ThemeRegistry"
import { AuthProvider } from "@/contexts/AuthContext"
import { LoaderProvider } from "@/contexts/LoaderContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { RoleProvider } from "@/contexts/RoleContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import GlobalLoader from "@/components/ui/GlobalLoader"
import GlobalNotification from "@/components/ui/GlobalNotification"
import Header from "@/components/layout/Header"
import { ConnectionSimulatorPanel } from "@/components/dev/ConnectionSimulatorPanel"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LaboFutura - Sistema de Laboratorio Clínico",
  description: "Sistema integral para la gestión de laboratorios clínicos",
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
          <ThemeProvider>
            <LoaderProvider>
              <NotificationProvider>
                <AuthProvider>
                  <RoleProvider>
                    <GlobalLoader />
                    <GlobalNotification />
                    <Header />
                    <div >
                      <main className="transition-all duration-300 ease-in-out lg:ml-72 p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
                        {children}
                      </main>
                    </div>
                    {process.env.NODE_ENV === "development" && <ConnectionSimulatorPanel />}
                  </RoleProvider>
                </AuthProvider>
              </NotificationProvider>
            </LoaderProvider>
          </ThemeProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
