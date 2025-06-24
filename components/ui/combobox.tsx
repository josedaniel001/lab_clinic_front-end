"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

interface ComboboxItem {
  value: string
  label: string
}

interface Combobox {
  items: ComboboxItem[]
  value: string | undefined
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Seleccionar...",
  error,
}: Combobox) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedItem = items.find((item) => item.value === value)
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <button
        type="button"
        className={`w-full border rounded px-3 py-2 flex justify-between items-center text-left ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        onClick={() => setOpen(!open)}
      >
        {selectedItem?.label || placeholder}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 mt-1 rounded shadow max-h-60 overflow-y-auto">
          <input
            type="text"
            className="w-full p-2 border-b border-gray-200 text-sm outline-none"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filteredItems.length === 0 ? (
            <p className="p-2 text-sm text-gray-500">No hay resultados.</p>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.value}
                className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                  item.value === value ? "bg-gray-100" : ""
                }`}
                onClick={() => {
                  onChange(item.value)
                  setOpen(false)
                  setSearch("")
                }}
              >
                <span>{item.label}</span>
                {item.value === value && <Check className="h-4 w-4 text-green-600" />}
              </div>
            ))
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
