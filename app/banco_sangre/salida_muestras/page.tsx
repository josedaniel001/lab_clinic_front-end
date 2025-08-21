"use client"

import { useState, useEffect, useRef } from "react"
import { useLoader } from "@/hooks/useLoader"
import { PageLayout } from "@/components/layout/PageLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Droplets, Package, AlertTriangle, Calendar, Scan, FileText, TrendingUp, Barcode, RefreshCw, XCircle } from "lucide-react"
import { useNotification } from "@/hooks/useNotification"
import { UnidadCard } from "@/components/banco_sangre/unidadCard"
import { UnidadDetallesDialog } from "@/components/banco_sangre/unidadDetalle"
import { SalidaDialog } from "@/components/banco_sangre/salidaDialog"
import { AutorizacionDialog } from "@/components/banco_sangre/autorizacionDialog"
import { DetallesSalidaDialog } from "@/components/banco_sangre/detallesSalidaDialog"
import { QRScanner } from "@/components/banco_sangre/QRScanner"
import { QRGenerator } from "@/components/banco_sangre/QRGenerator"
import { CameraTest } from "@/components/dev/CameraTest"
import { APIStatusPanel } from "@/components/dev/APIStatusPanel"
import { muestraAPI, loteAPI, donantesAPI, salidaAPI } from "@/api/bancoSangreAPI"

export interface UnidadSangre {
  id: number
  condiciones_almacenamiento: string
  tipo_unidad: "CRIO_PRECIPITADO" | "PLAQUETAS" | "PLAQUETAS_GLOBULARES" | "PLASMA"
  correlativo: string
  volumen_ml: number
  creado:Date
  fecha_extraccion: string
  fecha_caducidad: string
  fecha_donacion: string
  fecha_validacion:string
  dias_vigencia: number
  donante:object
  observaciones: string
  responsable: string
  estado: "DISPONIBLE" | "TRANSFORMADA" | "DESCARTADA" | "VENCIDO"
  lote: object
  donante_id?: string
  grupo_sanguineo?: string
  serologias?: JSON
  tipo_sangre: string
  localizacion: string
}

export interface DetalleSalida {
  id: number
  fecha_inclusion: string
  unidad_correlativo: string
  unidad_tipo: string
  unidad_tipo_sangre: string
  unidad_volumen: number
  unidad_fecha_caducidad: string
  unidad_dias_vigencia: number
}

export interface ResumenUnidad {
  unidad__tipo_unidad: string
  cantidad: number
  volumen_total: number
}

export interface Salida {
  id: number
  correlativo: string
  receptor: string
  medico_solicitante: string
  fecha_salida: string
  estado: "PENDIENTE" | "AUTORIZADA" | "RECHAZADA" | "COMPLETADA"
  total_unidades: number
  tecnico_salida_nombre: string
  detalles: DetalleSalida[]
  resumen_unidades: ResumenUnidad[]
  // Campos opcionales que pueden venir en actualizaciones
  fecha_autorizacion?: string
  autorizado_por?: string
  motivo_rechazo?: string
  cedula_receptor?: string
  observaciones?: string
}

