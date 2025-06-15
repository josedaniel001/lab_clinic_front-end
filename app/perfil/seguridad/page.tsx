"use client"

import { useState } from "react"
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
  CardContent,
  CardActions,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { Security, Key, LockOpen, LockPerson, VerifiedUser, PhoneAndroid } from "@mui/icons-material"
import Image from "next/image"

export default function SeguridadPage() {
  const { user, enableTwoFactor, disableTwoFactor } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()

  const [openEnableDialog, setOpenEnableDialog] = useState(false)
  const [openDisableDialog, setOpenDisableDialog] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")

  const handleEnableTwoFactor = async () => {
    showLoader()
    try {
      const result = await enableTwoFactor()
      setQrCodeUrl(result.qrCodeUrl)
      setSecret(result.secret)
      setOpenEnableDialog(true)
    } catch (error) {
      showNotification("Error al habilitar la autenticación de dos factores", "error")
    } finally {
      hideLoader()
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!verificationCode.trim()) {
      setError("Ingrese el código de verificación")
      return
    }

    showLoader()
    try {
      // En un entorno real, aquí verificaríamos el código con el servidor
      // y habilitaríamos 2FA si es correcto
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setOpenEnableDialog(false)
      setVerificationCode("")
      setError("")
      showNotification("Autenticación de dos factores habilitada correctamente", "success")
    } catch (error) {
      setError("Código de verificación inválido")
    } finally {
      hideLoader()
    }
  }

  const handleDisableTwoFactor = () => {
    setOpenDisableDialog(true)
  }

  const handleConfirmDisable = async () => {
    if (!verificationCode.trim()) {
      setError("Ingrese el código de verificación")
      return
    }

    showLoader()
    try {
      await disableTwoFactor(verificationCode)
      setOpenDisableDialog(false)
      setVerificationCode("")
      setError("")
      showNotification("Autenticación de dos factores deshabilitada correctamente", "success")
    } catch (error) {
      setError("Código de verificación inválido")
    } finally {
      hideLoader()
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="medium">
        Configuración de Seguridad
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6">Autenticación de Dos Factores</Typography>
            </Box>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Security color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h6">{user?.twoFactorEnabled ? "Habilitada" : "Deshabilitada"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.twoFactorEnabled
                      ? "Su cuenta está protegida con autenticación de dos factores."
                      : "Habilite la autenticación de dos factores para mayor seguridad."}
                  </Typography>
                </Box>
              </Box>

              {!user?.twoFactorEnabled ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Mejore la seguridad de su cuenta</AlertTitle>
                  La autenticación de dos factores añade una capa adicional de seguridad a su cuenta al requerir un
                  código de verificación además de su contraseña.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>Cuenta protegida</AlertTitle>
                  Su cuenta está protegida con autenticación de dos factores. Cada vez que inicie sesión, necesitará
                  ingresar un código de verificación.
                </Alert>
              )}

              <List>
                <ListItem>
                  <ListItemIcon>
                    <PhoneAndroid />
                  </ListItemIcon>
                  <ListItemText
                    primary="Aplicación de autenticación"
                    secondary="Use Google Authenticator, Microsoft Authenticator o una aplicación similar"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Key />
                  </ListItemIcon>
                  <ListItemText
                    primary="Código único"
                    secondary="Genera un código de 6 dígitos que cambia cada 30 segundos"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <VerifiedUser />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mayor seguridad"
                    secondary="Protege su cuenta incluso si su contraseña es comprometida"
                  />
                </ListItem>
              </List>
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 2 }}>
              {user?.twoFactorEnabled ? (
                <Button variant="outlined" color="error" startIcon={<LockOpen />} onClick={handleDisableTwoFactor}>
                  Deshabilitar autenticación de dos factores
                </Button>
              ) : (
                <Button variant="contained" color="primary" startIcon={<LockPerson />} onClick={handleEnableTwoFactor}>
                  Habilitar autenticación de dos factores
                </Button>
              )}
            </CardActions>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="h6">Historial de Actividad</Typography>
            </Box>
            <CardContent>
              <List>
                <ListItem divider>
                  <ListItemText primary="Inicio de sesión exitoso" secondary="Hoy, 10:15 AM - IP: 192.168.1.1" />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Cambio de contraseña" secondary="12/06/2023, 3:45 PM - IP: 192.168.1.1" />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Inicio de sesión exitoso" secondary="10/06/2023, 9:30 AM - IP: 192.168.1.1" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Inicio de sesión fallido" secondary="10/06/2023, 9:28 AM - IP: 192.168.1.1" />
                </ListItem>
              </List>
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 2 }}>
              <Button variant="outlined" color="primary">
                Ver historial completo
              </Button>
            </CardActions>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para habilitar 2FA */}
      <Dialog open={openEnableDialog} onClose={() => setOpenEnableDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Habilitar Autenticación de Dos Factores</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Escanee el código QR con su aplicación de autenticación o ingrese la clave manualmente.
          </DialogContentText>

          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            {qrCodeUrl && (
              <Box sx={{ border: "1px solid #ddd", p: 2, borderRadius: 1 }}>
                <Image src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
              </Box>
            )}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Clave secreta (si no puede escanear el código QR):
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              p: 1,
              bgcolor: "grey.100",
              borderRadius: 1,
              mb: 3,
              wordBreak: "break-all",
            }}
          >
            {secret}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Ingrese el código de verificación de su aplicación:
          </Typography>
          <TextField
            fullWidth
            label="Código de verificación"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!error}
            helperText={error}
            margin="normal"
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEnableDialog(false)}>Cancelar</Button>
          <Button onClick={handleVerifyAndEnable} variant="contained" color="primary">
            Verificar y Habilitar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para deshabilitar 2FA */}
      <Dialog open={openDisableDialog} onClose={() => setOpenDisableDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deshabilitar Autenticación de Dos Factores</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para deshabilitar la autenticación de dos factores, ingrese el código de verificación de su aplicación.
          </DialogContentText>

          <TextField
            fullWidth
            label="Código de verificación"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!error}
            helperText={error}
            margin="normal"
            inputProps={{ maxLength: 6 }}
          />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <AlertTitle>Advertencia</AlertTitle>
            Al deshabilitar la autenticación de dos factores, su cuenta será menos segura.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDisableDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDisable} variant="contained" color="error">
            Deshabilitar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
