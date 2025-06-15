"use client"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuth } from "@/hooks/useAuth"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  TestTube,
  Clock,
  CheckCircle,
  AlertTriangle,
  Save,
  Edit,
  ActivityIcon as Assignment,
  FileText,
  Activity,
} from "lucide-react"
import { resultadosAPI } from "@/api/resultadosAPI"

export default function ResultadosPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  const [tabValue, setTabValue] = useState("pendientes")
  const [ordenes, setOrdenes] = useState([])
  const [resultados, setResultados] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrden, setSelectedOrden] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    fetchOrdenes()
  }, [tabValue])

  const fetchOrdenes = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      let data
      if (tabValue === "pendientes") {
        data = await resultadosAPI.getOrdenesPendientes()
      } else if (tabValue === "proceso") {
        data = await resultadosAPI.getOrdenesEnProceso()
      } else {
        data = await resultadosAPI.getOrdenesValidadas()
      }
      setOrdenes(data)
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "success")
      }
    } catch (error) {
      showNotification("Error al cargar órdenes", "error")
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
      setResultados(resultadosData)

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

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedOrden(null)
    setResultados([])
    setFormData({})
    setErrors({})
  }

  const handleSaveResults = async () => {
    showLoader()
    try {
      const resultadosData = Object.keys(formData).map((resultadoId) => ({
        id: resultadoId,
        ...formData[resultadoId],
      }))

      await resultadosAPI.saveResultados(selectedOrden.id, resultadosData)
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
      const resultadosData = Object.keys(formData).map((resultadoId) => ({
        id: resultadoId,
        ...formData[resultadoId],
      }))

      await resultadosAPI.validateResultados(selectedOrden.id, resultadosData, user?.id_usuario)
      showNotification("Resultados validados correctamente", "success")
      handleCloseDialog()
      fetchOrdenes()
    } catch (error) {
      showNotification("Error al validar resultados", "error")
    } finally {
      hideLoader()
    }
  }

  const filteredOrdenes = ordenes.filter(
    (orden: any) =>
      orden.paciente.toLowerCase().includes(searchTerm.toLowerCase()) || orden.codigo.includes(searchTerm),
  )

  const columns = [
    { key: "codigo", label: "Código", className: "font-medium" },
    { key: "paciente", label: "Paciente", className: "font-medium text-gray-900" },
    { key: "fecha", label: "Fecha" },
    { key: "hora", label: "Hora" },
    { key: "examenes", label: "Exámenes", className: "text-center" },
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
        color: "bg-gradient-to-r from-orange-500 to-orange-600",
        trend: "Requieren atención",
      },
      {
        title: "En Proceso",
        value: proceso,
        icon: <Activity className="h-8 w-8 text-white" />,
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        trend: "En análisis",
      },
      {
        title: "Validados",
        value: validados,
        icon: <CheckCircle className="h-8 w-8 text-white" />,
        color: "bg-gradient-to-r from-green-500 to-green-600",
        trend: "Completados",
      },
      {
        title: "Total Órdenes",
        value: ordenes.length,
        icon: <FileText className="h-8 w-8 text-white" />,
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
        trend: "Todas las órdenes",
      },
    ]
  }

  const tableActions = (row: any) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleOpenDialog(row)}
      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
    >
      {tabValue === "validados" ? <Assignment className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
    </Button>
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
              {tabValue === "validados" ? "Ver Resultados" : "Cargar Resultados"}
            </DialogTitle>
            <DialogDescription>
              {selectedOrden && `Orden: ${selectedOrden.codigo} - Paciente: ${selectedOrden.paciente}`}
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
                    <Label className="text-sm font-medium text-gray-600">Paciente</Label>
                    <p className="text-sm font-medium">{selectedOrden.paciente}</p>
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
                {resultados.map((resultado: any) => (
                  <Card key={resultado.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <Label className="text-sm font-medium">{resultado.examen}</Label>
                          <p className="text-xs text-gray-500">Código: {resultado.codigo_abreviado}</p>
                        </div>

                        <div>
                          <Label htmlFor={`valor-${resultado.id}`}>Valor</Label>
                          <div className="flex">
                            <Input
                              id={`valor-${resultado.id}`}
                              value={formData[resultado.id]?.valor_numerico || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [resultado.id]: {
                                    ...formData[resultado.id],
                                    valor_numerico: e.target.value,
                                  },
                                })
                              }
                              disabled={tabValue === "validados"}
                              className="rounded-r-none"
                            />
                            <div className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r text-sm text-gray-600">
                              {resultado.dimensional}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Rango Normal</Label>
                          <p className="text-sm text-gray-600">
                            {resultado.intervalo_referencia_min} - {resultado.intervalo_referencia_max}
                          </p>
                        </div>

                        <div>
                          {formData[resultado.id]?.valor_numerico && (
                            <Badge
                              variant={
                                Number(formData[resultado.id]?.valor_numerico) < resultado.intervalo_referencia_min ||
                                Number(formData[resultado.id]?.valor_numerico) > resultado.intervalo_referencia_max
                                  ? "destructive"
                                  : "default"
                              }
                              className="flex items-center gap-1"
                            >
                              {Number(formData[resultado.id]?.valor_numerico) < resultado.intervalo_referencia_min ||
                              Number(formData[resultado.id]?.valor_numerico) > resultado.intervalo_referencia_max ? (
                                <>
                                  <AlertTriangle className="h-3 w-3" />
                                  Fuera de rango
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Normal
                                </>
                              )}
                            </Badge>
                          )}
                        </div>

                        <div className="md:col-span-4">
                          <Label htmlFor={`obs-${resultado.id}`}>Observación</Label>
                          <Textarea
                            id={`obs-${resultado.id}`}
                            value={formData[resultado.id]?.observacion_especifica || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [resultado.id]: {
                                  ...formData[resultado.id],
                                  observacion_especifica: e.target.value,
                                },
                              })
                            }
                            disabled={tabValue === "validados"}
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cerrar
            </Button>
            {tabValue !== "validados" && (
              <>
                <Button onClick={handleSaveResults} variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
                {hasPermission("validar_resultados") && (
                  <Button onClick={handleValidateResults} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Validar
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
