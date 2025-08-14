// components/ui/Stepper.tsx
"use client"

import { LucideIcon } from "lucide-react"

interface Paso {
  id: number
  titulo: string
  icono: LucideIcon
}

interface StepperProps {
  pasos: Paso[]
  pasoActual: number
}

export function Stepper({ pasos, pasoActual }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {pasos.map((paso, i) => {
        const Icono = paso.icono
        const completado = pasoActual > paso.id
        const activo = pasoActual === paso.id

        return (
          <div key={paso.id} className="flex items-center w-full">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                completado
                  ? "bg-green-500 border-green-500 text-white"
                  : activo
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              <Icono className="h-5 w-5" />
            </div>
            <div className="ml-3 text-left">
              <p className={`text-sm font-medium ${completado || activo ? "text-gray-900" : "text-gray-400"}`}>
                Paso {paso.id}
              </p>
              <p className={`text-xs ${completado || activo ? "text-gray-600" : "text-gray-400"}`}>{paso.titulo}</p>
            </div>
            {paso.id < pasos.length && (
              <div className={`w-full h-0.5 mx-4 ${completado ? "bg-green-500" : "bg-gray-300"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
