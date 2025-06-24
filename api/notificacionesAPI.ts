import api from "./api"

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
    const response = await api.get('/configuracion/notificaciones/')
    return response.data
  },

  /**
   * Guarda la configuración de notificaciones
   */
  guardarConfiguracion: async (config: NotificacionesConfig): Promise<any> => {
    const response = await api.post('/configuracion/notificaciones/', config)
    return response.data
  },

  /**
   * Envía un email de prueba
   */
  enviarEmailPrueba: async (email: string): Promise<any> => {
    const response = await api.post('/configuracion/notificaciones/test/', { email })
    return response.data
  },

  /**
   * Envía una notificación por email
   */
  enviarNotificacion: async (
    tipo: NotificationType,
    destinatario: string,
    datos: Record<string, any>,
  ): Promise<{ success: boolean }> => {
    if (!configMock.notificaciones[tipo as keyof typeof configMock.notificaciones]) {
      return { success: false }
    }

    if (!configMock.plantillas[tipo as keyof typeof configMock.plantillas].activo) {
      return { success: false }
    }

    try {
      const response = await api.post(`/notificaciones/${tipo}/`, {
        to: destinatario,
        datos,
      })
      return response.data
    } catch (error) {
      console.error("Error al enviar notificación:", error)
      return { success: false }
    }
  },
}

// Funciones de ayuda para enviar notificaciones específicas

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

export const enviarFactura = async (
  email: string,
  paciente: any,
  factura: any,
  laboratorio: any,
): Promise<boolean> => {
  const result = await notificacionesAPI.enviarNotificacion("factura", email, {
    paciente,
    factura,
    laboratorio,
  })
  return result.success
}

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

export const enviarEmailBienvenida = async (
  email: string,
  usuario: any,
  laboratorio: any,
): Promise<boolean> => {
  const result = await notificacionesAPI.enviarNotificacion("bienvenida", email, {
    usuario,
    laboratorio,
  })
  return result.success
}
