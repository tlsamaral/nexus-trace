"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts"

export function PredictionCard({ accountId }: { accountId: string }) {
  const predictedRisk = 45

  const color =
    predictedRisk >= 70
      ? "hsl(0 84% 60%)" // vermelho
      : predictedRisk >= 40
      ? "hsl(45 93% 47%)" // amarelo
      : "hsl(142 76% 36%)" // verde

  const chartData = [
    {
      name: "Risco",
      value: predictedRisk,
      fill: color,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predição futura</CardTitle>
        <CardDescription>Estimativa de risco nas próximas 12h</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="w-full h-56 flex items-center justify-center">
          <ResponsiveContainer width="60%" height="100%">
            <RadialBarChart
              data={chartData}
              innerRadius="70%"
              outerRadius="100%"
              startAngle={90}
              endAngle={predictedRisk * 3.6 + 90} // 0–100 vira 0–360°
            >
              <RadialBar
                dataKey="value"
                cornerRadius={50}
                fill="hsl(220 19% 85%)"
                data={[{ value: 100 }]}
              />

              <RadialBar
                dataKey="value"
                cornerRadius={50}
                fill={color}
                background={false}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center space-y-1">
          <p className="text-4xl font-bold">{predictedRisk}%</p>
          <p className="text-muted-foreground">Risco projetado nas próximas horas</p>
        </div>

        <Button className="w-full">Reprocessar modelo para esta conta</Button>
      </CardContent>
    </Card>
  )
}