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
import { useCatalogosPorPais } from "@/hooks/useCatalogoPorPais"
import { medicosAPI } from "@/api/medicosAPI"
import { Combobox } from "@/components/ui/combobox"

export default function MedicosPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()


  const { departamentos, municipios, loading } = useCatalogosPorPais(1)
  const [departamentoId, setDepartamentoId] = useState("")
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<any[]>([])

  const [medicos, setMedicos] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedMedico, setSelectedMedico] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, next: null, previous: null, total: 0 })
   const [limit, setLimit] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)

  const [formData, setFormData] = useState({
    id_medico: "",
    nombre: "",
    numero_documento: "",
    tipo_documento:"",
    especialidades: "",
    codigo_laboratorio: "",
    sexo: "",
    celular: "",
    correo: "",
    telefono_consultorio: "",
    direccion_consultorio: "",
    municipios: "",
  })

   const [errors, setErrors] = useState({
     id_medico: "",
    nombre: "",
    numero_documento: "",
    tipo_documento:"",
    especialidades: "",
    codigo_laboratorio: "",
    sexo: "",
    celular: "",
    correo: "",
    telefono_consultorio: "",
    direccion_consultorio: "",
    municipios: "",
  })

  const catalgoEspecialidad =[
    {value:'GEN', label:'Medicina General'},
        {value:'PED', label:'Pediatría'},
        {value:'GIN', label:'Ginecología'},
        {value:'DER', label:'Dermatología'},
        {value:'CAR', label:'Cardiología'},
        {value:'NEU', label:'Neurología'},
        {value:'NEURO', label:'Neumología'},
        {value:'END', label:'Endocrinología'},
        {value:'OFT', label:'Oftalmología'},
        {value:'OTO', label:'Otorrinolaringología'},
        {value:'TRA', label:'Traumatología'},
        {value:'URO', label:'Urología'},
        {value:'PSI', label:'Psiquiatría'},
        {value:'ODO', label:'Odontología'},
        {value:'REU', label:'Reumatología'},
        {value:'GAS', label:'Gastroenterología'},
        {value:'ONC', label:'Oncología'},
        {value:'HEM', label:'Hematología'},
        {value:'CIR', label:'Cirugía General'},
        {value:'CIRP', label:'Cirugía Pediátrica'},
        {value:'CIRC', label:'Cirugía Cardiovascular'},
        {value:'RAD', label:'Radiología'},
        {value:'INT', label:'Medicina Interna'},
        {value:'FOR', label:'Medicina Forense'},
        {value:'ANE', label:'Anestesiología'},
  ]
  useEffect(() => {
    fetchMedicos()
  }, [currentPage,limit])

 useEffect(() => {
  if (departamentoId) {
    const filtrados = municipios.filter(m => m.departamento.id.toString() === departamentoId)
    setMunicipiosFiltrados(filtrados)
  } else {
    setMunicipiosFiltrados([])
  }
}, [departamentoId, municipios])


  const fetchMedicos = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
    const data = await medicosAPI.getMedicos(currentPage,limit)
          const lista = Array.isArray(data?.results) ? data.results : []
          setMedicos(lista)
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
        console.log("Datos de paciente: "+JSON.stringify(medico,null,2))
        const nombreCompleto = `${medico.nombres} ${medico.apellidos}`.trim()
      setFormData({
        id_medico: medico.id ?? "",
        nombre: nombreCompleto ?? "",
        numero_documento: medico.numero_documento ?? "",
        tipo_documento: medico.tipo_documento ?? "",
        especialidades: medico.especialidad_medica  ?? "",
        codigo_laboratorio: medico.codigo_laboratorio ?? "",
        sexo: medico.genero ?? "",
        celular: medico.celular ?? "",
        correo: medico.email ?? "",
        telefono_consultorio: medico.telefono_consultorio ?? "",
        direccion_consultorio: medico.direccion_consultorio ?? "",
        municipios: medico.municipio?.id?.toString() ?? "",
      })
       setDepartamentoId(medico.municipio?.departamento?.id?.toString() ?? "")    
      setIsEditing(true)
    } else {
      setFormData({
        id_medico: "",
        nombre: "",
        numero_documento: "",
        tipo_documento:"",
        especialidades: "",
        codigo_laboratorio: "",
        sexo: "",
        celular: "",
        correo: "",
        telefono_consultorio: "",
        direccion_consultorio: "",
        municipios: "",
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleOpenDetails = (medico) => {
    setSelectedMedico(medico)
    setOpenDetailsDialog(true)
  }

   const validateForm = () => {
    let isValid = true
    const newErrors = {             
        nombre: "",
        numero_documento: "",
        tipo_documento:"",
        especialidades: "",
        codigo_laboratorio: "",
        sexo: "",
        celular: "",
        correo: "",
        telefono_consultorio: "",
        direccion_consultorio: "",
        municipios: "",     
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    }
    if (!formData.especialidades.trim()) {
      newErrors.especialidades = "La especialidad medica es requerida"
      isValid = false
    }

    if (!formData.sexo) {
      newErrors.sexo = "Seleccione el sexo"
      isValid = false
    }
    if (!formData.municipios) {
      newErrors.municipios = "Seleccione el municipio"
      isValid = false
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Ingrese un correo válido"
      isValid = false
    }
    
    if (!formData.numero_documento) {
      newErrors.celular = "El numero de documento es requerido"
      isValid = false
    }
    if (!formData.tipo_documento) {
      newErrors.tipo_documento = "El tipo de documento es requerido"
      isValid = false
    }
    if (formData.celular && !/^\d{10}$/.test(formData.celular)) {
      newErrors.celular = "Ingrese un celular válido (10 dígitos)"
      isValid = false
    }

    setErrors(newErrors)
    console.log("Errores en validación:", newErrors)
    return isValid
  }



  const handleSubmit = async () => {
    console.log("Lanzando evento: ");     
    if (!validateForm()) {
    console.warn("Formulario inválido, no se envía")
    return
    }
    console.log("Formulario válido, se continúa con la petición")
    showLoader()
    try {
      const nombreSplit = formData.nombre.trim().split(" ")
      const nombres = nombreSplit[0] || "Nombre"
      const apellidos = nombreSplit.slice(1).join(" ") || "Apellido"

      const pacientePayload = {
        numero_documento: formData.numero_documento ?? "000000000000",
        tipo_documento: formData.tipo_documento ?? "DPI",
        nombres,
        apellidos,
        celular: formData.celular,
        telefono_consultorio : formData.telefono_consultorio,
        email: formData.correo,
        direccion_consultorio: formData.direccion_consultorio || "Sin dirección",
        genero: formData.sexo,
        especialidad_medica : formData.especialidades,        
        municipio: formData.municipios,
      }
      
      if (isEditing) {
        console.log("lanzando evento de edicion: "+JSON.stringify(pacientePayload,null,2))
         await medicosAPI.updateMedico(formData.id_medico, pacientePayload)
        showNotification("Médico/a actualizado correctamente", "success")
      } else {
         await medicosAPI.createMedico(pacientePayload)
        showNotification("Médico/a registrado correctamente", "success")
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
         await medicosAPI.deleteMedico(id)
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

const paginatedMedico = medicos.map((m: any) => {    
    return {
      id: m.id,
      numero_documento: m.numero_documento,
      codigo_laboratorio: m.codigo_laboratorio,
      nombre: `${m.nombres} ${m.apellidos}`,
      especialidades: m.especialidad_medica,
      sexo: m.genero,
      telefono: m.telefono_consultorio ?? m.celular ?? "",
      correo: m.email,
      direccion: m.direccion_consultorio,
      activo: m.activo,
      ordenes_mes: 0,
      original: m,
    }
  }).filter((m: any) =>
          m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.edad.includes(searchTerm.toLowerCase()) ||
          m.telefono.includes(searchTerm)
        )

  /*const filteredMedicos = medicos.filter(
    (medico: any) =>
      medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.correo.toLowerCase().includes(searchTerm.toLowerCase()),
  )*/

      const handleChange = (name: string, value: string) => {        
        setFormData(prev => ({ ...prev, [name]: value }))        
        setErrors(prev => ({ ...prev, [name]: "" }))
      }

  const especialidades = [...new Set(medicos.map((m: any) => m.especialidad))].length
  const medicosActivos = medicos.filter((m: any) => m.activo !== false).length
  const promedioOrdenes = /*isNaN(Math.round(
    medicos.reduce((acc: number, m: any) => acc + (m.celular || 0), 0) / medicos.length+1,
  ))??*/Number(0)

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
      label: "Nombre Completo",
      className: "font-medium",
      render: (value: string) => <span style={{ color: "#1f2937" }}>{value}</span>,
    },
    {
      key: "especialidades",
      label: "Especialidades Medicas",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "codigo_laboratorio",
      label: "Codigo de Laboratorio",
      render: (value: string) => <span style={{ color: "#4b5563" }}>{value}</span>,
    },
    {
      key: "telefono",
      label: "Teléfono de Consultorio",
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-gray-400" />
          <span style={{ color: "#4b5563" }}>{value}</span>
        </div>
      ),
    },
    {
      key: "correo",
      label: "Correo Electronico",
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
        <Button
          onClick={() => handleOpenDialog()}
          className="gap-2"
          style={{ backgroundColor: "#2563eb", color: "white" }}
        >
          <Plus className="h-4 w-4" />
          Nuevo Médico
        </Button>      
      <ModalContent className="sm:max-w-[2xl] max-h-[100vh] overflow-y-auto width-auto">
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
              className={errors.nombre ? "border-red-500" : ""}
            />
             {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
          <div>
          <Label htmlFor="especialidades" style={{ color: "#374151" }}>
              Especialidad Medica*
            </Label>
                <Combobox
                    items={catalgoEspecialidad.map(p => ({
                      value: String(p.value),
                      label: String(p.label),
                    }))}
                    value={formData.especialidades}
                    onChange={(val) =>{
                        console.log("Especialidad medica seleccionada:", val) // ✅ Debe imprimirse
                        handleChange("especialidades", val)
                      }}
                    placeholder="Especialidad Medica"
                    error={errors.especialidades && <p className="text-sm text-red-500">{errors.especialidades}</p>}
                  />
              </div>

                                    
          </div>

          <div className="space-y-2 md:col-span-2">            
            <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
            <Select value={formData.tipo_documento} onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}>
              <SelectTrigger className={errors.tipo_documento ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DPI">DPI</SelectItem>
                <SelectItem value="CC">Carnet Medico</SelectItem>
                <SelectItem value="CI">Celula Extranjera</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_documento && <p className="text-sm text-red-500">{errors.tipo_documento}</p>}          
          </div>  

          <div className="space-y-2">
            <Label htmlFor="codigo_laboratorio" style={{ color: "#374151" }}>
              Codigo de Laboratorio 
            </Label>
            <Input
              id="codigo_laboratorio"
              value={formData.codigo_laboratorio}
              onChange={(e) => setFormData({ ...formData, codigo_laboratorio: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
              className={errors.codigo_laboratorio ? "border-red-500" : ""}
            />
            {errors.codigo_laboratorio && <p className="text-sm text-red-500">{errors.codigo_laboratorio}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_laboratorio" style={{ color: "#374151" }}>
              Numero de Documento 
            </Label>
            <Input
              id="numero_documento"
              value={formData.numero_documento}
              onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
              className={errors.numero_documento ? "border-red-500" : ""}
            />
            {errors.numero_documento && <p className="text-sm text-red-500">{errors.numero_documento}</p>}
          </div>

          <div className="space-y-2 ">            
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
            <Label htmlFor="celular" style={{ color: "#374151" }}>
              Celular Personal
            </Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
              style={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #d1d5db" }}
              className={errors.celular ? "border-red-500" : ""}
            />
            {errors.celular && <p className="text-sm text-red-500">{errors.celular}</p>}
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
              className={errors.correo ? "border-red-500" : ""}
            />
            {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
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
              className={errors.telefono_consultorio ? "border-red-500" : ""}
            />
            {errors.telefono_consultorio && <p className="text-sm text-red-500">{errors.telefono_consultorio}</p>}
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
              className={errors.direccion_consultorio ? "border-red-500" : ""}
            />
            {errors.direccion_consultorio && <p className="text-sm text-red-500">{errors.direccion_consultorio}</p>}
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
                            <SelectTrigger className={errors.municipios ? "border-red-500" : ""}>
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
                          value={formData.municipios}
                          onValueChange={(value) => setFormData({ ...formData, municipios: value })}
                          disabled={!departamentoId}
                        >
                          <SelectTrigger className={errors.municipios ? "border-red-500" : ""}>
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
                        {errors.municipios && <p className="text-sm text-red-500">{errors.municipios}</p>}
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
        onClick={() => handleOpenDetails(row.original)}
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
          onClick={() => handleOpenDialog(row.original)}
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
          data={paginatedMedico}
          columns={columns}
          actions={tableActions}
          emptyMessage="No se encontraron médicos que coincidan con tu búsqueda"
          emptyIcon={<Stethoscope className="h-12 w-12 text-gray-400" />}
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
                  const color = getAvatarColor(`${selectedMedico.nombres} ${selectedMedico.apellidos}`)
                  return (
                    <Avatar className="h-16 w-16">
                      <AvatarFallback
                        className="font-semibold text-lg"
                        style={{ backgroundColor: color.bg, color: color.text }}
                      >
                        {getInitials(`${selectedMedico.nombres} ${selectedMedico.apellidos}`)}
                      </AvatarFallback>
                    </Avatar>
                  )
                })()}
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "#1f2937" }}>
                    {`${selectedMedico.nombres} ${selectedMedico.apellidos}`}
                  </h3>
                  <p style={{ color: "#2563eb" }}>{selectedMedico.especialidad_medica}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Codigo de Laboratorio:
                  </p>
                  <p style={{ color: "#1f2937" }}>{selectedMedico.codigo_laboratorio}</p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Celular Personal:
                  </p>
                  <p style={{ color: "#1f2937" }}>{selectedMedico.celular}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium" style={{ color: "#6b7280" }}>
                    Correo Electronico:
                  </p>
                  <p style={{ color: "#2563eb" }}>{selectedMedico.email}</p>
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
      {/**/}
    </>
  )
}
