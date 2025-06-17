// Datos de prueba para simular respuestas de la API

// Usuarios
const users = [
  {
    id: "1",
    nombre_usuario: "admin",
    password: "admin123",
    correo: "admin@labofutura.com",
    id_rol: "1",
    nombre: "Administrador",
    activo: true,
    rol: "Administrador",
    twoFactorEnabled: true,
  },
  {
    id: "2",
    nombre_usuario: "bioquimico",
    password: "bio123",
    correo: "bio@labofutura.com",
    id_rol: "2",
    nombre: "Juan Pérez",
    activo: true,
    rol: "Bioquímico",
  },
  {
    id: "3",
    nombre_usuario: "recepcion",
    password: "recep123",
    correo: "recepcion@labofutura.com",
    id_rol: "3",
    nombre: "María López",
    activo: true,
    rol: "Recepcionista",
  },
]

// Roles
const roles = [
  { id: "1", nombre_rol: "Administrador", status: true, usuarios: 1 },
  { id: "2", nombre_rol: "Bioquímico", status: true, usuarios: 1 },
  { id: "3", nombre_rol: "Recepcionista", status: true, usuarios: 1 },
  { id: "4", nombre_rol: "Técnico de Laboratorio", status: true, usuarios: 0 },
]

// Permisos
const permisos = [
  { id: "1", nombre: "ver_dashboard", vista_modulo: "Dashboard", activo: true },
  { id: "2", nombre: "ver_modulo_recepcion", vista_modulo: "Recepción", activo: true },
  { id: "3", nombre: "ver_pacientes", vista_modulo: "Recepción", activo: true },
  { id: "4", nombre: "crear_paciente", vista_modulo: "Recepción", activo: true },
  { id: "5", nombre: "editar_paciente", vista_modulo: "Recepción", activo: true },
  { id: "6", nombre: "eliminar_paciente", vista_modulo: "Recepción", activo: true },
  { id: "7", nombre: "ver_medicos", vista_modulo: "Recepción", activo: true },
  { id: "8", nombre: "crear_medico", vista_modulo: "Recepción", activo: true },
  { id: "9", nombre: "editar_medico", vista_modulo: "Recepción", activo: true },
  { id: "10", nombre: "eliminar_medico", vista_modulo: "Recepción", activo: true },
  { id: "11", nombre: "ver_ordenes", vista_modulo: "Recepción", activo: true },
  { id: "12", nombre: "crear_orden", vista_modulo: "Recepción", activo: true },
  { id: "13", nombre: "eliminar_orden", vista_modulo: "Recepción", activo: true },
  { id: "14", nombre: "ver_modulo_laboratorio", vista_modulo: "Laboratorio", activo: true },
  { id: "15", nombre: "ver_resultados", vista_modulo: "Laboratorio", activo: true },
  { id: "16", nombre: "validar_resultados", vista_modulo: "Laboratorio", activo: true },
  { id: "17", nombre: "ver_inventario", vista_modulo: "Laboratorio", activo: true },
  { id: "18", nombre: "ver_modulo_reportes", vista_modulo: "Reportes", activo: true },
  { id: "19", nombre: "ver_estadisticas", vista_modulo: "Reportes", activo: true },
  { id: "20", nombre: "ver_modulo_admin", vista_modulo: "Administración", activo: true },
  { id: "21", nombre: "ver_usuarios", vista_modulo: "Administración", activo: true },
  { id: "22", nombre: "crear_usuario", vista_modulo: "Administración", activo: true },
  { id: "23", nombre: "editar_usuario", vista_modulo: "Administración", activo: true },
  { id: "24", nombre: "eliminar_usuario", vista_modulo: "Administración", activo: true },
  { id: "25", nombre: "ver_roles", vista_modulo: "Administración", activo: true },
  { id: "26", nombre: "crear_rol", vista_modulo: "Administración", activo: true },
  { id: "27", nombre: "editar_rol", vista_modulo: "Administración", activo: true },
  { id: "28", nombre: "eliminar_rol", vista_modulo: "Administración", activo: true },
  { id: "29", nombre: "editar_permisos", vista_modulo: "Administración", activo: true },
  { id: "30", nombre: "ver_notificaciones", vista_modulo: "Dashboard", activo: true },
  { id: "31", nombre: "ver_modulo_facturacion", vista_modulo: "Facturación", activo: true },
  { id: "32", nombre: "ver_facturas", vista_modulo: "Facturación", activo: true },
  { id: "33", nombre: "ver_reportes_facturacion", vista_modulo: "Facturación", activo: true },
]

