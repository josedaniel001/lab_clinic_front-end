"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLoader } from "@/hooks/useLoader"
import { useNotification } from "@/hooks/useNotification"
import { PageLayout } from "@/components/layout/PageLayout"
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Paper,
} from "@mui/material"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material"
import { reportesAPI } from "@/api/reportesAPI"

export default function EstadisticasPage() {
  const { showLoader, hideLoader } = useLoader()
  const { showNotification } = useNotification()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filtros, setFiltros] = useState({
    periodo: "mes",
    anio: new Date().getFullYear().toString(),
    mes: (new Date().getMonth() + 1).toString(),
  })

  const [estadisticas, setEstadisticas] = useState({
    examenesArea: [],
    examenesPopulares: [],
    pacientesPorMes: [],
    medicosSolicitantes: [],
    tiempoEntrega: [],
  })

  useEffect(() => {
    fetchEstadisticas()
  }, [])

  const fetchEstadisticas = async (showLoading = true) => {
    if (showLoading) {
      showLoader()
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await reportesAPI.getEstadisticas(filtros)
      setEstadisticas(data)
      if (!showLoading) {
        showNotification("Estadísticas actualizadas", "success")
      }
    } catch (error) {
      showNotification("Error al cargar estadísticas", "error")
    } finally {
      if (showLoading) {
        hideLoader()
      } else {
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    fetchEstadisticas(false)
  }

  const handleFiltroChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFiltros({
      ...filtros,
      [name as string]: value,
    })
  }

  const handleAplicarFiltros = () => {
    fetchEstadisticas()
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

  // Calcular estadísticas para las cards
  const totalExamenes = estadisticas.examenesArea.reduce((acc: number, item: any) => acc + item.value, 0)
  const totalPacientes = estadisticas.pacientesPorMes.reduce((acc: number, item: any) => acc + item.value, 0)
  const promedioTiempo =
    estadisticas.tiempoEntrega.length > 0
      ? (
          estadisticas.tiempoEntrega.reduce((acc: number, item: any) => acc + item.value, 0) /
          estadisticas.tiempoEntrega.length
        ).toFixed(1)
      : "0"
  const totalMedicos = estadisticas.medicosSolicitantes.length

  const stats = [
    {
      title: "Total Exámenes",
      value: totalExamenes.toString(),
      subtitle: "Exámenes realizados",
      trend: "+15% vs período anterior",
      color: "primary" as const,
      icon: <AssessmentIcon />,
    },
    {
      title: "Pacientes Atendidos",
      value: totalPacientes.toString(),
      subtitle: "Pacientes en el período",
      trend: "+8% vs período anterior",
      color: "success" as const,
      icon: <TrendingUpIcon />,
    },
    {
      title: "Tiempo Promedio",
      value: `${promedioTiempo}h`,
      subtitle: "Tiempo de entrega",
      trend: "-12% vs período anterior",
      color: "info" as const,
      icon: <TimelineIcon />,
    },
    {
      title: "Médicos Activos",
      value: totalMedicos.toString(),
      subtitle: "Médicos solicitantes",
      trend: "+3 nuevos médicos",
      color: "secondary" as const,
      icon: <BarChartIcon />,
    },
  ]

  return (
    <PageLayout
      title="Estadísticas y Reportes"
      description="Visualiza las estadísticas y métricas del laboratorio"
      icon={<AssessmentIcon />}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      stats={stats}
      actions={
        <Paper elevation={1} sx={{ p: 2, background: "rgba(255,255,255,0.9)" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="periodo-label">Período</InputLabel>
                <Select
                  labelId="periodo-label"
                  id="periodo"
                  name="periodo"
                  value={filtros.periodo}
                  label="Período"
                  onChange={handleFiltroChange}
                >
                  <MenuItem value="mes">Mensual</MenuItem>
                  <MenuItem value="trimestre">Trimestral</MenuItem>
                  <MenuItem value="semestre">Semestral</MenuItem>
                  <MenuItem value="anio">Anual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="anio-label">Año</InputLabel>
                <Select
                  labelId="anio-label"
                  id="anio"
                  name="anio"
                  value={filtros.anio}
                  label="Año"
                  onChange={handleFiltroChange}
                >
                  <MenuItem value="2023">2023</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="mes-label">Mes</InputLabel>
                <Select
                  labelId="mes-label"
                  id="mes"
                  name="mes"
                  value={filtros.mes}
                  label="Mes"
                  onChange={handleFiltroChange}
                  disabled={filtros.periodo !== "mes"}
                >
                  <MenuItem value="1">Enero</MenuItem>
                  <MenuItem value="2">Febrero</MenuItem>
                  <MenuItem value="3">Marzo</MenuItem>
                  <MenuItem value="4">Abril</MenuItem>
                  <MenuItem value="5">Mayo</MenuItem>
                  <MenuItem value="6">Junio</MenuItem>
                  <MenuItem value="7">Julio</MenuItem>
                  <MenuItem value="8">Agosto</MenuItem>
                  <MenuItem value="9">Septiembre</MenuItem>
                  <MenuItem value="10">Octubre</MenuItem>
                  <MenuItem value="11">Noviembre</MenuItem>
                  <MenuItem value="12">Diciembre</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAplicarFiltros}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  },
                }}
              >
                Aplicar Filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: 400 }}>
            <CardHeader title="Exámenes por Área" avatar={<BarChartIcon color="primary" />} />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadisticas.examenesArea} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: 400 }}>
            <CardHeader title="Exámenes Más Realizados" avatar={<PieChartIcon color="primary" />} />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadisticas.examenesPopulares}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estadisticas.examenesPopulares.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={2} sx={{ height: 400 }}>
            <CardHeader title="Pacientes Atendidos por Mes" avatar={<TimelineIcon color="primary" />} />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={estadisticas.pacientesPorMes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="Pacientes" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: 400 }}>
            <CardHeader title="Médicos Solicitantes" avatar={<BarChartIcon color="primary" />} />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={estadisticas.medicosSolicitantes}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Órdenes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: 400 }}>
            <CardHeader title="Tiempo Promedio de Entrega" avatar={<TimelineIcon color="primary" />} />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadisticas.tiempoEntrega} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ffc658" name="Horas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageLayout>
  )
}
