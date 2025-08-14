import { Info, Clock } from "lucide-react"
import { CONFIGURACION_TIPOS_UNIDAD } from "@/utils/fechaCaducidad"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CaducidadInfoProps {
  tipoUnidad?: string
}

export function CaducidadInfo({ tipoUnidad }: CaducidadInfoProps) {
  if (!tipoUnidad) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-gray-500 cursor-help">
              <Info className="h-3 w-3" />
              <span>Tiempos de caducidad</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">Tiempos de caducidad por tipo:</p>
              {Object.entries(CONFIGURACION_TIPOS_UNIDAD).map(([key, config]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span>{config.nombre}:</span>
                  <span className="font-medium">{config.diasCaducidad} días</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const config = CONFIGURACION_TIPOS_UNIDAD[tipoUnidad]
  if (!config) return null

  return (
    <div className="flex items-center gap-1 text-xs text-blue-600">
      <Clock className="h-3 w-3" />
      <span>{config.diasCaducidad} días</span>
    </div>
  )
} 