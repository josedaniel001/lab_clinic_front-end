"use client"

import { Badge } from "@/components/ui/badge"

import { CardContent } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable, StatusBadge, DateCell } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Send, Printer, Trash2, Clock, CheckCircle } from "lucide-react"
import { ordenesAPI } from "@/api/ordenesAPI"
import { pacientesAPI } from "@/api/pacientesAPI"
import { medicosAPI } from "@/api/medicosAPI"
import { examenesAPI } from "@/api/examenesAPI"

export default function OrdenesPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [ordenes, setOrdenes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [examenes, setExamenes] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedExamenes, setSelectedExamenes] = useState([])
  const [formData, setFormData] = useState({
    id_ingreso: "",
    id_paciente: "",
    id_medico: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    hora_ingreso: new Date().toTimeString().split(" ")[0].substring(0, 5),
    hora_entrega: "",
    horas_ayuno: "",
  })
  const [errors, setErrors] = useState({
    id_paciente: "",
    id_medico: "",
    hora_entrega: "",
    horas_ayuno: "",
    examenes: "",
  })

  const steps = [
    { title: "Información General", description: "Datos del paciente y médico" },
    { title: "Selección de Exámenes", description: "Exámenes a realizar" },
    { title: "Confirmación", description: "Revisar y confirmar" },
  ]

  useEffect(() => {
    fetchOrdenes()
  }, [])

  const fetchOrdenes = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await ordenesAPI.getOrdenes()
      setOrdenes(data)
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "success")
      }
    } catch (error) {
      showNotification("Error al cargar órdenes", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const fetchPacientes = async () => {
    try {
      const data = await pacientesAPI.getPacientes()
      setPacientes(data)
    } catch (error) {
      console.error("Error al cargar pacientes:", error)
    }
  }

  const fetchMedicos = async () => {
    try {
      const data = await medicosAPI.getMedicos()
      setMedicos(data)
    } catch (error) {
      console.error("Error al cargar médicos:", error)
    }
  }

  const fetchExamenes = async () => {
    try {
      const data = await examenesAPI.getExamenes()
      setExamenes(data)
    } catch (error) {
      console.error("Error al cargar exámenes:", error)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      id_ingreso: "",
      id_paciente: "",
      id_medico: "",
      fecha_ingreso: new Date().toISOString().split("T")[0],
      hora_ingreso: new Date().toTimeString().split(" ")[0].substring(0, 5),
      hora_entrega: "",
      horas_ayuno: "",
    })
    setSelectedExamenes([])
    setCurrentStep(0)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrors({
      id_paciente: "",
      id_medico: "",
      hora_entrega: "",
      horas_ayuno: "",
      examenes: "",
    })
  }

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateStep = () => {
    const newErrors = {
      id_paciente: "",
      id_medico: "",
      hora_entrega: "",
      horas_ayuno: "",
      examenes: "",
    }
    let isValid = true

    if (currentStep === 0) {
      if (!formData.id_paciente) {
        newErrors.id_paciente = "Seleccione un paciente"
        isValid = false
      }
      if (!formData.id_medico) {
        newErrors.id_medico = "Seleccione un médico"
        isValid = false
      }
      if (!formData.hora_entrega) {
        newErrors.hora_entrega = "Ingrese la hora de entrega"
        isValid = false
      }
      if (!formData.horas_ayuno) {
        newErrors.horas_ayuno = "Ingrese las horas de ayuno"
        isValid = false
      }
    } else if (currentStep === 1) {
      if (selectedExamenes.length === 0) {
        newErrors.examenes = "Seleccione al menos un examen"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    showLoader()
    try {
      const ordenData = {
        ...formData,
        examenes: selectedExamenes.map((examen: any) => examen.id),
      }

      await ordenesAPI.createOrden(ordenData)
      showNotification("Orden registrada correctamente", "success")
      handleCloseDialog()
      fetchOrdenes()
    } catch (error) {
      showNotification("Error al guardar orden", "error")
    } finally {
      hideLoader()
    }
  }

  const handleRefresh = () => {
    fetchOrdenes(false)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta orden?")) {
      showLoader()
      try {
        await ordenesAPI.deleteOrden(id)
        showNotification("Orden eliminada correctamente", "success")
        fetchOrdenes()
      } catch (error) {
        showNotification("Error al eliminar orden", "error")
      } finally {
        hideLoader()
      }
    }
  }

  const filteredOrdenes = ordenes.filter(
    (orden: any) =>
      orden.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.codigo.includes(searchTerm),
  )

  const columns = [
    { key: "codigo", label: "Código", className: "font-medium" },
    { key: "paciente", label: "Paciente", className: "font-medium text-gray-900" },
    { key: "medico", label: "Médico" },
    { key: "fecha", label: "Fecha", render: (value: string) => <DateCell value={value} /> },
    { key: "hora", label: "Hora" },
    { key: "estado", label: "Estado", render: (value: string) => <StatusBadge status={value} /> },
  ]

  const stats = [
    {
      title: "Total Órdenes",
      value: ordenes.length,
      icon: <FileText className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "Todas las órdenes",
    },
    {
      title: "Pendientes",
      value: ordenes.filter((o: any) => o.estado === "Pendiente").length,
      icon: <Clock className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      trend: "Requieren atención",
    },
    {
      title: "En Proceso",
      value: ordenes.filter((o: any) => o.estado === "En Proceso").length,
      icon: <FileText className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "En laboratorio",
    },
    {
      title: "Validadas",
      value: ordenes.filter((o: any) => o.estado === "Validado").length,
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      trend: "Completadas",
    },
  ]

  const actions = (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white text-green-600 hover:bg-green-50">
          <Plus className="h-4 w-4" />
          Nueva Orden
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Orden</DialogTitle>
          <DialogDescription>Funcionalidad de creación de órdenes próximamente</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )

  const tableActions = (row: any) => (
    <>
      {row.estado === "Validado" && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
            title="Enviar resultados"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600"
            title="Imprimir resultados"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </>
      )}
      {hasPermission("eliminar_orden") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.id)}
          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          title="Eliminar orden"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  )

  const getEstadoBadge = (estado: string) => {
    const variants = {
      Pendiente: "secondary",
      "En Proceso": "default",
      Validado: "default",
    }
    const colors = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      Validado: "bg-green-100 text-green-800",
    }
    return <StatusBadge status={estado} />
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente *</Label>
                <Select value={formData.id_paciente} onValueChange={(value) => handleChange("id_paciente", value)}>
                  <SelectTrigger className={errors.id_paciente ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente: any) => (
                      <SelectItem key={paciente.id} value={paciente.id}>
                        {paciente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_paciente && <p className="text-sm text-red-500">{errors.id_paciente}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medico">Médico *</Label>
                <Select value={formData.id_medico} onValueChange={(value) => handleChange("id_medico", value)}>
                  <SelectTrigger className={errors.id_medico ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos.map((medico: any) => (
                      <SelectItem key={medico.id} value={medico.id}>
                        {medico.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.id_medico && <p className="text-sm text-red-500">{errors.id_medico}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                <Input id="fecha_ingreso" type="date" value={formData.fecha_ingreso} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_ingreso">Hora de Ingreso</Label>
                <Input id="hora_ingreso" type="time" value={formData.hora_ingreso} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_entrega">Hora de Entrega *</Label>
                <Input
                  id="hora_entrega"
                  type="time"
                  value={formData.hora_entrega}
                  onChange={(e) => handleChange("hora_entrega", e.target.value)}
                  className={errors.hora_entrega ? "border-red-500" : ""}
                />
                {errors.hora_entrega && <p className="text-sm text-red-500">{errors.hora_entrega}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horas_ayuno">Horas de Ayuno *</Label>
                <Input
                  id="horas_ayuno"
                  type="number"
                  value={formData.horas_ayuno}
                  onChange={(e) => handleChange("horas_ayuno", e.target.value)}
                  className={errors.horas_ayuno ? "border-red-500" : ""}
                />
                {errors.horas_ayuno && <p className="text-sm text-red-500">{errors.horas_ayuno}</p>}
              </div>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Exámenes *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                {examenes.map((examen: any) => (
                  <div key={examen.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`examen-${examen.id}`}
                      checked={selectedExamenes.some((e: any) => e.id === examen.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExamenes([...selectedExamenes, examen])
                        } else {
                          setSelectedExamenes(selectedExamenes.filter((e: any) => e.id !== examen.id))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`examen-${examen.id}`} className="text-sm">
                      {examen.codigo_abreviado} - {examen.nombre}
                    </label>
                  </div>
                ))}
              </div>
              {errors.examenes && <p className="text-sm text-red-500">{errors.examenes}</p>}
            </div>

            {selectedExamenes.length > 0 && (
              <div className="space-y-2">
                <Label>Exámenes Seleccionados:</Label>
                <div className="space-y-2">
                  {selectedExamenes.map((examen: any) => (
                    <div key={examen.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{examen.nombre}</p>
                        <p className="text-sm text-gray-600">
                          Código: {examen.codigo_abreviado} | Área: {examen.area}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedExamenes(selectedExamenes.filter((e: any) => e.id !== examen.id))}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 2:
        const paciente = pacientes.find((p: any) => p.id === formData.id_paciente)
        const medico = medicos.find((m: any) => m.id === formData.id_medico)

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Resumen de la Orden</h3>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Paciente:</p>
                      <p className="font-medium">{paciente?.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Médico:</p>
                      <p className="font-medium">{medico?.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Ingreso:</p>
                      <p className="font-medium">{formData.fecha_ingreso}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hora de Entrega:</p>
                      <p className="font-medium">{formData.hora_entrega}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Exámenes Solicitados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedExamenes.map((examen: any) => (
                      <div key={examen.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{examen.nombre}</p>
                          <p className="text-sm text-gray-600">Código: {examen.codigo_abreviado}</p>
                        </div>
                        <Badge variant="outline">{examen.area}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <PageLayout
      title="Gestión de Órdenes"
      description="Administra las órdenes de laboratorio"
      icon={<FileText className="h-8 w-8 text-green-600" />}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      actions={actions}
      stats={stats}
    >
      <DataTable
        data={filteredOrdenes}
        columns={columns}
        actions={tableActions}
        emptyMessage="No se encontraron órdenes que coincidan con tu búsqueda"
        emptyIcon={<FileText className="h-12 w-12 text-gray-400" />}
      />
    </PageLayout>
  )
}
