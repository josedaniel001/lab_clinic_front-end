"use client"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Droplet, Plus, Eye, Edit, AlertTriangle, Info } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { SerologiasInput } from "@/components/banco_sangre/serologiasInput"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal"
import { muestraAPI, loteAPI, donantesAPI } from "@/api/bancoSangreAPI"

export default function BancoSangrePage() {
    const { showLoader, hideLoader } = useLoader()
  const [muestras, setMuestras] = useState<any[]>([])
  const [donantes, setDonantes] = useState<any[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
   const [openViewDialog, setOpenViewDialog] = useState(false)
  const [selectedMuestra, setSelectedMuestra] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
   const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(5)
  const { showNotification } = useNotification()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [formData, setFormData] = useState<any[]>([
    {
      tipo_unidad: "",
      tipo_sangre: "",
      volumen_ml: 0,
      fecha_extraccion: "",
      fecha_caducidad: "",
      localizacion: "",
      condiciones_almacenamiento: "",
      serologias: [],
      observaciones: "",      
      donante_id: null,
      lote_id: null,
      estado: "DISPONIBLE",
    },
  ])

  const TIPO_EXAMEN = [
     {value:"PAQUETE_GLOBULAR",label:"PAQUETES GLOBULARES"},
    {value:"PLASMA",label:"PLASMA"},
    {value:"PLAQUETAS",label:"PLAQUETAS"},
    {value:"CRIO_PRECIPITADO",label:"CRIO PRECIPITADOS"},
  ]
  const TIPOS_SANGRE = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ]

  const DONANTES_ITEMS = donantes.map((d) => ({
    value: d.id,
    label: `${d.primer_nombre} ${d.primer_apellido} (${d.cui})`,
  }))
  const LOTES_ITEMS = lotes.map((l) => ({
    value: l.id,
    label: `Lote: ${l.codigo}`,
  }))

  useEffect(() => {
    fetchMuestras()
    fetchDonantes()
    fetchLotes()
  }, [currentPage])

  const fetchMuestras = async (showLoading = true) => {
      if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }
    try {
    const data = await muestraAPI.getMuestrasUnidades(currentPage, limit)
    const processed = Array.isArray(data?.results)
      ? data.results.map((m) => {
          const hoy = new Date()
          const caducidad = new Date(m.fecha_caducidad)
          const diffDays = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
          return { ...m, dias_vigencia: diffDays }
        })
      : data.map((m) => {
          const hoy = new Date()
          const caducidad = new Date(m.fecha_caducidad)
          const diffDays = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
          return { ...m, dias_vigencia: diffDays }
        })
    setMuestras(processed)
    setIsRefreshing(false)
    handleCloseDialog()
  }catch (error) {
      showNotification("Error al guardar paciente", "error")
    } finally {
      hideLoader()
    }
  }

  const fetchDonantes = async () => {
    const data = await donantesAPI.geDonantes()
    setDonantes(data)
  }

  const fetchLotes = async () => {
    const data = await loteAPI.geLotes()
    setLotes(data)
  }

  const muestrasVencidas = muestras.filter((m) => { const hoy = new Date()
           const caducidad = new Date(m.fecha_caducidad)
           return caducidad < hoy
        })
  const muestrasPorVencer = muestras.filter((m) => {
    const diff = new Date(m.fecha_caducidad).getTime() - new Date().getTime()
    return diff >= 0 && diff <= 12 * 24 * 60 * 60 * 1000
  })

    const filteredMuestras = muestras.filter(
    (m) =>
      m.tipo_unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tipo_sangre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.correlativo.includes(searchTerm),
  )
   const stats = [
    {
      title: "Paquetes Globulares",
      value: muestras.filter((m) => m.tipo_unidad === "PAQUETE_GLOBULAR").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "info",
      trend: "Disponibles",
    },
    {
      title: "Plasma",
      value: muestras.filter((m) => m.tipo_unidad === "PLASMA").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "success",
      trend: "En stock",
    },
    {
      title: "Plaquetas",
      value: muestras.filter((m) => m.tipo_unidad === "PLAQUETAS").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "warning",
      trend: "Reservas",
    },
    {
      title: "Crio Precipitado",
      value: muestras.filter((m) => m.tipo_unidad === "CRIO_PRECIPITADO").length,
      icon: <Droplet className="h-6 w-6" />,
      color: "secondary",
      trend: "En stock",
    },
  ]
  const getStockStatus = (estado: string) => {
    if (estado === "DISPONIBLE") return "success"
    if (estado === "RESERVADO") return "warning"
    return "secondary"
  }

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
     {
      key: "observaciones",
      label: "Obs.",
      render: (_: any, row: any) =>
        row.observaciones ? (
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-600 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{row.observaciones}</TooltipContent>
          </Tooltip>
        ) : null,
    },
  ]

  const handleOpenDialog = (muestra = null) => {
    if(muestra){
      console.log("Datos de la muestra:"+ JSON.stringify(muestra))
      setFormData([
      {
      tipo_unidad: muestra.tipo_unidad,
        tipo_sangre: muestra.tipo_sangre,
        volumen_ml: muestra.volumen_ml,
        fecha_extraccion: muestra.fecha_extraccion,
        fecha_caducidad: muestra.fecha_caducidad,
        localizacion: muestra.localizacion,
        condiciones_almacenamiento: muestra.condiciones_almacenamiento,
        serologias: muestra.serologias
        ? Object.entries(muestra.serologias).map(([key, value]) => ({
            key,
            value,
          }))
        : [],
        dias_vigencia:muestra.dias_vigencia,
        observaciones: muestra.observaciones,
        donante_id: muestra.donante?  muestra.donante.id:null ,
        lote_id: muestra.lote ? muestra.lote.id:null,
        estado: muestra.estado,
      },
    ])

    }else{
      setIsEditing(false)
      setFormData([
      {
        tipo_unidad: "",
        tipo_sangre: "",
        volumen_ml: 0,
        fecha_extraccion: "",
        fecha_caducidad: "",
        localizacion: "",
        condiciones_almacenamiento: "",
        serologias: [],
        observaciones: "",
        donante_id: null,
        lote_id: null,
        estado: "DISPONIBLE",
      },
    ])
    
    }

    
    setOpenDialog(true)
  }

  const handleSubmit = async () => {

     for (const unidad of formData) {
      if (unidad.fecha_extraccion && unidad.fecha_caducidad) {
        const fechaExtraccion = new Date(unidad.fecha_extraccion)
        const fechaCaducidad = new Date(unidad.fecha_caducidad)

        if (fechaExtraccion > fechaCaducidad) {
          showNotification(`Error: La fecha de extracción (${unidad.fecha_extraccion}) no puede ser mayor que la fecha de caducidad (${unidad.fecha_caducidad}).`, error)                      
          return // Detiene el envío
        }
      }
    }
    const payload = formData.map((u) => {
      const base = {
        tipo_unidad: u.tipo_unidad,
        tipo_sangre: u.tipo_sangre,
        volumen_ml: Number(u.volumen_ml),
        fecha_extraccion: u.fecha_extraccion,
        fecha_caducidad: u.fecha_caducidad,
        localizacion: u.localizacion,
        condiciones_almacenamiento: u.condiciones_almacenamiento,
        serologias: u.serologias.reduce((acc, cur) => {
          if (cur.key) acc[cur.key] = cur.value
          return acc
        }, {}),
        observaciones: u.observaciones,
        estado: u.estado,
      }
      if (u.donante_id) base.donante_id = u.donante_id
      if (u.lote_id) base.lote_id = u.lote_id
      return base
    })
    try {
      if (isEditing) {
        // ✅ Si es edición: solo debe haber una unidad      
        const unidadId = selectedMuestra?.id
        if (!unidadId) {
          showNotification("Error: No se encontró el ID de la unidad a actualizar.", "error")
          return
        }
        await muestraAPI.updateUnidades(unidadId, payload[0]) // Solo uno
        showNotification("Unidad actualizada correctamente", "success")
      } else {
        // ✅ Si es creación: puede ser uno o varios
        await muestraAPI.createUnidades(payload.length === 1 ? payload[0] : payload)
        showNotification("Unidades registradas correctamente", "success")
      }  
      setIsEditing(false)
      handleRefresh()
      setSelectedMuestra(null)
      setOpenDialog(false)
    }catch (error) {
      console.error(error)
      showNotification("Error al guardar la muestra", "error")
    }
  }
   const handleView = (row: any) => {
    setSelectedMuestra(row)
    setOpenViewDialog(true)
  }
   const handleEdit = (row: any) => {
    setIsEditing(true)    
    setSelectedMuestra(row)
    handleOpenDialog(row)    
    setOpenDialog(true)    
  }
  
  const handleRefresh = () => {
    showNotification("Refrescando datos", "info")
    fetchMuestras(false)
    fetchLotes()
    fetchDonantes()
  }
   const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedMuestra(null)
  }

  return (
    <>
    <TooltipProvider>
      <PageLayout
        title="Banco de Sangre"
        description="Administra las unidades de sangre y su disponibilidad"
        icon={<Droplet className="h-8 w-8 text-blue-600" />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
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


        <Modal open={openDialog} onOpenChange={setOpenDialog}>
          <ModalContent className="sm:max-w-4xl overflow-y-auto max-h-[90vh]">
            <ModalHeader>
              <ModalTitle>{isEditing ? "Edicion de la Unidad" : "Registrar Unidades"}</ModalTitle>
              <ModalDescription>
                 {isEditing ? "Modifica la información de la Unidad" : "Ingresa los datos de la nueva unidad"}
                </ModalDescription>
            </ModalHeader>

            {formData.map((unidad, index) => (
              <div key={index} className="border-b pb-4 mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo Unidad</Label>
                    <Combobox
                      items={TIPO_EXAMEN}
                      value={unidad.tipo_unidad}
                      onChange={(val) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].tipo_unidad = val
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Tipo Sangre</Label>
                    <Combobox
                      items={TIPOS_SANGRE}
                      value={unidad.tipo_sangre}
                      onChange={(val) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].tipo_sangre = val
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Volumen (ml)</Label>
                    <Input
                      type="number"
                      value={unidad.volumen_ml}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].volumen_ml = parseInt(e.target.value)
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fecha Extracción</Label>
                    <Input
                      type="date"
                      value={unidad.fecha_extraccion}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].fecha_extraccion = e.target.value
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fecha Caducidad</Label>
                    <Input
                      type="date"
                      value={unidad.fecha_caducidad}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].fecha_caducidad = e.target.value
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Localización</Label>
                    <Input
                      value={unidad.localizacion}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].localizacion = e.target.value
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Condiciones Almacenamiento</Label>
                    <Input
                      value={unidad.condiciones_almacenamiento}
                      onChange={(e) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].condiciones_almacenamiento = e.target.value
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Donante</Label>
                    <Combobox
                      items={DONANTES_ITEMS}
                      value={unidad.donante_id}
                      onChange={(val) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].donante_id = val || null
                          return copy
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Lote</Label>
                    <Combobox
                      items={LOTES_ITEMS}
                      value={unidad.lote_id}
                      onChange={(val) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].lote_id = val || null
                          return copy
                        })
                      }
                    />
                  </div>
                  {isEditing &&(<div>
                    <Label>Dias de Vigencia</Label>
                    <Input                      
                      value={unidad.dias_vigencia}
                      readOnly
                      onChange={(e) =>
                        setFormData((prev) => {
                          const copy = [...prev]
                          copy[index].dias_vigencia = e.target.value
                          return copy
                        })
                      }
                    />
                  </div>
                  )}
                </div>
                <SerologiasInput
                  serologias={unidad.serologias}
                  setSerologias={(seros) =>
                    setFormData((prev) => {
                      const copy = [...prev]
                      copy[index].serologias = seros
                      return copy
                    })
                  }
                />
                <Input
                  value={unidad.observaciones}
                  onChange={(e) =>
                    setFormData((prev) => {
                      const copy = [...prev]
                      copy[index].observaciones = e.target.value
                      return copy
                    })
                  }
                  placeholder="Observaciones"
                />
              </div>
            ))}

           {!isEditing && (
            <Button
              variant="outline"
              onClick={() =>
                setFormData([
                  ...formData,
                  {
                    tipo_unidad: "",
                    tipo_sangre: "",
                    volumen_ml: 0,
                    fecha_extraccion: "",
                    fecha_caducidad: "",
                    localizacion: "",
                    condiciones_almacenamiento: "",
                    serologias: [],
                    observaciones: "",
                    donante_id: null,
                    lote_id: null,
                    estado: "DISPONIBLE",
                  },
                ])
              }
            >
              + Agregar Otra Unidad
            </Button>
            )}
            <ModalFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              {!isEditing ? (
              <Button onClick={() => handleSubmit()}>Guardar</Button>
              ): 
              (              
              <Button onClick={() => handleSubmit()}>Actualizar</Button>               
              )
              }
            </ModalFooter>
          </ModalContent>
        </Modal>
      </PageLayout>
      </TooltipProvider>

      <Modal open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <ModalContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Ver Registro de Muestra</ModalTitle>
            <ModalDescription>Información completa de la muestra seleccionada</ModalDescription>
          </ModalHeader>

          {selectedMuestra && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-md font-semibold text-green-800">Código</Label>
                  <p className="mt-1 font-mono  text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                    {selectedMuestra.correlativo}
                  </p>
                </div>
                <div>
                  <Label className="text-md font-semibold text-green-800">Estado</Label>
                  <div className="mt-1 px-2 py-1 rounded inline-block">
                    <StatusBadge
                      status={getStockStatus(selectedMuestra.estado)}
                      label={selectedMuestra.estado}
                      variant={getStockStatus(selectedMuestra.estado)}
                    />
                  </div>
                </div>
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-md font-semibold text-green-800">Tipo de Unidad</Label>
                <p className="mt-1 text-sm font-bold">{selectedMuestra.tipo_unidad}</p>
              </div>
              <div>
                  <Label className="text-md font-semibold text-green-800">Tipo de Sangre</Label>
                  <p className="mt-1 text-md font-bold">{selectedMuestra.tipo_sangre}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">                
                <div>
                  <Label className="text-md font-semibold text-green-800">Volumen de Muestra</Label>
                  <p className="mt-1 text-md font-bold ">{selectedMuestra.volumen_ml} ml</p>
                </div>
                <div>
                <Label className="text-md font-semibold text-green-800">Fecha Caducidad</Label>
                <p className="mt-1 font-bold">{selectedMuestra.fecha_caducidad}</p>
              </div>  
              <div>
                <Label className="text-md font-semibold text-green-800">Lote</Label>
                <p className="mt-1 font-bold">{selectedMuestra.lote ? selectedMuestra.lote.codigo : null}</p>
              </div> 
              <div>
                <Label className="text-md font-semibold text-green-800">Donante</Label>
                <p className="mt-1 font-bold">{selectedMuestra.donante ? `${selectedMuestra.donante.cui}-(${selectedMuestra.donante.primer_nombre} ${selectedMuestra.donante.primer_apellido})` : null}</p>
              </div>  
              </div>

              <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-md font-semibold text-green-800">Observaciones</Label>
                <p className="mt-1 text-md font-bold mb-4">{selectedMuestra.observaciones}</p>
              </div>
              </div> 
              <div className="grid grid-cols-2 gap-4 ">
              <div>
                <Label className="text-md font-semibold text-green-800">Localizacion de la Muestra</Label>
                <p className="mt-1 text-md font-bold">{selectedMuestra.localizacion}</p>
              </div>                                                
              <div>
                <Label className="text-md font-semibold text-green-800">Dias de Vigencia</Label>
                <p className="mt-1 text-md font-bold">{selectedMuestra.dias_vigencia}</p>
              </div>                                                  
              </div>
            </div>
          )}
          {selectedMuestra && selectedMuestra.serologias && Object.keys(selectedMuestra.serologias).length > 0 && Object.keys(selectedMuestra.serologias).length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                <Label className="ml-3 text-md font-semibold text-green-800">Serologías</Label>
                <div className="space-y-2">
                  {Object.entries(selectedMuestra.serologias).map(([key, value]) => (
                    <p key={key} className="text-md ml-3">
                      <span className="font-semibold">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              </div>
            )}

          <ModalFooter>
            <Button variant="outline" onClick={() => setOpenViewDialog(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>      
    </>
  )
}
