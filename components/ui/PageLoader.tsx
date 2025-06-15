"use client"

import { Box, Typography } from "@mui/material"
import { keyframes } from "@mui/system"
import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
`

interface PageLoaderProps {
  message?: string
  autoHide?: boolean
}

export default function PageLoader({ message = "Cargando datos...", autoHide = false }: PageLoaderProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, 800) // Tiempo suficiente para que se muestre la animación

      return () => clearTimeout(timer)
    }
  }, [autoHide])

  if (!visible) return null

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        animation: `${fadeIn} 0.3s ease-in-out`,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 120,
          height: 120,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          animation: `${pulse} 2s infinite ease-in-out`,
        }}
      >
        {/* Flecha exterior */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "primary.main",
            borderRightColor: "primary.main",
            animation: `${rotate} 2s linear infinite`,
          }}
        />

        {/* Flecha media */}
        <Box
          sx={{
            position: "absolute",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "secondary.main",
            borderLeftColor: "secondary.main",
            animation: `${rotate} 1.5s linear infinite reverse`,
          }}
        />

        {/* Flecha interior */}
        <Box
          sx={{
            position: "absolute",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderBottomColor: "info.main",
            borderRightColor: "info.main",
            animation: `${rotate} 1s linear infinite`,
          }}
        />

        {/* Icono central */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "background.paper",
            borderRadius: "50%",
            width: "40%",
            height: "40%",
            boxShadow: 3,
          }}
        >
          <RotateCcw
            size={24}
            color="#1976d2"
            style={{
              animation: `${rotate} 3s linear infinite`,
            }}
          />
        </Box>
      </Box>

      <Typography
        variant="h6"
        component="div"
        sx={{
          mt: 3,
          fontWeight: 500,
          color: "text.primary",
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}
