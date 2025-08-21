import api from "./api"

export interface EntrevistaDonante {
  id: number
  // Datos del donante
  donante?: {
    id: number
    cui: string
    primer_nombre: string
    segundo_nombre?: string
    primer_apellido: string
    segundo_apellido?: string
    direccion: string
    celular: string
    sexo: string
    fecha_nacimiento: string
    edad: number
    activo: boolean
    ocupacion: string
    apto_donacion: boolean
    tiene_entrevista_apro: boolean
    municipio: number
  }
  
  // Datos de la orden
  orden?: {
    id: number
    codigo: string
    paciente: any
    donante: number
    donante_nombre: string
    genero_entrevista: boolean
    continuar_entrevista: boolean
    medico: number
    medico_nombre: string
    fecha: string
    hora: string
    estado: string
    detalles: any[]
    total_examenes: number
    prioridad: string
  }

  // Datos generales de la entrevista
  correlativo: string
  pdf_url?: string
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  celular: string
  sexo: string
  grupo_etnico: string
  fecha_nacimiento: string
  edad: number
  lugar_nacimiento?: string
  nacionalidad: string
  ocupacion: string
  comunidad_linguistica?: string
  estado_civil: string
  direccion_casa: string
  telefono_casa: string
  correo: string
  direccion_trabajo?: string
  telefono_trabajo?: string
  tipo_sangre: string

  // Examen físico
  peso: number
  pulso: number
  temperatura: number
  hemoglobina: number
  presion_sistolica: number
  presion_diastolica: number
  hematocrito: number

  // Respuestas de entrevista
  respuestas_entrevista: { [key: string]: string }
  respuestas_adicionales_entrevista?: { [key: string]: string }
  respuestas_medicas_adicionales?: { [key: string]: string }
  respuestas_mujeres?: { [key: string]: string } | null

  // Consentimiento
  consentimiento_informado: boolean
  nombre_entrevistador: string
  firma_donador?: string
  firma_entrevistador?: string

  // Flebotomía
  hora_inicio_flebotomia?: string
  hora_finalizacion_flebotomia?: string
  cantidad_sangre?: number
  reacciones_adversas: boolean
  observaciones_flebotomia?: string
  nombre_flebotomista?: string
  firma_flebotomista?: string

  // Estado y metadatos
  fecha: string
  fecha_creacion: string
  estado: string
  pdf_entrevista?: string
}

export interface FiltrosEntrevista {
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
  busqueda?: string
  sexo?: string
  grupo_etnico?: string
}

export interface EstadisticasEntrevistas {
  total: number
  aceptados: number
  rechazados: number
  pendientes: number
  por_mes: { [key: string]: number }
  por_grupo_sanguineo: { [key: string]: number }
  por_sexo: { [key: string]: number }
  por_grupo_etnico: { [key: string]: number }
}

