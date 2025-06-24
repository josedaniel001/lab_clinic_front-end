"use client"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable, StatusBadge } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/Modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TestTube, Activity, Clock, DollarSign, Plus, Edit, Trash2, Eye } from "lucide-react"
import { examenesAPI } from "@/api/examenesAPI"

interface Examen {
  id: number
  codigo: string
  nombre: string
  categoria: string
  precio: number
  tiempo_procesamiento: string
  metodologia: string
  preparacion_paciente: string
  valores_referencia: string
  estado: "Activo" | "Inactivo"
  fecha_creacion: string
}

// Datos de ejemplo
const EXAMENES_EJEMPLO: Examen[] = [
  {
    id: 1,
    codigo: "HEM001",
    nombre: "Hemograma Completo",
    categoria: "Hematología",
    precio: 25000,
    tiempo_procesamiento: "2-4 horas",
    metodologia: "Citometría de flujo",
    preparacion_paciente: "Ayuno no requerido",
    valores_referencia: "Glóbulos rojos: 4.5-5.5 M/μL, Glóbulos blancos: 4.0-11.0 K/μL",
    estado: "Activo",
    fecha_creacion: "2024-01-15",
  },
  {
    id: 2,
    codigo: "BIO001",
    nombre: "Glucosa en Sangre",
    categoria: "Bioquímica",
    precio: 15000,
    tiempo_procesamiento: "1-2 horas",
    metodologia: "Espectrofotometría",
    preparacion_paciente: "Ayuno de 8-12 horas",
    valores_referencia: "70-100 mg/dL (ayuno)",
    estado: "Activo",
    fecha_creacion: "2024-01-10",
  },
  {
    id: 3,
    codigo: "LIP001",
    nombre: "Perfil Lipídico",
    categoria: "Bioquímica",
    precio: 35000,
    tiempo_procesamiento: "2-3 horas",
    metodologia: "Espectrofotometría enzimática",
    preparacion_paciente: "Ayuno de 12 horas",
    valores_referencia: "Colesterol total: <200 mg/dL, HDL: >40 mg/dL",
    estado: "Activo",
    fecha_creacion: "2024-01-12",
  },
  {
    id: 4,
    codigo: "TIR001",
    nombre: "Perfil Tiroideo",
    categoria: "Endocrinología",
    precio: 45000,
    tiempo_procesamiento: "4-6 horas",
    metodologia: "Quimioluminiscencia",
    preparacion_paciente: "No requiere ayuno",
    valores_referencia: "TSH: 0.4-4.0 mIU/L, T4: 4.5-12.0 μg/dL",
    estado: "Activo",
    fecha_creacion: "2024-01-08",
  },
  {
    id: 5,
    codigo: "URI001",
    nombre: "Uroanálisis Completo",
    categoria: "Urología",
    precio: 20000,
    tiempo_procesamiento: "1-2 horas",
    metodologia: "Microscopia y tiras reactivas",
    preparacion_paciente: "Primera orina de la mañana",
    valores_referencia: "Proteínas: Negativo, Glucosa: Negativo",
    estado: "Inactivo",
    fecha_creacion: "2024-01-05",
  },
]

const CATEGORIAS = ["Hematología", "Bioquímica", "Endocrinología", "Urología", "Microbiología", "Inmunología"]

