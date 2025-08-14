"use client"

import { UnidadSangre } from "@/types/BancoSangre"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MapPin, SendHorizonal } from "lucide-react"
import { Button } from "../ui/button"

interface UnidadDetallesDialogProps {
  open: boolean
  onClose: () => void
  unidad: UnidadSangre | null,
   onAddSalida: (unidad: UnidadSangre) => void
  getEstadoColor: (estado: string) => string
  getVencimientoColor: (dias: number) => string
}

export function UnidadDetallesDialog({
  open, onClose, unidad, getEstadoColor, getVencimientoColor, onAddSalida,
}: UnidadDetallesDialogProps) {
  if (!unidad) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles de la Unidad</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 width-auto">
          <p><b>Código:</b> {unidad.id}</p>
          <p><b>Tipo:</b> {unidad.tipo_unidad}</p>
          <p><b>Correlativo - Lote:</b> {unidad.correlativo} - {unidad.lote?.codigo ?? ""}</p>
          <p><b>Volumen:</b> {unidad.volumen_ml}ml</p>
          <p><b>Grupo:</b> {unidad.tipo_sangre}</p>
          <p><b>Estado:</b> <span className={`${getEstadoColor(unidad.estado)}`}>{unidad.estado}</span></p>
          <p><b>Extracción:</b> {unidad.fecha_extraccion}</p>
          <p><b>Vencimiento:</b> <span className={`${getVencimientoColor(unidad.dias_vigencia)}`}>{unidad.fecha_caducidad} ({unidad.dias_vigencia} días)</span></p>
          <p><b>Condiciones de Almacenamiento:</b> {unidad.condiciones_almacenamiento}  </p>
          <p className="flex"><b>Localizacion:</b><MapPin className="h-4 w-4 mr-1" /> {unidad.localizacion}</p>
        </div>
        <p className="mt-4"><b>Observaciones:</b> {unidad.observaciones}</p>
         {unidad.estado === "DISPONIBLE" && (
          <Button className="w-full" onClick={() => onAddSalida(unidad)}>
            <SendHorizonal className="h-4 w-4 mr-1 text-white-500" /> Salida
          </Button>
        )}
      </DialogContent>      
    </Dialog>
  )
}
