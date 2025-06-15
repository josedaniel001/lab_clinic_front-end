"use client"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { BackButton } from "@/components/ui/BackButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Plus,
  RefreshCw,
  Printer,
  Mail,
  DollarSign,
  Trash2,
  Receipt,
  FileText,
  Calendar,
  User,
  CreditCard,
} from "lucide-react"

// Datos de ejemplo para facturas
const facturasMock = [
  {
    id: "F-001",
    fecha: "2023-06-10",
    paciente: "Juan Pérez",
    total: 150.0,
    estado: "Pagada",
    metodo_pago: "Efectivo",
  },
  {
    id: "F-002",
    fecha: "2023-06-10",
    paciente: "María García",
    total: 85.5,
    estado: "Pendiente",
    metodo_pago: "-",
  },
  {
    id: "F-003",
    fecha: "2023-06-11",
    paciente: "Carlos López",
    total: 220.0,
    estado: "Pagada",
    metodo_pago: "Tarjeta",
  },
  {
    id: "F-004",
    fecha: "2023-06-12",
    paciente: "Ana Martínez",
    total: 45.0,
    estado: "Anulada",
    metodo_pago: "-",
  },
  {
    id: "F-005",
    fecha: "2023-06-12",
    paciente: "Roberto Sánchez",
    total: 175.25,
    estado: "Pendiente",
    metodo_pago: "-",
  },
]

// Datos de ejemplo para órdenes
const ordenesMock = [
  {
    id: "ORD-001",
    paciente: {
      id: "1",
      nombre: "Juan Pérez",
      documento: "12345678",
      direccion: "Calle Principal 123",
      telefono: "1234567890",
    },
    medico: "Dr. Alejandro Rodríguez",
    fecha: "2023-06-10",
    examenes: [
      { id: "1", nombre: "Glucosa", precio: 50.0 },
      { id: "2", nombre: "Creatinina", precio: 45.0 },
      { id: "3", nombre: "Hemoglobina", precio: 55.0 },
    ],
  },
  {
    id: "ORD-002",
    paciente: {
      id: "2",
      nombre: "María García",
      documento: "87654321",
      direccion: "Avenida Central 456",
      telefono: "0987654321",
    },
    medico: "Dra. Sofía Hernández",
    fecha: "2023-06-10",
    examenes: [
      { id: "4", nombre: "Hemograma", precio: 65.0 },
      { id: "5", nombre: "Plaquetas", precio: 20.5 },
    ],
  },
]

