"use client"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuth } from "@/hooks/useAuth"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { ResultadoValidarExamen } from "@/components/laboratorio/ResultadoValidarExamen"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal"
import { Textarea } from "@/components/ui/textarea"
import { ResultadoFormExamen } from "@/components/laboratorio/ResultadoForExamen"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/DataTable"


import {
  TestTube,
  Clock,
  CheckCircle,
  AlertTriangle,
  Save,
  Edit,
  Eye,
  Download,
  Stethoscope,
  Calendar,
  Plus,
  Send,
  ActivityIcon as Assignment,
  FileText,
  Activity,
  User,
  Phone,
  Mail,
  MapPin,
  XCircle,
} from "lucide-react"
import { resultadosAPI } from "@/api/resultadosAPI"

export default function ResultadosPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  const [tabValue, setTabValue] = useState("pendientes")
  const [ordenes, setOrdenes] = useState([])
  const [resultadosPorDetalle, setResultadosPorDetalle] = useState<any>({})
  const [openDialog, setOpenDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrden, setSelectedOrden] = useState<any>(null)
  const [selectedResultado, setSelectedResultado] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [pagination, setPagination] = useState({ page: 1, next: null, previous: null, total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    fetchOrdenes()
  }, [tabValue,currentPage,limit])

  const fetchOrdenes = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      let data
      let lista
      if (tabValue === "pendientes") {
        data = await resultadosAPI.getOrdenesPendientes(currentPage,"PENDIENTE","donante")        
        //lista = Array.isArray(data?.results) ? data.results : []
      } else if (tabValue === "proceso") {
        data = await resultadosAPI.getOrdenesPendientes(currentPage,"EN PROCESO","donante")
        //lista = Array.isArray(data?.results) ? data.results : []
      } else {
        data = await resultadosAPI.getOrdenesPendientes(currentPage,"VALIDADO","donante")
        //lista = Array.isArray(data?.results) ? data.results : []
      }
      setOrdenes(data)
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "info")
      }
    } catch (error) {
      showNotification("Error al cargar órdenes", "warning")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchOrdenes(false)
  }

  const handleOpenDialog = async (orden: any) => {
    showLoader()
    try {
      setSelectedOrden(orden)
      const resultadosData = await resultadosAPI.getResultadosByOrden(orden.id)
      setResultadosPorDetalle(resultadosData)

      const initialFormData: any = {}
      resultadosData.forEach((resultado: any) => {
        initialFormData[resultado.id] = {
          valor_numerico: resultado.valor_numerico || "",
          observacion_especifica: resultado.observacion_especifica || "",
        }
      })

      setFormData(initialFormData)
      setOpenDialog(true)
    } catch (error) {
      showNotification("Error al cargar resultados", "error")
    } finally {
      hideLoader()
    }
  }

  const handleOpenViewDialog = async (orden: any) => {
    showLoader()
    try {
      setSelectedResultado(orden)
      const resultadosData = await resultadosAPI.getResultadosByOrden(orden.id)
      setResultadosPorDetalle(resultadosData)
      setOpenViewDialog(true)
    } catch (error) {
      showNotification("Error al cargar detalles del resultado", "error")
    } finally {
      hideLoader()
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedOrden(null)
    setResultadosPorDetalle([])
    setFormData({})
    setErrors({})
  }

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setSelectedResultado(null)
    setResultadosPorDetalle([])
  }

  const handleSaveResults = async () => {
    showLoader()
    try {
      const payloads = Object.entries(resultadosPorDetalle).map(([detalleId, parametros]) => ({
        detalle_orden_id: detalleId,
        valores: parametros.valores,
        observaciones: parametros.observaciones,
        estado: tabValue=="pendientes"?"EN PROCESO":tabValue=="proceso"?"VALIDADO":"COMPLETADO",
        prioridad: "normal"
      }))
      
      for (const payload of payloads) {
        await resultadosAPI.saveResultados(payload.detalle_orden_id, payload)
      }
      showNotification("Resultados guardados correctamente", "success")
      handleCloseDialog()
      fetchOrdenes()
    } catch (error) {
      showNotification("Error al guardar resultados", "error")
    } finally {
      hideLoader()
    }
  }
  

  const handleValidateResults = async () => {
    showLoader()
    try {
      const resultadosData = resultadosPorDetalle.map((resultado: any) => ({
        id: resultado.id,  // ID del resultado
        observaciones: resultado.observaciones,
        fecha_validacion: new Date().toISOString().slice(0,10), // YYYY-MM-DD
        valores: resultado.valores,  // Lista de valores corregidos
        donante_apto: true, // Enviar true para indicar que el donante es apto
      }))
  
      await resultadosAPI.validateResultados(
        resultadosPorDetalle[0].id, // Usa el primer resultado como PK en la URL
        resultadosData,
        user?.full_name || "",
      )
  
      showNotification("Resultados validados correctamente", "success")
      handleCloseDialog()
      fetchOrdenes()
    } catch (error) {
      showNotification("Error al validar resultados", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDenyResults = async () => {
    showLoader()
    try {
      const resultadosData = resultadosPorDetalle.map((resultado: any) => ({
        id: resultado.id,  // ID del resultado
        observaciones: resultado.observaciones,
        fecha_validacion: new Date().toISOString().slice(0,10), // YYYY-MM-DD
        valores: resultado.valores,  // Lista de valores corregidos
        donante_apto: false, // Enviar false para indicar que el donante no es apto
      }))
  
      await resultadosAPI.validateResultados(
        resultadosPorDetalle[0].id, // Usa el primer resultado como PK en la URL
        resultadosData,
        user?.full_name || "",
      )
  
      showNotification("Donante denegado correctamente", "success")
      handleCloseDialog()
      fetchOrdenes()
    } catch (error) {
      showNotification("Error al denegar resultados", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDownloadPDF = async (orden: any) => {
    showLoader()
    try {
      // Implementar descarga de PDF
      showNotification("Descargando PDF...", "info")
      // Aquí iría la lógica para generar y descargar el PDF
    } catch (error) {
      showNotification("Error al descargar PDF", "error")
    } finally {
      hideLoader()
    }
  }

  const handleSendEmail = async (orden: any) => {
    showLoader()
    try {
      // Implementar envío por email
      showNotification("Enviando por email...", "info")
      // Aquí iría la lógica para enviar por email
    } catch (error) {
      showNotification("Error al enviar email", "error")
    } finally {
      hideLoader()
    }
  }
  
  

  const filteredOrdenes = ordenes.filter(
    (orden: any) =>
      (orden.donante_nombre?.toLowerCase().includes(searchTerm.toLowerCase())) 
    || orden.codigo.includes(searchTerm),
  )

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "validado":
        return { bg: "#dcfce7", text: "#166534" }
      case "pendiente":
        return { bg: "#fef3c7", text: "#92400e" }
      case "en proceso":
        return { bg: "#dbeafe", text: "#1e40af" }
      case "cancelado":
        return { bg: "#f3f4f6", text: "#374151" }
      case "entregado":
          return { bg: "#f3f4f6", text: "#374151" }
      default:
        return { bg: "#f3f4f6", text: "#374151" }
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return { bg: "#fecaca", text: "#dc2626" }
      case "media":
        return { bg: "#fef3c7", text: "#d97706" }
      case "normal":
        return { bg: "#dcfce7", text: "#16a34a" }
      default:
        return { bg: "#f3f4f6", text: "#6b7280" }
    }
  }

  const columns = [
    {
      key: "codigo",
      label: "N° Orden",
      className: "font-medium",
      render: (value: string) => <span style={{ color: "#2563eb" }}>{value}</span>,
    },
    {
      key: "donante_nombre",
      label: "Donante",
      render: (value: string, row: any) => (
        <div>
          <div style={{ color: "#1f2937", fontWeight: "500" }}>{value}</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>ID: {row.paciente}</div>
        </div>
      ),
    },
    {
      key: "detalles",
      label: "Examen",
      render: (value: any, row: any) => {
        const total = row?.total_examenes ?? 0;
    
        return total <= 3 ? (
          <div className="space-y-1">
            {Array.isArray(value) && value.length > 0 ? (
              value.map((detalle: any, i: number) => (
                <div key={i} className="text-gray-700 text-sm">
                  {detalle.examen?.codigo} - {detalle.examen?.nombre}
                </div>
              ))
            ) : (
              <span className="text-gray-500 italic">Sin exámenes</span>
            )}
          </div>
        ) : (
          <span className="text-gray-700">{total} exámenes solicitados</span>
        );
      }
    },
    {
      key: "medico_nombre",
      label: "Médico",
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Stethoscope className="h-3 w-3 text-gray-400" />
          <span style={{ color: "#4b5563" }}>{value}</span>
        </div>
      ),
    },
    {
      key: "fecha",
      label: "Fecha Orden",
      render: (value: string,row: any) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span style={{ color: "#4b5563" }}>{value} : {row.hora}</span>
        </div>
      ),
    },
    {
      key: "prioridad",
      label: "Prioridad",
      render: (value: string,row:any) => {        
        const color = getPriorityColor(value.toLowerCase())
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {value}
          </span>
        )
      },
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => {
        const color = getStatusColor(value.toLowerCase())
        const labels = {
          pendiente: "Pendiente",
          en_proceso: "En Proceso",
          pendiente_validacion: "Pendiente Validación",
          completado: "Completado",
        }
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {labels[value as keyof typeof labels] || value}
          </span>
        )
      },
    },
  ]

 
  const getTabStats = () => {
    const pendientes = ordenes.filter((o: any) => tabValue === "pendientes").length
    const proceso = ordenes.filter((o: any) => tabValue === "proceso").length
    const validados = ordenes.filter((o: any) => tabValue === "validados").length

    return [
      {
        title: "Pendientes",
        value: pendientes,
        icon: <Clock className="h-8 w-8 text-white" />,
        color: "info",
        trend: "Requieren atención",
      },
      {
        title: "En Proceso",
        value: proceso,
        icon: <Activity className="h-8 w-8 text-white" />,
        color: "warning",
        trend: "En análisis",
      },
      {
        title: "Validados",
        value: validados,
        icon: <CheckCircle className="h-8 w-8 text-white" />,
        color: "success",
        trend: "Completados",
      },
      {
        title: "Total Órdenes",
        value: ordenes.length,
        icon: <FileText className="h-8 w-8 text-white" />,
        color: "secondary",
        trend: "Todas las órdenes",
      },
    ]
  }

  const tableActions = (row: any) => (
    <>    
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleOpenViewDialog(row)}
      className="h-8 w-8 p-0"
      style={{ color: "#2563eb" }}
      title="Ver resultado"
    >
      <Eye className="h-4 w-4" />
    </Button>
    {row.estado === "PENDIENTE" && hasPermission("editar_resultado") && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleOpenDialog(row)}
        className="h-8 w-8 p-0"
        style={{ color: "#2563eb" }}
        title="Generar Resultado"
      >
        <Edit className="h-4 w-4" />
      </Button>
    )}
    {row.estado === "EN PROCESO" && hasPermission("validar_resultado") && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleOpenDialog(row)}
        className="h-8 w-8 p-0"
        style={{ color: "#16a34a" }}
        title="Validar"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>
    )}
    {row.estado === "VALIDADO" && (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDownloadPDF(row)}
          className="h-8 w-8 p-0"
          style={{ color: "#7c3aed" }}
          title="Descargar PDF"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSendEmail(row)}
          className="h-8 w-8 p-0"
          style={{ color: "#059669" }}
          title="Enviar por correo"
        >
          <Send className="h-4 w-4" />
        </Button>
      </>
    )}
  </>
  )

  const tabsContent = (
    <div className="space-y-6">
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border">
          <TabsTrigger
            value="pendientes"
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
          >
            <Clock className="h-4 w-4 mr-2" />
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="proceso" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <Activity className="h-4 w-4 mr-2" />
            En Proceso
          </TabsTrigger>
          <TabsTrigger
            value="validados"
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Validados
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tabValue} className="mt-6">
          <DataTable
            data={filteredOrdenes}
            columns={columns}
            actions={tableActions}
            emptyMessage="No hay órdenes en esta categoría"
            emptyIcon={<TestTube className="h-12 w-12 text-gray-400" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  )

  return (
    <>
      <PageLayout
        title="Gestión de Resultados"
        description="Administra y valida los resultados de los exámenes de laboratorio"
        icon={<TestTube className="h-8 w-8 text-blue-600" />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        stats={getTabStats()}
      >
        {tabsContent}
      </PageLayout>

      {/* Dialog para cargar/ver resultados */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              {tabValue === "pendientes" ? "Crear Resultado" : 
               tabValue==="validados"?"Ver Resultados":"Validar Resultados" }
            </DialogTitle>
            <DialogDescription>
              {selectedOrden && `Orden: ${selectedOrden.codigo} - Paciente: ${selectedOrden.paciente_nombre}`}
            </DialogDescription>
          </DialogHeader>

          {selectedOrden && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Código</Label>
                <p className="text-sm font-medium">{selectedOrden.codigo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Donante</Label>
                <p className="text-sm font-medium">{selectedOrden.donante_nombre}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                <p className="text-sm">{selectedOrden.fecha}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Hora</Label>
                <p className="text-sm">{selectedOrden.hora}</p>
              </div>
            </CardContent>
          </Card>

        <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resultados</h3>

        {selectedOrden.detalles.length === 0 ? (
          <p className="text-gray-500 italic">
            No hay exámenes disponibles para esta orden.
          </p>
        ) : tabValue === "pendientes" ? (
          selectedOrden?.detalles.map((detalle: any) => (
            <ResultadoFormExamen
              key={detalle.id}
              detalle={detalle}
              onSave={(resultado: string, parametros: any) => {
                setResultadosPorDetalle((prev: any) => ({
                  ...prev,
                  [resultado]: parametros
                }))
              }}
            />
          ))
        ) : tabValue === "proceso" && resultadosPorDetalle?.length > 0 ? (
          resultadosPorDetalle.map((resultado: any) => (
            <ResultadoValidarExamen
              key={resultado.id}
              resultado={resultado}
              onValidate={(id: string, data: any) => {
                setResultadosPorDetalle((prev: any) =>
                  prev.map((r: any) =>
                    r.id === id ? { ...r, ...data } : r
                  )
                )
              }}
            />
          ))
        ) : (
          <p className="text-gray-500 italic">
            No hay resultados para validar.
          </p>
        )}
      </div>

    

  </div>
)}


          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cerrar
            </Button>
            
            {tabValue == "proceso" && (
              <>                
                {hasPermission("validar_resultados") && (
                  <>
                    <Button onClick={handleValidateResults} className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Validar
                    </Button>
                    <Button onClick={handleDenyResults} variant="destructive" className="gap-2">
                      <XCircle className="h-4 w-4" />
                      Denegar
                    </Button>
                  </>
                )}
              </>
            )}
            {tabValue == "pendientes" && (
              <>
                <Button onClick={handleSaveResults} variant="outline" className="gap-2">
                  <Send className="h-4 w-4" />
                  Mandar a Validar
                </Button>                
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal View para ver detalles de resultados */}
      <Modal open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <ModalContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Detalles del Resultado
            </ModalTitle>
            <ModalDescription>
              {selectedResultado && `Orden: ${selectedResultado.codigo} - Donante: ${selectedResultado.donante_nombre}`}
            </ModalDescription>
          </ModalHeader>

          {selectedResultado && (
            <div className="space-y-6">
              {/* Información de la Orden */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de la Orden</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Código de Orden</Label>
                    <p className="text-sm font-medium text-blue-600">{selectedResultado.codigo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estado</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedResultado.estado} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Donante</Label>
                    <p className="text-sm font-medium">{selectedResultado.donante_nombre}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Médico</Label>
                    <p className="text-sm">{selectedResultado.medico_nombre}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                    <p className="text-sm">{selectedResultado.fecha}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Hora</Label>
                    <p className="text-sm">{selectedResultado.hora}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedResultado.prioridad}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Exámenes</Label>
                    <p className="text-sm font-medium">{selectedResultado.total_examenes}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Exámenes y Resultados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exámenes y Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedResultado.detalles && selectedResultado.detalles.length > 0 ? (
                    <div className="space-y-4">
                      {selectedResultado.detalles.map((detalle: any, index: number) => (
                        <div key={detalle.id || index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{detalle.examen?.nombre}</h4>
                              <p className="text-sm text-gray-600">Código: {detalle.examen?.codigo}</p>
                              <p className="text-sm text-gray-600">Categoría: {detalle.examen?.categoria}</p>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={detalle.estado} />
                            </div>
                          </div>
                          
                          {/* Resultados específicos si existen */}
                          {resultadosPorDetalle && resultadosPorDetalle.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <h5 className="font-medium mb-2">Resultados:</h5>
                              <div className="space-y-2">
                                {resultadosPorDetalle
                                  .filter((resultado: any) => resultado.detalle_orden_id === detalle.id)
                                  .map((resultado: any, resIndex: number) => (
                                    <div key={resIndex} className="bg-gray-50 p-3 rounded">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium">Valor:</span> {resultado.valor_numerico}
                                        </div>
                                        <div>
                                          <span className="font-medium">Unidad:</span> {resultado.dimensional}
                                        </div>
                                        <div>
                                          <span className="font-medium">Rango Normal:</span> {resultado.intervalo_referencia_min} - {resultado.intervalo_referencia_max}
                                        </div>
                                        <div>
                                          <span className="font-medium">Estado:</span> 
                                          <StatusBadge status={resultado.estado} />
                                        </div>
                                      </div>
                                      {resultado.observacion_especifica && (
                                        <div className="mt-2">
                                          <span className="font-medium text-sm">Observaciones:</span>
                                          <p className="text-sm text-gray-600 mt-1">{resultado.observacion_especifica}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay exámenes registrados en esta orden.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <ModalFooter>
            <Button variant="outline" onClick={handleCloseViewDialog}>
              Cerrar
            </Button>
            {selectedResultado && selectedResultado.estado === "VALIDADO" && (
              <>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar por Email
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
