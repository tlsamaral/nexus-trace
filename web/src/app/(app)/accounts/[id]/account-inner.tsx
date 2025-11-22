'use client'

import { Separator } from "@/components/ui/separator"
import { AccountSummaryCard } from "./account-summary-card"
import { ActivityTimeline } from "./activity-timeline"
import { BehaviorAnomalyCards } from "./behavior-anomaly-cards"
import { ExplainabilityCard } from "./explainability-card"
import { GraphVisualization } from "./graph-visualization"
import { PredictionCard } from "./prediction-card"
import { RiskHistoryChart } from "./risk-history-chart"
import { TransactionsTable } from "./transactions-table"

const mockSummary = {
  id: 101,
  community: 12,
  avgRisk24h: 72.5,
  fanIn: 88,
  fanOut: 12,
  volume24h: 32400,
  lastTransaction: "há 2 minutos",
}

const mockRiskHistory = [
  { ts: "10:00", risk: 22 },
  { ts: "11:00", risk: 28 },
  { ts: "12:00", risk: 33 },
  { ts: "13:00", risk: 49 },
  { ts: "14:00", risk: 72 },
  { ts: "15:00", risk: 63 },
]

const mockTransactions = Array.from({ length: 10 }).map((_, i) => ({
  id: 1000 + i,
  dst: 200 + i,
  amount: Math.floor(Math.random() * 5000),
  ts: "2025-02-01 14:23",
  channel: ["pix", "boleto", "ted", "interno"][Math.floor(Math.random() * 4)],
  risk: Math.floor(Math.random() * 100),
  community_dst: [3, 8, 12, 1][Math.floor(Math.random() * 4)],
}))

const mockExplainability = {
  total: 87,
  fanin: 48,
  amount: 30,
  community: 9,
}

const mockAnomalies = [
  {
    title: "Crescimento brusco de fan-in",
    description: "A conta recebeu 44 entradas nas últimas 6h (244% acima da média).",
    severity: "high",
  },
  {
    title: "Envios fora do padrão",
    description: "Transações recentes superam o dobro do valor médio histórico.",
    severity: "medium",
  },
]

const mockTimeline = [
  { ts: "Hoje • 14:32", type: "alert", text: "Transação suspeita (R$ 4.800,00)" },
  { ts: "Hoje • 11:21", type: "info", text: "Conta entrou para a Comunidade 12" },
  { ts: "Ontem • 19:41", type: "tx", text: "Envio para conta 887 (R$ 1.800,00)" },
]

export function AccountInner({ accountId }: { accountId: string }) {
  return (
    <>
      <AccountSummaryCard data={mockSummary} />

      <Separator />

      <RiskHistoryChart data={mockRiskHistory} />

      <Separator />

      <GraphVisualization />

      <Separator />

      <TransactionsTable data={mockTransactions} />

      <Separator />

      <BehaviorAnomalyCards data={mockAnomalies} />

      <Separator />

      <ExplainabilityCard data={mockExplainability} />

      <Separator />

      <PredictionCard accountId={accountId} />

      <Separator />

      <ActivityTimeline data={mockTimeline} />
    </>
  )
}