export default function ExamenesPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()
  const [examenes, setExamenes] = useState<Examen[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null)
  const [pagination, setPagination] = useState({ page: 1, next: null, previous: null, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [formData, setFormData] = useState({
    id: "",
    codigo: "",
    nombre: "",
    categoria: "",
    precio: "",
    tiempo_procesamiento: "",
    metodologia: "",
    preparacion_paciente: "",
    valores_referencia: "",
    estado: "Activo" as "Activo" | "Inactivo",
  })
  const [errors, setErrors] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    precio: "",
  })

  useEffect(() => {
    fetchExamenes()
  }, [currentPage,limit])

  const fetchExamenes = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }
    try {
      // Simular API call    
      const data = await examenesAPI.getExamenes(currentPage, limit)
      const lista = Array.isArray(data?.results) ? data.results : []
      console.log("Primera Carga de Datos: " + JSON.stringify(lista, null, 2))
      setExamenes(lista)
      setPagination({
        page: currentPage,
        next: data.next,
        previous: data.previous,
        total: data.count,
      })
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "success")
      }
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    } catch (error) {
      showNotification("Error al cargar exámenes", "error")
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchExamenes(false)
  }

  const handleOpenDialog = (examen: Examen | null = null) => {
    if (examen) {
      setFormData({
        id: examen.id.toString(),
        codigo: examen.codigo,
        nombre: examen.nombre,
        categoria: examen.categoria,
        precio: examen.precio.toString(),
        tiempo_procesamiento: examen.tiempo_procesamiento,
        metodologia: examen.metodologia,
        preparacion_paciente: examen.preparacion_paciente,
        valores_referencia: examen.valores_referencia,
        estado: examen.estado,
      })
      setIsEditing(true)
    } else {
      setFormData({
        id: "",
        codigo: "",
        nombre: "",
        categoria: "",
        precio: "",
        tiempo_procesamiento: "",
        metodologia: "",
        preparacion_paciente: "",
        valores_referencia: "",
        estado: "Activo",
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleOpenViewDialog = (examen: Examen) => {
    setSelectedExamen(examen)
    setOpenViewDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrors({
      codigo: "",
      nombre: "",
      categoria: "",
      precio: "",
    })
  }

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setSelectedExamen(null)
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      codigo: "",
      nombre: "",
      categoria: "",
      precio: "",
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es requerido"
      isValid = false
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    }

    if (!formData.categoria) {
      newErrors.categoria = "La categoría es requerida"
      isValid = false
    }

    if (formData.precio && (isNaN(Number(formData.precio)) || Number(formData.precio) < 0)) {
      newErrors.precio = "Ingrese un precio válido"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    showLoader()
    try {
      const { id, ...restFormData } = formData
      const examenData: Examen = {
        ...restFormData,
        precio: Number(formData.precio) || 0,
      }

      if (isEditing) {
        await examenesAPI.updateExamen(id, examenData);
        showNotification("Examen actualizado correctamente", "success")
      } else {
        await examenesAPI.createExamen(examenData)
        showNotification("Examen creado correctamente", "success")
      }
      fetchExamenes()
      handleCloseDialog()
    } catch (error) {
      showNotification("Error al guardar examen", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este examen?")) {
      showLoader()
      try {
        setExamenes((prev) => prev.filter((e) => e.id !== id))
        fetchExamenes()
        showNotification("Examen eliminado correctamente", "success")
      } catch (error) {
        showNotification("Error al eliminar examen", "error")
      } finally {
        hideLoader()
      }
    }
  }


  const filteredExamenes = examenes.filter(
    (examen) =>
      examen.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examen.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examen.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const columns = [
    {
      key: "codigo",
      label: "Código",
      render: (value: string) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{value}</span>,
    },
    { key: "nombre", label: "Nombre", className: "font-medium text-gray-900" },
    { key: "categoria", label: "Categoría" },
    {
      key: "precio",
      label: "Precio",
      render: (value: number) => `Q${value.toLocaleString()}`,
      className: "font-medium",
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => <StatusBadge status={value} variant={value === "Activo" ? "success" : "secondary"} />,
    },
  ]

  const stats = [
    {
      title: "Total Exámenes",
      value: examenes.length.toString(),
      icon: <TestTube className="h-6 w-6" />,
      color: "primary",
    },
    {
      title: "Exámenes Activos",
      value: examenes.filter((e) => e.estado === "Activo").length.toString(),
      icon: <Activity className="h-6 w-6" />,
      color: "success",
    },
    {
      title: "Categorías",
      value: new Set(examenes.map((e) => e.categoria)).size.toString(),
      icon: <Clock className="h-6 w-6" />,
      color: "secondary",
    },
    {
      title: "Precio Promedio",
      value:
        examenes.length > 0
          ? `Q ${Math.round(examenes.reduce((acc, e) => acc + Number(e.precio), 0) / examenes.length).toLocaleString()}`
          : "Q 0",
      icon: <DollarSign className="h-6 w-6" />,
      color: "warning",
    },
  ]

  const actions = (
    <Modal open={openDialog} onOpenChange={setOpenDialog}>
      <ModalTrigger asChild>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
          <Plus className="h-4 w-4" />
          Nuevo Examen
        </Button>
      </ModalTrigger>
      <ModalContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{isEditing ? "Editar Examen" : "Nuevo Examen"}</ModalTitle>
          <ModalDescription>
            {isEditing ? "Modifica la información del examen" : "Ingresa los datos del nuevo examen"}
          </ModalDescription>
        </ModalHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              className={errors.codigo ? "border-red-500" : ""}
              placeholder="Ej: HEM001"
            />
            {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={errors.nombre ? "border-red-500" : ""}
              placeholder="Ej: Hemograma Completo"
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
            >
              <SelectTrigger className={errors.categoria ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && <p className="text-sm text-red-500">{errors.categoria}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              className={errors.precio ? "border-red-500" : ""}
              placeholder="0"
            />
            {errors.precio && <p className="text-sm text-red-500">{errors.precio}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiempo_procesamiento">Tiempo de Procesamiento</Label>
            <Input
              id="tiempo_procesamiento"
              value={formData.tiempo_procesamiento}
              onChange={(e) => setFormData({ ...formData, tiempo_procesamiento: e.target.value })}
              placeholder="Ej: 2-4 horas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData({ ...formData, estado: value as "Activo" | "Inactivo" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="metodologia">Metodología</Label>
            <Textarea
              id="metodologia"
              value={formData.metodologia}
              onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
              placeholder="Descripción de la metodología"
              rows={2}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="preparacion_paciente">Preparación del Paciente</Label>
            <Textarea
              id="preparacion_paciente"
              value={formData.preparacion_paciente}
              onChange={(e) => setFormData({ ...formData, preparacion_paciente: e.target.value })}
              placeholder="Instrucciones para el paciente"
              rows={2}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="valores_referencia">Valores de Referencia</Label>
            <Textarea
              id="valores_referencia"
              value={formData.valores_referencia}
              onChange={(e) => setFormData({ ...formData, valores_referencia: e.target.value })}
              placeholder="Rangos normales"
              rows={3}
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  const tableActions = (row: Examen) => (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleOpenViewDialog(row)}
        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {hasPermission("editar_examenes") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(row)}
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission("eliminar_examenes") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.id)}
          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  )

  if (!hasPermission("ver_examenes") && !hasPermission("ver_modulo_laboratorio")) {
    return (
      <PageLayout
        title="Sin Permisos"
        description="No tienes acceso a esta sección"
        icon={<TestTube className="h-8 w-8 text-red-600" />}
        stats={[]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin permisos</h3>
            <p className="text-gray-500">No tienes permisos para ver esta página.</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <>
      <PageLayout
        title="Gestión de Exámenes"
        description="Administra los exámenes de laboratorio"
        icon={<TestTube className="h-8 w-8 text-blue-600" />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        actions={actions}
        stats={stats}
      >
        <DataTable
          data={filteredExamenes}
          columns={columns}
          actions={tableActions}
          emptyMessage="No se encontraron exámenes que coincidan con tu búsqueda"
          emptyIcon={<TestTube className="h-12 w-12 text-gray-400" />}
        />
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

      {/* Modal Ver Detalles */}
      <Modal open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <ModalContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Detalles del Examen</ModalTitle>
            <ModalDescription>Información completa del examen seleccionado</ModalDescription>
          </ModalHeader>

          {selectedExamen && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Código</Label>
                  <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                    {selectedExamen.codigo}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <StatusBadge
                      status={selectedExamen.estado}
                      variant={selectedExamen.estado === "Activo" ? "success" : "secondary"}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                <p className="mt-1 text-lg font-medium">{selectedExamen.nombre}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Categoría</Label>
                  <p className="mt-1">{selectedExamen.categoria}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Precio</Label>
                  <p className="mt-1 text-lg font-semibold text-green-600">Q{selectedExamen.precio.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Tiempo de Procesamiento</Label>
                <p className="mt-1">{selectedExamen.tiempo_procesamiento}</p>
              </div>

              {selectedExamen.metodologia && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Metodología</Label>
                  <p className="mt-1 text-gray-700">{selectedExamen.metodologia}</p>
                </div>
              )}

              {selectedExamen.preparacion_paciente && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Preparación del Paciente</Label>
                  <p className="mt-1 text-gray-700">{selectedExamen.preparacion_paciente}</p>
                </div>
              )}

              {selectedExamen.valores_referencia && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valores de Referencia</Label>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{selectedExamen.valores_referencia}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                <p className="mt-1 text-gray-700">{new Date(selectedExamen.fecha_creacion).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <ModalFooter>
            <Button variant="outline" onClick={handleCloseViewDialog}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
