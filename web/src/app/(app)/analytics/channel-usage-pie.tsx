"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function ChannelUsagePie({ data, colors }: { data: any[], colors: string[] }) {
  console.log(data)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso por canal</CardTitle>
        <CardDescription>PIX, TED, Boleto e Interno</CardDescription>
      </CardHeader>

      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [`${value}`, name]}
              contentStyle={{
                background: "hsl(0 0% 98%)",
                borderRadius: "8px",
                border: "1px solid hsl(0 0% 90%)",
              }}
            />

            {/* Legenda abaixo */}
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
            />

            <Pie
              data={data}
              dataKey="value"
              nameKey="channel"
              outerRadius={100}
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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