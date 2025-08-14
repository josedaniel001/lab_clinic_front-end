"use client"

import { UnidadSangre } from "@/types/BancoSangre"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth" // Asumo que tienes este hook para auth

interface SalidaDialogProps {
  open: boolean
  onClose: () => void
  formSalida: any
  setFormSalida: any
  procesarSalida: () => void
  puedeEditarFecha?: boolean
}

export function SalidaDialog({
  open,
  onClose,
  formSalida,
  setFormSalida,
  procesarSalida,
  puedeEditarFecha = false,
}: SalidaDialogProps) {
  const { user } = useAuth() // Trae el usuario logueado

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Nueva Salida</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            Los campos marcados con * son obligatorios
          </p>
        </DialogHeader>

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

        <div>
          <label className="text-sm font-medium text-gray-700">Médico Solicitante *</label>
          <Input
            placeholder="Nombre del médico solicitante"
            value={formSalida.medico_solicitante}
            onChange={(e) =>
              setFormSalida({ ...formSalida, medico_solicitante: e.target.value })
            }
            required
          />
        </div>

        {/* Técnico */}
        <div>
          <label className="text-sm font-medium text-gray-700">Técnico Da Salida</label>
          <Input
            value={formSalida.tecnico_nombre || ""}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Fecha y hora */}
        <div>
          <label className="text-sm font-medium text-gray-700">Fecha de Salida</label>
          <Input
            type="datetime-local"
            value={formSalida.fecha_salida}
            onChange={(e) =>
              setFormSalida({ ...formSalida, fecha_salida: e.target.value })
            }
            disabled={!puedeEditarFecha}
          />
        </div>

        <Textarea
          placeholder="Observaciones"
          value={formSalida.observaciones}
          onChange={(e) =>
            setFormSalida({ ...formSalida, observaciones: e.target.value })
          }
        />

        {/* Resumen de unidades */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Unidades seleccionadas:{" "}
            <span className="font-semibold text-black">
              {formSalida.unidades_seleccionadas?.length || 0}
            </span>
          </p>

          {formSalida.unidades_seleccionadas.map((u: UnidadSangre) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-2 border rounded"
            >
              <span className="text-sm">
                {u.tipo_unidad} ({u.correlativo})
              </span>
              <button
                className="text-red-500"
                onClick={() =>
                  setFormSalida({
                    ...formSalida,
                    unidades_seleccionadas: formSalida.unidades_seleccionadas.filter(
                      (x: UnidadSangre) => x.id !== u.id
                    ),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={procesarSalida}
            disabled={!formSalida.receptor || !formSalida.cedula_receptor || !formSalida.medico_solicitante || formSalida.unidades_seleccionadas.length === 0}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
