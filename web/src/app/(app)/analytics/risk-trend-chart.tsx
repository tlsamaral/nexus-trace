"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"

export function RiskTrendChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de risco</CardTitle>
        <CardDescription>Risco médio ao longo da semana</CardDescription>
      </CardHeader>

      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <Tooltip />
            <Area type="monotone" dataKey="risk" stroke="#2563eb" fill="#93c5fd" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}