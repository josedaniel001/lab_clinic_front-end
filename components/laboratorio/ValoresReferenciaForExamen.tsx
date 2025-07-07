"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Combobox } from "../ui/combobox"
export type ValorReferencia = {
  parametro: string
  rango: string
  unidad: string
}

interface ValoresReferenciaInputProps {
  valores: ValorReferencia[]
  onChange: (valores: ValorReferencia[]) => void
}

export default function ValoresReferenciaInput({ valores, onChange }: ValoresReferenciaInputProps) {
  const handleAdd = () => {
    onChange([...valores, { parametro: "", rango: "", unidad: "" }])
  }

 const UNIDADES = [
        "%", 
    "Copias/mL",
    "Positivo / Negativo",
    "Presencia / Ausencia",
    "Título (1:2, 1:4, etc.)",
    "UI/L",
    "U/µL",
    "g/dL",
    "mEq/L",
    "mg/dL",
    "mL/min",
    "mmol/L",
    "mUI/mL",
    "ng/dL",
    "ng/mL",
    "pg/mL",
    "ug/L",
    "x10³/μL",
    "x10⁶/μL",
    "µIU/mL",
    "μmol/L"
    ]


  const handleRemove = (index: number) => {
    const nuevos = [...valores]
    nuevos.splice(index, 1)
    onChange(nuevos)
  }

  const handleChange = (index: number, field: keyof ValorReferencia, value: string) => {
    //console.log("Data que cambio:"+field+" "+value  )
    const nuevos = [...valores]
    nuevos[index][field] = value
    onChange(nuevos)
  }

  return (
    <div className="space-y-2">
      <Label>Valores de Referencia</Label>
      {valores.map((valor, index) => (
        <div key={index} className="flex gap-3 mb-2">
          <Input
            placeholder="Parámetro"
            value={valor.parametro}
            onChange={(e) => handleChange(index, "parametro", e.target.value)}
          />
          <Input
            placeholder="Rango"
            value={valor.rango}
            onChange={(e) => handleChange(index, "rango", e.target.value)}
          />
          <Combobox
                      items={UNIDADES.map((u) => ({ value: u, label: u }))}
                      value={valor.unidad}
                      onChange={(e) => handleChange(index,"unidad", e)}
                      placeholder="Unidad"
                    />
          <Button
            variant="outline"
            onClick={() => handleRemove(index)}
            className="text-red-500"
          >
            X
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={handleAdd}>
        + Agregar Parámetro
      </Button>
    </div>
  )
}
