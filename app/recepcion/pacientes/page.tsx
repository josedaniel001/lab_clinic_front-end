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
import { Users, Plus, Edit, Trash2, UserPlus } from "lucide-react"
import { pacientesAPI } from "@/api/pacientesAPI"

export default function PacientesPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [pacientes, setPacientes] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [formData, setFormData] = useState({
    id_paciente: "",
    nombre: "",
    edad: "",
    sexo: "",
    celular: "",
    correo: "",
    procedencia: "",
  })
  const [errors, setErrors] = useState({
    nombre: "",
    edad: "",
    sexo: "",
    celular: "",
    correo: "",
    procedencia: "",
  })

  useEffect(() => {
    fetchPacientes()
  }, [])

  const fetchPacientes = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await pacientesAPI.getPacientes()
      setPacientes(data)
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "success")
      }
    } catch (error) {
      showNotification("Error al cargar pacientes", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchPacientes(false)
  }

  const handleOpenDialog = (paciente = null) => {
    if (paciente) {
      setFormData({
        id_paciente: paciente.id,
        nombre: paciente.nombre,
        edad: paciente.edad.toString(),
        sexo: paciente.sexo,
        celular: paciente.celular,
        correo: paciente.correo,
        procedencia: paciente.procedencia,
      })
      setIsEditing(true)
    } else {
      setFormData({
        id_paciente: "",
        nombre: "",
        edad: "",
        sexo: "",
        celular: "",
        correo: "",
        procedencia: "",
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrors({
      nombre: "",
      edad: "",
      sexo: "",
      celular: "",
      correo: "",
      procedencia: "",
    })
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      nombre: "",
      edad: "",
      sexo: "",
      celular: "",
      correo: "",
      procedencia: "",
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    }

    if (!formData.edad || isNaN(Number(formData.edad)) || Number(formData.edad) <= 0) {
      newErrors.edad = "Ingrese una edad válida"
      isValid = false
    }

    if (!formData.sexo) {
      newErrors.sexo = "Seleccione el sexo"
      isValid = false
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Ingrese un correo válido"
      isValid = false
    }

    if (formData.celular && !/^\d{10}$/.test(formData.celular)) {
      newErrors.celular = "Ingrese un celular válido (10 dígitos)"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    showLoader()
    try {
      if (isEditing) {
        await pacientesAPI.updatePaciente(formData.id_paciente, formData)
        showNotification("Paciente actualizado correctamente", "success")
      } else {
        await pacientesAPI.createPaciente(formData)
        showNotification("Paciente registrado correctamente", "success")
      }
      handleCloseDialog()
      fetchPacientes()
    } catch (error) {
      showNotification("Error al guardar paciente", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este paciente?")) {
      showLoader()
      try {
        await pacientesAPI.deletePaciente(id)
        showNotification("Paciente eliminado correctamente", "success")
        fetchPacientes()
      } catch (error) {
        showNotification("Error al eliminar paciente", "error")
      } finally {
        hideLoader()
      }
    }
  }

  const filteredPacientes = pacientes.filter(
    (paciente: any) =>
      paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.celular.includes(searchTerm),
  )

  const columns = [
    { key: "id", label: "ID", className: "font-medium" },
    { key: "nombre", label: "Nombre", className: "font-medium text-gray-900" },
    { key: "edad", label: "Edad" },
    {
      key: "sexo",
      label: "Sexo",
      render: (value: string) => {
        const labels = { M: "Masculino", F: "Femenino", O: "Otro" }
        return <StatusBadge status={labels[value as keyof typeof labels]} />
      },
    },
    { key: "celular", label: "Celular" },
    { key: "correo", label: "Correo", className: "text-blue-600" },
    { key: "procedencia", label: "Procedencia" },
  ]

  const stats = [
    {
      title: "Total Pacientes",
      value: pacientes.length.toLocaleString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "+12% este mes",
    },
    {
      title: "Nuevos este mes",
      value: "24",
      icon: <UserPlus className="h-6 w-6" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      trend: "+3 vs ayer",
    },
    {
      title: "Activos",
      value: filteredPacientes.length.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "Filtrados",
    },
    {
      title: "Promedio Edad",
      value: "42",
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      trend: "años",
    },
  ]

  const actions = (
    <Modal open={openDialog} onOpenChange={setOpenDialog}>
      <ModalTrigger asChild>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
          <Plus className="h-4 w-4" />
          Nuevo Paciente
        </Button>
      </ModalTrigger>
      <ModalContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{isEditing ? "Editar Paciente" : "Nuevo Paciente"}</ModalTitle>
          <ModalDescription>
            {isEditing ? "Modifica la información del paciente" : "Ingresa los datos del nuevo paciente"}
          </ModalDescription>
        </ModalHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad">Edad *</Label>
            <Input
              id="edad"
              type="number"
              value={formData.edad}
              onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
              className={errors.edad ? "border-red-500" : ""}
            />
            {errors.edad && <p className="text-sm text-red-500">{errors.edad}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo *</Label>
            <Select value={formData.sexo} onValueChange={(value) => setFormData({ ...formData, sexo: value })}>
              <SelectTrigger className={errors.sexo ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Femenino</SelectItem>
                <SelectItem value="O">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.sexo && <p className="text-sm text-red-500">{errors.sexo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
              className={errors.celular ? "border-red-500" : ""}
            />
            {errors.celular && <p className="text-sm text-red-500">{errors.celular}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className={errors.correo ? "border-red-500" : ""}
            />
            {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="procedencia">Procedencia</Label>
            <Input
              id="procedencia"
              value={formData.procedencia}
              onChange={(e) => setFormData({ ...formData, procedencia: e.target.value })}
              className={errors.procedencia ? "border-red-500" : ""}
            />
            {errors.procedencia && <p className="text-sm text-red-500">{errors.procedencia}</p>}
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

  const tableActions = (row: any) => (
    <>
      {hasPermission("editar_paciente") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(row)}
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission("eliminar_paciente") && (
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

  return (
    <PageLayout
      title="Gestión de Pacientes"
      description="Administra la información de los pacientes del laboratorio"
      icon={<Users className="h-8 w-8 text-blue-600" />}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      actions={actions}
      stats={stats}
    >
      <DataTable
        data={filteredPacientes}
        columns={columns}
        actions={tableActions}
        emptyMessage="No se encontraron pacientes que coincidan con tu búsqueda"
        emptyIcon={<Users className="h-12 w-12 text-gray-400" />}
      />
    </PageLayout>
  )
}
