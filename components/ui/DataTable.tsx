"use client"

import type { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => ReactNode
  className?: string
}

interface DataTableProps {
  data: any[]
  columns: Column[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: ReactNode
  onRowClick?: (row: any) => void
  actions?: (row: any) => ReactNode
}

export function DataTable({
  data,
  columns,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  emptyIcon,
  onRowClick,
  actions,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-700 font-medium">Cargando datos...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white">
        {emptyIcon && <div className="flex justify-center mb-4 text-gray-400">{emptyIcon}</div>}
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`font-semibold text-gray-900 ${column.className || ""}`}
                style={{ color: "#1f2937", backgroundColor: "#f9fafb" }}
              >
                {column.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead
                className="font-semibold text-center text-gray-900"
                style={{ color: "#1f2937", backgroundColor: "#f9fafb" }}
              >
                Acciones
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id || index}
              className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(row)}
              style={{ backgroundColor: "white" }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={`text-gray-900 ${column.className || ""}`}
                  style={{ color: "#1f2937" }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
              {actions && (
                <TableCell style={{ color: "#1f2937" }}>
                  <div className="flex items-center justify-center gap-2">{actions(row)}</div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Componentes auxiliares para renderizado común
export const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { bg: string; text: string }> = {
    Activo: { bg: "bg-green-100", text: "text-green-800" },
    Inactivo: { bg: "bg-red-100", text: "text-red-800" },
    Pendiente: { bg: "bg-yellow-100", text: "text-yellow-800" },
    Procesado: { bg: "bg-blue-100", text: "text-blue-800" },
    Validado: { bg: "bg-green-100", text: "text-green-800" },
    Pagada: { bg: "bg-green-100", text: "text-green-800" },
    Anulada: { bg: "bg-red-100", text: "text-red-800" },
  }

  const variant = variants[status] || { bg: "bg-gray-100", text: "text-gray-800" }

  return (
    <Badge
      className={`${variant.bg} ${variant.text} font-medium`}
      style={{
        backgroundColor: variant.bg.includes("green")
          ? "#dcfce7"
          : variant.bg.includes("red")
            ? "#fee2e2"
            : variant.bg.includes("yellow")
              ? "#fef3c7"
              : variant.bg.includes("blue")
                ? "#dbeafe"
                : "#f3f4f6",
        color: variant.text.includes("green")
          ? "#166534"
          : variant.text.includes("red")
            ? "#991b1b"
            : variant.text.includes("yellow")
              ? "#92400e"
              : variant.text.includes("blue")
                ? "#1e40af"
                : "#374151",
      }}
    >
      {status}
    </Badge>
  )
}

export const CurrencyCell = ({ value }: { value: number }) => (
  <span className="font-semibold text-gray-900" style={{ color: "#1f2937" }}>
    ${(value || 0).toFixed(2)}
  </span>
)

export const DateCell = ({ value }: { value: string }) => (
  <span className="text-gray-700" style={{ color: "#374151" }}>
    {new Date(value).toLocaleDateString()}
  </span>
)
