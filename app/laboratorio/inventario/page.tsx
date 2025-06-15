"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Box,
  Typography,
  Alert,
  IconButton,
} from "@mui/material"
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddShoppingCart as AddShoppingCartIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"

// Datos de ejemplo para el inventario
const inventarioMock = [
  {
    id: "1",
    nombre: "Reactivo Glucosa",
    codigo: "R-GLUC-001",
    tipo: "Reactivo",
    area: "Química Clínica",
    stock_actual: 15,
    stock_minimo: 10,
    unidad_medida: "Kit",
    fecha_vencimiento: "2024-12-31",
    lote: "L2023-45",
    proveedor: "BioLab Inc.",
  },
  {
    id: "2",
    nombre: "Reactivo Creatinina",
    codigo: "R-CREA-001",
    tipo: "Reactivo",
    area: "Química Clínica",
    stock_actual: 8,
    stock_minimo: 10,
    unidad_medida: "Kit",
    fecha_vencimiento: "2024-10-15",
    lote: "L2023-32",
    proveedor: "MedReagents",
  },
  {
    id: "3",
    nombre: "Tubos EDTA",
    codigo: "M-EDTA-001",
    tipo: "Material",
    area: "Hematología",
    stock_actual: 150,
    stock_minimo: 50,
    unidad_medida: "Unidad",
    fecha_vencimiento: "2025-05-20",
    lote: "L2023-78",
    proveedor: "LabSupplies",
  },
  {
    id: "4",
    nombre: "Reactivo Hemoglobina",
    codigo: "R-HB-001",
    tipo: "Reactivo",
    area: "Hematología",
    stock_actual: 12,
    stock_minimo: 8,
    unidad_medida: "Kit",
    fecha_vencimiento: "2024-11-30",
    lote: "L2023-56",
    proveedor: "BioLab Inc.",
  },
  {
    id: "5",
    nombre: "Jeringas 5ml",
    codigo: "M-JER-001",
    tipo: "Material",
    area: "General",
    stock_actual: 200,
    stock_minimo: 100,
    unidad_medida: "Unidad",
    fecha_vencimiento: "2026-01-15",
    lote: "L2023-90",
    proveedor: "MedSupplies",
  },
]