// 🎯 PERMISOS POR ROL - AQUÍ ESTÁ LA CONFIGURACIÓN ESPECÍFICA
const permisosPorRol = {
  // 👑 ADMINISTRADOR - Acceso completo a todo
  "1": [
    "ver_dashboard",
    "ver_notificaciones",
    // Recepción - Acceso completo
    "ver_modulo_recepcion",
    "ver_pacientes",
    "crear_paciente",
    "editar_paciente",
    "eliminar_paciente",
    "ver_medicos",
    "crear_medico",
    "editar_medico",
    "eliminar_medico",
    "ver_ordenes",
    "crear_orden",
    "eliminar_orden",
    // Laboratorio - Acceso completo
    "ver_modulo_laboratorio",
    "ver_resultados",
    "validar_resultados",
    "ver_inventario",
    // Reportes - Acceso completo
    "ver_modulo_reportes",
    "ver_estadisticas",
    // Facturación - Acceso completo
    "ver_modulo_facturacion",
    "ver_facturas",
    "ver_reportes_facturacion",
    // Administración - Acceso completo
    "ver_modulo_admin",
    "ver_usuarios",
    "crear_usuario",
    "editar_usuario",
    "eliminar_usuario",
    "ver_roles",
    "crear_rol",
    "editar_rol",
    "eliminar_rol",
    "editar_permisos",
  ],

  // 🧪 BIOQUÍMICO - Enfocado en laboratorio y resultados
  "2": [
    "ver_dashboard",
    "ver_notificaciones",
    // Recepción - Solo lectura de pacientes y órdenes
    "ver_modulo_recepcion",
    "ver_pacientes", // Solo ver, no crear/editar/eliminar
    "ver_medicos", // Solo ver
    "ver_ordenes", // Solo ver
    // Laboratorio - Acceso completo
    "ver_modulo_laboratorio",
    "ver_resultados",
    "validar_resultados", // Puede validar resultados
    "ver_inventario",
    // Reportes - Solo estadísticas
    "ver_modulo_reportes",
    "ver_estadisticas",
  ],

  // 📋 RECEPCIONISTA - Enfocado en recepción y pacientes
  "3": [
    "ver_dashboard",
    "ver_notificaciones",
    // Recepción - Acceso completo
    "ver_modulo_recepcion",
    "ver_pacientes",
    "crear_paciente",
    "editar_paciente", // No puede eliminar
    "ver_medicos",
    "crear_medico",
    "editar_medico", // No puede eliminar
    "ver_ordenes",
    "crear_orden", // No puede eliminar
    // Laboratorio - Solo ver resultados (no validar)
    "ver_modulo_laboratorio",
    "ver_resultados", // Solo ver, no validar
    // Reportes - Solo estadísticas básicas
    "ver_modulo_reportes",
    "ver_estadisticas",
  ],

  // 🔬 TÉCNICO DE LABORATORIO - Solo laboratorio
  "4": [
    "ver_dashboard",
    "ver_notificaciones",
    // Recepción - Solo ver órdenes
    "ver_modulo_recepcion",
    "ver_ordenes", // Solo ver órdenes asignadas
    // Laboratorio - Procesar pero no validar
    "ver_modulo_laboratorio",
    "ver_resultados", // Puede ver y procesar, pero no validar
    "ver_inventario",
  ],
}

