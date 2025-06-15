"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/usePermissions"
import Link from "next/link"
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  Dashboard,
  Person,
  Assignment,
  Science,
  BarChart,
  Settings,
  ExpandLess,
  ExpandMore,
  People,
  Security,
  Biotech,
  MedicalServices,
  Inventory,
  LocalHospital,
  Receipt,
} from "@mui/icons-material"
import Image from "next/image"

interface SidebarProps {
  open: boolean
  toggleDrawer: () => void
}

interface MenuItem {
  title: string
  path?: string
  icon: React.ReactNode
  permission?: string
  children?: MenuItem[]
}

export default function Sidebar({ open, toggleDrawer }: SidebarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const pathname = usePathname()
  const router = useRouter()
  const { hasPermission } = usePermissions()

  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({})

  const handleSubMenuToggle = (title: string) => {
    setOpenSubMenus({
      ...openSubMenus,
      [title]: !openSubMenus[title],
    })
  }

  const handleNavigate = (path: string) => {
    if (path) {
      router.push(path)
      if (isMobile) {
        toggleDrawer()
      }
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Dashboard />,
      permission: "ver_dashboard",
    },
    {
      title: "Recepción",
      icon: <MedicalServices />,
      permission: "ver_modulo_recepcion",
      children: [
        {
          title: "Pacientes",
          path: "/recepcion/pacientes",
          icon: <Person />,
          permission: "ver_pacientes",
        },
        {
          title: "Médicos",
          path: "/recepcion/medicos",
          icon: <LocalHospital />,
          permission: "ver_medicos",
        },
        {
          title: "Órdenes",
          path: "/recepcion/ordenes",
          icon: <Assignment />,
          permission: "ver_ordenes",
        },
      ],
    },
    {
      title: "Laboratorio",
      icon: <Science />,
      permission: "ver_modulo_laboratorio",
      children: [
        {
          title: "Resultados",
          path: "/laboratorio/resultados",
          icon: <Biotech />,
          permission: "ver_resultados",
        },
        {
          title: "Inventario",
          path: "/laboratorio/inventario",
          icon: <Inventory />,
          permission: "ver_inventario",
        },
      ],
    },
    {
      title: "Médicos",
      path: "/medicos",
      icon: <LocalHospital />,
      permission: "ver_medicos",
    },
    {
      title: "Facturación",
      icon: <Receipt />,
      permission: "ver_modulo_facturacion",
      children: [
        {
          title: "Facturas",
          path: "/facturacion/facturas",
          icon: <Receipt />,
          permission: "ver_facturas",
        },
        {
          title: "Reportes",
          path: "/facturacion/reportes",
          icon: <BarChart />,
          permission: "ver_reportes_facturacion",
        },
      ],
    },
    {
      title: "Reportes",
      icon: <BarChart />,
      permission: "ver_modulo_reportes",
      children: [
        {
          title: "Estadísticas",
          path: "/reportes/estadisticas",
          icon: <BarChart />,
          permission: "ver_estadisticas",
        },
      ],
    },
    {
      title: "Administración",
      icon: <Settings />,
      permission: "ver_modulo_admin",
      children: [
        {
          title: "Usuarios",
          path: "/admin/usuarios",
          icon: <People />,
          permission: "ver_usuarios",
        },
        {
          title: "Roles",
          path: "/admin/roles",
          icon: <Security />,
          permission: "ver_roles",
        },
      ],
    },
  ]

  // Inicializar submenús abiertos basados en la ruta actual
  useEffect(() => {
    const newOpenSubMenus: { [key: string]: boolean } = {}

    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => pathname.startsWith(child.path || ""))
        if (isChildActive) {
          newOpenSubMenus[item.title] = true
        }
      }
    })

    setOpenSubMenus(newOpenSubMenus)
  }, [pathname])

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      // Si el elemento requiere un permiso y el usuario no lo tiene, no lo mostramos
      if (item.permission && !hasPermission(item.permission)) {
        return null
      }

      if (item.children) {
        return (
          <Box key={item.title}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSubMenuToggle(item.title)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
                {openSubMenus[item.title] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openSubMenus[item.title]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => {
                  if (child.permission && !hasPermission(child.permission)) {
                    return null
                  }

                  return (
                    <ListItem key={child.title} disablePadding>
                      <Link
                        href={child.path || "#"}
                        passHref
                        style={{ textDecoration: "none", width: "100%", color: "inherit" }}
                      >
                        <ListItemButton
                          component="a"
                          selected={child.path ? isActive(child.path) : false}
                          sx={{
                            pl: 4,
                            "&.Mui-selected": {
                              backgroundColor: "primary.light",
                              "&:hover": {
                                backgroundColor: "primary.light",
                              },
                            },
                          }}
                        >
                          <ListItemIcon>{child.icon}</ListItemIcon>
                          <ListItemText primary={child.title} />
                        </ListItemButton>
                      </Link>
                    </ListItem>
                  )
                })}
              </List>
            </Collapse>
          </Box>
        )
      }

      return (
        <ListItem key={item.title} disablePadding>
          <Link href={item.path || "#"} passHref style={{ textDecoration: "none", width: "100%", color: "inherit" }}>
            <ListItemButton
              component="a"
              selected={item.path ? isActive(item.path) : false}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </Link>
        </ListItem>
      )
    })
  }

  const drawerWidth = 240

  const drawer = (
    <>
      <Toolbar sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <Link href="/dashboard" passHref>
          <Box sx={{ width: "180px", height: "60px", position: "relative", cursor: "pointer" }}>
            <Image src="/logo-labofutura.png" alt="LaboFutura Logo" fill style={{ objectFit: "contain" }} />
          </Box>
        </Link>
      </Toolbar>
      <Divider />
      <List>{renderMenuItems(menuItems)}</List>
    </>
  )

  return (
    <Box component="nav" sx={{ width: { sm: open ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}>
      {/* Drawer móvil */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en dispositivos móviles
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        // Drawer de escritorio
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(0, 0, 0, 0.12)",
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              overflowX: "hidden",
              width: open ? drawerWidth : 0,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  )
}
