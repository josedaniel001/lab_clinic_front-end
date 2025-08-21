"use client"

import { useState } from "react"
import { entrevistasAPI, EntrevistaDonante } from "@/api/entrevistasAPI"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, User, FileText, AlertTriangle } from "lucide-react"
import { useNotification } from "@/hooks/useNotification"

interface AutorizarEntrevistaDialogProps {
  open: boolean
  onClose: () => void
  entrevista: EntrevistaDonante | null
  onEstadoCambiado: () => void
}

export function AutorizarEntrevistaDialog({
  open,
  onClose,
  entrevista,
  onEstadoCambiado
}: AutorizarEntrevistaDialogProps) {
  const [accion, setAccion] = useState<"autorizar" | "rechazar" | null>(null)
  const [observaciones, setObservaciones] = useState("")
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const handleAutorizar = async () => {
    if (!entrevista) return
    
    try {
      setLoading(true)
      await entrevistasAPI.cambiarEstado(entrevista.id, "aceptado", observaciones)
      showNotification("Entrevista autorizada exitosamente", "success")
      onEstadoCambiado()
      onClose()
      resetForm()
    } catch (error: any) {
      showNotification(`Error al autorizar: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleRechazar = async () => {
    if (!entrevista) return
    
    if (!observaciones.trim()) {
      showNotification("Debe proporcionar observaciones para rechazar la entrevista", "error")
      return
    }
    
    try {
      setLoading(true)
      await entrevistasAPI.cambiarEstado(entrevista.id, "rechazado", observaciones)
      showNotification("Entrevista rechazada exitosamente", "success")
      onEstadoCambiado()
      onClose()
      resetForm()
    } catch (error: any) {
      showNotification(`Error al rechazar: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAccion(null)
    setObservaciones("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!entrevista) return null

  const puedeModificar = entrevista.estado === "pendiente" || entrevista.estado === "en proceso"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Autorizar/Rechazar Entrevista
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la entrevista */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">
                {entrevista.primer_nombre} {entrevista.primer_apellido}
              </h3>
              <Badge variant="outline">{entrevista.correlativo}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <p><strong>CUI:</strong> {entrevista.donante?.cui || "N/A"}</p>
              <p><strong>Edad:</strong> {entrevista.edad} años</p>
              <p><strong>Sexo:</strong> {entrevista.sexo}</p>
              <p><strong>Tipo Sangre:</strong> {entrevista.tipo_sangre}</p>
              <p><strong>Estado Actual:</strong></p>
              <Badge 
                className={
                  entrevista.estado === "aceptado" ? "bg-green-100 text-green-800" :
                  entrevista.estado === "rechazado" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }
              >
                {entrevista.estado.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Verificación de estado */}
          {!puedeModificar && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-yellow-800 font-medium">
                  Esta entrevista ya no puede ser modificada
                </p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                El estado actual es "{entrevista.estado}" y no permite cambios.
              </p>
            </div>
          )}

          {/* Selección de acción */}
          {puedeModificar && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Seleccione una acción:</h4>
                <div className="flex gap-3">
                  <Button
                    variant={accion === "autorizar" ? "default" : "outline"}
                    onClick={() => setAccion("autorizar")}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Autorizar Entrevista
                  </Button>
                  <Button
                    variant={accion === "rechazar" ? "destructive" : "outline"}
                    onClick={() => setAccion("rechazar")}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar Entrevista
                  </Button>
                </div>
              </div>

              {/* Observaciones */}
              {accion && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Observaciones {accion === "rechazar" && "(Obligatorio)"}:
                  </label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder={
                      accion === "autorizar" 
                        ? "Observaciones opcionales para la autorización..."
                        : "Debe proporcionar el motivo del rechazo..."
                    }
                    rows={4}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Botones de acción */}
              {accion && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={accion === "autorizar" ? handleAutorizar : handleRechazar}
                    disabled={loading || (accion === "rechazar" && !observaciones.trim())}
                    className="flex items-center gap-2"
                    variant={accion === "autorizar" ? "default" : "destructive"}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : accion === "autorizar" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {accion === "autorizar" ? "Autorizar" : "Rechazar"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Botón de cerrar si no se puede modificar */}
          {!puedeModificar && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
