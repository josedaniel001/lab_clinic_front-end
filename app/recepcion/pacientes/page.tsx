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
import { useCatalogosPorPais } from "@/hooks/useCatalogoPorPais"

export default function PacientesPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()
  const { departamentos, municipios, loading } = useCatalogosPorPais(1)
  const [departamentoId, setDepartamentoId] = useState("")
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pacientes, setPacientes] = useState([])
  const [pagination, setPagination] = useState({ page: 1, next: null, previous: null, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5


 const [formData, setFormData] = useState({
    id_paciente:"",
    numero_documento: "",
    nombre: "",
    edad: "",
    sexo: "",
    celular: "",
    correo: "",
    procedencia: "",
    municipio: "",
    estado_civil: "",
    ocupacion: "",
  })
  const [errors, setErrors] = useState({
    id_paciente:"",
    numero_documento: "",
    nombre: "",
    edad: "",
    sexo: "",
    celular: "",
    correo: "",
    procedencia: "",
    municipio: "",
    ocupacion:"",
    estado_civil:"",
  })

  useEffect(() => {
    fetchPacientes()
  }, [currentPage])

  useEffect(() => {
  if (departamentoId) {
    const filtrados = municipios.filter(m => m.departamento.id.toString() === departamentoId)
    setMunicipiosFiltrados(filtrados)
  } else {
    setMunicipiosFiltrados([])
  }
}, [departamentoId, municipios])

  const fetchPacientes = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await pacientesAPI.getPacientes(currentPage)
      const lista = Array.isArray(data?.results) ? data.results : []
      setPacientes(lista)
      setPagination({
        page: currentPage,
        next: data.next,
        previous: data.previous,
        total: data.count,
      })

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
      console.log("Datos de paciente: "+JSON.stringify(paciente,null,2))
      const nombreCompleto = `${paciente.nombres} ${paciente.apellidos}`.trim()
      const nacimiento = new Date(paciente.fecha_nacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - (nacimiento.getFullYear())

       setFormData({   
      id_paciente:paciente.id ?? "",  
      numero_documento: paciente.numero_documento ?? "",
      nombre: nombreCompleto,
      edad: isNaN(edad) ? "" : edad.toString(),
      sexo: paciente.genero ?? "",
      celular: paciente.telefono ?? "",
      correo: paciente.email ?? "",
      procedencia: paciente.direccion ?? "",
      municipio: paciente.municipio?.id?.toString() ?? "",
      ocupacion: paciente.ocupacion ?? "",
    })

    // Esto es clave para que se filtre bien el combo de municipios
    setDepartamentoId(paciente.municipio?.departamento?.id?.toString() ?? "")
    setIsEditing(true)
  } else {
    setFormData({    
      id_paciente:"",  
      numero_documento: "",
      nombre: "",
      edad: "",
      sexo: "",
      celular: "",
      correo: "",
      procedencia: "",
      municipio: "",
      ocupacion: "",
    })
    setDepartamentoId("")
    setIsEditing(false)
  }

  setOpenDialog(true)
  }


  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrors({      
      id_paciente:"",
      numero_documento: "",
      nombre: "",
      edad: "",
      sexo: "",
      celular: "",
      correo: "",
      procedencia: "",
      municipio:"",      
      ocupacion:"",
      estado_civil:"",
    })
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {      
      numero_documento: "",
      nombre: "",
      edad: "",
      sexo: "",
      celular: "",
      correo: "",
      procedencia: "",
      municipio:"",    
      ocupacion:"",
      estado_civil:"",        
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
    if (!formData.municipio) {
      newErrors.municipio = "Seleccione el municipio"
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
      const nombreSplit = formData.nombre.trim().split(" ")
      const nombres = nombreSplit[0] || "Nombre"
      const apellidos = nombreSplit.slice(1).join(" ") || "Apellido"

      const edadNum = Number(formData.edad)
      const hoy = new Date()
      const anioNacimiento = hoy.getFullYear() - edadNum
      const fechaNacimiento = `${anioNacimiento}-01-01`

      const pacientePayload = {
        numero_documento: formData.numero_documento || "00000000",
        tipo_documento: "CC",
        nombres,
        apellidos,
        fecha_nacimiento: fechaNacimiento,
        telefono: formData.celular,
        email: formData.correo,
        direccion: formData.procedencia || "Sin dirección",
        genero: formData.sexo,
        estado_civil: formData.estado_civil,
        ocupacion: formData.ocupacion,
        municipio: formData.municipio,
      }

      if (isEditing) {
        await pacientesAPI.updatePaciente(formData.id_paciente, pacientePayload)
        showNotification("Paciente actualizado correctamente", "success")
      } else {
        await pacientesAPI.createPaciente(pacientePayload)
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

const paginatedPacientes = pacientes.map((p: any) => {
    const nacimiento = new Date(p.fecha_nacimiento)
    const hoy = new Date()
    const edad = hoy.getFullYear() - nacimiento.getFullYear()
    return {
      id: p.id,
      numero_documento: p.numero_documento,
      nombre: `${p.nombres} ${p.apellidos}`,
      edad: isNaN(edad) ? "-" : edad.toString(),
      sexo: p.genero,
      celular: p.telefono,
      correo: p.email,
      procedencia: p.direccion,
      original: p,
    }
  }).filter((p: any) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.edad.includes(searchTerm.toLowerCase()) ||
          p.celular.includes(searchTerm)
        )

  const columns = [
    { key: "id", label: "ID", className: "font-medium" },
    { key: "numero_documento", label: "Numero de Documento", className: "font-medium text-gray-900" },
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


const catalogoOcupaciones = [
  { value: "ingeniero_civil", label: "Ingeniero Civil" },
  { value: "medico_general", label: "Médico General" },
  { value: "enfermero", label: "Enfermero/a" },
  { value: "abogado", label: "Abogado/a" },
  { value: "profesor", label: "Profesor/a" },
  { value: "estudiante", label: "Estudiante" },
  { value: "comerciante", label: "Comerciante" },
  { value: "agricultor", label: "Agricultor/a" },
  { value: "ama_de_casa", label: "Ama de casa" },
  { value: "desempleado", label: "Desempleado/a" },
  { value: "policia", label: "Policía" },
  { value: "bombero", label: "Bombero/a" },
  { value: "ingeniero_sistemas", label: "Ingeniero en Sistemas" },
  { value: "tecnico", label: "Técnico/a" },
  { value: "otro", label: "Otro" },
]

const catalogoEstadoCivil = [
  { value: "Soltero", label: "Soltero" },
  { value: "Casado", label: "Casado" },
  { value: "Divorciado", label: "Divorciado" },
  { value: "Viudo", label: "Viud@" },
]

const promedioEdad = pacientes.length > 0
  ? Math.round(
      pacientes.reduce((acc: number, p: any) => {
        const nacimiento = new Date(p.fecha_nacimiento)
        const hoy = new Date()
        const edad = hoy.getFullYear() - nacimiento.getFullYear()
        return acc + edad
      }, 0) / pacientes.length
    )
  : 0

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
      value: paginatedPacientes.length.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "Filtrados",
    },
    {
      title: "Promedio Edad",
      value: promedioEdad.toString(),
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
            <Label htmlFor="numero_documento">Numero de Documento *</Label>
            <Input
              id="numero_documento"
              type="number"
              value={formData.numero_documento}
              onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
              className={errors.numero_documento ? "border-red-500" : ""}
            />
            {errors.numero_documento && <p className="text-sm text-red-500">{errors.numero_documento}</p>}
          </div>
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="ocupacion">Ocupacion *</Label>
            <Select value={formData.ocupacion} onValueChange={(value) => setFormData({ ...formData, ocupacion: value })}>
              <SelectTrigger className={errors.ocupacion ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar ocupacion" />
              </SelectTrigger>
              <SelectContent>
                {catalogoOcupaciones.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ocupacion && <p className="text-sm text-red-500">{errors.ocupacion}</p>}
          </div>
          <div className="space-y-2 ">
            <Label htmlFor="estado_civil">Estado Civil *</Label>
            <Select value={formData.estado_civil} onValueChange={(value) => setFormData({ ...formData, estado_civil: value })}>
              <SelectTrigger className={errors.estado_civil ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar estado civil" />
              </SelectTrigger>
              <SelectContent>
                {catalogoEstadoCivil.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.estado_civil && <p className="text-sm text-red-500">{errors.estado_civil}</p>}
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
          <div className="space-y-2 md:col-span-2">
             <Label htmlFor="departamento">Departamento *</Label>
                <Select
                  value={departamentoId}
                  onValueChange={(value) => {
                    setDepartamentoId(value)
                    setFormData(prev => ({ ...prev, municipio: "" }))
                  }}
                >
                  <SelectTrigger className={errors.municipio ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
              <Label htmlFor="municipio">Municipio *</Label>
              <Select
                value={formData.municipio}
                onValueChange={(value) => setFormData({ ...formData, municipio: value })}
                disabled={!departamentoId}
              >
                <SelectTrigger className={errors.municipio ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar municipio" />
                </SelectTrigger>
                <SelectContent>
                  {municipiosFiltrados.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.municipio && <p className="text-sm text-red-500">{errors.municipio}</p>}
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
          onClick={() => handleOpenDialog(row.original)}
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
        data={paginatedPacientes}
        columns={columns}
        actions={tableActions}
        emptyMessage="No se encontraron pacientes que coincidan con tu búsqueda"
        emptyIcon={<Users className="h-12 w-12 text-gray-400" />}
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
        <Button
          variant="outline"
          disabled={!pagination.next}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Siguiente
        </Button>
      </div>
    </PageLayout>
  )
}
