"use client"

import { useState, useEffect, useRef } from "react"
import { useLoader } from "@/hooks/useLoader"
import { PageLayout } from "@/components/layout/PageLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Droplets, Package, AlertTriangle, Calendar, Scan, FileText, TrendingUp, Barcode } from "lucide-react"
import { useNotification } from "@/hooks/useNotification"
import { UnidadCard } from "@/components/banco_sangre/unidadCard"
import { UnidadDetallesDialog } from "@/components/banco_sangre/unidadDetalle"
import { SalidaDialog } from "@/components/banco_sangre/salidaDialog"
import { QRScanner } from "@/components/banco_sangre/QRScanner"
import { QRGenerator } from "@/components/banco_sangre/QRGenerator"
import { CameraTest } from "@/components/dev/CameraTest"
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

export default function BancoSangrePage() {
  const [unidades, setUnidades] = useState<UnidadSangre[]>([])
  const [registrosSalida, setRegistrosSalida] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { showLoader, hideLoader } = useLoader()
  const [codigoBarras, setCodigoBarras] = useState("")
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<UnidadSangre | null>(null)
  const [modalDetalles, setModalDetalles] = useState(false)
  const [modalSalida, setModalSalida] = useState(false)
  const [modalQRScanner, setModalQRScanner] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [scanning, setScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("inventario")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { showNotification } = useNotification()
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(5)
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

  useEffect(() => {fetchMuestras()}, [])


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
      showNotification("Error al guardar paciente", "error")
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

  const buscarPorCodigo = () => {
    const unidad = unidades.find((u) => u.correlativo === codigoBarras.trim())
    if (unidad) {
      setUnidadSeleccionada(unidad)
      setModalDetalles(true)
    } else { showNotification("Unidad no encontrada", "error") }
  }

  const iniciarEscaneo = () => {
    setModalQRScanner(true)
  }

  const handleQRScan = (result: string) => {
    setCodigoBarras(result)
    showNotification("Código QR escaneado correctamente", "success")
    // Buscar automáticamente la unidad después del escaneo
    setTimeout(() => {
      buscarPorCodigo()
    }, 500)
  }

  const handleGenerateQR = (text: string) => {
    // Abrir una nueva ventana con un generador de QR online
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`
    window.open(qrUrl, '_blank')
    showNotification("Generando código QR...", "secondary")
  }

  const agregarUnidadSalida = (unidad: UnidadSangre) => {
    if (unidad.estado !== "DISPONIBLE") return showNotification("No disponible", "error")
    if (formSalida.unidades_seleccionadas.some((u) => u.id === unidad.id)) {
      return showNotification("Ya agregada", "warning")
    }
    setFormSalida({ ...formSalida, unidades_seleccionadas: [...formSalida.unidades_seleccionadas, unidad] })
    showNotification("Agregada", "success")
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
        unidades: formSalida.unidades_seleccionadas.map(u => u.id),
        cantidad_unidades: formSalida.unidades_seleccionadas.length,
      }
      
      // Enviar a la API
      await salidaAPI.createSalida(salidaData)
      
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
      
      setModalSalida(false)
      showNotification("Salida procesada correctamente", "success")
      
    } catch (error) {
      console.error("Error al procesar salida:", error)
      showNotification("Error al procesar la salida", "error")
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
            <div className="space-y-6 max-w-md mx-auto">
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
                <Button className="px-4 py-2 bg-blue-300 text-white-600 rounded w-full" onClick={buscarPorCodigo} >
                  <Scan className="h-4 w-4" /> Buscar</Button>
                <Button onClick={iniciarEscaneo} className="px-4 py-2 border rounded w-full">
                  <Barcode className="h-4 w-4" /> Escanear con Cámara
                </Button>
              </div>
              
              <QRGenerator onGenerate={handleGenerateQR} />
              
              {/* Componente de prueba de cámara */}
              <div className="mt-8">
                <CameraTest />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="salidas" className="mt-6">
            {registrosSalida.length === 0 ? (
              <p>No hay registros</p>
            ) : registrosSalida.map((r) => (
              <div key={r.id} className="border p-4 rounded mb-4">
                <h4>Salida #{r.id}</h4>
                <p>Receptor: {r.receptor}</p>
              </div>
            ))}
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
         // puedeEditarFecha
        />

        <QRScanner
          isOpen={modalQRScanner}
          onClose={() => setModalQRScanner(false)}
          onScan={handleQRScan}
        />
      </PageLayout>
    </>
  )
}
