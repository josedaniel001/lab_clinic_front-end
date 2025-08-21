"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PageLayout } from "@/components/layout/PageLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  FileText,
  Eye,
  Download,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileDown,
} from "lucide-react"
import {
  entrevistasAPI,
  type EntrevistaDonante,
  type FiltrosEntrevista,
  type EstadisticasEntrevistas,
} from "@/api/entrevistasAPI"
import { useNotification } from "@/hooks/useNotification"
import { AutorizarEntrevistaDialog } from "@/components/banco_sangre/AutorizarEntrevistaDialog"

// Página de gestión de entrevistas de donantes
export default function EntrevistasPage() {
  const [entrevistas, setEntrevistas] = useState<EntrevistaDonante[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasEntrevistas | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtros, setFiltros] = useState<FiltrosEntrevista>({ estado: "all", sexo: "all" })
  const [mostrarDetalles, setMostrarDetalles] = useState(false)
  const [entrevistaSeleccionada, setEntrevistaSeleccionada] = useState<EntrevistaDonante | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalAutorizacion, setModalAutorizacion] = useState(false)
  const [entrevistaParaAutorizar, setEntrevistaParaAutorizar] = useState<EntrevistaDonante | null>(null)
  const { showNotification } = useNotification()

  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const data = await entrevistasAPI.obtenerEntrevistas(filtros)
      setEntrevistas(data)
      const stats = await entrevistasAPI.obtenerEstadisticas(data)
      setEstadisticas(stats)
    } catch (e) {
      showNotification("Error al cargar entrevistas", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleBusqueda = () => {
    setFiltros({ ...filtros, busqueda })
  }

  const handleGenerarPDF = async (id: number) => {
    try {
      showNotification("Generando PDF...", "info")
      const pdfData = await entrevistasAPI.generarPDF(id)
      
      console.log("PDF Data recibida:", pdfData)
      
      // Si el PDF se generó correctamente, mostrar mensaje de éxito
      if (pdfData.file_url) {
        // La URL ya viene completa desde el backend
        const fullUrl = pdfData.file_url
        console.log("Abriendo URL del PDF:", fullUrl)
        
        // Abrir PDF en nueva pestaña
        window.open(fullUrl, '_blank')
        
        showNotification(pdfData.mensaje || "PDF generado y abierto exitosamente", "success")
      } else {
        // Si no se generó correctamente, mostrar error
        showNotification(pdfData.mensaje || "No se pudo generar el PDF", "error")
      }
    } catch (error: any) {
      console.error("Error al generar PDF:", error)
      showNotification(`Error al generar el PDF: ${error.message}`, "error")
    }
  }

  const handleDescargarPDF = async (id: number) => {
    try {
      showNotification("Obteniendo PDF...", "info")
      const pdfData = await entrevistasAPI.descargarPDF(id)
      
      console.log("PDF Data recibida:", pdfData)
      
            if (pdfData.file_url) {
      
      // La URL ya viene completa desde el backend
      const fullUrl = pdfData.file_url
      console.log("Abriendo URL del PDF:", fullUrl)
      
      // Verificar si la URL es accesible
      try {
        const response = await fetch(fullUrl, { method: 'HEAD' })
        if (!response.ok) {
          throw new Error(`URL no accesible: ${response.status}`)
        }
        console.log("URL verificada correctamente")
      } catch (fetchError) {
        console.warn("No se pudo verificar la URL:", fetchError)
        // Continuar de todas formas
      }
      
      // Intentar abrir en nueva pestaña
      const newWindow = window.open(fullUrl, '_blank')
      
      // Si la ventana se bloqueó o no se abrió, ofrecer descarga
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        showNotification("Ventana bloqueada, descargando PDF...", "info")
        const link = document.createElement("a")
        link.href = fullUrl
        link.download = `entrevista_${id}.pdf`
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showNotification("PDF descargado exitosamente", "success")
      } else {
        showNotification(pdfData.mensaje || "PDF abierto exitosamente", "success")
      }
          } else {
        showNotification(pdfData.mensaje || "No se pudo obtener el PDF", "error")
      }
    } catch (error: any) {
      console.error("Error al obtener PDF:", error)
      showNotification(`Error al obtener el PDF: ${error.message}`, "error")
    }
  }

  const formatearFecha = (fecha: string) => new Date(fecha).toLocaleDateString("es-GT")

  const getEstadoBadge = (estado: string) => {
    estado = estado.toUpperCase()
    switch (estado) {
      case "ACEPTADO":
      case "COMPLETADO":
      case "VALIDADO":
        return <StatusBadge status="success" label={estado} />
      case "RECHAZADO":
      case "RECHAZADA":
        return <StatusBadge status="error" label={estado} />
      case "PENDIENTE":
      case "EN PROCESO":
        return <StatusBadge status="warning" label={estado} />
      default:
        return <StatusBadge status="info" label={estado} />
    }
  }

  const getTabStats = () =>
    estadisticas
      ? [
          {
            title: "Total",
            value: estadisticas.total,
            icon: <FileText className="h-6 w-6" />,
            color: "primary",
          },
          {
            title: "Completadas",
            value: estadisticas.aceptados,
            icon: <CheckCircle className="h-6 w-6" />,
            color: "success",
          },
          {
            title: "Rechazadas",
            value: estadisticas.rechazados,
            icon: <XCircle className="h-6 w-6" />,
            color: "error",
          },
          {
            title: "Pendientes",
            value: estadisticas.pendientes,
            icon: <Clock className="h-6 w-6" />,
            color: "warning",
          },
        ]
      : []

  /**
   * Actualiza el estado del donante en el backend (aceptar/rechazar) y
   * sincroniza el estado local de la tabla.
   */
  const handleActualizarEstadoDonante = async (id: number, apto: boolean) => {
    try {
      const mensajeInfo = apto ? "Aceptando donante..." : "Rechazando donante..."
      showNotification(mensajeInfo, "info")
      const updated = await entrevistasAPI.actualizarEstadoDonante(id, apto, true)
      // Actualizamos la lista localmente con los datos devueltos
      setEntrevistas((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e)),
      )
      const mensajeExito = apto ? "Donante aceptado" : "Donante rechazado"
      showNotification(mensajeExito, "success")
      // Actualizar estadísticas tras la aceptación/rechazo
      const nuevasEstadisticas = await entrevistasAPI.obtenerEstadisticas(
        entrevistas.map((e) => (e.id === id ? { ...e, ...updated } : e)),
      )
            setEstadisticas(nuevasEstadisticas)
    } catch (error: any) {
      showNotification(`Error: ${error.message}`, "error")
    }
  }

  const handleAutorizarEntrevista = (entrevista: EntrevistaDonante) => {
    setEntrevistaParaAutorizar(entrevista)
    setModalAutorizacion(true)
  }

  const handleEstadoCambiado = () => {
    cargarDatos()
  }

  return (
    <PageLayout
      title="Entrevistas de Donantes"
      description="Gestión completa de entrevistas y evaluación de donantes"
      icon={<FileText className="h-8 w-8 text-blue-600" />}
      onSearchChange={setBusqueda}
      searchValue={busqueda}
      onRefresh={cargarDatos}
      isRefreshing={loading}
      stats={getTabStats()}
      actions={
        <div className="flex gap-2">
          <Button onClick={handleBusqueda} variant="outline">
            <Search className="h-4 w-4 mr-1" /> Buscar
          </Button>
          <Button onClick={cargarDatos} variant="outline">
            <Download className="h-4 w-4 mr-1" /> Exportar
          </Button>
        </div>
      }
    >
      {/* Filtros */}
      <Card className="mb-4">
        <CardContent className="flex flex-col md:flex-row gap-4 py-4">
          <Select
            value={filtros.estado}
            onValueChange={(v) => setFiltros({ ...filtros, estado: v })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="validado">Validado</SelectItem>
              <SelectItem value="rechazado">Rechazado</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filtros.sexo}
            onValueChange={(v) => setFiltros({ ...filtros, sexo: v })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="femenino">Femenino</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {/* Tabla de entrevistas */}
      <Card>
        <CardContent className="px-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Cargando entrevistas...</p>
              </div>
            </div>
          ) : entrevistas.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entrevistas</h3>
                <p className="text-gray-600">
                  No se encontraron entrevistas con los filtros aplicados.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo Sangre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrevistas.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.correlativo}</TableCell>
                    <TableCell>
                      {e.primer_nombre} {e.primer_apellido}
                    </TableCell>
                    <TableCell>{e.celular || e.telefono_casa}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{e.tipo_sangre}</Badge>
                    </TableCell>
                    <TableCell>{getEstadoBadge(e.estado)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEntrevistaSeleccionada(e)
                            setMostrarDetalles(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Botón para autorizar/rechazar entrevista */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAutorizarEntrevista(e)}
                          title="Autorizar/Rechazar Entrevista"
                          disabled={e.estado === "aceptado" || e.estado === "rechazado"}
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerarPDF(e.id)}
                          title="Generar y Ver PDF"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDescargarPDF(e.id)}
                          title="Ver PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Diálogo de detalles de entrevista */}
      <Dialog open={mostrarDetalles} onOpenChange={setMostrarDetalles}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalles de la Entrevista</span>
              {entrevistaSeleccionada && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerarPDF(entrevistaSeleccionada.id)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Generar y Ver PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDescargarPDF(entrevistaSeleccionada.id)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Ver PDF
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          {entrevistaSeleccionada && (
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="fisico">Físico</TabsTrigger>
                <TabsTrigger value="entrevista">Entrevista</TabsTrigger>
                <TabsTrigger value="flebotomia">Flebotomía</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-4 space-y-2">
                <p>
                  <b>CUI:</b> {entrevistaSeleccionada.donante?.cui || "N/A"}
                </p>
                <p>
                  <b>Nombre:</b> {entrevistaSeleccionada.primer_nombre} {" "}
                  {entrevistaSeleccionada.segundo_nombre} {" "}
                  {entrevistaSeleccionada.primer_apellido} {" "}
                  {entrevistaSeleccionada.segundo_apellido}
                </p>
                <p>
                  <b>Edad:</b> {entrevistaSeleccionada.edad} años
                </p>
                <p>
                  <b>Sexo:</b> {entrevistaSeleccionada.sexo}
                </p>
                <p>
                  <b>Fecha de Nacimiento:</b> {formatearFecha(
                    entrevistaSeleccionada.fecha_nacimiento,
                  )}
                </p>
                <p>
                  <b>Correo:</b> {entrevistaSeleccionada.correo}
                </p>
                <p>
                  <b>Dirección Casa:</b> {entrevistaSeleccionada.direccion_casa}
                </p>
                <p>
                  <b>Teléfono Casa:</b> {entrevistaSeleccionada.telefono_casa}
                </p>
                <p>
                  <b>Celular:</b> {entrevistaSeleccionada.celular || "N/A"}
                </p>
                {entrevistaSeleccionada.direccion_trabajo && (
                  <p>
                    <b>Dirección Trabajo:</b> {entrevistaSeleccionada.direccion_trabajo}
                  </p>
                )}
                {entrevistaSeleccionada.telefono_trabajo && (
                  <p>
                    <b>Teléfono Trabajo:</b> {entrevistaSeleccionada.telefono_trabajo}
                  </p>
                )}
              </TabsContent>
              <TabsContent value="fisico" className="mt-4 space-y-2">
                <p>
                  <b>Peso:</b> {entrevistaSeleccionada.peso} kg
                </p>
                <p>
                  <b>Pulso:</b> {entrevistaSeleccionada.pulso} lpm
                </p>
                <p>
                  <b>Temperatura:</b> {entrevistaSeleccionada.temperatura} °C
                </p>
                <p>
                  <b>Hemoglobina:</b> {entrevistaSeleccionada.hemoglobina} g/dL
                </p>
                <p>
                  <b>Presión Arterial:</b> {entrevistaSeleccionada.presion_sistolica}/{" "}
                  {entrevistaSeleccionada.presion_diastolica} mmHg
                </p>
                <p>
                  <b>Hematocrito:</b> {entrevistaSeleccionada.hematocrito} %
                </p>
              </TabsContent>
              <TabsContent value="entrevista" className="mt-4 space-y-2">
                <h4 className="font-semibold mb-3">Respuestas de Entrevista</h4>
                {Object.entries(
                  entrevistaSeleccionada.respuestas_entrevista || {},
                ).map(([k, v]) => (
                  <p key={k}>
                    <b>{k}:</b>{" "}
                    <span
                      className={v === "Sí" ? "text-red-600" : "text-green-600"}
                    >
                      {v}
                    </span>
                  </p>
                ))}
                {entrevistaSeleccionada.respuestas_adicionales_entrevista &&
                  Object.keys(
                    entrevistaSeleccionada.respuestas_adicionales_entrevista,
                  ).length > 0 && (
                    <>
                      <h4 className="font-semibold mb-3 mt-4">
                        Respuestas Adicionales
                      </h4>
                      {Object.entries(
                        entrevistaSeleccionada.respuestas_adicionales_entrevista!,
                      ).map(([k, v]) => (
                        <p key={k}>
                          <b>{k}:</b>{" "}
                          <span className="text-blue-600">{v}</span>
                        </p>
                      ))}
                    </>
                  )}
                {entrevistaSeleccionada.respuestas_medicas_adicionales &&
                  Object.keys(
                    entrevistaSeleccionada.respuestas_medicas_adicionales,
                  ).length > 0 && (
                    <>
                      <h4 className="font-semibold mb-3 mt-4">
                        Respuestas Médicas Adicionales
                      </h4>
                      {Object.entries(
                        entrevistaSeleccionada.respuestas_medicas_adicionales!,
                      ).map(([k, v]) => (
                        <p key={k}>
                          <b>{k}:</b>{" "}
                          <span
                            className={v === "Sí" ? "text-red-600" : "text-green-600"}
                          >
                            {v}
                          </span>
                        </p>
                      ))}
                    </>
                  )}
                {entrevistaSeleccionada.respuestas_mujeres &&
                  Object.keys(entrevistaSeleccionada.respuestas_mujeres).length > 0 && (
                    <>
                      <h4 className="font-semibold mb-3 mt-4">
                        Respuestas Específicas para Mujeres
                      </h4>
                      {Object.entries(
                        entrevistaSeleccionada.respuestas_mujeres!,
                      ).map(([k, v]) => (
                        <p key={k}>
                          <b>{k}:</b>{" "}
                          <span
                            className={v === "Sí" ? "text-red-600" : "text-green-600"}
                          >
                            {v}
                          </span>
                        </p>
                      ))}
                    </>
                  )}
              </TabsContent>
              <TabsContent value="flebotomia" className="mt-4 space-y-2">
                <p>
                  <b>Hora Inicio:</b>{" "}
                  {entrevistaSeleccionada.hora_inicio_flebotomia || "N/A"}
                </p>
                <p>
                  <b>Hora Fin:</b>{" "}
                  {entrevistaSeleccionada.hora_finalizacion_flebotomia || "N/A"}
                </p>
                <p>
                  <b>Cantidad de Sangre:</b>{" "}
                  {entrevistaSeleccionada.cantidad_sangre || "N/A"} ml
                </p>
                <p>
                  <b>Reacciones Adversas:</b>{" "}
                  {entrevistaSeleccionada.reacciones_adversas ? "Sí" : "No"}
                </p>
                <p>
                  <b>Flebotomista:</b>{" "}
                  {entrevistaSeleccionada.nombre_flebotomista || "N/A"}
                </p>
                <p>
                  <b>Entrevistador:</b>{" "}
                  {entrevistaSeleccionada.nombre_entrevistador}
                </p>
                <p>
                  <b>Firma Donador:</b>{" "}
                  {entrevistaSeleccionada.firma_donador || "N/A"}
                </p>
                <p>
                  <b>Firma Entrevistador:</b>{" "}
                  {entrevistaSeleccionada.firma_entrevistador || "N/A"}
                </p>
                <p>
                  <b>Firma Flebotomista:</b>{" "}
                  {entrevistaSeleccionada.firma_flebotomista || "N/A"}
                </p>
                {entrevistaSeleccionada.observaciones_flebotomia && (
                  <p>
                    <b>Observaciones:</b> {entrevistaSeleccionada.observaciones_flebotomia}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Autorización/Rechazo */}
      <AutorizarEntrevistaDialog
        open={modalAutorizacion}
        onClose={() => setModalAutorizacion(false)}
        entrevista={entrevistaParaAutorizar}
        onEstadoCambiado={handleEstadoCambiado}
      />
    </PageLayout>
  )
}