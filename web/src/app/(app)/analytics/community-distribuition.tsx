"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export function CommunityDistributionPie({ data, colors }: { data: any[], colors: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição das comunidades</CardTitle>
        <CardDescription>Módulos detectados pelo algoritmo Louvain</CardDescription>
      </CardHeader>

      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={100} label>
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