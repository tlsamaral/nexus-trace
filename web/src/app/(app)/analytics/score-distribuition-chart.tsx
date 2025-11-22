"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, ResponsiveContainer } from "recharts"

export function ScoreDistributionChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição dos scores</CardTitle>
        <CardDescription>Como o motor está classificando as transações</CardDescription>
      </CardHeader>

      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}