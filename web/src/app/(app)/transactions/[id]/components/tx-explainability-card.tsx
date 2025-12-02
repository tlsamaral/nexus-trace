"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionDetails } from "@/http/transactions/get-transaction"
import {
  IconCurrencyDollar,
  IconFilter,
  IconArrowBounce,
  IconAlertTriangle
} from "@tabler/icons-react"

export function TransactionExplainabilityCard({ tx }: { tx: TransactionDetails }) {

  const rules = [
    {
      label: "Valor >= 8000",
      triggered: tx.amount >= 8000,
    },
    {
      label: "Fan-In >= 20",
      triggered: tx.fanin >= 20,
    },
    {
      label: "Risco destino >= 85",
      triggered: tx.dst_risk >= 85,
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explicabilidade</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Métricas principais */}
        <div className="grid grid-cols-3 gap-4">

          <div className="flex flex-col items-start p-3 rounded-lg border bg-card">
            <IconCurrencyDollar size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-1">Valor</span>
            <span className="font-semibold text-base">
              R$ {tx.amount.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-start p-3 rounded-lg border bg-card">
            <IconArrowBounce size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-1">Fan-In destino</span>
            <span className="font-semibold text-base">
              {tx.fanin}
            </span>
          </div>

          <div className="flex flex-col items-start p-3 rounded-lg border bg-card">
            <IconFilter size={20} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground mt-1">Risco destino</span>
            <span className="font-semibold text-base">
              {tx.dst_risk.toFixed(2)}
            </span>
          </div>

        </div>

        <hr />

        {/* Regras de modelo */}
        <div className="space-y-2">
          <p className="font-medium text-sm">Regras aplicadas pelo modelo:</p>

          <div className="space-y-2">
            {rules.map((r, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-sm p-2 rounded-md border
                  ${r.triggered ? "border-red-300 bg-red-50" : "border-muted bg-muted/20"}
                `}
              >
                <span>{r.label}</span>

                {r.triggered ? (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <IconAlertTriangle size={14} /> Ativada
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Não ativada</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}