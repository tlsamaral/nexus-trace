"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"

export function RiskHistoryChart({ data }: { data: { ts: string; risk: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de risco</CardTitle>
        <CardDescription>Evolução do risco nas últimas horas</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="ts"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="risk"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#riskFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}