// Copiamos los datos mock del archivo original para usarlos como fallback
const mockEntrevistas: EntrevistaDonante[] = [
  {
    id: 1,
    correlativo: "ENT-20250115-0001",
    primer_nombre: "Juan",
    segundo_nombre: "Carlos",
    primer_apellido: "Pérez",
    segundo_apellido: "García",
    celular: "502-1234-5678",
    sexo: "MASCULINO",
    grupo_etnico: "Ladino",
    fecha_nacimiento: "1999-05-15",
    edad: 25,
    lugar_nacimiento: "Guatemala",
    nacionalidad: "GUATEMALTECO",
    ocupacion: "Ingeniero",
    comunidad_linguistica: "Español",
    estado_civil: "Soltero",
    direccion_casa: "Zona 1, Ciudad de Guatemala",
    telefono_casa: "502-1234-5678",
    correo: "juan.perez@email.com",
    tipo_sangre: "O+",
    peso: 70,
    pulso: 72,
    temperatura: 36.5,
    hemoglobina: 14.2,
    presion_sistolica: 120,
    presion_diastolica: 80,
    hematocrito: 42,
    respuestas_entrevista: {
      "¿Cómo se siente hoy de Salud?": "Bien",
      "¿Su entrevista de Sangre hoy es?": "Voluntaria",
      "¿Anoche, durmió mínimo 6 horas?": "Sí",
      "¿Desayunó alimentos con grasa hoy?": "Sí",
      "¿Ha donado sangre en los últimos 3 meses?": "No",
      "¿Ha sido excluido alguna vez como donante de sangre?": "No",
    },
    consentimiento_informado: true,
    nombre_entrevistador: "Dr. Ana Martínez",
    hora_inicio_flebotomia: "08:30",
    hora_finalizacion_flebotomia: "09:15",
    cantidad_sangre: 450,
    reacciones_adversas: false,
    nombre_flebotomista: "Lic. María González",
    fecha: "2024-01-15",
    fecha_creacion: "2024-01-15T08:00:00Z",
    estado: "completado",
  },
  {
    id: 2,
    correlativo: "ENT-20250116-0002",
    primer_nombre: "María",
    segundo_nombre: "Isabel",
    primer_apellido: "López",
    segundo_apellido: "Rodríguez",
    celular: "502-9876-5432",
    sexo: "FEMENINO",
    grupo_etnico: "Maya",
    fecha_nacimiento: "1994-08-22",
    edad: 30,
    lugar_nacimiento: "Quetzaltenango",
    nacionalidad: "GUATEMALTECO",
    ocupacion: "Médica",
    comunidad_linguistica: "Español",
    estado_civil: "Casada",
    direccion_casa: "Zona 10, Ciudad de Guatemala",
    telefono_casa: "502-9876-5432",
    correo: "maria.lopez@email.com",
    tipo_sangre: "A+",
    peso: 55,
    pulso: 68,
    temperatura: 36.8,
    hemoglobina: 12.8,
    presion_sistolica: 110,
    presion_diastolica: 70,
    hematocrito: 38,
    respuestas_entrevista: {
      "¿Cómo se siente hoy de Salud?": "Bien",
      "¿Su entrevista de Sangre hoy es?": "Voluntaria",
      "¿Anoche, durmió mínimo 6 horas?": "Sí",
      "¿Desayunó alimentos con grasa hoy?": "Sí",
      "¿Ha donado sangre en los últimos 3 meses?": "No",
      "¿Ha sido excluido alguna vez como donante de sangre?": "No",
    },
    respuestas_mujeres: {
      "¿Está en período menstrual?": "No",
      "¿Está embarazada?": "No",
      "¿Ha tenido parto o aborto en los últimos 6 meses?": "No",
      "¿Está dando lactancia?": "No",
    },
    consentimiento_informado: true,
    nombre_entrevistador: "Dr. Carlos Ramírez",
    hora_inicio_flebotomia: "10:00",
    hora_finalizacion_flebotomia: "10:45",
    cantidad_sangre: 450,
    reacciones_adversas: false,
    nombre_flebotomista: "Lic. Pedro Sánchez",
    fecha: "2024-01-16",
    fecha_creacion: "2024-01-16T09:30:00Z",
    estado: "completado",
  },
  {
    id: 3,
    correlativo: "ENT-20250117-0003",
    primer_nombre: "Carlos",
    segundo_nombre: "",
    primer_apellido: "García",
    segundo_apellido: "Hernández",
    celular: "502-4567-8901",
    sexo: "MASCULINO",
    grupo_etnico: "Ladino",
    fecha_nacimiento: "1996-03-10",
    edad: 28,
    lugar_nacimiento: "Antigua Guatemala",
    nacionalidad: "GUATEMALTECO",
    ocupacion: "Estudiante",
    comunidad_linguistica: "Español",
    estado_civil: "Soltero",
    direccion_casa: "Zona 15, Ciudad de Guatemala",
    telefono_casa: "502-4567-8901",
    correo: "carlos.garcia@email.com",
    tipo_sangre: "B+",
    peso: 75,
    pulso: 75,
    temperatura: 37.2,
    hemoglobina: 15.1,
    presion_sistolica: 125,
    presion_diastolica: 85,
    hematocrito: 45,
    respuestas_entrevista: {
      "¿Cómo se siente hoy de Salud?": "Bien",
      "¿Su entrevista de Sangre hoy es?": "Voluntaria",
      "¿Anoche, durmió mínimo 6 horas?": "Sí",
      "¿Desayunó alimentos con grasa hoy?": "Sí",
      "¿Ha donado sangre en los últimos 3 meses?": "No",
      "¿Ha sido excluido alguna vez como donante de sangre?": "No",
    },
    consentimiento_informado: true,
    nombre_entrevistador: "Dr. Ana Martínez",
    hora_inicio_flebotomia: "14:00",
    hora_finalizacion_flebotomia: "14:45",
    cantidad_sangre: 450,
    reacciones_adversas: false,
    nombre_flebotomista: "Lic. María González",
    fecha: "2024-01-17",
    fecha_creacion: "2024-01-17T13:30:00Z",
    estado: "pendiente",
  },
]

