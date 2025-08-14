export const PREGUNTAS_ENTREVISTA = [
  {
    pregunta: "¿Su entrevista de Sangre hoy es?",
    tipo: "radio",
    opciones: ["Voluntaria", "Por reposición"],
  },
  {
    pregunta: "¿Ha participado en alguna colecta de donación voluntaria de Sangre?",
    tipo: "radio_simple",
  },
  {
    pregunta: "¿Ha donado sangre en los últimos 3 meses?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "¿En qué lugar?",
  },
  {
    pregunta: "¿Sufrió alguna reacción durante o después de la donación?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "Sí, ¿cuál?",
  },
  {
    pregunta: "¿Ha sido excluido alguna vez como donante de sangre?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "¿Por qué?",
  },
  {
    pregunta: "¿Cómo se siente hoy de Salud?",
    tipo: "radio",
    opciones: ["Bien", "Mal"],
    adicional: true,
    placeholder: "Mal, ¿Por qué?",
  },
  {
    pregunta:
      "¿En el último mes ha tenido síntomas de gripe o resfrío, como tos, fiebre, dolor de garganta u otro relacionado?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "Sí, ¿Cuál?",
  },
  {
    pregunta: "¿Anoche, durmió mínimo 6 horas?",
    tipo: "radio_simple",
  },
  {
    pregunta: "¿Desayunó alimentos con grasa hoy?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "Sí, ¿Cuál?",
  },
  {
    pregunta: "¿Ha tomado algún medicamento en la última semana incluso aspirina?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "¿Cuál y/o para qué?",
  },
  {
    pregunta: "¿Ha padecido de hepatitis después de los 11 años de edad?",
    tipo: "radio_simple",
  },
  {
    pregunta:
      "¿Ha recibido tratamiento de acupuntura o se ha hecho tatuajes o perforaciones corporales en el último año?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "Sí, ¿Cuándo?",
  },
  {
    pregunta: "¿Ha sufrido accidente grave o ha sido sometido a cirugía mayor en el último año?",
    tipo: "radio_simple",
    adicional: true,
    placeholder: "Sí, ¿Cuál?",
  },
  {
    pregunta: "¿Ha padecido paludismo (malaria) en los últimos 2 años?",
    tipo: "radio_simple",
    adicional_especial: {
      pregunta: "¿Completó tratamiento?",
      tipo: "radio_simple",
    },
  },
  {
    pregunta: "¿Ha tenido tratamiento dental en las últimas 72 horas?",
    tipo: "radio_simple",
  },
  {
    pregunta: "¿Ha padecido sudores nocturnos, fiebre, diarrea y/o tos por más de 10 días sin razón aparente?",
    tipo: "radio_simple",
  },
  {
    pregunta: "¿Ha perdido peso de manera injustificada, ha tenido ganglios inflamados en los últimos 6 meses?",
    tipo: "radio_simple",
  },
  {
   pregunta: "¿Le han puesto vacunas en los últimos dos meses?",
    tipo: "vacunas",
    opciones: [
      { nombre: "Influenza", adicional: false },
      { nombre: "Rabia", adicional: false },
      { nombre: "Otra", adicional: true, placeholder: "¿Cuál?" },
    ],
    adicional_tiempo: true,
    placeholder_tiempo: "¿Cuándo?",
  },
]

export const PREGUNTAS_ADICIONALES = [
  { pregunta: "¿Ha padecido de tuberculosis?" },
  {
    pregunta: "¿Padece de alguna enfermedad?",
    opciones: [
      "Diabetes",
      "Riñones",
      "Corazón",
      "Pulmones",
      "Sangrado excesivo",
      "Cáncer",
      "Convulsiones o ataques",
      "Lupus",
      "Alergias",
      "Policitemia",
    ],
  },
  { pregunta: "¿Ha consumido bebidas alcohólicas en las últimas 12 horas?" },
  { pregunta: "¿Conoce la chinche que transmite la enfermedad de Chagas?" },
  { pregunta: "¿Ha padecido de enfermedad de chagas?" },
  { pregunta: "¿Es trabajador de salud?" },
  { pregunta: "¿Ha tenido algún accidente laboral?" },
  { pregunta: "¿Usa o ha usado drogas por vía intravenosa o inhaladas?", adicional: true, placeholder: "¿Cuál?" },
  { pregunta: "¿Usted o su pareja han recibido sangre o trasplantes en el último año?" },
  { pregunta: "¿Ha estado en prisión por más de 72 hrs en el último año?" },
  { pregunta: "¿Ha viajado a otros países en el último año?" },
  {
    pregunta: "En el último año ha tenido relaciones sexuales con:",
    opciones: [
      "Una persona portadora del virus de SIDA (VIH)",
      "Hepatitis viral",
      "Persona que cambia frecuentemente de pareja o persona que se haya inyectado drogas",
      "Persona trabajador(es) del sexo o personas de su mismo sexo",
    ],
  },
  {
    pregunta: "¿Ha padecido de infecciones de transmisión sexual (Sífilis, Gonorrea, etc.) durante el último año?",
    adicional: true,
    placeholder: "¿Cuál?",
  },
  { pregunta: "¿Alguna vez se ha realizado la prueba de VIH?" },
]

export const PREGUNTAS_MUJERES = [
  { pregunta: "¿Está en su período menstrual?" },
  { pregunta: "¿Está embarazada?" },
  { pregunta: "¿Tuvo parto o aborto en los últimos 6 meses?" },
  { pregunta: "¿Está dando lactancia?" },
]

export const SEXO = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "OTRO", label: "Otro" },
]

export const GRUPOS_ETNICOS = [
  { value: "MESTIZO", label: "Mestizo" },
  { value: "INDIGENA", label: "Indígena" },
  { value: "AFRODESCENDIENTE", label: "Afrodescendiente" },
  { value: "GARIFUNA", label: "Garífuna" },
  { value: "XINCA", label: "Xinca" },
  { value: "OTRO", label: "Otro" },
]

export const NACIONALIDADES = [
  { value: "GUATEMALTECO", label: "Guatemalteco" },
  { value: "SALVADOREÑO", label: "Salvadoreño" },
  { value: "HONDUREÑO", label: "Hondureño" },
  { value: "NICARAGÜENSE", label: "Nicaragüense" },
  { value: "MEXICANO", label: "Mexicano" },
  { value: "OTRO", label: "Otro" },
]

export const OCUPACIONES = [
  { value: "ESTUDIANTE", label: "Estudiante" },
  { value: "DOCENTE", label: "Docente" },
  { value: "INGENIERO", label: "Ingeniero" },
  { value: "MEDICO", label: "Médico" },
  { value: "ABOGADO", label: "Abogado" },
  { value: "COMERCIANTE", label: "Comerciante" },
  { value: "DESEMPLEADO", label: "Desempleado" },
  { value: "OTRO", label: "Otro" },
]

export const ESTADOS_CIVILES = [
  { value: "SOLTERO", label: "Soltero" },
  { value: "CASADO", label: "Casado" },
  { value: "DIVORCIADO", label: "Divorciado" },
  { value: "VIUDO", label: "Viudo" },
  { value: "UNION_LIBRE", label: "Unión libre" },
]

export const TIPOS_SANGRE = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
]