// Mock API para facturas
const facturacionAPI = {
  getFacturas: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(facturasMock)
      }, 500)
    })
  },
  getOrdenesSinFacturar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(ordenesMock)
      }, 500)
    })
  },
  createFactura: async (facturaData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: `F-00${Math.floor(Math.random() * 100)}` })
      }, 500)
    })
  },
  anularFactura: async (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
  registrarPago: async (id: string, pagoData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
}

export default function FacturasPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [facturas, setFacturas] = useState([])
  const [ordenesSinFacturar, setOrdenesSinFacturar] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openPagoDialog, setOpenPagoDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrden, setSelectedOrden] = useState<any>(null)
  const [selectedFactura, setSelectedFactura] = useState<any>(null)
  const [formData, setFormData] = useState({
    ordenId: "",
    descuento: "0",
    observaciones: "",
  })
  const [pagoData, setPagoData] = useState({
    metodo: "",
    referencia: "",
    monto: "",
  })
  const [errors, setErrors] = useState({
    ordenId: "",
    descuento: "",
  })
  const [pagoErrors, setPagoErrors] = useState({
    metodo: "",
    monto: "",
  })

  useEffect(() => {
    fetchFacturas()
    fetchOrdenesSinFacturar()
  }, [])

  const fetchFacturas = async () => {
    showLoader()
    try {
      const data = await facturacionAPI.getFacturas()
      setFacturas(data as any)
    } catch (error) {
      showNotification("Error al cargar facturas", "error")
    } finally {
      hideLoader()
    }
  }

  const fetchOrdenesSinFacturar = async () => {
    try {
      const data = await facturacionAPI.getOrdenesSinFacturar()
      setOrdenesSinFacturar(data as any)
    } catch (error) {
      console.error("Error al cargar órdenes sin facturar:", error)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      ordenId: "",
      descuento: "0",
      observaciones: "",
    })
    setSelectedOrden(null)
    setOpenDialog(true)
  }

  const handleOpenPagoDialog = (factura: any) => {
    setSelectedFactura(factura)
    setPagoData({
      metodo: "",
      referencia: "",
      monto: factura.total?.toString() || "0",
    })
    setPagoErrors({
      metodo: "",
      monto: "",
    })
    setOpenPagoDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrors({
      ordenId: "",
      descuento: "",
    })
  }

  const handleClosePagoDialog = () => {
    setOpenPagoDialog(false)
  }

  const handleSubmit = async () => {
    if (!selectedOrden) return

    showLoader()
    try {
      const facturaData = {
        ...formData,
        pacienteId: selectedOrden.paciente.id,
        examenes: selectedOrden.examenes,
      }

      const result = await facturacionAPI.createFactura(facturaData)
      showNotification(`Factura ${result.id} creada correctamente`, "success")
      handleCloseDialog()
      fetchFacturas()
      fetchOrdenesSinFacturar()
    } catch (error) {
      showNotification("Error al crear factura", "error")
    } finally {
      hideLoader()
    }
  }

  const handleRegistrarPago = async () => {
    if (!selectedFactura) return

    showLoader()
    try {
      await facturacionAPI.registrarPago(selectedFactura.id, pagoData)
      showNotification("Pago registrado correctamente", "success")
      handleClosePagoDialog()
      fetchFacturas()
    } catch (error) {
      showNotification("Error al registrar pago", "error")
    } finally {
      hideLoader()
    }
  }

  const handleAnularFactura = async (id: string) => {
    showLoader()
    try {
      await facturacionAPI.anularFactura(id)
      showNotification("Factura anulada correctamente", "success")
      fetchFacturas()
    } catch (error) {
      showNotification("Error al anular factura", "error")
    } finally {
      hideLoader()
    }
  }

  const handlePrintFactura = (id: string) => {
    showNotification("Imprimiendo factura...", "info")
  }

  const handleEmailFactura = (id: string) => {
    showNotification("Enviando factura por email...", "info")
  }

  const filteredFacturas = facturas.filter(
    (factura: any) =>
      factura.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.paciente.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calcularSubtotal = () => {
    if (!selectedOrden) return 0
    return selectedOrden.examenes.reduce((sum: number, examen: any) => sum + (examen.precio || 0), 0)
  }

  const calcularDescuento = () => {
    const subtotal = calcularSubtotal()
    const descuentoPorcentaje = Number(formData.descuento) || 0
    return (subtotal * descuentoPorcentaje) / 100
  }

  const calcularTotal = () => {
    return calcularSubtotal() - calcularDescuento()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pagada":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Pagada
          </Badge>
        )
      case "Pendiente":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pendiente
          </Badge>
        )
      case "Anulada":
        return <Badge variant="destructive">Anulada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const formatCurrency = (value: number | undefined) => {
    return `$${(value || 0).toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 space-y-6">
        <BackButton route="/dashboard" />

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Receipt className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestión de Facturas
            </h1>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Facturas</CardTitle>
                <CardDescription className="text-blue-100">Gestiona las facturas del laboratorio</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchFacturas}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
                {hasPermission("crear_factura") && (
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={handleOpenDialog} className="bg-white text-blue-600 hover:bg-blue-50">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Factura
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>Nueva Factura</span>
                        </DialogTitle>
                        <DialogDescription>Selecciona una orden para generar la factura</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="orden">Orden</Label>
                          <Select
                            value={selectedOrden?.id || ""}
                            onValueChange={(value) => {
                              const orden = ordenesSinFacturar.find((o: any) => o.id === value)
                              setSelectedOrden(orden)
                              setFormData({ ...formData, ordenId: value })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar orden" />
                            </SelectTrigger>
                            <SelectContent>
                              {ordenesSinFacturar.map((orden: any) => (
                                <SelectItem key={orden.id} value={orden.id}>
                                  {orden.id} - {orden.paciente.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedOrden && (
                          <>
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <User className="h-5 w-5" />
                                  <span>Información del Paciente</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Nombre</Label>
                                  <p className="text-sm">{selectedOrden.paciente.nombre}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Documento</Label>
                                  <p className="text-sm">{selectedOrden.paciente.documento}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Dirección</Label>
                                  <p className="text-sm">{selectedOrden.paciente.direccion}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                                  <p className="text-sm">{selectedOrden.paciente.telefono}</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Detalle de Exámenes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Examen</TableHead>
                                      <TableHead className="text-right">Precio</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedOrden.examenes.map((examen: any) => (
                                      <TableRow key={examen.id}>
                                        <TableCell>{examen.nombre}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(examen.precio)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="descuento">Descuento (%)</Label>
                                <Input
                                  id="descuento"
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.descuento}
                                  onChange={(e) => setFormData({ ...formData, descuento: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="observaciones">Observaciones</Label>
                                <Textarea
                                  id="observaciones"
                                  value={formData.observaciones}
                                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                />
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(calcularSubtotal())}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Descuento:</span>
                                <span>{formatCurrency(calcularDescuento())}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(calcularTotal())}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={!selectedOrden}>
                          <Receipt className="h-4 w-4 mr-2" />
                          Generar Factura
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar factura o paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Nº Factura</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Paciente</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Método de Pago</TableHead>
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFacturas.map((factura: any) => (
                    <TableRow key={factura.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{factura.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{factura.fecha}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{factura.paciente}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(factura.total)}</TableCell>
                      <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span>{factura.metodo_pago}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintFactura(factura.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmailFactura(factura.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {factura.estado === "Pendiente" && (
                            <>
                              <Dialog open={openPagoDialog} onOpenChange={setOpenPagoDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenPagoDialog(factura)}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Registrar Pago</DialogTitle>
                                    <DialogDescription>
                                      Registra el pago para la factura {selectedFactura?.id}
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="font-medium">Factura:</span> {selectedFactura?.id}
                                        </div>
                                        <div>
                                          <span className="font-medium">Paciente:</span> {selectedFactura?.paciente}
                                        </div>
                                        <div className="col-span-2">
                                          <span className="font-medium">Total a pagar:</span>{" "}
                                          {formatCurrency(selectedFactura?.total)}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="metodo">Método de Pago</Label>
                                      <Select
                                        value={pagoData.metodo}
                                        onValueChange={(value) => setPagoData({ ...pagoData, metodo: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccionar método" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                                          <SelectItem value="Tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                                          <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                                          <SelectItem value="Cheque">Cheque</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label htmlFor="referencia">Referencia / Nº Transacción</Label>
                                      <Input
                                        id="referencia"
                                        value={pagoData.referencia}
                                        onChange={(e) => setPagoData({ ...pagoData, referencia: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor="monto">Monto</Label>
                                      <Input
                                        id="monto"
                                        type="number"
                                        value={pagoData.monto}
                                        onChange={(e) => setPagoData({ ...pagoData, monto: e.target.value })}
                                      />
                                    </div>
                                  </div>

                                  <DialogFooter>
                                    <Button variant="outline" onClick={handleClosePagoDialog}>
                                      Cancelar
                                    </Button>
                                    <Button onClick={handleRegistrarPago}>
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Registrar Pago
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Anular factura?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. La factura será marcada como anulada.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleAnularFactura(factura.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Anular Factura
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