// Pacientes
const pacientes = [
  {
    id: "1",
    nombre: "Juan Pérez",
    edad: 35,
    sexo: "M",
    celular: "1234567890",
    correo: "juan@example.com",
    procedencia: "Local",
  },
  {
    id: "2",
    nombre: "María García",
    edad: 28,
    sexo: "F",
    celular: "0987654321",
    correo: "maria@example.com",
    procedencia: "Referido",
  },
  {
    id: "3",
    nombre: "Carlos López",
    edad: 42,
    sexo: "M",
    celular: "5555555555",
    correo: "carlos@example.com",
    procedencia: "Local",
  },
  {
    id: "4",
    nombre: "Ana Martínez",
    edad: 31,
    sexo: "F",
    celular: "6666666666",
    correo: "ana@example.com",
    procedencia: "Referido",
  },
  {
    id: "5",
    nombre: "Roberto Sánchez",
    edad: 50,
    sexo: "M",
    celular: "7777777777",
    correo: "roberto@example.com",
    procedencia: "Local",
  },
]

// Médicos
const medicos = [
  {
    id: "1",
    nombre: "Dr. Alejandro Rodríguez",
    correo: "alejandro@example.com",
    celular: "1111111111",
    direccion_clinica: "Calle Principal 123",
  },
  {
    id: "2",
    nombre: "Dra. Sofía Hernández",
    correo: "sofia@example.com",
    celular: "2222222222",
    direccion_clinica: "Avenida Central 456",
  },
  {
    id: "3",
    nombre: "Dr. Miguel Torres",
    correo: "miguel@example.com",
    celular: "3333333333",
    direccion_clinica: "Plaza Mayor 789",
  },
]

// Exámenes
const examenes = [
  {
    id: "1",
    codigo_abreviado: "GLUC",
    nombre: "Glucosa",
    area: "Química Clínica",
    dimensional_por_defecto: "mg/dL",
    activo: true,
  },
  {
    id: "2",
    codigo_abreviado: "CREA",
    nombre: "Creatinina",
    area: "Química Clínica",
    dimensional_por_defecto: "mg/dL",
    activo: true,
  },
  {
    id: "3",
    codigo_abreviado: "UREA",
    nombre: "Urea",
    area: "Química Clínica",
    dimensional_por_defecto: "mg/dL",
    activo: true,
  },
  {
    id: "4",
    codigo_abreviado: "HB",
    nombre: "Hemoglobina",
    area: "Hematología",
    dimensional_por_defecto: "g/dL",
    activo: true,
  },
  {
    id: "5",
    codigo_abreviado: "HTO",
    nombre: "Hematocrito",
    area: "Hematología",
    dimensional_por_defecto: "%",
    activo: true,
  },
  {
    id: "6",
    codigo_abreviado: "PLT",
    nombre: "Plaquetas",
    area: "Hematología",
    dimensional_por_defecto: "x10^3/µL",
    activo: true,
  },
  {
    id: "7",
    codigo_abreviado: "COL",
    nombre: "Colesterol Total",
    area: "Química Clínica",
    dimensional_por_defecto: "mg/dL",
    activo: true,
  },
  {
    id: "8",
    codigo_abreviado: "TRIG",
    nombre: "Triglicéridos",
    area: "Química Clínica",
    dimensional_por_defecto: "mg/dL",
    activo: true,
  },
]

