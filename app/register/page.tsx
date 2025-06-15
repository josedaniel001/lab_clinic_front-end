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
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material"
import { Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material"
import Image from "next/image"

export default function Register() {
  const router = useRouter()
  const { register } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()

  const [formData, setFormData] = useState({
    nombre: "",
    nombre_usuario: "",
    correo: "",
    password: "",
    confirmPassword: "",
    id_rol: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    nombre: "",
    nombre_usuario: "",
    correo: "",
    password: "",
    confirmPassword: "",
    id_rol: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name as string]: value,
    })
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      nombre: "",
      nombre_usuario: "",
      correo: "",
      password: "",
      confirmPassword: "",
      id_rol: "",
    }

    // Nombre validation
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    }

    // Username validation
    if (!formData.nombre_usuario.trim()) {
      newErrors.nombre_usuario = "El nombre de usuario es requerido"
      isValid = false
    } else if (formData.nombre_usuario.length < 4) {
      newErrors.nombre_usuario = "El nombre de usuario debe tener al menos 4 caracteres"
      isValid = false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo electrónico es requerido"
      isValid = false
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = "Ingrese un correo electrónico válido"
      isValid = false
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
      isValid = false
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme su contraseña"
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
      isValid = false
    }

    // Role validation
    if (!formData.id_rol) {
      newErrors.id_rol = "Seleccione un rol"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    showLoader()

    try {
      await register(formData)
      showNotification("Registro exitoso. Ahora puede iniciar sesión.", "success")
      router.push("/login")
    } catch (error) {
      showNotification("Error al registrar usuario. Intente nuevamente.", "error")
    } finally {
      hideLoader()
    }
  }

  // Mock roles for demonstration
  const roles = [
    { id: "1", nombre: "Administrador" },
    { id: "2", nombre: "Bioquímico" },
    { id: "3", nombre: "Recepcionista" },
    { id: "4", nombre: "Técnico de Laboratorio" },
  ]

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
      <Container maxWidth="md">
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
              Registro de Usuario
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Complete el formulario para crear una nueva cuenta
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="nombre"
                    label="Nombre Completo"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="nombre_usuario"
                    label="Nombre de Usuario"
                    name="nombre_usuario"
                    value={formData.nombre_usuario}
                    onChange={handleChange}
                    error={!!errors.nombre_usuario}
                    helperText={errors.nombre_usuario}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="correo"
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    error={!!errors.correo}
                    helperText={errors.correo}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
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
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.id_rol}>
                    <InputLabel id="role-label">Rol</InputLabel>
                    <Select
                      labelId="role-label"
                      id="id_rol"
                      name="id_rol"
                      value={formData.id_rol}
                      label="Rol"
                      onChange={handleChange}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.id_rol && <FormHelperText>{errors.id_rol}</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PersonAdd />}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                Registrarse
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Typography variant="body2" color="primary">
                    ¿Ya tiene una cuenta? Inicie sesión aquí
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
