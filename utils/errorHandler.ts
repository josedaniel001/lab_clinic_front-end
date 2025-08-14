// utils/errorHandler.ts

interface ErrorObject {
  response?: {
    data?: any
  }
}

export function parseErrorMessage(error: ErrorObject): string {
  let mensaje = "Error desconocido"

  if (error?.response?.data) {
    const data = error.response.data

    if (typeof data === "string") {
      mensaje = data

    } else if (Array.isArray(data)) {
      // Manejo de lista de errores por ítem
      const errores = data
        .map((item, index) => {
          if (typeof item === "object" && item !== null && Object.keys(item).length > 0) {
            const firstKey = Object.keys(item)[0]
            const detail = Array.isArray(item[firstKey])
              ? item[firstKey][0]
              : item[firstKey]
            return `#${index + 1}: ${firstKey} - ${detail}`
          }
          return null
        })
        .filter((e) => e !== null)

      mensaje = errores.length
        ? `Errores en algunas muestras:\n${errores.join("\n")}`
        : "Algunos datos fueron ignorados por errores desconocidos"

    } else if (typeof data === "object") {
      const firstKey = Object.keys(data)[0]
      mensaje = Array.isArray(data[firstKey])
        ? data[firstKey][0]
        : data[firstKey]
    }
  }

  return mensaje
}