// Órdenes
const ordenes = [
  {
    id: "1",
    codigo: "ORD-001",
    paciente: "Juan Pérez",
    medico: "Dr. Alejandro Rodríguez",
    fecha: "2023-06-10",
    hora: "09:30",
    estado: "Validado",
    examenes: 3,
  },
  {
    id: "2",
    codigo: "ORD-002",
    paciente: "María García",
    medico: "Dra. Sofía Hernández",
    fecha: "2023-06-10",
    hora: "10:15",
    estado: "Procesado",
    examenes: 2,
  },
  {
    id: "3",
    codigo: "ORD-003",
    paciente: "Carlos López",
    medico: "Dr. Miguel Torres",
    fecha: "2023-06-10",
    hora: "11:00",
    estado: "Pendiente",
    examenes: 4,
  },
  {
    id: "4",
    codigo: "ORD-004",
    paciente: "Ana Martínez",
    medico: "Dr. Alejandro Rodríguez",
    fecha: "2023-06-11",
    hora: "09:00",
    estado: "Validado",
    examenes: 1,
  },
  {
    id: "5",
    codigo: "ORD-005",
    paciente: "Roberto Sánchez",
    medico: "Dra. Sofía Hernández",
    fecha: "2023-06-11",
    hora: "10:30",
    estado: "Pendiente",
    examenes: 3,
  },
]

// Resultados
const resultados = [
  {
    id: "1",
    examen: "Glucosa",
    codigo_abreviado: "GLUC",
    valor_numerico: 95,
    dimensional: "mg/dL",
    intervalo_referencia_min: 70,
    intervalo_referencia_max: 100,
    observacion_especifica: "",
  },
  {
    id: "2",
    examen: "Creatinina",
    codigo_abreviado: "CREA",
    valor_numerico: 0.9,
    dimensional: "mg/dL",
    intervalo_referencia_min: 0.6,
    intervalo_referencia_max: 1.2,
    observacion_especifica: "",
  },
  {
    id: "3",
    examen: "Hemoglobina",
    codigo_abreviado: "HB",
    valor_numerico: 14.5,
    dimensional: "g/dL",
    intervalo_referencia_min: 12,
    intervalo_referencia_max: 16,
    observacion_especifica: "",
  },
]

// Estadísticas
const estadisticas = {
  examenesArea: [
    { name: "Química Clínica", value: 120 },
    { name: "Hematología", value: 85 },
    { name: "Microbiología", value: 45 },
    { name: "Inmunología", value: 60 },
    { name: "Uroanálisis", value: 30 },
  ],
  examenesPopulares: [
    { name: "Glucosa", value: 45 },
    { name: "Hemograma", value: 35 },
    { name: "Perfil Lipídico", value: 25 },
    { name: "Urea", value: 20 },
    { name: "Creatinina", value: 15 },
  ],
  pacientesPorMes: [
    { name: "Ene", value: 65 },
    { name: "Feb", value: 59 },
    { name: "Mar", value: 80 },
    { name: "Abr", value: 81 },
    { name: "May", value: 56 },
    { name: "Jun", value: 55 },
    { name: "Jul", value: 40 },
  ],
  medicosSolicitantes: [
    { name: "Dr. Alejandro Rodríguez", value: 45 },
    { name: "Dra. Sofía Hernández", value: 38 },
    { name: "Dr. Miguel Torres", value: 25 },
    { name: "Dra. Laura Gómez", value: 18 },
    { name: "Dr. Carlos Ramírez", value: 15 },
  ],
  tiempoEntrega: [
    { name: "Química Clínica", value: 2.5 },
    { name: "Hematología", value: 1.8 },
    { name: "Microbiología", value: 24 },
    { name: "Inmunología", value: 4.5 },
    { name: "Uroanálisis", value: 2.0 },
  ],
}

// Funciones para simular respuestas de la API

// Auth
export const mockLogin = (username: string, password: string) => {
  const user = users.find((u) => u.nombre_usuario === username && u.password === password)

  if (!user) {
    throw new Error("Credenciales incorrectas")
  }

  // Eliminar la contraseña antes de devolver el usuario
  const { password: _, ...userWithoutPassword } = user

  // Simulamos que el usuario admin tiene 2FA habilitado
  if (username === "admin" && user.twoFactorEnabled) {
    return {
      token: "mock-temp-token-for-2fa",
      requireTwoFactor: true,
    }
  }

  return {
    token: {
      accessToken: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
    },
    user: userWithoutPassword,
    requireTwoFactor: false,
  }
}

