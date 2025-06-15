"use client"

import type React from "react"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { BarChart as BarChartIcon, ShowChart } from "@mui/icons-material"

// Datos de ejemplo
const data = [
  { name: "Ene", examenes: 65, pacientes: 42 },
  { name: "Feb", examenes: 59, pacientes: 38 },
  { name: "Mar", examenes: 80, pacientes: 56 },
  { name: "Abr", examenes: 81, pacientes: 48 },
  { name: "May", examenes: 56, pacientes: 39 },
  { name: "Jun", examenes: 55, pacientes: 36 },
  { name: "Jul", examenes: 40, pacientes: 28 },
]

export default function DashboardChart() {
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newType: "line" | "bar" | null) => {
    if (newType !== null) {
      setChartType(newType)
    }
  }

  return (
    <Box sx={{ height: 350, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ToggleButtonGroup value={chartType} exclusive onChange={handleChartTypeChange} size="small">
          <ToggleButton value="line" aria-label="line chart">
            <ShowChart />
          </ToggleButton>
          <ToggleButton value="bar" aria-label="bar chart">
            <BarChartIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="examenes" stroke="#8884d8" activeDot={{ r: 8 }} name="Exámenes" />
            <Line type="monotone" dataKey="pacientes" stroke="#82ca9d" name="Pacientes" />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="examenes" fill="#8884d8" name="Exámenes" />
            <Bar dataKey="pacientes" fill="#82ca9d" name="Pacientes" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Box>
  )
}
