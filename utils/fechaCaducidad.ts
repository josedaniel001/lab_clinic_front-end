/**
 * Utilidades para el cálculo de fechas de caducidad de unidades de sangre
 */

export interface TipoUnidadConfig {
  diasCaducidad: number
  nombre: string
  descripcion: string
}

export const CONFIGURACION_TIPOS_UNIDAD: Record<string, TipoUnidadConfig> = {
  PLASMA: {
    diasCaducidad: 365,
    nombre: "Plasma",
    descripcion: "Plasma fresco congelado - 365 días"
  },
  PAQUETE_GLOBULAR: {
    diasCaducidad: 35,
    nombre: "Paquetes Globulares", 
    descripcion: "Concentrado de glóbulos rojos - 35 días"
  },
  CRIO_PRECIPITADO: {
    diasCaducidad: 365,
    nombre: "Crio Precipitado",
    descripcion: "Crioprecipitado - 365 días"
  },
  PLAQUETAS: {
    diasCaducidad: 5,
    nombre: "Plaquetas",
    descripcion: "Concentrado de plaquetas - 5 días"
  }
}

/**
 * Calcula la fecha de caducidad basada en el tipo de unidad y la fecha de extracción
 * @param fechaExtraccion - Fecha de extracción en formato ISO (YYYY-MM-DD)
 * @param tipoUnidad - Tipo de unidad de sangre
 * @returns Fecha de caducidad en formato ISO (YYYY-MM-DD)
 */
export function calcularFechaCaducidad(fechaExtraccion: string, tipoUnidad: string): string {
  const config = CONFIGURACION_TIPOS_UNIDAD[tipoUnidad]
  
  if (!config) {
    throw new Error(`Tipo de unidad no válido: ${tipoUnidad}`)
  }

  const fecha = new Date(fechaExtraccion)
  if (isNaN(fecha.getTime())) {
    throw new Error(`Fecha de extracción no válida: ${fechaExtraccion}`)
  }

  // Agregar los días de caducidad
  const fechaCaducidad = new Date(fecha)
  fechaCaducidad.setDate(fechaCaducidad.getDate() + config.diasCaducidad)

  // Formatear como YYYY-MM-DD
  const year = fechaCaducidad.getFullYear()
  const month = String(fechaCaducidad.getMonth() + 1).padStart(2, '0')
  const day = String(fechaCaducidad.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Obtiene la configuración de un tipo de unidad específico
 * @param tipoUnidad - Tipo de unidad de sangre
 * @returns Configuración del tipo de unidad
 */
export function obtenerConfiguracionTipoUnidad(tipoUnidad: string): TipoUnidadConfig | null {
  return CONFIGURACION_TIPOS_UNIDAD[tipoUnidad] || null
}

/**
 * Obtiene todos los tipos de unidad disponibles
 * @returns Array con todos los tipos de unidad configurados
 */
export function obtenerTiposUnidadDisponibles(): Array<{value: string, label: string, descripcion: string}> {
  return Object.entries(CONFIGURACION_TIPOS_UNIDAD).map(([key, config]) => ({
    value: key,
    label: config.nombre,
    descripcion: config.descripcion
  }))
}

/**
 * Valida si una fecha de caducidad es correcta para un tipo de unidad
 * @param fechaExtraccion - Fecha de extracción
 * @param fechaCaducidad - Fecha de caducidad
 * @param tipoUnidad - Tipo de unidad
 * @returns true si la fecha de caducidad es correcta
 */
export function validarFechaCaducidad(fechaExtraccion: string, fechaCaducidad: string, tipoUnidad: string): boolean {
  const fechaCalculada = calcularFechaCaducidad(fechaExtraccion, tipoUnidad)
  return fechaCalculada === fechaCaducidad
}

/**
 * Calcula los días restantes hasta la caducidad
 * @param fechaCaducidad - Fecha de caducidad en formato ISO
 * @returns Número de días restantes (negativo si ya venció)
 */
export function calcularDiasVigencia(fechaCaducidad: string): number {
  const hoy = new Date()
  const caducidad = new Date(fechaCaducidad)
  
  // Resetear las horas para comparar solo fechas
  hoy.setHours(0, 0, 0, 0)
  caducidad.setHours(0, 0, 0, 0)
  
  const diffTime = caducidad.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
} 