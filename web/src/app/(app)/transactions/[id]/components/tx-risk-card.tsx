"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TransactionDetails } from "@/http/transactions/get-transaction"

export function TransactionRiskCard({ tx }: { tx: TransactionDetails }) {
  const risk = tx.risk_score

  // Define a cor do card com base no risco
  const color =
    risk >= 70 ? "text-red-500"
    : risk >= 40 ? "text-yellow-500"
    : "text-green-600"

  const bgColor =
    risk >= 70 ? "bg-red-500"
    : risk >= 40 ? "bg-yellow-500"
    : "bg-green-600"

  const readableRisk =
    risk >= 70 ? "Alto risco" :
    risk >= 40 ? "Risco moderado" :
    "Risco baixo"

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Risco detectado</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Número grande do risco */}
        <div>
          <p className={`text-4xl font-bold ${color}`}>{risk}%</p>
          <p className="text-sm text-muted-foreground">{readableRisk}</p>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1">
          <Progress
            value={risk}
          />
        </div>

        <hr className="my-3" />

        {/* Badge principal */}
        <Badge
          variant={tx.suspicious ? "destructive" : "secondary"}
          className="text-sm py-1 px-3"
        >
          {tx.suspicious ? "Suspeita identificada" : "Dentro do padrão"}
        </Badge>

        {/* Dados adicionais do risco – enriquecem o card */}
        <div className="text-sm space-y-2 pt-2 text-muted-foreground">

          <div className="flex justify-between">
            <span>Valor da transação:</span>
            <span className="font-medium text-foreground">
              R$ {tx.amount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Fan-In do destino:</span>
            <span className="font-medium text-foreground">
              {tx.fanin ?? "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Risco da conta destino:</span>
            <span className="font-medium text-foreground">
              {tx.dst_risk ?? "—"}
            </span>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}