"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Download } from "lucide-react"

interface QRGeneratorProps {
  onGenerate: (text: string) => void
}

export function QRGenerator({ onGenerate }: QRGeneratorProps) {
  const [qrText, setQrText] = useState("")

  const generateQR = () => {
    if (qrText.trim()) {
      onGenerate(qrText.trim())
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-semibold text-gray-700">Generar Código QR de Prueba</h4>
      <div className="space-y-2">
        <Input
          placeholder="Texto para el código QR (ej: correlativo de unidad)"
          value={qrText}
          onChange={(e) => setQrText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              generateQR()
            }
          }}
        />
        <Button 
          onClick={generateQR}
          disabled={!qrText.trim()}
          className="w-full"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Generar QR
        </Button>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>💡 <strong>Consejo:</strong> Puedes usar el correlativo de una unidad existente para probar el escáner.</p>
        <p>Ejemplo: "PL-2024-001" o "PQ-2024-002"</p>
      </div>
    </div>
  )
}
