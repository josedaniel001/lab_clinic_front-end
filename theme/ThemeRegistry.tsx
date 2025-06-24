"use client"

import { useState, useEffect, type ReactNode } from "react"
import { ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

interface ThemeRegistryProps {
  children: ReactNode
}

// Crear tema personalizado
let theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Azul principal
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#26a69a", // Verde clínico
      light: "#4db6ac",
      dark: "#00796b",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#2e7d32",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
    
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow:
            "0px 2px 4px -1px rgba(0,0,0,0.05), 0px 4px 5px 0px rgba(0,0,0,0.04), 0px 1px 10px 0px rgba(0,0,0,0.03)",
        },
      },
    },
  },
})

// Hacer las fuentes responsivas
theme = responsiveFontSizes(theme)

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar problemas de hidratación renderizando solo en el cliente
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
