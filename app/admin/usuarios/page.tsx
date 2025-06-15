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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Shield } from "lucide-react"
import { usuariosAPI } from "@/api/usuariosAPI"
import { rolesAPI } from "@/api/rolesAPI"

export default function UsuariosPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()
  const { hasPermission } = usePermissions()

  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    id_usuario: "",
    nombre_usuario: "",
    password: "",
    id_rol: "",
    correo: "",
    activo: true,
  })
  const [errors, setErrors] = useState({
    nombre_usuario: "",
    password: "",
    id_rol: "",
    correo: "",
  })

  useEffect(() => {
    fetchUsuarios()
    fetchRoles()
  }, [])

  const fetchUsuarios = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await usuariosAPI.getUsuarios()
      setUsuarios(data)
      if (!showLoading) {
        showNotification("Datos actualizados correctamente", "success")
      }
    } catch (error) {
      showNotification("Error al cargar usuarios", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await rolesAPI.getRoles()
      setRoles(data)
    } catch (error) {
      console.error("Error al cargar roles:", error)
    }
  }

  const handleRefresh = () => {
    fetchUsuarios(false)
  }

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setFormData({
        id_usuario: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        password: "",
        id_rol: usuario.id_rol,
        correo: usuario.correo,
        activo: usuario.activo,
      })
      setIsEditing(true)
    } else {
      setFormData({
        id_usuario: "",
        nombre_usuario: "",
        password: "",
        id_rol: "",
        correo: "",
        activo: true,
      })
      setIsEditing(false)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrors({
      nombre_usuario: "",
      password: "",
      id_rol: "",
      correo: "",
    })
  }

  const handleSubmit = async () => {
    showLoader()
    try {
      if (isEditing) {
        await usuariosAPI.updateUsuario(formData.id_usuario, formData)
        showNotification("Usuario actualizado correctamente", "success")
      } else {
        await usuariosAPI.createUsuario(formData)
        showNotification("Usuario creado correctamente", "success")
      }
      handleCloseDialog()
      fetchUsuarios()
    } catch (error) {
      showNotification("Error al guardar usuario", "error")
    } finally {
      hideLoader()
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este usuario?")) {
      showLoader()
      try {
        await usuariosAPI.deleteUsuario(id)
        showNotification("Usuario eliminado correctamente", "success")
        fetchUsuarios()
      } catch (error) {
        showNotification("Error al eliminar usuario", "error")
      } finally {
        hideLoader()
      }
    }
  }

  const filteredUsuarios = usuarios.filter(
    (usuario: any) =>
      usuario.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const columns = [
    { key: "id", label: "ID", className: "font-medium" },
    { key: "nombre_usuario", label: "Usuario", className: "font-medium text-gray-900" },
    { key: "correo", label: "Correo", className: "text-blue-600" },
    { key: "rol", label: "Rol" },
    {
      key: "activo",
      label: "Estado",
      render: (value: boolean) => <StatusBadge status={value ? "Activo" : "Inactivo"} />,
    },
  ]

  const stats = [
    {
      title: "Total Usuarios",
      value: usuarios.length,
      icon: <Users className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      trend: "Registrados",
    },
    {
      title: "Usuarios Activos",
      value: usuarios.filter((u: any) => u.activo).length,
      icon: <UserCheck className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      trend: "En línea",
    },
    {
      title: "Usuarios Inactivos",
      value: usuarios.filter((u: any) => !u.activo).length,
      icon: <UserX className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-red-500 to-red-600",
      trend: "Deshabilitados",
    },
    {
      title: "Roles Asignados",
      value: roles.length,
      icon: <Shield className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      trend: "Diferentes roles",
    },
  ]

  const actions = hasPermission("crear_usuario") && (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button onClick={() => handleOpenDialog()} className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica la información del usuario" : "Ingresa los datos del nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_usuario">Nombre de Usuario *</Label>
            <Input
              id="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
              className={errors.nombre_usuario ? "border-red-500" : ""}
            />
            {errors.nombre_usuario && <p className="text-sm text-red-500">{errors.nombre_usuario}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{isEditing ? "Nueva Contraseña (opcional)" : "Contraseña *"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo Electrónico *</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              className={errors.correo ? "border-red-500" : ""}
            />
            {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_rol">Rol *</Label>
            <Select value={formData.id_rol} onValueChange={(value) => setFormData({ ...formData, id_rol: value })}>
              <SelectTrigger className={errors.id_rol ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((rol: any) => (
                  <SelectItem key={rol.id} value={rol.id}>
                    {rol.nombre_rol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_rol && <p className="text-sm text-red-500">{errors.id_rol}</p>}
          </div>

          <div className="md:col-span-2 flex items-center space-x-2">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
            />
            <Label htmlFor="activo">Usuario Activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDialog}>
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
      {hasPermission("editar_usuario") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(row)}
          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {hasPermission("eliminar_usuario") && (
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

  return (
    <PageLayout
      title="Gestión de Usuarios"
      description="Administra los usuarios y sus permisos en el sistema"
      icon={<Users className="h-8 w-8 text-blue-600" />}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      actions={actions}
      stats={stats}
    >
      <DataTable
        data={filteredUsuarios}
        columns={columns}
        actions={tableActions}
        emptyMessage="No se encontraron usuarios que coincidan con tu búsqueda"
        emptyIcon={<Users className="h-12 w-12 text-gray-400" />}
      />
    </PageLayout>
  )
}