export default function BancoSangrePage() {
  const [unidades, setUnidades] = useState<UnidadSangre[]>([])
  const [registrosSalida, setRegistrosSalida] = useState<Salida[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { showLoader, hideLoader } = useLoader()
  const [codigoBarras, setCodigoBarras] = useState("")
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnidadSangre | null>(null)
  const [modalDetalles, setModalDetalles] = useState(false)
  const [modalSalida, setModalSalida] = useState(false)
  const [modalQRScanner, setModalQRScanner] = useState(false)
  const [modalAutorizacion, setModalAutorizacion] = useState(false)
  const [modalDetallesSalida, setModalDetallesSalida] = useState(false)
  const [salidaSeleccionada, setSalidaSeleccionada] = useState<Salida | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroEstadoSalida, setFiltroEstadoSalida] = useState<string>("todos")
  const [scanning, setScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("inventario")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { showNotification } = useNotification()
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPageSalidas, setCurrentPageSalidas] = useState(1)
  const [limit] = useState(10)
  const inputRef = useRef<HTMLInputElement>(null)

  const [formSalida, setFormSalida] = useState({
    receptor: "",
    cedula_receptor: "",
    medico_solicitante: "",
    observaciones: "",
    fecha_salida: "",
    tecnico_id: null as number | null,
    tecnico_nombre: "",
    unidades_seleccionadas: [] as UnidadSangre[],
  })

  // Datos de ejemplo comentados para evitar errores de tipos
  // const unidadesEjemplo: UnidadSangre[] = []

   const getTabStats = () => {
    
    const totales = unidades.length
    const disponibles = unidades.filter(u => u.estado === "DISPONIBLE").length
    const porVencer = unidades.filter(u => u.dias_vigencia <= 7).length
    const vencidas=  unidades.filter(u => u.dias_vigencia <= 0).length

    return [
          { title: "Total", value: totales, icon: <Droplets className="h-6 w-6" />, color:"secondary", trend: "" },
          { title: "Disponibles", value: disponibles,icon: <Package className="h-6 w-6" />, color:"success", trend: "" },
          { title: "Por vencer", value: porVencer, icon: <AlertTriangle className="h-6 w-6" />,color: "warning", trend: "" },
          { title: "Vencidas", value: vencidas,icon: <Calendar className="h-6 w-6" />,color:"error",  trend: "" },
        ]
  }

  useEffect(() => {
    fetchMuestras()
    fetchSalidas()
  }, [])


    const fetchMuestras = async (showLoading = true) => {
      if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }
    try {
    const data = await muestraAPI.getMuestrasUnidades(currentPage, limit)
   const processed: UnidadSangre[] = Array.isArray(data?.results)
        ? data.results.map((m: any) => {
            const hoy = new Date()
            const caducidad = new Date(m.fecha_caducidad)
            const diffDays = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
            return { ...m, dias_vigencia: diffDays }
            })
        : data.map((m: UnidadSangre) => {
            const hoy = new Date()
            const caducidad = new Date(m.fecha_caducidad)
            const diffDays = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
            return { ...m, dias_vigencia: diffDays }
            })
        setUnidades(processed)
        setIsRefreshing(false) 
        showNotification("Datos cargados correctamente", "secondary")   
  }catch (error) {
      showNotification("Error al cargar muestras", "error")
    } finally {
      hideLoader()
    }
  }

  const fetchSalidas = async () => {
    try {
      const data = await salidaAPI.getSalidas(currentPageSalidas, limit)
      const salidas: Salida[] = Array.isArray(data?.results) ? data.results : data
      console.log("Salidas cargadas:", salidas)
      setRegistrosSalida(salidas)
    } catch (error) {
      console.error("Error al cargar salidas:", error)
      showNotification("Error al cargar salidas", "error")
    }
  }

  const autorizarSalida = async (salidaId: number) => {
    try {
      showLoader()
      const data = {
        estado: "AUTORIZADA" as const,
        fecha_autorizacion: new Date().toISOString(),
        autorizado_por: "Usuario Actual" // Esto debería venir del contexto de autenticación
      }
      
      await salidaAPI.updateSalida(salidaId.toString(), data)
      
      // Actualizar estado local
      setRegistrosSalida(prev => 
        prev.map(salida => 
          salida.id === salidaId 
            ? { ...salida, ...data } as Salida
            : salida
        )
      )
      
      setModalAutorizacion(false)
      setSalidaSeleccionada(null)
      showNotification("Salida autorizada correctamente", "success")
      
    } catch (error: any) {
      console.error("Error al autorizar salida:", error)
      const errorMessage = error.response?.data?.message || error.message || "Error al autorizar la salida"
      showNotification(errorMessage, "error")
    } finally {
      hideLoader()
    }
  }

  const rechazarSalida = async (salidaId: number, motivo: string) => {
    try {
      showLoader()
      const data = {
        estado: "RECHAZADA" as const,
        motivo_rechazo: motivo,
        fecha_autorizacion: new Date().toISOString(),
        autorizado_por: "Usuario Actual"
      }
      
      await salidaAPI.updateSalida(salidaId.toString(), data)
      
      // Actualizar estado local
      setRegistrosSalida(prev => 
        prev.map(salida => 
          salida.id === salidaId 
            ? { ...salida, ...data } as Salida
            : salida
        )
      )
      
      setModalAutorizacion(false)
      setSalidaSeleccionada(null)
      showNotification("Salida rechazada correctamente", "success")
      
    } catch (error: any) {
      console.error("Error al rechazar salida:", error)
      const errorMessage = error.response?.data?.message || error.message || "Error al rechazar la salida"
      showNotification(errorMessage, "error")
    } finally {
      hideLoader()
    }
  }

  const completarSalida = async (salidaId: number) => {
    try {
      showLoader()
      const data = {
        estado: "COMPLETADA" as const
      }
      
      await salidaAPI.updateSalida(salidaId.toString(), data)
      
      // Actualizar estado local
      setRegistrosSalida(prev => 
        prev.map(salida => 
          salida.id === salidaId 
            ? { ...salida, ...data } as Salida
            : salida
        )
      )
      
      showNotification("Salida completada correctamente", "success")
      
    } catch (error: any) {
      console.error("Error al completar salida:", error)
      const errorMessage = error.response?.data?.message || error.message || "Error al completar la salida"
      showNotification(errorMessage, "error")
    } finally {
      hideLoader()
    }
  }
  const unidadesFiltradas = unidades.filter((unidad) => {
    const matchSearch =
      unidad.correlativo.toLowerCase().includes(searchTerm.toLowerCase()) ||      
      unidad.tipo_unidad.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === "todos" || unidad.tipo_unidad === filtroTipo
    const matchEstado = filtroEstado === "todos" || unidad.estado === filtroEstado
    return matchSearch && matchTipo && matchEstado
  })

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "DISPONIBLE": return "text-green-600 bg-green-100"
      case "VENCIDO": return "text-red-600 bg-red-100"
      case "TRANSFORMADA": return "text-gray-600 bg-purple-100"
      case "DESCARTADA": return "text-yellow-600 bg-yellow-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getVencimientoColor = (dias: number) => {
    if (dias <= 0) return "text-red-600"
    if (dias <= 7) return "text-orange-600"
    if (dias <= 30) return "text-yellow-600"
    return "text-green-600"
  }

  const getEstadoSalidaColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE": return "text-yellow-600 bg-yellow-100"
      case "AUTORIZADA": return "text-green-600 bg-green-100"
      case "RECHAZADA": return "text-red-600 bg-red-100"
      case "COMPLETADA": return "text-blue-600 bg-blue-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const salidasFiltradas = registrosSalida.filter((salida) => {
    const matchSearch =
      salida.receptor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salida.medico_solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (salida.cedula_receptor && salida.cedula_receptor.includes(searchTerm))
    const matchEstado = filtroEstadoSalida === "todos" || salida.estado === filtroEstadoSalida
    return matchSearch && matchEstado
  })

  const iniciarEscaneo = () => {
    setModalQRScanner(true)
  }

  const handleQRScan = (result: string) => {
    console.log("QR escaneado:", result)
    setCodigoBarras(result)
    showNotification("Código QR escaneado correctamente", "success")
    
    // Buscar automáticamente la unidad después del escaneo
    setTimeout(() => {
      buscarPorCodigo()
    }, 500)
  }

  const buscarPorCodigo = () => {
    const codigo = codigoBarras.trim()
    if (!codigo) {
      showNotification("Ingrese un código válido", "error")
      return
    }

    const unidad = unidades.find((u) => u.correlativo === codigo)
    if (unidad) {
      setUnidadSeleccionada(unidad)
      setModalDetalles(true)
      
      // Si la unidad está disponible, preguntar si quiere agregarla a la salida
      if (unidad.estado === "DISPONIBLE") {
        showNotification(`Unidad ${codigo} encontrada - Disponible para salida`, "success")
      } else {
        showNotification(`Unidad ${codigo} encontrada - Estado: ${unidad.estado}`, "warning")
      }
    } else {
      showNotification(`Unidad con código ${codigo} no encontrada`, "error")
    }
  }

  const agregarUnidadSalida = (unidad: UnidadSangre) => {
    if (unidad.estado !== "DISPONIBLE") {
      showNotification(`Unidad ${unidad.correlativo} no está disponible (Estado: ${unidad.estado})`, "error")
      return
    }
    
    if (formSalida.unidades_seleccionadas.some((u) => u.id === unidad.id)) {
      showNotification(`Unidad ${unidad.correlativo} ya está en la lista de salida`, "warning")
      return
    }
    
    setFormSalida({ 
      ...formSalida, 
      unidades_seleccionadas: [...formSalida.unidades_seleccionadas, unidad] 
    })
    showNotification(`Unidad ${unidad.correlativo} agregada a la salida`, "success")
  }

  const removerUnidadSalida = (unidadId: number) => {
    setFormSalida({
      ...formSalida,
      unidades_seleccionadas: formSalida.unidades_seleccionadas.filter(u => u.id !== unidadId)
    })
    showNotification("Unidad removida de la salida", "secondary")
  }

  const handleGenerateQR = (text: string) => {
    // Abrir una nueva ventana con un generador de QR online
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
    window.open(qrUrl, '_blank')
    showNotification("Generando código QR...", "secondary")
  }

  const procesarSalida = async () => {
    if (!formSalida.receptor || !formSalida.cedula_receptor || !formSalida.medico_solicitante) {
      return showNotification("Campos requeridos: receptor, cédula y médico solicitante", "error")
    }
    if (formSalida.unidades_seleccionadas.length === 0) {
      return showNotification("Seleccione al menos una unidad", "error")
    }
    if (!formSalida.fecha_salida) {
      return showNotification("Fecha de salida es requerida", "error")
    }
    
    try {
      showLoader()
      
      const salidaData = {
        receptor: formSalida.receptor,
        cedula_receptor: formSalida.cedula_receptor,
        medico_solicitante: formSalida.medico_solicitante,
        observaciones: formSalida.observaciones,
        fecha_salida: formSalida.fecha_salida,
        tecnico_id: formSalida.tecnico_id,
        tecnico_nombre: formSalida.tecnico_nombre,
        unidades_ids: formSalida.unidades_seleccionadas.map(u => u.id), // Cambiado a unidades_ids para coincidir con el endpoint
        cantidad_unidades: formSalida.unidades_seleccionadas.length,
      }
      
      console.log("Enviando datos de salida:", salidaData)
      
      // Enviar a la API
      const response = await salidaAPI.createSalida(salidaData)
      console.log("Respuesta de la API:", response)
      
      // Actualizar estado local
      const actualizadas = unidades.map((u) =>
        formSalida.unidades_seleccionadas.some((x) => x.id === u.id)
          ? { ...u, estado: "TRANSFORMADA" as const } : u
      )
      setUnidades(actualizadas)
      
      // Limpiar formulario
      setFormSalida({ 
        receptor: "", 
        cedula_receptor: "", 
        medico_solicitante: "", 
        observaciones: "", 
        fecha_salida: "",
        tecnico_id: null,
        tecnico_nombre: "",
        unidades_seleccionadas: [] 
      })
      
      // Limpiar código de barras
      setCodigoBarras("")
      
      setModalSalida(false)
      showNotification("Salida procesada correctamente", "success")
      
      // Recargar la lista de salidas
      fetchSalidas()
      
    } catch (error: any) {
      console.error("Error al procesar salida:", error)
      const errorMessage = error.response?.data?.message || error.message || "Error al procesar la salida"
      showNotification(errorMessage, "error")
    } finally {
      hideLoader()
    }
  }

  return (
    <>
      <PageLayout
        title="Banco de Sangre"
        description="Gestión de unidades y salidas"
        icon={<Droplets className="h-8 w-8 text-red-600" />}
        searchValue={searchTerm}
        onRefresh={fetchMuestras}
        isRefreshing={isRefreshing}
        onSearchChange={setSearchTerm}
        stats={getTabStats()}
        actions={
            
          <Button onClick={() => setModalSalida(true)} className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Agregar Salida
          </Button>
        }
      >  
                
                           

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventario" className="data-[state=active]:bg-blue-200 data-[state=active]:text-green-900 px-4 py-2 rounded-md ">Inventario</TabsTrigger>
            <TabsTrigger value="scanner" className="data-[state=active]:bg-blue-200 data-[state=active]:text-green-900 px-4 py-2 rounded-md ">Scanner</TabsTrigger>
            <TabsTrigger value="salidas" className="data-[state=active]:bg-blue-200 data-[state=active]:text-green-900 px-4 py-2 rounded-md ">Salidas</TabsTrigger>            
          </TabsList>

          <TabsContent value="inventario" className="mt-6">
            <div className="flex space-x-4 mb-4">
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="border px-3 py-2 rounded">
                <option value="todos">Todos</option>
                <option value="PLASMA">Plasma</option>
                <option value="PLAQUETAS">Plaquetas</option>
                <option value="PAQUETE_GLOBULAR">Paquetes Globulares</option>
                <option value="CRIO_PRECIPITADO">Crio Precipitado</option>
              </select>
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="border px-3 py-2 rounded">
                <option value="todos">Todos</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="VENCIDO">Vencida</option>
                <option value="TRANSFORMADA">Transformada</option>
                <option value="DESCARTADA">Descartada</option>
                <option value="RESERVADA">Reservada</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unidadesFiltradas.map((unidad) => (
                <UnidadCard
                  key={unidad.id}
                  unidad={unidad}
                  onView={(u) => { setUnidadSeleccionada(u); setModalDetalles(true) }}
                  onAddSalida={agregarUnidadSalida}
                  getEstadoColor={getEstadoColor}
                  getVencimientoColor={getVencimientoColor}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scanner" className="mt-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Sección del Scanner */}
               <div className="space-y-6">
                 <div className="bg-white p-6 rounded-lg border shadow-sm">
                   <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <Barcode className="h-5 w-5 text-blue-600" />
                     Escáner QR
                   </h3>
                   
              <div className="space-y-4">
                <Input 
                  value={codigoBarras} 
                  onChange={(e) => setCodigoBarras(e.target.value)}  
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      buscarPorCodigo();
                    }
                  }} 
                  placeholder="Código de Barras o QR" 
                />
                     <Button className="px-4 py-2 bg-blue-600 text-white rounded w-full hover:bg-blue-700" onClick={buscarPorCodigo} >
                       <Scan className="h-4 w-4 mr-2" /> Buscar Unidad
                     </Button>
                     <Button onClick={iniciarEscaneo} className="px-4 py-2 border rounded w-full hover:bg-gray-50">
                       <Barcode className="h-4 w-4 mr-2" /> Escanear con Cámara
                </Button>
              </div>
              
                   <div className="mt-6 pt-4 border-t">
              <QRGenerator onGenerate={handleGenerateQR} />
                   </div>
                 </div>
               </div>

               {/* Sección de Unidades Agregadas */}
               <div className="space-y-6">
                 <div className="bg-white p-6 rounded-lg border shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold flex items-center gap-2">
                       <Package className="h-5 w-5 text-green-600" />
                       Unidades Agregadas para Salida
                     </h3>
                     <span className="text-sm text-gray-500">
                       {formSalida.unidades_seleccionadas.length} unidades
                     </span>
                   </div>

                   {formSalida.unidades_seleccionadas.length === 0 ? (
                     <div className="text-center py-8 text-gray-500">
                       <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                       <p className="text-sm">No hay unidades agregadas</p>
                       <p className="text-xs text-gray-400 mt-1">
                         Escanea o busca unidades para agregarlas a la salida
                       </p>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       {formSalida.unidades_seleccionadas.map((unidad) => (
                         <div key={unidad.id} className="border rounded-lg p-3 bg-gray-50">
                           <div className="flex justify-between items-start">
                             <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                 <span className="font-medium text-sm">{unidad.correlativo}</span>
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(unidad.estado)}`}>
                                   {unidad.estado}
                                 </span>
                                 <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                   {unidad.tipo_unidad}
                                 </span>
                               </div>
                               <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                 <p><span className="font-medium">Tipo sangre:</span> {unidad.tipo_sangre}</p>
                                 <p><span className="font-medium">Volumen:</span> {unidad.volumen_ml}ml</p>
                                 <p><span className="font-medium">Caducidad:</span> {new Date(unidad.fecha_caducidad).toLocaleDateString('es-ES')}</p>
                                 <p><span className="font-medium">Días vigencia:</span> 
                                   <span className={`ml-1 ${getVencimientoColor(unidad.dias_vigencia)}`}>
                                     {unidad.dias_vigencia}
                                   </span>
                                 </p>
                               </div>
                             </div>
                             <Button
                               onClick={() => removerUnidadSalida(unidad.id)}
                               size="sm"
                               variant="outline"
                               className="text-red-600 border-red-600 hover:bg-red-50 ml-2"
                             >
                               <XCircle className="h-3 w-3" />
                             </Button>
                           </div>
                         </div>
                       ))}
                       
                       <div className="pt-3 border-t">
                         <Button 
                           onClick={() => setModalSalida(true)}
                           className="w-full bg-green-600 hover:bg-green-700 text-white"
                           disabled={formSalida.unidades_seleccionadas.length === 0}
                         >
                           <FileText className="h-4 w-4 mr-2" />
                           Proceder con Salida ({formSalida.unidades_seleccionadas.length} unidades)
                         </Button>
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="salidas" className="mt-6">
            <div className="flex space-x-4 mb-4">
              <select 
                value={filtroEstadoSalida} 
                onChange={(e) => setFiltroEstadoSalida(e.target.value)} 
                className="border px-3 py-2 rounded"
              >
                <option value="todos">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="AUTORIZADA">Autorizada</option>
                <option value="RECHAZADA">Rechazada</option>
                <option value="COMPLETADA">Completada</option>
              </select>
              <Button onClick={fetchSalidas} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>

            {salidasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No hay salidas registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {salidasFiltradas.map((salida) => (
                  <div key={salida.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold">Salida #{salida.id}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(salida.fecha_salida).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoSalidaColor(salida.estado)}`}>
                        {salida.estado}
                      </span>
                    </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                       <div>
                         <p className="text-sm font-medium text-gray-700">Receptor</p>
                         <p className="text-sm">{salida.receptor}</p>
                         {salida.cedula_receptor && (
                           <p className="text-xs text-gray-500">Cédula: {salida.cedula_receptor}</p>
                         )}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-700">Médico Solicitante</p>
                         <p className="text-sm">{salida.medico_solicitante}</p>
                       </div>
                     </div>

                     <div className="mb-3">
                       <p className="text-sm font-medium text-gray-700">Unidades</p>
                       <p className="text-sm">{salida.total_unidades} unidades</p>
                       <div className="flex flex-wrap gap-1 mt-1">
                         {salida.detalles?.slice(0, 3).map((detalle, index) => (
                           <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                             {detalle.unidad_correlativo}
                           </span>
                         ))}
                         {salida.detalles && salida.detalles.length > 3 && (
                           <span className="text-xs text-gray-500">
                             +{salida.detalles.length - 3} más
                           </span>
                         )}
                       </div>
                       
                       {/* Resumen por tipo de unidad */}
                       {salida.resumen_unidades && salida.resumen_unidades.length > 0 && (
                         <div className="mt-2 p-2 bg-gray-50 rounded">
                           <p className="text-xs font-medium text-gray-600 mb-1">Resumen por tipo:</p>
                           <div className="flex flex-wrap gap-1">
                             {salida.resumen_unidades.map((resumen, index) => (
                               <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                 {resumen.unidad__tipo_unidad}: {resumen.cantidad}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>

                    {salida.observaciones && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Observaciones</p>
                        <p className="text-sm text-gray-600">{salida.observaciones}</p>
                      </div>
                    )}

                    {salida.estado === "RECHAZADA" && salida.motivo_rechazo && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm font-medium text-red-700">Motivo de rechazo</p>
                        <p className="text-sm text-red-600">{salida.motivo_rechazo}</p>
                      </div>
                    )}

                                         <div className="flex justify-between items-center">
                       <div className="text-xs text-gray-500">
                         <p>Técnico: {salida.tecnico_salida_nombre}</p>
                         {salida.autorizado_por && (
                           <p>Autorizado por: {salida.autorizado_por}</p>
                         )}
                       </div>
                      
                      <div className="flex gap-2">
                        {salida.estado === "PENDIENTE" && (
                          <>
                            <Button
                              onClick={() => {
                                setSalidaSeleccionada(salida)
                                setModalAutorizacion(true)
                              }}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Autorizar
                            </Button>
                            <Button
                              onClick={() => {
                                setSalidaSeleccionada(salida)
                                setModalAutorizacion(true)
                              }}
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        
                        {salida.estado === "AUTORIZADA" && (
                          <Button
                            onClick={() => completarSalida(salida.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Completar
                          </Button>
                        )}
                        
                                                 <Button
                           onClick={() => {
                             setSalidaSeleccionada(salida)
                             setModalDetallesSalida(true)
                           }}
                           size="sm"
                           variant="outline"
                         >
                           Ver Detalles
                         </Button>
                      </div>
                    </div>
              </div>
            ))}
              </div>
            )}
          </TabsContent>
         
        </Tabs>

        <UnidadDetallesDialog
          open={modalDetalles}
          onClose={() => setModalDetalles(false)}
          onAddSalida={agregarUnidadSalida}
          unidad={unidadSeleccionada}
          getEstadoColor={getEstadoColor}
          getVencimientoColor={getVencimientoColor}
        />

        <SalidaDialog
          open={modalSalida}
          onClose={() => setModalSalida(false)}
          formSalida={formSalida}
          setFormSalida={setFormSalida}
          procesarSalida={procesarSalida}
          removerUnidadSalida={removerUnidadSalida}
          puedeEditarFecha={true}
        />

        <QRScanner
          isOpen={modalQRScanner}
          onClose={() => setModalQRScanner(false)}
          onScan={handleQRScan}
        />

        <AutorizacionDialog
          open={modalAutorizacion}
          onClose={() => setModalAutorizacion(false)}
          salida={salidaSeleccionada}
          onAutorizar={autorizarSalida}
          onRechazar={rechazarSalida}
        />

        <DetallesSalidaDialog
          open={modalDetallesSalida}
          onClose={() => setModalDetallesSalida(false)}
          salida={salidaSeleccionada}
        />
      </PageLayout>
    </>
  )
}
