"use client"
import { Badge } from "@/components/ui/badge"
import {
  CardContent,
  CardTitle,
  CardHeader,
  Card,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable, StatusBadge, DateCell } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { ExamenSelector } from "@/components/ordenes/ExamenSelector"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Trash2, Clock, CheckCircle, Send, Printer, Eye, Filter } from "lucide-react"
import { ordenesAPI } from "@/api/ordenesAPI"
import { donantesAPI } from "@/api/bancoSangreAPI"
import { medicosAPI } from "@/api/medicosAPI"
import { examenesAPI } from "@/api/examenesAPI"
import { Combobox } from "@/components/ui/combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterDropdown, FilterOption } from "@/components/ui/FilterDropdown"
import { EditDocument } from "@mui/icons-material"
import Link from "next/link"

// Interfaces para tipado
interface Orden {
  id: string
  codigo: string
  donante_nombre: string
  medico_nombre: string
  fecha: string
  hora: string
  estado: string
  prioridad: string
  total_examenes: number
  detalles?: DetalleOrden[]
}

interface DetalleOrden {
  id: string
  examen: {
    nombre: string
    codigo: string
    categoria: string
  }
  estado: string
  resultado?: string
  observaciones?: string
}

interface Donante {
  id: number
  primer_nombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
}

interface Medico {
  id: number
  nombres: string
  apellidos: string
}

interface Examen {
  id: number
  nombre: string
  codigo: string
  categoria: string
}

