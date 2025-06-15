"use client"

import type React from "react"
import { useState } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { PageLayout } from "@/components/layout/PageLayout"
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
} from "@mui/material"
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Backup as BackupIcon,
} from "@mui/icons-material"

export default function ConfiguracionPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [generalConfig, setGeneralConfig] = useState({
    nombreLaboratorio: "LaboFutura",
    direccion: "Av. Principal 123",
    telefono: "1234567890",
    correo: "contacto@labofutura.com",
    logo: "/logo-labofutura.png",
  })

  const [emailConfig, setEmailConfig] = useState({
    enviarResultados: true,
    enviarNotificaciones: true,
    servidorSMTP: "smtp.example.com",
    puertoSMTP: "587",
    usuarioSMTP: "notificaciones@labofutura.com",
    passwordSMTP: "********",
  })

  const [reportesConfig, setReportesConfig] = useState({
    formatoPDF: "A4",
    mostrarLogo: true,
    mostrarFirma: true,
    colorEncabezado: "#1976d2",
    piePagina: "© LaboFutura - Todos los derechos reservados",
  })

  const [backupConfig, setBackupConfig] = useState({
    backupAutomatico: true,
    frecuenciaBackup: "diario",
    horaBackup: "03:00",
    rutaBackup: "/backups",
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simular carga de configuración
      await new Promise((resolve) => setTimeout(resolve, 1000))
      showNotification("Configuración actualizada", "success")
    } catch (error) {
      showNotification("Error al actualizar configuración", "error")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGeneralConfig({
      ...generalConfig,
      [name]: value,
    })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setEmailConfig({
      ...emailConfig,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleReportesChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name) {
      setReportesConfig({
        ...reportesConfig,
        [name]: typeof checked !== "undefined" ? checked : value,
      })
    }
  }

  const handleBackupChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name) {
      setBackupConfig({
        ...backupConfig,
        [name]: typeof checked !== "undefined" ? checked : value,
      })
    }
  }

  const handleSaveConfig = async (configType: string) => {
    showLoader()
    try {
      // En un entorno real, aquí se llamaría a la API para guardar la configuración
      await new Promise((resolve) => setTimeout(resolve, 1000))
      showNotification("Configuración guardada correctamente", "success")
    } catch (error) {
      showNotification("Error al guardar configuración", "error")
    } finally {
      hideLoader()
    }
  }

  const handleBackupNow = async () => {
    showLoader()
    try {
      // En un entorno real, aquí se llamaría a la API para realizar un backup
      await new Promise((resolve) => setTimeout(resolve, 2000))
      showNotification("Backup realizado correctamente", "success")
    } catch (error) {
      showNotification("Error al realizar backup", "error")
    } finally {
      hideLoader()
    }
  }

  // Estadísticas para las cards
  const stats = [
    {
      title: "Configuraciones",
      value: "4",
      subtitle: "Módulos configurables",
      trend: "General, Email, Reportes, Backup",
      color: "primary" as const,
      icon: <SettingsIcon />,
    },
    {
      title: "Email Activo",
      value: emailConfig.enviarResultados ? "Sí" : "No",
      subtitle: "Notificaciones por email",
      trend: emailConfig.enviarNotificaciones ? "Notificaciones ON" : "Notificaciones OFF",
      color: emailConfig.enviarResultados ? ("success" as const) : ("warning" as const),
      icon: <EmailIcon />,
    },
    {
      title: "Backup Auto",
      value: backupConfig.backupAutomatico ? "Activo" : "Inactivo",
      subtitle: "Respaldo automático",
      trend: `Frecuencia: ${backupConfig.frecuenciaBackup}`,
      color: backupConfig.backupAutomatico ? ("success" as const) : ("error" as const),
      icon: <BackupIcon />,
    },
    {
      title: "Último Backup",
      value: "Ayer",
      subtitle: "10/06/2023 03:00 AM",
      trend: "15.2 MB - Exitoso",
      color: "info" as const,
      icon: <BackupIcon />,
    },
  ]

  return (
    <PageLayout
      title="Configuración del Sistema"
      description="Administra la configuración general del laboratorio"
      icon={<SettingsIcon />}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      stats={stats}
    >
      <Grid container spacing={3}>
        {/* Configuración General */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: "100%" }}>
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
                <BusinessIcon />
                <Typography variant="h6">Información General</Typography>
              </Box>
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre del Laboratorio"
                    name="nombreLaboratorio"
                    value={generalConfig.nombreLaboratorio}
                    onChange={handleGeneralChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    value={generalConfig.direccion}
                    onChange={handleGeneralChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={generalConfig.telefono}
                    onChange={handleGeneralChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    name="correo"
                    value={generalConfig.correo}
                    onChange={handleGeneralChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveConfig("general")}
              >
                Guardar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Configuración de Email */}
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
                <EmailIcon />
                <Typography variant="h6">Configuración de Email</Typography>
              </Box>
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailConfig.enviarResultados}
                        onChange={handleEmailChange}
                        name="enviarResultados"
                      />
                    }
                    label="Enviar Resultados por Email"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailConfig.enviarNotificaciones}
                        onChange={handleEmailChange}
                        name="enviarNotificaciones"
                      />
                    }
                    label="Enviar Notificaciones"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Servidor SMTP"
                    name="servidorSMTP"
                    value={emailConfig.servidorSMTP}
                    onChange={handleEmailChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Puerto SMTP"
                    name="puertoSMTP"
                    value={emailConfig.puertoSMTP}
                    onChange={handleEmailChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Usuario SMTP"
                    name="usuarioSMTP"
                    value={emailConfig.usuarioSMTP}
                    onChange={handleEmailChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contraseña SMTP"
                    name="passwordSMTP"
                    type="password"
                    value={emailConfig.passwordSMTP}
                    onChange={handleEmailChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveConfig("email")}
              >
                Guardar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Configuración de Reportes */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: "100%" }}>
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
                <AssessmentIcon />
                <Typography variant="h6">Configuración de Reportes</Typography>
              </Box>
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="formato-pdf-label">Formato PDF</InputLabel>
                    <Select
                      labelId="formato-pdf-label"
                      id="formatoPDF"
                      name="formatoPDF"
                      value={reportesConfig.formatoPDF}
                      label="Formato PDF"
                      onChange={handleReportesChange}
                    >
                      <MenuItem value="A4">A4</MenuItem>
                      <MenuItem value="Letter">Letter</MenuItem>
                      <MenuItem value="Legal">Legal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Color de Encabezado"
                    name="colorEncabezado"
                    value={reportesConfig.colorEncabezado}
                    onChange={handleReportesChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pie de Página"
                    name="piePagina"
                    value={reportesConfig.piePagina}
                    onChange={handleReportesChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch checked={reportesConfig.mostrarLogo} onChange={handleReportesChange} name="mostrarLogo" />
                    }
                    label="Mostrar Logo"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={reportesConfig.mostrarFirma}
                        onChange={handleReportesChange}
                        name="mostrarFirma"
                      />
                    }
                    label="Mostrar Firma Digital"
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveConfig("reportes")}
              >
                Guardar
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Configuración de Backup */}
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
                <BackupIcon />
                <Typography variant="h6">Configuración de Backup</Typography>
              </Box>
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backupConfig.backupAutomatico}
                        onChange={handleBackupChange}
                        name="backupAutomatico"
                      />
                    }
                    label="Backup Automático"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="frecuencia-backup-label">Frecuencia</InputLabel>
                    <Select
                      labelId="frecuencia-backup-label"
                      id="frecuenciaBackup"
                      name="frecuenciaBackup"
                      value={backupConfig.frecuenciaBackup}
                      label="Frecuencia"
                      onChange={handleBackupChange}
                      disabled={!backupConfig.backupAutomatico}
                    >
                      <MenuItem value="diario">Diario</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="mensual">Mensual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hora de Backup"
                    name="horaBackup"
                    type="time"
                    value={backupConfig.horaBackup}
                    onChange={handleBackupChange}
                    disabled={!backupConfig.backupAutomatico}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ruta de Backup"
                    name="rutaBackup"
                    value={backupConfig.rutaBackup}
                    onChange={handleBackupChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Últimos Backups
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="backup_20230610_030000.sql" secondary="10/06/2023 03:00 AM - 15.2 MB" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="backup_20230609_030000.sql" secondary="09/06/2023 03:00 AM - 15.1 MB" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="backup_20230608_030000.sql" secondary="08/06/2023 03:00 AM - 14.9 MB" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
              <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={handleBackupNow}>
                Realizar Backup Ahora
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveConfig("backup")}
              >
                Guardar
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  )
}
