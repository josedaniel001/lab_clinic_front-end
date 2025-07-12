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
import { donantesAPI } from "@/api/bancoSangreAPI"
import { useCatalogosPorPais } from "@/hooks/useCatalogoPorPais"
import { Combobox } from "@/components/ui/combobox"

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
  const [limit, setLimit] = useState(5)


 const [formData, setFormData] = useState({
    id_paciente:"",
    numero_documento: "",
    primer_nombre: "",
    segundo_nombre: "",
    sexo: "",
    direccion: "",
    celular: "",
    segundo_apellido: "",
    primer_apellido: "",
    municipio:"",
    fecha_nacimiento: "",
    ocupacion: "",
  })
  const [errors, setErrors] = useState({    
    numero_documento: "",
    primer_nombre: "",
    segundo_nombre: "",
    sexo: "",
    direccion: "",
    celular: "",
    segundo_apellido: "",
    primer_apellido: "",
    municipio:"",
    fecha_nacimiento: "",
    ocupacion: "",  
  })

  useEffect(() => {
    fetchPacientes()
  }, [currentPage,limit])

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
      const data = await donantesAPI.geDonantes()
      const lista = Array.isArray(data?.results) ? data.results : data
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
      

       setFormData({   
      id_paciente:paciente.id ?? "",  
      numero_documento: paciente.cui ?? "",
      primer_nombre: paciente.primer_nombre,
      segundo_nombre: paciente.segundo_nombre,
      primer_apellido: paciente.primer_apellido,
      segundo_apellido: paciente.segundo_apellido,
      edad: isNaN(paciente.edad) ? 0 : paciente.edad,
      fecha_nacimiento:paciente.fecha_nacimiento,
      sexo: paciente.sexo ?? "",
      celular: paciente.celular ?? "",      
      direccion: paciente.direccion ?? "",
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
      fecha_nacimiento: "",
      sexo: "",
      celular: "",
      correo: "",
      direccion: "",
      municipio:"",    
      ocupacion:"",              
    }

    if (!formData.primer_nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    }
    if (!formData.primer_apellido.trim()) {
      newErrors.nombre = "El apellido es requerido"
      isValid = false
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = "Ingrese una fecha de nacimiento valida"
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
    

    if (formData.celular && !/^\d{10}$/.test(formData.celular)) {
      newErrors.celular = "Ingrese un celular válido (10 dígitos)"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

 const handleSubmit = async () => {
  
    if (!validateForm()) {    
      return
    }
    showLoader()
    try {            

      const edadNum = Number(formData.edad?formData.edad:0)
      const hoy = new Date()
      const anioNacimiento = hoy.getFullYear() - edadNum
      const fechaNacimiento = `${anioNacimiento}-01-01`

      const pacientePayload = {
        cui: formData.numero_documento || "00000000",
        //tipo_documento: "DPI",
        primer_nombre:formData.primer_nombre.toUpperCase(),
        segundo_nombre:formData.segundo_nombre ? formData.segundo_nombre.toUpperCase():"",
        primer_apellido:formData.primer_apellido.toUpperCase(),
        segundo_apellido:formData.segundo_apellido?formData.segundo_apellido.toUpperCase():"",
        edad: formData.edad ? Number(formData.edad) : undefined,
        fecha_nacimiento: fechaNacimiento,
        celular: formData.celular,        
        direccion: formData.direccion || "Sin dirección",
        sexo: formData.sexo,        
        ocupacion: formData.ocupacion,
        municipio: formData.municipio,
      }
      console.log(pacientePayload)
      if (isEditing) {
        await donantesAPI.updateDonante(formData.id_paciente, pacientePayload)
        showNotification("Donante actualizado correctamente", "success")
      } else {
        console.log("entro aqui")
        await donantesAPI.createDonante(pacientePayload)
        showNotification("Donante registrado correctamente", "success")
      }

      handleCloseDialog()
      fetchPacientes()
    } catch (error) {
      console.log(error)
      showNotification("Error al guardar donante: "+error, "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este donante?")) {
      showLoader()
      try {
        await donantesAPI.deleteDonante(id)
        showNotification("Donante eliminado correctamente", "success")
        fetchPacientes()
      } catch (error) {
        showNotification("Error al eliminar donante", "error")
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
      numero_documento: p.cui,
      nombre: `${p.primer_nombre} ${p.segundo_nombre} ${p.primer_apellido} ${p.segundo_apellido}`,
      edad: isNaN(edad) ? "-" : edad.toString(),
      sexo: p.sexo,
      celular: p.celular,      
      procedencia: p.direccion,
      original: p,
    }
  }).filter((p: any) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||          
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
      title: "Total Donantes",
      value: pacientes.length.toLocaleString(),
      icon: <Users className="h-6 w-6" />,
      color: "primary",
      trend: "+12% este mes",
    },
    {
      title: "Nuevos este mes",
      value: "24",
      icon: <UserPlus className="h-6 w-6" />,
      color: "success",
      trend: "+3 vs ayer",
    },
    {
      title: "Activos",
      value: paginatedPacientes.length.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "secondary",
      trend: "Filtrados",
    },
    {
      title: "Promedio Edad",
      value: promedioEdad.toString(),
      icon: <Users className="h-6 w-6" />,
      color: "warning",
      trend: "años",
    },
  ]

  const actions = (
    <Modal open={openDialog} onOpenChange={setOpenDialog}>
      <ModalTrigger asChild>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
          <Plus className="h-4 w-4" />
          Nuevo Donante
        </Button>
      </ModalTrigger>
      <ModalContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{isEditing ? "Editar Donante" : "Nuevo Donante"}</ModalTitle>
          <ModalDescription>
            {isEditing ? "Modifica la información del donante" : "Ingresa los datos del nuevo donante"}
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
            <Label htmlFor="primer_nombre">Primer Nombre *</Label>
            <Input
              id="primer_nombre"
              value={formData.primer_nombre}
              onChange={(e) => setFormData({ ...formData, primer_nombre: e.target.value })}
              className={errors.primer_nombre ? "border-red-500" : ""}
            />
            {errors.primer_nombre && <p className="text-sm text-red-500">{errors.primer_nombre}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="segundo_nombre">Segundo Nombre *</Label>
            <Input
              id="segundo_nombre"
              value={formData.segundo_nombre}
              onChange={(e) => setFormData({ ...formData, segundo_nombre: e.target.value })}
              className={errors.segundo_nombre ? "border-red-500" : ""}
            />
            {errors.segundo_nombre && <p className="text-sm text-red-500">{errors.segundo_nombre}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="primer_apellido">Primer Apellido *</Label>
            <Input
              id="primer_apellido"
              value={formData.primer_apellido}
              onChange={(e) => setFormData({ ...formData, primer_apellido: e.target.value })}
              className={errors.primer_apellido ? "border-red-500" : ""}
            />
            {errors.primer_apellido && <p className="text-sm text-red-500">{errors.primer_apellido}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="segundo_nombre">Segundo Apellido *</Label>
            <Input
              id="segundo_apellido"
              value={formData.segundo_apellido}
              onChange={(e) => setFormData({ ...formData, segundo_apellido: e.target.value })}
              className={errors.segundo_apellido ? "border-red-500" : ""}
            />
            {errors.segundo_apellido && <p className="text-sm text-red-500">{errors.segundo_apellido}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad">Fecha Nacimiento *</Label>
            <Input
                id="edad"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => {
                  const nuevaFecha = e.target.value

                  // Calcula edad a partir de la fecha
                  let edadCalculada = ""
                  if (nuevaFecha) {
                    const nacimiento = new Date(nuevaFecha)
                    const hoy = new Date()
                    let edad = hoy.getFullYear() - nacimiento.getFullYear()
                    const m = hoy.getMonth() - nacimiento.getMonth()
                    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
                      edad--
                    }
                    edadCalculada = edad.toString()
                  }

                  setFormData({
                    ...formData,
                    fecha_nacimiento: nuevaFecha,
                    edad: edadCalculada,
                  })
                }}
                className={errors.fecha_nacimiento ? "border-red-500" : ""}
              />
            {errors.fecha_nacimiento && <p className="text-sm text-red-500">{errors.fecha_nacimiento}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edad">Edad </Label>
            <Input
              id="edad"
              type="number"
              readOnly
              value={formData.edad}                            
            />            
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
            <Combobox 
            items={catalogoOcupaciones.map(o => ({
              value: String(o.value),
              label: String(o.label),
              }))}
            key="ocupacion"
            error={errors.ocupacion}
            value={formData.ocupacion}
            onChange={(val) =>{
              console.log("Ocupacion seleccionado:", val) // ✅ Debe imprimirse
              setFormData({ ...formData, ocupacion: val })}
             }
            placeholder="Seleccionar ocupacion"
            />            
            {errors.ocupacion && <p className="text-sm text-red-500">{errors.ocupacion}</p>}
          </div>
        

          <div className="space-y-2  md:col-span-2">
            <Label htmlFor="direccion">Direccion</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className={errors.direccion ? "border-red-500" : ""}
            />
            {errors.direccion && <p className="text-sm text-red-500">{errors.direccion}</p>}
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
      title="Gestión de Donantes"
      description="Administra la información de los donantes del laboratorio"
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
        emptyMessage="No se encontraron donantes que coincidan con tu búsqueda"
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
  )
}
