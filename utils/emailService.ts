import nodemailer from "nodemailer"

// Tipos para las plantillas de email
export type EmailTemplate = "resultados" | "factura" | "orden" | "recordatorio" | "bienvenida"

// Interfaz para los datos de email
export interface EmailData {
  to: string
  subject: string
  templateId: EmailTemplate
  context: Record<string, any>
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Configuración del servicio de email
export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

// Clase para el servicio de email
export class EmailService {
  private transporter: nodemailer.Transporter
  private defaultFrom: string
  private templates: Record<EmailTemplate, (context: any) => string> = {
    resultados: this.getResultadosTemplate,
    factura: this.getFacturaTemplate,
    orden: this.getOrdenTemplate,
    recordatorio: this.getRecordatorioTemplate,
    bienvenida: this.getBienvenidaTemplate,
  }

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    })
    this.defaultFrom = config.from
  }

  // Método para enviar un email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const { to, subject, templateId, context, attachments } = emailData

      // Obtener la plantilla HTML
      const html = this.templates[templateId](context)

      // Enviar el email
      await this.transporter.sendMail({
        from: this.defaultFrom,
        to,
        subject,
        html,
        attachments,
      })

      return true
    } catch (error) {
      console.error("Error al enviar email:", error)
      return false
    }
  }

  // Método para probar la conexión
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error("Error al verificar la conexión SMTP:", error)
      return false
    }
  }

  // Plantillas de email
  private getResultadosTemplate(context: any): string {
    const { paciente, orden, laboratorio } = context

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resultados de Laboratorio</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0277bd; color: white; padding: 10px 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #0277bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${laboratorio.nombre}</h1>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${paciente.nombre}</strong>,</p>
            <p>Nos complace informarle que sus resultados de laboratorio ya están disponibles.</p>
            <p><strong>Orden:</strong> ${orden.codigo}</p>
            <p><strong>Fecha:</strong> ${orden.fecha}</p>
            <p>Puede acceder a sus resultados a través del siguiente enlace:</p>
            <p style="text-align: center;">
              <a href="${laboratorio.url}/resultados/${orden.id}" class="button">Ver Resultados</a>
            </p>
            <p>Si tiene alguna pregunta sobre sus resultados, no dude en contactarnos.</p>
            <p>Atentamente,</p>
            <p><strong>${laboratorio.nombre}</strong><br>
            ${laboratorio.direccion}<br>
            ${laboratorio.telefono}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
            <p>&copy; ${new Date().getFullYear()} ${laboratorio.nombre}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getFacturaTemplate(context: any): string {
    const { paciente, factura, laboratorio } = context

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura de Laboratorio</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0277bd; color: white; padding: 10px 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #0277bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
          .details { margin: 20px 0; }
          .details table { width: 100%; border-collapse: collapse; }
          .details th, .details td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { font-weight: bold; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${laboratorio.nombre}</h1>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${paciente.nombre}</strong>,</p>
            <p>Adjunto encontrará la factura correspondiente a los servicios de laboratorio realizados.</p>
            <div class="details">
              <p><strong>Factura:</strong> ${factura.numero}</p>
              <p><strong>Fecha:</strong> ${factura.fecha}</p>
              <p><strong>Total:</strong> $${factura.total.toFixed(2)}</p>
            </div>
            <p>Puede descargar su factura en formato PDF a través del siguiente enlace:</p>
            <p style="text-align: center;">
              <a href="${laboratorio.url}/facturas/${factura.id}" class="button">Descargar Factura</a>
            </p>
            <p>Si tiene alguna pregunta sobre su factura, no dude en contactarnos.</p>
            <p>Atentamente,</p>
            <p><strong>${laboratorio.nombre}</strong><br>
            ${laboratorio.direccion}<br>
            ${laboratorio.telefono}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
            <p>&copy; ${new Date().getFullYear()} ${laboratorio.nombre}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getOrdenTemplate(context: any): string {
    const { paciente, orden, laboratorio } = context

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orden de Laboratorio</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0277bd; color: white; padding: 10px 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #0277bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${laboratorio.nombre}</h1>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${paciente.nombre}</strong>,</p>
            <p>Su orden de laboratorio ha sido registrada correctamente.</p>
            <p><strong>Orden:</strong> ${orden.codigo}</p>
            <p><strong>Fecha:</strong> ${orden.fecha}</p>
            <p><strong>Hora:</strong> ${orden.hora}</p>
            <p>Los exámenes solicitados son:</p>
            <ul>
              ${orden.examenes.map((examen: any) => `<li>${examen.nombre}</li>`).join("")}
            </ul>
            <p>Le notificaremos cuando sus resultados estén disponibles.</p>
            <p>Atentamente,</p>
            <p><strong>${laboratorio.nombre}</strong><br>
            ${laboratorio.direccion}<br>
            ${laboratorio.telefono}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
            <p>&copy; ${new Date().getFullYear()} ${laboratorio.nombre}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getRecordatorioTemplate(context: any): string {
    const { paciente, cita, laboratorio } = context

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recordatorio de Cita</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0277bd; color: white; padding: 10px 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #0277bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${laboratorio.nombre}</h1>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${paciente.nombre}</strong>,</p>
            <p>Le recordamos que tiene una cita programada en nuestro laboratorio:</p>
            <p><strong>Fecha:</strong> ${cita.fecha}</p>
            <p><strong>Hora:</strong> ${cita.hora}</p>
            <p><strong>Tipo:</strong> ${cita.tipo}</p>
            <p>Recomendaciones:</p>
            <ul>
              <li>Llegue 10 minutos antes de su cita.</li>
              <li>Traiga su documento de identidad.</li>
              <li>Si su examen requiere ayuno, recuerde cumplir con las indicaciones.</li>
            </ul>
            <p>Si necesita reprogramar su cita, por favor contáctenos con anticipación.</p>
            <p>Atentamente,</p>
            <p><strong>${laboratorio.nombre}</strong><br>
            ${laboratorio.direccion}<br>
            ${laboratorio.telefono}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
            <p>&copy; ${new Date().getFullYear()} ${laboratorio.nombre}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private getBienvenidaTemplate(context: any): string {
    const { usuario, laboratorio } = context

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a ${laboratorio.nombre}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0277bd; color: white; padding: 10px 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; background-color: #0277bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${laboratorio.nombre}</h1>
          </div>
          <div class="content">
            <p>Estimado/a <strong>${usuario.nombre}</strong>,</p>
            <p>¡Bienvenido/a a ${laboratorio.nombre}!</p>
            <p>Su cuenta ha sido creada exitosamente. A continuación, encontrará sus datos de acceso:</p>
            <p><strong>Usuario:</strong> ${usuario.nombre_usuario}</p>
            <p>Para acceder al sistema, haga clic en el siguiente enlace:</p>
            <p style="text-align: center;">
              <a href="${laboratorio.url}/login" class="button">Iniciar Sesión</a>
            </p>
            <p>Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>
            <p>Atentamente,</p>
            <p><strong>${laboratorio.nombre}</strong><br>
            ${laboratorio.direccion}<br>
            ${laboratorio.telefono}</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automático, por favor no responda a este correo.</p>
            <p>&copy; ${new Date().getFullYear()} ${laboratorio.nombre}. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Función para crear una instancia del servicio de email
export const createEmailService = (): EmailService | null => {
  try {
    // Obtener la configuración de las variables de entorno
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || "",
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
      from: process.env.EMAIL_FROM || "",
    }

    // Verificar que todos los campos requeridos estén presentes
    if (!config.host || !config.auth.user || !config.auth.pass || !config.from) {
      console.error("Configuración de email incompleta")
      return null
    }

    return new EmailService(config)
  } catch (error) {
    console.error("Error al crear el servicio de email:", error)
    return null
  }
}

// Instancia global del servicio de email
let emailServiceInstance: EmailService | null = null

// Función para obtener la instancia del servicio de email
export const getEmailService = (): EmailService | null => {
  if (!emailServiceInstance) {
    emailServiceInstance = createEmailService()
  }
  return emailServiceInstance
}

// API para enviar emails
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  const emailService = getEmailService()
  if (!emailService) {
    console.error("Servicio de email no disponible")
    return false
  }
  return await emailService.sendEmail(emailData)
}

// API para probar la conexión SMTP
export const testEmailConnection = async (): Promise<boolean> => {
  const emailService = getEmailService()
  if (!emailService) {
    console.error("Servicio de email no disponible")
    return false
  }
  return await emailService.testConnection()
}
