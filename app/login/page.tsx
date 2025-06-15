"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  Collapse,
} from "@mui/material"
import { Visibility, VisibilityOff, Login as LoginIcon, Settings } from "@mui/icons-material"
import Image from "next/image"
import NetworkDiagnostic from "@/components/dev/NetworkDiagnostic"

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ username: "", password: "" })
  const [networkError, setNetworkError] = useState("")
  const [showDiagnostic, setShowDiagnostic] = useState(false)

  const validateForm = () => {
    let isValid = true
    const newErrors = { username: "", password: "" }

    if (!username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
      isValid = false
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNetworkError("")

    if (!validateForm()) return

    showLoader()

    try {
      const { requireTwoFactor } = await login(username, password)

      if (requireTwoFactor) {
        router.push("/verificar-2fa")
      } else {
        showNotification("Inicio de sesión exitoso", "success")
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Error en login:", error)

      if (error.message.includes("conectar con el servidor")) {
        setNetworkError(error.message)
        setShowDiagnostic(true)
      } else if (error.message.includes("Timeout")) {
        setNetworkError("El servidor tardó demasiado en responder. Verifica tu conexión.")
      } else {
        showNotification(error.message || "Error de autenticación", "error")
      }
    } finally {
      hideLoader()
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "white",
            }}
          >
            <Box sx={{ mb: 3, width: "180px", height: "60px", position: "relative" }}>
              <Image src="/logo-labofutura.png" alt="LaboFutura Logo" fill style={{ objectFit: "contain" }} />
            </Box>

            <Typography component="h1" variant="h5" color="primary" fontWeight="bold" gutterBottom>
              Iniciar Sesión
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Ingrese sus credenciales para acceder al sistema
            </Typography>

            {/* Error de red */}
            <Collapse in={!!networkError} sx={{ width: "100%", mb: 2 }}>
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setShowDiagnostic(!showDiagnostic)}
                    startIcon={<Settings />}
                  >
                    Diagnóstico
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight="bold">
                  Error de Conexión
                </Typography>
                <Typography variant="body2">{networkError}</Typography>
              </Alert>
            </Collapse>

            {/* Panel de diagnóstico */}
            <Collapse in={showDiagnostic} sx={{ width: "100%", mb: 2 }}>
              <NetworkDiagnostic />
            </Collapse>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nombre de Usuario"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!errors.username}
                helperText={errors.username}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<LoginIcon />}
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                Iniciar Sesión
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link href="/register" style={{ textDecoration: "none" }}>
                  <Typography variant="body2" color="primary">
                    ¿No tiene una cuenta? Regístrese aquí
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