// Mock API para el inventario
const inventarioAPI = {
  getInventario: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(inventarioMock)
      }, 500)
    })
  },
  createItem: async (itemData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
  updateItem: async (id: string, itemData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
  deleteItem: async (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
  addStock: async (id: string, cantidad: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  },
}

export default function InventarioPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [inventario, setInventario] = useState([])
  const [filteredInventario, setFilteredInventario] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openStockDialog, setOpenStockDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    codigo: "",
    tipo: "",
    area: "",
    stock_actual: "",
    stock_minimo: "",
    unidad_medida: "",
    fecha_vencimiento: "",
    lote: "",
    proveedor: "",
  })

  const [stockData, setStockData] = useState({
    id: "",
    nombre: "",
    cantidad: "",
  })

  const [errors, setErrors] = useState({
    nombre: "",
    codigo: "",
    tipo: "",
    area: "",
    stock_actual: "",
    stock_minimo: "",
    unidad_medida: "",
    fecha_vencimiento: "",
  })

  const [stockError, setStockError] = useState("")

  useEffect(() => {
    fetchInventario()
  }, [])

  useEffect(() => {
    const filtered = inventario.filter(
      (item: any) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.area.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredInventario(filtered)
  }, [inventario, searchTerm])

  const fetchInventario = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await inventarioAPI.getInventario()
      setInventario(data as any)
      if (!showLoading) {
        showNotification("Inventario actualizado", "success")
      }
    } catch (error) {
      showNotification("Error al cargar inventario", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchInventario(false)
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setFormData({
        id: item.id,
        nombre: item.nombre,
        codigo: item.codigo,
        tipo: item.tipo,
        area: item.area,
        stock_actual: item.stock_actual.toString(),
        stock_minimo: item.stock_minimo.toString(),
        unidad_medida: item.unidad_medida,
        fecha_vencimiento: item.fecha_vencimiento,
        lote: item.lote,
        proveedor: item.proveedor,
      })
      setIsEditing(true)
    } else {
      setFormData({
        id: "",
        nombre: "",
        codigo: "",
        tipo: "",
        area: "",
        stock_actual: "",
        stock_minimo: "",
        unidad_medida: "",
        fecha_vencimiento: "",
        lote: "",
        proveedor: "",
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleOpenStockDialog = (item: any) => {
    setStockData({
      id: item.id,
      nombre: item.nombre,
      cantidad: "",
    })
    setStockError("")
    setOpenStockDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrors({
      nombre: "",
      codigo: "",
      tipo: "",
      area: "",
      stock_actual: "",
      stock_minimo: "",
      unidad_medida: "",
      fecha_vencimiento: "",
    })
  }

  const handleCloseStockDialog = () => {
    setOpenStockDialog(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name as string]: value,
    })
  }

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStockData({
      ...stockData,
      cantidad: e.target.value,
    })
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      nombre: "",
      codigo: "",
      tipo: "",
      area: "",
      stock_actual: "",
      stock_minimo: "",
      unidad_medida: "",
      fecha_vencimiento: "",
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es requerido"
      isValid = false
    }

    if (!formData.tipo) {
      newErrors.tipo = "El tipo es requerido"
      isValid = false
    }

    if (!formData.area) {
      newErrors.area = "El área es requerida"
      isValid = false
    }

    if (!formData.stock_actual) {
      newErrors.stock_actual = "El stock actual es requerido"
      isValid = false
    } else if (isNaN(Number(formData.stock_actual)) || Number(formData.stock_actual) < 0) {
      newErrors.stock_actual = "Ingrese un valor válido"
      isValid = false
    }

    if (!formData.stock_minimo) {
      newErrors.stock_minimo = "El stock mínimo es requerido"
      isValid = false
    } else if (isNaN(Number(formData.stock_minimo)) || Number(formData.stock_minimo) < 0) {
      newErrors.stock_minimo = "Ingrese un valor válido"
      isValid = false
    }

    if (!formData.unidad_medida.trim()) {
      newErrors.unidad_medida = "La unidad de medida es requerida"
      isValid = false
    }

    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = "La fecha de vencimiento es requerida"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const validateStockForm = () => {
    if (!stockData.cantidad || isNaN(Number(stockData.cantidad)) || Number(stockData.cantidad) <= 0) {
      setStockError("Ingrese una cantidad válida mayor a cero")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    showLoader()
    try {
      if (isEditing) {
        await inventarioAPI.updateItem(formData.id, formData)
        showNotification("Item actualizado correctamente", "success")
      } else {
        await inventarioAPI.createItem(formData)
        showNotification("Item registrado correctamente", "success")
      }
      handleCloseDialog()
      fetchInventario()
    } catch (error) {
      showNotification("Error al guardar item", "error")
    } finally {
      hideLoader()
    }
  }

  const handleAddStock = async () => {
    if (!validateStockForm()) return

    showLoader()
    try {
      await inventarioAPI.addStock(stockData.id, Number(stockData.cantidad))
      showNotification("Stock actualizado correctamente", "success")
      handleCloseStockDialog()
      fetchInventario()
    } catch (error) {
      showNotification("Error al actualizar stock", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este item?")) {
      showLoader()
      try {
        await inventarioAPI.deleteItem(id)
        showNotification("Item eliminado correctamente", "success")
        fetchInventario()
      } catch (error) {
        showNotification("Error al eliminar item", "error")
      } finally {
        hideLoader()
      }
    }
  }

  const getStockStatus = (stockActual: number, stockMinimo: number) => {
    if (stockActual <= stockMinimo * 0.5) return "error"
    if (stockActual <= stockMinimo) return "warning"
    return "success"
  }

  // Calcular estadísticas
  const totalItems = inventario.length
  const itemsBajoStock = inventario.filter((item: any) => item.stock_actual <= item.stock_minimo).length
  const reactivos = inventario.filter((item: any) => item.tipo === "Reactivo").length
  const materiales = inventario.filter((item: any) => item.tipo === "Material").length

  const stats = [
    {
      title: "Total Items",
      value: totalItems.toString(),
      subtitle: "Items en inventario",
      trend: "+2% vs mes anterior",
      color: "primary",
      icon: <InventoryIcon style={{ color: "#ffffff" }} />,
    },
    {
      title: "Stock Bajo",
      value: itemsBajoStock.toString(),
      subtitle: "Requieren reposición",
      trend: itemsBajoStock > 0 ? "¡Atención requerida!" : "Todo normal",
      color: itemsBajoStock > 0 ? "error" : "success",
      icon: <WarningIcon style={{ color: "#ffffff" }} />,
    },
    {
      title: "Reactivos",
      value: reactivos.toString(),
      subtitle: "Reactivos disponibles",
      trend: `${totalItems > 0 ? ((reactivos / totalItems) * 100).toFixed(0) : 0}% del total`,
      color: "info",
      icon: <InventoryIcon style={{ color: "#ffffff" }} />,
    },
    {
      title: "Materiales",
      value: materiales.toString(),
      subtitle: "Materiales disponibles",
      trend: `${totalItems > 0 ? ((materiales / totalItems) * 100).toFixed(0) : 0}% del total`,
      color: "secondary",
      icon: <InventoryIcon style={{ color: "#ffffff" }} />,
    },
  ]

  // Definir las columnas para DataTable
  const columns = [
    {
      key: "codigo",
      label: "Código",
      className: "w-32",
    },
    {
      key: "nombre",
      label: "Nombre",
      className: "flex-1",
    },
    {
      key: "tipo",
      label: "Tipo",
      className: "w-32",
    },
    {
      key: "area",
      label: "Área",
      className: "w-40",
    },
    {
      key: "stock_actual",
      label: "Stock",
      className: "w-40",
      render: (value: number, row: any) => (
        <StatusBadge status={getStockStatus(value, row.stock_minimo)} label={`${value} ${row.unidad_medida}`} />
      ),
    },
    {
      key: "stock_minimo",
      label: "Mínimo",
      className: "w-24",
    },
    {
      key: "fecha_vencimiento",
      label: "Vencimiento",
      className: "w-32",
    },
  ]

  // Definir las acciones para cada fila
  const getRowActions = (row: any) => (
    <>
      <IconButton
        color="primary"
        size="small"
        onClick={(e) => {
          e.stopPropagation()
          handleOpenStockDialog(row)
        }}
        title="Agregar stock"
      >
        <AddShoppingCartIcon />
      </IconButton>
      {hasPermission("editar_inventario") && (
        <IconButton
          color="info"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenDialog(row)
          }}
          title="Editar item"
        >
          <EditIcon />
        </IconButton>
      )}
      {hasPermission("eliminar_inventario") && (
        <IconButton
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete(row.id)
          }}
          title="Eliminar item"
        >
          <DeleteIcon />
        </IconButton>
      )}
    </>
  )

  const itemsBajoStockList = inventario.filter((item: any) => item.stock_actual <= item.stock_minimo)

  return (
    <>
      <PageLayout
        title="Gestión de Inventario"
        description="Administra el inventario de reactivos y materiales del laboratorio"
        icon={<InventoryIcon />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        stats={stats}
        actions={
          hasPermission("crear_inventario") ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
              }}
            >
              Nuevo Item
            </Button>
          ) : undefined
        }
      >
        {itemsBajoStockList.length > 0 && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
            <Typography variant="subtitle1">¡Atención! Hay {itemsBajoStockList.length} items con stock bajo</Typography>
            <Typography variant="body2">
              Se recomienda realizar un pedido de los siguientes items:{" "}
              {itemsBajoStockList.map((i: any) => i.nombre).join(", ")}
            </Typography>
          </Alert>
        )}

        <DataTable
          data={filteredInventario}
          columns={columns}
          actions={getRowActions}
          emptyMessage="No hay items en el inventario"
          emptyIcon={<InventoryIcon sx={{ fontSize: 48, color: "text.secondary" }} />}
        />
      </PageLayout>

      {/* Dialog para crear/editar item */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? "Editar Item" : "Nuevo Item"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                error={!!errors.codigo}
                helperText={errors.codigo}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.tipo} required>
                <InputLabel id="tipo-label">Tipo</InputLabel>
                <Select
                  labelId="tipo-label"
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  label="Tipo"
                  onChange={handleChange}
                >
                  <MenuItem value="Reactivo">Reactivo</MenuItem>
                  <MenuItem value="Material">Material</MenuItem>
                  <MenuItem value="Equipo">Equipo</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
                {errors.tipo && <FormHelperText>{errors.tipo}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.area} required>
                <InputLabel id="area-label">Área</InputLabel>
                <Select
                  labelId="area-label"
                  id="area"
                  name="area"
                  value={formData.area}
                  label="Área"
                  onChange={handleChange}
                >
                  <MenuItem value="Química Clínica">Química Clínica</MenuItem>
                  <MenuItem value="Hematología">Hematología</MenuItem>
                  <MenuItem value="Microbiología">Microbiología</MenuItem>
                  <MenuItem value="Inmunología">Inmunología</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
                {errors.area && <FormHelperText>{errors.area}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Actual"
                name="stock_actual"
                type="number"
                value={formData.stock_actual}
                onChange={handleChange}
                error={!!errors.stock_actual}
                helperText={errors.stock_actual}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                name="stock_minimo"
                type="number"
                value={formData.stock_minimo}
                onChange={handleChange}
                error={!!errors.stock_minimo}
                helperText={errors.stock_minimo}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unidad de Medida"
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleChange}
                error={!!errors.unidad_medida}
                helperText={errors.unidad_medida}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fecha de Vencimiento"
                name="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                error={!!errors.fecha_vencimiento}
                helperText={errors.fecha_vencimiento}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Lote" name="lote" value={formData.lote} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para agregar stock */}
      <Dialog open={openStockDialog} onClose={handleCloseStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Item: {stockData.nombre}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <TextField
              fullWidth
              label="Cantidad a Agregar"
              name="cantidad"
              type="number"
              value={stockData.cantidad}
              onChange={handleStockChange}
              error={!!stockError}
              helperText={stockError}
              required
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog}>Cancelar</Button>
          <Button onClick={handleAddStock} variant="contained" color="primary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
