"use client"

import { Salida } from "@/app/banco_sangre/salida_muestras/page"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, User, Droplets, Package } from "lucide-react"

interface DetallesSalidaDialogProps {
  open: boolean
  onClose: () => void
  salida: Salida | null
}

export function DetallesSalidaDialog({
  open,
  onClose,
  salida,
}: DetallesSalidaDialogProps) {
  if (!salida) return null

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE": return "bg-yellow-100 text-yellow-800"
      case "AUTORIZADA": return "bg-green-100 text-green-800"
      case "RECHAZADA": return "bg-red-100 text-red-800"
      case "COMPLETADA": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getVencimientoColor = (dias: number) => {
    if (dias <= 0) return "text-red-600"
    if (dias <= 7) return "text-orange-600"
    if (dias <= 30) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de Salida #{salida.correlativo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Información General
              </h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Receptor:</span> {salida.receptor}</p>
                <p><span className="font-medium">Médico:</span> {salida.medico_solicitante}</p>
                {salida.cedula_receptor && (
                  <p><span className="font-medium">Cédula:</span> {salida.cedula_receptor}</p>
                )}
                <p><span className="font-medium">Técnico:</span> {salida.tecnico_salida_nombre}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas y Estado
              </h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Fecha de salida:</span> {new Date(salida.fecha_salida).toLocaleString('es-ES')}</p>
                {salida.fecha_autorizacion && (
                  <p><span className="font-medium">Fecha autorización:</span> {new Date(salida.fecha_autorizacion).toLocaleString('es-ES')}</p>
                )}
                <p><span className="font-medium">Estado:</span> 
                  <Badge className={`ml-2 ${getEstadoColor(salida.estado)}`}>
                    {salida.estado}
                  </Badge>
                </p>
                {salida.autorizado_por && (
                  <p><span className="font-medium">Autorizado por:</span> {salida.autorizado_por}</p>
                )}
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {salida.observaciones && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Observaciones</h4>
              <p className="text-sm text-blue-800">{salida.observaciones}</p>
            </div>
          )}

          {/* Motivo de rechazo */}
          {salida.estado === "RECHAZADA" && salida.motivo_rechazo && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Motivo de Rechazo</h4>
              <p className="text-sm text-red-800">{salida.motivo_rechazo}</p>
            </div>
          )}

          {/* Resumen de unidades */}
          {salida.resumen_unidades && salida.resumen_unidades.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Resumen de Unidades
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {salida.resumen_unidades.map((resumen, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <p className="font-medium text-sm text-gray-900">{resumen.unidad__tipo_unidad}</p>
                    <p className="text-lg font-bold text-green-600">{resumen.cantidad}</p>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalles de unidades */}
          {salida.detalles && salida.detalles.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Detalles de Unidades ({salida.detalles.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {salida.detalles.map((detalle, index) => (
                  <div key={detalle.id} className="p-3 border rounded-lg bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{detalle.unidad_correlativo}</span>
                          <Badge variant="outline" className="text-xs">
                            {detalle.unidad_tipo}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {detalle.unidad_tipo_sangre}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                          <p><span className="font-medium">Volumen:</span> {detalle.unidad_volumen}ml</p>
                          <p><span className="font-medium">Caducidad:</span> {new Date(detalle.unidad_fecha_caducidad).toLocaleDateString('es-ES')}</p>
                          <p><span className="font-medium">Días vigencia:</span> 
                            <span className={`ml-1 ${getVencimientoColor(detalle.unidad_dias_vigencia)}`}>
                              {detalle.unidad_dias_vigencia}
                            </span>
                          </p>
                          <p><span className="font-medium">Incluida:</span> {new Date(detalle.fecha_inclusion).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
