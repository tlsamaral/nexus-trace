"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface AccountSummaryCardProps {
  data: {
    id: number
    community: number
    avgRisk24h: number
    fanIn: number
    fanOut: number
    volume24h: number
    lastTransaction: string
  }
}

export function AccountSummaryCard({ data }: AccountSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Conta #{data.id}</CardTitle>
        <CardDescription>Métricas gerais e sinais de risco</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryItem label="Comunidade" value={data.community} />
        <SummaryItem label="Risco médio (24h)" value={`${data.avgRisk24h}%`} />
        <SummaryItem label="Fan-In (24h)" value={data.fanIn} />
        <SummaryItem label="Fan-Out (24h)" value={data.fanOut} />
        <SummaryItem label="Volume 24h" value={`R$ ${data.volume24h.toLocaleString()}`} />
        <SummaryItem label="Última transação" value={data.lastTransaction} />
      </CardContent>
    </Card>
  )
}

function SummaryItem({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}