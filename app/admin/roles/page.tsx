"use client"

import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { usePermissions } from "@/hooks/usePermissions"
import { PageLayout } from "@/components/layout/PageLayout"
import { DataTable, StatusBadge } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, Edit, Trash2, LockIcon as Security, Users, Settings } from "lucide-react"
import { rolesAPI } from "@/api/rolesAPI"
import { permisosAPI } from "@/api/permisosAPI"

export default function RolesPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [roles, setRoles] = useState([])
  const [permisos, setPermisos] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openPermisosDialog, setOpenPermisosDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedRol, setSelectedRol] = useState<any>(null)
  const [formData, setFormData] = useState({
    id_rol: "",
    nombre_rol: "",
    status: true,
  })
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<any>({})
  const [errors, setErrors] = useState({
    nombre_rol: "",
  })

  useEffect(() => {
    fetchRoles()
    fetchPermisos()
  }, [])

  const fetchRoles = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await rolesAPI.getRoles()
      setRoles(data)
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "success")
      }
    } catch (error) {
      showNotification("Error al cargar roles", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const fetchPermisos = async () => {
    try {
      const data = await permisosAPI.getPermisos()
      setPermisos(data)
    } catch (error) {
      console.error("Error al cargar permisos:", error)
    }
  }

  const handleRefresh = () => {
    fetchRoles(false)
  }

  const handleOpenDialog = (rol = null) => {
    if (rol) {
      setFormData({
        id_rol: rol.id,
        nombre_rol: rol.nombre_rol,
        status: rol.status,
      })
      setIsEditing(true)
    } else {
      setFormData({
        id_rol: "",
        nombre_rol: "",
        status: true,
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleOpenPermisosDialog = async (rol: any) => {
    showLoader()
    try {
      setSelectedRol(rol)
      const permisosRol = await permisosAPI.getPermisosByRol(rol.id)

      const permisosMap: any = {}
      permisosRol.forEach((permiso: any) => {
        permisosMap[permiso.id] = permiso.activo
      })

      setPermisosSeleccionados(permisosMap)
      setOpenPermisosDialog(true)
    } catch (error) {
      showNotification("Error al cargar permisos del rol", "error")
    } finally {
      hideLoader()
    }
  }

  const handleSubmit = async () => {
    showLoader()
    try {
      if (isEditing) {
        await rolesAPI.updateRol(formData.id_rol, formData)
        showNotification("Rol actualizado correctamente", "success")
      } else {
        await rolesAPI.createRol(formData)
        showNotification("Rol creado correctamente", "success")
      }
      setOpenDialog(false)
      fetchRoles()
    } catch (error) {
      showNotification("Error al guardar rol", "error")
    } finally {
      hideLoader()
    }
  }

  const handleSavePermisos = async () => {
    showLoader()
    try {
      const permisosData = Object.keys(permisosSeleccionados).map((permisoId) => ({
        id_permiso: permisoId,
        id_rol: selectedRol.id,
        activo: permisosSeleccionados[permisoId],
      }))

      await permisosAPI.savePermisos(selectedRol.id, permisosData)
      showNotification("Permisos actualizados correctamente", "success")
      setOpenPermisosDialog(false)
    } catch (error) {
      showNotification("Error al guardar permisos", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este rol?")) {
      showLoader()
      try {
        await rolesAPI.deleteRol(id)
        showNotification("Rol eliminado correctamente", "success")
        fetchRoles()
      } catch (error) {
        showNotification("Error al eliminar rol", "error")
      } finally {
        hideLoader()
      }
    }
  }

  const filteredRoles = roles.filter((rol: any) => rol.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()))

  const columns = [
    { key: "id", label: "ID", className: "font-medium" },
    { key: "nombre_rol", label: "Nombre del Rol", className: "font-medium text-gray-900" },
    {
      key: "status",
      label: "Estado",
      render: (value: boolean) => <StatusBadge status={value ? "Activo" : "Inactivo"} />,
    },
    {
      key: "usuarios",
      label: "Usuarios",
      render: (value: number) => <Badge variant="outline">{value || 0}</Badge>,
    },
  ]

  const stats = [
    {
      title: "Total Roles",
      value: roles.length,
      icon: <Shield className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "Configurados",
    },
    {
      title: "Roles Activos",
      value: roles.filter((r: any) => r.status).length,
      icon: <Settings className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      trend: "En uso",
    },
    {
      title: "Permisos Totales",
      value: permisos.length,
      icon: <Security className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "Disponibles",
    },
    {
      title: "Usuarios Asignados",
      value: roles.reduce((sum: number, rol: any) => sum + (rol.usuarios || 0), 0),
      icon: <Users className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      trend: "Con roles",
    },
  ]

  const actions = hasPermission("crear_rol") && (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica la información del rol" : "Ingresa los datos del nuevo rol"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_rol">Nombre del Rol *</Label>
            <Input
              id="nombre_rol"
              value={formData.nombre_rol}
              onChange={(e) => setFormData({ ...formData, nombre_rol: e.target.value })}
              className={errors.nombre_rol ? "border-red-500" : ""}
            />
            {errors.nombre_rol && <p className="text-sm text-red-500">{errors.nombre_rol}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
            />
            <Label htmlFor="status">Rol Activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const tableActions = (row: any) => (
    <>
      {hasPermission("editar_permisos") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenPermisosDialog(row)}
          className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600"
          title="Gestionar permisos"
        >
          <Security className="h-4 w-4" />
        </Button>
      )}
      {hasPermission("editar_rol") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(row)}
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission("eliminar_rol") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.id)}
          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  )

  // Agrupar permisos por módulo
  const permisosAgrupados: any = {}
  permisos.forEach((permiso: any) => {
    if (!permisosAgrupados[permiso.vista_modulo]) {
      permisosAgrupados[permiso.vista_modulo] = []
    }
    permisosAgrupados[permiso.vista_modulo].push(permiso)
  })

  return (
    <>
      <PageLayout
        title="Gestión de Roles"
        description="Administra los roles y permisos del sistema"
        icon={<Shield className="h-8 w-8 text-blue-600" />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        actions={actions}
        stats={stats}
      >
        <DataTable
          data={filteredRoles}
          columns={columns}
          actions={tableActions}
          emptyMessage="No se encontraron roles que coincidan con tu búsqueda"
          emptyIcon={<Shield className="h-12 w-12 text-gray-400" />}
        />
      </PageLayout>

      {/* Dialog para gestionar permisos */}
      <Dialog open={openPermisosDialog} onOpenChange={setOpenPermisosDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Security className="h-5 w-5" />
              Gestionar Permisos - {selectedRol?.nombre_rol}
            </DialogTitle>
            <DialogDescription>Configura los permisos para este rol</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {Object.keys(permisosAgrupados).map((modulo) => (
              <Card key={modulo}>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-600">Módulo: {modulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {permisosAgrupados[modulo].map((permiso: any) => (
                      <div key={permiso.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{permiso.nombre}</p>
                          <p className="text-sm text-gray-500">Vista: {permiso.vista_modulo}</p>
                        </div>
                        <Switch
                          checked={!!permisosSeleccionados[permiso.id]}
                          onCheckedChange={() =>
                            setPermisosSeleccionados({
                              ...permisosSeleccionados,
                              [permiso.id]: !permisosSeleccionados[permiso.id],
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPermisosDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePermisos} className="bg-blue-600 hover:bg-blue-700">
              <Security className="h-4 w-4 mr-2" />
              Guardar Permisos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
