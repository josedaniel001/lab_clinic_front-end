/**
 * Utilidad para mapear errores del backend a campos del formulario
 */

export interface BackendError {
  [key: string]: string | string[]
}

export interface FormErrors {
  [key: string]: string
}

/**
 * Mapea errores del backend a campos específicos del formulario
 * @param backendErrors - Errores devueltos por el backend
 * @param fieldMapping - Mapeo de campos del backend a campos del formulario
 * @returns Objeto con errores mapeados
 */
export function mapBackendErrors(
  backendErrors: BackendError,
  fieldMapping: Record<string, string>
): FormErrors {
  const formErrors: FormErrors = {}

  Object.entries(backendErrors).forEach(([backendField, errorMessage]) => {
    const formField = fieldMapping[backendField]
    
    if (formField) {
      // Si el error es un array, tomar el primer mensaje
      if (Array.isArray(errorMessage)) {
        formErrors[formField] = errorMessage[0]
      } else {
        formErrors[formField] = errorMessage as string
      }
    }
  })

  return formErrors
}

/**
 * Mapeo específico para el formulario de médicos
 */
export const medicoFieldMapping = {
  numero_documento: "numero_documento",
  codigo_laboratorio: "codigo_laboratorio", 
  nombres: "nombre",
  apellidos: "nombre", // Se mapea al mismo campo que nombres
  email: "correo",
  celular: "celular",
  telefono_consultorio: "telefono_consultorio",
  direccion_consultorio: "direccion_consultorio",
  genero: "sexo",
  especialidad_medica: "especialidades",
  municipio: "municipios",
  tipo_documento: "tipo_documento"
}

/**
 * Función específica para mapear errores del formulario de médicos
 */
export function mapMedicoErrors(backendErrors: BackendError): FormErrors {
  return mapBackendErrors(backendErrors, medicoFieldMapping)
} 