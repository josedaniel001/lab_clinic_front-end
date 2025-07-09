import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

export function SerologiasInput({ serologias, setSerologias }: {
  serologias: { key: string; value: string }[]
  setSerologias: (s: { key: string; value: string }[]) => void
}) {
  const handleChange = (index: number, field: "key" | "value", value: string) => {
    const updated = [...serologias]
    updated[index][field] = value
    setSerologias(updated)
  }

  const handleAdd = () => {
    setSerologias([...serologias, { key: "", value: "" }])
  }

  const handleRemove = (index: number) => {
    const updated = [...serologias]
    updated.splice(index, 1)
    setSerologias(updated)
  }

  return (
    <div className="space-y-2">
      <Label>Serologías</Label>
      {serologias.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Clave (Ej: HIV)"
            value={item.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
          />
          <Input
            placeholder="Valor (Ej: Negativo)"
            value={item.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
          />
          <Button variant="ghost" onClick={() => handleRemove(index)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={handleAdd}>Agregar Serología</Button>
    </div>
  )
}
