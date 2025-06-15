"use client"

import { useLoader } from "@/hooks/useLoader"
import { Backdrop, Box, CircularProgress, Typography, IconButton } from "@mui/material"
import { keyframes } from "@mui/system"
import { useState, useEffect } from "react"

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

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

export default function GlobalLoader() {
  const { loading, resetLoader } = useLoader()
  const [showResetButton, setShowResetButton] = useState(false)

  // Mostrar el botón de reset después de 5 segundos si el loader sigue activo
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (loading) {
      timer = setTimeout(() => {
        setShowResetButton(true)
      }, 5000)
    } else {
      setShowResetButton(false)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [loading])

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 2,
        backdropFilter: "blur(3px)",
        flexDirection: "column",
        gap: 2,
      }}
      open={loading}
    >
      <Box
        sx={{
          position: "relative",
          width: 100,
          height: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          animation: `${pulse} 2s infinite ease-in-out`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "primary.main",
            animation: `${rotate} 1.5s linear infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "secondary.main",
            animation: `${rotate} 2s linear infinite reverse`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "info.main",
            animation: `${rotate} 1s linear infinite`,
          }}
        />
        <CircularProgress
          size={40}
          sx={{
            color: "white",
          }}
        />
      </Box>
      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Cargando...
      </Typography>

      {showResetButton && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ mb: 1, display: "block", textAlign: "center" }}>
            ¿El cargador está atascado?
          </Typography>
          <IconButton
            onClick={resetLoader}
            sx={{
              color: "white",
              border: "1px solid white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            aria-label="Reiniciar cargador"
          >
            Reiniciar
          </IconButton>
        </Box>
      )}
    </Backdrop>
  )
}