class EntrevistasAPI {
  private delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Obtener lista de entrevistas
  async obtenerEntrevistas(filtros: FiltrosEntrevista = {}): Promise<EntrevistaDonante[]> {
    try {
      // Construir query parameters
      const params = new URLSearchParams()
      
      if (filtros.estado && filtros.estado !== "all") {
        params.append("estado", filtros.estado)
      }
      
      if (filtros.fecha_desde) {
        params.append("fecha_desde", filtros.fecha_desde)
      }
      
      if (filtros.fecha_hasta) {
        params.append("fecha_hasta", filtros.fecha_hasta)
      }
      
      if (filtros.busqueda) {
        params.append("busqueda", filtros.busqueda)
      }
      
      if (filtros.sexo && filtros.sexo !== "all") {
        params.append("sexo", filtros.sexo)
      }
      
      if (filtros.grupo_etnico) {
        params.append("grupo_etnico", filtros.grupo_etnico)
      }

      const url = `/banco_sangre/entrevistas/?${params.toString()}`
      const response = await api.get(url)
      
      return response.data || []
    } catch (error: any) {
      // Si hay error, usar datos mock como fallback
      console.warn("Error al obtener entrevistas del servidor, usando datos mock:", error.message)
      
      let entrevistasFiltradas = [...mockEntrevistas]

      // Aplicar filtros
      if (filtros.estado && filtros.estado !== "all") {
        entrevistasFiltradas = entrevistasFiltradas.filter((e) => e.estado === filtros.estado)
      }

      if (filtros.fecha_desde) {
        entrevistasFiltradas = entrevistasFiltradas.filter((e) => e.fecha >= filtros.fecha_desde!)
      }

      if (filtros.fecha_hasta) {
        entrevistasFiltradas = entrevistasFiltradas.filter((e) => e.fecha <= filtros.fecha_hasta!)
      }

      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        entrevistasFiltradas = entrevistasFiltradas.filter(
          (e) =>
            e.primer_nombre.toLowerCase().includes(busqueda) ||
            e.primer_apellido.toLowerCase().includes(busqueda) ||
            e.correlativo.includes(busqueda),
        )
      }

      if (filtros.sexo && filtros.sexo !== "all") {
        entrevistasFiltradas = entrevistasFiltradas.filter((e) => e.sexo === filtros.sexo)
      }

      if (filtros.grupo_etnico) {
        entrevistasFiltradas = entrevistasFiltradas.filter((e) => e.grupo_etnico === filtros.grupo_etnico)
      }

      return entrevistasFiltradas
    }
  }

  // Obtener entrevista por ID
  async obtenerEntrevista(id: number): Promise<EntrevistaDonante> {
    await this.delay()

    const entrevista = mockEntrevistas.find((e) => e.id === id)
    if (!entrevista) {
      throw new Error("Entrevista no encontrada")
    }

    return entrevista
  }

  // Crear nueva entrevista
  async crearEntrevista(data: any): Promise<{ success: boolean; data?: EntrevistaDonante; message?: string }> {
    try {
      // Usar el endpoint real
      const response = await api.post("/banco_sangre/entrevistas/", data)
      
      return {
        success: true,
        data: response.data,
        message: "Entrevista creada exitosamente"
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear la entrevista"
      }
    }
  }

  // Actualizar entrevista
  async actualizarEntrevista(id: number, data: Partial<EntrevistaDonante>): Promise<EntrevistaDonante> {
    await this.delay()

    const index = mockEntrevistas.findIndex((e) => e.id === id)
    if (index === -1) {
      throw new Error("Entrevista no encontrada")
    }

    mockEntrevistas[index] = {
      ...mockEntrevistas[index],
      ...data,
      fecha_creacion: new Date().toISOString(),
    }
    return mockEntrevistas[index]
  }

  // Eliminar entrevista
  async eliminarEntrevista(id: number): Promise<void> {
    await this.delay()

    const index = mockEntrevistas.findIndex((e) => e.id === id)
    if (index === -1) {
      throw new Error("Entrevista no encontrada")
    }

    mockEntrevistas.splice(index, 1)
  }

  // Cambiar estado de entrevista
  async cambiarEstado(
    id: number,
    estado: "aceptado" | "rechazado" | "pendiente",
    observaciones?: string,
  ): Promise<EntrevistaDonante> {
    try {
      const payload = {
        estado,
        ...(observaciones && { observaciones })
      }
      const response = await api.patch(`/banco_sangre/entrevistas/${id}/`, payload)
      return response.data
    } catch (error: any) {
      // Si falla la llamada real, usar datos mock
      console.warn("Error al actualizar estado en el servidor, usando datos mock:", error?.message)
      
      const index = mockEntrevistas.findIndex((e) => e.id === id)
      if (index === -1) {
        throw new Error("Entrevista no encontrada")
      }

      mockEntrevistas[index] = {
        ...mockEntrevistas[index],
        estado,
        fecha_creacion: new Date().toISOString(),
      }
      return mockEntrevistas[index]
    }
  }

  // Nuevo: Actualizar el estado del donante (apto o no) y marcar la entrevista como aprobada
  async actualizarEstadoDonante(
    id: number,
    apto: boolean,
    tieneEntrevistaAprobada: boolean,
  ): Promise<EntrevistaDonante> {
    try {
      const payload = {
        apto_donacion: apto,
        tiene_entrevista_apro: tieneEntrevistaAprobada,
      }
      const response = await api.post(
        `/banco_sangre/entrevistas/${id}/actualizar-estado-donante/`,
        payload,
      )
      return response.data
    } catch (error: any) {
      // Si falla la llamada real, modificamos los datos mock
      console.warn(
        "Error al actualizar el estado del donante en el servidor, usando datos mock:",
        error?.message,
      )
      const index = mockEntrevistas.findIndex((e) => e.id === id)
      if (index === -1) {
        throw new Error("Entrevista no encontrada")
      }
      const entrevista = mockEntrevistas[index]
             const donante = {
         id: entrevista.donante?.id ?? 0,
         cui: entrevista.donante?.cui ?? "",
         primer_nombre: entrevista.donante?.primer_nombre ?? "",
         segundo_nombre: entrevista.donante?.segundo_nombre,
         primer_apellido: entrevista.donante?.primer_apellido ?? "",
         segundo_apellido: entrevista.donante?.segundo_apellido,
         direccion: entrevista.donante?.direccion ?? "",
         celular: entrevista.donante?.celular ?? "",
         sexo: entrevista.donante?.sexo ?? "",
         fecha_nacimiento: entrevista.donante?.fecha_nacimiento ?? "",
         edad: entrevista.donante?.edad ?? 0,
         activo: entrevista.donante?.activo ?? true,
         ocupacion: entrevista.donante?.ocupacion ?? "",
         apto_donacion: apto,
         tiene_entrevista_apro: tieneEntrevistaAprobada,
         municipio: entrevista.donante?.municipio ?? 0,
       }
      const nuevoEstado = apto ? "aceptado" : "rechazado"
      mockEntrevistas[index] = {
        ...entrevista,
        donante,
        estado: nuevoEstado,
        fecha_creacion: new Date().toISOString(),
      }
      return mockEntrevistas[index]
    }
  }

  // Obtener estadísticas calculadas desde las entrevistas
  async obtenerEstadisticas(entrevistas: EntrevistaDonante[]): Promise<EstadisticasEntrevistas> {
    const total = entrevistas.length
    const completadas = entrevistas.filter((e) => 
      e.estado === "completado" || e.estado === "validado" || e.estado === "aceptado"
    ).length
    const rechazadas = entrevistas.filter((e) => 
      e.estado === "rechazado" || e.estado === "rechazada"
    ).length
    const pendientes = entrevistas.filter((e) => 
      e.estado === "pendiente" || e.estado === "en proceso"
    ).length

    const por_mes: { [key: string]: number } = {}
    entrevistas.forEach((e) => {
      const mes = e.fecha.substring(0, 7)
      por_mes[mes] = (por_mes[mes] || 0) + 1
    })

    const por_grupo_sanguineo: { [key: string]: number } = {}
    entrevistas.forEach((e) => {
      if (e.tipo_sangre) {
        por_grupo_sanguineo[e.tipo_sangre] = (por_grupo_sanguineo[e.tipo_sangre] || 0) + 1
      }
    })

    const por_sexo: { [key: string]: number } = {}
    entrevistas.forEach((e) => {
      if (e.sexo) {
        por_sexo[e.sexo] = (por_sexo[e.sexo] || 0) + 1
      }
    })

    const por_grupo_etnico: { [key: string]: number } = {}
    entrevistas.forEach((e) => {
      if (e.grupo_etnico) {
        por_grupo_etnico[e.grupo_etnico] = (por_grupo_etnico[e.grupo_etnico] || 0) + 1
      }
    })

    return {
      total,
      aceptados: completadas,
      rechazados: rechazadas,
      pendientes,
      por_mes,
      por_grupo_sanguineo,
      por_sexo,
      por_grupo_etnico,
    }
  }

  // Generar reporte PDF
  async generarReportePDF(id: number): Promise<Blob> {
    await this.delay()
    return new Blob(["PDF content"], { type: "application/pdf" })
  }

  // Generar PDF de entrevista (POST) - ACTUALIZADO
  async generarPDF(id: number): Promise<{ file_url: string; mensaje: string; pdf_existe: boolean }> {
    try {
      const response = await api.post(`/banco_sangre/entrevistas/${id}/generar-pdf/`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Error al generar el PDF")
    }
  }

  // Descargar PDF de entrevista (GET/POST) - ACTUALIZADO
  async descargarPDF(id: number): Promise<{ file_url: string; mensaje: string; pdf_existe: boolean }> {
    try {
      // Intentar primero con GET
      try {
        const response = await api.get(`/banco_sangre/entrevistas/${id}/descargar-pdf/`)
        return response.data
      } catch (getError: any) {
        // Si GET falla, intentar con POST
        const response = await api.post(`/banco_sangre/entrevistas/${id}/descargar-pdf/`)
        return response.data
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Error al descargar el PDF")
    }
  }

  // Obtener URL del PDF (GET) - ACTUALIZADO
  async obtenerPDFURL(id: number): Promise<{ pdf_url: string; correlativo: string; donante: string }> {
    try {
      const response = await api.get(`/banco_sangre/entrevistas/${id}/pdf-url/`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Error al obtener la URL del PDF")
    }
  }

  // Obtener todos los PDFs de un donante (GET) - NUEVO
  async obtenerPDFsDonante(donanteId: number): Promise<{
    donante_id: number
    donante_nombre: string
    total_pdfs: number
    pdfs: Array<{
      entrevista_id: number
      correlativo: string
      fecha_creacion: string
      file_url: string
      pdf_path: string
    }>
  }> {
    try {
      const response = await api.get(`/banco_sangre/entrevistas/donante/${donanteId}/pdfs/`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Error al obtener PDFs del donante")
    }
  }

  // Exportar a Excel
  async exportarExcel(filtros: FiltrosEntrevista = {}): Promise<Blob> {
    await this.delay()
    return new Blob(["Excel content"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  }

  // Validar donante por CUI
  async validarDonante(cui: string): Promise<{ valido: boolean; mensaje: string; ultima_donacion?: string }> {
    await this.delay()
    const donanteExistente = mockEntrevistas.find((e) => e.donante?.cui === cui)
    if (donanteExistente) {
      const ultimaDonacion = new Date(donanteExistente.fecha)
      const hoy = new Date()
      const diasTranscurridos = Math.floor((hoy.getTime() - ultimaDonacion.getTime()) / (1000 * 60 * 60 * 24))
      if (diasTranscurridos < 90) {
        return {
          valido: false,
          mensaje: `El donante ya donó sangre hace ${diasTranscurridos} días. Debe esperar al menos 90 días entre donaciones.`,
          ultima_donacion: donanteExistente.fecha,
        }
      }
    }
    return {
      valido: true,
      mensaje: "Donante válido para donación",
    }
  }

  // Buscar donante
  async buscarDonante(termino: string): Promise<EntrevistaDonante[]> {
    await this.delay()
    const busqueda = termino.toLowerCase()
    return mockEntrevistas.filter(
      (e) =>
        e.primer_nombre.toLowerCase().includes(busqueda) ||
        e.primer_apellido.toLowerCase().includes(busqueda) ||
        e.correlativo.includes(busqueda),
    )
  }
}

export const entrevistasAPI = new EntrevistasAPI()