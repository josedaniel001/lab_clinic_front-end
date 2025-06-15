"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { PageLayout } from "@/components/layout/PageLayout"
import {
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography,
} from "@mui/material"
import {
  Save as SaveIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material"
import { testEmailConnection } from "@/utils/emailService"

// Mock API para configuración de notificaciones
const notificacionesAPI = {
  getConfiguracion: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          smtp: {
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: "laboratorio@example.com",
              pass: "password123",
            },
            from: "LaboFutura <laboratorio@example.com>",
          },
          notificaciones: {
            resultados: true,
            facturas: true,
            ordenes: true,
            recordatorios: true,
          },
          plantillas: {
            resultados: {
              asunto: "Sus resultados están listos - LaboFutura",
              activo: true,
            },
            facturas: {
              asunto: "Factura de servicios - LaboFutura",
              activo: true,
            },
            ordenes: {
              asunto: "Orden registrada - LaboFutura",
              activo: true,
            },
            recordatorios: {
              asunto: "Recordatorio de cita - LaboFutura",
              activo: true,
            },
          },
        })
      }, 500)
    })
  },
  guardarConfiguracion: async (config: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
  enviarEmailPrueba: async (email: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 1000)
    })
  },
}

export default function NotificacionesPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: 587,
    secure: false,
    auth: {
      user: "",
      pass: "",
    },
    from: "",
  })

  const [notificacionesConfig, setNotificacionesConfig] = useState({
    resultados: true,
    facturas: true,
    ordenes: true,
    recordatorios: true,
  })

  const [plantillasConfig, setPlantillasConfig] = useState({
    resultados: {
      asunto: "",
      activo: true,
    },
    facturas: {
      asunto: "",
      activo: true,
    },
    ordenes: {
      asunto: "",
      activo: true,
    },
    recordatorios: {
      asunto: "",
      activo: true,
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [openTestDialog, setOpenTestDialog] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    fetchConfiguracion()
  }, [])

  const fetchConfiguracion = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await notificacionesAPI.getConfiguracion()
      setSmtpConfig(data.smtp)
      setNotificacionesConfig(data.notificaciones)
      setPlantillasConfig(data.plantillas)
      if (!showLoading) {
        showNotification("Configuración actualizada", "success")
      }
    } catch (error) {
      showNotification("Error al cargar la configuración", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchConfiguracion(false)
  }

  const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith("auth.")) {
      const authField = name.split(".")[1]
      setSmtpConfig({
        ...smtpConfig,
        auth: {
          ...smtpConfig.auth,
          [authField]: value,
        },
      })
    } else if (name === "port") {
      setSmtpConfig({
        ...smtpConfig,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setSmtpConfig({
        ...smtpConfig,
        [name]: value,
      })
    }
  }

  const handleSecureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSmtpConfig({
      ...smtpConfig,
      secure: e.target.checked,
    })
  }

  const handleNotificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNotificacionesConfig({
      ...notificacionesConfig,
      [name]: checked,
    })
  }

  const handlePlantillaChange = (tipo: string, campo: string, valor: any) => {
    setPlantillasConfig({
      ...plantillasConfig,
      [tipo]: {
        ...plantillasConfig[tipo as keyof typeof plantillasConfig],
        [campo]: valor,
      },
    })
  }

  const handleGuardarConfiguracion = async () => {
    showLoader()
    try {
      const config = {
        smtp: smtpConfig,
        notificaciones: notificacionesConfig,
        plantillas: plantillasConfig,
      }
      await notificacionesAPI.guardarConfiguracion(config)
      showNotification("Configuración guardada correctamente", "success")
    } catch (error) {
      showNotification("Error al guardar la configuración", "error")
    } finally {
      hideLoader()
    }
  }

  const handleOpenTestDialog = () => {
    setTestEmail("")
    setTestResult(null)
    setOpenTestDialog(true)
  }

  const handleCloseTestDialog = () => {
    setOpenTestDialog(false)
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult(null)
    try {
      // En un entorno real, aquí se probaría la conexión SMTP
      const result = await testEmailConnection()
      if (result) {
        setTestResult({
          success: true,
          message: "Conexión exitosa al servidor SMTP",
        })
      } else {
        setTestResult({
          success: false,
          message: "No se pudo conectar al servidor SMTP",
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error al probar la conexión",
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      showNotification("Ingrese un correo electrónico válido", "error")
      return
    }

    showLoader()
    try {
      await notificacionesAPI.enviarEmailPrueba(testEmail)
      showNotification("Email de prueba enviado correctamente", "success")
      handleCloseTestDialog()
    } catch (error) {
      showNotification("Error al enviar el email de prueba", "error")
    } finally {
      hideLoader()
    }
  }

  // Calcular estadísticas para las cards
  const notificacionesActivas = Object.values(notificacionesConfig).filter(Boolean).length
  const plantillasActivas = Object.values(plantillasConfig).filter((p: any) => p.activo).length
  const smtpConfigurado = smtpConfig.host && smtpConfig.auth.user ? "Sí" : "No"

  const stats = [
    {
      title: "SMTP Configurado",
      value: smtpConfigurado,
      subtitle: "Servidor de correo",
      trend: smtpConfig.host ? `Host: ${smtpConfig.host}` : "Sin configurar",
      color: smtpConfigurado === "Sí" ? ("success" as const) : ("error" as const),
      icon: <EmailIcon />,
    },
    {
      title: "Notificaciones",
      value: `${notificacionesActivas}/4`,
      subtitle: "Tipos activos",
      trend: `${((notificacionesActivas / 4) * 100).toFixed(0)}% habilitadas`,
      color: "primary" as const,
      icon: <NotificationsActiveIcon />,
    },
    {
      title: "Plantillas",
      value: `${plantillasActivas}/4`,
      subtitle: "Plantillas activas",
      trend: `${((plantillasActivas / 4) * 100).toFixed(0)}% configuradas`,
      color: "info" as const,
      icon: <SettingsIcon />,
    },
    {
      title: "Estado",
      value: smtpConfigurado === "Sí" && notificacionesActivas > 0 ? "Activo" : "Inactivo",
      subtitle: "Sistema de notificaciones",
      trend: "Listo para enviar",
      color: smtpConfigurado === "Sí" && notificacionesActivas > 0 ? ("success" as const) : ("warning" as const),
      icon: <CheckIcon />,
    },
  ]

  return (
    <>
      <PageLayout
        title="Configuración de Notificaciones"
        description="Configura el sistema de notificaciones por correo electrónico"
        icon={<EmailIcon />}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        stats={stats}
        actions={
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleOpenTestDialog}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            Probar Configuración
          </Button>
        }
      >
        <Grid container spacing={3}>
          {/* Configuración SMTP */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon />
                  <Typography variant="h6">Configuración del Servidor SMTP</Typography>
                </Box>
              </Box>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Servidor SMTP"
                      name="host"
                      value={smtpConfig.host}
                      onChange={handleSmtpChange}
                      helperText="Ejemplo: smtp.gmail.com"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Puerto"
                      name="port"
                      type="number"
                      value={smtpConfig.port}
                      onChange={handleSmtpChange}
                      helperText="Ejemplo: 587 o 465"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControlLabel
                      control={<Switch checked={smtpConfig.secure} onChange={handleSecureChange} name="secure" />}
                      label="Conexión segura (SSL/TLS)"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Usuario"
                      name="auth.user"
                      value={smtpConfig.auth.user}
                      onChange={handleSmtpChange}
                      helperText="Correo electrónico o nombre de usuario"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contraseña"
                      name="auth.pass"
                      type={showPassword ? "text" : "password"}
                      value={smtpConfig.auth.pass}
                      onChange={handleSmtpChange}
                      helperText="Contraseña o clave de aplicación"
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remitente"
                      name="from"
                      value={smtpConfig.from}
                      onChange={handleSmtpChange}
                      helperText="Ejemplo: LaboFutura <laboratorio@example.com>"
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleGuardarConfiguracion}>
                  Guardar Configuración
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Tipos de Notificaciones */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                  color: "white",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <NotificationsActiveIcon />
                  <Typography variant="h6">Tipos de Notificaciones</Typography>
                </Box>
              </Box>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacionesConfig.resultados}
                          onChange={handleNotificacionChange}
                          name="resultados"
                        />
                      }
                      label="Notificar cuando los resultados estén listos"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacionesConfig.facturas}
                          onChange={handleNotificacionChange}
                          name="facturas"
                        />
                      }
                      label="Enviar facturas por correo electrónico"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacionesConfig.ordenes}
                          onChange={handleNotificacionChange}
                          name="ordenes"
                        />
                      }
                      label="Confirmar registro de órdenes"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificacionesConfig.recordatorios}
                          onChange={handleNotificacionChange}
                          name="recordatorios"
                        />
                      }
                      label="Enviar recordatorios de citas"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Plantillas de Correo */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SettingsIcon />
                  <Typography variant="h6">Plantillas de Correo</Typography>
                </Box>
              </Box>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1">Resultados</Typography>
                      <Switch
                        checked={plantillasConfig.resultados.activo}
                        onChange={(e) => handlePlantillaChange("resultados", "activo", e.target.checked)}
                        size="small"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Asunto"
                      value={plantillasConfig.resultados.asunto}
                      onChange={(e) => handlePlantillaChange("resultados", "asunto", e.target.value)}
                      disabled={!plantillasConfig.resultados.activo}
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1">Facturas</Typography>
                      <Switch
                        checked={plantillasConfig.facturas.activo}
                        onChange={(e) => handlePlantillaChange("facturas", "activo", e.target.checked)}
                        size="small"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Asunto"
                      value={plantillasConfig.facturas.asunto}
                      onChange={(e) => handlePlantillaChange("facturas", "asunto", e.target.value)}
                      disabled={!plantillasConfig.facturas.activo}
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1">Órdenes</Typography>
                      <Switch
                        checked={plantillasConfig.ordenes.activo}
                        onChange={(e) => handlePlantillaChange("ordenes", "activo", e.target.checked)}
                        size="small"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Asunto"
                      value={plantillasConfig.ordenes.asunto}
                      onChange={(e) => handlePlantillaChange("ordenes", "asunto", e.target.value)}
                      disabled={!plantillasConfig.ordenes.activo}
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1">Recordatorios</Typography>
                      <Switch
                        checked={plantillasConfig.recordatorios.activo}
                        onChange={(e) => handlePlantillaChange("recordatorios", "activo", e.target.checked)}
                        size="small"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      label="Asunto"
                      value={plantillasConfig.recordatorios.asunto}
                      onChange={(e) => handlePlantillaChange("recordatorios", "asunto", e.target.value)}
                      disabled={!plantillasConfig.recordatorios.activo}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </PageLayout>

      {/* Diálogo para probar la configuración */}
      <Dialog open={openTestDialog} onClose={handleCloseTestDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Probar Configuración de Email</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Primero, verifique la conexión con el servidor SMTP y luego envíe un correo de prueba.
          </DialogContentText>

          {testResult && (
            <Alert
              severity={testResult.success ? "success" : "error"}
              icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
              sx={{ mb: 2 }}
            >
              {testResult.message}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              onClick={handleTestConnection}
              disabled={testingConnection}
              startIcon={<SettingsIcon />}
              fullWidth
            >
              {testingConnection ? "Probando conexión..." : "Probar Conexión SMTP"}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="Correo Electrónico de Prueba"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            helperText="Ingrese un correo electrónico para enviar un mensaje de prueba"
            disabled={!testResult?.success}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestDialog}>Cancelar</Button>
          <Button
            onClick={handleSendTestEmail}
            variant="contained"
            disabled={!testResult?.success || !testEmail}
            startIcon={<SendIcon />}
          >
            Enviar Email de Prueba
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
