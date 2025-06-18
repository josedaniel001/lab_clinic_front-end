import api from "../api"; // Added API import
import { getEmailService, type EmailData } from "@/utils/emailService"

// Tipos de notificaciones
export type NotificationType = "resultados" | "factura" | "orden" | "recordatorio" | "bienvenida"

// Interfaz para la configuración de notificaciones
export interface NotificacionesConfig {
  smtp: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
    from: string
  }
  notificaciones: {
    resultados: boolean
    facturas: boolean
    ordenes: boolean
    recordatorios: boolean
  }
  plantillas: {
    resultados: {
      asunto: string
      activo: boolean
    }
    facturas: {
      asunto: string
      activo: boolean
    }
    ordenes: {
      asunto: string
      activo: boolean
    }
    recordatorios: {
      asunto: string
      activo: boolean
    }
  }
}

// Datos de configuración de ejemplo
const configMock: NotificacionesConfig = {
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
}

// API para notificaciones
export const notificacionesAPI = {
  /**
   * Obtiene la configuración de notificaciones
   */
  getConfiguracion: async (): Promise<NotificacionesConfig> => {
    // En un entorno real, esto sería una llamada a la API
    const response = await api.get('/configuracion/notificaciones/') // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve(configMock)
    //   }, 500)
    // })
  },

  /**
   * Guarda la configuración de notificaciones
   */
  guardarConfiguracion: async (config: NotificacionesConfig): Promise<any> => { // Return type changed to any to match typical API response
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/configuracion/notificaciones/', config) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     // Actualizar la configuración mock
    //     Object.assign(configMock, config)
    //     resolve({ success: true })
    //   }, 500)
    // })
  },

  /**
   * Envía un email de prueba
   */
  enviarEmailPrueba: async (email: string): Promise<any> => { // Return type changed to any to match typical API response
    // En un entorno real, esto sería una llamada a la API
    const response = await api.post('/configuracion/notificaciones/test/', { email }) // Added trailing slash
    return response.data

    // Simulación con datos de prueba
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve({ success: true })
    //   }, 1000)
    // })
  },

  /**
   * Envía una notificación por email
   */
  enviarNotificacion: async (
    tipo: NotificationType,
    destinatario: string,
    datos: Record<string, any>,
  ): Promise<{ success: boolean }> => {
    // Verificar si el tipo de notificación está habilitado
    if (!configMock.notificaciones[tipo as keyof typeof configMock.notificaciones]) {
      return { success: false }
    }

    // Verificar si la plantilla está activa
    if (!configMock.plantillas[tipo as keyof typeof configMock.plantillas].activo) {
      return { success: false }
    }

    // Preparar los datos del email
    const emailData: EmailData = {
      to: destinatario,
      subject: configMock.plantillas[tipo as keyof typeof configMock.plantillas].asunto,
      templateId: tipo,
      context: datos,
    }

    // Obtener el servicio de email
    const emailService = getEmailService()
    if (!emailService) {
      return { success: false }
    }

    // Enviar el email
    const result = await emailService.sendEmail(emailData)
    return { success: result }
  },
}

// Funciones de ayuda para enviar notificaciones específicas

/**
 * Envía una notificación de resultados listos
 */
export const enviarNotificacionResultados = async (
  email: string,
  paciente: any,
  orden: any,
  laboratorio: any,
): Promise<boolean> => {
  const result = await notificacionesAPI.enviarNotificacion("resultados", email, {
    paciente,
    orden,
    laboratorio,
  })
  return result.success
}

/**
 * Envía una factura por email
 */
export const enviarFactura = async (email: string, paciente: any, factura: any, laboratorio: any): Promise<boolean> => {
  const result = await notificacionesAPI.enviarNotificacion("factura", email, {
    paciente,
    factura,
    laboratorio,
  })
  return result.success
}

/**
 * Envía una confirmación de orden
 */
export const enviarConfirmacionOrden = async (
  email: string,
  paciente: any,
  orden: any,
  laboratorio: any,
): Promise<boolean> => {
  const result = await notificacionesAPI.enviarNotificacion("orden", email, {
    paciente,
    orden,
    laboratorio,
  })
  return result.success
}

/**
 * Envía un recordatorio de cita
 */
export const enviarRecordatorioCita = async (
  email: string,
  paciente: any,
  cita: any,
  laboratorio: any,
): Promise<boolean> => {
  const result = await notificacionesAPI.enviarNotificacion("recordatorio", email, {
    paciente,
    cita,
    laboratorio,
  })
  return result.success
}

/**
 * Envía un email de bienvenida
 */
export const enviarEmailBienvenida = async (email: string, usuario: any, laboratorio: any): Promise<boolean> => {
  const result = await notificacionesAPI.enviarNotificacion("bienvenida", email, {
    usuario,
    laboratorio,
  })
  return result.success
}
