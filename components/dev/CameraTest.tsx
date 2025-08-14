"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, AlertCircle, CheckCircle } from "lucide-react"

export function CameraTest() {
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'available' | 'unavailable' | 'permission-denied'>('checking')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    checkCameraSupport()
  }, [])

  const checkCameraSupport = async () => {
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('unavailable')
        setError("Tu navegador no soporta acceso a la cámara")
        return
      }

      // Verificar permisos
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })
      
      if (permissions.state === 'denied') {
        setCameraStatus('permission-denied')
        setError("Permiso de cámara denegado")
        return
      }

      setCameraStatus('available')
    } catch (err) {
      setCameraStatus('unavailable')
      setError("Error al verificar la cámara")
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      setStream(mediaStream)
      setError("")
    } catch (err: any) {
      setError(err.message || "Error al acceder a la cámara")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const getStatusIcon = () => {
    switch (cameraStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'permission-denied':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (cameraStatus) {
      case 'checking':
        return "Verificando cámara..."
      case 'available':
        return "Cámara disponible"
      case 'unavailable':
        return "Cámara no disponible"
      case 'permission-denied':
        return "Permiso denegado"
      default:
        return "Estado desconocido"
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5" />
        Prueba de Cámara
      </h3>

      <div className="space-y-4">
        {/* Estado de la cámara */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusText()}</span>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Video de la cámara */}
        {stream && (
          <div className="relative">
            <video
              ref={(video) => {
                if (video) video.srcObject = stream
              }}
              autoPlay
              playsInline
              className="w-full max-w-md rounded border"
            />
            <Button
              onClick={stopCamera}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
            >
              <CameraOff className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Botones de control */}
        <div className="flex gap-2">
          {cameraStatus === 'available' && !stream && (
            <Button onClick={startCamera} size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Iniciar Cámara
            </Button>
          )}
          
          <Button onClick={checkCameraSupport} variant="outline" size="sm">
            Verificar Estado
          </Button>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>• La cámara requiere HTTPS en producción</p>
          <p>• Verifica que no haya otros programas usando la cámara</p>
          <p>• Asegúrate de permitir el acceso cuando el navegador lo solicite</p>
        </div>
      </div>
    </div>
  )
}
