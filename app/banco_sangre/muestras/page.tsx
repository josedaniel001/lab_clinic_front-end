"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Droplet, Plus, Edit, Eye,AlertTriangle } from "lucide-react"
//import { useNotification } from "@/hooks/useNotification"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/Modal"

export default function BancoSangrePage() {  
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [muestras, setMuestras] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedMuestra, setSelectedMuestra] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
   const [formData, setFormData] = useState({    
    correlativo: "",
    tipo_unidad: "",
    tipo_sangre: "",
    volumen_ml: 200,
    fecha_extraccion: "",
    fecha_caducidad: "",    
    estado: "Disponible" as "Disponible" | "Reservado" | "Vencido",
  })
  const [errors, setErrors] = useState({
    correlativo: "",
    tipo_unidad: "",
    tipo_sangre: "",
    volumen_ml: "",
    fecha_extraccion: "",
    fecha_caducidad: "",   
  })
  const dataMock = [
    {
      id: "1",
      correlativo: "54365",
      tipo_unidad: "Plasma",
      tipo_sangre: "A-",
      volumen_ml: 300,
      fecha_extraccion: "2024-12-11",
      fecha_caducidad: "2025-12-11",
      estado: "Disponible",
    },
    {
      id: "2",
      correlativo: "98765",
      tipo_unidad: "Paquete Globular",
      tipo_sangre: "O+",
      volumen_ml: 450,
      fecha_extraccion: "2024-01-15",
      fecha_caducidad: "2024-07-15",
      estado: "Disponible",
    },
    {
      id: "3",
      correlativo: "23456",
      tipo_unidad: "Plaquetas",
      tipo_sangre: "B+",
      volumen_ml: 250,
      fecha_extraccion: "2024-03-01",
      fecha_caducidad: "2025-07-13",
      estado: "Reservado",
    },
    {
      id: "4",
      correlativo: "34567",
      tipo_unidad: "Crio Precipitado",
      tipo_sangre: "AB-",
      volumen_ml: 200,
      fecha_extraccion: "2024-02-10",
      fecha_caducidad: "2024-08-10",
      estado: "Disponible",
    },
  ]

  useEffect(() => {
    fetchMuestras()
  }, [])

        const muestrasVencidas = muestras.filter((m) => {
        const hoy = new Date()
        const caducidad = new Date(m.fecha_caducidad)
        return caducidad < hoy
        })

        const muestrasPorVencer = muestras.filter((m) => {
        const hoy = new Date()
        const caducidad = new Date(m.fecha_caducidad)
        const diffTime = caducidad.getTime() - hoy.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 12
        })

  const fetchMuestras = async (showLoading = true) => {
    // Aquí simulas tu API
    const processed = dataMock.map((m) => {
      const today = new Date()
      const caducidad = new Date(m.fecha_caducidad)
      const diffTime = caducidad.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return { ...m, dias_vigencia: diffDays }
    })

        

    setMuestras(processed)
    setIsRefreshing(false)
  }

   const getStockStatus = (estado: String) => {
    switch(estado){
    case "Disponible":    
    return "success"
    case "Reservado":    
    return "warning"
    default:
    return "secondary"
    }
  }
  

  
  const filteredMuestras = muestras.filter(
    (m) =>
      m.tipo_unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tipo_sangre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.correlativo.includes(searchTerm),
  )

  const stats = [
    {
      title: "Paquetes Globulares",
      value: muestras.filter((m) => m.tipo_unidad === "Paquete Globular").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "info",
      trend: "Disponibles",
    },
    {
      title: "Plasma",
      value: muestras.filter((m) => m.tipo_unidad === "Plasma").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "success",
      trend: "En stock",
    },
    {
      title: "Plaquetas",
      value: muestras.filter((m) => m.tipo_unidad === "Plaquetas").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "warning",
      trend: "Reservas",
    },
    {
      title: "Crio Precipitado",
      value: muestras.filter((m) => m.tipo_unidad === "Crio Precipitado").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "secondary",
      trend: "En stock",
    },
  ]

  const columns = [
    { key: "correlativo", label: "Correlativo" },
    { key: "tipo_unidad", label: "Tipo Unidad" },
    { key: "tipo_sangre", label: "Tipo Sangre" },
    { key: "volumen_ml", label: "Volumen (mL)" },
    { key: "fecha_extraccion", label: "F. Extracción" },
    { key: "fecha_caducidad", label: "F. Caducidad" },
    {
      key: "dias_vigencia",
      label: "D. Vigencia",
      render: (value: number) => (
        <span className={value < 0 ? "text-red-600 font-semibold" : ""}>
          {value} días
        </span>
      ),
    },
    { key: "estado", label: "Estado",
      render: (value: string) => (
        <StatusBadge status={getStockStatus(value)} label={`${value}`} />
      ),

     },
  ]

  const TIPO_EXAMEN = [
    {value:"PGE",label:"PAQUETES GLOBULARES"},
    {value:"PLS",label:"PLASMA"},
    {value:"PLQ",label:"PLAQUETAS"},
    {value:"CRP",label:"CRIO PRECIPITADOS"},]

  const TIPOS_SANGRE = [
  { value: "A+", label: "A Positivo (A+)" },
  { value: "A-", label: "A Negativo (A-)" },
  { value: "B+", label: "B Positivo (B+)" },
  { value: "B-", label: "B Negativo (B-)" },
  { value: "AB+", label: "AB Positivo (AB+)" },
  { value: "AB-", label: "AB Negativo (AB-)" },
  { value: "O+", label: "O Positivo (O+)" },
  { value: "O-", label: "O Negativo (O-)" },
]

  const tableActions = (row: any) => (
    <>
      <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
        <Edit className="h-4 w-4" />
      </Button>
    </>
  )

  const handleView = (row: any) => {
    setSelectedMuestra(row)
    setOpenDialog(true)
  }
   const handleEdit = (row: any) => {
    handleOpenDialog(row)
    setOpenDialog(true)    
  }
  
  const handleRefresh = () => {
    fetchMuestras(false)
  }
   const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedMuestra(null)
  }

    const handleOpenDialog = (muestra: any | null = null) => {
    if (muestra) {      
      setFormData({        
       correlativo: muestra.correlativo,
        tipo_unidad: muestra.tipo_unidad,
        tipo_sangre: muestra.tipo_sangre,
        volumen_ml: muestra.volumen_ml,
        fecha_extraccion: muestra.fecha_extraccion,
        fecha_caducidad: muestra.fecha_caducidad,    
        estado: muestra.estado, 
      })
      setIsEditing(true)
    } else {
      setFormData({
        id: "",
        correlativo: "",
        tipo_unidad: "",
        tipo_sangre: "",
        volumen_ml: 0,
        fecha_extraccion: "",
        fecha_caducidad: "",    
        estado: "Disponible", 
      })
      setIsEditing(false)      
    }
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    /*  if (!validateForm()) return
  
      showLoader()
      try {
        const { id, ...restFormData } = formData
        const examenData: Examen = {
          ...restFormData,
          valores_referencia: JSON.stringify(valoresReferencia),
          precio: Number(formData.precio) || 0,
        }
        console.log("Data Examen: "+JSON.stringify(examenData))
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
      }*/
    }
  return (
  <>
    <PageLayout
      title="Banco de Sangre"
      description="Administra las unidades de sangre y su disponibilidad"
      icon={<Droplet className="h-8 w-8 text-blue-600" />}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={fetchMuestras}
      isRefreshing={isRefreshing}
      stats={stats}
      actions={
        <Button className="gap-2" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4" /> Agregar Unidad
        </Button>
      }
    >
      {muestrasPorVencer.length > 0 && (
        <div className="flex items-center gap-3 p-4 mb-4 border border-yellow-400 bg-yellow-50 rounded">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-800">
              Aviso: {muestrasPorVencer.length} muestras por vencer en los próximos días
            </p>
            <p className="text-yellow-700">
              Verificar:{" "}
              {muestrasPorVencer.map((m) => m.correlativo).join(", ")}
            </p>
          </div>
        </div>
      )}
       {muestrasVencidas.length > 0 && (
        <div className="flex items-center gap-3 p-4 mb-4 border border-orange-400 bg-orange-50 rounded">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          <div className="text-sm">
            <p className="font-semibold text-orange-800">
              ¡Atención! Hay {muestrasVencidas.length} muestras vencidas
            </p>
            <p className="text-yellow-700">
              Se recomienda revisar:{" "}
              {muestrasVencidas.map((m) => m.correlativo).join(", ")}
            </p>
          </div>
        </div>
      )}
        <DataTable
          data={filteredMuestras}
          columns={columns}
          actions={tableActions}
          emptyMessage="No hay unidades registradas"
          emptyIcon={<Droplet className="h-12 w-12 text-gray-400" />}
        />
      </PageLayout>

          {/* Modal Ver Detalles */}
      <Modal open={openDialog} onOpenChange={setOpenDialog}>
        <ModalContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Editar Registro de Muestra</ModalTitle>
            <ModalDescription>Información completa de la muestra seleccionada</ModalDescription>
          </ModalHeader>

          {selectedMuestra && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Código</Label>
                  <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                    {selectedMuestra.correlativo}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <StatusBadge
                      status={getStockStatus(selectedMuestra.estado)}
                      label={selectedMuestra.estado}
                      variant={getStockStatus(selectedMuestra.estado)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg font-medium text-gray-500">Tipo de Unidad</Label>
                <p className="mt-1 text-md font-medium">{selectedMuestra.tipo_unidad}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-semibold text-green-800">Tipo de Sangre</Label>
                  <p className="mt-1 text-md text-green-600 font-bold">{selectedMuestra.tipo_sangre}</p>
                </div>
                <div>
                  <Label className="text-lg font-medium text-blue-800">Volumen de Muestra</Label>
                  <p className="mt-1 text-md font-semibold text-blue-400">{selectedMuestra.volumen_ml} ml</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Fecha Caducidad</Label>
                <p className="mt-1">{selectedMuestra.fecha_caducidad}</p>
              </div>                           
            </div>
          )}

          <ModalFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>      

     <Modal open={openDialog} onOpenChange={setOpenDialog}>
      <ModalContent className="sm:max-w-3xl max-h-[110vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>{isEditing ? "Editar Muestra" : "Nueva Muestra"}</ModalTitle>
          <ModalDescription>
            {isEditing ? "Modifica la información de la muestra seleccionada" : "Ingresa los datos de la nueva muestra"}
          </ModalDescription>
        </ModalHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="correlativo">Correlativo Para Muestra *</Label>
            <Input
              id="correlativo"
              value={formData.correlativo}
              onChange={(e) => setFormData({ ...formData, correlativo: e.target.value })}
              className={errors.correlativo ? "border-red-500" : ""}
              placeholder="Ej: PLM001"
            />
            {errors.correlativo && <p className="text-sm text-red-500">{errors.correlativo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_unidad">Tipo de Unidad *</Label>
             <Combobox
                      items={TIPO_EXAMEN}
                      value={formData.tipo_unidad}
                      onChange={(e) => setFormData({ ...formData, tipo_unidad: e })}
                      placeholder="Tipo de Unidad"
              />
            {errors.tipo_unidad && <p className="text-sm text-red-500">{errors.tipo_unidad}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_sangre">Tipo de Sangre *</Label>
             <Combobox
                      items={TIPOS_SANGRE}
                      value={formData.tipo_sangre}
                      onChange={(e) => setFormData({ ...formData, tipo_sangre: e })}
                      placeholder="Tipo de Unidad"
              />
            {errors.tipo_sangre && <p className="text-sm text-red-500">{errors.tipo_sangre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volumen_ml">Volumen ML</Label>
            <Input
              id="volumen_ml"
              type="number"
              value={formData.volumen_ml}
              onChange={(e) => setFormData({ ...formData, volumen_ml: e.target.value })}
              className={errors.volumen_ml ? "border-red-500" : ""}
              placeholder="0"
            />
            {errors.volumen_ml && <p className="text-sm text-red-500">{errors.volumen_ml}</p>}
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

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Unidad</DialogTitle>
          </DialogHeader>
          {selectedMuestra && (
            <div className="space-y-4">
              <Label>Correlativo: {selectedMuestra.correlativo}</Label>
              <Label>Tipo Unidad: {selectedMuestra.tipo_unidad}</Label>
              <Label>Tipo Sangre: {selectedMuestra.tipo_sangre}</Label>
              <Label>Volumen: {selectedMuestra.volumen_ml} mL</Label>
              <Label>Fecha Extracción: {selectedMuestra.fecha_extraccion}</Label>
              <Label>Fecha Caducidad: {selectedMuestra.fecha_caducidad}</Label>
              <Label>
                Días Vigencia:{" "}
                <span className={selectedMuestra.dias_vigencia < 0 ? "text-red-600 font-semibold" : ""}>
                  {selectedMuestra.dias_vigencia} días
                </span>
              </Label>
              <Label>Estado: {selectedMuestra.estado}</Label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
