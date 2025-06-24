"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMemo, useState } from "react"

interface Examen {
  id: number
  codigo: string
  nombre: string
  categoria: string
}

interface ExamenSelectorProps {
  examenes: Examen[]
  selected: Examen[]
  onChange: (selected: Examen[]) => void
  error?: string
}

export function ExamenSelector({ examenes, selected, onChange, error }: ExamenSelectorProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return examenes.filter((e) =>
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.codigo.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, examenes])

  const grouped = useMemo(() => {
    const group: Record<string, Examen[]> = {}
    filtered.forEach((e) => {
      const key = e.categoria || "Sin categoría"
      if (!group[key]) group[key] = []
      group[key].push(e)
    })
    return group
  }, [filtered])

  const toggleExamen = (examen: Examen, checked: boolean) => {
    if (checked) {
      onChange([...selected, examen])
    } else {
      onChange(selected.filter((se) => se.id !== examen.id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Seleccione Exámenes *</Label>
        <span className="text-sm text-gray-500">Seleccionados: {selected.length}</span>
      </div>

      <Input
        type="text"
        placeholder="Buscar examen por nombre o código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-4">
        {Object.entries(grouped).map(([categoria, lista]) => (
          <div key={categoria}>
            <h4 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">{categoria}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lista.map((e) => (
                <div key={e.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selected.some((se) => se.id === e.id)}
                    onChange={(ev) => toggleExamen(e, ev.target.checked)}
                  />
                  <span>{e.codigo} - {e.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
