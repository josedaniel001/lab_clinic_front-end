"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, AlertCircle, CheckCircle, Info, RefreshCw } from "lucide-react"

export function CameraTest() {
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'available' | 'unavailable' | 'permission-denied'>('checking')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>("")
  const [cameraInfo, setCameraInfo] = useState<any>(null)
  const [isHTTPS, setIsHTTPS] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    checkEnvironment()
    checkCameraSupport()
  }, [])

  const checkEnvironment = () => {
    // Verificar si estamos en HTTPS
    setIsHTTPS(window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    
    // Obtener información del navegador
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      language: navigator.language,
    }
    
    setCameraInfo(browserInfo)
  }

  const checkCameraSupport = async () => {
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('unavailable')
        setError("Tu navegador no soporta acceso a la cámara")
        return
      }

      // Verificar permisos
      try {
        const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName })
        
        if (permissions.state === 'denied') {
          setCameraStatus('permission-denied')
          setError("Permiso de cámara denegado")
          return
        }
      } catch (permError) {
        console.log("No se pudo verificar permisos:", permError)
      }

      setCameraStatus('available')
    } catch (err) {
      setCameraStatus('unavailable')
      setError("Error al verificar la cámara")
    }
  }

  const startCamera = async () => {
    try {
      setError("")
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'environment'
        } 
      })
      setStream(mediaStream)
      
      // Configurar el video
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            setVideoDimensions({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            })
            videoRef.current.play()
          }
        }
      }
    } catch (err: any) {
      console.error("Error al acceder a la cámara:", err)
      setError(err.message || "Error al acceder a la cámara")
      
      // Proporcionar mensajes más específicos
      if (err.name === 'NotAllowedError') {
        setError("Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.")
      } else if (err.name === 'NotFoundError') {
        setError("No se encontró ninguna cámara disponible. Verifica que tu dispositivo tenga una cámara conectada.")
      } else if (err.name === 'NotReadableError') {
        setError("La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que puedan estar usando la cámara.")
      } else if (err.name === 'OverconstrainedError') {
        setError("La cámara no puede proporcionar la resolución solicitada. Intenta con una resolución más baja.")
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setVideoDimensions({ width: 0, height: 0 })
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
        Diagnóstico de Cámara
      </h3>

      <div className="space-y-4">
        {/* Estado de la cámara */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusText()}</span>
        </div>

        {/* Información del entorno */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isHTTPS ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>HTTPS: {isHTTPS ? 'Sí' : 'No'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>Online: {navigator.onLine ? 'Sí' : 'No'}</span>
          </div>
        </div>

        {/* Dimensiones del video */}
        {videoDimensions.width > 0 && (
          <div className="text-sm text-gray-600">
            <p>Resolución del video: {videoDimensions.width} x {videoDimensions.height}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error detectado:</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Video de la cámara */}
        {stream && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md rounded border bg-black"
              style={{ minHeight: '240px' }}
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
              Probar Cámara
            </Button>
          )}
          
          <Button onClick={checkCameraSupport} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Estado
          </Button>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-3 rounded">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Requisitos para la cámara:</p>
              <ul className="space-y-1">
                <li>• HTTPS requerido en producción (excepto localhost)</li>
                <li>• Permisos de cámara habilitados</li>
                <li>• Cámara no siendo usada por otras aplicaciones</li>
                <li>• Navegador compatible con WebRTC</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Información del navegador */}
        {cameraInfo && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Información del navegador
            </summary>
            <div className="bg-gray-50 p-2 rounded space-y-1">
              <p><strong>Plataforma:</strong> {cameraInfo.platform}</p>
              <p><strong>Idioma:</strong> {cameraInfo.language}</p>
              <p><strong>Cookies:</strong> {cameraInfo.cookieEnabled ? 'Habilitadas' : 'Deshabilitadas'}</p>
              <p><strong>Online:</strong> {cameraInfo.onLine ? 'Sí' : 'No'}</p>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
