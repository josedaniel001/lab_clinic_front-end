"use client"

import { UnidadSangre } from "@/types/BancoSangre"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Package } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"

interface SalidaDialogProps {
  open: boolean
  onClose: () => void
  formSalida: any
  setFormSalida: any
  procesarSalida: () => void
  removerUnidadSalida?: (unidadId: number) => void
  puedeEditarFecha?: boolean
}

export function SalidaDialog({
  open,
  onClose,
  formSalida,
  setFormSalida,
  procesarSalida,
  removerUnidadSalida,
  puedeEditarFecha = false,
}: SalidaDialogProps) {
  const { user } = useAuth()

  // Cuando abre el modal, setea la fecha y usuario si no están
  useEffect(() => {
    if (open) {
      const ahora = new Date()
      const isoAhora = ahora.toISOString().slice(0, 16)

      setFormSalida((prev: any) => ({
        ...prev,
        fecha_salida: prev.fecha_salida || isoAhora,
        tecnico_id: user?.id || null,
        tecnico_nombre: user?.display_name || "Usuario no identificado",
      }))
    }
  }, [open, user])

  const handleRemoverUnidad = (unidadId: number) => {
    if (removerUnidadSalida) {
      removerUnidadSalida(unidadId)
    } else {
      // Fallback si no se pasa la función
      setFormSalida({
        ...formSalida,
        unidades_seleccionadas: formSalida.unidades_seleccionadas.filter(
          (x: UnidadSangre) => x.id !== unidadId
        ),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Salida de Muestras</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            Los campos marcados con * son obligatorios
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Receptor *</label>
            <Input
              placeholder="Nombre del receptor"
              value={formSalida.receptor}
              onChange={(e) =>
                setFormSalida({ ...formSalida, receptor: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Cédula del Receptor *</label>
            <Input
              placeholder="Cédula del receptor"
              value={formSalida.cedula_receptor}
              onChange={(e) =>
                setFormSalida({ ...formSalida, cedula_receptor: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Médico Solicitante *
          </label>
          <Input
            placeholder="Nombre del médico solicitante"
            value={formSalida.medico_solicitante}
            onChange={(e) =>
              setFormSalida({ ...formSalida, medico_solicitante: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Fecha de Salida *
          </label>
          <Input
            type="datetime-local"
            value={formSalida.fecha_salida}
            onChange={(e) =>
              setFormSalida({ ...formSalida, fecha_salida: e.target.value })
            }
            disabled={!puedeEditarFecha}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Observaciones
          </label>
          <Textarea
            placeholder="Observaciones adicionales"
            value={formSalida.observaciones}
            onChange={(e) =>
              setFormSalida({ ...formSalida, observaciones: e.target.value })
            }
            rows={3}
          />
        </div>

        {/* Resumen de unidades */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-700">
              Unidades seleccionadas:{" "}
              <span className="font-semibold text-blue-600">
                {formSalida.unidades_seleccionadas?.length || 0}
              </span>
            </h4>
          </div>

          {formSalida.unidades_seleccionadas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No hay unidades seleccionadas</p>
              <p className="text-sm">Usa el escáner QR o selecciona unidades del inventario</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {formSalida.unidades_seleccionadas.map((u: UnidadSangre) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {u.correlativo}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {u.tipo_unidad}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {u.tipo_sangre}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {u.volumen_ml}ml • {u.localizacion}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoverUnidad(u.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={procesarSalida}
            disabled={
              !formSalida.receptor || 
              !formSalida.cedula_receptor || 
              !formSalida.medico_solicitante || 
              !formSalida.fecha_salida ||
              formSalida.unidades_seleccionadas.length === 0
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            Procesar Salida
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
