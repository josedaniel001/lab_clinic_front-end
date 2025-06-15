"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Grid,
  Avatar,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
  Chip,
} from "@mui/material"
import { Visibility, VisibilityOff, Save as SaveIcon, Person as PersonIcon } from "@mui/icons-material"

// Añadir la importación del BackButton
import { BackButton } from "@/components/ui/BackButton"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function PerfilPage() {
  const { user } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()

  const [tabValue, setTabValue] = useState(0)
  const [perfilData, setPerfilData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user) {
      setPerfilData({
        nombre: user.nombre || "",
        correo: user.correo || "",
        telefono: "", // Asumimos que no tenemos este dato inicialmente
      })
    }
  }, [user])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPerfilData({
      ...perfilData,
      [name]: value,
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const validatePerfilForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Nombre validation
    if (!perfilData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    } else {
      newErrors.nombre = ""
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!perfilData.correo.trim()) {
      newErrors.correo = "El correo electrónico es requerido"
      isValid = false
    } else if (!emailRegex.test(perfilData.correo)) {
      newErrors.correo = "Ingrese un correo electrónico válido"
      isValid = false
    } else {
      newErrors.correo = ""
    }

    // Teléfono validation (opcional)
    if (perfilData.telefono) {
      const phoneRegex = /^\d{10}$/
      if (!phoneRegex.test(perfilData.telefono)) {
        newErrors.telefono = "Ingrese un número de teléfono válido (10 dígitos)"
        isValid = false
      } else {
        newErrors.telefono = ""
      }
    } else {
      newErrors.telefono = ""
    }

    setErrors(newErrors)
    return isValid
  }

  const validatePasswordForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Current password validation
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida"
      isValid = false
    } else {
      newErrors.currentPassword = ""
    }

    // New password validation
    if (!passwordData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida"
      isValid = false
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres"
      isValid = false
    } else {
      newErrors.newPassword = ""
    }

    // Confirm password validation
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Confirme su nueva contraseña"
      isValid = false
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
      isValid = false
    } else {
      newErrors.confirmPassword = ""
    }

    setErrors(newErrors)
    return isValid
  }

  const handleUpdatePerfil = async () => {
    if (!validatePerfilForm()) return

    showLoader()
    try {
      // En un entorno real, aquí se llamaría a la API para actualizar el perfil
      // await api.put('/usuarios/perfil', perfilData)

      // Simulamos una espera
      await new Promise((resolve) => setTimeout(resolve, 1000))

      showNotification("Perfil actualizado correctamente", "success")
    } catch (error) {
      showNotification("Error al actualizar perfil", "error")
    } finally {
      hideLoader()
    }
  }

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return

    showLoader()
    try {
      // En un entorno real, aquí se llamaría a la API para cambiar la contraseña
      // await api.put('/usuarios/cambiar-password', passwordData)

      // Simulamos una espera
      await new Promise((resolve) => setTimeout(resolve, 1000))

      showNotification("Contraseña actualizada correctamente", "success")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      showNotification("Error al actualizar contraseña", "error")
    } finally {
      hideLoader()
    }
  }

  // Modificar el return para incluir el BackButton
  return (
    <Box>
      <BackButton route="/dashboard" />
      <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="medium">
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: "3rem",
                }}
              >
                {user?.nombre_usuario?.charAt(0).toUpperCase() || <PersonIcon fontSize="large" />}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.nombre_usuario || "Usuario"}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.correo || "correo@ejemplo.com"}
              </Typography>
              <Chip label={user?.rol || "Usuario"} color="primary" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={2}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="perfil tabs">
              <Tab label="Información Personal" />
              <Tab label="Cambiar Contraseña" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    name="nombre"
                    value={perfilData.nombre}
                    onChange={handlePerfilChange}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    value={perfilData.correo}
                    onChange={handlePerfilChange}
                    error={!!errors.correo}
                    helperText={errors.correo}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={perfilData.telefono}
                    onChange={handlePerfilChange}
                    error={!!errors.telefono}
                    helperText={errors.telefono}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleUpdatePerfil}>
                      Guardar Cambios
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contraseña Actual"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Nueva Contraseña"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
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
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleUpdatePassword}>
                      Actualizar Contraseña
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
