"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, ResponsiveContainer } from "recharts"

export function FanInOutChart({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fan-In / Fan-Out</CardTitle>
        <CardDescription>Contas com maior movimentação estrutural</CardDescription>
      </CardHeader>

      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="account" />
            <Tooltip />
            <Bar dataKey="fanin" fill="#2563eb" />
            <Bar dataKey="fanout" fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}