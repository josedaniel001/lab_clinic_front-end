"use client"

import { Eye, Plus } from "lucide-react"
import { UnidadSangre } from "@/types/BancoSangre"
import { Button } from "@/components/ui/button"

interface UnidadCardProps {
  unidad: UnidadSangre
  onView: (unidad: UnidadSangre) => void
  onAddSalida: (unidad: UnidadSangre) => void
  getEstadoColor: (estado: string) => string
  getVencimientoColor: (dias: number) => string
}

export function UnidadCard({
  unidad,
  onView,
  onAddSalida,
  getEstadoColor,
  getVencimientoColor
}: UnidadCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{unidad.tipo_unidad.replace("_"," ")}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(unidad.estado)}`}>
          {unidad.estado}
        </span>
      </div>

      <p className="text-sm text-gray-600 font-mono mb-4">{unidad.correlativo}</p>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <span className="font-medium text-gray-700">Correlativo:</span>
          <p className="text-gray-600">{unidad.correlativo}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Volumen:</span>
          <p className="text-gray-600">{unidad.volumen_ml} ml</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Grupo:</span>
          <p className="text-gray-600">{unidad.tipo_sangre}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Lote:</span>
          <p className="text-gray-600">{unidad.lote?.codigo ?? "Sin código"}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Vencimiento:</span>
          <span className={`text-sm font-medium ${getVencimientoColor(unidad.dias_vigencia)}`}>
            {unidad.dias_vigencia} días
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, (unidad.dias_vigencia / 365) * 100))}%` }}
          ></div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" className="w-full" onClick={() => onView(unidad)}>
          <Eye className="h-4 w-4 mr-1" /> Ver
        </Button>
        {unidad.estado === "DISPONIBLE" && (
          <Button className="w-full" onClick={() => onAddSalida(unidad)}>
            <Plus className="h-4 w-4 mr-1" /> Salida
          </Button>
        )}
      </div>
    </div>
  )
}