export const mockRegister = (userData: any) => {
  // Verificar si el usuario ya existe
  const existingUser = users.find((u) => u.nombre_usuario === userData.nombre_usuario || u.correo === userData.correo)

  if (existingUser) {
    throw new Error("El nombre de usuario o correo ya está en uso")
  }

  // En un entorno real, aquí se guardaría el usuario en la base de datos
  return { success: true }
}

export const mockGetCurrentUser = () => {
  // Simular que obtenemos el usuario actual del token
  const user = users[0]
  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
}

// Usuarios
export const mockGetUsuarios = () => {
  return users.map(({ password: _, ...user }) => ({
    ...user,
    id: user.id,
  }))
}

export const mockCreateUsuario = (userData: any) => {
  // En un entorno real, aquí se guardaría el usuario en la base de datos
  return { success: true }
}

export const mockUpdateUsuario = (id: string, userData: any) => {
  // En un entorno real, aquí se actualizaría el usuario en la base de datos
  return { success: true }
}

export const mockDeleteUsuario = (id: string) => {
  // En un entorno real, aquí se eliminaría el usuario de la base de datos
  return { success: true }
}

// Roles
export const mockGetRoles = () => {
  return roles
}

export const mockCreateRol = (rolData: any) => {
  // En un entorno real, aquí se guardaría el rol en la base de datos
  return { success: true }
}

export const mockUpdateRol = (id: string, rolData: any) => {
  // En un entorno real, aquí se actualizaría el rol en la base de datos
  return { success: true }
}

export const mockDeleteRol = (id: string) => {
  // En un entorno real, aquí se eliminaría el rol de la base de datos
  return { success: true }
}

// Permisos
export const mockGetPermisos = () => {
  return permisos
}

// 🎯 FUNCIÓN CORREGIDA - Ahora filtra permisos por rol específico
export const mockGetPermisosByRol = (rolId: string) => {
  // Obtener los nombres de permisos para este rol específico
  const permisosDelRol = permisosPorRol[rolId as keyof typeof permisosPorRol] || []

  // Filtrar y devolver solo los permisos que tiene este rol
  return permisos.filter((permiso) => permisosDelRol.includes(permiso.nombre) && permiso.activo)
}

export const mockSavePermisos = (rolId: string, permisosData: any) => {
  // En un entorno real, aquí se guardarían los permisos en la base de datos
  return { success: true }
}

// Pacientes
export const mockGetPacientes = () => {
  return pacientes
}

export const mockCreatePaciente = (pacienteData: any) => {
  // En un entorno real, aquí se guardaría el paciente en la base de datos
  return { success: true }
}

export const mockUpdatePaciente = (id: string, pacienteData: any) => {
  // En un entorno real, aquí se actualizaría el paciente en la base de datos
  return { success: true }
}

export const mockDeletePaciente = (id: string) => {
  // En un entorno real, aquí se eliminaría el paciente de la base de datos
  return { success: true }
}

// Médicos
export const mockGetMedicos = () => {
  return medicos
}

export const mockCreateMedico = (medicoData: any) => {
  // En un entorno real, aquí se guardaría el médico en la base de datos
  return { success: true }
}

export const mockUpdateMedico = (id: string, medicoData: any) => {
  // En un entorno real, aquí se actualizaría el médico en la base de datos
  return { success: true }
}

export const mockDeleteMedico = (id: string) => {
  // En un entorno real, aquí se eliminaría el médico de la base de datos
  return { success: true }
}

// Exámenes
export const mockGetExamenes = () => {
  return examenes
}

// Órdenes
export const mockGetOrdenes = () => {
  return ordenes
}

export const mockCreateOrden = (ordenData: any) => {
  // En un entorno real, aquí se guardaría la orden en la base de datos
  return { success: true }
}

export const mockDeleteOrden = (id: string) => {
  // En un entorno real, aquí se eliminaría la orden de la base de datos
  return { success: true }
}

