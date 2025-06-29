import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Combobox } from "../ui/combobox"
import { Textarea } from "@/components/ui/textarea"

const ESTADOS = ["Normal", "Bajo", "Alto"]
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

export function ResultadoValidarExamen({ resultado, onValidate }: any) {
  const [parametros, setParametros] = useState(resultado.valores || [])
  const [observaciones, setObservaciones] = useState(resultado.observaciones || "")

  const handleParametroChange = (index: number, field: string, value: string) => {
    
    const nuevos = [...parametros]
    nuevos[index][field] = value
    setParametros(nuevos)
  }

  const handleGuardarValidacion = () => {
    onValidate(resultado.id, { valores: parametros, observaciones })
  }

  return (
    <div className="border p-4 rounded mb-4">
      <h4 className="font-bold text-lg mb-2">
        {resultado.examen} - Validación
      </h4>

      {parametros.map((p: any, i: number) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Parámetro</Label>
            <Input
              value={p.parametro}
              onChange={(e) => handleParametroChange(i, "parametro", e.target.value)}
            />
          </div>
          <div>
            <Label>Valor</Label>
            <Input
              value={p.valor}
              onChange={(e) => handleParametroChange(i, "valor", e.target.value)}
            />
          </div>
          <div>
          <Label>Unidad</Label>
          <Combobox
            items={UNIDADES.map((u) => ({ value: u, label: u }))}
            value={p.unidad}
            onChange={(e) => handleParametroChange(i,"unidad", e)}
            placeholder="Unidad"
          />
        </div>
        <div>
          <Label>Rango Normal</Label>
          <Input
            value={p.rango_normal}
            onChange={(e) => handleParametroChange(i,"rango_normal", e.target.value)}
          />
        </div>
          <div>
          <Label>Estado</Label>
          <Combobox
            value={p.estado}
            onChange={(e) => handleParametroChange(i, "estado", e)}
            items={ESTADOS.map((u) => ({ value: u, label: u }))}     
            placeholder="ESTADO"           
          />                      
          </div>
        </div>
      ))}

      <div className="space-y-3">
        <Label>Observaciones Generales</Label>
        <Textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Observaciones para validación"
          rows={2}
        />
      </div>

      <Button onClick={handleGuardarValidacion} className="mt-3">
        Guardar Validación
      </Button>
    </div>
  )
}
