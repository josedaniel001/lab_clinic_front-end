"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Camera, CameraOff, AlertCircle, RefreshCw } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  isOpen: boolean
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [availableCameras, setAvailableCameras] = useState<any[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [videoReady, setVideoReady] = useState(false)

  // Función segura para detener el escáner
  const safeStopScanner = () => {
    // Detener la animación si existe
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Detener el stream de video
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }

    // Limpiar el video
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.load() // Forzar recarga del video
    }

    setCameraStatus('idle')
    setIsScanning(false)
    setVideoReady(false)
  }

  // Limpiar cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      safeStopScanner()
    }
  }, [isOpen])

  // Obtener cámaras disponibles
  const getAvailableCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return []
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setAvailableCameras(videoDevices)
      
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId)
      }
      
      return videoDevices
    } catch (err) {
      console.error("Error al obtener cámaras:", err)
      return []
    }
  }

  // Función para detectar QR usando jsQR
  const detectQR = (imageData: ImageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })
      
      if (code) {
        console.log("QR detectado:", code.data)
        return code.data
      }
      
      return null
    } catch (error) {
      console.error("Error al detectar QR:", error)
      return null
    }
  }

  // Función para procesar frames del video
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning || !videoReady) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Verificar que el video tenga dimensiones válidas
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      // Reintentar en el siguiente frame
      animationRef.current = requestAnimationFrame(processFrame)
      return
    }

    // Configurar canvas al tamaño del video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dibujar el frame actual del video en el canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Obtener los datos de la imagen
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Intentar detectar QR
    const qrResult = detectQR(imageData)
    if (qrResult) {
      console.log("QR detectado:", qrResult)
      onScan(qrResult)
      safeStopScanner()
      onClose()
      return
    }

    // Continuar procesando frames con un delay para reducir el uso de CPU
    setTimeout(() => {
      if (isScanning && videoReady) {
        animationRef.current = requestAnimationFrame(processFrame)
      }
    }, 100) // Procesar cada 100ms en lugar de cada frame
  }

  const startScanner = async () => {
    try {
      console.log("Iniciando escáner QR...")
      setError("")
      setCameraStatus('starting')
      setIsScanning(true)
      setVideoReady(false)

      // Verificar soporte del navegador
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso a la cámara")
      }

      // Obtener cámaras disponibles
      const cameras = await getAvailableCameras()
      if (cameras.length === 0) {
        throw new Error("No se encontraron cámaras disponibles")
      }

      // Detener escáner previo si existe
      safeStopScanner()

      // Configurar el stream de video
      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'environment' // Preferir cámara trasera en móviles
        }
      }

      console.log("Solicitando acceso a la cámara...")
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Configurar el video
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Eventos para manejar el video
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata cargada")
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log("Video iniciado correctamente")
              setVideoReady(true)
              setCameraStatus('scanning')
              
              // Iniciar procesamiento de frames después de un pequeño delay
              setTimeout(() => {
                if (isScanning) {
                  processFrame()
                }
              }, 500)
            }).catch(err => {
              console.error("Error al reproducir video:", err)
              setError("Error al reproducir el video de la cámara")
              setCameraStatus('error')
              setIsScanning(false)
            })
          }
        }

        videoRef.current.onerror = (err) => {
          console.error("Error en el video:", err)
          setError("Error en el video de la cámara")
          setCameraStatus('error')
          setIsScanning(false)
        }

        videoRef.current.oncanplay = () => {
          console.log("Video puede reproducirse")
        }
      }

    } catch (err: any) {
      console.error("Error starting scanner:", err)
      if (err.name === 'NotAllowedError') {
        setError("Permiso de cámara denegado. Por favor, permite el acceso a la cámara.")
      } else if (err.name === 'NotFoundError') {
        setError("No se encontró ninguna cámara disponible.")
      } else if (err.name === 'NotReadableError') {
        setError("La cámara está siendo usada por otra aplicación.")
      } else if (err.name === 'OverconstrainedError') {
        setError("La cámara no puede proporcionar la resolución solicitada.")
      } else {
        setError(err.message || "Error al iniciar la cámara. Verifica los permisos.")
      }
      setCameraStatus('error')
      setIsScanning(false)
    }
  }

  // Iniciar escáner cuando se abre el modal
  useEffect(() => {
    if (isOpen && !isScanning) {
      const timer = setTimeout(() => {
        startScanner()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    safeStopScanner()
    onClose()
  }

  const handleRetry = () => {
    safeStopScanner()
    setTimeout(() => {
      startScanner()
    }, 500)
  }

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId)
    if (isScanning) {
      // Reiniciar escáner con nueva cámara
      safeStopScanner()
      setTimeout(() => startScanner(), 500)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear Código QR
          </h3>
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
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error de cámara</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Estado de la cámara */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              cameraStatus === 'scanning' ? 'bg-green-500' :
              cameraStatus === 'starting' ? 'bg-yellow-500' :
              cameraStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-gray-600">
              {cameraStatus === 'scanning' ? 'Cámara activa' :
               cameraStatus === 'starting' ? 'Iniciando cámara...' :
               cameraStatus === 'error' ? 'Error de cámara' : 'Inactivo'}
            </span>
            {videoReady && (
              <span className="text-green-600 text-xs">(Video listo)</span>
            )}
          </div>

          {/* Selector de cámara */}
          {availableCameras.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Seleccionar cámara:</label>
              <select
                value={selectedCamera}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {availableCameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Cámara ${camera.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón de reintentar si hay error */}
          {cameraStatus === 'error' && (
            <div className="text-center">
              <Button
                onClick={handleRetry}
                className="flex items-center mx-auto"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          )}
          
          {/* Contenedor del escáner */}
          <div className="relative">
            <div className="w-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100">
              {cameraStatus === 'starting' && (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                  <p>Iniciando cámara...</p>
                </div>
              )}
              {cameraStatus === 'error' && (
                <div className="text-center text-gray-500">
                  <CameraOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No se pudo iniciar la cámara</p>
                </div>
              )}
              {cameraStatus === 'scanning' && (
                <div className="qr-scanner-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="qr-scanner-video"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      backgroundColor: '#000'
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="qr-scanner-canvas"
                    style={{ display: 'none' }}
                  />
                  <div className="qr-scanner-overlay"></div>
                  <div className="qr-scanner-frame"></div>
                </div>
              )}
            </div>
          </div>
          
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

          {/* Información de ayuda */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">💡 Consejos:</p>
            <ul className="space-y-1">
              <li>• Asegúrate de permitir el acceso a la cámara cuando el navegador lo solicite</li>
              <li>• La cámara requiere HTTPS en producción</li>
              <li>• Verifica que no haya otros programas usando la cámara</li>
              <li>• Mantén el código QR estable y bien iluminado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

