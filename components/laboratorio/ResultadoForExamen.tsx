"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { parse } from "path"

function parseRango(rango: string) {
  if (!rango.includes("-")) return null
  const [min, max] = rango.split("-").map((v) => parseFloat(v.trim()))
  if (isNaN(min) || isNaN(max)) return null
  return { min, max }
}

function getEstado(valor: number, rango: string) {
  const parsed = parseRango(rango)
  if (!parsed) return "Normal"
  //if (valor ==parsed.min || valor==parsed.max) return "Limite Normal"
  if (valor < parsed.min) return "Bajo"
  if (valor > parsed.max) return "Alto"
  return "Normal"
}

export function ResultadoFormExamen({ detalle, onSave }: any) {
  const examen = detalle.examen

  const [parametros, setParametros] = useState<any[]>([])
  const [observacionGeneral, setObservacionGeneral] = useState("")

  useEffect(() => {
    if (examen.valores_referencia) {
      try {
        const valoresRef = JSON.parse(examen.valores_referencia)
        if (Array.isArray(valoresRef)) {
          const mapped = valoresRef.map((v: any) => ({
            parametro: v.parametro,
            valor: "",
            unidad: v.unidad || "",
            rango_normal: v.rango || "",
            estado: "No Valor",
            observacion: "",
          }))
          setParametros(mapped)
        }
      } catch (e) {
        console.error("Valores de referencia mal formateados", e)
        setParametros([])
      }
    }
  }, [examen.valores_referencia])

  useEffect(() => {
    onSave(detalle.id, {
      valores: parametros,
      observaciones: observacionGeneral,
    })
  }, [parametros, observacionGeneral])

  const handleValorChange = (index: number, valor: string) => {
    const numValor = parseFloat(valor)
    const estado = isNaN(numValor)
      ? "No valor"
      : getEstado(numValor, parametros[index].rango_normal)

    const updated = [...parametros]
    updated[index].valor = valor
    updated[index].estado = estado
    setParametros(updated)
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

  return (
    <div className="border p-4 rounded mb-4">
      <h4 className="font-bold text-lg mb-2">
        {examen.codigo} - {examen.nombre}
      </h4>

      {parametros.length > 0 ? (
        <div className="space-y-4">
          {parametros.map((p, i) => (
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
        <p className="text-gray-500 italic">Sin valores de referencia configurados para este examen.</p>
      )}

      <div className="space-y-3 mt-4">
        <Label>Observación General</Label>
        <Textarea
          id="observacion"
          value={observacionGeneral}
          onChange={(e) => setObservacionGeneral(e.target.value)}
          placeholder="Observación para este resultado"
          rows={2}
        />
      </div>
    </div>
  )
}
