"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/layout/PageLayout"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save, ArrowLeft, ArrowRight, User, Activity, FileText, Droplets } from "lucide-react"
import { useNotification } from "@/hooks/useNotification"
import { entrevistasAPI } from "@/api/entrevistasAPI"
import { obtenerFechaGuatemalaISO } from "@/utils/fecha"
import {
  OCUPACIONES,
  ESTADOS_CIVILES,
  PREGUNTAS_ADICIONALES,
  PREGUNTAS_MUJERES,
  PREGUNTAS_ENTREVISTA,
  GRUPOS_ETNICOS,
  NACIONALIDADES,
  SEXO,
  TIPOS_SANGRE,
} from "@/types/CatalogosEntevista"
import { useSearchParams } from "next/navigation"
import { ordenesAPI } from "@/api/ordenesAPI"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const PASOS = [
  { id: 1, titulo: "Datos Generales", icono: User },
  { id: 2, titulo: "Examen Físico", icono: Activity },
  { id: 3, titulo: "Entrevista Médica", icono: FileText },
  { id: 4, titulo: "Consentimiento y Flebotomía", icono: Droplets },
]

export default function NuevaEntrevistaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idOrden = searchParams.get("id_orden")
  const { showNotification } = useNotification()
  const [pasoActual, setPasoActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [orden, setOrden] = useState<any>(null)
  const [loadingOrden, setLoadingOrden] = useState(false)
  const [datosEntrevista, setDatosEntrevista] = useState({
    fecha: "",
    lugar_colecta: "",
    numero_correlativo: "",
    cui: "",
    pasaporte: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    sexo: "",
    grupo_etnico: "",
    edad: "",
    fecha_nacimiento: "",
    lugar_nacimiento: "",
    nacionalidad: "",
    ocupacion: "",
    comunidad_linguistica: "",
    estado_civil: "",
    direccion_casa: "",
    telefono_casa: "",
    correo: "",
    direccion_trabajo: "",
    telefono_trabajo: "",
    tipo_sangre: "",
    peso: "",
    pulso: "",
    temperatura: "",
    hemoglobina: "",
    presion_sistolica: "",
    presion_diastolica: "",
    hematocrito: "",
    respuestas: {},
    respuestas_adicionales: {},
    consentimiento_informado: false,
    nombre_entrevistador: "",
    respuestas_adicionales_medicas: {},
    respuestas_mujeres: {},
    consentimiento_texto: "",
    firma_donador: "",
    firma_entrevistador: "",
    hora_inicio_flebotomia: "",
    hora_finalizacion_flebotomia: "",
    cantidad_sangre: "",
    reacciones_adversas: false,
    observaciones_flebotomia: "",
    nombre_flebotomista: "",
    firma_flebotomista: "",
  })

  const [errors, setErrors] = useState({
    fecha: "",
    numero_correlativo: "",
    cui: "",
    primer_nombre: "",
    primer_apellido: "",
    sexo: "",
    grupo_etnico: "",
    fecha_nacimiento: "",
    edad: "",
    lugar_nacimiento: "",
    nacionalidad: "",
    ocupacion: "",
    estado_civil: "",
    direccion_casa: "",
    telefono_casa: "",
    correo: "",
    tipo_sangre: "",
    peso: "",
    pulso: "",
    temperatura: "",
    hemoglobina: "",
    presion_sistolica: "",
    presion_diastolica: "",
    hematocrito: "",
    respuestas: {}, // Aseguramos que respuestas sea un objeto
    general: "",
  })

  const [resultadosModalOpen, setResultadosModalOpen] = useState(false)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null)
  const [detalleModalOpen, setDetalleModalOpen] = useState(false)

  useEffect(() => {
    const fechaHoy = obtenerFechaGuatemalaISO()
    handleInputChange("fecha", fechaHoy)
    obtenerCorrelativo()
    // Si viene id_orden, buscar la orden y mostrar modal
    if (idOrden) {
      setLoadingOrden(true)
      ordenesAPI.getOrdenById(idOrden)
        .then((data) => {
          setOrden(data)
          setModalOpen(true)
          // Precargar datos del donante si lo deseas:
          if (data && data.donante) {
            handleInputChange("primer_nombre", data.donante.primer_nombre || "")
            handleInputChange("segundo_nombre", data.donante.segundo_nombre || "")
            handleInputChange("primer_apellido", data.donante.primer_apellido || "")
            handleInputChange("segundo_apellido", data.donante.segundo_apellido || "")
            handleInputChange("cui", data.donante.cui || "")
            handleInputChange("sexo", data.donante.sexo || "")
            handleInputChange("fecha_nacimiento", data.donante.fecha_nacimiento || "")
            // Puedes precargar más campos si lo deseas
          }
        })
        .catch(() => {
          showNotification("No se pudo cargar la orden", "error")
        })
        .finally(() => setLoadingOrden(false))
    }
  }, [])

  const obtenerCorrelativo = async () => {
    try {
      // Generar número correlativo local
      const fechaHoy = new Date()
      const año = fechaHoy.getFullYear()
      const mes = String(fechaHoy.getMonth() + 1).padStart(2, '0')
      const dia = String(fechaHoy.getDate()).padStart(2, '0')
      
      // Generar un número secuencial basado en la fecha
      const timestamp = Date.now()
      const numeroSecuencial = String(timestamp % 10000).padStart(4, '0')
      
      const numeroCorrelativo = `${año}${mes}${dia}-${numeroSecuencial}`
      handleInputChange("numero_correlativo", numeroCorrelativo)
    } catch (error) {
      console.error("Error al generar el número correlativo:", error)
      // Fallback: usar timestamp como correlativo
      const fallbackCorrelativo = `ENT-${Date.now()}`
      handleInputChange("numero_correlativo", fallbackCorrelativo)
    }
  }

  const handleInputChange = (campo: string, valor: string | number | boolean) => {
    setDatosEntrevista((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const handleRespuestaChange = (pregunta: string, respuesta: string) => {
    setDatosEntrevista((prev) => ({
      ...prev,
      respuestas: {
        ...prev.respuestas,
        [pregunta]: respuesta,
      },
    }))
  }

  const handleRespuestaAdicionalChange = (pregunta: string, valor: string) => {
    setDatosEntrevista((prev) => ({
      ...prev,
      respuestas_adicionales: {
        ...prev.respuestas_adicionales,
        [pregunta]: valor,
      },
    }))
  }

  const validarFormulario = (paso?: number) => {
    const errores = {
      fecha: "",
      numero_correlativo: "",
      cui: "",
      primer_nombre: "",
      primer_apellido: "",
      sexo: "",
      grupo_etnico: "",
      fecha_nacimiento: "",
      edad: "",
      lugar_nacimiento: "",
      nacionalidad: "",
      ocupacion: "",
      estado_civil: "",
      direccion_casa: "",
      telefono_casa: "",
      correo: "",
      tipo_sangre: "",
      peso: "",
      pulso: "",
      temperatura: "",
      hemoglobina: "",
      presion_sistolica: "",
      presion_diastolica: "",
      hematocrito: "",
      respuestas: {}, // Aseguramos que respuestas sea un objeto nuevo en cada validación
      general: "",
    }

    switch (paso) {
      case 1:
        if (!datosEntrevista.fecha) errores.fecha = "La fecha es obligatoria."
        if (!datosEntrevista.numero_correlativo) errores.numero_correlativo = "El número correlativo es obligatorio."
        if (!/^\d{13}$/.test(datosEntrevista.cui)) errores.cui = "El CUI debe tener 13 dígitos."
        if (!datosEntrevista.primer_nombre) errores.primer_nombre = "El primer nombre es obligatorio."
        if (!datosEntrevista.primer_apellido) errores.primer_apellido = "El primer apellido es obligatorio."
        if (!datosEntrevista.sexo) errores.sexo = "Debe seleccionar el sexo."
        if (!datosEntrevista.grupo_etnico) errores.grupo_etnico = "Debe seleccionar el grupo étnico."
        if (!datosEntrevista.fecha_nacimiento) errores.fecha_nacimiento = "La fecha de nacimiento es obligatoria."
        if (!datosEntrevista.edad || isNaN(Number(datosEntrevista.edad))) errores.edad = "Edad inválida."
        if (!datosEntrevista.lugar_nacimiento) errores.lugar_nacimiento = "El lugar de nacimiento es obligatorio."
        if (!datosEntrevista.nacionalidad) errores.nacionalidad = "Debe seleccionar la nacionalidad."
        if (!datosEntrevista.ocupacion) errores.ocupacion = "Debe seleccionar la ocupación."
        if (!datosEntrevista.estado_civil) errores.estado_civil = "Debe seleccionar el estado civil."
        if (!datosEntrevista.direccion_casa) errores.direccion_casa = "La dirección de casa es obligatoria."
        if (!/^\d{8}$/.test(datosEntrevista.telefono_casa)) errores.telefono_casa = "El teléfono debe tener 8 dígitos."
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosEntrevista.correo)) errores.correo = "Correo inválido."
        if (!datosEntrevista.tipo_sangre) errores.tipo_sangre = "Debe seleccionar el tipo de sangre."
        break

      case 2:
        if (datosEntrevista.peso == null || Number(datosEntrevista.peso) <= 0 || isNaN(Number(datosEntrevista.peso)))
          errores.peso = "El peso debe ser un número positivo."
        if (datosEntrevista.pulso == null || Number(datosEntrevista.pulso) <= 0 || isNaN(Number(datosEntrevista.pulso)))
          errores.pulso = "El pulso debe ser un número positivo."
        if (
          datosEntrevista.temperatura == null ||
          Number(datosEntrevista.temperatura) <= 0 ||
          isNaN(Number(datosEntrevista.temperatura))
        )
          errores.temperatura = "La temperatura debe ser un número positivo."
        if (
          datosEntrevista.hemoglobina == null ||
          Number(datosEntrevista.hemoglobina) <= 0 ||
          isNaN(Number(datosEntrevista.hemoglobina))
        )
          errores.hemoglobina = "La hemoglobina debe ser un número positivo."
        if (
          datosEntrevista.presion_sistolica == null ||
          Number(datosEntrevista.presion_sistolica) <= 0 ||
          isNaN(Number(datosEntrevista.presion_sistolica))
        )
          errores.presion_sistolica = "La presión sistólica debe ser un número positivo."
        if (
          datosEntrevista.presion_diastolica == null ||
          Number(datosEntrevista.presion_diastolica) <= 0 ||
          isNaN(Number(datosEntrevista.presion_diastolica))
        )
          errores.presion_diastolica = "La presión diastólica debe ser un número positivo."
        if (
          datosEntrevista.hematocrito == null ||
          Number(datosEntrevista.hematocrito) <= 0 ||
          isNaN(Number(datosEntrevista.hematocrito))
        )
          errores.hematocrito = "El hematocrito debe ser un número positivo."
        break

      case 3:
        if (!datosEntrevista.respuestas || typeof datosEntrevista.respuestas !== "object") {
          errores.general = "Debe responder las preguntas de la entrevista."
        }

        PREGUNTAS_ENTREVISTA.forEach(
          ({ pregunta, tipo, adicional, adicional_especial, opciones, adicional_tiempo }) => {
            const respuesta = datosEntrevista.respuestas[pregunta]

            // Validar la respuesta principal (Sí/No o Voluntaria/Por reposición)
            if (tipo !== "vacunas" && !respuesta) {
              errores.respuestas[pregunta] = "Esta pregunta es obligatoria."
            }else {
              delete errores.respuestas[pregunta] // Limpiar error si ya hay respuesta
            }

            // Lógica de validación para preguntas tipo 'vacunas'
            if (tipo === "vacunas") {
              let algunaVacunaSi = false
              opciones?.forEach((vacuna) => {
                const respuestaVacunaKey = `${pregunta}_${vacuna.nombre}`
                const respuestaVacuna = datosEntrevista.respuestas?.[respuestaVacunaKey]
                const detalleVacunaKey = `${pregunta}_${vacuna.nombre}_detalle`
                const detalleVacuna = datosEntrevista.respuestas_adicionales?.[detalleVacunaKey]

                if (!respuestaVacuna) {
                  errores.respuestas[respuestaVacunaKey] = "Debe seleccionar una opción para esta vacuna."
                } else {
                  delete errores.respuestas[respuestaVacunaKey] // Limpiar error si ya hay respuesta
                  if (respuestaVacuna === "Sí") {
                    algunaVacunaSi = true
                    if (vacuna.adicional) {
                      if (!detalleVacuna || detalleVacuna.trim() === "") {
                        errores.respuestas[detalleVacunaKey] = "Debe especificar el detalle de la vacuna."
                      } else {
                        delete errores.respuestas[detalleVacunaKey] // Limpiar error si el detalle es válido
                      }
                    } else {
                      delete errores.respuestas[detalleVacunaKey] // No se requiere detalle, asegurar que no haya error
                    }
                  } else {
                    // respuestaVacuna === "No"
                    delete errores.respuestas[detalleVacunaKey] // Si es 'No', no se requiere detalle
                  }
                }
              })

              const tiempoVacunaKey = `${pregunta}_tiempo`
              const tiempoVacuna = datosEntrevista.respuestas_adicionales?.[tiempoVacunaKey]
              if (adicional_tiempo) {
                if (algunaVacunaSi) {
                  if (!tiempoVacuna || tiempoVacuna.trim() === "") {
                    errores.respuestas[tiempoVacunaKey] = "Debe especificar cuándo se puso la vacuna."
                  } else {
                    delete errores.respuestas[tiempoVacunaKey] // Limpiar error si el tiempo es válido
                  }
                } else {
                  delete errores.respuestas[tiempoVacunaKey] // Si ninguna vacuna es 'Sí', no se requiere tiempo
                }
              }
            } else if (adicional) {
              // Lógica para otros tipos de preguntas con 'adicional' (Sí/No o Bien/Mal)
              const adicionalDetailKey = pregunta + "_adicional"
              const adicionalDetail = datosEntrevista.respuestas_adicionales?.[pregunta]

              if ((tipo === "radio_simple" && respuesta === "Sí") || (tipo === "radio" && respuesta === "Mal")) {
                if (!adicionalDetail || adicionalDetail.trim() === "") {
                  errores.respuestas[adicionalDetailKey] = "Debe especificar un detalle adicional para esta respuesta."
                } else {
                  delete errores.respuestas[adicionalDetailKey] // Limpiar error si el detalle es válido
                }
              } else {
                delete errores.respuestas[adicionalDetailKey] // Si no es 'Sí'/'Mal', no se requiere detalle
              }
            }

            // Lógica de validación para la pregunta especial de malaria
            if (adicional_especial) {
              const malariaTreatmentKey = `${pregunta}_completó_tratamiento`
              const respuestaMalariaTratamiento = datosEntrevista.respuestas?.[malariaTreatmentKey]

              if (respuesta === "Sí") {
                // Solo se valida si la respuesta principal es 'Sí'
                if (!respuestaMalariaTratamiento) {
                  errores.respuestas[malariaTreatmentKey] = "Debe indicar si completó el tratamiento."
                } else {
                  delete errores.respuestas[malariaTreatmentKey] // Limpiar error si la respuesta es válida
                }
              } else {
                delete errores.respuestas[malariaTreatmentKey] // Si la respuesta principal no es 'Sí', no se requiere esta sub-pregunta
              }
            }
          },
        )
        break
      case 4:
        // Validaciones para el paso 4
        if (!datosEntrevista.consentimiento_informado) errores.general = "Debe aceptar el consentimiento informado."
        if (!datosEntrevista.nombre_entrevistador)
          errores.nombre_entrevistador = "El nombre del entrevistador es obligatorio."
        if (!datosEntrevista.firma_donador) errores.firma_donador = "La firma del donador es obligatoria."
        if (!datosEntrevista.firma_entrevistador)
          errores.firma_entrevistador = "La firma del entrevistador es obligatoria."
        if (!datosEntrevista.hora_inicio_flebotomia)
          errores.hora_inicio_flebotomia = "La hora de inicio de flebotomía es obligatoria."
        if (!datosEntrevista.hora_finalizacion_flebotomia)
          errores.hora_finalizacion_flebotomia = "La hora de finalización de flebotomía es obligatoria."
        if (!datosEntrevista.cantidad_sangre || Number(datosEntrevista.cantidad_sangre) <= 0)
          errores.cantidad_sangre = "La cantidad de sangre donada es obligatoria y debe ser un número positivo."
        // La validación de reacciones_adversas debe ser más específica, ya que es un booleano
        if (datosEntrevista.reacciones_adversas === null || datosEntrevista.reacciones_adversas === undefined) {
          errores.general = "Debe indicar si hubo reacciones adversas."
        }
        if (!datosEntrevista.nombre_flebotomista)
          errores.nombre_flebotomista = "El nombre del flebotomista es obligatorio."
        if (!datosEntrevista.firma_flebotomista)
          errores.firma_flebotomista = "La firma del flebotomista es obligatoria."
        break
    }
    setErrors(errores)
    return errores // Retornar los errores para que validarPaso los use inmediatamente
  }

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
    return edad
  }

 const validarPaso = (paso: number): boolean => {
  const errores = validarFormulario(paso)

  // Para paso 1 y 2: validamos errores directos (no en respuestas)
  if (paso === 1 || paso === 2) {
    const erroresDirectos = { ...errores }
    delete erroresDirectos.respuestas
    delete erroresDirectos.general

    const tieneErrores = Object.values(erroresDirectos).some((v) => v !== "")
    return !tieneErrores
  }

  // Para paso 3 y 4: validamos errores en respuestas y en general
  const erroresRespuestas = Object.values(errores.respuestas || {})
  const tieneErrores =
    errores.general !== "" || erroresRespuestas.some((v) => v !== "")

  return !tieneErrores
}

  const siguientePaso = () => {
    if (validarPaso(pasoActual)) setPasoActual((p) => Math.min(p + 1, 4))
    else showNotification("Por favor complete todos los campos requeridos", "error")
  }

  const pasoAnterior = () => setPasoActual((p) => Math.max(p - 1, 1))

  const guardarEntrevista = async () => {
    if (!validarPaso(4)) {
      showNotification("Complete todos los campos requeridos", "error")
      return
    }

    try {
      setGuardando(true)

      // Estructurar los datos para el envío
      const datosParaEnvio = {
        // Datos básicos
        fecha: datosEntrevista.fecha,
        lugar_colecta: datosEntrevista.lugar_colecta,
        numero_correlativo: datosEntrevista.numero_correlativo,
        orden_id: idOrden, // ID de la orden asociada

        // Datos personales
        cui: datosEntrevista.cui,
        pasaporte: datosEntrevista.pasaporte,
        primer_nombre: datosEntrevista.primer_nombre,
        segundo_nombre: datosEntrevista.segundo_nombre,
        primer_apellido: datosEntrevista.primer_apellido,
        segundo_apellido: datosEntrevista.segundo_apellido,
        sexo: datosEntrevista.sexo,
        grupo_etnico: datosEntrevista.grupo_etnico,
        edad: datosEntrevista.edad,
        fecha_nacimiento: datosEntrevista.fecha_nacimiento,
        lugar_nacimiento: datosEntrevista.lugar_nacimiento,
        nacionalidad: datosEntrevista.nacionalidad,
        ocupacion: datosEntrevista.ocupacion,
        comunidad_linguistica: datosEntrevista.comunidad_linguistica,
        estado_civil: datosEntrevista.estado_civil,

        // Contacto
        direccion_casa: datosEntrevista.direccion_casa,
        telefono_casa: datosEntrevista.telefono_casa,
        correo: datosEntrevista.correo,
        direccion_trabajo: datosEntrevista.direccion_trabajo,
        telefono_trabajo: datosEntrevista.telefono_trabajo,
        tipo_sangre: datosEntrevista.tipo_sangre,

        // Signos vitales
        peso: datosEntrevista.peso,
        pulso: datosEntrevista.pulso,
        temperatura: datosEntrevista.temperatura,
        hemoglobina: datosEntrevista.hemoglobina,
        presion_sistolica: datosEntrevista.presion_sistolica,
        presion_diastolica: datosEntrevista.presion_diastolica,
        hematocrito: datosEntrevista.hematocrito,

        // Respuestas de entrevista (preguntas 1-18)
        respuestas_entrevista: datosEntrevista.respuestas,
        respuestas_adicionales_entrevista: datosEntrevista.respuestas_adicionales,

        // Respuestas médicas adicionales (preguntas 19-30)
        respuestas_medicas_adicionales: datosEntrevista.respuestas_adicionales_medicas,

        // Respuestas exclusivas para mujeres
        respuestas_mujeres: datosEntrevista.sexo === "FEMENINO" ? datosEntrevista.respuestas_mujeres : null,

        // Consentimiento
        consentimiento_informado: datosEntrevista.consentimiento_informado,
        nombre_entrevistador: datosEntrevista.nombre_entrevistador,
        firma_donador: datosEntrevista.firma_donador,
        firma_entrevistador: datosEntrevista.firma_entrevistador,

        // Flebotomía
        hora_inicio_flebotomia: datosEntrevista.hora_inicio_flebotomia,
        hora_finalizacion_flebotomia: datosEntrevista.hora_finalizacion_flebotomia,
        cantidad_sangre: datosEntrevista.cantidad_sangre,
        reacciones_adversas: datosEntrevista.reacciones_adversas,
        observaciones_flebotomia: datosEntrevista.observaciones_flebotomia,
        nombre_flebotomista: datosEntrevista.nombre_flebotomista,
        firma_flebotomista: datosEntrevista.firma_flebotomista,

        // Metadatos
        fecha_creacion: new Date().toISOString(),
        estado: "completado",
      }

      console.log("Datos a enviar:", datosParaEnvio)

      // Enviar datos al API
      const response = await entrevistasAPI.crearEntrevista(datosParaEnvio)

      if (response.success) {
        showNotification("Entrevista guardada exitosamente", "success")
        // Limpiar formulario
        setDatosEntrevista({
          fecha: "",
          lugar_colecta: "",
          numero_correlativo: "",
          cui: "",
          pasaporte: "",
          primer_nombre: "",
          segundo_nombre: "",
          primer_apellido: "",
          segundo_apellido: "",
          sexo: "",
          grupo_etnico: "",
          edad: "",
          fecha_nacimiento: "",
          lugar_nacimiento: "",
          nacionalidad: "",
          ocupacion: "",
          comunidad_linguistica: "",
          estado_civil: "",
          direccion_casa: "",
          telefono_casa: "",
          correo: "",
          direccion_trabajo: "",
          telefono_trabajo: "",
          tipo_sangre: "",
          peso: "",
          pulso: "",
          temperatura: "",
          hemoglobina: "",
          presion_sistolica: "",
          presion_diastolica: "",
          hematocrito: "",
          respuestas: {},
          respuestas_adicionales: {},
          consentimiento_informado: false,
          nombre_entrevistador: "",
          respuestas_adicionales_medicas: {},
          respuestas_mujeres: {},
          consentimiento_texto: "",
          firma_donador: "",
          firma_entrevistador: "",
          hora_inicio_flebotomia: "",
          hora_finalizacion_flebotomia: "",
          cantidad_sangre: "",
          reacciones_adversas: false,
          observaciones_flebotomia: "",
          nombre_flebotomista: "",
          firma_flebotomista: "",
        })

        // Redirigir a la lista de entrevistas
        router.push("/banco_sangre/entrevistas")
      } else {
        throw new Error(response.message || "Error al guardar la entrevista")
      }
    } catch (error) {
      console.error("Error al guardar entrevista:", error)
      showNotification(error.message || "Error al guardar entrevista. Por favor intente nuevamente.", "error")
    } finally {
      setGuardando(false)
    }
  }

  const guardarBorrador = async () => {
    try {
      setGuardando(true)

      const borradorData = {
        ...datosEntrevista,
        estado: "borrador",
        fecha_actualizacion: new Date().toISOString(),
        paso_actual: pasoActual,
      }

      // Guardar en localStorage como respaldo
      localStorage.setItem(`borrador_entrevista_${datosEntrevista.cui || "temp"}`, JSON.stringify(borradorData))

      // Por ahora solo guardamos en localStorage, no enviamos al servidor
      // TODO: Implementar endpoint para guardar borradores cuando esté disponible
      // await entrevistasAPI.guardarBorrador(borradorData)

      showNotification("Borrador guardado exitosamente", "success")
    } catch (error) {
      console.error("Error al guardar borrador:", error)
      showNotification("Error al guardar borrador", "error")
    } finally {
      setGuardando(false)
    }
  }

  const cargarBorrador = () => {
    try {
      const cui = prompt("Ingrese el CUI para cargar el borrador:")
      if (!cui) return

      const borradorGuardado = localStorage.getItem(`borrador_entrevista_${cui}`)
      if (borradorGuardado) {
        const datos = JSON.parse(borradorGuardado)
        setDatosEntrevista(datos)
        setPasoActual(datos.paso_actual || 1)
        showNotification("Borrador cargado exitosamente", "success")
      } else {
        showNotification("No se encontró borrador para este CUI", "warning")
      }
    } catch (error) {
      console.error("Error al cargar borrador:", error)
      showNotification("Error al cargar borrador", "error")
    }
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Información Básica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm font-medium">Fecha *</Label>
                  <Input type="datetime-local" value={datosEntrevista.fecha} readOnly className="mt-1" />
                  {errors.fecha && <p className="text-xs text-red-500 mt-1">{errors.fecha}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Lugar Colecta *</Label>
                  <Input
                    value="BioAnalisis"
                    onChange={(e) => handleInputChange("lugar_colecta", e.target.value)}
                    readOnly
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">No. Correlativo *</Label>
                  <Input
                    value={datosEntrevista.numero_correlativo}
                    onChange={(e) => handleInputChange("numero_correlativo", e.target.value)}
                    className="mt-1"
                  />
                  {errors.numero_correlativo && (
                    <p className="text-xs text-red-500 mt-1">{errors.numero_correlativo}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Identificación */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Identificación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">DPI / CUI *</Label>
                  <Input
                    value={datosEntrevista.cui}
                    onChange={(e) => handleInputChange("cui", e.target.value)}
                    className={`mt-1 ${errors.cui ? "border-red-500" : ""}`}
                    placeholder="1234567890123"
                  />
                  {errors.cui && <p className="text-xs text-red-500 mt-1">{errors.cui}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Pasaporte</Label>
                  <Input
                    value={datosEntrevista.pasaporte}
                    onChange={(e) => handleInputChange("pasaporte", e.target.value)}
                    className="mt-1"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            {/* Datos Personales */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos Personales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Primer Nombre *</Label>
                  <Input
                    value={datosEntrevista.primer_nombre}
                    onChange={(e) => handleInputChange("primer_nombre", e.target.value)}
                    className={`mt-1 ${errors.primer_nombre ? "border-red-500" : ""}`}
                  />
                  {errors.primer_nombre && <p className="text-xs text-red-500 mt-1">{errors.primer_nombre}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Segundo Nombre</Label>
                  <Input
                    value={datosEntrevista.segundo_nombre}
                    onChange={(e) => handleInputChange("segundo_nombre", e.target.value)}
                    className="mt-1"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Primer Apellido *</Label>
                  <Input
                    value={datosEntrevista.primer_apellido}
                    onChange={(e) => handleInputChange("primer_apellido", e.target.value)}
                    className={`mt-1 ${errors.primer_apellido ? "border-red-500" : ""}`}
                  />
                  {errors.primer_apellido && <p className="text-xs text-red-500 mt-1">{errors.primer_apellido}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Segundo Apellido</Label>
                  <Input
                    value={datosEntrevista.segundo_apellido}
                    onChange={(e) => handleInputChange("segundo_apellido", e.target.value)}
                    className="mt-1"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label className="text-sm font-medium">Sexo *</Label>
                  <Combobox
                    items={SEXO}
                    value={datosEntrevista.sexo}
                    onChange={(val) => handleInputChange("sexo", val)}
                    className={`mt-1 ${errors.sexo ? "border-red-500" : ""}`}
                  />
                  {errors.sexo && <p className="text-xs text-red-500 mt-1">{errors.sexo}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Grupo Étnico *</Label>
                  <Combobox
                    items={GRUPOS_ETNICOS}
                    value={datosEntrevista.grupo_etnico}
                    onChange={(val) => handleInputChange("grupo_etnico", val)}
                    className={`mt-1 ${errors.grupo_etnico ? "border-red-500" : ""}`}
                  />
                  {errors.grupo_etnico && <p className="text-xs text-red-500 mt-1">{errors.grupo_etnico}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo de Sangre *</Label>
                  <Combobox
                    items={TIPOS_SANGRE}
                    value={datosEntrevista.tipo_sangre}
                    onChange={(val) => handleInputChange("tipo_sangre", val)}
                    className={`mt-1 ${errors.tipo_sangre ? "border-red-500" : ""}`}
                  />
                  {errors.tipo_sangre && <p className="text-xs text-red-500 mt-1">{errors.tipo_sangre}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label className="text-sm font-medium">Fecha Nacimiento *</Label>
                  <Input
                    type="date"
                    value={datosEntrevista.fecha_nacimiento}
                    onChange={(e) => {
                      handleInputChange("fecha_nacimiento", e.target.value)
                      handleInputChange("edad", calcularEdad(e.target.value))
                    }}
                    className={`mt-1 ${errors.fecha_nacimiento ? "border-red-500" : ""}`}
                  />
                  {errors.fecha_nacimiento && <p className="text-xs text-red-500 mt-1">{errors.fecha_nacimiento}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Edad *</Label>
                  <Input value={datosEntrevista.edad} disabled className="mt-1 bg-gray-100" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado Civil *</Label>
                  <Combobox
                    items={ESTADOS_CIVILES}
                    value={datosEntrevista.estado_civil}
                    onChange={(val) => handleInputChange("estado_civil", val)}
                    className={`mt-1 ${errors.estado_civil ? "border-red-500" : ""}`}
                  />
                  {errors.estado_civil && <p className="text-xs text-red-500 mt-1">{errors.estado_civil}</p>}
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Información Adicional</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Lugar de Nacimiento *</Label>
                  <Input
                    value={datosEntrevista.lugar_nacimiento}
                    onChange={(e) => handleInputChange("lugar_nacimiento", e.target.value)}
                    className={`mt-1 ${errors.lugar_nacimiento ? "border-red-500" : ""}`}
                  />
                  {errors.lugar_nacimiento && <p className="text-xs text-red-500 mt-1">{errors.lugar_nacimiento}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Nacionalidad *</Label>
                  <Combobox
                    items={NACIONALIDADES}
                    value={datosEntrevista.nacionalidad}
                    onChange={(val) => handleInputChange("nacionalidad", val)}
                    className={`mt-1 ${errors.nacionalidad ? "border-red-500" : ""}`}
                  />
                  {errors.nacionalidad && <p className="text-xs text-red-500 mt-1">{errors.nacionalidad}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Profesión u Oficio *</Label>
                  <Combobox
                    items={OCUPACIONES}
                    value={datosEntrevista.ocupacion}
                    onChange={(val) => handleInputChange("ocupacion", val)}
                    className={`mt-1 ${errors.ocupacion ? "border-red-500" : ""}`}
                  />
                  {errors.ocupacion && <p className="text-xs text-red-500 mt-1">{errors.ocupacion}</p>}
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm font-medium">Comunidad Lingüística</Label>
                  <Input
                    value={datosEntrevista.comunidad_linguistica}
                    onChange={(e) => handleInputChange("comunidad_linguistica", e.target.value)}
                    className="mt-1"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Información de Contacto</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Datos de Casa</h4>
                  <div>
                    <Label className="text-sm font-medium">Dirección de Casa *</Label>
                    <Input
                      value={datosEntrevista.direccion_casa}
                      onChange={(e) => handleInputChange("direccion_casa", e.target.value)}
                      className={`mt-1 ${errors.direccion_casa ? "border-red-500" : ""}`}
                    />
                    {errors.direccion_casa && <p className="text-xs text-red-500 mt-1">{errors.direccion_casa}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Teléfono *</Label>
                    <Input
                      value={datosEntrevista.telefono_casa}
                      onChange={(e) => handleInputChange("telefono_casa", e.target.value)}
                      className={`mt-1 ${errors.telefono_casa ? "border-red-500" : ""}`}
                      placeholder="12345678"
                    />
                    {errors.telefono_casa && <p className="text-xs text-red-500 mt-1">{errors.telefono_casa}</p>}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Correo Electrónico *</Label>
                    <Input
                      type="email"
                      value={datosEntrevista.correo}
                      onChange={(e) => handleInputChange("correo", e.target.value)}
                      className={`mt-1 ${errors.correo ? "border-red-500" : ""}`}
                      placeholder="ejemplo@correo.com"
                    />
                    {errors.correo && <p className="text-xs text-red-500 mt-1">{errors.correo}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Datos de Trabajo (Opcional)</h4>
                  <div>
                    <Label className="text-sm font-medium">Dirección de Trabajo</Label>
                    <Input
                      value={datosEntrevista.direccion_trabajo}
                      onChange={(e) => handleInputChange("direccion_trabajo", e.target.value)}
                      className="mt-1"
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Teléfono</Label>
                    <Input
                      value={datosEntrevista.telefono_trabajo}
                      onChange={(e) => handleInputChange("telefono_trabajo", e.target.value)}
                      className="mt-1"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Signos Vitales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Peso (lbs) *</Label>
                  <Input
                    type="number"
                    value={datosEntrevista.peso}
                    onChange={(e) => handleInputChange("peso", Number(e.target.value))}
                    className={`mt-1 ${errors.peso ? "border-red-500" : ""}`}
                    placeholder="150"
                  />
                  {errors.peso && <p className="text-xs text-red-500 mt-1">{errors.peso}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Pulso (bpm) *</Label>
                  <Input
                    type="number"
                    value={datosEntrevista.pulso}
                    onChange={(e) => handleInputChange("pulso", Number(e.target.value))}
                    className={`mt-1 ${errors.pulso ? "border-red-500" : ""}`}
                    placeholder="70"
                  />
                  {errors.pulso && <p className="text-xs text-red-500 mt-1">{errors.pulso}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Temperatura (°C) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={datosEntrevista.temperatura}
                    onChange={(e) => handleInputChange("temperatura", Number(e.target.value))}
                    className={`mt-1 ${errors.temperatura ? "border-red-500" : ""}`}
                    placeholder="36.5"
                  />
                  {errors.temperatura && <p className="text-xs text-red-500 mt-1">{errors.temperatura}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Hemoglobina (g/dL) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={datosEntrevista.hemoglobina}
                    onChange={(e) => handleInputChange("hemoglobina", Number(e.target.value))}
                    className={`mt-1 ${errors.hemoglobina ? "border-red-500" : ""}`}
                    placeholder="12.5"
                  />
                  {errors.hemoglobina && <p className="text-xs text-red-500 mt-1">{errors.hemoglobina}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Hematocrito (%) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={datosEntrevista.hematocrito}
                    onChange={(e) => handleInputChange("hematocrito", Number(e.target.value))}
                    className={`mt-1 ${errors.hematocrito ? "border-red-500" : ""}`}
                    placeholder="40"
                  />
                  {errors.hematocrito && <p className="text-xs text-red-500 mt-1">{errors.hematocrito}</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium">Presión Arterial (mmHg) *</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1">
                      <Input
                        placeholder="Sistólica"
                        type="number"
                        value={datosEntrevista.presion_sistolica}
                        onChange={(e) => handleInputChange("presion_sistolica", Number(e.target.value))}
                        className={errors.presion_sistolica ? "border-red-500" : ""}
                      />
                      {errors.presion_sistolica && (
                        <p className="text-xs text-red-500 mt-1">{errors.presion_sistolica}</p>
                      )}
                    </div>
                    <span className="self-center text-lg font-bold">/</span>
                    <div className="flex-1">
                      <Input
                        placeholder="Diastólica"
                        type="number"
                        value={datosEntrevista.presion_diastolica}
                        onChange={(e) => handleInputChange("presion_diastolica", Number(e.target.value))}
                        className={errors.presion_diastolica ? "border-red-500" : ""}
                      />
                      {errors.presion_diastolica && (
                        <p className="text-xs text-red-500 mt-1">{errors.presion_diastolica}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Cuestionario Médico (Preguntas 1-18)</h3>
              <p className="text-sm text-gray-600 mb-6">
                Por favor responda todas las preguntas con sinceridad. Esta información es confidencial y necesaria para
                su seguridad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {PREGUNTAS_ENTREVISTA.map((p, i) => (
                <div
                  key={i}
                  className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800 leading-relaxed">{p.pregunta}</span>
                    </div>

                    <div className="ml-9">
                      {/* Pregunta tipo radio con opciones específicas */}
                      {p.tipo === "radio" && p.opciones && (
                        <RadioGroup
                          value={datosEntrevista.respuestas?.[p.pregunta] || ""}
                          onValueChange={(val) => handleRespuestaChange(p.pregunta, val)}
                        >
                          <div className="flex gap-6">
                            {p.opciones.map((opcion, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <RadioGroupItem value={opcion} id={`p-${i}-${idx}`} />
                                <Label htmlFor={`p-${i}-${idx}`} className="text-sm">
                                  {opcion}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      )}

                      {/* Pregunta tipo radio simple (Sí/No) */}
                      {p.tipo === "radio_simple" && (
                        <RadioGroup
                          value={datosEntrevista.respuestas?.[p.pregunta] || ""}
                          onValueChange={(val) => handleRespuestaChange(p.pregunta, val)}
                        >
                          <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="Sí" id={`p-${i}-si`} />
                              <Label htmlFor={`p-${i}-si`} className="text-sm">
                                Sí
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="No" id={`p-${i}-no`} />
                              <Label htmlFor={`p-${i}-no`} className="text-sm">
                                No
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      )}

                      {/* Pregunta tipo vacunas */}
                      {p.tipo === "vacunas" && (
                        <div className="space-y-3">
                          {p.opciones?.map((vacuna, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium min-w-[80px]">{vacuna.nombre}</span>
                                <RadioGroup
                                  value={datosEntrevista.respuestas?.[`${p.pregunta}_${vacuna.nombre}`] || ""}
                                  onValueChange={(val) => handleRespuestaChange(`${p.pregunta}_${vacuna.nombre}`, val)}
                                >
                                  <div className="flex gap-4">
                                    <div className="flex items-center gap-1">
                                      <RadioGroupItem value="Sí" id={`vacuna-${i}-${idx}-si`} />
                                      <Label htmlFor={`vacuna-${i}-${idx}-si`} className="text-sm">
                                        Sí
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <RadioGroupItem value="No" id={`vacuna-${i}-${idx}-no`} />
                                      <Label htmlFor={`vacuna-${i}-${idx}-no`} className="text-sm">
                                        No
                                      </Label>
                                    </div>
                                  </div>
                                </RadioGroup>
                              </div>

                              {/* Campo adicional para "Otra" vacuna */}
                              {vacuna.adicional &&
                                datosEntrevista.respuestas?.[`${p.pregunta}_${vacuna.nombre}`] === "Sí" && (
                                  <Input
                                    placeholder={vacuna.placeholder}
                                    value={
                                      datosEntrevista.respuestas_adicionales?.[
                                        `${p.pregunta}_${vacuna.nombre}_detalle`
                                      ] || ""
                                    }
                                    onChange={(e) =>
                                      handleRespuestaAdicionalChange(
                                        `${p.pregunta}_${vacuna.nombre}_detalle`,
                                        e.target.value,
                                      )
                                    }
                                    className="text-sm ml-24"
                                  />
                                )}
                            </div>
                          ))}

                          {/* Campo de tiempo para vacunas */}
                          {p.adicional_tiempo && (
                            <div className="mt-3">
                              <Input
                                placeholder={p.placeholder_tiempo}
                                value={datosEntrevista.respuestas_adicionales?.[`${p.pregunta}_tiempo`] || ""}
                                onChange={(e) => handleRespuestaAdicionalChange(`${p.pregunta}_tiempo`, e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Campo adicional normal */}
                      {p.adicional &&
                        p.tipo !== "vacunas" &&
                        ((p.tipo === "radio_simple" && datosEntrevista.respuestas?.[p.pregunta] === "Sí") ||
                          (p.tipo === "radio" && p.opciones && datosEntrevista.respuestas?.[p.pregunta] === "Mal")) && (
                          <div className="mt-2">
                            <Input
                              placeholder={p.placeholder || "Especifique..."}
                              value={datosEntrevista.respuestas_adicionales?.[p.pregunta] || ""}
                              onChange={(e) => handleRespuestaAdicionalChange(p.pregunta, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        )}

                      {/* Pregunta adicional especial para malaria */}
                      {p.adicional_especial && datosEntrevista.respuestas?.[p.pregunta] === "Sí" && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                          <span className="text-sm font-medium text-gray-800 block mb-2">
                            {p.adicional_especial.pregunta}
                          </span>
                          <RadioGroup
                            value={datosEntrevista.respuestas?.[`${p.pregunta}_completó_tratamiento`] || ""}
                            onValueChange={(val) => handleRespuestaChange(`${p.pregunta}_completó_tratamiento`, val)}
                          >
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1">
                                <RadioGroupItem value="Sí" id={`adicional-${i}-si`} />
                                <Label htmlFor={`adicional-${i}-si`} className="text-sm">
                                  Sí
                                </Label>
                              </div>
                              <div className="flex items-center gap-1">
                                <RadioGroupItem value="No" id={`adicional-${i}-no`} />
                                <Label htmlFor={`adicional-${i}-no`} className="text-sm">
                                  No
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>

                    {/* Mostrar errores */}
                    {errors.respuestas?.[p.pregunta] && (
                      <p className="text-xs text-red-500 ml-9">{errors.respuestas[p.pregunta]}</p>
                    )}
                    {p.tipo === "vacunas" &&
                      p.opciones?.map(
                        (vacuna) =>
                          errors.respuestas?.[`${p.pregunta}_${vacuna.nombre}`] && (
                            <p key={`err-${p.pregunta}-${vacuna.nombre}`} className="text-xs text-red-500 ml-9">
                              {errors.respuestas[`${p.pregunta}_${vacuna.nombre}`]}
                            </p>
                          ),
                      )}
                    {p.tipo === "vacunas" && errors.respuestas?.[`${p.pregunta}_tiempo`] && (
                      <p className="text-xs text-red-500 ml-9">{errors.respuestas[`${p.pregunta}_tiempo`]}</p>
                    )}
                    {p.adicional && errors.respuestas?.[p.pregunta + "_adicional"] && (
                      <p className="text-xs text-red-500 ml-9">{errors.respuestas[p.pregunta + "_adicional"]}</p>
                    )}
                    {p.adicional_especial && errors.respuestas?.[`${p.pregunta}_completó_tratamiento`] && (
                      <p className="text-xs text-red-500 ml-9">
                        {errors.respuestas[`${p.pregunta}_completó_tratamiento`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {/* Preguntas Médicas Adicionales */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Preguntas Médicas Adicionales</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {PREGUNTAS_ADICIONALES.map((p, i) => (
                  <div key={i} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                    <div className="space-y-3">
                      <span className="text-sm font-medium text-gray-800">{p.pregunta}</span>

                      {p.opciones ? (
                        // Preguntas con múltiples opciones (checkboxes)
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                          {p.opciones.map((opcion, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Checkbox
                                checked={
                                  datosEntrevista.respuestas_adicionales_medicas?.[`${p.pregunta}_${opcion}`] || false
                                }
                                onCheckedChange={(checked) =>
                                  setDatosEntrevista((prev) => ({
                                    ...prev,
                                    respuestas_adicionales_medicas: {
                                      ...prev.respuestas_adicionales_medicas,
                                      [`${p.pregunta}_${opcion}`]: checked,
                                    },
                                  }))
                                }
                              />
                              <Label className="text-sm">{opcion}</Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Preguntas Sí/No normales
                        <RadioGroup
                          value={datosEntrevista.respuestas_adicionales_medicas?.[p.pregunta] || ""}
                          onValueChange={(val) =>
                            setDatosEntrevista((prev) => ({
                              ...prev,
                              respuestas_adicionales_medicas: {
                                ...prev.respuestas_adicionales_medicas,
                                [p.pregunta]: val,
                              },
                            }))
                          }
                        >
                          <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="Sí" id={`pa-${i}-si`} />
                              <Label htmlFor={`pa-${i}-si`} className="text-sm">
                                Sí
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="No" id={`pa-${i}-no`} />
                              <Label htmlFor={`pa-${i}-no`} className="text-sm">
                                No
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      )}

                      {/* Campo adicional si aplica */}
                      {p.adicional && datosEntrevista.respuestas_adicionales_medicas?.[p.pregunta] === "Sí" && (
                        <Input
                          placeholder={p.placeholder || "Especifique..."}
                          value={datosEntrevista.respuestas_adicionales_medicas?.[p.pregunta + "_detalle"] || ""}
                          onChange={(e) =>
                            setDatosEntrevista((prev) => ({
                              ...prev,
                              respuestas_adicionales_medicas: {
                                ...prev.respuestas_adicionales_medicas,
                                [p.pregunta + "_detalle"]: e.target.value,
                              },
                            }))
                          }
                          className="text-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preguntas Exclusivas para Mujeres */}
            {datosEntrevista.sexo === "FEMENINO" && (
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-pink-800">Exclusivo Donante Mujeres</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PREGUNTAS_MUJERES.map((p, i) => (
                    <div key={i} className="border border-pink-200 p-4 rounded-lg bg-white shadow-sm">
                      <div className="space-y-3">
                        <span className="text-sm font-medium text-gray-800">{p.pregunta}</span>
                        <RadioGroup
                          value={datosEntrevista.respuestas_mujeres?.[p.pregunta] || ""}
                          onValueChange={(val) =>
                            setDatosEntrevista((prev) => ({
                              ...prev,
                              respuestas_mujeres: {
                                ...prev.respuestas_mujeres,
                                [p.pregunta]: val,
                              },
                            }))
                          }
                        >
                          <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="Sí" id={`pm-${i}-si`} />
                              <Label htmlFor={`pm-${i}-si`} className="text-sm">
                                Sí
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="No" id={`pm-${i}-no`} />
                              <Label htmlFor={`pm-${i}-no`} className="text-sm">
                                No
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consentimiento Informado */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Consentimiento Informado</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border text-sm leading-relaxed">
                  <p className="mb-3">
                    Yo <strong>_________________________</strong>, declaro bajo juramento, que la información que he
                    dado es verdad y que dono en forma voluntaria y no remunerada para que sea usada según sea
                    necesario.
                  </p>
                  <p className="mb-3">
                    He sido informado de manera apropiada de que la sangre que done ayudará a una o más personas a
                    restablecer su salud y como parte de los procedimientos, posibles riesgos de la donación y que
                    previo a utilizar mi sangre le harán pruebas para determinar si mi sangre es compatible con la del
                    paciente (receptor), así como las pruebas para detectar infección por el virus de la Hepatitis B y
                    C, para virus de la inmunodeficiencia humana (VIH/Sida), sífilis, enfermedad de Chagas y otras que
                    sean necesarias.
                  </p>
                  <p>
                    En caso de que alguna de estas pruebas resulte positiva, seré referido donde puedan hacerme las
                    pruebas confirmatorias y/o buscar la ayuda médica que sea necesaria.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Firma del donador</Label>
                    <Input
                      value={datosEntrevista.firma_donador}
                      onChange={(e) => handleInputChange("firma_donador", e.target.value)}
                      className="mt-1"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nombre del entrevistador</Label>
                    <Input
                      value={datosEntrevista.nombre_entrevistador}
                      onChange={(e) => handleInputChange("nombre_entrevistador", e.target.value)}
                      className="mt-1"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Firma del entrevistador</Label>
                    <Input
                      value={datosEntrevista.firma_entrevistador}
                      onChange={(e) => handleInputChange("firma_entrevistador", e.target.value)}
                      className="mt-1"
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded border-l-4 border-blue-500">
                  <Checkbox
                    checked={datosEntrevista.consentimiento_informado}
                    onCheckedChange={(checked) => handleInputChange("consentimiento_informado", checked)}
                  />
                  <Label className="text-sm font-medium">
                    Acepto donar sangre voluntariamente y confirmo que he leído y entendido el consentimiento informado
                  </Label>
                </div>
              </div>
            </div>

            {/* Flebotomía */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-red-800">Flebotomía</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Hora de Inicio *</Label>
                    <Input
                      type="time"
                      value={datosEntrevista.hora_inicio_flebotomia}
                      onChange={(e) => handleInputChange("hora_inicio_flebotomia", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Hora de Finalización *</Label>
                    <Input
                      type="time"
                      value={datosEntrevista.hora_finalizacion_flebotomia}
                      onChange={(e) => handleInputChange("hora_finalizacion_flebotomia", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cantidad de sangre donada ml. *</Label>
                    <Input
                      type="number"
                      value={datosEntrevista.cantidad_sangre}
                      onChange={(e) => handleInputChange("cantidad_sangre", e.target.value)}
                      className="mt-1"
                      placeholder="450"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Reacciones adversas *</Label>
                    <div className="flex gap-4 mt-2">
                      <RadioGroup
                        value={datosEntrevista.reacciones_adversas ? "Sí" : "No"}
                        onValueChange={(val) => handleInputChange("reacciones_adversas", val === "Sí")}
                      >
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <RadioGroupItem value="Sí" id="reacciones-si" />
                            <Label htmlFor="reacciones-si" className="text-sm">
                              Sí
                            </Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <RadioGroupItem value="No" id="reacciones-no" />
                            <Label htmlFor="reacciones-no" className="text-sm">
                              No
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Observaciones</Label>
                  <Input
                    value={datosEntrevista.observaciones_flebotomia}
                    onChange={(e) => handleInputChange("observaciones_flebotomia", e.target.value)}
                    className="mt-1"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nombre del flebotomista</Label>
                    <Input
                      value={datosEntrevista.nombre_flebotomista}
                      onChange={(e) => handleInputChange("nombre_flebotomista", e.target.value)}
                      className="mt-1"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Firma del flebotomista</Label>
                    <Input
                      value={datosEntrevista.firma_flebotomista}
                      onChange={(e) => handleInputChange("firma_flebotomista", e.target.value)}
                      className="mt-1"
                      placeholder="Nombre completo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const IconComponent = PASOS[pasoActual - 1].icono

  return (
    <div className="min-h-screen bg-gray-50">
      <PageLayout
        title="Nueva Entrevista de Donante"
        description="Complete todos los pasos para registrar la entrevista"
        icon={<IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />}
      >
        <div className="flex justify-end gap-2 mb-4">
          {orden && (
            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
            >
              Ver Orden
            </Button>
          )}
          {orden && orden.detalles && orden.detalles.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setResultadosModalOpen(true)}
            >
              Ver Resultados
            </Button>
          )}
        </div>
        <div className="space-y-6 sm:space-y-8">
          {/* Stepper - Responsive */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <Stepper pasos={PASOS} pasoActual={pasoActual} />
          </div>

          {/* Contenido del paso */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">{renderPaso()}</div>

          {/* Navegación - Responsive */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                onClick={pasoAnterior}
                disabled={pasoActual === 1}
                className="w-full sm:w-auto order-2 sm:order-1 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
              </Button>

              {pasoActual < 4 ? (
                <Button onClick={siguientePaso} className="w-full sm:w-auto order-1 sm:order-2">
                  Siguiente <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={guardarEntrevista}
                  disabled={guardando}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {guardando ? "Guardando..." : "Guardar Entrevista"}
                </Button>
              )}
            </div>
          </div>
          <Button
            onClick={guardarBorrador}
            disabled={guardando}
            className="w-full sm:w-auto order-3 bg-yellow-600 hover:bg-yellow-700"
          >
            Guardar Borrador
          </Button>
          <Button onClick={cargarBorrador} className="w-full sm:w-auto order-4 bg-blue-600 hover:bg-blue-700">
            Cargar Borrador
          </Button>
        </div>
      </PageLayout>
      {/* Modal de datos de la orden */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Datos de la Orden</DialogTitle>
          </DialogHeader>
          {loadingOrden && <p>Cargando datos de la orden...</p>}
          {!loadingOrden && orden && (
            <div>
              <p><strong>Código:</strong> {orden.codigo}</p>
              <p><strong>Donante:</strong> {orden.donante_nombre}</p>
              <p><strong>Médico:</strong> {orden.medico_nombre}</p>
              <p><strong>Fecha:</strong> {orden.fecha}</p>
              <p><strong>Hora:</strong> {orden.hora}</p>
              {/* Puedes mostrar más datos si lo deseas */}
            </div>
          )}
          {!loadingOrden && !orden && <p>No se encontró la orden.</p>}
        </DialogContent>
      </Dialog>
      {/* Modal de Resultados con tabla */}
      <Dialog open={resultadosModalOpen} onOpenChange={setResultadosModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultados de la Orden</DialogTitle>
          </DialogHeader>
          {orden && orden.detalles && orden.detalles.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Código</th>
                  <th className="text-left px-2 py-1">Examen</th>
                  <th className="text-left px-2 py-1">Acción</th>
                </tr>
              </thead>
              <tbody>
                {orden.detalles.map((detalle, idx) => (
                  <tr key={detalle.id}>
                    <td className="px-2 py-1">{detalle.examen.codigo}</td>
                    <td className="px-2 py-1">{detalle.examen.nombre}</td>
                    <td className="px-2 py-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDetalleSeleccionado(detalle)
                          setDetalleModalOpen(true)
                        }}
                      >
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay resultados disponibles.</p>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal de detalle de resultado */}
      <Dialog open={detalleModalOpen} onOpenChange={setDetalleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del Examen</DialogTitle>
          </DialogHeader>
          {detalleSeleccionado ? (
            <div>
              <p><strong>Examen:</strong> {detalleSeleccionado.examen.nombre}</p>
              <p><strong>Código:</strong> {detalleSeleccionado.examen.codigo}</p>
              <p><strong>Categoría:</strong> {detalleSeleccionado.examen.categoria}</p>
              <p><strong>Estado:</strong> {detalleSeleccionado.estado}</p>
              {detalleSeleccionado.resultado && (
                <p><strong>Resultado:</strong> {detalleSeleccionado.resultado}</p>
              )}
              {detalleSeleccionado.observaciones && (
                <p><strong>Observaciones:</strong> {detalleSeleccionado.observaciones}</p>
              )}
            </div>
          ) : (
            <p>No hay detalle para mostrar.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
