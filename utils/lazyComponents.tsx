"use client"

import type React from "react"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { CircularProgress, Box } from "@mui/material"

// Componente de carga genérico
const LoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
    <CircularProgress size={24} />
  </Box>
)

// Función para crear componentes con carga diferida
export function createLazyComponent(importFunc: () => Promise<any>, fallback: React.ReactNode = <LoadingFallback />) {
  const LazyComponent = dynamic(importFunc, {
    loading: () => <>{fallback}</>,
    ssr: false, // Deshabilitar SSR para componentes que causan problemas de hidratación
  })

  return function LazyWrapper(props: any) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Componentes de Material UI con carga diferida
export const LazyDialog = createLazyComponent(() => import("@mui/material/Dialog"))
export const LazyDrawer = createLazyComponent(() => import("@mui/material/Drawer"))
export const LazyModal = createLazyComponent(() => import("@mui/material/Modal"))
export const LazySnackbar = createLazyComponent(() => import("@mui/material/Snackbar"))
export const LazyTooltip = createLazyComponent(() => import("@mui/material/Tooltip"))
export const LazyPopover = createLazyComponent(() => import("@mui/material/Popover"))
export const LazyMenu = createLazyComponent(() => import("@mui/material/Menu"))
export const LazyAlert = createLazyComponent(() => import("@mui/material/Alert"))
export const LazyAutocomplete = createLazyComponent(() => import("@mui/material/Autocomplete"))
export const LazyDatePicker = createLazyComponent(() =>
  import("@mui/x-date-pickers/DatePicker").then((mod) => ({ default: mod.DatePicker })),
)
export const LazyTimePicker = createLazyComponent(() =>
  import("@mui/x-date-pickers/TimePicker").then((mod) => ({ default: mod.TimePicker })),
)
export const LazyDataGrid = createLazyComponent(() =>
  import("@mui/x-data-grid").then((mod) => ({ default: mod.DataGrid })),
)

// Componentes compuestos con carga diferida
export const LazyDialogActions = createLazyComponent(() => import("@mui/material/DialogActions"))
export const LazyDialogContent = createLazyComponent(() => import("@mui/material/DialogContent"))
export const LazyDialogTitle = createLazyComponent(() => import("@mui/material/DialogTitle"))
