import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Combobox } from "../ui/combobox"
import { Textarea } from "@/components/ui/textarea"

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

const ESTADOS = ["Normal", "Bajo", "Alto"]

export function ResultadoFormExamen({ detalle, onSave }: any) {
  const examen = detalle.examen

  const [parametros, setParametros] = useState<any[]>([])
  const [observacionGeneral, setObservacionGeneral] = useState("")
  const [nuevoParametro, setNuevoParametro] = useState<any>({
    parametro: "",
    valor: "",
    unidad: "",
    rango_normal: "",
    estado: "Normal",
    observacion: "",
  })

  const handleChange = (name: string, value: string) => {
    setNuevoParametro((prev: any) => ({ ...prev, [name]: value }))
  }

  const agregarParametro = () => {
    if (!nuevoParametro.parametro) return
    const updatedParametros = [...parametros, nuevoParametro]
    setParametros(updatedParametros)

    // Guarda TODO junto: parámetros + observación
    onSave(detalle.id, {
      valores: updatedParametros,
      observaciones: observacionGeneral
    })

    setNuevoParametro({
      parametro: "",
      valor: "",
      unidad: "",
      rango_normal: "",
      estado: "Normal",
      observacion: "",
    })
  }

  return (
    <div className="border p-4 rounded mb-4">
      <h4 className="font-bold text-lg mb-2">
        {examen.codigo} - {examen.nombre}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* ...campos del parámetro... */}
        <div>
          <Label>Parámetro</Label>
          <Input
            value={nuevoParametro.parametro}
            onChange={(e) => handleChange("parametro", e.target.value)}
          />
        </div>
        <div>
          <Label>Valor</Label>
          <Input
            type="number"
            value={nuevoParametro.valor}
            onChange={(e) => handleChange("valor", e.target.value)}
          />
        </div>
        <div>
          <Label>Unidad</Label>
          <Combobox
            items={UNIDADES.map((u) => ({ value: u, label: u }))}
            value={nuevoParametro.unidad}
            onChange={(e) => handleChange("unidad", e)}
            placeholder="Unidad"
          />
        </div>
        <div>
          <Label>Rango Normal</Label>
          <Input
            value={nuevoParametro.rango_normal}
            onChange={(e) => handleChange("rango_normal", e.target.value)}
          />
        </div>
        <div>
          <Label>Estado</Label>
          <Combobox
            value={nuevoParametro.estado}
            onChange={(e) => handleChange("estado", e)}
            items={ESTADOS.map((u) => ({ value: u, label: u }))}     
            placeholder="ESTADO"           
          />
        </div>
      </div>

      <Button variant="outline" onClick={agregarParametro} className="mb-4">
        + Agregar Parámetro
      </Button>

      <div className="mb-4">
        {parametros.length > 0 ? (
          <ul className="text-sm list-disc pl-5">
            {parametros.map((p, i) => (
              <li key={i}>{p.parametro} - {p.valor} {p.unidad} ({p.estado})</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Sin parámetros aún.</p>
        )}
      </div>

      <div className="space-y-3 md:col-span-3">
        <Label>Observación General</Label>
        <Textarea
          id="observacion"
          value={observacionGeneral}
          onChange={(e) => {
            setObservacionGeneral(e.target.value)
            // Siempre actualiza la observación junto con los parámetros actuales
            onSave(detalle.id, {
              valores: parametros,
              observaciones: e.target.value
            })
          }}
          placeholder="Observación para este resultado"
          rows={2}
        />
      </div>
    </div>
  )
}
