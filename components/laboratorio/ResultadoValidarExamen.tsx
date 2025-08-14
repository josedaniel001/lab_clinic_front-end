import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

function parseRango(rango: string) {
  if (!rango.includes("-")) return null
  const [min, max] = rango.split("-").map((v) => parseFloat(v.trim()))
  if (isNaN(min) || isNaN(max)) return null
  return { min, max }
}

function getEstado(valor: number, rango: string) {
  const parsed = parseRango(rango)
  if (!parsed) return "Normal"
  if (valor < parsed.min) return "Bajo"
  if (valor > parsed.max) return "Alto"
  return "Normal"
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "Normal":
      return "bg-green-100 text-green-700"
    case "Limite Normal":
      return "bg-yellow-200 text-yellow-700"
    case "Bajo":
      return "bg-red-100 text-yellow-700"
    case "Alto":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function ResultadoValidarExamen({ resultado, onValidate }: any) {
  const [parametros, setParametros] = useState(resultado.valores || [])
  const [observaciones, setObservaciones] = useState(resultado.observaciones || "")

  const handleValorChange = (index: number, valor: string) => {
    const numValor = parseFloat(valor)
    const estado = isNaN(numValor)
      ? "No valor"
      : getEstado(numValor, parametros[index].rango_normal)

    const nuevos = [...parametros]
    nuevos[index].valor = valor
    nuevos[index].estado = estado
    setParametros(nuevos)
  }

  const handleGuardarValidacion = () => {
    onValidate(resultado.id, { valores: parametros, observaciones })
  }

  return (
    <div className="border p-4 rounded mb-4">
      <h4 className="font-bold text-lg mb-2">
        {resultado.examen} - Segunda Validación
      </h4>

      {parametros.length > 0 ? (
        <div className="space-y-4">
          {parametros.map((p: any, i: number) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <div>
                <Label>Parámetro</Label>
                <Input value={p.parametro} readOnly />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={p.valor}
                  onChange={(e) => handleValorChange(i, e.target.value)}
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Input value={p.unidad} readOnly />
              </div>
              <div>
                <Label>Rango Normal</Label>
                <Input value={p.rango_normal} readOnly />
              </div>
              <div>
                <Label>Estado</Label>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                    p.estado
                  )}`}
                >
                  {p.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Sin parámetros para validar.</p>
      )}

      <div className="space-y-3 mt-4">
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
