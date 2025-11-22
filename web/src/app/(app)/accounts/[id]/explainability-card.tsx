"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function ExplainabilityCard({
  data,
}: {
  data: { total: number; fanin: number; amount: number; community: number }
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Explicabilidade do risco</CardTitle>
        <CardDescription>Que fatores contribuíram para o score?</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ExplainItem label="Total" value={data.total} />
        <ExplainItem label="Fan-In" value={data.fanin} />
        <ExplainItem label="Valor" value={data.amount} />
        <ExplainItem label="Comunidade" value={data.community} />
      </CardContent>
    </Card>
  )
}

function ExplainItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}