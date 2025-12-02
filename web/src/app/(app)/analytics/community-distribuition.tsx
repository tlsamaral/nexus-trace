"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function CommunityDistributionPie({
  data,
  colors
}: {
  data: any[]
  colors: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição das comunidades</CardTitle>
        <CardDescription>Módulos detectados pelo algoritmo Louvain</CardDescription>
      </CardHeader>

      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}`, `${name}`]}
              contentStyle={{
                background: "hsl(0 0% 98%)",
                borderRadius: "8px",
                border: "1px solid hsl(0 0% 90%)",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              formatter={(value: string) => `${value}`}
            />

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label={({ percent, name }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={true}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}