export default function OrdenesPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, next: null, previous: null, total: 0 })
  const [limit, setLimit] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)

  // Estados para filtros avanzados
  const [filters, setFilters] = useState({
    estado: "__ALL__",
    donante: "__ALL__",
    medico: "__ALL__",
    fechaDesde: "",
    fechaHasta: "",
    codigo: "",
  })

  const [activeFilters, setActiveFilters] = useState(0)

  const [pacientes, setPacientes] = useState<Donante[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [examenes, setExamenes] = useState<Examen[]>([])
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedExamenes, setSelectedExamenes] = useState<Examen[]>([])
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null)

  const [formData, setFormData] = useState({
    id_ingreso: "",
    id_donante: "",
    id_medico: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    hora_ingreso: new Date().toTimeString().split(" ")[0].substring(0, 5),
    hora_entrega: "",
    horas_ayuno: "",
    prioridad: "NORMAL",
  })

  const [errors, setErrors] = useState({
    id_donante: "",
    id_medico: "",
    hora_entrega: "",
    horas_ayuno: "",
    examenes: "",
    prioridad: "",
  })

  const steps = [
    { title: "Información General", description: "Datos del donante y médico" },
    { title: "Selección de Exámenes", description: "Exámenes a realizar" },
    { title: "Confirmación", description: "Revisar y confirmar" },
  ]

  useEffect(() => {
    fetchOrdenes()
    fetchPacientes()
    fetchMedicos()
    fetchExamenes()
  }, [currentPage, limit])

  // Contar filtros activos
  useEffect(() => {
    const activeCount = Object.values(filters).filter(value => value !== "" && value !== "__ALL__").length
    setActiveFilters(activeCount)
  }, [filters])

  // Función para construir los parámetros de filtro para el backend
  const buildFilterParams = () => {
    const params: any = {
      page: currentPage,
      limit: limit
    }

    // Agregar filtros activos
    if (filters.estado && filters.estado !== "__ALL__") {
      params.estado = filters.estado
    }
    if (filters.donante && filters.donante !== "__ALL__") {
      params.donante = filters.donante
    }
    if (filters.medico && filters.medico !== "__ALL__") {
      params.medico = filters.medico
    }
    if (filters.fechaDesde) {
      params.fecha_desde = filters.fechaDesde
    }
    if (filters.fechaHasta) {
      params.fecha_hasta = filters.fechaHasta
    }
    if (filters.codigo) {
      params.codigo = filters.codigo
    }

    return params
  }
  
  const fetchOrdenes = async (showLoading = true, filterParams?: any) => {
    if (showLoading) showLoader()
    else setIsRefreshing(true)

    try {
      // Usar parámetros de filtro si se proporcionan, sino usar los actuales
      const params = filterParams || buildFilterParams()
      const data = await ordenesAPI.getOrdenes(params.page, params.limit, params)
      const lista = Array.isArray(data?.results) ? data.results : []
      setOrdenes(lista)
      setPagination({
        page: currentPage,
        next: data.next,
        previous: data.previous,
        total: data.count,
      })
      if (!showLoading) showNotification("Datos actualizados correctamente", "success")
    } catch {
      showNotification("Error al cargar órdenes", "error")
    } finally {
      showLoading ? hideLoader() : setIsRefreshing(false)
    }
  }

  const fetchPacientes = async () => {
    const data  = await donantesAPI.geDonantes()
    const lista = Array.isArray(data?.results) ? data.results : data
    console.log("carga de donantes: "+ JSON.stringify(data,null,2));
    setPacientes( lista.length > 0 ? lista : [] )
  }

  const fetchMedicos = async () => {
    const { results } = await medicosAPI.getMedicos()
    console.log("carga de medicos: "+ JSON.stringify(results,null,2));
    setMedicos(Array.isArray(results) ? results : [])
  }

  const fetchExamenes = async () => {
    const { results } = await examenesAPI.getExamenes()
    console.log("carga de examenes: "+ JSON.stringify(results,null,2));
    setExamenes(Array.isArray(results) ? results : [])
  }

  const handleRefresh = () => {
    fetchOrdenes(false)
  }

  const handleFilterChange = (newFilters: any) => {
    // Resetear a la primera página cuando cambian los filtros
    setCurrentPage(1)
    
    // Construir parámetros con los nuevos filtros inmediatamente
    const params: any = {
      page: 1,
      limit: limit
    }

    // Agregar filtros activos usando los nuevos valores
    if (newFilters.estado && newFilters.estado !== "__ALL__") {
      params.estado = newFilters.estado
    }
    if (newFilters.donante && newFilters.donante !== "__ALL__") {
      params.donante = newFilters.donante
    }
    if (newFilters.medico && newFilters.medico !== "__ALL__") {
      params.medico = newFilters.medico
    }
    if (newFilters.fechaDesde) {
      params.fecha_desde = newFilters.fechaDesde
    }
    if (newFilters.fechaHasta) {
      params.fecha_hasta = newFilters.fechaHasta
    }
    if (newFilters.codigo) {
      params.codigo = newFilters.codigo
    }

    // Actualizar el estado y hacer fetch con los nuevos parámetros
    setFilters(newFilters)
    fetchOrdenes(true, params)
  }

  const clearFilters = () => {
    const resetFilters = {
      estado: "__ALL__",
      donante: "__ALL__",
      medico: "__ALL__",
      fechaDesde: "",
      fechaHasta: "",
      codigo: "",
    }
    
    setFilters(resetFilters)
    // Resetear y hacer fetch sin filtros
    setCurrentPage(1)
    fetchOrdenes(true, { page: 1, limit })
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...filters, [key]: key === "estado" || key === "donante" || key === "medico" ? "__ALL__" : "" }
    
    // Construir parámetros con el filtro removido
    const params: any = {
      page: 1,
      limit: limit
    }

    // Agregar filtros activos usando los nuevos valores
    if (newFilters.estado && newFilters.estado !== "__ALL__") {
      params.estado = newFilters.estado
    }
    if (newFilters.donante && newFilters.donante !== "__ALL__") {
      params.donante = newFilters.donante
    }
    if (newFilters.medico && newFilters.medico !== "__ALL__") {
      params.medico = newFilters.medico
    }
    if (newFilters.fechaDesde) {
      params.fecha_desde = newFilters.fechaDesde
    }
    if (newFilters.fechaHasta) {
      params.fecha_hasta = newFilters.fechaHasta
    }
    if (newFilters.codigo) {
      params.codigo = newFilters.codigo
    }

    setFilters(newFilters)
    setCurrentPage(1)
    fetchOrdenes(true, params)
  }

   const handleOpenViewDialog = (orden: Orden) => {
    setSelectedOrden(orden)
    setOpenViewDialog(true)
  }

   const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setSelectedOrden(null)
  }

  const handleOpenDialog = async () => {
    // Limpiar completamente el formulario
    setFormData({
      id_ingreso: "",
      id_donante: "",
      id_medico: "",
      fecha_ingreso: new Date().toISOString().split("T")[0],
      hora_ingreso: new Date().toTimeString().split(" ")[0].substring(0, 5),
      hora_entrega: "",
      horas_ayuno: "",
      prioridad: "NORMAL",
    })
    
    // Limpiar errores
    setErrors({
      id_donante: "",
      id_medico: "",
      hora_entrega: "",
      horas_ayuno: "",
      examenes: "",
      prioridad: "",
    })
    
    // Limpiar exámenes seleccionados y resetear paso
    setSelectedExamenes([])
    setCurrentStep(0)
    
    // Cargar datos frescos
    await Promise.all([fetchPacientes(), fetchMedicos(), fetchExamenes()])
    
    // Abrir el diálogo
    setOpenDialog(true)
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "VALIDADO":
        return { bg: "#dcfce7", text: "#166534" }
      case "PENDIENTE":
        return { bg: "#fef3c7", text: "#92400e" }
      case "EN PROCESO":
        return { bg: "#dbeafe", text: "#1e40af" }
      case "CANCELADO":
        return { bg: "#f3f4f6", text: "#374151" }      
      default:
        return { bg: "#f3f4f6", text: "#374151" }
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "ALTA":
        return { bg: "#fef2f2", text: "#dc2626" }
      case "MEDIA":
        return { bg: "#fffbeb", text: "#d97706" }
      case "NORMAL":
        return { bg: "#f0f9ff", text: "#0369a1" }
      default:
        return { bg: "#f3f4f6", text: "#374151" }
    }
  }

  // Configuración de filtros para el componente FilterDropdown
  const filterOptions: FilterOption[] = [
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "PENDIENTE", label: "Pendiente" },
        { value: "EN PROCESO", label: "En Proceso" },
        { value: "VALIDADO", label: "Validado" },
        { value: "CANCELADO", label: "Cancelado" },
      ],
    },
    {
      key: "prioridad",
      label: "Prioridad",
      type: "select",
      options: [
        { value: "NORMAL", label: "Normal" },
        { value: "MEDIA", label: "Media" },
        { value: "ALTA", label: "Alta" },
      ],
    },
    {
      key: "donante",
      label: "Donante",
      type: "combobox",
      options: pacientes.map(p => ({
        value: p.id.toString(),
        label: `${p.primer_nombre} ${p.segundo_nombre} ${p.primer_apellido} ${p.segundo_apellido}`.toUpperCase(),
      })),
    },
    {
      key: "medico",
      label: "Médico",
      type: "combobox",
      options: medicos.map(m => ({
        value: m.id.toString(),
        label: `${m.nombres} ${m.apellidos}`.toUpperCase(),
      })),
    },
    {
      key: "fechaDesde",
      label: "Fecha Desde",
      type: "date",
    },
    {
      key: "fechaHasta",
      label: "Fecha Hasta",
      type: "date",
    },
    {
      key: "codigo",
      label: "Código",
      type: "input",
      placeholder: "Buscar por código",
    },
  ]

  const handleCloseDialog = () => {
    setOpenDialog(false)
    
    // Limpiar formulario al cerrar
    setFormData({
      id_ingreso: "",
      id_donante: "",
      id_medico: "",
      fecha_ingreso: new Date().toISOString().split("T")[0],
      hora_ingreso: new Date().toTimeString().split(" ")[0].substring(0, 5),
      hora_entrega: "",
      horas_ayuno: "",
      prioridad: "NORMAL",
    })
    
    // Limpiar errores
    setErrors({
      id_donante: "",
      id_medico: "",
      hora_entrega: "",
      horas_ayuno: "",
      examenes: "",
      prioridad: "",
    })
    
    // Limpiar exámenes y resetear paso
    setSelectedExamenes([])
    setCurrentStep(0)
  }

  const handleChange = (name: string, value: string) => {
    console.log("Data en HandleChange: "+name +" value: "+ value)
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const validateStep = () => {
    const newErrors = { id_donante: "", id_medico: "", hora_entrega: "", horas_ayuno: "", examenes: "", prioridad: "" }
    let isValid = true

    if (currentStep === 0) {
      if (!formData.id_donante) { newErrors.id_donante = "Seleccione un donante"; isValid = false }
      if (!formData.id_medico) { newErrors.id_medico = "Seleccione un médico"; isValid = false }
      if (!formData.hora_entrega) { newErrors.hora_entrega = "Ingrese la hora de entrega"; isValid = false }
      if (!formData.horas_ayuno) { newErrors.horas_ayuno = "Ingrese las horas de ayuno"; isValid = false }
      if (!formData.prioridad) { newErrors.prioridad = "Seleccione una prioridad"; isValid = false }
    }
    if (currentStep === 1) {
      if (selectedExamenes.length === 0) { newErrors.examenes = "Seleccione al menos un examen"; isValid = false }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => validateStep() && setCurrentStep(prev => prev + 1)
  const handleBack = () => setCurrentStep(prev => prev - 1)

  const handleSubmit = async () => {
    if (!validateStep()) return
    showLoader()
    try {
        const payload = {
          donante: parseInt(formData.id_donante),
          medico: parseInt(formData.id_medico),
          fecha: formData.fecha_ingreso,
          hora: formData.hora_ingreso,
          prioridad: formData.prioridad,
          examenes: selectedExamenes.map(e => (e.id))
        }
       console.log("Enviando payload:", payload)          
        await ordenesAPI.createOrden(payload)
        showNotification("Orden registrada correctamente", "success")
        fetchOrdenes()
        handleCloseDialog()
    } catch {
      showNotification("Error al guardar orden", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta orden?")) {
      showLoader()
      try {
        await ordenesAPI.deleteOrden(id)
        showNotification("Orden eliminada correctamente", "success")
        fetchOrdenes()
      } catch {
        showNotification("Error al eliminar orden", "error")
      } finally {
        hideLoader()
      }
    }
  }

  const paginatedOrdenes = ordenes.map((o: Orden) => {
    return {
      id: o.id,
      codigo: o.codigo,
      donante_nombre: o.donante_nombre,
      medico_nombre: o.medico_nombre,
      fecha: o.fecha,
      hora: o.hora,
      estado: o.estado,
      prioridad: o.prioridad || "NORMAL",
      total_examenes: o.total_examenes,
      original: o,
    }
  }).filter((o: any) =>
    o.donante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.medico_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.codigo.includes(searchTerm)
  )

  const columns = [
    { key: "codigo", label: "Código", className: "font-medium" },
    { key: "donante_nombre", label: "Donante", className: "font-medium text-gray-900" },
    { key: "medico_nombre", label: "Médico" },
    { key: "fecha", label: "Fecha", render: (v: string) => <DateCell value={v} /> },
    { key: "hora", label: "Hora" },
    { key: "estado", label: "Estado", render: (v: string) => 
      {
        const color = getStatusColor(v)              
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: color.bg, color: color.text }}
        >   
        {v}
        </span>
      )
     }
    },
    { key: "prioridad", label: "Prioridad", render: (v: string) => 
      {
        const color = getPriorityColor(v)              
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: color.bg, color: color.text }}
        >   
        {v}
        </span>
      )
     }
    }
  ]

  const stats = [
    { title: "Total Órdenes", 
      value: ordenes.length, icon: <FileText className="h-8 w-8 text-white" />, 
      color: "primary", trend: "Todas las órdenes" },
    { title: "Pendientes", value: ordenes.filter(o => o.estado.toUpperCase() === "PENDIENTE").length, 
      icon: <Clock className="h-8 w-8 text-white" />, color: "secondary", trend: "Requieren atención" },
    { title: "Filtrados", value: paginatedOrdenes.length, 
      icon: <Filter className="h-8 w-8 text-white" />, color: "info", trend: `${activeFilters} filtros activos` },
    { title: "Validadas", value: ordenes.filter(o => o.estado.toUpperCase() === "VALIDADO").length, 
      icon: <CheckCircle className="h-8 w-8 text-white" />, color: "warning", trend: "Completadas" },
  ]

  const actions = (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white text-green-600 hover:bg-green-50">
          <Plus className="h-4 w-4" />
          Nueva Orden
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Orden</DialogTitle>
        </DialogHeader>

        {/* Paso actual */}
        <div className="space-y-6">
          <h4 className="font-semibold">{steps[currentStep].title}</h4>
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Donante *</Label>
                <Combobox
                    items={pacientes.map(p => ({
                      value: String(p.id),
                      label: (`${p.primer_nombre} ${p.segundo_nombre} ${p.primer_apellido} ${p.segundo_apellido}`).toUpperCase(),
                    }))}
                    value={formData.id_donante}
                    onChange={(val) =>{
                        console.log("Donante seleccionado:", val) // ✅ Debe imprimirse
                        handleChange("id_donante", val)
                      }}
                    placeholder="Seleccionar donante"
                    error={errors.id_donante}
                  />
              </div>
              <div>
                <Label>Médico *</Label>
                <Combobox
                    items={medicos.map(m => ({
                      value: String(m.id),
                      label: (`${m.nombres} ${m.apellidos}`).toUpperCase(),
                    }))}
                    value={formData.id_medico}
                    onChange={(val) => {
                       console.log("Meidco seleccionado:", val) // ✅ Debe imprimirse                        
                      handleChange("id_medico", val)}}
                    placeholder="Seleccionar médico"
                    error={errors.id_medico}
                  />
              </div>
              <div>
                <Label>Hora de Entrega *</Label>
                <Input
                  type="time"
                  value={formData.hora_entrega}
                  onChange={e => handleChange("hora_entrega", e.target.value)}
                  className={errors.hora_entrega ? "border-red-500" : ""}
                />
                {errors.hora_entrega && <p className="text-sm text-red-500">{errors.hora_entrega}</p>}
              </div>
              <div>
                <Label>Horas de Ayuno *</Label>
                <Input
                  type="number"
                  value={formData.horas_ayuno}
                  onChange={e => handleChange("horas_ayuno", e.target.value)}
                  className={errors.horas_ayuno ? "border-red-500" : ""}
                />
                {errors.horas_ayuno && <p className="text-sm text-red-500">{errors.horas_ayuno}</p>}
              </div>
              <div>
                <Label>Prioridad *</Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => handleChange("prioridad", value)}
                >
                  <SelectTrigger className={`w-[180px] ${errors.prioridad ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                  </SelectContent>
                </Select>
                {errors.prioridad && <p className="text-sm text-red-500">{errors.prioridad}</p>}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <ExamenSelector
              examenes={examenes}
              selected={selectedExamenes}
              onChange={setSelectedExamenes}
              error={errors.examenes}
            />
          )}          
          {        
          
          currentStep === 2 && (            
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
                <CardContent>
                                <p>
                      <strong>Donante:</strong>{" "}
                      {(() => {
                        const p = pacientes.find(p => String(p.id) === formData.id_donante)
                        return p ? (`${p.primer_nombre} ${p.segundo_nombre} ${p.primer_apellido} ${p.segundo_apellido}`).toUpperCase() : "No seleccionado"
                      })()}
                    </p>
                    <p>
                      <strong>Médico:</strong>{" "}
                      {(() => {
                        const m = medicos.find(m => String(m.id) === formData.id_medico)
                        return m ? `${m.nombres} ${m.apellidos}` : "No seleccionado"
                      })()}
                    </p>
                    <p><strong>Hora Entrega:</strong> {formData.hora_entrega || "No ingresada"}</p>
                    <p><strong>Horas Ayuno:</strong> {formData.horas_ayuno || "No ingresadas"}</p>
                    <p><strong>Prioridad:</strong> {formData.prioridad}</p>
                    <p>
                      <strong>Exámenes:</strong>{" "}
                      {selectedExamenes.length > 0
                        ? selectedExamenes.map(e => e.nombre).join(", ")
                        : "Ninguno seleccionado"}
                    </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-4">
          {currentStep > 0 && (
            <Button variant="secondary" onClick={handleBack}>
              Atrás
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
              Guardar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  const tableActions = (row: any) => (
    <>
     {(
    <>
     <Button
        variant="ghost"
        size="sm"
        onClick={() => handleOpenViewDialog(row.original)}
        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
      ><Eye className="h-4 w-4" />
      </Button>
      </>
      )}
    {row.original.donante && !Boolean(row.original.genero_entrevista) && Boolean(row.original.continuar_entrevista) && row.original.estado === "VALIDADO" && (
  <Link
    href={`/banco_sangre/entrevistas/nueva?id_orden=${row.original.id}`}
    passHref
  >
        <Button
          as="a"
          variant="ghost"
          size="sm"
          className="hover:text-blue-800 hover:bg-blue-100"
        >
          <EditDocument className="h-4 w-4" />
        </Button>
      </Link>
    )}
      {hasPermission("eliminar_orden") && (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  )

  return (
    <>
    <PageLayout
      title="Gestión de Órdenes"
      description="Administra las órdenes de laboratorio"
      icon={<FileText className="h-8 w-8 text-green-600" />}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      actions={
        <div className="flex gap-2">
          <FilterDropdown
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={clearFilters}
            onClearFilter={clearFilter}
            activeFilters={activeFilters}
            totalItems={ordenes.length}
            filteredItems={paginatedOrdenes.length}
          />
          {actions}
        </div>
      }
      stats={stats}
    >
      <DataTable
        data={paginatedOrdenes}
        columns={columns}
        actions={tableActions}
        emptyMessage="No se encontraron órdenes que coincidan con tu búsqueda"
        emptyIcon={<FileText className="h-12 w-12 text-gray-400" />}
      />
      
      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1 || !pagination.previous}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Anterior
        </Button>
        <span>Página {currentPage}</span>
        <div className="flex items-center gap-2 mb-4">
            <Label className="text-sm font-medium text-gray-700">Registros por página:</Label>
            <Select value={limit.toString()} onValueChange={(value) => {
              const newLimit = value === "all" ? 1000 : parseInt(value)
              setLimit(newLimit)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Cantidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        <Button
          variant="outline"
          disabled={!pagination.next}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Siguiente
        </Button>
      </div>
    </PageLayout>


    {/* Modal de Detalles */}
    <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Orden</DialogTitle>
        </DialogHeader>
        {selectedOrden && (
          <div className="space-y-4">
            <p><strong>Código:</strong> {selectedOrden.codigo}</p>
            <p><strong>Donante:</strong> {selectedOrden.donante_nombre}</p>
            <p><strong>Médico:</strong> {selectedOrden.medico_nombre}</p>
            <p><strong>Fecha:</strong> {selectedOrden.fecha}</p>
            <p><strong>Hora:</strong> {selectedOrden.hora}</p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className="inline-block align-middle">
                <StatusBadge status={selectedOrden.estado} />
              </span>
            </p>
            <p><strong>Total de Exámenes:</strong> {selectedOrden.total_examenes}</p>

            <div className="mt-4">
              <h4 className="font-semibold text-lg">Exámenes</h4>
              {selectedOrden.detalles && selectedOrden.detalles.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {selectedOrden.detalles.map((detalle: DetalleOrden) => (
                    <li key={detalle.id}>
                      <div className="font-semibold">{detalle.examen.nombre}</div>
                      <div className="text-sm text-gray-600">
                        Código: {detalle.examen.codigo} – Categoría: {detalle.examen.categoria}
                      </div>
                      <div className="text-sm">
                        Estado: <Badge>{detalle.estado}</Badge>
                      </div>
                      {detalle.resultado && (
                        <div className="text-sm text-gray-500">Resultado: {detalle.resultado}</div>
                      )}
                      {detalle.observaciones && (
                        <div className="text-sm text-gray-500">Observaciones: {detalle.observaciones}</div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Sin exámenes registrados en esta orden.</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
  

  
}
