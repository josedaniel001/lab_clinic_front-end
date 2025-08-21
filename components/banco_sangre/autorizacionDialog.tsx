"use client"

import { useState } from "react"
import { Salida } from "@/app/banco_sangre/salida_muestras/page"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface AutorizacionDialogProps {
  open: boolean
  onClose: () => void
  salida: Salida | null
  onAutorizar: (salidaId: number) => void
  onRechazar: (salidaId: number, motivo: string) => void
}

export function AutorizacionDialog({
  open,
  onClose,
  salida,
  onAutorizar,
  onRechazar,
}: AutorizacionDialogProps) {
  const [motivoRechazo, setMotivoRechazo] = useState("")
  const [accion, setAccion] = useState<"autorizar" | "rechazar" | null>(null)

  const handleAutorizar = () => {
    if (salida) {
      onAutorizar(salida.id)
    }
  }

  const handleRechazar = () => {
    if (salida && motivoRechazo.trim()) {
      onRechazar(salida.id, motivoRechazo.trim())
    }
  }

  const handleClose = () => {
    setMotivoRechazo("")
    setAccion(null)
    onClose()
  }

  if (!salida) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="space-y-4 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {accion === "autorizar" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : accion === "rechazar" ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            {accion === "autorizar" ? "Autorizar Salida" : 
             accion === "rechazar" ? "Rechazar Salida" : 
             "Acción de Salida"}
          </DialogTitle>
        </DialogHeader>

        {!accion ? (
          <>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Salida #{salida.id}</h4>
                                 <div className="text-sm text-blue-700 space-y-1">
                   <p><strong>Receptor:</strong> {salida.receptor}</p>
                   <p><strong>Médico:</strong> {salida.medico_solicitante}</p>
                   <p><strong>Unidades:</strong> {salida.total_unidades}</p>
                   {salida.observaciones && (
                     <p><strong>Observaciones:</strong> {salida.observaciones}</p>
                   )}
                 </div>
              </div>

              <p className="text-sm text-gray-600">
                Selecciona la acción que deseas realizar con esta salida:
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setAccion("autorizar")}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Autorizar
              </Button>
              <Button
                onClick={() => setAccion("rechazar")}
                variant="outline"
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            </div>
          </>
        ) : accion === "autorizar" ? (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Confirmar Autorización</h4>
              </div>
              <p className="text-sm text-green-700">
                ¿Estás seguro de que deseas autorizar la salida #{salida.id}? 
                Esta acción permitirá que las unidades sean entregadas al receptor.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAccion(null)}>
                Cancelar
              </Button>
              <Button onClick={handleAutorizar} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Autorización
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-800">Confirmar Rechazo</h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                ¿Estás seguro de que deseas rechazar la salida #{salida.id}? 
                Esta acción impedirá que las unidades sean entregadas.
              </p>
              
              <div>
                <label className="text-sm font-medium text-red-700 mb-2 block">
                  Motivo del rechazo *
                </label>
                <Textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Especifica el motivo del rechazo..."
                  rows={3}
                  className="border-red-300 focus:border-red-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAccion(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleRechazar} 
                disabled={!motivoRechazo.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirmar Rechazo
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
