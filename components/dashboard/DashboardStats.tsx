"use client"

import type React from "react"

import { Box, Card, CardContent, Typography } from "@mui/material"
import { keyframes } from "@mui/system"

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

interface DashboardStatsProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

export default function DashboardStats({ title, value, icon, color }: DashboardStatsProps) {
  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        animation: `${fadeIn} 0.5s ease-out`,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: "50%",
              p: 1.5,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
