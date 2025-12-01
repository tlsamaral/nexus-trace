"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Scan, DollarSign, Share2 } from "lucide-react"

type ExplainabilityData = {
  total: number
  fanin: number
  amount: number
  community: number
}

export function ExplainabilityCard({ data }: { data: ExplainabilityData }) {
  const factors = [
    {
      label: "Total",
      value: data.total,
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
      description: "Risco geral atribuído ao comportamento da conta",
    },
    {
      label: "Fan-In",
      value: data.fanin,
      icon: <Scan className="w-4 h-4 text-yellow-600" />,
      description: "Quantas origens diferentes realizaram envio para esta conta",
    },
    {
      label: "Valor",
      value: data.amount,
      icon: <DollarSign className="w-4 h-4 text-green-600" />,
      description: "Impacto dos valores transacionados no risco",
    },
    {
      label: "Comunidade",
      value: data.community,
      icon: <Share2 className="w-4 h-4 text-purple-600" />,
      description: "Influência da comunidade Louvain no risco",
    },
  ]

  // normalização simples para barra visual
  const maxValue = Math.max(...factors.map(f => f.value), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explicabilidade do risco</CardTitle>
        <CardDescription>Como cada fator contribuiu para o score da conta</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {factors.map((f, i) => (
          <ExplainItem
            key={i}
            label={f.label}
            value={f.value}
            icon={f.icon}
            description={f.description}
            percent={(f.value / maxValue) * 100}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function ExplainItem({
  label,
  value,
  icon,
  description,
  percent,
}: {
  label: string
  value: number
  icon: React.ReactNode
  description: string
  percent: number
}) {
  return (
    <div className="p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>

        <Badge variant="secondary" className="text-xs">
          {value.toFixed(2)}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-2">{description}</p>

      <Progress value={percent} className="h-2" />
    </div>
  )
}