"use client"

import { useEffect, useState } from "react"
import { Separator } from "@/components/ui/separator"
import {
  getAccountSummary,
  getAccountGraph,
  getAccountRiskHistory,
  getAccountTransactions,
  type AccountSummary,
  type RiskPoint,
  type GraphResponse,
  type Transaction
} from "@/http/accounts/account-info"

import { AccountSummaryCard } from "./account-summary-card"
import { ActivityTimeline } from "./activity-timeline"
import { BehaviorAnomalyCards } from "./behavior-anomaly-cards"
import { ExplainabilityCard } from "./explainability-card"
import { GraphVisualization } from "./graph-visualization"
import { PredictionCard } from "./prediction-card"
import { RiskHistoryChart } from "./risk-history-chart"
import { TransactionsTable } from "./transactions-table"
import { formatCurrency, formatDate, formatInt, formatRisk } from "./account-formatters"
import { Anomaly, getAccountAnomalies } from "@/http/accounts/get-account-anomalies"
import { Explainability, getAccountExplainability } from "@/http/accounts/get-account-explainability"
import { getAccountTimeline, Timeline } from "@/http/accounts/get-account-timeline"
import { Loader } from "lucide-react"

export function AccountInner({ accountId }: { accountId: string }) {
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [riskHistory, setRiskHistory] = useState<RiskPoint[]>([])
  const [graph, setGraph] = useState<GraphResponse | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [explainability, setExplainability] = useState<Explainability | null>(null)
  const [accountTimeline, setAccountTimeline] = useState<Timeline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, r, g, t, a, e, tl] = await Promise.all([
          getAccountSummary(accountId),
          getAccountRiskHistory(accountId),
          getAccountGraph(accountId),
          getAccountTransactions(accountId),
          getAccountAnomalies(accountId),
          getAccountExplainability(accountId),
          getAccountTimeline(accountId),
        ])
        setSummary(s)
        setRiskHistory(r)
        setGraph(g)
        setTransactions(t)
        setAnomalies(a)
        setExplainability(e)
        setAccountTimeline(tl)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [accountId])

  if (loading || !summary || !graph) {
    return (
      <div className="h-full w-full flex items-center justify-center"> 
          <Loader className="animate-spin size-6" />
      </div>
    )
  }

  const formattedSummary = {
    id: summary.id,
    community: summary.community,
    avgRisk24h: formatRisk(summary.risk_avg),
    fanIn: formatInt(summary.fanin),
    fanOut: formatInt(summary.fanout),
    volume24h: formatCurrency(summary.volume24h),
    lastTransaction: formatDate(summary.lastActivity),
  }

  const formattedTransactions = transactions.map(t => ({
    id: t.id!,
    dst: t.dst,
    amount: formatCurrency(t.amount),
    ts: formatDate(t.ts),
    channel: t.channel ?? "—",
    risk: t.risk ?? "—",
    community_dst: t.dst ?? "—",
  }))

  const riskHistoryFormatted = riskHistory.map(r => ({
    ts: formatDate(r.ts, "DD/MM/YYYY HH:mm"),
    risk: r.risk,
  }))

  return (
    <>
      <AccountSummaryCard data={formattedSummary} />

      <Separator />

      <RiskHistoryChart data={riskHistoryFormatted} />

      <Separator />

      <GraphVisualization accountId={accountId} />

      <Separator />

      <TransactionsTable data={formattedTransactions} />

      <Separator />

      <BehaviorAnomalyCards data={anomalies} />

      <Separator />

      {explainability && (
        <ExplainabilityCard data={explainability} />
      )}

      <Separator />

      <PredictionCard accountId={accountId} />

      <Separator />

      <ActivityTimeline data={accountTimeline} />
    </>
  )
}