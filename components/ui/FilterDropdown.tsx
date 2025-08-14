"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface FilterOption {
  key: string
  label: string
  type: "select" | "input" | "combobox" | "date" | "number"
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface FilterValue {
  [key: string]: string
}

interface FilterDropdownProps {
  filters: FilterOption[]
  values: FilterValue
  onChange: (values: FilterValue) => void
  onClear: () => void
  onClearFilter: (key: string) => void
  activeFilters: number
  totalItems: number
  filteredItems: number
}

export function FilterDropdown({
  filters,
  values,
  onChange,
  onClear,
  onClearFilter,
  activeFilters,
  totalItems,
  filteredItems,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    onChange({ ...values, [key]: value })
  }

  const renderFilterInput = (filter: FilterOption) => {
    const value = values[filter.key] || ""

    switch (filter.type) {
      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleFilterChange(filter.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Seleccionar ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">Todos</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "combobox":
        return (
          <Combobox
            items={filter.options || []}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
            placeholder={filter.placeholder || `Seleccionar ${filter.label}`}
          />
        )

      case "input":
        return (
          <Input
            type="text"
            placeholder={filter.placeholder || filter.label}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || filter.label}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        )

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        )

      default:
        return null
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilters}
            </Badge>
          )}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between sticky top-0 bg-background pb-2 border-b z-10">
              <h4 className="font-semibold">Filtros Avanzados</h4>
              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar Todo
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{filter.label}</Label>
                    {values[filter.key] && values[filter.key] !== "__ALL__" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onClearFilter(filter.key)}
                        className="h-5 px-1 text-xs"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t sticky bottom-0 bg-background">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{filteredItems} de {totalItems} resultados</span>
                {activeFilters > 0 && (
                  <span>{activeFilters} filtros activos</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 