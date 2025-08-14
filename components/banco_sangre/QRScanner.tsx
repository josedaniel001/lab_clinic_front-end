"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { X, Camera, CameraOff } from "lucide-react"

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      startScanner()
    }

    return () => {
      if (scannerRef.current) {
        stopScanner()
      }
    }
  }, [isOpen])

  const startScanner = async () => {
    try {
      setError("")
      setIsScanning(true)

      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso a la cámara")
      }

      // Verificar permisos de cámara
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
      } catch (permissionError) {
        throw new Error("Permiso de cámara denegado. Por favor, permite el acceso a la cámara.")
      }

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          // Éxito al escanear
          console.log("QR escaneado:", decodedText)
          onScan(decodedText)
          stopScanner()
          onClose()
        },
        (errorMessage) => {
          // Error al escanear (no es un error crítico, solo que no detectó QR)
          console.log("Error scanning:", errorMessage)
        }
      )
    } catch (err: any) {
      console.error("Error starting scanner:", err)
      setError(err.message || "Error al iniciar la cámara. Verifica los permisos.")
      setIsScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear()
        scannerRef.current = null
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
    setIsScanning(false)
  }

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Escanear Código QR</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isScanning && error && (
            <div className="text-center">
              <Button
                onClick={startScanner}
                className="flex items-center mx-auto"
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          )}
          
          <div id="qr-reader" className="w-full"></div>
          
          <div className="text-center text-sm text-gray-600">
            <Camera className="h-4 w-4 inline mr-2" />
            Posiciona el código QR dentro del marco
          </div>

          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex items-center"
            >
              <CameraOff className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
