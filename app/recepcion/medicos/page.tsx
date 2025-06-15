"use client"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable, StatusBadge } from "@/components/ui/DataTable"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stethoscope, Plus, Edit, Trash2, UserCheck, Users, Award, Activity, Phone, Mail, MapPin } from "lucide-react"

export default function MedicosPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [medicos, setMedicos] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedMedico, setSelectedMedico] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [formData, setFormData] = useState({
    id_medico: "",
    nombre: "",
    especialidad: "",
    cedula: "",
    telefono: "",
    correo: "",
    telefono_consultorio: "",
    direccion_consultorio: "",
  })

  useEffect(() => {
    fetchMedicos()
  }, [])

  const fetchMedicos = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      // Datos de ejemplo mientras se conecta la API real
      const mockData = [
        {
          id: 1,
          nombre: "Dr. Alejandro Rodríguez",
          especialidad: "Cardiología",
          cedula: "12345678",
          telefono: "1111111111",
          correo: "alejandro@example.com",
          telefono_consultorio: "555-0101",
          direccion_consultorio: "Calle Principal 123",
          activo: true,
          ordenes_mes: 45,
        },
        {
          id: 2,
          nombre: "Dra. Sofía Hernández",
          especialidad: "Dermatología",
          cedula: "87654321",
          telefono: "2222222222",
          correo: "sofia@example.com",
          telefono_consultorio: "555-0102",
          direccion_consultorio: "Avenida Central 456",
          activo: true,
          ordenes_mes: 32,
        },
        {
          id: 3,
          nombre: "Dr. Miguel Torres",
          especialidad: "Neurología",
          cedula: "11223344",
          telefono: "3333333333",
          correo: "miguel@example.com",
          telefono_consultorio: "555-0103",
          direccion_consultorio: "Plaza Mayor 789",
          activo: true,
          ordenes_mes: 28,
        },
        {
          id: 4,
          nombre: "Dra. Carmen López",
          especialidad: "Pediatría",
          cedula: "44332211",
          telefono: "4444444444",
          correo: "carmen@example.com",
          telefono_consultorio: "555-0104",
          direccion_consultorio: "Calle Salud 321",
          activo: true,
          ordenes_mes: 52,
        },
        {
          id: 5,
          nombre: "Dr. Roberto Martín",
          especialidad: "Medicina General",
          cedula: "55667788",
          telefono: "5555555555",
          correo: "roberto@example.com",
          telefono_consultorio: "555-0105",
          direccion_consultorio: "Avenida Bienestar 654",
          activo: false,
          ordenes_mes: 0,
        },
      ]

      setMedicos(mockData)
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "success")
      }
    } catch (error) {
      showNotification("Error al cargar médicos", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchMedicos(false)
  }

  const handleOpenDialog = (medico = null) => {
    if (medico) {
      setFormData({
        id_medico: medico.id,
        nombre: medico.nombre,
        especialidad: medico.especialidad,
        cedula: medico.cedula,
        telefono: medico.telefono,
        correo: medico.correo,
        telefono_consultorio: medico.telefono_consultorio || "",
        direccion_consultorio: medico.direccion_consultorio || "",
      })
      setIsEditing(true)
    } else {
      setFormData({
        id_medico: "",
        nombre: "",
        especialidad: "",
        cedula: "",
        telefono: "",
        correo: "",
        telefono_consultorio: "",
        direccion_consultorio: "",
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleOpenDetails = (medico) => {
    setSelectedMedico(medico)
    setOpenDetailsDialog(true)
  }

  const handleSubmit = async () => {
    showLoader()
    try {
      if (isEditing) {
        // await medicosAPI.updateMedico(formData.id_medico, formData)
        showNotification("Médico actualizado correctamente", "success")
      } else {
        // await medicosAPI.createMedico(formData)
        showNotification("Médico registrado correctamente", "success")
      }
      setOpenDialog(false)
      fetchMedicos()
    } catch (error) {
      showNotification("Error al guardar médico", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este médico?")) {
      showLoader()
      try {
        // await medicosAPI.deleteMedico(id)
        showNotification("Médico eliminado correctamente", "success")
        fetchMedicos()
      } catch (error) {
        showNotification("Error al eliminar médico", "error")
      } finally {
        hideLoader()
      }
    }
  }

  // Función para generar iniciales de forma segura
  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Función para generar color de avatar basado en el nombre
  const getAvatarColor = (nombre: string) => {
    const colors = [
      { bg: "#dbeafe", text: "#1e40af" }, // blue
      { bg: "#dcfce7", text: "#166534" }, // green
      { bg: "#fef3c7", text: "#92400e" }, // yellow
      { bg: "#fce7f3", text: "#be185d" }, // pink
      { bg: "#e0e7ff", text: "#3730a3" }, // indigo
      { bg: "#ecfdf5", text: "#065f46" }, // emerald
    ]
    const index = nombre.length % colors.length
    return colors[index]
  }

  const filteredMedicos = medicos.filter(
    (medico: any) =>
      medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.correo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const especialidades = [...new Set(medicos.map((m: any) => m.especialidad))].length
  const medicosActivos = medicos.filter((m: any) => m.activo !== false).length
  const promedioOrdenes = Math.round(
    medicos.reduce((acc: number, m: any) => acc + (m.ordenes_mes || 0), 0) / medicos.length,
  )

  const columns = [
    {
      key: "avatar",
      label: "",
      render: (value: any, row: any) => {
        const color = getAvatarColor(row.nombre)
        return (
          <Avatar className="h-10 w-10">
            <AvatarFallback className="font-semibold text-sm" style={{ backgroundColor: color.bg, color: color.text }}>
              {getInitials(row.nombre)}
            </AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      key: "nombre",
      label: "Nombre",
      className: "font-medium",
      render: (value: string) => <span style={{ color: "#1f2937" }}>{value}</span>,
    },
    {
      key: "especialidad",
      label: "Especialidad",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "cedula",
      label: "Cédula",
      render: (value: string) => <span style={{ color: "#4b5563" }}>{value}</span>,
    },
    {
      key: "telefono",
      label: "Teléfono",
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-gray-400" />
          <span style={{ color: "#4b5563" }}>{value}</span>
        </div>
      ),
    },
    {
      key: "correo",
      label: "Correo",
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-gray-400" />
          <span style={{ color: "#2563eb" }}>{value}</span>
        </div>
      ),
    },
    {
      key: "ordenes_mes",
      label: "Órdenes/Mes",
      render: (value: number) => (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: value > 30 ? "#dcfce7" : "#fef3c7",
            color: value > 30 ? "#166534" : "#92400e",
          }}
        >
          {value || 0}
        </span>
      ),
    },
    {
      key: "activo",
      label: "Estado",
      render: (value: boolean) => <StatusBadge status={value ? "Activo" : "Inactivo"} />,
    },
  ]

  const stats = [
    {
      title: "Total Médicos",
      value: medicos.length.toString(),
      icon: <Stethoscope className="h-8 w-8" style={{ color: "white" }} />,
      color: "primary",
      trend: "+2 este mes",
    },
    {
      title: "Médicos Activos",
      value: medicosActivos.toString(),
      icon: <UserCheck className="h-8 w-8" style={{ color: "white" }} />,
      color: "success",
      trend: `${Math.round((medicosActivos / medicos.length) * 100)}% del total`,
    },
    {
      title: "Especialidades",
      value: especialidades.toString(),
      icon: <Award className="h-8 w-8" style={{ color: "white" }} />,
      color: "secondary",
      trend: "Diversificadas",
    },
    {
      title: "Promedio Órdenes",
      value: promedioOrdenes.toString(),
      icon: <Activity className="h-8 w-8" style={{ color: "white" }} />,
      color: "warning",
      trend: "por médico/mes",
    },
  ]

  const actions = (
    <Modal open={openDialog} onOpenChange={setOpenDialog}>
      <ModalTrigger asChild>
        <Button
          onClick={() => handleOpenDialog()}
          className="gap-2"
          style={{ backgroundColor: "#2563eb", color: "white" }}
        >
          <Plus className="h-4 w-4" />
          Nuevo Médico
        </Button>
      </ModalTrigger>
      <ModalContent className="sm:max-w-2xl">
        <ModalHeader>
          <ModalTitle style={{ color: "#1f2937" }}>{isEditing ? "Editar Médico" : "Nuevo Médico"}</ModalTitle>
          <ModalDescription style={{ color: "#6b7280" }}>
            {isEditing ? "Modifica la información del médico" : "Ingresa los datos del nuevo médico"}
          </ModalDescription>
        </ModalHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" style={{ color: "#374151" }}>
              Nombre completo *
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad" style={{ color: "#374151" }}>
              Especialidad *
            </Label>
            <Select
              value={formData.especialidad}
              onValueChange={(value) => setFormData({ ...formData, especialidad: value })}
            >
              <SelectTrigger style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}>
                <SelectValue placeholder="Seleccionar especialidad" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: "white", color: "#1f2937" }}>
                <SelectItem value="Medicina General">Medicina General</SelectItem>
                <SelectItem value="Cardiología">Cardiología</SelectItem>
                <SelectItem value="Dermatología">Dermatología</SelectItem>
                <SelectItem value="Endocrinología">Endocrinología</SelectItem>
                <SelectItem value="Gastroenterología">Gastroenterología</SelectItem>
                <SelectItem value="Ginecología">Ginecología</SelectItem>
                <SelectItem value="Neurología">Neurología</SelectItem>
                <SelectItem value="Pediatría">Pediatría</SelectItem>
                <SelectItem value="Psiquiatría">Psiquiatría</SelectItem>
                <SelectItem value="Urología">Urología</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cedula" style={{ color: "#374151" }}>
              Cédula *
            </Label>
            <Input
              id="cedula"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" style={{ color: "#374151" }}>
              Teléfono personal
            </Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo" style={{ color: "#374151" }}>
              Correo electrónico
            </Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono_consultorio" style={{ color: "#374151" }}>
              Teléfono consultorio
            </Label>
            <Input
              id="telefono_consultorio"
              value={formData.telefono_consultorio}
              onChange={(e) => setFormData({ ...formData, telefono_consultorio: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion_consultorio" style={{ color: "#374151" }}>
              Dirección consultorio
            </Label>
            <Input
              id="direccion_consultorio"
              value={formData.direccion_consultorio}
              onChange={(e) => setFormData({ ...formData, direccion_consultorio: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
            />
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setOpenDialog(false)}
            style={{ backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db" }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} style={{ backgroundColor: "#2563eb", color: "white" }}>
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  const tableActions = (row: any) => (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleOpenDetails(row)}
        className="h-8 w-8 p-0"
        style={{ color: "#2563eb" }}
        title="Ver detalles"
      >
        <Users className="h-4 w-4" />
      </Button>
      {hasPermission("editar_medico") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(row)}
          className="h-8 w-8 p-0"
          style={{ color: "#2563eb" }}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission("eliminar_medico") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.id)}
          className="h-8 w-8 p-0"
          style={{ color: "#dc2626" }}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  )

  return (
    <>
      <PageLayout
        title="Directorio Médico"
        description="Gestiona la información de los médicos del laboratorio"
        icon={<Stethoscope className="h-8 w-8" style={{ color: "#2563eb" }} />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        actions={actions}
        stats={stats}
      >
        <DataTable
          data={filteredMedicos}
          columns={columns}
          actions={tableActions}
          emptyMessage="No se encontraron médicos que coincidan con tu búsqueda"
          emptyIcon={<Stethoscope className="h-12 w-12 text-gray-400" />}
        />
      </PageLayout>

      {/* Details Dialog */}
      <Modal open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
        <ModalContent className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle style={{ color: "#1f2937" }}>Detalles del Médico</ModalTitle>
            <ModalDescription style={{ color: "#6b7280" }}>
              Información completa del médico seleccionado
            </ModalDescription>
          </ModalHeader>

          {selectedMedico && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {(() => {
                  const color = getAvatarColor(selectedMedico.nombre)
                  return (
                    <Avatar className="h-16 w-16">
                      <AvatarFallback
                        className="font-semibold text-lg"
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        {getInitials(selectedMedico.nombre)}
                      </AvatarFallback>
                    </Avatar>
                  )
                })()}
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "#1f2937" }}>
                    {selectedMedico.nombre}
                  </h3>
                  <p style={{ color: "#2563eb" }}>{selectedMedico.especialidad}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Cédula:
                  </p>
                  <p style={{ color: "#1f2937" }}>{selectedMedico.cedula}</p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Teléfono:
                  </p>
                  <p style={{ color: "#1f2937" }}>{selectedMedico.telefono}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Correo:
                  </p>
                  <p style={{ color: "#2563eb" }}>{selectedMedico.correo}</p>
                </div>
                {selectedMedico.telefono_consultorio && (
                  <div>
                    <p className="font-medium" style={{ color: "#6b7280" }}>
                      Tel. Consultorio:
                    </p>
                    <p style={{ color: "#1f2937" }}>{selectedMedico.telefono_consultorio}</p>
                  </div>
                )}
                {selectedMedico.direccion_consultorio && (
                  <div className="col-span-2">
                    <p className="font-medium" style={{ color: "#6b7280" }}>
                      Dirección Consultorio:
                    </p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <p style={{ color: "#1f2937" }}>{selectedMedico.direccion_consultorio}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Órdenes este mes:
                  </p>
                  <p style={{ color: "#1f2937" }}>{selectedMedico.ordenes_mes || 0}</p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Estado:
                  </p>
                  <StatusBadge status={selectedMedico.activo ? "Activo" : "Inactivo"} />
                </div>
              </div>
            </div>
          )}

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDetailsDialog(false)}
              style={{ backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db" }}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