// Resultados
export const mockGetOrdenesPendientes = () => {
  return ordenes.filter((orden) => orden.estado === "Pendiente")
}

export const mockGetOrdenesEnProceso = () => {
  return ordenes.filter((orden) => orden.estado === "Procesado")
}

export const mockGetOrdenesValidadas = () => {
  return ordenes.filter((orden) => orden.estado === "Validado")
}

export const mockGetResultadosByOrden = (ordenId: string) => {
  // En un entorno real, aquí se filtrarían los resultados por orden
  return resultados
}

export const mockSaveResultados = (ordenId: string, resultadosData: any) => {
  // En un entorno real, aquí se guardarían los resultados en la base de datos
  return { success: true }
}

export const mockValidateResultados = (ordenId: string, resultadosData: any, usuarioId: string) => {
  // En un entorno real, aquí se validarían los resultados en la base de datos
  return { success: true }
}

// Estadísticas
export const mockGetEstadisticas = (filtros: any) => {
  // En un entorno real, aquí se filtrarían las estadísticas según los filtros
  return estadisticas
}

// Dashboard
export const mockGetDashboardStats = () => {
  return {
    pacientes: Math.floor(Math.random() * 1000) + 500,
    ordenes: Math.floor(Math.random() * 500) + 200,
    examenes: Math.floor(Math.random() * 2000) + 1000,
    pendientes: Math.floor(Math.random() * 50) + 10,
  }
}

// Función para generar órdenes recientes de prueba
export const mockGetRecentOrders = () => {
  const estados = ["Pendiente", "Procesado", "Validado"]
  const examenes = ["Hemograma completo", "Glucosa", "Perfil lipídico", "Urea y creatinina", "TSH", "Orina completa"]
  const nombres = [
    "Juan Pérez",
    "María González",
    "Carlos Rodríguez",
    "Ana Martínez",
    "Luis Sánchez",
    "Laura Torres",
    "Pedro Ramírez",
    "Sofía López",
  ]

  // Generar fecha aleatoria en los últimos 7 días
  const getRandomDate = () => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 7))
    return date.toLocaleDateString()
  }

  // Generar un array de órdenes aleatorias
  return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
    id: i + 1,
    paciente: nombres[Math.floor(Math.random() * nombres.length)],
    examen: examenes[Math.floor(Math.random() * examenes.length)],
    fecha: getRandomDate(),
    estado: estados[Math.floor(Math.random() * estados.length)],
  }))
}

// Simulación de autenticación de dos factores
export const mockVerifyTwoFactor = (tempToken: string, code: string) => {
  // Verificar que el código sea válido (en un entorno real, esto sería más complejo)
  if (code !== "123456") {
    throw new Error("Código de verificación inválido")
  }

  // Simulamos que el token temporal es válido
  const user = users[0]
  const { password: _, ...userWithoutPassword } = user

  return {
    token: {
      accessToken: "mock-jwt-token-after-2fa",
      refreshToken: "mock-refresh-token-after-2fa",
    },
    user: userWithoutPassword,
  }
}

export const mockEnableTwoFactor = () => {
  // En un entorno real, esto generaría un secreto TOTP y un código QR
  return {
    secret: "JBSWY3DPEHPK3PXP", // Ejemplo de secreto TOTP
    qrCodeUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/LaboFutura:admin@labofutura.com?secret=JBSWY3DPEHPK3PXP&issuer=LaboFutura",
  }
}

export const mockDisableTwoFactor = (code: string) => {
  // Verificar que el código sea válido
  if (code !== "123456") {
    throw new Error("Código de verificación inválido")
  }

  return { success: true }
}

export const mockRefreshToken = (refreshToken: string) => {
  // En un entorno real, esto verificaría que el refresh token sea válido
  if (!refreshToken) {
    throw new Error("Refresh token inválido")
  }

  return {
    token: "mock-new-jwt-token",
    refreshToken: "mock-new-refresh-token",
  }
}
